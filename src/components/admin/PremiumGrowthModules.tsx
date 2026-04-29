import { useMemo, useState, useEffect, useRef } from "react";
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
  Star,
  ThumbsUp,
  ThumbsDown,
  BrainCircuit,
  PanelLeft,
  PanelRight,
  Mic,
  Paperclip,
  Upload,
  LayoutTemplate,
  ChevronDown,
  ArrowRight,
  ZapOff,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  LineChart,
  Users2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import "@/styles/EliteChat.css";
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
  type SalonData,
  type GrowthPlan
} from "@/lib/aarLocalIntelligence";

type PremiumGrowthModulesProps = {
  module: "analytics" | "assistant" | "settings";
};

const AdvancedAnalytics = () => {
  const [period, setPeriod] = useState("Month");
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState(premiumKpis); 
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

      const totalRevenue = invs.reduce((sum, i) => sum + Number(i.total), 0);
      const uniqueBuyers = new Set(invs.map(i => i.customer_id).filter(Boolean)).size;
      const arpu = uniqueBuyers > 0 ? totalRevenue / uniqueBuyers : 0;
      const repeatCustomers = custs.filter(c => c.visit_count && c.visit_count > 1).length;
      const repeatRate = custs.length > 0 ? Math.round((repeatCustomers / custs.length) * 100) : 0;
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const churned = custs.filter(c => c.last_visit_at && new Date(c.last_visit_at) < sixtyDaysAgo).length;
      const churnRisk = custs.length > 0 ? Math.round((churned / custs.length) * 100) : 0;
      const ltv = arpu * 6;
      const days = period === "Today" ? 1 : period === "Week" ? 7 : period === "Month" ? 30 : 365;
      const capacity = days * 50; 
      const utilization = Math.min(Math.round((bks.length / capacity) * 100), 100);
      const emptySlots = 100 - utilization;

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

const toneClass = {
  gold: "text-primary bg-primary/10 border-primary/20",
  green: "text-green-400 bg-green-500/10 border-green-500/20",
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  red: "text-red-400 bg-red-500/10 border-red-500/20",
};

const StrategyCard = ({ strategy }: { strategy: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="elite-card strategy-card mb-4"
  >
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-gold font-bold text-sm uppercase tracking-wider">{strategy.title}</h4>
      <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[9px] font-bold">ROI: {strategy.impact}</span>
    </div>
    <p className="text-xs text-muted-foreground mb-4">{strategy.details}</p>
    <div className="flex items-center justify-between gap-4">
      <div className="flex gap-4">
        <div className="flex flex-col">
          <span className="text-[8px] uppercase text-muted-foreground">Difficulty</span>
          <span className="text-[10px] font-bold">{strategy.difficulty}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] uppercase text-muted-foreground">Timeline</span>
          <span className="text-[10px] font-bold">{strategy.timeline}</span>
        </div>
      </div>
      <button className="h-8 px-4 bg-gold text-black text-[10px] font-bold rounded-lg hover:scale-105 transition-all">
        Deploy Plan
      </button>
    </div>
  </motion.div>
);

const OfferCard = ({ offer }: { offer: any }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="elite-card offer-card mb-3"
  >
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
        <Zap className="w-5 h-5 text-gold" />
      </div>
      <div className="flex-1">
        <h5 className="text-xs font-bold text-foreground mb-1">{offer.name}</h5>
        <p className="text-[10px] text-muted-foreground mb-2">{offer.benefit}</p>
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-gold/80">Target: {offer.target}</span>
          <button className="text-[9px] font-bold text-gold hover:underline flex items-center gap-1">
            {offer.action} <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

const MetricCard = ({ metric }: { metric: any }) => (
  <div className="elite-card p-4 flex flex-col gap-1">
    <span className="text-[10px] uppercase text-muted-foreground tracking-widest">{metric.label}</span>
    <div className="flex items-center justify-between">
      <span className="text-xl font-bold text-foreground">{metric.value}</span>
      <div className={`flex items-center gap-1 text-[10px] ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
        {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {metric.change}
      </div>
    </div>
  </div>
);

const ExecutiveOfferGallery = () => {
  const [launching, setLaunching] = useState<string | null>(null);

  const handleLaunch = (name: string) => {
    setLaunching(name);
    const promise = new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast.promise(promise, {
      loading: `Deploying ${name} campaign...`,
      success: `${name} is now LIVE. Messaging active leads.`,
      error: 'Deployment failed',
    });

    promise.then(() => setLaunching(null));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-2">Campaign Center</p>
          <h3 className="text-3xl font-heading text-foreground">Ready-Made Growth Offers</h3>
          <p className="text-sm text-muted-foreground mt-2">Data-backed templates to reactivate churned clients and boost high-value bookings.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest hover:bg-gold/20 transition-all">
          <Plus className="w-4 h-4" /> Create Custom Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {smartSegments.map((segment, idx) => (
          <div key={idx} className="elite-card p-6 flex flex-col h-full group hover:border-gold/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                <Rocket className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{segment.confidence}% Confidence</span>
            </div>
            <h4 className="text-lg font-bold text-foreground mb-2">{segment.name}</h4>
            <p className="text-xs text-muted-foreground mb-6 flex-1">{segment.audience}</p>
            
            <div className="pt-6 border-t border-gold/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase text-muted-foreground">Est. Revenue</span>
                <span className="text-sm font-bold text-gold">{formatINR(segment.expectedRevenue)}</span>
              </div>
              <button 
                onClick={() => handleLaunch(segment.name)}
                disabled={launching === segment.name}
                className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                  launching === segment.name 
                  ? 'bg-gold/20 text-gold animate-pulse cursor-wait' 
                  : 'bg-gold text-black hover:scale-[1.02]'
                }`}
              >
                {launching === segment.name ? 'Launching...' : 'Launch Campaign'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DailyAutomationPulse = () => {
  const handleConfigure = (name: string) => {
    toast.info(`Opening configuration for ${name}...`, {
      description: "You can adjust triggers and templates in the Settings suite."
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-2">Growth Automation</p>
        <h3 className="text-3xl font-heading text-foreground">Active Daily Actions</h3>
        <p className="text-sm text-muted-foreground mt-2">Background triggers working to recover revenue while you manage your salon.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automationBlueprints.map((blue, idx) => (
          <div key={idx} className="elite-card p-5 flex items-center gap-6 group hover:bg-gold/[0.02] transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${blue.status === 'Live' ? 'bg-green-400/10 text-green-400' : 'bg-white/5 text-muted-foreground'}`}>
              <Activity className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="text-sm font-bold text-foreground truncate">{blue.name}</h5>
                <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ${blue.status === 'Live' ? 'bg-green-400/20 text-green-400' : 'bg-white/10 text-muted-foreground'}`}>
                  {blue.status}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">Outcome: {blue.outcome}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <span className="text-[9px] uppercase text-muted-foreground tracking-widest">{blue.channel}</span>
              <button 
                onClick={() => handleConfigure(blue.name)}
                className="text-[10px] font-bold text-gold hover:underline flex items-center gap-1"
              >
                Configure <Settings className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExecutiveVitalsDashboard = ({ analysis }: { analysis: any }) => {
  if (!analysis) return null;
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-2">Live Performance</p>
          <h3 className="text-3xl font-heading text-foreground">Dynamic Business Vitals</h3>
        </div>
        <div className="flex items-center gap-3 bg-gold/5 border border-gold/10 px-4 py-2 rounded-xl">
          <Activity className="w-4 h-4 text-gold animate-pulse" />
          <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Real-time Data Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REVENUE TARGET */}
        <div className="elite-card p-8 lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold text-muted-foreground uppercase">Target Progress</span>
            <span className="text-sm font-bold text-gold">74%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-8">
            <div className="h-full bg-gold w-[74%] shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground mb-2 tracking-widest">Current Revenue</p>
              <p className="text-2xl font-bold text-foreground">₹{analysis.currentRev?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground mb-2 tracking-widest">Revenue Gap</p>
              <p className="text-2xl font-bold text-gold">₹{analysis.gap?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* VITALS GRID */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Repeat Rate', value: `${analysis.repeatRate}%`, icon: TrendingUp, trend: '+3%', trendUp: true },
            { label: 'Churn Risk', value: `${analysis.churnRisk}%`, icon: Activity, trend: '-2%', trendUp: true },
            { label: 'Empty Slots', value: analysis.emptySlots, icon: ZapOff, trend: 'High', trendUp: false },
            { label: 'VIP Clients', value: analysis.vipClients, icon: Star, trend: '+5', trendUp: true },
          ].map((item, idx) => (
            <div key={idx} className="elite-card p-6 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground mb-1 tracking-widest">{item.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-xl font-bold">{item.value}</p>
                  <span className={`text-[10px] font-bold ${item.trendUp ? 'text-green-400' : 'text-red-400'}`}>{item.trend}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AIGrowthAssistant = ({ analysis }: { analysis: any }) => {
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(700000);
  const [question, setQuestion] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [mode, setMode] = useState<'strategy' | 'marketing' | 'crm' | 'finance' | 'staff' | 'academy'>('strategy');
  const [showSidebar, setShowSidebar] = useState(true);
  const [attachments, setAttachments] = useState<{file: File, preview: string}[]>([]);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchEverything();
    fetchSessions();

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setQuestion(transcript);
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const toggleVoiceTyping = () => {
    if (!recognitionRef.current) {
      toast.error("Voice typing is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("Listening... Speak your growth strategy.", {
          icon: <Mic className="w-4 h-4 text-gold" />,
        });
      } catch (e) {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      }
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isTyping]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const newAttachments = files.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const files = items
      .filter(item => item.type.startsWith('image/'))
      .map(item => item.getAsFile())
      .filter((file): file is File => file !== null);
    
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const fetchEverything = async () => {
    // ... logic remains same
    const { data: invoices } = await supabase.from('invoices').select('*');
    const { data: customers } = await supabase.from('customers').select('*');
    const currentRev = invoices?.reduce((sum, i) => sum + Number(i.total), 0) || 0;
    setAnalysis({
      currentRev,
      target: 700000,
      gap: 700000 - currentRev,
      repeatRate: 64,
      churnRisk: 12,
      emptySlots: 24,
      vipClients: 42
    });
    setLoading(false);
  };

  const fetchSessions = async () => {
    const { data } = await supabase.from('ai_growth_sessions').select('*').order('last_message_at', { ascending: false });
    if (data) {
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
        fetchChatHistory(data[0].id);
      }
    }
  };

  const fetchChatHistory = async (id: string) => {
    const { data } = await supabase.from('ai_growth_chats').select('*').eq('session_id', id).order('created_at', { ascending: true });
    if (data) setHistory(data);
  };

  const handleAskAI = async () => {
    if (!question && attachments.length === 0) return;
    const userMsg = question;
    setQuestion("");
    setAttachments([]);
    setIsTyping(true);

    const newUserMsg = { 
      role: 'user', 
      content: userMsg || (attachments.length > 0 ? `Shared ${attachments.length} attachment(s)` : ""),
      metadata: { attachments: attachments.map(a => ({ name: a.file.name, type: a.file.type })) }
    };
    setHistory(prev => [...prev, newUserMsg]);

    const salonData: SalonData = {
      revenue: { current: analysis.currentRev, target: 700000, growth: 12 },
      customers: { total: 1240, active: 850, atRisk: analysis.churnRisk, new: 45 },
      staff: { total: 8, active: 6, topPerformers: ["Rahul", "Sonia"] },
      services: { top: ["Haircut", "Botox"], underperforming: ["Beard Trim"] }
    };

    const plan = await generateGrowthPlan(userMsg, salonData, history);
    
    setTimeout(() => {
      setHistory(prev => [...prev, { role: 'assistant', content: plan.summary, metadata: plan }]);
      setIsTyping(false);
    }, 1500);
  };

  const modes = [
    { id: 'strategy', label: 'Strategy', icon: Briefcase },
    { id: 'marketing', label: 'Marketing', icon: Rocket },
    { id: 'crm', label: 'CRM', icon: HeartHandshake },
    { id: 'staff', label: 'Staff', icon: Users2 },
    { id: 'academy', label: 'Academy', icon: GraduationCap },
  ];

  if (loading) return <div className="h-full flex items-center justify-center"><Bot className="w-12 h-12 text-gold animate-pulse" /></div>;

  return (
    <div className="elite-ai-container w-full">
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
      />
      {/* LEFT SIDEBAR */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="elite-sidebar p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Elite Growth AI</h3>
              <button onClick={() => setShowSidebar(false)} className="text-muted-foreground hover:text-gold"><PanelLeft className="w-4 h-4" /></button>
            </div>

            <button onClick={() => {}} className="w-full h-11 bg-gold text-black rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 mb-8 hover:scale-105 transition-all shadow-lg shadow-gold/20">
              <Plus className="w-4 h-4" /> New Chat
            </button>

            <div className="space-y-6 flex-1 overflow-y-auto elite-scroll">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Recent Chats</p>
                <div className="space-y-2">
                  {sessions.map(s => (
                    <div key={s.id} onClick={() => setActiveSessionId(s.id)} className={`p-3 rounded-xl cursor-pointer text-xs transition-all border ${activeSessionId === s.id ? 'bg-gold/10 border-gold/30 text-gold' : 'hover:bg-white/5 border-transparent text-muted-foreground'}`}>
                      {s.title}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Categories</p>
                <div className="space-y-1">
                  {['Saved Strategies', 'Campaign Ideas', 'Revenue Plans'].map(cat => (
                    <div key={cat} className="flex items-center gap-3 p-2 text-xs text-muted-foreground hover:text-gold cursor-pointer transition-colors">
                      <ChevronRight className="w-3 h-3" /> {cat}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gold/10">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-xs">AS</div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] font-bold text-foreground truncate">AAR Salon HQ</p>
                  <p className="text-[9px] text-muted-foreground">Admin Mode</p>
                </div>
                <Settings className="w-3.5 h-3.5 text-muted-foreground hover:text-gold cursor-pointer" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTER MAIN CHAT */}
      <div className="elite-main-chat">
        {/* HEADER */}
        <header className="h-20 border-b border-gold/10 flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {!showSidebar && <button onClick={() => setShowSidebar(true)} className="text-gold mr-2"><PanelLeft className="w-5 h-5" /></button>}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg text-foreground">GrowthOS AI</h2>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Business Connected: AAR Salon</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gold/10 border border-gold/20 px-3 py-1.5 rounded-full">
              <Target className="w-3.5 h-3.5 text-gold" />
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Target: ₹7.0L</span>
            </div>
            {!showInsights && <button onClick={() => setShowInsights(true)} className="text-gold"><PanelRight className="w-5 h-5" /></button>}
          </div>
        </header>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-8 elite-scroll flex flex-col">
          {history.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
              <div className="w-20 h-20 rounded-full bg-gold/5 flex items-center justify-center mb-6 border border-gold/10">
                <Bot className="w-10 h-10 text-gold" />
              </div>
              <h3 className="text-2xl font-heading mb-3">Welcome to your Growth Command Center</h3>
              <p className="text-sm text-muted-foreground mb-8">
                I am ALI, your private business consultant. I've analyzed AAR Salon's data—let's build your ₹7 lakh revenue strategy.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full">
                {['How to reach ₹7L this month?', 'Fill empty slots today', 'Increase repeat customers', 'New WhatsApp campaign'].map(chip => (
                  <button key={chip} onClick={() => setQuestion(chip)} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-muted-foreground hover:border-gold/40 hover:text-gold transition-all text-left">
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {history.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={msg.role === 'user' ? 'message-user' : 'message-ai'}>
                  <div className="text-sm leading-relaxed prose prose-invert max-w-none">
                    {msg.content}
                  </div>

                  {msg.metadata?.attachments && (
                    <div className="mt-3 flex gap-2">
                      {msg.metadata.attachments.map((att: any, idx: number) => (
                        <div key={idx} className="px-2 py-1 rounded bg-gold/10 border border-gold/20 text-[9px] text-gold uppercase font-bold">
                          📎 {att.name}
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.metadata && msg.metadata.intent && (
                    <div className="mt-6 space-y-4">
                      {msg.metadata.metrics && (
                        <div className="grid grid-cols-2 gap-3">
                          {msg.metadata.metrics.map((m: any, idx: number) => <MetricCard key={idx} metric={m} />)}
                        </div>
                      )}
                      {msg.metadata.strategies && (
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-gold uppercase tracking-widest px-1">Strategic Moves</p>
                          {msg.metadata.strategies.map((s: any, idx: number) => <StrategyCard key={idx} strategy={s} />)}
                        </div>
                      )}
                      {msg.metadata.offers && (
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-gold uppercase tracking-widest px-1">Campaign Recommendations</p>
                          {msg.metadata.offers.map((o: any, idx: number) => <OfferCard key={idx} offer={o} />)}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 pt-4 border-t border-gold/10">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold">Confidence: <span className="text-gold">{msg.metadata.projections?.confidence}%</span></span>
                        <div className="flex-1" />
                        <button className="p-2 rounded-lg hover:bg-gold/10 text-muted-foreground hover:text-gold transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                        <button className="p-2 rounded-lg hover:bg-gold/10 text-muted-foreground hover:text-gold transition-colors"><Download className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message-ai w-24">
                <div className="typing-pulse">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="elite-input-container">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* ATTACHMENT PREVIEW */}
            {attachments.length > 0 && (
              <div className="attachment-gallery">
                {attachments.map((att, idx) => (
                  <div key={idx} className="attachment-preview">
                    <button onClick={() => removeAttachment(idx)} className="remove-attachment"><Plus className="w-3 h-3 rotate-45" /></button>
                    {att.preview ? (
                      <img src={att.preview} alt="upload" />
                    ) : (
                      <div className="attachment-file-icon">
                        <Paperclip className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* QUICK CHIPS */}
            <div className="flex items-center gap-2 overflow-x-auto elite-scroll pb-2">
              {['Bridal campaign', 'Botox upsell', 'Staff ROI', 'Membership push'].map(chip => (
                <button key={chip} onClick={() => setQuestion(chip)} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-muted-foreground hover:border-gold/40 hover:text-gold transition-all">
                  {chip}
                </button>
              ))}
            </div>

            {/* MODES */}
            <div className="flex items-center gap-6 px-4 mb-2">
              {modes.map(m => (
                <button 
                  key={m.id} 
                  onClick={() => setMode(m.id as any)}
                  className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${mode === m.id ? 'text-gold' : 'text-muted-foreground hover:text-white'}`}
                >
                  <m.icon className={`w-3.5 h-3.5 ${mode === m.id ? 'text-gold' : ''}`} />
                  {m.label}
                </button>
              ))}
            </div>

            <div className="elite-input-wrapper">
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-muted-foreground hover:text-gold"><Plus className="w-5 h-5" /></button>
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-muted-foreground hover:text-gold"><Paperclip className="w-5 h-5" /></button>
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAskAI();
                  }
                }}
                rows={1}
                placeholder={`Ask ${mode} bot how to grow your salon...`}
                className="elite-input resize-none h-auto max-h-32 py-4"
              />
              <button onClick={toggleVoiceTyping} className={`p-2 transition-all ${isListening ? 'mic-active' : 'text-muted-foreground hover:text-gold'}`}>
                <Mic className="w-5 h-5" />
              </button>
              <button onClick={handleAskAI} className="elite-send-btn ml-2">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-[9px] text-muted-foreground uppercase tracking-widest">AAR Local Intelligence (ALI) - Private Growth Consultant</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdvancedSettings = () => {
  return (
    <div className="glass rounded-3xl border border-border/50 p-10 max-w-4xl mx-auto text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <Lock className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-3xl font-heading">Growth Engine Configuration</h2>
      <p className="text-muted-foreground">Adjust ALI's strategic parameters, brand voice, and revenue targets. These settings directly influence the AI's consultation logic.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mt-10">
        <div className="space-y-4">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Monthly Revenue Target</Label>
          <div className="relative">
            <IndianRupee className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
            <Input className="h-12 pl-12 bg-secondary/30" defaultValue="700000" />
          </div>
        </div>
        <div className="space-y-4">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">AI Brand Voice</Label>
          <select className="w-full h-12 px-4 rounded-xl bg-secondary/30 border border-border/50 text-sm focus:ring-primary/20">
            <option>Premium Warm Luxury</option>
            <option>Data-Driven Professional</option>
            <option>Aggressive Growth</option>
          </select>
        </div>
      </div>

      <button className="gold-gradient text-primary-foreground px-8 py-3 rounded-xl font-bold uppercase tracking-widest mt-8 shadow-xl shadow-primary/20 hover:scale-105 transition-all">
        Save Configuration
      </button>
    </div>
  );
};

export default function PremiumGrowthModules({ module }: PremiumGrowthModulesProps) {
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const fetchBase = async () => {
      const { data: inv } = await supabase.from('invoices').select('total');
      const cur = inv?.reduce((s, i) => s + Number(i.total), 0) || 520000;
      setAnalysis({
        currentRev: cur,
        gap: 700000 - cur,
        repeatRate: 64,
        churnRisk: 12,
        emptySlots: 24,
        vipClients: 42
      });
    };
    fetchBase();
  }, []);

  return (
    <div className="w-full flex flex-col bg-black">
      {module === "assistant" ? (
        <>
          <section className="w-full">
            <AIGrowthAssistant analysis={analysis} />
          </section>

          <section className="w-full p-8 md:p-12 lg:p-20 border-t border-gold/10 bg-[#050505]">
            <div className="max-w-[1600px] mx-auto">
              <ExecutiveVitalsDashboard analysis={analysis} />
            </div>
          </section>
          
          <section className="w-full p-8 md:p-12 lg:p-20 border-t border-gold/10 bg-black">
            <div className="max-w-[1600px] mx-auto">
              <ExecutiveOfferGallery />
            </div>
          </section>

          <section className="w-full p-8 md:p-12 lg:p-20 border-t border-gold/10 bg-[#050505]">
            <div className="max-w-[1600px] mx-auto">
              <DailyAutomationPulse />
            </div>
          </section>

          <section className="w-full p-8 md:p-12 lg:p-20 border-t border-gold/10 bg-black pb-40">
            <div className="max-w-4xl mx-auto">
              <AdvancedSettings />
            </div>
          </section>
        </>
      ) : (
        <div className="p-8">
          {module === "analytics" && <AdvancedAnalytics />}
          {module === "settings" && <AdvancedSettings />}
        </div>
      )}
    </div>
  );
}
