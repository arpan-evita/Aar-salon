import { useState, useEffect } from "react";
import { 
  IndianRupee, Receipt, Download, Filter, Plus, 
  Search, CheckCircle2, XCircle, Clock, PieChart,
  ShoppingCart, Tag, Award, Calculator, Trash2, Printer,
  ArrowUpRight, ArrowDownRight, Wallet, Briefcase, FileText
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
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Expense state
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: 0,
    category: "Rent",
    date: new Date().toISOString().split('T')[0],
    note: ""
  });

  useEffect(() => {
    fetchFinancialData();
    fetchInitialData();
  }, [activeSubTab]);

  const fetchInitialData = async () => {
    const { data: custData } = await supabase.from('customers').select('id, full_name');
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

  const handleCreateExpense = async () => {
    if (!newExpense.title || newExpense.amount <= 0) {
      toast.error("Please enter a title and valid amount.");
      return;
    }

    const { error } = await supabase.from('expenses').insert({
      title: newExpense.title,
      amount: newExpense.amount,
      category: newExpense.category,
      expense_date: newExpense.date,
      note: newExpense.note
    });

    if (error) {
       toast.error("Failed to log expense.");
    } else {
       toast.success("Expense logged successfully!");
       setIsExpenseSheetOpen(false);
       fetchFinancialData();
    }
  };

  const calculateSubtotal = () => selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const calculateTax = () => calculateSubtotal() * 0.18;
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const totalRevenue = invoices.reduce((acc, inv) => acc + Number(inv.total), 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  const handleCreateInvoice = async () => {
    if (!selectedCustomerId || selectedItems.length === 0) {
      toast.error("Please select a customer and at least one item.");
      return;
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        customer_id: selectedCustomerId,
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
      item_id: item.id,
      item_name: item.title,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      staff_id: item.staff_id || null
    }));

    const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);

    if (itemsError) {
      toast.error("Failed to save invoice items.");
    } else {
      toast.success("Invoice created successfully!");
      setIsInvoiceSheetOpen(false);
      setSelectedItems([]);
      fetchFinancialData();
    }
  };

  const addItem = (item: any, type: string) => {
    const existing = selectedItems.find(i => i.id === item.id && i.type === type);
    if (existing) {
      setSelectedItems(selectedItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, { ...item, type, quantity: 1, staff_id: "" }]);
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
             <div className="text-[9px] font-bold uppercase px-2 py-1 rounded-full bg-primary/5 text-primary border border-primary/20">Operational Margin: {((netProfit / totalRevenue) * 100).toFixed(1)}%</div>
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
                     <td className="p-4 text-xs font-mono text-muted-foreground">#{inv.id.slice(0, 8)}</td>
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
                   <th className="text-right p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/10">
                 {expenses.map((exp) => (
                   <tr key={exp.id} className="hover:bg-secondary/10 transition-colors group cursor-pointer">
                     <td className="p-4 text-xs font-bold text-foreground">{exp.title}</td>
                     <td className="p-4">
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-border/30 bg-secondary/50 text-muted-foreground">{exp.category}</span>
                     </td>
                     <td className="p-4 text-xs text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</td>
                     <td className="p-4 text-right text-xs font-bold text-red-400">₹{Number(exp.amount).toLocaleString()}</td>
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
                <SheetTitle className="text-2xl font-heading text-foreground">Record Business Expense</SheetTitle>
                <SheetDescription>Track your operational costs to maintain accurate P&L statements.</SheetDescription>
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
                         <option>General</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount (₹)</label>
                      <input 
                        type="number" 
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                        className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                      />
                   </div>
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
               <button onClick={() => setIsExpenseSheetOpen(false)} className="flex-1 bg-background border border-border/50 text-foreground py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-all">Cancel</button>
               <button onClick={handleCreateExpense} className="flex-[2] bg-red-500 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-red-500/20">
                 Confirm Expense
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
                  <div>
                     <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block tracking-widest">Select Customer</label>
                     <select 
                        value={selectedCustomerId} 
                        onChange={(e) => setSelectedCustomerId(e.target.value)} 
                        className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all font-medium"
                      >
                        <option value="">Search or Select Customer...</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                     </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block tracking-widest">Available Services</label>
                      <div className="h-64 overflow-y-auto no-scrollbar border border-border/10 rounded-2xl bg-secondary/10 p-2 space-y-1">
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
                       <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block tracking-widest">Bill Summary ({selectedItems.length})</label>
                       <div className="h-64 overflow-y-auto no-scrollbar border border-border/10 rounded-2xl bg-secondary/10 p-3 space-y-3">
                          {selectedItems.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-[10px] text-muted-foreground italic text-center px-4">
                              Select services from the left to start billing.
                            </div>
                          ) : selectedItems.map((item) => (
                            <div key={`${item.id}-${item.type}`} className="p-3 rounded-xl bg-background/50 border border-border/20 space-y-2 group">
                               <div className="flex justify-between items-start">
                                  <span className="text-[11px] font-bold text-foreground leading-tight">{item.title}</span>
                                  <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-400">
                                     <Trash2 className="w-3 h-3" />
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
                           <span>Subtotal</span>
                           <span>₹{calculateSubtotal().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-muted-foreground">
                           <span>GST (18%)</span>
                           <span>₹{calculateTax().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-primary/10">
                           <span className="text-sm font-bold text-foreground">Total Payable</span>
                           <span className="text-xl font-bold text-primary">₹{calculateTotal().toLocaleString()}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="mt-auto p-6 bg-secondary/10 border-t border-border/20">
               <button 
                  onClick={handleCreateInvoice} 
                  disabled={!selectedCustomerId || selectedItems.length === 0}
                  className="w-full gold-gradient text-primary-foreground py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-2xl transition-all disabled:opacity-50"
               >
                 Authorize & Print Invoice
               </button>
            </div>
           </div>
         </SheetContent>
      </Sheet>
    </div>
  );
};

export default BillingSystem;
