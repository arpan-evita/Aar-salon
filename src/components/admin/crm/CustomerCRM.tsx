import { useState, useEffect } from "react";
import { 
  Search, Filter, Plus, User, Phone, Mail, 
  Calendar, MoreVertical, Star, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, MapPin,
  History, CreditCard, Award, MessageSquare, ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const CustomerCRM = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Add Customer State
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    full_name: "",
    phone: "",
    email: "",
    notes: "",
    status: "Active"
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('total_spend', { ascending: false });
    
    if (data) setCustomers(data);
    setLoading(false);
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.full_name || !newCustomer.phone) {
      toast.error("Name and Phone are required");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from('customers')
      .insert([newCustomer]);

    if (error) {
      if (error.code === '23505') {
        toast.error("Customer with this phone number already exists");
      } else {
        toast.error("Failed to add customer");
      }
    } else {
      toast.success("Customer added to registry");
      setIsAddSheetOpen(false);
      setNewCustomer({ full_name: "", phone: "", email: "", notes: "", status: "Active" });
      fetchCustomers();
    }
    setSubmitting(false);
  };

  const fetchCustomerDetails = async (customer: any) => {
    setLoadingHistory(true);
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });
    
    setCustomerInvoices(invoices || []);
    setLoadingHistory(false);
  };

  const statusColors = {
    'Active': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Inactive': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    'At-risk': 'bg-red-500/10 text-red-400 border-red-500/20',
    'VIP': 'bg-primary/20 text-primary border-primary/30'
  };

  const filteredCustomers = customers.filter(c => 
    (c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.phone?.includes(searchTerm)) &&
    (filterStatus === "All" || c.status === filterStatus)
  );

  const handleCustomerClick = (customer: any) => {
    setSelectedCustomer(customer);
    setIsSheetOpen(true);
    fetchCustomerDetails(customer);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Master Customer CRM</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and track your 360-degree customer relationships.</p>
        </div>
        <button 
          onClick={() => setIsAddSheetOpen(true)}
          className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Add New Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Clients", value: customers.length, icon: User, color: "text-primary" },
          { label: "VIP Members", value: customers.filter(c => c.status === 'VIP').length, icon: Star, color: "text-yellow-400" },
          { label: "At Risk", value: customers.filter(c => c.status === 'At-risk').length, icon: AlertTriangle, color: "text-red-400" },
          { label: "Total Retention", value: `${Math.round((customers.filter(c => c.visit_count > 1).length / (customers.length || 1)) * 100)}%`, icon: TrendingUp, color: "text-green-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-secondary/50 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-0.5">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl border border-border/50 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border/30 bg-secondary/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or mobile number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all shadow-inner"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
            {['All', 'Active', 'VIP', 'At-risk', 'Inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filterStatus === status ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/20 border-b border-border/30">
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer Info</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Visits</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Spend</th>
                <th className="text-right p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground italic">No matches found in the registry.</td></tr>
              ) : filteredCustomers.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => handleCustomerClick(c)}
                  className="hover:bg-secondary/20 transition-all group cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border/30 rounded-xl shadow-sm">
                        <AvatarFallback className="bg-secondary text-primary font-bold">{c.full_name?.[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{c.full_name}</p>
                        <p className="text-[9px] text-muted-foreground italic">Joined {new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold text-foreground/80">{c.phone}</div>
                      <div className="text-[9px] text-muted-foreground">{c.email || 'No email registered'}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full border ${statusColors[c.status as keyof typeof statusColors]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-xs">{c.visit_count}</td>
                  <td className="p-4 font-bold text-xs text-primary">₹{Number(c.total_spend || 0).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"><ChevronRight className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto glass-strong border-l border-border/30 p-0 shadow-2xl">
          {selectedCustomer && (
            <div className="flex flex-col h-full">
              <div className="p-8 pb-0">
                <SheetHeader className="text-left">
                  <div className="flex items-center gap-6 mb-8">
                    <Avatar className="h-20 w-20 border-2 border-primary/20 rounded-2xl shadow-xl">
                      <AvatarFallback className="bg-secondary text-primary font-bold text-2xl">{selectedCustomer.full_name?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <SheetTitle className="text-3xl font-heading text-foreground mb-1">{selectedCustomer.full_name}</SheetTitle>
                      <SheetDescription className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${statusColors[selectedCustomer.status as keyof typeof statusColors]}`}>
                          {selectedCustomer.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em]">Verified Profile</span>
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                  <div className="bg-secondary/30 p-4 rounded-2xl border border-border/10 shadow-sm">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1.5">LTV (Spend)</p>
                    <p className="text-lg font-bold">₹{Number(selectedCustomer.total_spend || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-2xl border border-border/10 shadow-sm">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1.5">Loyalty Rank</p>
                    <p className="text-lg font-bold text-primary flex items-center gap-1.5">
                      <Award className="w-4 h-4" /> {selectedCustomer.loyalty_level}
                    </p>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-2xl border border-border/10 shadow-sm">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1.5">Total Visits</p>
                    <p className="text-lg font-bold">{selectedCustomer.visit_count}</p>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-2xl border border-border/10 shadow-sm">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1.5">Last Visit</p>
                    <p className="text-xs font-bold uppercase">{selectedCustomer.last_visit_at ? new Date(selectedCustomer.last_visit_at).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start bg-secondary/30 p-1 mb-8 border border-border/20 rounded-xl backdrop-blur-md">
                    <TabsTrigger value="overview" className="text-[10px] font-bold uppercase flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all py-2.5">Overview</TabsTrigger>
                    <TabsTrigger value="history" className="text-[10px] font-bold uppercase flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all py-2.5">Visit History</TabsTrigger>
                    <TabsTrigger value="preferences" className="text-[10px] font-bold uppercase flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all py-2.5">Preferences</TabsTrigger>
                  </TabsList>

                  <div className="min-h-[350px]">
                    <TabsContent value="overview" className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary border-b border-primary/10 pb-2">Verified Contact Matrix</h4>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex items-center gap-4 text-xs font-bold">
                             <div className="p-2 rounded-lg bg-secondary"><Phone className="w-4 h-4 text-primary" /></div>
                             {selectedCustomer.phone}
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold truncate">
                             <div className="p-2 rounded-lg bg-secondary"><Mail className="w-4 h-4 text-primary" /></div>
                             {selectedCustomer.email || 'Not Provided'}
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold">
                             <div className="p-2 rounded-lg bg-secondary"><Calendar className="w-4 h-4 text-primary" /></div>
                             {selectedCustomer.birthday ? new Date(selectedCustomer.birthday).toLocaleDateString() : 'Unleashed'}
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold">
                             <div className="p-2 rounded-lg bg-secondary"><MapPin className="w-4 h-4 text-primary" /></div>
                             Aar Salon & Academy
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                           <input 
                             type="checkbox" 
                             id="whatsapp_opt_in"
                             checked={selectedCustomer.whatsapp_opt_in}
                             onChange={async (e) => {
                               const { error } = await supabase.from('customers').update({ 
                                 whatsapp_opt_in: e.target.checked,
                                 whatsapp_opt_in_at: e.target.checked ? new Date().toISOString() : null
                               }).eq('id', selectedCustomer.id);
                               if (!error) {
                                 setSelectedCustomer({...selectedCustomer, whatsapp_opt_in: e.target.checked});
                                 toast.success(e.target.checked ? "WhatsApp marketing enabled." : "WhatsApp marketing disabled.");
                               }
                             }}
                             className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                           />
                           <label htmlFor="whatsapp_opt_in" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer">
                             WhatsApp Marketing Consent (GDPR/Compliance)
                           </label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary border-b border-primary/10 pb-2">Intelligence Insights</h4>
                        <div className="p-5 glass rounded-2xl border border-border/30 bg-primary/5">
                           <div className="flex items-center justify-between mb-3 text-[10px] font-bold uppercase tracking-widest">
                             <span className="text-muted-foreground">Retention Strength</span>
                             <span className="text-primary">{selectedCustomer.visit_count > 3 ? 'High Probability' : 'Emerging Loyalist'}</span>
                           </div>
                           <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden mb-3">
                             <div className="gold-gradient h-full transition-all duration-1000 shadow-[0_0_15px_rgba(212,175,55,0.4)]" style={{ width: `${Math.min(selectedCustomer.visit_count * 20, 100)}%` }} />
                           </div>
                           <p className="text-[10px] text-muted-foreground italic font-medium leading-relaxed">
                             "This customer has consistently chosen high-value services. Predicted next visit cycle: {selectedCustomer.visit_count > 0 ? 'Within 28 days' : 'N/A'}."
                           </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="animate-in slide-in-from-right-4 duration-500">
                      <div className="space-y-4">
                        {loadingHistory ? (
                          <div className="p-20 text-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                        ) : customerInvoices.length === 0 ? (
                          <div className="p-20 text-center text-muted-foreground italic text-xs">No service records found in the general ledger.</div>
                        ) : customerInvoices.map((inv, i) => (
                          <div key={inv.id} className="flex gap-6 group">
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 text-primary font-bold text-[9px] shadow-sm">
                                {i + 1}
                              </div>
                              <div className="w-[1.5px] h-full bg-border/20 group-last:bg-transparent" />
                            </div>
                            <div className="flex-1 pb-6">
                              <div className="glass p-5 rounded-2xl border border-border/30 hover:border-primary/40 transition-all shadow-md">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs font-bold text-foreground">AAR Salon Treatment</span>
                                  <span className="text-[10px] font-bold text-muted-foreground italic">{new Date(inv.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground mb-4">
                                  <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-primary" /> ₹{Number(inv.total).toLocaleString()}</span>
                                  <span className="flex items-center gap-1.5 uppercase tracking-widest bg-green-500/10 text-green-400 px-2 rounded-full border border-green-500/20">{inv.status}</span>
                                </div>
                                <div className="bg-secondary/20 p-3 rounded-xl text-[10px] italic text-foreground/70 leading-relaxed border border-border/10">
                                   Transaction verified for {inv.payment_method}. Detailed service breakdown available in master ledger.
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="preferences" className="animate-in slide-in-from-right-4 duration-500">
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 glass rounded-2xl border border-border/50 bg-secondary/20">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-4">Strategic Stylist</p>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                                <Award className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-bold tracking-tight">Assigned Primary</span>
                            </div>
                          </div>
                          <div className="p-5 glass rounded-2xl border border-border/50 bg-secondary/20">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-4">Visit Velocity</p>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                                <Clock className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-bold tracking-tight">Flexible Hours</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6 glass rounded-2xl border border-border/50 bg-secondary/30">
                           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4 border-b border-primary/10 pb-2">Internal Operational Notes</p>
                           <textarea 
                             className="w-full bg-transparent text-xs min-h-[120px] focus:outline-none leading-relaxed italic placeholder:opacity-50"
                             defaultValue={selectedCustomer.notes || "No operational constraints recorded for this customer profile. Standard high-luxury treatment protocol applies."}
                           />
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              <div className="p-8 mt-auto bg-secondary/10 border-t border-border/20 flex gap-4">
                <button 
                   onClick={() => toast.info("WhatsApp engine is synchronizing...")}
                   className="flex-1 bg-black text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/80 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  <MessageSquare className="w-4 h-4" /> Reach via WhatsApp
                </button>
                <button 
                   onClick={() => toast.info("Scheduling matrix is evolving...")}
                   className="flex-1 gold-gradient text-primary-foreground py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                >
                  <Calendar className="w-4 h-4" /> Book Session
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      {/* Add Customer Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto glass-strong border-l border-border/30 p-0 shadow-2xl">
          <div className="flex flex-col h-full">
            <div className="p-8 border-b border-border/10 bg-primary/5">
              <SheetHeader className="text-left">
                <SheetTitle className="text-2xl font-heading text-foreground">Register New Profile</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Initialize 360-degree customer index</SheetDescription>
              </SheetHeader>
            </div>

            <form onSubmit={handleAddCustomer} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Legal Name</label>
                  <input 
                    required
                    value={newCustomer.full_name}
                    onChange={(e) => setNewCustomer({...newCustomer, full_name: e.target.value})}
                    placeholder="e.g. Primansh Agency" 
                    className="w-full bg-secondary/30 border border-border/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Contact Matrix (Phone)</label>
                  <input 
                    required
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    placeholder="+91 00000 00000" 
                    className="w-full bg-secondary/30 border border-border/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Electronic Mail</label>
                  <input 
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    placeholder="client@primansh.agency" 
                    className="w-full bg-secondary/30 border border-border/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Strategic Status</label>
                  <select 
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer({...newCustomer, status: e.target.value})}
                    className="w-full bg-secondary/30 border border-border/20 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="Active">Active Intelligence</option>
                    <option value="VIP">Executive VIP</option>
                    <option value="Inactive">Dormant</option>
                    <option value="At-risk">Churn Risk</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Profiling Notes</label>
                  <textarea 
                    value={newCustomer.notes}
                    onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                    placeholder="Enter customer traits, preferences or constraints..." 
                    className="w-full bg-secondary/30 border border-border/20 rounded-xl px-4 py-3 text-sm min-h-[100px] focus:border-primary/50 outline-none transition-all resize-none italic"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border/10 flex gap-4">
                <button type="button" onClick={() => setIsAddSheetOpen(false)} className="flex-1 bg-background border border-border/20 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-all">Cancel</button>
                <button 
                  disabled={submitting}
                  type="submit" 
                  className="flex-1 gold-gradient text-primary-foreground py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                >
                  {submitting ? "Processing..." : "Register Profile"}
                </button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CustomerCRM;
