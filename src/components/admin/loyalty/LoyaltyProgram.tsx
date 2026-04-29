import { useState, useEffect } from "react";
import { 
  Award, Star, TrendingUp, Users, Plus, 
  Settings, ChevronRight, CheckCircle2, 
  Gift, Percent, Coffee, Crown, Filter
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

const LoyaltyProgram = () => {
  const [activeTiers, setActiveTiers] = useState<any[]>([]);
  const [loyalCustomers, setLoyalCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planValidity, setPlanValidity] = useState("365");

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    setLoading(true);
    
    // 1. Fetch Tier definitions
    const { data: tiers } = await supabase
      .from('membership_tiers')
      .select('*')
      .order('price', { ascending: true });

    // 2. Fetch Customer counts per tier
    const { data: customers } = await supabase
      .from('customers')
      .select('loyalty_level, full_name, total_spend, last_visit_at')
      .order('total_spend', { ascending: false });

    // Calculate counts for UI
    const tierCounts: Record<string, number> = {};
    customers?.forEach(c => {
      tierCounts[c.loyalty_level] = (tierCounts[c.loyalty_level] || 0) + 1;
    });

    const tierColors = {
      'Silver': 'bg-slate-400',
      'Gold': 'bg-yellow-500',
      'Platinum': 'bg-blue-400',
      'VIP': 'bg-primary'
    };

    const mappedTiers = (tiers || [
      { id: '1', name: 'Silver', price: 0, benefits: ["5% off everything"] },
      { id: '2', name: 'Gold', price: 5000, benefits: ["10% off services", "Birthday Special Treat"] },
      { id: '3', name: 'Platinum', price: 15000, benefits: ["15% off services", "Priority Booking"] },
      { id: '4', name: 'VIP', price: 50000, benefits: ["20% Flat Discount", "Free Valet"] }
    ]).map(t => ({
      ...t,
      color: tierColors[t.name as keyof typeof tierColors] || 'bg-slate-400',
      count: tierCounts[t.name] || 0
    }));

    setActiveTiers(mappedTiers);
    if (customers) {
      setLoyalCustomers(customers.slice(0, 5).map(c => ({
        name: c.full_name,
        loyalty_points: Math.floor(c.total_spend), // Using spend as points for now
        last_visit: c.last_visit_at || new Date().toISOString()
      })));
    }
    setLoading(false);
  };

  const handleCreatePlan = async () => {
    if (!planName || !planPrice) {
      toast.error("Please fill all required fields.");
      return;
    }

    setIsCreating(true);
    const { error } = await supabase.from("membership_tiers").insert({
      name: planName,
      price: Number(planPrice),
      validity_days: Number(planValidity),
      benefits: ["5% off everything", "Priority Booking"], // Default benefits for now
      points_multiplier: 1.0
    });

    setIsCreating(false);

    if (error) {
      toast.error(`Error creating plan: ${error.message}`);
    } else {
      toast.success("Membership plan created!");
      setIsSheetOpen(false);
      fetchLoyaltyData(); // Refresh list
      setPlanName("");
      setPlanPrice("");
      setPlanValidity("365");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Loyalty & Membership Engine</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage tiers, points, and exclusive benefits for repeat clients.</p>
        </div>
        <button 
          onClick={() => setIsSheetOpen(true)}
          className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> New Membership Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="glass rounded-2xl h-32 animate-pulse border border-border/50" />)
        ) : activeTiers.map((tier, i) => (
          <div key={i} className="glass rounded-2xl p-6 border border-border/50 text-center relative overflow-hidden group hover:border-primary/40 transition-all">
            <div className={`w-1.5 h-full absolute left-0 top-0 ${tier.color}`} />
            <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
            <p className="text-3xl font-bold text-foreground mb-4">{tier.count}</p>
            <div className="flex flex-col gap-2">
               <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Requirement: ₹{Number(tier.price).toLocaleString()}</p>
               <div className="flex justify-center gap-1 mt-2">
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  <span className="w-1 h-1 rounded-full bg-primary opacity-50" />
                  <span className="w-1 h-1 rounded-full bg-primary opacity-20" />
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <Crown className="w-4 h-4 text-primary" /> Tier Benefits & Configuration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {activeTiers.map((tier) => (
                  <div key={tier.id} className="glass rounded-2xl p-5 border border-border/50 hover:border-primary/30 transition-all group">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-lg ${tier.color} flex items-center justify-center text-white shadow-lg`}>
                              <Award className="w-4 h-4" />
                           </div>
                           <h4 className="text-sm font-bold">{tier.name} Perks</h4>
                        </div>
                        <button className="text-muted-foreground hover:text-primary"><Settings className="w-3.5 h-3.5" /></button>
                     </div>
                     <ul className="space-y-2">
                        {(tier.benefits || []).map((benefit: string, idx: number) => (
                           <li key={idx} className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                              <CheckCircle2 className="w-3 h-3 text-green-500" /> {benefit}
                           </li>
                        ))}
                     </ul>
                  </div>
               ))}
            </div>
         </div>

         <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-primary" /> Top Loyalists
            </h3>
            <div className="glass rounded-2xl border border-border/50 overflow-hidden shadow-xl">
               <div className="p-0">
                  {loyalCustomers.length === 0 ? (
                    <p className="p-8 text-center text-muted-foreground text-xs italic">Calculating membership rankings...</p>
                  ) : loyalCustomers.map((cust, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-secondary/10 border-b border-border/10 last:border-0 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                             i === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-secondary text-muted-foreground border border-border/30'
                          }`}>
                             #{i + 1}
                          </div>
                          <div>
                             <p className="text-xs font-bold">{cust.name}</p>
                             <p className="text-[9px] text-muted-foreground italic">Last: {new Date(cust.last_visit).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-bold text-primary">₹{cust.loyalty_points?.toLocaleString()}</p>
                          <div className={`text-[8px] font-bold uppercase tracking-widest ${
                             cust.loyalty_points >= 15000 ? 'text-blue-400' : 'text-yellow-500'
                          }`}>
                             LVL {i + 1}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-3 bg-secondary/20 text-center border-t border-border/10">
                  <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">View Global Leaderboard</button>
               </div>
            </div>
         </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto glass-strong border-l border-border/30 p-0">
          <div className="flex flex-col h-full">
            <div className="p-8">
              <SheetHeader className="mb-8">
                <SheetTitle className="text-2xl font-heading text-foreground">Membership Plan Builder</SheetTitle>
                <SheetDescription>Create a high-value membership strategy to boost retention.</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Plan Name & Branding</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Diamond VIP"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Spend Milestone / Price (₹)</label>
                      <input 
                        type="number" 
                        placeholder="25000"
                        value={planPrice}
                        onChange={(e) => setPlanPrice(e.target.value)}
                        className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Validity (Days)</label>
                      <select 
                        value={planValidity}
                        onChange={(e) => setPlanValidity(e.target.value)}
                        className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                      >
                         <option value="365">365 Days</option>
                         <option value="9999">Lifetime Access</option>
                         <option value="90">90 Days (Seasonal)</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tier Benefits</label>
                   <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Percent, label: "Discount %" },
                        { icon: Coffee, label: "Free Welcome Drink" },
                        { icon: Gift, label: "Birthday Vouchers" },
                        { icon: Award, label: "Free Services" },
                      ].map((benefit, i) => (
                         <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-secondary/20 hover:border-primary/30 transition-all cursor-pointer">
                            <benefit.icon className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-medium">{benefit.label}</span>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl flex items-start gap-3">
                   <Star className="w-5 h-5 text-primary" />
                   <p className="text-[10px] text-muted-foreground leading-relaxed italic font-medium">
                     * Tiers are automatically calculated based on real-time customer spending patterns. New plans will take effect for future transactions.
                   </p>
                </div>
              </div>
            </div>

            <div className="mt-auto p-6 border-t border-border/10 bg-secondary/10 flex gap-4">
               <button onClick={() => setIsSheetOpen(false)} className="flex-1 bg-background border border-border/50 text-foreground py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-all">Cancel</button>
               <button disabled={isCreating} onClick={handleCreatePlan} className="flex-[2] gold-gradient text-primary-foreground py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                 <CheckCircle2 className="w-4 h-4" /> {isCreating ? "Saving..." : "Activate Plan"}
               </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default LoyaltyProgram;
