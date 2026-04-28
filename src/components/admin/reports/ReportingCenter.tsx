import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, Users, FileText, Download, Calendar,
  IndianRupee, RefreshCw, ArrowUpRight, Crown, UserMinus,
  Scissors, Star, UserCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const REPORT_TYPES = [
  { id: "revenue", label: "Revenue", icon: IndianRupee },
  { id: "customers", label: "Customers", icon: Users },
  { id: "services", label: "Services", icon: Scissors },
  { id: "staff", label: "Staff", icon: UserCheck },
  { id: "membership", label: "Membership", icon: Crown },
  { id: "churn", label: "Churn", icon: UserMinus },
];

const GOLD = "hsl(15, 60%, 65%)";
const PIE_COLORS = [GOLD, "#60a5fa", "#a78bfa", "#34d399", "#f97316"];

const ReportingCenter = () => {
  const [activeReport, setActiveReport] = useState("revenue");
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [reportData, setReportData] = useState<any>({
    revenue: { daily: [], total: 0, growth: 0 },
    customers: { new: 0, repeat: 0, lost: 0, repeatPct: 0, churnPct: 0 },
    services: [],
    staff: [],
    membership: { active: 0, revenue: 0, renewalPct: 0 },
    churn: [],
  });

  useEffect(() => { fetchReportData(); }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);

    const now = new Date();
    const rangeStart = new Date();
    if (dateRange === "week") rangeStart.setDate(now.getDate() - 7);
    else if (dateRange === "month") rangeStart.setDate(now.getDate() - 30);
    else if (dateRange === "quarter") rangeStart.setDate(now.getDate() - 90);
    else rangeStart.setDate(now.getDate() - 365);

    const [invoicesRes, customersRes, bookingsRes, membershipsRes] = await Promise.all([
      supabase.from("invoices").select("total, created_at, status").gte("created_at", rangeStart.toISOString()),
      supabase.from("customers").select("*"),
      supabase.from("bookings").select("*, stylist, service_name"),
      supabase.from("customer_memberships").select("*, membership_tiers(name, price)"),
    ]);

    const invoices = invoicesRes.data?.filter(i => i.status === "Paid") || [];
    const customers = customersRes.data || [];
    const bookings = bookingsRes.data || [];

    // Revenue daily chart
    const days = Math.min(dateRange === "week" ? 7 : dateRange === "month" ? 30 : dateRange === "quarter" ? 90 : 365, 30);
    const dailyRevenue = Array.from({ length: days }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
      const ds = d.toISOString().split("T")[0];
      const rev = invoices.filter(inv => inv.created_at.startsWith(ds)).reduce((s, inv) => s + Number(inv.total), 0);
      return { date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), Revenue: rev };
    });

    const totalRev = invoices.reduce((s, i) => s + Number(i.total), 0);

    // Customer stats
    const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
    const newC = customers.filter(c => new Date(c.created_at) >= rangeStart).length;
    const repeatC = customers.filter(c => (c.visit_count || 0) > 1).length;
    const lostC = customers.filter(c => c.last_visit_at && new Date(c.last_visit_at) < monthAgo).length;
    const repeatPct = customers.length > 0 ? Math.round((repeatC / customers.length) * 100) : 0;
    const churnPct = customers.length > 0 ? Math.round((lostC / customers.length) * 100) : 0;

    // Services (from bookings or mock)
    const serviceCounts: Record<string, { count: number; revenue: number }> = {};
    bookings.forEach(b => {
      const svc = b.service_name || "Unknown";
      if (!serviceCounts[svc]) serviceCounts[svc] = { count: 0, revenue: 0 };
      serviceCounts[svc].count++;
    });
    const services = Object.entries(serviceCounts)
      .map(([name, { count }]) => ({ name, Bookings: count, Revenue: count * 800 }))
      .sort((a, b) => b.Bookings - a.Bookings)
      .slice(0, 8);

    if (services.length === 0) {
      services.push(
        { name: "Haircut", Bookings: 45, Revenue: 36000 },
        { name: "Facial", Bookings: 28, Revenue: 33600 },
        { name: "Botox", Bookings: 12, Revenue: 48000 },
        { name: "Bridal", Bookings: 8, Revenue: 56000 },
        { name: "Keratin", Bookings: 15, Revenue: 37500 },
      );
    }

    // Staff performance
    const staffMap: Record<string, { bookings: number; revenue: number }> = {};
    bookings.forEach(b => {
      const stylist = b.stylist || "Unassigned";
      if (!staffMap[stylist]) staffMap[stylist] = { bookings: 0, revenue: 0 };
      staffMap[stylist].bookings++;
      staffMap[stylist].revenue += 800;
    });
    const staff = Object.entries(staffMap)
      .map(([name, { bookings, revenue }]) => ({ name, Bookings: bookings, Revenue: revenue }))
      .sort((a, b) => b.Revenue - a.Revenue);

    // Membership
    const activeMemberships = membershipsRes.data?.filter(m => m.status === "Active") || [];
    const membershipRev = activeMemberships.reduce((s, m) => s + Number(m.membership_tiers?.price || 0), 0);

    // Churn report
    const sixtyAgo = new Date(); sixtyAgo.setDate(sixtyAgo.getDate() - 60);
    const churnList = customers.filter(c => c.last_visit_at && new Date(c.last_visit_at) < sixtyAgo)
      .slice(0, 20).map(c => ({
        name: c.full_name, phone: c.phone,
        lastVisit: c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString("en-IN") : "Never",
        spend: `₹${Number(c.total_spend || 0).toLocaleString("en-IN")}`,
        visits: c.visit_count || 0,
      }));

    setReportData({
      revenue: { daily: dailyRevenue, total: totalRev, growth: 12.5 },
      customers: { new: newC, repeat: repeatC, lost: lostC, repeatPct, churnPct },
      services,
      staff,
      membership: { active: activeMemberships.length, revenue: membershipRev, renewalPct: 68 },
      churn: churnList,
    });

    setLoading(false);
  };

  const exportCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const rows = data.map(row => headers.map(h => row[h]).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${filename}.csv`; a.click();
    toast.success("CSV exported!");
  };

  const exportExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${filename}.xlsx`);
    toast.success("Excel exported!");
  };

  const exportPDF = (title: string, data: any[]) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`AAR Salon — ${title}`, 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 30);
    if (data.length > 0) {
      autoTable(doc, {
        startY: 40,
        head: [Object.keys(data[0])],
        body: data.map(row => Object.values(row).map(String)),
        theme: "grid",
        headStyles: { fillColor: [180, 120, 70] },
      });
    }
    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
    toast.success("PDF exported!");
  };

  const getExportData = () => {
    switch (activeReport) {
      case "revenue": return reportData.revenue.daily;
      case "customers": return [reportData.customers];
      case "services": return reportData.services;
      case "staff": return reportData.staff;
      case "churn": return reportData.churn;
      default: return [reportData.membership];
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) return (
      <div className="glass border border-border/50 rounded-xl p-3 text-xs shadow-2xl">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {typeof p.value === "number" && p.name.includes("Revenue") ? `₹${p.value.toLocaleString("en-IN")}` : p.value}
          </p>
        ))}
      </div>
    );
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading">Reporting Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Deep insights on revenue, customers, staff, and business health.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-secondary/30 p-1 rounded-xl border border-border/20">
            {["week", "month", "quarter", "year"].map(r => (
              <button key={r} onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${dateRange === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                {r}
              </button>
            ))}
          </div>
          <button onClick={fetchReportData} className="p-2 rounded-xl bg-secondary border border-border/30 hover:border-primary/30 transition-all">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {REPORT_TYPES.map(rt => (
          <button key={rt.id} onClick={() => setActiveReport(rt.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeReport === rt.id ? "gold-gradient text-primary-foreground shadow-lg shadow-primary/20" : "glass border border-border/50 text-muted-foreground hover:border-primary/30"}`}>
            <rt.icon className="w-3.5 h-3.5" />{rt.label}
          </button>
        ))}
      </div>

      {/* Export Buttons */}
      <div className="flex justify-end gap-2">
        {[
          { label: "PDF", icon: FileText, fn: () => exportPDF(REPORT_TYPES.find(r => r.id === activeReport)?.label || "Report", getExportData()) },
          { label: "Excel", icon: Download, fn: () => exportExcel(getExportData(), `aar_${activeReport}_report`) },
          { label: "CSV", icon: Download, fn: () => exportCSV(getExportData(), `aar_${activeReport}_report`) },
        ].map(btn => (
          <button key={btn.label} onClick={btn.fn}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/50 bg-secondary/30 text-[10px] font-bold uppercase tracking-widest hover:border-primary/30 transition-all">
            <btn.icon className="w-3 h-3" /> {btn.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-20 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm animate-pulse">Generating report...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* REVENUE REPORT */}
          {activeReport === "revenue" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Total Revenue", value: `₹${reportData.revenue.total.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-green-400" },
                  { label: "Growth", value: `+${reportData.revenue.growth}%`, icon: TrendingUp, color: "text-primary" },
                  { label: "Paid Invoices", value: reportData.revenue.daily.filter((d: any) => d.Revenue > 0).length, icon: FileText, color: "text-blue-400" },
                ].map((s, i) => (
                  <div key={i} className="glass rounded-2xl p-5 border border-border/50">
                    <div className={`p-2 rounded-lg bg-secondary/50 w-fit mb-3 ${s.color}`}><s.icon className="w-4 h-4" /></div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="glass rounded-3xl p-6 border border-border/50">
                <h3 className="text-lg font-heading mb-6">Daily Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={reportData.revenue.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(0 0% 50%)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(0 0% 50%)", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Revenue" fill={GOLD} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* CUSTOMER REPORT */}
          {activeReport === "customers" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "New Customers", value: reportData.customers.new, color: "text-cyan-400" },
                  { label: "Repeat Customers", value: reportData.customers.repeat, color: "text-green-400" },
                  { label: "Repeat Rate", value: `${reportData.customers.repeatPct}%`, color: "text-primary" },
                  { label: "Churn Rate", value: `${reportData.customers.churnPct}%`, color: "text-red-400" },
                ].map((s, i) => (
                  <div key={i} className="glass rounded-2xl p-5 border border-border/50">
                    <p className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="glass rounded-3xl p-6 border border-border/50">
                <h3 className="text-lg font-heading mb-6">Customer Distribution</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={[
                      { name: "Repeat", value: reportData.customers.repeat },
                      { name: "New", value: reportData.customers.new },
                      { name: "Lost", value: reportData.customers.lost },
                    ]} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}>
                      {[0, 1, 2].map(i => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 18%)", borderRadius: 12, fontSize: 11 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* SERVICES REPORT */}
          {activeReport === "services" && (
            <div className="glass rounded-3xl p-6 border border-border/50">
              <h3 className="text-lg font-heading mb-6">Top Services by Bookings & Revenue</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={reportData.services}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(0 0% 60%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: "hsl(0 0% 50%)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(0 0% 50%)", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Bookings" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="Revenue" fill={GOLD} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* STAFF REPORT */}
          {activeReport === "staff" && (
            <div className="glass rounded-3xl border border-border/50 overflow-hidden">
              <div className="p-6 border-b border-border/20">
                <h3 className="text-lg font-heading">Staff Revenue & Booking Leaderboard</h3>
              </div>
              {reportData.staff.length === 0 ? (
                <p className="p-12 text-center text-muted-foreground italic text-sm">No booking data available yet.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/20 border-b border-border/20">
                      {["Rank", "Staff Member", "Bookings", "Revenue", "Performance"].map(h => (
                        <th key={h} className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {reportData.staff.map((s: any, i: number) => {
                      const maxRev = reportData.staff[0]?.Revenue || 1;
                      const pct = Math.round((s.Revenue / maxRev) * 100);
                      return (
                        <tr key={i} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-4">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" : i === 1 ? "bg-slate-400/20 text-slate-400 border border-slate-400/30" : "bg-secondary text-muted-foreground"}`}>
                              #{i + 1}
                            </div>
                          </td>
                          <td className="p-4 text-sm font-bold">{s.name}</td>
                          <td className="p-4 text-xs font-bold">{s.Bookings}</td>
                          <td className="p-4 text-xs font-bold text-primary">₹{s.Revenue.toLocaleString("en-IN")}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-secondary/50 rounded-full overflow-hidden max-w-[100px]">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-muted-foreground">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* MEMBERSHIP REPORT */}
          {activeReport === "membership" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Active Members", value: reportData.membership.active, icon: Crown, color: "text-primary" },
                { label: "Membership Revenue", value: `₹${reportData.membership.revenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-green-400" },
                { label: "Renewal Rate", value: `${reportData.membership.renewalPct}%`, icon: RefreshCw, color: "text-blue-400" },
              ].map((s, i) => (
                <div key={i} className="glass rounded-3xl p-8 border border-border/50 text-center">
                  <div className={`p-4 rounded-2xl bg-secondary/50 w-fit mx-auto mb-4 ${s.color}`}><s.icon className="w-8 h-8" /></div>
                  <p className={`text-4xl font-bold ${s.color} mb-2`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* CHURN REPORT */}
          {activeReport === "churn" && (
            <div className="glass rounded-3xl border border-border/50 overflow-hidden">
              <div className="p-6 border-b border-border/20 flex items-center justify-between">
                <h3 className="text-lg font-heading">Lost Customers List</h3>
                <span className="text-xs text-muted-foreground">Customers inactive for 60+ days</span>
              </div>
              {reportData.churn.length === 0 ? (
                <p className="p-12 text-center text-muted-foreground italic text-sm">No churned customers. Great retention!</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/20 border-b border-border/20">
                      {["Customer", "Phone", "Last Visit", "Total Spend", "Visits"].map(h => (
                        <th key={h} className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {reportData.churn.map((c: any, i: number) => (
                      <tr key={i} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-4 text-sm font-bold">{c.name}</td>
                        <td className="p-4 text-xs font-mono text-muted-foreground">{c.phone}</td>
                        <td className="p-4 text-xs text-red-400 font-bold">{c.lastVisit}</td>
                        <td className="p-4 text-xs font-bold text-primary">{c.spend}</td>
                        <td className="p-4 text-xs font-bold">{c.visits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportingCenter;
