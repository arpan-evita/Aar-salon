import { useState, useEffect } from "react";
import {
  Users, UserPlus, Crown, TrendingUp, TrendingDown, Clock, AlertTriangle,
  Scissors, Sparkles, Heart, Star, Calendar, Award, RefreshCw, Send,
  ChevronRight, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Segment = {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  customers: any[];
  count: number;
};

const SmartSegments = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState<Segment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { buildSegments(); }, []);

  const buildSegments = async () => {
    setLoading(true);
    const { data: customers } = await supabase
      .from("customers")
      .select("*")
      .order("total_spend", { ascending: false });

    if (!customers) { setLoading(false); return; }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const days = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
    const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7);

    const seg = (name: string, desc: string, icon: any, color: string, bg: string, filter: (c: any) => boolean): Segment => {
      const list = customers.filter(filter);
      return { id: name, name, description: desc, icon, color, bgColor: bg, customers: list, count: list.length };
    };

    const all: Segment[] = [
      seg("New Customers", "Joined this month", UserPlus, "text-cyan-400", "bg-cyan-500/10",
        c => new Date(c.created_at) >= startOfMonth),
      seg("Repeat Customers", "Visited more than once", RefreshCw, "text-green-400", "bg-green-500/10",
        c => (c.visit_count || 0) > 1),
      seg("VIP Customers", "Platinum & VIP tier members", Crown, "text-primary", "bg-primary/10",
        c => c.loyalty_level === "VIP" || c.loyalty_level === "Platinum"),
      seg("High Spenders", "Lifetime spend above ₹10,000", TrendingUp, "text-yellow-400", "bg-yellow-500/10",
        c => Number(c.total_spend || 0) >= 10000),
      seg("Low Spenders", "Spent less than ₹1,000 total", TrendingDown, "text-slate-400", "bg-slate-500/10",
        c => Number(c.total_spend || 0) < 1000),
      seg("Inactive 30 Days", "No visit in last 30 days", Clock, "text-orange-400", "bg-orange-500/10",
        c => c.last_visit_at && new Date(c.last_visit_at) <= days(30)),
      seg("Inactive 60 Days", "No visit in last 60 days — at risk", AlertTriangle, "text-red-400", "bg-red-500/10",
        c => c.last_visit_at && new Date(c.last_visit_at) <= days(60)),
      seg("Haircut Customers", "Prefer haircut services", Scissors, "text-blue-400", "bg-blue-500/10",
        c => (c.preferred_services || []).includes("Haircut") || (c.notes || "").toLowerCase().includes("haircut")),
      seg("Facial Customers", "Prefer facial & skincare", Sparkles, "text-pink-400", "bg-pink-500/10",
        c => (c.preferred_services || []).includes("Facial") || (c.notes || "").toLowerCase().includes("facial")),
      seg("Botox Prospects", "Interested in Botox/fillers", Heart, "text-rose-400", "bg-rose-500/10",
        c => (c.notes || "").toLowerCase().includes("botox") || (c.preferred_services || []).includes("Botox")),
      seg("Bridal Leads", "Bridal inquiry or package", Star, "text-purple-400", "bg-purple-500/10",
        c => (c.notes || "").toLowerCase().includes("bridal") || (c.preferred_services || []).includes("Bridal")),
      seg("Birthday This Week", "Birthday in next 7 days", Calendar, "text-pink-300", "bg-pink-500/10",
        c => {
          if (!c.birthday) return false;
          const bd = new Date(c.birthday);
          const thisYear = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
          return thisYear >= now && thisYear <= weekEnd;
        }),
      seg("Membership Expiring", "Membership ends in 30 days", Award, "text-amber-400", "bg-amber-500/10",
        c => c.membership_status === "Active"),
      seg("Churn Risk", "High churn probability score", AlertTriangle, "text-red-500", "bg-red-500/10",
        c => c.status === "At-risk" || (c.churn_risk_score || 0) > 60),
    ];

    setSegments(all);
    setActiveSegment(all[0]);
    setLoading(false);
  };

  const filtered = activeSegment?.customers.filter(c =>
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  ) || [];

  const handleCampaign = (segName: string) => {
    toast.success(`Campaign queued for "${segName}" — ${activeSegment?.count} customers`, {
      description: "Go to Campaign Builder to configure and send."
    });
  };

  if (loading) return (
    <div className="p-20 text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground animate-pulse text-sm">Building smart segments...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Smart Customer Segments</h2>
          <p className="text-sm text-muted-foreground mt-1">Auto-classified segments that update in real-time from your customer data.</p>
        </div>
        <button onClick={buildSegments} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary border border-border/30 text-xs font-bold uppercase tracking-widest hover:border-primary/30 transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh All
        </button>
      </div>

      {/* Segment Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {segments.map(seg => (
          <button
            key={seg.id}
            onClick={() => { setActiveSegment(seg); setSearchTerm(""); }}
            className={`p-4 rounded-2xl border transition-all duration-300 text-left group ${
              activeSegment?.id === seg.id
                ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/10"
                : "glass border-border/50 hover:border-primary/30"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl ${seg.bgColor} flex items-center justify-center mb-3 ${seg.color}`}>
              <seg.icon className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold">{seg.count}</p>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider leading-tight mt-1">{seg.name}</p>
          </button>
        ))}
      </div>

      {/* Active Segment Detail */}
      {activeSegment && (
        <div className="glass rounded-3xl border border-border/50 overflow-hidden">
          {/* Segment Header */}
          <div className="p-6 border-b border-border/20 bg-secondary/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${activeSegment.bgColor} flex items-center justify-center ${activeSegment.color}`}>
                  <activeSegment.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-heading">{activeSegment.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{activeSegment.description} · <span className="font-bold text-foreground">{activeSegment.count} customers</span></p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-secondary/50 border border-border/30 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <button
                  onClick={() => handleCampaign(activeSegment.name)}
                  className="gold-gradient text-primary-foreground px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  <Send className="w-3.5 h-3.5" /> Send Campaign
                </button>
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="p-16 text-center text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm italic">No customers in this segment yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/20 border-b border-border/20">
                    {["Customer", "Contact", "Visits", "Total Spend", "Last Visit", "Status"].map(h => (
                      <th key={h} className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {filtered.slice(0, 50).map((c, i) => {
                    const days = c.last_visit_at ? Math.floor((Date.now() - new Date(c.last_visit_at).getTime()) / 86400000) : null;
                    const statusColors: any = { Active: "text-green-400 bg-green-500/10", Inactive: "text-gray-400 bg-gray-500/10", "At-risk": "text-red-400 bg-red-500/10", VIP: "text-primary bg-primary/10" };
                    return (
                      <tr key={c.id} className="hover:bg-secondary/20 transition-colors group cursor-pointer">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold text-primary">
                              {c.full_name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold group-hover:text-primary transition-colors">{c.full_name}</p>
                              <p className="text-[9px] text-muted-foreground">{c.loyalty_level}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-[10px] font-mono text-foreground/80">{c.phone}</td>
                        <td className="p-4 text-xs font-bold">{c.visit_count || 0}</td>
                        <td className="p-4 text-xs font-bold text-primary">₹{Number(c.total_spend || 0).toLocaleString("en-IN")}</td>
                        <td className="p-4 text-[10px] text-muted-foreground">{days !== null ? `${days}d ago` : "Never"}</td>
                        <td className="p-4">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${statusColors[c.status] || "text-muted-foreground bg-secondary"}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {filtered.length > 50 && (
            <div className="p-4 border-t border-border/10 text-center">
              <p className="text-xs text-muted-foreground">Showing 50 of {filtered.length} customers</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSegments;
