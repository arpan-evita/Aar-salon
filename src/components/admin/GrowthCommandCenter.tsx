import { 
  TrendingUp, Users, Calendar, IndianRupee, Star, 
  Package, BookOpen, Target, ArrowUpRight, ArrowDownRight,
  PieChart, Activity, Zap, ShieldCheck
} from "lucide-react";
import { useState } from "react";

const GrowthCommandCenter = () => {
  const [timeframe, setTimeframe] = useState("Today");

  const stats = [
    { label: "Net Revenue", value: "₹12,450", change: "+12.5%", trending: 'up', icon: IndianRupee, color: "text-green-400" },
    { label: "Active Appointments", value: "18", change: "+5", trending: 'up', icon: Calendar, color: "text-primary" },
    { label: "Growth Capital", value: "₹2,50,000", change: "+₹15k", trending: 'up', icon: Activity, color: "text-blue-400" },
    { label: "Customer LTV", value: "₹4,200", change: "-2%", trending: 'down', icon: Star, color: "text-yellow-400" },
  ];

  const categories = [
    { label: "Hair Services", share: 45, color: "bg-primary" },
    { label: "Skin & Beauty", share: 30, color: "bg-blue-400" },
    { label: "Bridal/Academy", share: 15, color: "bg-purple-400" },
    { label: "Product Sales", share: 10, color: "bg-green-400" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Growth Strategic Desk</h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time business intelligence for AAR Salon & Academy.</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-xl border border-border/20 backdrop-blur-md">
          {["Today", "This Week", "This Month"].map((t) => (
            <button 
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${
                timeframe === t ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-secondary text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Strategic Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <stat.icon className="w-24 h-24" />
            </div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={`p-3 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                stat.trending === 'up' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
              }`}>
                {stat.trending === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight mb-1">{stat.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Analytics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-8 border border-border/50 relative overflow-hidden h-[420px]">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                 <h3 className="font-heading text-xl">Revenue Velocity</h3>
                 <p className="text-xs text-muted-foreground">Monitoring performance against monthly goals (₹5.5L Target)</p>
              </div>
              <PieChart className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            </div>
            
            <div className="h-64 flex items-end justify-between gap-4 px-2 relative z-10">
              {[40, 65, 45, 90, 55, 75, 85, 60, 95, 80, 70, 85].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="w-full relative h-[180px] flex items-end">
                     <div 
                       className="w-full bg-primary/10 rounded-t-xl group-hover:bg-primary/20 transition-all duration-500" 
                       style={{ height: `${val}%` }} 
                     />
                     <div 
                       className="absolute bottom-0 left-0 w-full gold-gradient rounded-t-xl transition-all duration-1000 delay-300 shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
                       style={{ height: `${val * 0.7}%` }} 
                     />
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-0 group-hover:opacity-100 transition-opacity">W{i+1}</span>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex gap-6 mt-8 relative z-10">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full gold-gradient" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed Sales</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary/20" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pending/Booked</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass rounded-2xl p-6 border border-border/50">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                   <Users className="w-4 h-4 text-primary" /> Loyalty Breakdown
                </h4>
                <div className="space-y-4">
                   {[
                      { label: "VIP (Platinum)", count: 24, percent: 12, color: "bg-primary" },
                      { label: "Frequent (Gold)", count: 86, percent: 45, color: "bg-yellow-500" },
                      { label: "New (Silver)", count: 42, percent: 22, color: "bg-slate-400" },
                      { label: "At Risk", count: 15, percent: 8, color: "bg-red-400" },
                   ].map(tier => (
                      <div key={tier.label} className="space-y-1.5">
                         <div className="flex justify-between text-[11px] font-bold">
                            <span>{tier.label}</span>
                            <span>{tier.count}</span>
                         </div>
                         <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className={`h-full ${tier.color} transition-all duration-1000`} style={{ width: `${tier.percent}%` }} />
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="glass rounded-2xl p-6 border border-border/50">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                   <Target className="w-4 h-4 text-blue-400" /> Revenue by Category
                </h4>
                <div className="space-y-6">
                   {categories.map(cat => (
                      <div key={cat.label} className="flex items-center gap-4">
                         <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                         <div className="flex-1">
                            <div className="flex justify-between text-[11px] font-bold mb-1">
                               <span>{cat.label}</span>
                               <span>{cat.share}%</span>
                            </div>
                            <div className="h-1 bg-secondary/50 rounded-full">
                               <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.share}%` }} />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Growth Sidebars */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 border border-border/50">
            <h3 className="font-heading text-lg mb-6 flex items-center gap-2">
               <Zap className="w-5 h-5 text-primary" /> AI Growth Insights
            </h3>
            <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 group hover:border-primary transition-all cursor-pointer">
                   <p className="text-[10px] font-bold text-primary uppercase mb-2">Revenue Optimization</p>
                   <p className="text-xs text-foreground/80 leading-relaxed mb-3">
                      "Bridal Makeup" demand is up 40% for May. Launch an early booking offer to secure revenue now.
                   </p>
                   <button className="text-[10px] font-bold underline hover:no-underline">Deploy Campaign</button>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 group hover:border-blue-500 transition-all cursor-pointer">
                   <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">Staff Efficiency</p>
                   <p className="text-xs text-foreground/80 leading-relaxed mb-3">
                      Stylist "Rahul" has 100% occupancy but lower upsell rate (12%) compared to shop average (28%).
                   </p>
                   <button className="text-[10px] font-bold underline hover:no-underline">View Training Plan</button>
                </div>

                <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 group hover:border-yellow-500 transition-all cursor-pointer">
                   <p className="text-[10px] font-bold text-yellow-500 uppercase mb-2">Churn Prevention</p>
                   <p className="text-xs text-foreground/80 leading-relaxed mb-3">
                      12 VIP customers haven't visited in 45 days. Average return cycle is 30 days.
                   </p>
                   <button className="text-[10px] font-bold underline hover:no-underline">Send "Miss You" Gift</button>
                </div>
            </div>
          </div>
          
          <div className="gold-gradient rounded-3xl p-8 text-primary-foreground relative overflow-hidden group border border-white/20 shadow-2xl shadow-primary/20">
             <div className="absolute top-0 right-0 p-3">
                <ShieldCheck className="w-8 h-8 opacity-20" />
             </div>
             <div className="relative z-10">
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Academy Integration</p>
               <h4 className="text-2xl font-heading leading-tight mb-4">You have 8 high-intent leads for "Bridal Masterclass".</h4>
               <p className="text-xs opacity-90 mb-6 leading-relaxed">
                  Projected Revenue from this batch: ₹2,40,000. Follow up with 3 leads who clicked the SMS link.
               </p>
               <button className="bg-primary-foreground text-primary px-8 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:shadow-xl transition-all w-full md:w-auto">
                 Convert to Students
               </button>
             </div>
             <BookOpen className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthCommandCenter;
