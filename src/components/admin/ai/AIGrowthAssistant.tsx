import { useState, useEffect } from "react";
import {
  Zap, TrendingUp, AlertTriangle, Users, Crown, Target, IndianRupee,
  Calendar, Star, RefreshCw, ChevronRight, Send, CheckCircle2,
  Brain, Lightbulb, BarChart3, Clock, Gift, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Suggestion = {
  id: string;
  category: "revenue" | "retention" | "upsell" | "churn" | "staffing" | "booking";
  priority: "High" | "Medium" | "Low";
  title: string;
  description: string;
  impact: string;
  action: string;
  actionTab: string;
  icon: any;
  color: string;
  bgColor: string;
};

const AIGrowthAssistant = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalInput, setGoalInput] = useState("");
  const [goalResult, setGoalResult] = useState<string[]>([]);
  const [goalLoading, setGoalLoading] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [growthScore, setGrowthScore] = useState(0);
  const [stats, setStats] = useState({ customers: 0, atRisk: 0, revenue: 0, avgBill: 0, repeat: 0, newThisMonth: 0 });

  useEffect(() => { analyzeData(); }, []);

  const analyzeData = async () => {
    setLoading(true);

    const { data: customers } = await supabase.from("customers").select("*");
    const { data: invoices } = await supabase.from("invoices").select("total, created_at").eq("status", "Paid");
    const { data: bookings } = await supabase.from("bookings").select("status");

    const now = new Date();
    const days = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalC = customers?.length || 0;
    const atRisk = customers?.filter(c => c.status === "At-risk" || (c.last_visit_at && new Date(c.last_visit_at) < days(45))).length || 0;
    const repeatC = customers?.filter(c => (c.visit_count || 0) > 1).length || 0;
    const newThisMonth = customers?.filter(c => new Date(c.created_at) >= monthStart).length || 0;
    const totalRev = invoices?.reduce((s, i) => s + Number(i.total), 0) || 0;
    const avgBill = invoices?.length ? totalRev / invoices.length : 0;
    const monthRev = invoices?.filter(i => new Date(i.created_at) >= monthStart).reduce((s, i) => s + Number(i.total), 0) || 0;
    const noShowCount = bookings?.filter(b => b.status === "No-show").length || 0;
    const vipC = customers?.filter(c => c.loyalty_level === "VIP" || c.loyalty_level === "Platinum").length || 0;

    setStats({ customers: totalC, atRisk, revenue: monthRev, avgBill, repeat: repeatC, newThisMonth });

    // Calculate growth score
    const repeatPct = totalC > 0 ? (repeatC / totalC) * 100 : 0;
    const churnRate = totalC > 0 ? (atRisk / totalC) * 100 : 0;
    let score = 50;
    if (repeatPct > 60) score += 20;
    else if (repeatPct > 40) score += 10;
    if (churnRate < 10) score += 15;
    else if (churnRate > 30) score -= 15;
    if (avgBill > 1500) score += 15;
    else if (avgBill < 500) score -= 10;
    setGrowthScore(Math.max(0, Math.min(100, score)));

    // Generate smart suggestions
    const list: Suggestion[] = [];

    if (atRisk > 0) {
      list.push({
        id: "churn-1", category: "churn", priority: "High",
        title: `Reactivate ${atRisk} At-Risk Customers`,
        description: `${atRisk} customers haven't visited in 45+ days. Their average LTV is ${avgBill > 0 ? `₹${Math.round(avgBill * 5).toLocaleString("en-IN")}` : "high"}. Send a personalised "Miss You" offer with 15% off to win them back before they're lost permanently.`,
        impact: `Potential recovery: ₹${Math.round(atRisk * avgBill * 0.5).toLocaleString("en-IN")}`,
        action: "Launch Reactivation Campaign", actionTab: "campaigns",
        icon: AlertTriangle, color: "text-red-400", bgColor: "bg-red-500/10",
      });
    }

    if (repeatPct < 50) {
      list.push({
        id: "retention-1", category: "retention", priority: "High",
        title: "Boost Repeat Visit Rate",
        description: `Only ${Math.round(repeatPct)}% of your clients return for a second visit. Industry benchmark is 65%. Set up automated 25-day post-visit reminders with a personalised offer to trigger return bookings.`,
        impact: `10% improvement = ₹${Math.round(totalC * 0.1 * avgBill).toLocaleString("en-IN")} extra monthly revenue`,
        action: "Set Up Automation", actionTab: "automation",
        icon: RefreshCw, color: "text-green-400", bgColor: "bg-green-500/10",
      });
    }

    if (avgBill < 1200 && invoices && invoices.length > 0) {
      list.push({
        id: "upsell-1", category: "upsell", priority: "Medium",
        title: "Increase Average Bill Value",
        description: `Your current average bill is ₹${Math.round(avgBill).toLocaleString("en-IN")}. Adding combo service suggestions at checkout (e.g., "Haircut + Beard + Facial Combo at ₹1,299") can push this to ₹1,500+.`,
        impact: `₹${Math.round((1200 - avgBill) * (invoices?.length || 0) / 30).toLocaleString("en-IN")} extra per month`,
        action: "Create Combo Offer", actionTab: "offers",
        icon: TrendingUp, color: "text-yellow-400", bgColor: "bg-yellow-500/10",
      });
    }

    if (vipC < 5) {
      list.push({
        id: "upsell-2", category: "upsell", priority: "Medium",
        title: "Grow VIP Membership Base",
        description: `You have only ${vipC} VIP/Platinum members. Customers with 3+ visits are prime candidates. Offer a "Founding Member" Gold card at ₹4,999/year with 15% off all services + priority booking.`,
        impact: `5 new members = ₹24,995 membership revenue`,
        action: "Design Membership Plan", actionTab: "loyalty",
        icon: Crown, color: "text-primary", bgColor: "bg-primary/10",
      });
    }

    if (newThisMonth < 10) {
      list.push({
        id: "growth-1", category: "revenue", priority: "Medium",
        title: "Accelerate New Customer Acquisition",
        description: `Only ${newThisMonth} new customers this month. Launch a referral program — existing customers who refer a friend get ₹200 off their next visit. Word-of-mouth is your most powerful growth engine.`,
        impact: "10 referrals = 10 new clients + 10 returning visits",
        action: "Launch Referral Program", actionTab: "offers",
        icon: Users, color: "text-cyan-400", bgColor: "bg-cyan-500/10",
      });
    }

    if (noShowCount > 3) {
      list.push({
        id: "booking-1", category: "booking", priority: "Medium",
        title: "Reduce No-Show Rate",
        description: `${noShowCount} no-shows detected. Each no-show costs approximately ₹${Math.round(avgBill).toLocaleString("en-IN")} in lost revenue. Enable automated WhatsApp reminders 24h and 2h before every appointment.`,
        impact: `Recover ₹${Math.round(noShowCount * avgBill * 0.6).toLocaleString("en-IN")} per month`,
        action: "Enable Reminders", actionTab: "automation",
        icon: Calendar, color: "text-blue-400", bgColor: "bg-blue-500/10",
      });
    }

    // Birthday opportunity
    const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7);
    const bdayCount = customers?.filter(c => {
      if (!c.birthday) return false;
      const bd = new Date(c.birthday);
      const thisYear = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
      return thisYear >= now && thisYear <= weekEnd;
    }).length || 0;

    if (bdayCount > 0) {
      list.push({
        id: "retention-2", category: "retention", priority: "High",
        title: `${bdayCount} Birthday Opportunities This Week`,
        description: `${bdayCount} customers have birthdays in the next 7 days. Send a personalised birthday voucher (20% off any service this week) to make them feel special and drive an immediate visit.`,
        impact: `${bdayCount} high-intent visits, avg ₹${Math.round(avgBill * 1.2).toLocaleString("en-IN")} each`,
        action: "Send Birthday Vouchers", actionTab: "campaigns",
        icon: Gift, color: "text-pink-400", bgColor: "bg-pink-500/10",
      });
    }

    setSuggestions(list);
    setLoading(false);
  };

  const handleGoalSubmit = () => {
    if (!goalInput.trim()) return;
    setGoalLoading(true);
    // Simulate AI thinking
    setTimeout(() => {
      const target = parseInt(goalInput.replace(/[^0-9]/g, "")) || 500000;
      const monthlyTarget = target;
      const weeklyTarget = Math.round(target / 4);
      const dailyTarget = Math.round(target / 30);
      const visitsNeeded = Math.round(target / Math.max(stats.avgBill, 500));
      const newClientsNeeded = Math.round(visitsNeeded * 0.3);

      setGoalResult([
        `🎯 Target: ₹${monthlyTarget.toLocaleString("en-IN")} this month`,
        `📅 Daily target: ₹${dailyTarget.toLocaleString("en-IN")} (≈ ${Math.round(dailyTarget / Math.max(stats.avgBill, 500))} clients/day)`,
        `📊 Weekly milestone: ₹${weeklyTarget.toLocaleString("en-IN")} per week`,
        `🔁 Reactivate ${stats.atRisk} inactive clients → ₹${Math.round(stats.atRisk * stats.avgBill * 0.5).toLocaleString("en-IN")} potential`,
        `👥 Acquire ${newClientsNeeded} new clients via referrals + campaigns`,
        `💎 Sell 3–5 Gold memberships → ₹15,000–₹25,000 instant revenue`,
        `📦 Upsell combo packages to existing clients → +₹${Math.round(300 * stats.customers * 0.2).toLocaleString("en-IN")}`,
        `⭐ Improve Google reviews to attract organic walk-ins`,
      ]);
      setGoalLoading(false);
    }, 1200);
  };

  const visible = suggestions.filter(s => !dismissed.includes(s.id));
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const sorted = [...visible].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const priorityColor = { High: "text-red-400 bg-red-500/10 border-red-500/20", Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", Low: "text-blue-400 bg-blue-500/10 border-blue-500/20" };

  if (loading) return (
    <div className="p-20 text-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground animate-pulse text-sm">Analysing your salon data...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl gold-gradient flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            AI Growth Assistant
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Rule-based intelligence analysing your live salon data to maximise revenue.</p>
        </div>
        <button onClick={analyzeData} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary border border-border/30 text-xs font-bold uppercase tracking-widest hover:border-primary/30 transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Re-analyse
        </button>
      </div>

      {/* Growth Score Card */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="md:col-span-2 glass rounded-3xl p-6 border border-border/50 flex items-center gap-6">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(0 0% 14%)" strokeWidth="8" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(15 60% 65%)" strokeWidth="8"
                strokeDasharray={`${(growthScore / 100) * 201} 201`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{growthScore}</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Salon Growth Score</p>
            <p className="text-lg font-heading">{growthScore >= 75 ? "Excellent" : growthScore >= 55 ? "Good" : growthScore >= 40 ? "Average" : "Needs Work"}</p>
            <p className="text-xs text-muted-foreground mt-1">Based on retention, revenue & engagement</p>
          </div>
        </div>
        {[
          { label: "Total Clients", value: stats.customers, icon: Users, color: "text-blue-400" },
          { label: "At Risk", value: stats.atRisk, icon: AlertTriangle, color: "text-red-400" },
          { label: "Month Revenue", value: `₹${Math.round(stats.revenue / 1000)}k`, icon: IndianRupee, color: "text-green-400" },
          { label: "Avg Bill", value: `₹${Math.round(stats.avgBill).toLocaleString("en-IN")}`, icon: BarChart3, color: "text-primary" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-2xl p-5 border border-border/50 flex flex-col justify-between">
            <div className={`p-2 rounded-lg bg-secondary/50 w-fit mb-3 ${s.color}`}><s.icon className="w-4 h-4" /></div>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Goal Input */}
      <div className="glass rounded-3xl p-6 border border-primary/20 bg-primary/5">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-2xl gold-gradient flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg mb-1">Ask Your Growth Assistant</h3>
            <p className="text-xs text-muted-foreground">Type a revenue goal and get a personalised action plan.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGoalSubmit()}
            placeholder='e.g. "How can we reach ₹5 lakh this month?"'
            className="flex-1 bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
          />
          <button onClick={handleGoalSubmit} disabled={goalLoading}
            className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50">
            {goalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {goalLoading ? "Thinking..." : "Analyse"}
          </button>
        </div>

        {goalResult.length > 0 && (
          <div className="mt-5 p-5 rounded-2xl bg-secondary/30 border border-border/20 space-y-2">
            {goalResult.map((line, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground/90 leading-relaxed font-medium">{line}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Smart Action Items ({sorted.length})
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {sorted.length === 0 ? (
            <div className="lg:col-span-2 glass rounded-2xl p-16 text-center border border-border/50">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h3 className="font-heading text-xl mb-2">All Clear!</h3>
              <p className="text-muted-foreground text-sm">Your salon is performing excellently. No urgent actions needed.</p>
            </div>
          ) : (
            sorted.map(s => (
              <div key={s.id} className="glass rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${s.bgColor} flex items-center justify-center ${s.color} flex-shrink-0`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-bold">{s.title}</h4>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${priorityColor[s.priority]}`}>
                          {s.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setDismissed(d => [...d, s.id])} className="text-muted-foreground hover:text-foreground transition-colors text-xs opacity-0 group-hover:opacity-100">✕</button>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed mb-4">{s.description}</p>
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/10">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-400">
                    <TrendingUp className="w-3 h-3" /> {s.impact}
                  </div>
                  <button
                    onClick={() => toast.success(`Navigating to ${s.actionTab}…`, { description: "Use the sidebar to go to the relevant module." })}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                  >
                    {s.action} <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGrowthAssistant;
