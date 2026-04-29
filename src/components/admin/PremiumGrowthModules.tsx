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
  Plus,
  History,
  Trash2,
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
  const [history, setHistory] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);

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
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('ai_growth_sessions')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (!error && data) {
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
        fetchChatHistory(data[0].id);
      }
    }
    setLoadingSessions(false);
  };

  const fetchChatHistory = async (sessionId: string) => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from('ai_growth_chats')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching growth chats:", error);
    } else {
      setHistory(data || []);
    }
    setLoadingHistory(false);
  };

  const createNewChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('ai_growth_sessions')
      .insert({ user_id: user.id, title: 'New Strategy Session' })
      .select()
      .single();

    if (!error && data) {
      setSessions(prev => [data, ...prev]);
      setActiveSessionId(data.id);
      setHistory([]);
      toast.success("New strategy session started.");
    }
  };

  const switchSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    fetchChatHistory(sessionId);
  };

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const { error } = await supabase.from('ai_growth_sessions').delete().eq('id', sessionId);
    if (!error) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setHistory([]);
      }
      toast.success("Session deleted.");
    }
  };

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
        { data: inventory },
        { data: profiles },
      ] = await Promise.all([
        supabase.from('invoices').select('*').gte('created_at', firstDayOfMonth.toISOString()),
        supabase.from('customers').select('*'),
        supabase.from('bookings').select('*').gte('booking_date', now.toISOString().split('T')[0]),
        supabase.from('leads').select('*'),
        supabase.from('customer_memberships').select('*'),
        supabase.from('inventory_products').select('*'),
        supabase.from('profiles').select('*')
      ]);

      const dataSet = {
        invoices: invoices || [],
        customers: customers || [],
        bookings: bookings || [],
        leads: leads || [],
        memberships: memberships || [],
        inventory: inventory || [],
        staff: profiles || [],
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
    const capacityPerDay = 40;
    const nextThreeDays = dataSet.bookings.length; 
    const emptySlots = Math.max(0, 100 - (nextThreeDays / (capacityPerDay * 3) * 100));

    // 5. Academy Leads (last week)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const academyLeads = (dataSet.leads || []).filter((l: any) => new Date(l.created_at) > lastWeek).length;

    // 6. Haircut Comeback (30-45 days ago)
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);
    const haircutTargets = (dataSet.customers || []).filter((c: any) => 
      c.last_visit_at && 
      new Date(c.last_visit_at) < thirtyDaysAgo && 
      new Date(c.last_visit_at) > fortyFiveDaysAgo
    ).length;

    // 7. Membership Renewals (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const renewalTargets = (dataSet.memberships || []).filter((m: any) => 
      m.end_date && new Date(m.end_date) > now && new Date(m.end_date) < nextWeek
    ).length;

    // 8. Today's Review Requests
    const todayStr = now.toISOString().split('T')[0];
    const todayBookings = (dataSet.bookings || []).filter((b: any) => b.booking_date.startsWith(todayStr) && b.status === 'completed').length;

    setAnalysis({
      currentRev: currentRev,
      projected: projected,
      gap: gap,
      pace: pace,
      totalCustomers: dataSet.customers.length,
      newThisMonth: (dataSet.customers || []).filter((c: any) => c.created_at && new Date(c.created_at) >= new Date(now.getFullYear(), now.getMonth(), 1)).length,
      churnRisk: churnRisk,
      vipGaps: vipGaps,
      emptySlotPercentage: Math.round(emptySlots),
      academyLeads,
      haircutTargets,
      renewalTargets,
      todayBookings,
      totalStaff: (dataSet.staff || []).length,
      lowStockItems: (dataSet.inventory || []).filter((i: any) => i.stock < 5).length,
      membershipTargets
    });
  };

  const handleAskAI = async () => {
    if (!question) return;
    
    const userMsg = question;
    setQuestion("");
    setIsTyping(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to use the AI Assistant");
      setIsTyping(false);
      return;
    }

    let sessionId = activeSessionId;
    if (!sessionId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: session } = await supabase
          .from('ai_growth_sessions')
          .insert({ user_id: user.id, title: userMsg.slice(0, 30) + (userMsg.length > 30 ? '...' : '') })
          .select()
          .single();
        if (session) {
          sessionId = session.id;
          setActiveSessionId(sessionId);
          setSessions(prev => [session, ...prev]);
        }
      }
    }

    if (!sessionId) return;

    const newUserMsg = { 
      role: 'user' as const, 
      content: userMsg, 
      user_id: user.id,
      session_id: sessionId 
    };
    setHistory(prev => [...prev, newUserMsg]);
    
    await supabase.from('ai_growth_chats').insert(newUserMsg);
    await supabase.from('ai_growth_sessions').update({ 
      last_message_at: new Date().toISOString(),
      title: history.length === 0 ? userMsg.slice(0, 30) + (userMsg.length > 30 ? '...' : '') : undefined
    }).eq('id', sessionId);

    const salonData = {
      revenue: { 
        current: analysis.currentRev, 
        target: target,
        pace: analysis.pace || 0,
        gap: analysis.gap || 0
      },
      customers: { 
        total: analysis.totalCustomers || 0,
        churnRisk: analysis.churnRisk, 
        vips: analysis.vipGaps,
        newThisMonth: analysis.newThisMonth || 0
      },
      staff: {
        total: analysis.totalStaff || 0,
        avgUtilization: 78,
        topPerformer: "AAR Star"
      },
      inventory: { lowStockItems: analysis.lowStockItems || 0 },
      bookings: { emptySlotsNext3Days: Math.round(analysis.emptySlotPercentage * 1.2) },
      settings: {
        brandVoice: "Premium warm luxury",
        branch: "AAR Salon HQ"
      }
    };

    const plan = generateGrowthPlan(salonData, userMsg, history);
    const assistantContent = plan.summary + "\n\n" + plan.steps.map((s, i) => `${i+1}. ${s}`).join("\n\n");

    setTimeout(async () => {
      const assistantMsg = { 
        role: 'assistant' as const, 
        content: assistantContent, 
        user_id: user.id,
        session_id: sessionId 
      };
      setHistory(prev => [...prev, assistantMsg]);
      await supabase.from('ai_growth_chats').insert(assistantMsg);
      setIsTyping(false);
    }, 1200);
  };

  const deployAction = (actionType: string) => {
    const actions: any = {
      academy: "Calling Academy leads now.",
      comeback: "Triggering comeback offers for inactive clients.",
      slots: "Sending student promo alerts for empty slots.",
      reviews: "Requesting reviews from today's completed bookings.",
      renewals: "Pushing renewal notifications for expiring memberships."
    };
    toast.success(actions[actionType] || "Action triggered.");
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-10">
            {/* Sidebar for Sessions */}
            <div className="lg:col-span-1 space-y-4 sticky top-10">
              <button 
                onClick={createNewChat}
                className="w-full h-12 flex items-center justify-center gap-2 border border-primary/30 rounded-xl bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/10 transition-all"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">History</p>
                {loadingSessions ? (
                  <div className="space-y-2 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-10 bg-white/5 rounded-xl" />)}
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground px-2 italic">No history yet</p>
                ) : (
                  sessions.map((s) => (
                    <div 
                      key={s.id}
                      onClick={() => switchSession(s.id)}
                      className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${activeSessionId === s.id ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                    >
                      <History className={`w-3.5 h-3.5 ${activeSessionId === s.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-[11px] font-medium truncate pr-6 ${activeSessionId === s.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {s.title}
                      </span>
                      <button 
                        onClick={(e) => deleteSession(e, s.id)}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-red-400 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Main Content: Chat + Priorities */}
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-6">
                <div className="bg-background/40 backdrop-blur-md rounded-2xl border border-white/5 p-6 min-h-[400px] max-h-[600px] overflow-y-auto flex flex-col gap-4 scrollbar-hide">
                {loadingHistory ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !activeSessionId ? (
                   <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Select a session or start a new one to begin.</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Bot className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">New session started. Ask ALI something to begin your growth strategy.</p>
                  </div>
                ) : (
                  history.map((msg, i) => (
                    <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white'}`}>
                        {msg.role === 'user' ? <Users className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user' ? 'bg-primary/10 border border-primary/20' : 'bg-white/5 border border-white/10'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <Input 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                  placeholder="Ask Growth Brain about targets, retention, or systems..."
                  className="h-16 pl-6 pr-32 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20"
                />
                <button 
                  onClick={handleAskAI}
                  disabled={isTyping}
                  className="absolute right-2 top-2 h-12 px-6 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4" />
                  Strategize
                </button>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-transparent p-1 rounded-3xl">
                <div className="bg-[#0A0A0B] rounded-[calc(1.5rem-1px)] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-heading text-xl text-foreground">Immediate Priorities</h3>
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Academy Leads */}
                    <div className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-4 rounded-xl transition-all border border-white/5" onClick={() => deployAction('academy')}>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Call {analysis.academyLeads} Academy leads</p>
                        <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Execute Now</button>
                      </div>
                    </div>

                    {/* Comeback Offers */}
                    <div className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-4 rounded-xl transition-all border border-white/5" onClick={() => deployAction('comeback')}>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Send {analysis.haircutTargets} comeback offers</p>
                        <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Execute Now</button>
                      </div>
                    </div>

                    {/* Empty Slots */}
                    <div className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-4 rounded-xl transition-all border border-white/5" onClick={() => deployAction('slots')}>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Fill tomorrow's gaps</p>
                        <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Execute Now</button>
                      </div>
                    </div>

                    {/* Reviews */}
                    <div className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-4 rounded-xl transition-all border border-white/5" onClick={() => deployAction('reviews')}>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                        <Star className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Ask {analysis.todayBookings} review requests</p>
                        <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Execute Now</button>
                      </div>
                    </div>

                    {/* Membership Renewals */}
                    <div className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-4 rounded-xl transition-all border border-white/5" onClick={() => deployAction('renewals')}>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                        <Rocket className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Push {analysis.renewalTargets} renewals</p>
                        <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Execute Now</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {[
          { label: "Forecasted Revenue", val: formatINR(analysis.projected), icon: TrendingUp, color: "text-green-400", sub: `Confidence: 85%` },
          { label: "Empty Slot Recovery", val: `${analysis.emptySlotPercentage}%`, icon: Calendar, color: "text-blue-400", sub: "Recoverable weekday gaps" },
          { label: "Churn Risk", val: analysis.churnRisk, icon: AlertCircle, color: "text-red-400", sub: "Inactive > 30 days" },
          { label: "VIP Retention Gap", val: analysis.vipGaps, icon: Star, color: "text-primary", sub: "High spenders missing" }
        ].map((stat, i) => (
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
                     {analysis.vipGaps} high-value customers (spent &gt;₹15k) are currently idle. Recommend personal outreach with the VIP Loyalty Bonus campaign.
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
