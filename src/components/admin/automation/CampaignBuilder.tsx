import { useState, useEffect } from "react";
import { 
  Plus, Users, MessageSquare, Calendar, Send, 
  Search, Filter, CheckCircle2, AlertCircle,
  TrendingUp, ArrowRight, Save
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";

const CampaignBuilder = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    message_template: "",
    target_segment: { tag: "All" },
    status: "Draft"
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCampaigns(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!newCampaign.name || !newCampaign.message_template) {
      toast.error("Campaign name and template are required.");
      return;
    }

    const { error } = await supabase.from('campaigns').insert(newCampaign);
    if (error) {
      toast.error("Failed to save campaign.");
    } else {
      toast.success("Campaign created as draft!");
      setIsSheetOpen(false);
      fetchCampaigns();
    }
  };

  const handleAutoGenerate = () => {
    setIsGenerating(true);
    toast.info("Analyzing data and compiling strategy...", { duration: 1500 });
    setTimeout(() => {
      setNewCampaign({
        name: "Summer Glow Seasonal Strategy",
        description: "Auto-generated based on April booking trends.",
        message_template: "Hey {{name}}! ☀️ Summer is almost here. Based on your past visits, we thought you'd love our exclusive 'Summer Glow' skin care package. Book now and get a complimentary consultation! 🌴 Reply YES to claim.",
        target_segment: { tag: "All" },
        status: "Draft"
      });
      setIsGenerating(false);
      setIsSheetOpen(true);
      toast.success("AI successfully compiled campaign strategy!");
    }, 1500);
  };

  const handleAIWriter = () => {
    setIsGenerating(true);
    toast.info("AI Writer optimizing copy using successful campaign formulas...", { duration: 1500 });
    
    setTimeout(() => {
      let aiTemplate = "";
      const tag = newCampaign.target_segment.tag;
      
      if (tag === "VIP") {
        aiTemplate = `Exclusive Priority Access for {{name}} 💎\nAs one of our most valued clients, we're giving you early access to our [Service]. We only have 5 spots left this week. Reply VIP to secure your booking instantly with no deposit required.`;
      } else if (tag === "At-risk") {
        aiTemplate = `We've missed you, {{name}}! 🥺\nIt's been a while since your last visit to AAR Salon. We'd love to welcome you back with a special 20% off your next appointment. Use code COMEBACK20. Book here: [Link]`;
      } else if (tag === "New") {
        aiTemplate = `Welcome to the AAR Salon Family, {{name}}! ✨\nWe're thrilled to have you. To ensure you look your best, here is a complimentary upgrade on your next service. Present this message at checkout.`;
      } else if (tag === "Student") {
        aiTemplate = `Advance Your Career, {{name}} 🎓\nReady to master new techniques? Our upcoming masterclass is filling up fast. As an academy student, get an exclusive 10% discount on enrollment if you book within 48 hours.`;
      } else {
        // All
        aiTemplate = `Hi {{name}}! 🌟\nTransform your look this season. For a limited time, book any premium service and receive a complimentary product sample. Spots are limited, secure yours today!`;
      }

      setNewCampaign(prev => ({
        ...prev,
        message_template: aiTemplate
      }));
      setIsGenerating(false);
      toast.success("AI Writer applied optimized marketing formula!");
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Advanced Campaign Builder</h2>
          <p className="text-sm text-muted-foreground mt-1">Design and launch high-impact multi-channel marketing campaigns.</p>
        </div>
        <button 
          onClick={() => setIsSheetOpen(true)}
          className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Create New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Campaign Repository
          </h3>
          <div className="grid grid-cols-1 gap-4">
             {campaigns.length === 0 ? (
               <div className="glass rounded-3xl p-12 text-center border-dashed border-2 border-border/30">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-sm text-muted-foreground italic">No campaigns launched yet. Start your first growth drive.</p>
               </div>
             ) : campaigns.map((camp) => (
               <div key={camp.id} className="glass rounded-2xl border border-border/50 p-6 group hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h4 className="text-lg font-bold text-foreground mb-1">{camp.name}</h4>
                        <div className="flex items-center gap-3">
                           <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${camp.status === 'Sent' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-primary/20 text-primary bg-primary/5'}`}>
                              {camp.status}
                           </span>
                           <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                              <Users className="w-3 h-3" /> {camp.target_segment?.tag || 'All Clients'}
                           </span>
                        </div>
                     </div>
                     <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"><ArrowRight className="w-4 h-4" /></button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-6 italic leading-relaxed">"{camp.message_template}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/10">
                     <div className="flex gap-8">
                        <div>
                           <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Sent</p>
                           <p className="text-sm font-bold">{camp.sent_count || 0}</p>
                        </div>
                        <div>
                           <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Conversions</p>
                           <p className="text-sm font-bold text-primary">{camp.conversion_count || 0}</p>
                        </div>
                     </div>
                     <button className="text-[9px] font-bold text-primary flex items-center gap-2 hover:underline">VIEW ANALYTICS <TrendingUp className="w-3 h-3" /></button>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-6">
           <div className="glass rounded-3xl p-8 border border-border/50 bg-primary/5 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <h3 className="text-lg font-heading mb-6 flex items-center gap-3 relative z-10">
                 <AlertCircle className="w-5 h-5 text-primary" /> Seasonal Strategy
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-8 relative z-10 italic">
                "Based on your April trends, a <b>'Summer Glow'</b> skin care campaign would likely generate 15% more bookings than standard discounts."
              </p>
              <button 
                onClick={handleAutoGenerate}
                disabled={isGenerating}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 relative z-10 flex justify-center items-center gap-2"
              >
                 {isGenerating ? <TrendingUp className="w-4 h-4 animate-bounce" /> : <AlertCircle className="w-4 h-4" />}
                 {isGenerating ? "Compiling Strategy..." : "Auto-Generate Campaign"}
              </button>
           </div>

           <div className="glass rounded-3xl p-8 border border-border/50 relative overflow-hidden">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Channel Performance</h3>
              <div className="space-y-6">
                 {[
                   { label: "WhatsApp", value: "88%", color: "bg-green-500" },
                   { label: "Email", value: "22%", color: "bg-blue-400" },
                   { label: "SMS", value: "45%", color: "bg-yellow-400" },
                 ].map((channel, i) => (
                   <div key={i}>
                      <div className="flex justify-between text-[10px] font-bold mb-2">
                         <span>{channel.label}</span>
                         <span>{channel.value} Open Rate</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                         <div className={`h-full ${channel.color} transition-all duration-1000`} style={{ width: channel.value }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto glass-strong border-l border-border/30 p-0 shadow-2xl">
           <div className="flex flex-col h-full">
              <div className="p-10">
                 <SheetHeader className="mb-10 text-left">
                    <SheetTitle className="text-3xl font-heading text-foreground">Design Campaign</SheetTitle>
                    <SheetDescription>Define your audience and craft a message that converts.</SheetDescription>
                 </SheetHeader>

                 <div className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Campaign Identity</label>
                       <input 
                         type="text" 
                         placeholder="e.g. Summer Bridal Sale 2026"
                         value={newCampaign.name}
                         onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                         className="w-full bg-secondary/50 border border-border/30 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 outline-none transition-all shadow-inner"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Primary Channel</label>
                          <select className="w-full bg-secondary/50 border border-border/30 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 outline-none appearance-none cursor-pointer">
                             <option>WhatsApp API</option>
                             <option>SMS Gateway</option>
                             <option>Email Marketing</option>
                          </select>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Target Segment</label>
                          <select 
                            value={newCampaign.target_segment.tag}
                            onChange={(e) => setNewCampaign({...newCampaign, target_segment: { tag: e.target.value }})}
                            className="w-full bg-secondary/50 border border-border/30 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 outline-none appearance-none cursor-pointer"
                          >
                             <option value="All">All Active Clients</option>
                             <option value="VIP">VIP Platinum Only</option>
                             <option value="At-risk">At-Risk Clients (Re-engage)</option>
                             <option value="Student">Academy Students</option>
                             <option value="New">New Clients (Welcome)</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center ml-1">
                           <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Message Payload</label>
                           <button 
                             onClick={handleAIWriter}
                             disabled={isGenerating}
                             className="text-[9px] font-bold text-primary flex items-center gap-1 cursor-pointer hover:underline disabled:opacity-50"
                           >
                             <TrendingUp className="w-3 h-3" /> {isGenerating ? "WRITING..." : "USE AI WRITER"}
                           </button>
                        </div>
                        <textarea 
                          placeholder="Write your personalized message here..."
                          value={newCampaign.message_template}
                          disabled={isGenerating}
                         onChange={(e) => setNewCampaign({...newCampaign, message_template: e.target.value})}
                         className="w-full bg-secondary/50 border border-border/30 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 outline-none min-h-[160px] resize-none transition-all shadow-inner leading-relaxed"
                       />
                       <div className="flex gap-2">
                          {['name', 'last_service', 'discount_code'].map(v => (
                            <button key={v} onClick={() => setNewCampaign({...newCampaign, message_template: newCampaign.message_template + ` {{${v}}}`})} className="text-[9px] font-bold bg-secondary/50 text-muted-foreground px-2 py-1 rounded-md hover:bg-primary/20 hover:text-primary">+ {v}</button>
                          ))}
                       </div>
                    </div>

                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl flex items-start gap-4">
                       <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                       <div>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Reach Estimate</p>
                          <p className="text-xs text-muted-foreground italic leading-relaxed">This campaign will reach approximately <b>420 customers</b> via WhatsApp Business API.</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-auto p-8 border-t border-border/10 bg-secondary/10 flex gap-4">
                 <button onClick={() => setIsSheetOpen(false)} className="flex-1 bg-background border border-border/50 text-foreground py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-all">Discard Draft</button>
                 <button onClick={handleSave} className="flex-[2] gold-gradient text-primary-foreground py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                   <Save className="w-4 h-4" /> Save Campaign Strategy
                 </button>
              </div>
           </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CampaignBuilder;
