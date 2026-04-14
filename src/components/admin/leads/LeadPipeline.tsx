import { useState, useEffect } from "react";
import { 
  TrendingUp, Plus, Search, Instagram, Facebook, Globe, Phone,
  Filter, MoreVertical, Mail, Calendar, UserPlus, ArrowRight,
  CheckCircle2, Clock, AlertCircle, MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const LeadPipeline = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    email: "",
    source: "Instagram",
    status: "New",
    interest: "Bridal Makeup Course"
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setLeads(data);
    setLoading(false);
  };

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.phone) {
      toast.error("Name and Phone are required.");
      return;
    }

    const { error } = await supabase.from('leads').insert(newLead);
    if (error) {
      toast.error("Failed to add lead.");
    } else {
      toast.success("Lead captured successfully!");
      setIsSheetOpen(false);
      fetchLeads();
    }
  };

  const updateLeadStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (!error) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      toast.success(`Status updated to ${status}`);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.phone.includes(searchTerm)
  );

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'instagram': return <Instagram className="w-3 h-3 text-pink-500" />;
      case 'facebook': return <Facebook className="w-3 h-3 text-blue-600" />;
      case 'website': return <Globe className="w-3 h-3 text-blue-400" />;
      default: return <Phone className="w-3 h-3 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enrolled': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'contacted': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'trial': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Multi-Channel Lead Engine</h2>
          <p className="text-sm text-muted-foreground mt-1">Capture and nurture interest from social media, web, and walk-ins.</p>
        </div>
        <button 
          onClick={() => setIsSheetOpen(true)}
          className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "New Leads", value: leads.filter(l => l.status === 'New').length, icon: AlertCircle, color: "text-yellow-500" },
          { label: "Active Nurture", value: leads.filter(l => l.status === 'Contacted' || l.status === 'Trial').length, icon: MessageSquare, color: "text-blue-400" },
          { label: "High Intent", value: leads.filter(l => l.interest?.includes('Bridal')).length, icon: TrendingUp, color: "text-primary" },
          { label: "Conversions", value: leads.filter(l => l.status === 'Enrolled').length, icon: CheckCircle2, color: "text-green-500" },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-4 border border-border/50">
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
                placeholder="Search leads by name or phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
              />
           </div>
           <div className="flex gap-2">
              <button className="bg-secondary/50 p-2.5 rounded-xl border border-border/30 text-muted-foreground hover:text-primary transition-colors">
                <Filter className="w-4 h-4" />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full">
              <thead>
                 <tr className="bg-secondary/20 border-b border-border/30">
                    <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lead Info</th>
                    <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source</th>
                    <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Interest</th>
                    <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                 {loading ? (
                    <tr><td colSpan={5} className="p-12 text-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                 ) : filteredLeads.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-muted-foreground italic">No leads found. Caputre new prospects from ads or manual entry.</td></tr>
                 ) : filteredLeads.map((l) => (
                    <tr key={l.id} className="hover:bg-secondary/10 transition-colors group">
                       <td className="p-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary text-xs border border-border/30">
                                {l.name[0]}
                             </div>
                             <div>
                                <p className="text-sm font-bold">{l.name}</p>
                                <p className="text-[10px] text-muted-foreground">{l.phone}</p>
                             </div>
                          </div>
                       </td>
                       <td className="p-4">
                          <div className="flex items-center gap-2">
                             <div className="p-1.5 rounded-lg bg-secondary">
                                {getSourceIcon(l.source)}
                             </div>
                             <span className="text-xs font-medium">{l.source}</span>
                          </div>
                       </td>
                       <td className="p-4">
                          <p className="text-xs font-medium">{l.interest || 'General Inquiry'}</p>
                          <p className="text-[9px] text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</p>
                       </td>
                       <td className="p-4">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${getStatusColor(l.status)}`}>
                             {l.status}
                          </span>
                       </td>
                       <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => updateLeadStatus(l.id, 'Contacted')}
                                className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" title="Mark Contacted"
                             >
                                <MessageSquare className="w-3.5 h-3.5" />
                             </button>
                             <button 
                                onClick={() => updateLeadStatus(l.id, 'Enrolled')}
                                className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20" title="Convert to Academy Student"
                             >
                                <UserPlus className="w-3.5 h-3.5" />
                             </button>
                             <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"><MoreVertical className="w-3.5 h-3.5" /></button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      {/* Add Lead Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto glass-strong border-l border-border/30 p-0">
          <div className="flex flex-col h-full">
            <div className="p-8">
              <SheetHeader className="mb-8">
                <SheetTitle className="text-2xl font-heading text-foreground">Capture New Lead</SheetTitle>
                <SheetDescription>Log potential customers or students for follow-up.</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Priya Sharma"
                    value={newLead.name}
                    onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                    className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone Number</label>
                     <input 
                       type="text" 
                       placeholder="+91 98765 43210"
                       value={newLead.phone}
                       onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                       className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Source</label>
                     <select 
                       value={newLead.source}
                       onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                       className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                     >
                       <option>Instagram</option>
                       <option>Facebook</option>
                       <option>Website</option>
                       <option>Walk-in</option>
                       <option>Referral</option>
                     </select>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Service/Course Interest</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Master Bridal Makeup Course"
                    value={newLead.interest}
                    onChange={(e) => setNewLead({...newLead, interest: e.target.value})}
                    className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                  />
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
                   <Clock className="w-5 h-5 text-primary mt-0.5" />
                   <p className="text-[10px] text-muted-foreground leading-relaxed">
                     Automated WhatsApp welcome message will be sent to the lead upon saving, if the AI Messaging engine is active.
                   </p>
                </div>
              </div>
            </div>

            <div className="mt-auto p-6 border-t border-border/10 bg-secondary/10 flex gap-4">
               <button onClick={() => setIsSheetOpen(false)} className="flex-1 bg-background border border-border/50 text-foreground py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all">Cancel</button>
               <button onClick={handleAddLead} className="flex-[2] gold-gradient text-primary-foreground py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                 <CheckCircle2 className="w-4 h-4" /> Save Prospect
               </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default LeadPipeline;
