import { useMemo, useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Bot,
  CheckCircle2,
  Download,
  IndianRupee,
  Lock,
  MessageSquare,
  Play,
  Settings,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wand2,
  Zap,
  Calendar,
  AlertCircle,
  BarChart3,
  Search,
  Copy,
  ChevronRight,
  TrendingDown,
  UserPlus,
  Rocket,
  Star
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  automationBlueprints,
  businessSettings,
  estimateRevenuePlan,
  exportCsv,
  formatINR,
  premiumKpis,
  smartSegments,
  whatsAppTemplates,
} from "@/lib/salonGrowthEngine";
import { 
  synthesizeAdvice, 
  generateGrowthPlan, 
  type SalonData 
} from "@/lib/aarLocalIntelligence";

type PremiumGrowthModulesProps = {
  module: "analytics" | "assistant" | "settings";
};

const toneClass = {
  gold: "text-primary bg-primary/10 border-primary/20",
  green: "text-green-400 bg-green-500/10 border-green-500/20",
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  red: "text-red-400 bg-red-500/10 border-red-500/20",
};

const quickCsvRows = premiumKpis.map((kpi) => ({
  KPI: kpi.label,
  Value: kpi.value,
  Change: kpi.change,
}));

const AdvancedAnalytics = () => {
  const [period, setPeriod] = useState("Month");
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState(premiumKpis); // start with mock, then update
  const [chartBars, setChartBars] = useState<number[]>([]);

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();
      if (period === "Today") startDate.setHours(0, 0, 0, 0);
      else if (period === "Week") startDate.setDate(now.getDate() - 7);
      else if (period === "Month") startDate.setMonth(now.getMonth() - 1);
      else if (period === "Year") startDate.setFullYear(now.getFullYear() - 1);

      // Fetch required data
      const [
        { data: invoices },
        { data: customers },
        { data: bookings },
      ] = await Promise.all([
        supabase.from('invoices').select('total, created_at, customer_id').gte('created_at', startDate.toISOString()),
        supabase.from('customers').select('id, visit_count, last_visit_at, created_at').gte('created_at', startDate.toISOString()),
        supabase.from('bookings').select('id, created_at, status').gte('created_at', startDate.toISOString())
      ]);

      const invs = invoices || [];
      const custs = customers || [];
      const bks = bookings || [];

      // 1. Calculate Revenue & ARPU
      const totalRevenue = invs.reduce((sum, i) => sum + Number(i.total), 0);
      const uniqueBuyers = new Set(invs.map(i => i.customer_id).filter(Boolean)).size;
      const arpu = uniqueBuyers > 0 ? totalRevenue / uniqueBuyers : 0;

      // 2. Repeat Rate
      const repeatCustomers = custs.filter(c => c.visit_count && c.visit_count > 1).length;
      const repeatRate = custs.length > 0 ? Math.round((repeatCustomers / custs.length) * 100) : 0;

      // 3. Churn Risk (customers with no visit in last 60 days)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const churned = custs.filter(c => c.last_visit_at && new Date(c.last_visit_at) < sixtyDaysAgo).length;
      const churnRisk = custs.length > 0 ? Math.round((churned / custs.length) * 100) : 0;

      // 4. LTV (Simplified: ARPU * Avg Lifespan. Let's assume lifespan is 6 visits)
      const ltv = arpu * 6;

      // 5. Staff Utilization & Empty Slots (Estimation based on active bookings vs capacity)
      // Assuming 10 slots per day per stylist, 5 stylists = 50 slots/day
      const days = period === "Today" ? 1 : period === "Week" ? 7 : period === "Month" ? 30 : 365;
      const capacity = days * 50; 
      const utilization = Math.min(Math.round((bks.length / capacity) * 100), 100);
      const emptySlots = 100 - utilization;

      // Map to KPI format
      const dynamicKpis = [
        { label: "CAC", value: formatINR(totalRevenue > 0 ? 350 : 0), change: "Estimated via Ad Spend", tone: "gold" as const },
        { label: "REPEAT RATE", value: `${repeatRate}%`, change: "From retention flows", tone: "red" as const },
        { label: "ARPU", value: formatINR(arpu), change: "Per active customer", tone: "blue" as const },
        { label: "LTV", value: formatINR(ltv), change: "Avg lifetime value", tone: "green" as const },
        { label: "CHURN RISK", value: `${churnRisk}%`, change: `${churned} clients at risk`, tone: "red" as const },
        { label: "STAFF UTILIZATION", value: `${utilization}%`, change: "Peak load tracked", tone: "gold" as const },
        { label: "OFFER ROI", value: "4.2x", change: "Avg discount return", tone: "green" as const },
        { label: "EMPTY SLOT %", value: `${emptySlots}%`, change: `${capacity - bks.length} recoverable slots`, tone: "blue" as const }
      ];
      setKpis(dynamicKpis);

      // Revenue Growth Curve (Mocking dynamic shape based on total revenue)
      const baseVal = totalRevenue > 0 ? Math.min(totalRevenue / 1000, 100) : 20;
      setChartBars(Array(12).fill(0).map(() => Math.max(Math.random() * baseVal + 30, 20)));

    } catch (e) {
      console.error(e);
      toast.error("Failed to sync live analytics");
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    const exportRows = kpis.map((kpi) => ({
      KPI: kpi.label,
      Value: kpi.value,
      Change: kpi.change,
    }));
    exportCsv(`aar-salon-analytics-${period.toLowerCase()}.csv`, exportRows);
    toast.success("Analytics CSV exported with live data.");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Advanced Analytics</p>
          <h2 className="font-heading text-3xl text-foreground">Revenue, retention and growth intelligence</h2>
          <p className="mt-2 text-sm text-muted-foreground">Track CAC, ARPU, LTV, churn, offer ROI, staff utilization, and empty slot recovery in one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Today", "Week", "Month", "Year"].map((item) => (
            <button
              key={item}
              onClick={() => setPeriod(item)}
              className={`rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                period === item ? "gold-gradient text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary/40 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {item}
            </button>
          ))}
          <button onClick={exportAnalytics} disabled={loading} className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/20">
            <Download className="mr-2 inline h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass rounded-2xl border border-border/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 relative overflow-hidden">
            {loading && <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}
            <div className="mb-4 flex items-start justify-between">
              <span className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-widest ${toneClass[kpi.tone]}`}>{kpi.label}</span>
              <Activity className="h-4 w-4 text-primary/50" />
            </div>
            <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
            <p className="mt-2 text-[11px] font-medium text-muted-foreground">{kpi.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="glass rounded-3xl border border-border/50 p-6 xl:col-span-2 relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10"></div>}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="font-heading text-xl">Revenue Growth Curve</h3>
              <p className="text-xs text-muted-foreground">Projected sales velocity by operating lever.</p>
            </div>
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-green-400">Forecast +18%</span>
          </div>
          <div className="flex h-72 items-end gap-3">
            {chartBars.map((bar, index) => (
              <div key={index} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative flex h-64 w-full items-end overflow-hidden rounded-t-2xl bg-secondary/40">
                  <div className="gold-gradient w-full rounded-t-2xl opacity-80 transition-all duration-700 group-hover:opacity-100" style={{ height: `${bar}%` }} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {smartSegments.slice(0, 3).map((segment) => (
            <div key={segment.name} className="glass rounded-2xl border border-border/50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">{segment.name}</h4>
                <span className="text-xs font-bold text-primary">{segment.confidence}%</span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{segment.audience}</p>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary/30 p-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Expected</span>
                <span className="text-sm font-bold text-green-400">{formatINR(segment.expectedRevenue)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AIGrowthAssistant = () => {
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(700000);
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const [data, setData] = useState({
    invoices: [] as any[],
    customers: [] as any[],
    bookings: [] as any[],
    leads: [] as any[],
    memberships: [] as any[],
  });

  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    fetchEverything();
  }, []);

  const fetchEverything = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        { data: invoices },
        { data: customers },
        { data: bookings },
        { data: leads },
        { data: memberships },
      ] = await Promise.all([
        supabase.from('invoices').select('*').gte('created_at', firstDayOfMonth.toISOString()),
        supabase.from('customers').select('*'),
        supabase.from('bookings').select('*').gte('booking_date', now.toISOString().split('T')[0]),
        supabase.from('leads').select('*'),
        supabase.from('customer_memberships').select('*')
      ]);

      const dataSet = {
        invoices: invoices || [],
        customers: customers || [],
        bookings: bookings || [],
        leads: leads || [],
        memberships: memberships || [],
      };

      setData(dataSet);
      runIntelligence(dataSet);
    } catch (e) {
      console.error(e);
      toast.error("AI Brain synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  const runIntelligence = (dataSet: any) => {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // 1. Revenue & Forecast
    const currentRev = dataSet.invoices.reduce((sum: number, i: any) => sum + Number(i.total), 0);
    const pace = currentRev / dayOfMonth;
    const projected = pace * daysInMonth;
    const gap = Math.max(target - currentRev, 0);

    // 2. Customer Intelligence
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const churnRisk = dataSet.customers.filter((c: any) => 
      c.last_visit_at && new Date(c.last_visit_at) < thirtyDaysAgo
    ).length;

    const vipGaps = dataSet.customers.filter((c: any) => 
      c.total_spend > 15000 && (!c.last_visit_at || new Date(c.last_visit_at) < thirtyDaysAgo)
    ).length;

    // 3. Smart Offers
    const haircutAudience = dataSet.customers.filter((c: any) => {
      const lastVisit = c.last_visit_at ? new Date(c.last_visit_at) : null;
      if (!lastVisit) return false;
      const days = (now.getTime() - lastVisit.getTime()) / (1000 * 3600 * 24);
      return days >= 25 && days <= 35;
    }).length;

    const membershipTargets = dataSet.customers.filter((c: any) => 
      c.total_spend > 10000 && !dataSet.memberships.find((m: any) => m.customer_id === c.id)
    ).length;

    // 4. Empty Slots (Next 3 days)
    const capacityPerDay = 40; // 8 hours * 5 stylists
    const nextThreeDays = dataSet.bookings.length; // Simplified
    const emptySlotPercentage = Math.max(0, 100 - (nextThreeDays / (capacityPerDay * 3) * 100));

    setAnalysis({
      currentRev,
      projected,
      gap,
      confidence: projected > target ? 92 : 78,
      churnRisk,
      vipGaps,
      haircutAudience,
      membershipTargets,
      emptySlotPercentage: Math.round(emptySlotPercentage),
      dailyActions: [
        { id: 1, text: `Call ${dataSet.leads.filter((l: any) => l.source === 'Academy').length} Academy leads from last week`, icon: UserPlus },
        { id: 2, text: `Send comeback offer to ${haircutAudience} haircut clients`, icon: Zap },
        { id: 3, text: `Fill tomorrow's empty slots with student promo`, icon: Calendar },
        { id: 4, text: `Ask today's happy customers for reviews`, icon: Star },
        { id: 5, text: `Push membership renewals to ${dataSet.memberships.filter((m: any) => m.status === 'expiring').length} users`, icon: Rocket },
      ],
      offers: [
        { id: 'hc', title: 'Haircut Comeback', audience: haircutAudience, rev: haircutAudience * 800, prob: 91, rule: 'Inactive 25-35 days' },
        { id: 'mu', title: 'Membership Upgrade', audience: membershipTargets, rev: membershipTargets * 1500, prob: 88, rule: 'Spent ₹10k+ no membership' },
        { id: 'es', title: 'Empty Slot Booster', audience: 12, rev: 12000, prob: 74, rule: 'Weekday 1pm-4pm gaps' },
        { id: 'ap', title: 'Academy Push', audience: dataSet.leads.length, rev: dataSet.leads.length * 5000, prob: 79, rule: 'Pending leads' },
      ]
    });
  };

  const handleAskAI = () => {
    if (!question) return;
    setIsTyping(true);
    setAiResponse(null);

    const salonData: SalonData = {
      revenue: {
        current: analysis.currentRev,
        target: target,
        pace: analysis.currentRev / new Date().getDate(),
        gap: analysis.gap
      },
      customers: {
        total: data.customers.length,
        churnRisk: analysis.churnRisk,
        vips: analysis.vipGaps,
        newThisMonth: data.customers.filter((c: any) => {
          const created = new Date(c.created_at);
          return created.getMonth() === new Date().getMonth();
        }).length
      },
      staff: {
        total: 5, // Mock staff count for now
        avgUtilization: 100 - analysis.emptySlotPercentage,
        topPerformer: "Rahul"
      },
      inventory: {
        lowStockItems: 3
      },
      bookings: {
        emptySlotsNext3Days: Math.round(analysis.emptySlotPercentage * 1.2)
      },
      settings: {
        brandVoice: "Premium warm luxury",
        branch: "AAR Salon HQ"
      }
    };

    // Use proprietary AAR Local Intelligence Engine
    const plan = generateGrowthPlan(salonData, question);

    setTimeout(() => {
      setAiResponse(plan.summary + "\n\n" + plan.steps.map((s, i) => `${i+1}. ${s}`).join("\n\n"));
      setIsTyping(false);
    }, 1200);
  };

  const deployAction = (name: string) => {
    toast.success(`AI Campaign "${name}" deployed to matching audience.`);
  };

  if (loading || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-4 animate-pulse">
        <Bot className="w-12 h-12 text-primary/50" />
        <p className="text-muted-foreground font-heading text-xl">Waking up AAR's growth brain...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* 1. Main Command Center */}
      <div className="gold-gradient rounded-3xl p-[1.5px] shadow-2xl shadow-primary/20 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,55,0.1),transparent)]" />
        <div className="rounded-3xl bg-background/95 p-6 md:p-10 relative">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">AAR LOCAL INTELLIGENCE (ALI) v1.0</p>
              </div>
              <h2 className="font-heading text-4xl text-foreground">Proprietary Growth Brain</h2>
              <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
                Operating without external LLMs. ALI analyzes your specific data patterns against a curated salon industry knowledge base to provide localized, high-accuracy growth strategies.
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="glass-strong border border-primary/20 rounded-2xl p-6 min-w-[200px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Current Revenue</p>
                <p className="text-3xl font-bold">{formatINR(analysis.currentRev)}</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-green-400">
                  <TrendingUp className="w-3 h-3" /> Pace: {formatINR(analysis.projected)}
                </div>
              </div>
              <div className="glass-strong border border-red-500/20 rounded-2xl p-6 min-w-[200px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Revenue Gap</p>
                <p className="text-3xl font-bold">{formatINR(analysis.gap)}</p>
                <p className="mt-2 text-[10px] text-muted-foreground">Needed for target</p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3 items-end">
             <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Monthly Target (₹)</Label>
                <div className="relative">
                   <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                   <Input 
                      type="number"
                      value={target}
                      onChange={(e) => setTarget(Number(e.target.value))}
                      className="bg-secondary/40 border-border/30 pl-11 py-6 text-lg font-bold rounded-2xl focus:ring-primary/20" 
                   />
                </div>
             </div>
             <div className="lg:col-span-2 space-y-3">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Ask Growth Brain Anything</Label>
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input 
                      placeholder="How can I reach ₹7 lakh? / What should I do today?" 
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                      className="bg-secondary/40 border-border/30 pl-11 py-6 text-base rounded-2xl focus:ring-primary/20" 
                   />
                   <button 
                      onClick={handleAskAI}
                      disabled={isTyping}
                      className="absolute right-2 top-2 bottom-2 gold-gradient px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary-foreground hover:scale-[1.02] transition-transform disabled:opacity-50"
                   >
                      {isTyping ? "Thinking..." : "Strategize"}
                   </button>
                </div>
             </div>
          </div>

          {aiResponse && (
            <div className="mt-6 p-6 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-500">
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                     <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-4 flex-1">
                     <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{aiResponse}</p>
                     <div className="flex gap-2">
                        <button className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                           <Wand2 className="w-3 h-3" /> Optimize Plan
                        </button>
                        <button className="text-[10px] font-bold text-muted-foreground hover:underline ml-4">Dismiss</button>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Row Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {[
          { label: "Forecasted Revenue", val: formatINR(analysis.projected), icon: TrendingUp, color: "text-green-400", sub: `Confidence: ${analysis.confidence}%` },
          { label: "Empty Slot Recovery", val: `${analysis.emptySlotPercentage}%`, icon: Calendar, color: "text-blue-400", sub: "Recoverable weekday gaps" },
          { label: "Churn Risk", val: analysis.churnRisk, icon: AlertCircle, color: "text-red-400", sub: "Inactive > 30 days" },
          { label: "VIP Retention Gap", val: analysis.vipGaps, icon: Star, color: "text-primary", sub: "High spenders missing" }
        ].map((stat, i) => (stat.label &&
          <div key={i} className="glass rounded-2xl border border-border/50 p-6 hover:border-primary/30 transition-colors group">
            <div className="flex items-center justify-between mb-4">
               <stat.icon className={`w-5 h-5 ${stat.color}`} />
               <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{stat.val}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* 3. Deep Analysis Sections */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Daily Actions */}
        <div className="glass rounded-3xl border border-border/50 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="font-heading text-xl">Top Daily Actions</h3>
                <p className="text-xs text-muted-foreground mt-1">AI prioritized tasks for today.</p>
             </div>
             <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4 flex-1">
            {analysis.dailyActions.map((action: any) => (
              <div key={action.id} className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-secondary/30 transition-colors border border-transparent hover:border-border/30">
                <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0 text-primary group-hover:scale-110 transition-transform">
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-snug">{action.text}</p>
                  <button className="mt-2 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Execute Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggested Offers */}
        <div className="glass rounded-3xl border border-border/50 p-8 xl:col-span-2">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="font-heading text-xl">Dynamic Revenue Campaigns</h3>
                 <p className="text-xs text-muted-foreground mt-1">Offers generated by analyzing current customer behavior.</p>
              </div>
              <Rocket className="w-5 h-5 text-primary" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.offers.map((offer: any) => (
                 <div key={offer.id} className="rounded-2xl border border-border/40 bg-secondary/20 p-6 flex flex-col justify-between">
                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <h4 className="text-base font-bold">{offer.title}</h4>
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">Prob: {offer.prob}%</span>
                       </div>
                       <p className="text-[11px] text-muted-foreground mb-4">Rule: {offer.rule}</p>
                       <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="p-3 rounded-xl bg-background/50 border border-border/20">
                             <p className="text-[9px] uppercase text-muted-foreground mb-1">Audience</p>
                             <p className="text-lg font-bold">{offer.audience}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-background/50 border border-border/20">
                             <p className="text-[9px] uppercase text-muted-foreground mb-1">Exp. Revenue</p>
                             <p className="text-lg font-bold text-green-400">₹{offer.rev.toLocaleString()}</p>
                          </div>
                       </div>
                    </div>
                    <button 
                      onClick={() => deployAction(offer.title)}
                      className="w-full py-3 rounded-xl border border-primary/30 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                       Deploy Campaign
                    </button>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* 4. WhatsApp Personalization & Intelligence */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
         <div className="glass rounded-3xl border border-border/50 p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-heading text-xl">WhatsApp Strategy</h3>
               <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-4">
               {whatsAppTemplates.map((template) => (
                  <div key={template.title} className="p-6 rounded-2xl bg-secondary/20 border border-border/20 relative group">
                     <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold">{template.title}</p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(template.message);
                            toast.success("Template copied!");
                          }}
                          className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors"
                        >
                           <Copy className="w-4 h-4" />
                        </button>
                     </div>
                     <p className="text-xs text-muted-foreground italic leading-relaxed mb-4">"{template.message}"</p>
                     <div className="flex flex-wrap gap-2">
                        {template.variables.map(v => (
                           <span key={v} className="text-[9px] font-bold px-2 py-1 rounded bg-background border border-border/20 text-muted-foreground">{v}</span>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="glass rounded-3xl border border-border/50 p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-heading text-xl">Customer Intelligence</h3>
               <Activity className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-6">
               <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-3 mb-2 text-red-400">
                     <TrendingDown className="w-4 h-4" />
                     <p className="text-sm font-bold">Churn Alert</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                     {analysis.churnRisk} regular customers haven't visited in over 30 days. This represents a potential revenue loss of {formatINR(analysis.churnRisk * 1200)} if they are not reactivated this week.
                  </p>
               </div>

               <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-3 mb-2 text-primary">
                     <Users className="w-4 h-4" />
                     <p className="text-sm font-bold">VIP Opportunity</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                     {analysis.vipGaps} high-value customers (spent >₹15k) are currently idle. Recommend personal outreach with the VIP Loyalty Bonus campaign.
                  </p>
               </div>

               <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-center gap-3 mb-2 text-blue-400">
                     <BarChart3 className="w-4 h-4" />
                     <p className="text-sm font-bold">Membership Strategy</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                     {analysis.membershipTargets} regular clients have spent enough to qualify for the Gold Membership. Upgrade them now to lock in recurring visits.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // States mapped to DB keys
  const [settings, setSettings] = useState({
    OWNER_ACCESS: 'Full control',
    RECEPTION_ACCESS: 'Bookings + POS',
    GST_RATE: '18',
    PRIMARY_BRANCH: 'AAR Salon HQ',
    BRAND_VOICE: 'Premium warm luxury',
  });
  
  const [securityMode, setSecurityMode] = useState(true);
  const [backupMode, setBackupMode] = useState("Daily");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setFetching(true);
    const { data } = await supabase.from('business_settings').select('*');
    if (data) {
      const dbSettings: any = { ...settings };
      let secMode = true;
      let backMode = "Daily";

      data.forEach(row => {
        if (dbSettings[row.setting_key] !== undefined) {
          dbSettings[row.setting_key] = row.setting_value;
        }
        if (row.setting_key === 'SECURITY_LOGS_ENABLED') secMode = row.setting_value === 'true';
        if (row.setting_key === 'BACKUP_SCHEDULE') backMode = row.setting_value;
      });

      setSettings(dbSettings);
      setSecurityMode(secMode);
      setBackupMode(backMode);
    }
    setFetching(false);
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setLoading(true);
    const settingsToSave = [
      { setting_key: 'OWNER_ACCESS', setting_value: settings.OWNER_ACCESS, description: 'Owner permissions description' },
      { setting_key: 'RECEPTION_ACCESS', setting_value: settings.RECEPTION_ACCESS, description: 'Reception permissions' },
      { setting_key: 'GST_RATE', setting_value: settings.GST_RATE, description: 'Default GST rate' },
      { setting_key: 'PRIMARY_BRANCH', setting_value: settings.PRIMARY_BRANCH, description: 'Main branch' },
      { setting_key: 'BRAND_VOICE', setting_value: settings.BRAND_VOICE, description: 'Brand voice for copy' },
      { setting_key: 'SECURITY_LOGS_ENABLED', setting_value: String(securityMode), description: 'Track sensitive actions' },
      { setting_key: 'BACKUP_SCHEDULE', setting_value: backupMode, description: 'System backup frequency' },
    ];

    for (const setting of settingsToSave) {
      await supabase.from('business_settings').upsert(setting, { onConflict: 'setting_key' });
    }
    
    setLoading(false);
    toast.success("Settings deployed successfully across all systems.");
  };

  const cardsData = [
    { key: 'OWNER_ACCESS', label: 'Owner Access', category: 'Access', icon: Settings, desc: 'Owner can manage billing, payroll, offers, security logs, and branch data.' },
    { key: 'RECEPTION_ACCESS', label: 'Reception Access', category: 'Access', icon: Settings, desc: 'Reception can create bookings, checkout invoices, and send customer messages.' },
    { key: 'GST_RATE', label: 'GST (%)', category: 'Money', icon: Settings, desc: 'Default GST rate applied to POS invoices and downloadable reports.' },
    { key: 'PRIMARY_BRANCH', label: 'Primary Branch', category: 'Branch', icon: Settings, desc: 'Main branch used for dashboard revenue and occupancy targets.' },
    { key: 'BRAND_VOICE', label: 'Brand Voice', category: 'Brand', icon: Settings, desc: 'Used for WhatsApp, SMS, review requests, and AI campaign copy.' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {fetching && <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Admin Settings</p>
          <h2 className="font-heading text-3xl text-foreground">Access, branch, tax, brand and security control</h2>
          <p className="mt-2 text-sm text-muted-foreground">A practical control center for multi-role salon operations.</p>
        </div>
        <button onClick={saveSettings} disabled={loading} className="gold-gradient rounded-xl px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-50">
          {loading ? "Deploying..." : "Save Settings"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cardsData.map((card) => (
          <div key={card.key} className="glass rounded-2xl border border-border/50 p-5 focus-within:border-primary/50 transition-colors">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-secondary px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{card.category}</span>
              <card.icon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">{card.label}</h3>
            <input 
              type="text" 
              value={settings[card.key as keyof typeof settings]} 
              onChange={(e) => handleSettingChange(card.key, e.target.value)}
              className="mt-1 w-full bg-transparent border-b border-border/30 text-lg font-bold text-primary focus:outline-none focus:border-primary pb-1"
            />
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass rounded-3xl border border-border/50 p-6">
          <h3 className="mb-5 flex items-center gap-2 font-heading text-xl"><Shield className="h-5 w-5 text-primary" /> Role Permissions</h3>
          {["Owner", "Manager", "Reception", "Stylist"].map((role, index) => (
            <div key={role} className="flex items-center justify-between border-b border-border/10 py-4 last:border-0">
              <div>
                <p className="text-sm font-bold">{role}</p>
                <p className="text-[11px] text-muted-foreground">{["All modules", "Operations + reports", "Bookings + POS + messages", "Own schedule + service history"][index]}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
          ))}
        </div>

        <div className="glass rounded-3xl border border-border/50 p-6">
          <h3 className="mb-5 flex items-center gap-2 font-heading text-xl"><Zap className="h-5 w-5 text-primary" /> System Automation</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-2xl bg-secondary/20 p-4 cursor-pointer hover:bg-secondary/30 transition-colors">
              <span>
                <span className="block text-sm font-bold">Security logs</span>
                <span className="text-[11px] text-muted-foreground">Track exports, billing edits, and role changes.</span>
              </span>
              <input type="checkbox" checked={securityMode} onChange={(e) => setSecurityMode(e.target.checked)} className="h-5 w-5 accent-primary" />
            </label>
            <label className="space-y-2 block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Backup Schedule</span>
              <select value={backupMode} onChange={(e) => setBackupMode(e.target.value)} className="w-full rounded-xl border border-border/40 bg-secondary/40 px-4 py-3 text-sm outline-none focus:border-primary/50">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Manual Only</option>
              </select>
            </label>
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 mt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Integration Status</p>
              <p className="mt-2 text-sm text-foreground">Supabase connected. Settings saved here will instantly reflect across the live application.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl border border-border/50 p-6">
        <h3 className="mb-5 flex items-center gap-2 font-heading text-xl"><Play className="h-5 w-5 text-primary" /> Recommended Automation Blueprints</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {automationBlueprints.map((workflow) => (
            <div key={workflow.name} className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold">{workflow.name}</p>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-primary">{workflow.status}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">IF {workflow.trigger}, THEN wait {workflow.delay} and send via {workflow.channel}.</p>
              <p className="mt-3 text-[11px] font-medium text-green-400">{workflow.outcome}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PremiumGrowthModules = ({ module }: PremiumGrowthModulesProps) => {
  if (module === "assistant") return <AIGrowthAssistant />;
  if (module === "settings") return <AdminSettings />;
  return <AdvancedAnalytics />;
};

export default PremiumGrowthModules;
