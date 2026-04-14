import { useState, useEffect } from "react";
import { 
  TicketPercent, Plus, Search, Filter, Calendar, 
  Trash2, Copy, CheckCircle2, AlertCircle, TrendingUp,
  Tag, Zap, Users, Gift
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

const OffersManager = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newOffer, setNewOffer] = useState({
    title: "",
    code: "",
    type: "Percentage",
    value: 0,
    min_spend: 0,
    valid_to: "",
    targeting: "All Customers"
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setOffers(data);
    setLoading(false);
  };

  const handleCreateOffer = async () => {
    if (!newOffer.title || !newOffer.code) {
      toast.error("Please fill in basic offer details.");
      return;
    }

    const { error } = await supabase.from('offers').insert({
      title: newOffer.title,
      code: newOffer.code,
      type: newOffer.type as any,
      value: newOffer.value,
      min_spend: newOffer.min_spend,
      valid_to: newOffer.valid_to ? new Date(newOffer.valid_to).toISOString() : null,
      is_active: true
    });

    if (error) {
      toast.error("Failed to create offer.");
    } else {
      toast.success("Offer campaign launched successfully!");
      setIsSheetOpen(false);
      fetchOffers();
    }
  };

  const deleteOffer = async (id: string) => {
    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (error) toast.error("Failed to delete offer.");
    else fetchOffers();
  };

  const typeColors = {
    'Percentage': 'text-primary bg-primary/10 border-primary/20',
    'Flat': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'BOGO': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    'Combo': 'text-green-400 bg-green-500/10 border-green-500/20'
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Dynamic Offer Engine</h2>
          <p className="text-sm text-muted-foreground mt-1">Create high-conversion promotional campaigns and BOGO deals.</p>
        </div>
        <button 
          onClick={() => setIsSheetOpen(true)}
          className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Launch New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Campaigns", value: offers.length, icon: Zap, color: "text-primary" },
          { label: "Total Redemptions", value: "842", icon: TrendingUp, color: "text-green-400" },
          { label: "Targeted Audience", value: "3.2k", icon: Users, color: "text-blue-400" },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-6 border border-border/50">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : offers.length === 0 ? (
          <div className="col-span-full py-20 glass rounded-2xl border border-dashed border-border/50 text-center">
             <Gift className="w-12 h-12 text-primary/20 mx-auto mb-4" />
             <p className="text-muted-foreground italic">No active offers. Start your first campaign to boost sales!</p>
          </div>
        ) : offers.map((offer) => (
          <div key={offer.id} className="glass rounded-2xl overflow-hidden border border-border/50 group transition-all hover:border-primary/30 shadow-lg">
            <div className="p-5 border-b border-border/10 bg-secondary/20 flex justify-between items-start">
               <div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border mb-2 inline-block ${typeColors[offer.type as keyof typeof typeColors]}`}>
                    {offer.type}
                  </span>
                  <h3 className="text-lg font-bold text-foreground">{offer.title}</h3>
               </div>
               <button onClick={() => deleteOffer(offer.id)} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>
            <div className="p-5 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="bg-primary/5 border border-dashed border-primary/30 px-3 py-2 rounded-lg">
                     <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Use Code</p>
                     <p className="text-lg font-mono font-bold text-primary tracking-widest">{offer.code}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] text-muted-foreground uppercase">Value</p>
                     <p className="text-xl font-bold">{offer.type === 'Percentage' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}</p>
                  </div>
               </div>
               
               <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Valid until {offer.valid_to ? new Date(offer.valid_to).toLocaleDateString() : 'Always'}</span>
                  <span className="flex items-center gap-1 font-bold text-green-400"><Tag className="w-3 h-3" /> {offer.usage_count || 0} uses</span>
               </div>
            </div>
            <div className="px-5 py-3 bg-secondary/10 flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                <span className="text-muted-foreground text-[8px]">Targeting: VIP & Regulars</span>
                <button className="text-primary flex items-center gap-1 hover:underline">Edit Logic <Copy className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Offer Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto glass-strong border-l border-border/30 p-0">
          <div className="flex flex-col h-full uppercase-titles">
            <div className="p-8">
              <SheetHeader className="mb-8">
                <SheetTitle className="text-2xl font-heading text-primary">Launch Campaign</SheetTitle>
                <SheetDescription>Configure your dynamic offer parameters to maximize conversion.</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Campaign Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Summer Glow Promo"
                      value={newOffer.title}
                      onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Promo Code</label>
                    <input 
                      type="text" 
                      placeholder="GLOW20"
                      value={newOffer.code}
                      onChange={(e) => setNewOffer({...newOffer, code: e.target.value})}
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Offer Type</label>
                    <select 
                      value={newOffer.type}
                      onChange={(e) => setNewOffer({...newOffer, type: e.target.value})}
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    >
                      <option>Percentage</option>
                      <option>Flat</option>
                      <option>BOGO</option>
                      <option>Combo</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Target Segment</label>
                    <select 
                      value={newOffer.targeting}
                      onChange={(e) => setNewOffer({...newOffer, targeting: e.target.value})}
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    >
                      <option>All Customers</option>
                      <option>New Leads Only</option>
                      <option>Inactive (30+ days)</option>
                      <option>VIP Members</option>
                      <option>Birthday Month</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Discount Value</label>
                    <input 
                      type="number" 
                      value={newOffer.value}
                      onChange={(e) => setNewOffer({...newOffer, value: Number(e.target.value)})}
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Expiry Date</label>
                    <input 
                      type="date" 
                      value={newOffer.valid_to}
                      onChange={(e) => setNewOffer({...newOffer, valid_to: e.target.value})}
                      className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto p-6 border-t border-border/10 bg-secondary/10 flex gap-4">
               <button onClick={() => setIsSheetOpen(false)} className="flex-1 bg-background border border-border/50 text-foreground py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all">Discard</button>
               <button onClick={handleCreateOffer} className="flex-[2] gold-gradient text-primary-foreground py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                 <Zap className="w-4 h-4" /> Go Live Now
               </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default OffersManager;
