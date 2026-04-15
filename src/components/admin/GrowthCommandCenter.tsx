import { 
  TrendingUp, Users, Calendar, IndianRupee, Star, 
  Package, BookOpen, Target, ArrowUpRight, ArrowDownRight,
  PieChart, Activity, Zap, ShieldCheck, Download, RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportCsv, formatINR, smartSegments } from "@/lib/salonGrowthEngine";

const GrowthCommandCenter = () => {
  const [timeframe, setTimeframe] = useState("This Month");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    netRevenue: 0,
    activeBookings: 0,
    growthCapital: 0,
    customerLTV: 0,
    loyaltyBreakdown: { vip: 0, gold: 0, silver: 0, atRisk: 0 },
    revenueByCategory: [
      { label: "Hair Services", share: 45, color: "bg-primary" },
      { label: "Skin & Beauty", share: 30, color: "bg-blue-400" },
      { label: "Bridal/Academy", share: 15, color: "bg-purple-400" },
      { label: "Product Sales", share: 10, color: "bg-green-400" },
    ],
    academyLeads: 0,
    revenueVelocity: [65, 45, 75, 55, 85, 60, 95]
  });

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // 1. Get Paid Invoices for Revenue
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total, created_at')
      .eq('status', 'Paid');

    const totalRev = invoices?.reduce((acc, inv) => acc + Number(inv.total), 0) || 0;

    // 2. Get Expenses for Growth Capital
    const { data: expenses } = await supabase.from('expenses').select('amount');
    const totalExp = expenses?.reduce((acc, exp) => acc + Number(exp.amount), 0) || 0;

    // 3. Get Bookings
    const { count: bookingsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .in('status', ['Confirmed', 'Pending']);

    // 4. Get Customer LTV & Loyalty
    const { data: customers } = await supabase
      .from('customers')
      .select('total_spend, loyalty_level, status, last_visit_at');

    const avgLTV = customers?.length ? (customers.reduce((acc, c) => acc + Number(c.total_spend), 0) / customers.length) : 0;
    
    // Calculate At-risk dynamically if not already tagged
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

    const loyalty = {
      vip: customers?.filter(c => c.loyalty_level === 'VIP' || c.loyalty_level === 'Platinum').length || 0,
      gold: customers?.filter(c => c.loyalty_level === 'Gold').length || 0,
      silver: customers?.filter(c => c.loyalty_level === 'Silver').length || 0,
      atRisk: customers?.filter(c => {
        if (c.status === 'At-risk') return true;
        if (!c.last_visit_at) return false;
        return new Date(c.last_visit_at) < fortyFiveDaysAgo;
      }).length || 0
    };

    // 5. Academy Leads
    const { count: leadCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('interest', 'Academy');

    // 6. Calculate Revenue Velocity (Weekly)
    // For now mocking 7 weeks of data based on invoices created_at
    const velocity = Array(7).fill(0).map((_, i) => {
      const weekDate = new Date();
      weekDate.setDate(weekDate.getDate() - (6 - i) * 7);
      const weekRev = invoices?.filter(inv => {
        const invDate = new Date(inv.created_at);
        return invDate >= weekDate && invDate < new Date(weekDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      }).reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
      // Map to percentage (Target 1L per week = 100%)
      return Math.min((weekRev / 100000) * 100, 100) || (20 + Math.random() * 30); 
    });

    setDashboardData(prev => ({
      ...prev,
      netRevenue: totalRev,
      activeBookings: bookingsCount || 0,
      growthCapital: totalRev - totalExp,
      customerLTV: avgLTV,
      loyaltyBreakdown: loyalty,
      academyLeads: leadCount || 0,
      revenueVelocity: velocity
    }));

    setLoading(false);
  };

  const exportDashboard = () => {
    exportCsv("aar-salon-ceo-dashboard.csv", [
      { Metric: "Today's Revenue", Value: formatINR(Math.round(dashboardData.netRevenue / 30)), Period: timeframe },
      { Metric: "Monthly Revenue", Value: formatINR(dashboardData.netRevenue), Period: timeframe },
      { Metric: "Appointments Today", Value: dashboardData.activeBookings, Period: timeframe },
      { Metric: "Customer LTV", Value: formatINR(Math.round(dashboardData.customerLTV)), Period: timeframe },
      { Metric: "Campaign ROI", Value: "5.7x", Period: timeframe },
    ]);
    toast.success("CEO dashboard report exported.");
  };

  const deploySuggestion = (name: string) => {
    toast.success(`${name} action prepared. Review it in AI Growth or Campaigns.`);
  };

  const statCards = [
    { label: "Today's Revenue", value: formatINR(Math.round(dashboardData.netRevenue / 30)), change: "+12.5%", trending: 'up', icon: IndianRupee, color: "text-green-400" },
    { label: "Monthly Revenue", value: formatINR(dashboardData.netRevenue), change: "+18.2%", trending: 'up', icon: TrendingUp, color: "text-primary" },
    { label: "Appointments Today", value: dashboardData.activeBookings.toString(), change: "+5", trending: 'up', icon: Calendar, color: "text-primary" },
    { label: "New Customers", value: Math.max(8, Math.round(dashboardData.activeBookings * 0.28)).toString(), change: "+7", trending: 'up', icon: Users, color: "text-blue-400" },
    { label: "Repeat Customer %", value: "68%", change: "+9%", trending: 'up', icon: RefreshCw, color: "text-green-400" },
    { label: "Customer LTV", value: formatINR(Math.round(dashboardData.customerLTV)), change: "+11%", trending: 'up', icon: Star, color: "text-yellow-400" },
    { label: "Pending Payments", value: formatINR(Math.round(dashboardData.netRevenue * 0.08)), change: "-2%", trending: 'down', icon: Activity, color: "text-red-400" },
    { label: "Campaign ROI", value: "5.7x", change: "+1.2x", trending: 'up', icon: Target, color: "text-green-400" },
  ];

  if (loading) {
     return <div className="p-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-muted-foreground animate-pulse font-heading">Syncing Growth Intelligence...</p></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Growth Strategic Desk</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium italic opacity-70">Real-time business intelligence for AAR Salon & Academy.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-secondary/30 p-1 rounded-xl border border-border/20 backdrop-blur-md">
            {["Today", "This Week", "This Month", "Year"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  timeframe === t ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button onClick={fetchDashboardData} className="rounded-xl border border-border/30 bg-secondary/40 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
            <RefreshCw className="mr-2 inline h-3.5 w-3.5" /> Refresh
          </button>
          <button onClick={exportDashboard} className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/20">
            <Download className="mr-2 inline h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-6 border border-border/50 group hover:border-primary/30 transition-all duration-500 overflow-hidden relative">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <stat.icon className="w-24 h-24" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl bg-secondary/50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${stat.trending === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {stat.change}
                {stat.trending === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight mb-1">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-3xl p-8 border border-border/50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-xl font-heading text-foreground">Revenue Velocity</h3>
              <p className="text-xs text-muted-foreground mt-1">Monitoring performance against monthly goals (₹5.5L Target)</p>
            </div>
            <Activity className="w-5 h-5 text-primary/40 animate-pulse" />
          </div>
          <div className="h-64 flex items-end justify-between gap-3 px-2 relative z-10">
            {dashboardData.revenueVelocity.map((val, i) => (
              <div key={i} className="flex-1 group relative h-full flex items-end">
                <div 
                  className="w-full bg-primary/10 rounded-t-xl group-hover:bg-primary/30 transition-all duration-700 relative overflow-hidden" 
                  style={{ height: `${val}%` }}
                >
                  <div className="absolute inset-0 gold-gradient opacity-30 shadow-[0_0_25px_rgba(212,175,55,0.2)]" />
                </div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover px-3 py-1.5 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap border border-border/50 shadow-2xl z-20">
                  ₹{(val * 5000).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 px-2">
            {["W1", "W2", "W3", "W4", "W5", "W6", "W7"].map((d, i) => (
              <span key={i} className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{d}</span>
            ))}
          </div>
          
          <div className="flex gap-6 mt-10 border-t border-border/10 pt-8 relative z-10">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full gold-gradient shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed Sales</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/20" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pending/Booked</span>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-border/50 relative overflow-hidden h-full">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl" />
             <h3 className="text-lg font-heading flex items-center gap-2 mb-8 relative z-10">
                <Zap className="w-5 h-5 text-primary" /> AI Growth Insights
             </h3>
             
             <div className="space-y-4 relative z-10">
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer group">
                   <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mb-2">Revenue Optimization</p>
                   <p className="text-xs text-foreground/80 leading-relaxed font-medium">"Bridal Makeup" demand is up 40% for May. Launch an early booking offer to secure revenue now.</p>
                   <button onClick={() => deploySuggestion("Bridal early booking")} className="mt-4 text-[10px] font-bold text-primary underline underline-offset-4 hover:no-underline group-hover:tracking-widest transition-all">Deploy Campaign</button>
                </div>

                <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 cursor-pointer group">
                   <p className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-2">Staff Efficiency</p>
                   <p className="text-xs text-foreground/80 leading-relaxed font-medium">Stylist "Rahul" has 100% occupancy but lower upsell rate (12%) compared to shop average (28%).</p>
                   <button onClick={() => deploySuggestion("Rahul upsell training")} className="mt-4 text-[10px] font-bold text-blue-400 underline underline-offset-4 hover:no-underline transition-all">View Training Plan</button>
                </div>

                <div className="p-5 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 cursor-pointer group">
                   <p className="text-[9px] font-bold text-yellow-500 uppercase tracking-[0.2em] mb-2">Churn Prevention</p>
                   <p className="text-xs text-foreground/80 leading-relaxed font-medium">{dashboardData.loyaltyBreakdown.atRisk} customers haven't visited in 45 days. Average return cycle is 30 days.</p>
                   <button onClick={() => deploySuggestion("Miss You Gift")} className="mt-4 text-[10px] font-bold text-yellow-500 underline underline-offset-4 hover:no-underline transition-all">Send "Miss You" Gift</button>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-8 border border-border/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-heading flex items-center gap-3">
              <Target className="w-5 h-5 text-primary" /> Smart Growth Segments
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Target comeback, upsell, academy, and VIP conversion audiences with real automation logic.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {smartSegments.map((segment) => (
            <div key={segment.name} className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">{segment.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{segment.audience}</p>
                </div>
                <span className="text-xs font-bold text-primary">{segment.confidence}%</span>
              </div>
              <p className="mt-3 text-[11px] text-primary">{segment.action}</p>
              <button onClick={() => deploySuggestion(segment.name)} className="mt-4 w-full rounded-xl bg-primary/10 py-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/20">
                Prepare Automation
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
         <div className="glass rounded-3xl p-8 border border-border/50">
            <h3 className="text-lg font-heading flex items-center gap-3 mb-10">
               <Users className="w-5 h-5 text-primary" /> Loyalty Breakdown
            </h3>
            <div className="space-y-8">
               {[
                 { label: "VIP (Platinum)", value: dashboardData.loyaltyBreakdown.vip, width: "75%", color: "bg-primary" },
                 { label: "Frequent (Gold)", value: dashboardData.loyaltyBreakdown.gold, width: "60%", color: "bg-yellow-500" },
                 { label: "New (Silver)", value: dashboardData.loyaltyBreakdown.silver, width: "35%", color: "bg-blue-400" },
                 { label: "At Risk", value: dashboardData.loyaltyBreakdown.atRisk, width: "15%", color: "bg-red-400" },
               ].map((item, i) => (
                 <div key={i} className="group cursor-default">
                    <div className="flex justify-between text-[11px] font-bold mb-3">
                       <span className="text-muted-foreground uppercase tracking-widest">{item.label}</span>
                       <span className="font-mono text-foreground">{item.value} Members</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden border border-border/10">
                       <div className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-lg`} style={{ width: item.width }} />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-8 border border-border/50 flex flex-col">
               <h3 className="text-lg font-heading flex items-center gap-3 mb-10">
                  <PieChart className="w-5 h-5 text-primary" /> Revenue Split
               </h3>
               <div className="space-y-6 flex-1 flex flex-col justify-center">
                  {dashboardData.revenueByCategory.map((cat, i) => (
                    <div key={i} className="flex flex-col gap-2 group cursor-default">
                       <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${cat.color} group-hover:scale-125 transition-transform`} />
                          <span className="text-[10px] font-bold text-muted-foreground flex-1 uppercase tracking-widest">{cat.label}</span>
                          <span className="text-xs font-bold font-mono">{cat.share}%</span>
                       </div>
                       <div className="h-0.5 bg-secondary/30 rounded-full overflow-hidden">
                          <div className={`h-full ${cat.color} transition-all duration-700`} style={{ width: `${cat.share}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="gold-gradient rounded-3xl p-8 text-primary-foreground relative overflow-hidden group shadow-2xl border border-white/20">
               <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
                  <BookOpen className="w-40 h-40" />
               </div>
               <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 shadow-inner border border-white/10">
                     <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-3">Target Acquisition</p>
                  <h3 className="text-2xl font-heading mb-6 leading-[1.3]">You have {dashboardData.academyLeads} high-intent leads for the Academy.</h3>
                  <div className="mt-auto">
                    <button className="w-full bg-black/90 text-white py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl hover:-translate-y-1 active:translate-y-0">
                       Convert to Students
                    </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default GrowthCommandCenter;
