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

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    setLoading(true);
    // In a real app, fetch from 'membership_plans' and 'customers' (ordered by points)
    const mockTiers = [
      { id: '1', name: "Silver", color: "bg-slate-400", count: 142, points_needed: 1000, benefits: ["5% off everything", "Refined queue"] },
      { id: '2', name: "Gold", color: "bg-yellow-500", count: 86, points_needed: 5000, benefits: ["10% off services", "Birthday Special Treat", "Priority Booking"] },
      { id: '3', name: "Platinum", color: "bg-blue-400", count: 34, points_needed: 15000, benefits: ["15% off services", "Free Cleanup every 3 visits", "Personal Concierge"] },
      { id: '4', name: "VIP Elite", color: "bg-primary", count: 12, points_needed: 50000, benefits: ["20% Flat Discount", "Free Valet", "Lifetime validity"] },
    ];
    
    const { data: customers } = await supabase
      .from('customers')
      .select('name, loyalty_points, last_visit')
      .order('loyalty_points', { ascending: false })
      .limit(5);

    setActiveTiers(mockTiers);
    if (customers) setLoyalCustomers(customers);
    setLoading(false);
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
        {activeTiers.map((tier, i) => (
          <div key={i} className="glass rounded-2xl p-6 border border-border/50 text-center relative overflow-hidden group hover:border-primary/40 transition-all">
            <div className={`w-2 h-full absolute left-0 top-0 ${tier.color}`} />
            <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
            <p className="text-3xl font-bold text-foreground mb-4">{tier.count}</p>
            <div className="flex flex-col gap-2">
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Starts at {tier.points_needed} Points</p>
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
                           <div className={`w-8 h-8 rounded-lg ${tier.color} flex items-center justify-center text-white`}>
                              <Award className="w-4 h-4" />
                           </div>
                           <h4 className="text-sm font-bold">{tier.name} Perks</h4>
                        </div>
                        <button className="text-muted-foreground hover:text-primary"><Settings className="w-3.5 h-3.5" /></button>
                     </div>
                     <ul className="space-y-2">
                        {tier.benefits.map((benefit: string, idx: number) => (
                           <li key={idx} className="flex items-center gap-2 text-[10px] text-muted-foreground">
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
            <div className="glass rounded-2xl border border-border/50 overflow-hidden">
               <div className="p-0">
                  {loyalCustomers.length === 0 ? (
                    <p className="p-8 text-center text-muted-foreground text-xs italic">Calculating membership rankings...</p>
                  ) : loyalCustomers.map((cust, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-secondary/10 border-b border-border/10 last:border-0 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                             i === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-secondary text-muted-foreground'
                          }`}>
                             #{i + 1}
                          </div>
                          <div>
                             <p className="text-xs font-bold">{cust.name}</p>
                             <p className="text-[9px] text-muted-foreground">Last visit: {new Date(cust.last_visit).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-bold text-primary">{cust.loyalty_points?.toLocaleString()} PTS</p>
                          <div className={`text-[8px] font-bold uppercase tracking-widest ${
                             cust.loyalty_points >= 15000 ? 'text-blue-400' : 'text-yellow-500'
                          }`}>
                             {cust.loyalty_points >= 15000 ? 'Platinum' : 'Gold'}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-3 bg-secondary/20 text-center border-t border-border/10">
                  <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">View Leaderboard</button>
               </div>
            </div>
         </div>
      </div>

      {/* New Membership Plan Sheet */}
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
                    className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Spend Milestone (₹)</label>
                      <input 
                        type="number" 
                        placeholder="25,000"
                        className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Validity (Days)</label>
                      <select className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none">
                         <option>365 Days</option>
                         <option>Lifetime Access</option>
                         <option>90 Days (Seasonal)</option>
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
                   <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                     * Tiers are automatically calculated at 12 AM every day based on customer spending patterns over the last 12 months.
                   </p>
                </div>
              </div>
            </div>

            <div className="mt-auto p-6 border-t border-border/10 bg-secondary/10 flex gap-4">
               <button onClick={() => setIsSheetOpen(false)} className="flex-1 bg-background border border-border/50 text-foreground py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all">Cancel</button>
               <button onClick={() => {toast.success("Membership plan created!"); setIsSheetOpen(false);}} className="flex-[2] gold-gradient text-primary-foreground py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                 <CheckCircle2 className="w-4 h-4" /> Activate Plan
               </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default LoyaltyProgram;
