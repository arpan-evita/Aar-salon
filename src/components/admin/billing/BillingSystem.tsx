import { useState, useEffect } from "react";
import { 
  IndianRupee, Receipt, Download, Filter, Plus, 
  Search, CheckCircle2, XCircle, Clock, PieChart,
  ShoppingCart, Tag, Award, Calculator, Trash2, Printer,
  ArrowUpRight, ArrowDownRight, Wallet, Briefcase, FileText,
  UserPlus, UserMinus, UserCircle, Edit3, Settings2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { generateInvoicePDF } from "@/utils/InvoicePDF";

const BillingSystem = () => {
  const [activeSubTab, setActiveSubTab] = useState<"invoices" | "expenses">("invoices");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInvoiceSheetOpen, setIsInvoiceSheetOpen] = useState(false);
  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false);
  
  // Invoice state
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [newCust, setNewCust] = useState({ name: "", phone: "" });
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [customItem, setCustomItem] = useState({ title: "", price: 0 });
  const [gstRate, setGstRate] = useState(18);

  // Expense state
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: 0,
    category: "Rent",
    customCategory: "",
    date: new Date().toISOString().split('T')[0],
    note: "",
    paymentMethod: "Cash"
  });

  useEffect(() => {
    fetchFinancialData();
    fetchInitialData();
  }, [activeSubTab]);

  const fetchInitialData = async () => {
    const { data: custData } = await supabase.from('customers').select('id, full_name, phone');
    const { data: servData } = await supabase.from('services').select('id, title, price');
    const { data: staffData } = await supabase.from('profiles').select('id, full_name');
    if (custData) setCustomers(custData);
    if (servData) setServices(servData);
    if (staffData) setStaffList(staffData);
  };

  const fetchFinancialData = async () => {
    setLoading(true);
    if (activeSubTab === "invoices") {
      const { data } = await supabase
        .from('invoices')
        .select('*, customers(full_name)')
        .order('created_at', { ascending: false });
      if (data) setInvoices(data);
    } else {
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      if (data) setExpenses(data || []);
    }
    setLoading(false);
  };

  const handleSaveExpense = async () => {
    if (!newExpense.title || newExpense.amount <= 0) {
      toast.error("Please enter a title and valid amount.");
      return;
    }

    const finalCategory = newExpense.category === "Other" ? newExpense.customCategory : newExpense.category;
    const body = {
      title: newExpense.title,
      amount: Number(newExpense.amount),
      category: finalCategory || "General",
      expense_date: newExpense.date,
      note: newExpense.note
    };

    let error;
    if (editingExpenseId) {
       const { error: updateError } = await supabase
          .from('expenses')
          .update(body)
          .eq('id', editingExpenseId);
       error = updateError;
    } else {
       const { error: insertError } = await supabase
          .from('expenses')
          .insert(body);
       error = insertError;
    }

    if (error) {
       toast.error(editingExpenseId ? "Failed to update expense." : "Failed to log expense.");
    } else {
       toast.success(editingExpenseId ? "Expense updated!" : "Expense logged successfully!");
       setIsExpenseSheetOpen(false);
       setEditingExpenseId(null);
       setNewExpense({
         title: "",
         amount: 0,
         category: "Rent",
         customCategory: "",
         date: new Date().toISOString().split('T')[0],
         note: "",
         paymentMethod: "Cash"
       });
       fetchFinancialData();
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;
    
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
       toast.error("Failed to delete expense.");
    } else {
       toast.success("Expense deleted.");
       fetchFinancialData();
    }
  };

  const openEditExpense = (exp: any) => {
    setEditingExpenseId(exp.id);
    setNewExpense({
      title: exp.title,
      amount: exp.amount,
      category: ["Rent", "Salary", "Inventory", "Utility", "Marketing", "Taxes"].includes(exp.category) ? exp.category : "Other",
      customCategory: ["Rent", "Salary", "Inventory", "Utility", "Marketing", "Taxes"].includes(exp.category) ? "" : exp.category,
      date: exp.expense_date,
      note: exp.note || "",
      paymentMethod: "Cash"
    });
    setIsExpenseSheetOpen(true);
  };

  const parseNumeric = (val: any) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const calculateSubtotal = () => selectedItems.reduce((acc, item) => {
    const price = parseNumeric(item.price);
    const qty = Number(item.quantity) || 1;
    return acc + (price * qty);
  }, 0);

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return isNaN(subtotal) ? 0 : subtotal * (gstRate / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return (isNaN(subtotal) ? 0 : subtotal) + (isNaN(tax) ? 0 : tax);
  };

  const totalRevenue = invoices.reduce((acc, inv) => acc + Number(inv.total), 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  const handleCreateInvoice = async () => {
    if (!isGuestMode && !isAddingNewCustomer && !selectedCustomerId) {
      toast.error("Please select a customer or enable Guest Mode.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please add at least one item to the bill.");
      return;
    }

    let finalCustomerId = selectedCustomerId || null;

    // Handle New Customer Creation In-line
    if (isAddingNewCustomer) {
       if (!newCust.name || !newCust.phone) {
          toast.error("Customer Name and Phone are required.");
          return;
       }
       const { data: createdCust, error: custError } = await supabase
          .from('customers')
          .insert({ full_name: newCust.name, phone: newCust.phone })
          .select()
          .single();
       
       if (custError) {
          toast.error("Failed to register new customer in-line.");
          return;
       }
       finalCustomerId = createdCust.id;
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        customer_id: isGuestMode ? null : finalCustomerId,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        status: 'Paid',
        payment_method: 'Cash'
      })
      .select()
      .single();

    if (invoiceError) {
      toast.error("Failed to create invoice.");
      return;
    }

    const itemsToInsert = selectedItems.map(item => ({
      invoice_id: invoice.id,
      item_type: item.type,
      item_id: item.id.toString().startsWith('custom-') ? '00000000-0000-0000-0000-000000000000' : item.id,
      item_name: item.title,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      staff_id: item.staff_id && item.staff_id !== "" ? item.staff_id : null
    }));

    const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);

    if (itemsError) {
      toast.error("Failed to save invoice items.");
    } else {
      // PDF & Messaging Integration
      const customer = customers.find(c => c.id === finalCustomerId);
      const custName = isAddingNewCustomer ? newCust.name : (customer?.full_name || "Walk-in Guest");
      const custPhone = isAddingNewCustomer ? newCust.phone : (customer?.phone || "");

      // 1. Generate PDF
      generateInvoicePDF({
        invoiceNo: invoice.invoice_no || `INV-${invoice.id.slice(0,8)}`,
        date: new Date().toLocaleDateString(),
        customerName: custName,
        customerPhone: custPhone,
        items: selectedItems,
        subtotal: calculateSubtotal(),
        gstRate: gstRate,
        tax: calculateTax(),
        total: calculateTotal()
      });

      // 2. Automate Messaging
      if (custPhone) {
         await supabase.from('messaging_logs').insert({
            recipient_phone: custPhone,
            message: `Hi ${custName}, thank you for visiting AAR Salon. Your professional GST invoice ${invoice.invoice_no} has been generated. Total: INR ${calculateTotal().toLocaleString()}`,
            channel: 'WhatsApp',
            status: 'Sent'
         });
         toast.success(`Invoice sent to ${custName} via WhatsApp!`);
      }

      toast.success(isGuestMode ? "Guest invoice generated!" : "Invoice finalized and sent!");
      setIsInvoiceSheetOpen(false);
      setSelectedItems([]);
      setSelectedCustomerId("");
      setIsGuestMode(false);
      setIsAddingNewCustomer(false);
      setNewCust({ name: "", phone: "" });
      fetchFinancialData();
      fetchInitialData(); // Refresh customer list
    }
  };

  const addCustomItem = () => {
     if (!customItem.title || customItem.price <= 0) {
        toast.error("Enter valid Name and Price for custom charge.");
        return;
     }
     const item = {
        id: `custom-${Date.now()}`,
        title: customItem.title,
        price: parseNumeric(customItem.price),
        type: 'custom',
        quantity: 1,
        staff_id: null
     };
     setSelectedItems([...selectedItems, item]);
     setCustomItem({ title: "", price: 0 });
  };

  const addItem = (item: any, type: string) => {
    const existing = selectedItems.find(i => i.id === item.id && i.type === type);
    if (existing) {
      setSelectedItems(selectedItems.map(i => i.id === item.id && i.type === type ? { ...i, quantity: (Number(i.quantity) || 1) + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, { ...item, type, price: parseNumeric(item.price), quantity: 1, staff_id: null }]);
    }
  };

  const updateItemStaff = (id: string, staffId: string) => {
    setSelectedItems(selectedItems.map(i => i.id === id ? { ...i, staff_id: staffId } : i));
  };

  const removeItem = (id: string) => setSelectedItems(selectedItems.filter(i => i.id !== id));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Accounts & P&L Manager</h2>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive financial tracking including Revenue, Expenses, and Profitability.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl border border-border/20">
             <button 
               onClick={() => setActiveSubTab("invoices")}
               className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeSubTab === 'invoices' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-secondary'}`}>
               Invoices
             </button>
             <button 
               onClick={() => setActiveSubTab("expenses")}
               className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeSubTab === 'expenses' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-secondary'}`}>
               Expenses
             </button>
          </div>
          <button 
            onClick={() => activeSubTab === 'invoices' ? setIsInvoiceSheetOpen(true) : setIsExpenseSheetOpen(true)} 
            className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> {activeSubTab === 'invoices' ? 'Generate Bill' : 'Record Expense'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-6 border border-border/50 group overflow-hidden relative">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 rounded-xl bg-green-500/10 text-green-400"><IndianRupee className="w-5 h-5" /></div>
             <ArrowUpRight className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">Total Revenue</p>
        </div>
        
        <div className="glass rounded-2xl p-6 border border-border/50 group overflow-hidden relative">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 rounded-xl bg-red-500/10 text-red-400"><Wallet className="w-5 h-5" /></div>
             <ArrowDownRight className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">₹{totalExpenses.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">Total Expenses</p>
        </div>

        <div className="glass rounded-2xl p-6 border border-border/50 group overflow-hidden relative lg:col-span-2">
          <div className="absolute right-0 top-0 p-8 opacity-5">
             <PieChart className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 rounded-xl bg-primary/10 text-primary"><Calculator className="w-5 h-5" /></div>
             <div className="text-[9px] font-bold uppercase px-2 py-1 rounded-full bg-primary/5 text-primary border border-primary/20">
               Operational Margin: {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0'}%
             </div>
          </div>
          <p className={`text-2xl font-bold tracking-tight ${netProfit >= 0 ? 'text-primary' : 'text-red-400'}`}>₹{netProfit.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold italic">Net Business Yield (P&L)</p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-border/50 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border/30 bg-secondary/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={`Search ${activeSubTab}...`} 
              className="w-full bg-background border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-secondary/50 p-2.5 rounded-xl border border-border/30 text-muted-foreground hover:text-primary transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button className="bg-secondary/50 p-2.5 rounded-xl border border-border/30 text-muted-foreground hover:text-primary transition-colors">
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          {activeSubTab === 'invoices' ? (
             <table className="w-full">
               <thead>
                 <tr className="bg-secondary/20 border-b border-border/30">
                   <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Invoice ID</th>
                   <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer</th>
                   <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Value</th>
                   <th className="text-right p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/10">
                 {loading ? (
                    <tr><td colSpan={4} className="p-12 text-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                 ) : invoices.map((inv) => (
                   <tr key={inv.id} className="hover:bg-secondary/10 transition-colors group cursor-pointer">
                     <td className="p-4 text-xs font-mono font-bold text-primary">#{inv.invoice_no || inv.id.slice(0, 8)}</td>
                     <td className="p-4">
                       <p className="text-xs font-bold text-foreground">{inv.customers?.full_name || 'Walk-in Client'}</p>
                       <p className="text-[9px] text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</p>
                     </td>
                     <td className="p-4 text-xs font-bold text-foreground">₹{Number(inv.total).toLocaleString()}</td>
                     <td className="p-4 text-right">
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border bg-green-500/10 text-green-400 border-green-500/20">Paid</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          ) : (
            <table className="w-full">
               <thead>
                 <tr className="bg-secondary/20 border-b border-border/30">
                   <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Expense Title</th>
                   <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</th>
                   <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                   <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
                   <th className="text-right p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/10">
                 {expenses.map((exp) => (
                   <tr key={exp.id} className="hover:bg-secondary/10 transition-colors group">
                     <td className="p-4 text-xs font-bold text-foreground">{exp.title}</td>
                     <td className="p-4">
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-border/30 bg-secondary/50 text-muted-foreground">{exp.category}</span>
                     </td>
                     <td className="p-4 text-xs text-muted-foreground">{exp.expense_date ? new Date(exp.expense_date).toLocaleDateString() : 'N/A'}</td>
                     <td className="p-4 text-xs font-bold text-red-400">₹{Number(exp.amount).toLocaleString()}</td>
                     <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => openEditExpense(exp)}
                             className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-all"
                           >
                              <Edit3 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleDeleteExpense(exp.id)}
                             className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-red-400 transition-all"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Expense Sheet */}
      <Sheet open={isExpenseSheetOpen} onOpenChange={setIsExpenseSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto glass-strong border-l border-border/30 p-0">
          <div className="flex flex-col h-full">
            <div className="p-8">
              <SheetHeader className="mb-8">
                <SheetTitle className="text-2xl font-heading text-foreground">
                  {editingExpenseId ? "Modify Expense Record" : "Record Business Expense"}
                </SheetTitle>
                <SheetDescription>
                  {editingExpenseId ? "Update the details of your existing expense entry." : "Track your operational costs to maintain accurate P&L statements."}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Expense Details</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Monthly Rent"
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                    className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category</label>
                       <select 
                          value={newExpense.category}
                          onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                          className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none">
                          <option>Rent</option>
                          <option>Salary</option>
                          <option>Inventory</option>
                          <option>Utility</option>
                          <option>Marketing</option>
                          <option>Taxes</option>
                          <option>Other</option>
                       </select>
                       {newExpense.category === "Other" && (
                         <input 
                           type="text"
                           placeholder="Specify Category..."
                           value={newExpense.customCategory}
                           onChange={(e) => setNewExpense({...newExpense, customCategory: e.target.value})}
                           className="w-full mt-2 bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none animate-in slide-in-from-top-2 duration-300"
                         />
                       )}
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount (₹)</label>
                       <input 
                         type="number" 
                         value={newExpense.amount || ""}
                         onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                         className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none font-bold"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Source of Payment</label>
                    <div className="flex gap-2">
                       {["Cash", "UPI", "Bank Transfer", "Credit Card"].map((method) => (
                          <button
                             key={method}
                             onClick={() => setNewExpense({...newExpense, paymentMethod: method})}
                             className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${newExpense.paymentMethod === method ? 'bg-primary/20 border-primary text-primary shadow-inner' : 'bg-secondary/30 border-border/30 text-muted-foreground hover:bg-secondary'}`}
                          >
                             {method}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Operational Notes</label>
                    <textarea 
                      placeholder="Add any specific details about this expense..."
                      value={newExpense.note}
                      onChange={(e) => setNewExpense({...newExpense, note: e.target.value})}
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none min-h-[80px]"
                    />
                 </div>

                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-3">
                   <FileText className="w-5 h-5 text-red-500 mt-0.5" />
                   <p className="text-[10px] text-muted-foreground leading-relaxed">
                     Logging an expense will immediately reflect in the Growth Command Center and adjust your projected net profit for this month.
                   </p>
                </div>
              </div>
            </div>

            <div className="mt-auto p-6 border-t border-border/10 bg-secondary/10 flex gap-4">
               <button 
                onClick={() => { setIsExpenseSheetOpen(false); setEditingExpenseId(null); }} 
                className="flex-1 bg-background border border-border/50 text-foreground py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-all"
               >
                 Cancel
               </button>
               <button onClick={handleSaveExpense} className="flex-[2] bg-red-500 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-red-500/20">
                 {editingExpenseId ? "Update Expense" : "Confirm Expense"}
               </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* New Invoice Sheet (Original behavior kept) */}
      <Sheet open={isInvoiceSheetOpen} onOpenChange={setIsInvoiceSheetOpen}>
         <SheetContent className="w-full sm:max-w-2xl overflow-y-auto glass-strong border-l border-border/30 p-0">
           <div className="flex flex-col h-full">
            <div className="p-8">
               <SheetHeader className="mb-8">
                 <SheetTitle className="text-2xl font-heading text-foreground">Generate New Bill</SheetTitle>
                 <SheetDescription>Assign services to staff members to track performance and commissions.</SheetDescription>
               </SheetHeader>

               <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                     <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block tracking-widest">Customer Identity</label>
                        {!isGuestMode && !isAddingNewCustomer ? (
                           <div className="flex gap-2">
                              <select 
                                 value={selectedCustomerId} 
                                 onChange={(e) => setSelectedCustomerId(e.target.value)} 
                                 className="flex-1 bg-secondary/30 border border-border/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 font-medium"
                               >
                                 <option value="">Search or Select Customer...</option>
                                 {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>)}
                              </select>
                              <button 
                                 onClick={() => setIsAddingNewCustomer(true)}
                                 className="p-3 rounded-xl bg-secondary/50 border border-border/20 text-primary hover:bg-secondary transition-all"
                                 title="Quick Add Customer"
                              >
                                 <UserPlus className="w-5 h-5" />
                              </button>
                           </div>
                        ) : isAddingNewCustomer ? (
                           <div className="flex gap-2 items-center animate-in slide-in-from-left-2 duration-300">
                              <input 
                                 type="text" 
                                 placeholder="Full Name" 
                                 value={newCust.name}
                                 onChange={(e) => setNewCust({...newCust, name: e.target.value})}
                                 className="flex-1 bg-secondary/50 border border-border/20 rounded-xl px-3 py-2 text-xs focus:border-primary/50 outline-none"
                              />
                              <input 
                                 type="text" 
                                 placeholder="Phone" 
                                 value={newCust.phone}
                                 onChange={(e) => setNewCust({...newCust, phone: e.target.value})}
                                 className="flex-1 bg-secondary/50 border border-border/20 rounded-xl px-3 py-2 text-xs focus:border-primary/50 outline-none"
                              />
                              <button onClick={() => setIsAddingNewCustomer(false)} className="text-muted-foreground hover:text-red-400 p-1"><XCircle className="w-5 h-5" /></button>
                           </div>
                        ) : (
                           <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-xs font-bold text-primary flex items-center justify-between animate-in zoom-in-95 duration-200">
                              <span className="flex items-center gap-2"><UserCircle className="w-4 h-4" /> WALK-IN GUEST (ANONYMOUS)</span>
                              <button onClick={() => setIsGuestMode(false)} className="text-[10px] underline uppercase">Reset</button>
                           </div>
                        )}
                     </div>
                     {!isAddingNewCustomer && (
                        <div className="flex flex-col items-center gap-1">
                           <label className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Guest</label>
                           <button 
                              onClick={() => { setIsGuestMode(!isGuestMode); if(!isGuestMode) setSelectedCustomerId(""); }}
                              className={`p-2 rounded-full border transition-all ${isGuestMode ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-secondary/50 border-border/30 text-muted-foreground'}`}
                           >
                              <UserMinus className="w-4 h-4" />
                           </button>
                        </div>
                     )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block tracking-widest">Available Services</label>
                         <div className="h-48 overflow-y-auto no-scrollbar border border-border/10 rounded-2xl bg-secondary/10 p-2 space-y-1">
                           {services.map(s => (
                              <button 
                                key={s.id} 
                                onClick={() => addItem(s, 'service')} 
                                className="w-full flex justify-between items-center p-3 rounded-xl hover:bg-primary/20 text-xs transition-all group border border-transparent hover:border-primary/20"
                              >
                                 <span className="font-medium">{s.title}</span>
                                 <span className="font-bold text-primary group-hover:scale-110 transition-transform">₹{s.price}</span>
                              </button>
                           ))}
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block tracking-widest">Add Custom Charge</label>
                         <div className="p-3 bg-secondary/10 border border-border/10 rounded-2xl space-y-3">
                            <input 
                               type="text" 
                               placeholder="Description (e.g. Special Tint)" 
                               value={customItem.title}
                               onChange={(e) => setCustomItem({...customItem, title: e.target.value})}
                               className="w-full bg-background/50 border border-border/20 rounded-lg px-3 py-2 text-xs focus:border-primary/50 outline-none"
                            />
                            <div className="flex gap-2">
                               <input 
                                  type="number" 
                                  placeholder="Price" 
                                  value={customItem.price || ""}
                                  onChange={(e) => setCustomItem({...customItem, price: Number(e.target.value)})}
                                  className="flex-1 bg-background/50 border border-border/20 rounded-lg px-3 py-2 text-xs focus:border-primary/50 outline-none"
                               />
                               <button 
                                 onClick={addCustomItem}
                                 className="bg-primary text-primary-foreground px-4 rounded-lg text-[10px] font-bold uppercase hover:bg-primary/90 transition-all"
                               >
                                  Add
                               </button>
                            </div>
                         </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block tracking-widest font-heading">Active Bill Summary ({selectedItems.length})</label>
                       <div className="h-80 overflow-y-auto no-scrollbar border border-border/10 rounded-2xl bg-secondary/10 p-3 space-y-3 shadow-inner">
                          {selectedItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-[10px] text-muted-foreground italic text-center px-4 space-y-4">
                              <Receipt className="w-8 h-8 opacity-20" />
                              <p>The cart is empty.<br/>Select services or add custom charges.</p>
                            </div>
                          ) : selectedItems.map((item) => (
                            <div key={`${item.id}-${item.type}`} className="p-3 rounded-xl bg-background border border-border/20 space-y-2 group hover:border-primary/30 transition-all shadow-sm">
                               <div className="flex justify-between items-start">
                                  <div className="flex flex-col">
                                     <span className="text-[11px] font-bold text-foreground leading-tight">{item.title}</span>
                                     <span className="text-[9px] text-primary font-bold">₹{item.price}</span>
                                  </div>
                                  <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-400 p-1">
                                     <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                               </div>
                               <select 
                                 value={item.staff_id || ""} 
                                 onChange={(e) => updateItemStaff(item.id, e.target.value)}
                                 className="w-full bg-secondary/30 border border-border/20 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:border-primary/50"
                               >
                                  <option value="">Assign Stylist...</option>
                                  {staffList.map(st => <option key={st.id} value={st.id}>{st.full_name}</option>)}
                               </select>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-3xl p-6 border border-primary/20 space-y-4 shadow-inner">
                     <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-muted-foreground">
                           <span>Base Subtotal</span>
                           <span>₹{calculateSubtotal().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                           <div className="flex items-center gap-2">
                             <span>GST Compliance</span>
                             <div className="flex items-center gap-1 bg-background/50 border border-border/20 rounded-lg px-2 py-1">
                                <input 
                                  type="number" 
                                  value={gstRate} 
                                  onChange={(e) => setGstRate(Number(e.target.value))}
                                  className="w-8 bg-transparent border-none outline-none text-[10px] font-bold text-primary text-center"
                                />
                                <span className="text-[10px] opacity-50">%</span>
                             </div>
                           </div>
                           <span>₹{calculateTax().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-primary/10">
                           <span className="text-sm font-bold text-foreground">Total Payable Amount</span>
                           <span className="text-2xl font-bold text-primary">₹{calculateTotal().toLocaleString()}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="mt-auto p-6 bg-secondary/10 border-t border-border/20">
               <button 
                  onClick={handleCreateInvoice} 
                  disabled={(!isGuestMode && !isAddingNewCustomer && !selectedCustomerId) || selectedItems.length === 0}
                  className="w-full gold-gradient text-primary-foreground py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
               >
                 <ShoppingCart className="w-4 h-4" /> Authorize & Finalize Bill
               </button>
            </div>
           </div>
         </SheetContent>
      </Sheet>
    </div>
  );
};

export default BillingSystem;
