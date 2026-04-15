import { useMemo, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
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

  const chartBars = useMemo(
    () => [46, 58, 52, 71, 67, 83, 78, 91, 74, 88, 96, 104].map((value) => (period === "Year" ? value : Math.max(value - 18, 24))),
    [period]
  );

  const exportAnalytics = () => {
    exportCsv(`aar-salon-analytics-${period.toLowerCase()}.csv`, quickCsvRows);
    toast.success("Analytics CSV exported.");
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
          <button onClick={exportAnalytics} className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/20">
            <Download className="mr-2 inline h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {premiumKpis.map((kpi) => (
          <div key={kpi.label} className="glass rounded-2xl border border-border/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
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
        <div className="glass rounded-3xl border border-border/50 p-6 xl:col-span-2">
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
  const [target, setTarget] = useState(700000);
  const [current, setCurrent] = useState(438000);
  const [question, setQuestion] = useState("How can I reach ₹7 lakh this month?");
  const plan = estimateRevenuePlan(target, current);

  const deploySegment = (name: string) => {
    toast.success(`${name} automation queued. WhatsApp copy and staff tasks are ready.`);
  };

  const copyTemplate = (message: string) => {
    navigator.clipboard?.writeText(message);
    toast.success("WhatsApp template copied with variables.");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="gold-gradient rounded-3xl p-[1px] shadow-2xl shadow-primary/10">
        <div className="rounded-3xl bg-background/95 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">AI Growth Assistant</p>
              <h2 className="mt-2 font-heading text-3xl text-foreground">Ask AAR’s growth brain what to do next</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">It turns revenue targets into campaigns, offers, staff actions, academy pushes, and retention flows.</p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/10 px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Revenue Gap</p>
              <p className="text-2xl font-bold">{formatINR(plan.gap)}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monthly Target</span>
              <input value={target} onChange={(e) => setTarget(Number(e.target.value) || 0)} className="w-full rounded-xl border border-border/40 bg-secondary/40 px-4 py-3 text-sm outline-none focus:border-primary/50" />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Revenue</span>
              <input value={current} onChange={(e) => setCurrent(Number(e.target.value) || 0)} className="w-full rounded-xl border border-border/40 bg-secondary/40 px-4 py-3 text-sm outline-none focus:border-primary/50" />
            </label>
            <label className="space-y-2 md:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ask AI</span>
              <input value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full rounded-xl border border-border/40 bg-secondary/40 px-4 py-3 text-sm outline-none focus:border-primary/50" />
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {[
          ["Haircut comeback campaigns", plan.haircutCampaigns],
          ["Membership upgrade push", plan.membershipPush],
          ["Academy admissions", plan.academyAdmissions],
          ["Empty slot recovery", plan.emptySlotRecovery],
        ].map(([label, value]) => (
          <div key={label} className="glass rounded-2xl border border-border/50 p-5">
            <Sparkles className="mb-4 h-5 w-5 text-primary" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{formatINR(Number(value))}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="glass rounded-3xl border border-border/50 p-6">
          <h3 className="mb-5 flex items-center gap-2 font-heading text-xl"><Target className="h-5 w-5 text-primary" /> AI Suggested Offers</h3>
          <div className="space-y-4">
            {smartSegments.map((segment) => (
              <div key={segment.name} className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h4 className="text-sm font-bold">{segment.name}</h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{segment.rule}</p>
                    <p className="mt-2 text-[11px] font-medium text-primary">{segment.action}</p>
                  </div>
                  <button onClick={() => deploySegment(segment.name)} className="rounded-xl bg-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90">
                    Deploy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl border border-border/50 p-6">
          <h3 className="mb-5 flex items-center gap-2 font-heading text-xl"><MessageSquare className="h-5 w-5 text-primary" /> WhatsApp Personalization</h3>
          <div className="space-y-4">
            {whatsAppTemplates.map((template) => (
              <div key={template.title} className="rounded-2xl border border-border/40 bg-background/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{template.title}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{template.useCase}</p>
                  </div>
                  <button onClick={() => copyTemplate(template.message)} className="rounded-lg border border-primary/20 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10">
                    Copy
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-foreground/80">{template.message}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {template.variables.map((variable) => (
                    <span key={variable} className="rounded-full bg-secondary px-2 py-1 text-[9px] font-bold text-muted-foreground">{variable}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminSettings = () => {
  const [securityMode, setSecurityMode] = useState(true);
  const [backupMode, setBackupMode] = useState("Daily");

  const saveSettings = () => {
    localStorage.setItem("aar-admin-settings", JSON.stringify({ securityMode, backupMode, savedAt: new Date().toISOString() }));
    toast.success("Admin settings saved locally and ready for Supabase sync.");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Admin Settings</p>
          <h2 className="font-heading text-3xl text-foreground">Access, branch, tax, brand and security control</h2>
          <p className="mt-2 text-sm text-muted-foreground">A practical control center for multi-role salon operations.</p>
        </div>
        <button onClick={saveSettings} className="gold-gradient rounded-xl px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20">
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {businessSettings.map((setting) => (
          <div key={setting.label} className="glass rounded-2xl border border-border/50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-secondary px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{setting.category}</span>
              {setting.category === "Security" ? <Lock className="h-4 w-4 text-primary" /> : <Settings className="h-4 w-4 text-primary" />}
            </div>
            <h3 className="text-sm font-bold text-foreground">{setting.label}</h3>
            <p className="mt-1 text-lg font-bold text-primary">{setting.value}</p>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{setting.description}</p>
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
            <label className="flex items-center justify-between rounded-2xl bg-secondary/20 p-4">
              <span>
                <span className="block text-sm font-bold">Security logs</span>
                <span className="text-[11px] text-muted-foreground">Track exports, billing edits, and role changes.</span>
              </span>
              <input type="checkbox" checked={securityMode} onChange={(e) => setSecurityMode(e.target.checked)} className="h-5 w-5 accent-primary" />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Backup Schedule</span>
              <select value={backupMode} onChange={(e) => setBackupMode(e.target.value)} className="w-full rounded-xl border border-border/40 bg-secondary/40 px-4 py-3 text-sm outline-none focus:border-primary/50">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Manual Only</option>
              </select>
            </label>
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Integration Status</p>
              <p className="mt-2 text-sm text-foreground">Supabase connected. Website bookings, CRM, billing, leads, campaigns, and reviews can sync through the existing database tables.</p>
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
