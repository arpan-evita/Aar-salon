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

const CustomerCRM = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('total_spend', { ascending: false });
    
    if (data) setCustomers(data);
    setLoading(false);
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
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Master Customer CRM</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and track your 360-degree customer relationships.</p>
        </div>
        <button className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Add New Customer
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Clients", value: customers.length, icon: User, color: "text-primary" },
          { label: "VIP Members", value: customers.filter(c => c.status === 'VIP').length, icon: Star, color: "text-yellow-400" },
          { label: "At Risk", value: customers.filter(c => c.status === 'At-risk').length, icon: AlertTriangle, color: "text-red-400" },
          { label: "Active Today", value: Math.floor(customers.length * 0.4), icon: TrendingUp, color: "text-link" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/30 bg-secondary/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search leads, names or mobile numbers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
            {['All', 'Active', 'VIP', 'At-risk', 'Inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === status ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary text-muted-foreground hover:bg-secondary"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/20 border-b border-border/30">
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer</th>
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
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">No customers found. Try a different search.</td></tr>
              ) : filteredCustomers.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => handleCustomerClick(c)}
                  className="hover:bg-secondary/20 transition-all group cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border/30 rounded-xl">
                        <AvatarFallback className="bg-secondary text-primary font-bold">{c.full_name?.[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{c.full_name}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Last: {c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-foreground/70"><Phone className="w-3 h-3" /> {c.phone}</div>
                      {c.email && <div className="flex items-center gap-1.5 text-xs text-foreground/70"><Mail className="w-3 h-3" /> {c.email}</div>}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase tracking-tighter px-2.5 py-1 rounded-full border ${statusColors[c.status as keyof typeof statusColors]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm">{c.visit_count}</td>
                  <td className="p-4 font-bold text-sm">₹{c.total_spend?.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"><ChevronRight className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer 360 View Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto glass-strong border-l border-border/30 p-0">
          {selectedCustomer && (
            <div className="flex flex-col h-full">
              <div className="p-6 pb-0">
                <SheetHeader className="text-left">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-20 w-20 border-2 border-primary/20 rounded-2xl">
                      <AvatarFallback className="bg-secondary text-primary font-bold text-2xl">{selectedCustomer.full_name?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <SheetTitle className="text-2xl font-heading text-foreground">{selectedCustomer.full_name}</SheetTitle>
                      <SheetDescription className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusColors[selectedCustomer.status as keyof typeof statusColors]}`}>
                          {selectedCustomer.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Joined {new Date(selectedCustomer.created_at).toLocaleDateString()}</span>
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  <div className="bg-secondary/20 p-3 rounded-xl border border-border/10">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Total Lifetime Spend</p>
                    <p className="text-lg font-bold">₹{selectedCustomer.total_spend?.toLocaleString()}</p>
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-xl border border-border/10">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Total Visits</p>
                    <p className="text-lg font-bold">{selectedCustomer.visit_count}</p>
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-xl border border-border/10">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Loyalty Tier</p>
                    <p className="text-lg font-bold text-primary flex items-center gap-1">
                      <Award className="w-4 h-4" /> {selectedCustomer.loyalty_level}
                    </p>
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-xl border border-border/10">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Avg Ticket Size</p>
                    <p className="text-lg font-bold">₹{(selectedCustomer.total_spend / (selectedCustomer.visit_count || 1)).toFixed(0)}</p>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start bg-secondary/20 p-1 mb-6 border-b border-border/10 rounded-none">
                    <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="history" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Visit History</TabsTrigger>
                    <TabsTrigger value="preferences" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Preferences</TabsTrigger>
                    <TabsTrigger value="billing" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Billing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/10 pb-2">Personal Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-primary/70" /> {selectedCustomer.phone}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="w-4 h-4 text-primary/70" /> {selectedCustomer.email || 'No email provided'}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="w-4 h-4 text-primary/70" /> {selectedCustomer.birthday ? new Date(selectedCustomer.birthday).toLocaleDateString() : 'N/A'} (Birthday)
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-primary/70" /> Salon Branch, City
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/10 pb-2">Engagement Analytics</h4>
                      <div className="p-4 glass rounded-xl border border-border/30">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-xs text-muted-foreground">Frequency of Visit</span>
                           <span className="text-xs font-bold">Every 24 Days</span>
                         </div>
                         <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                           <div className="bg-primary h-full w-[70%]" />
                         </div>
                         <p className="text-[10px] text-muted-foreground mt-2 italic">* This customer returns 15% more often than average.</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4 group">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold text-[10px]">
                              {i}
                            </div>
                            <div className="w-[1px] h-full bg-border/30" />
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="glass p-4 rounded-xl border border-border/30 group-hover:border-primary/30 transition-all">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold">Luxury HydraFacial + Hair Spa</span>
                                <span className="text-xs text-muted-foreground">14 Mar 2026</span>
                              </div>
                              <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-3">
                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> Stylist: Rahul Sharma</span>
                                <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> ₹4,500 Paid</span>
                              </div>
                              <div className="bg-secondary/30 p-2 rounded-lg text-[11px] italic">
                                "Customer loved the cooling effect. Recommended Botox session for next month."
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preferences" className="animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 glass rounded-xl border border-border/30">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Preferred Stylist</p>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary border border-border/10" />
                            <span className="text-sm font-bold">Rahul Sharma</span>
                          </div>
                        </div>
                        <div className="p-4 glass rounded-xl border border-border/30">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Preferred Time</p>
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold">Weekends, Evening</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 glass rounded-xl border border-border/30">
                         <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Customer Notes & Allergies</p>
                         <textarea 
                           className="w-full bg-transparent text-sm min-h-[100px] focus:outline-none"
                           defaultValue="Latex allergy. Prefers room temperature water. Likes minimal talk during facial sessions."
                         />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="billing" className="animate-in slide-in-from-right-4 duration-300">
                    <div className="glass rounded-xl border border-border/30 overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-secondary/20 border-b border-border/10">
                            <th className="p-3 text-[10px] font-bold uppercase tracking-widest">Inv #</th>
                            <th className="p-3 text-[10px] font-bold uppercase tracking-widest">Date</th>
                            <th className="p-3 text-[10px] font-bold uppercase tracking-widest">Amount</th>
                            <th className="p-3 text-[10px] font-bold uppercase tracking-widest text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10">
                          {[1, 2, 3].map(i => (
                            <tr key={i} className="hover:bg-secondary/10">
                              <td className="p-3 text-xs font-mono">INV-098{i}</td>
                              <td className="p-3 text-xs text-muted-foreground">{14-i} Mar 2026</td>
                              <td className="p-3 text-xs font-bold">₹2,450</td>
                              <td className="p-3 text-right">
                                <button className="text-[10px] text-primary hover:underline font-bold">View PDF</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="p-6 mt-auto border-t border-border/10 flex gap-3">
                <button className="flex-1 bg-secondary text-foreground py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary/80 transition-all flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Message WhatsApp
                </button>
                <button className="flex-1 gold-gradient text-primary-foreground py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                  <Calendar className="w-4 h-4" /> Book Appointment
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CustomerCRM;
