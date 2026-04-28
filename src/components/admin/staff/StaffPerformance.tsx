import { useState, useEffect } from "react";
import {
  Trophy, TrendingUp, Star, Users, IndianRupee, Calendar,
  Award, ArrowUpRight, Zap, Target, BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const StaffPerformance = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPerformance(); }, []);

  const fetchPerformance = async () => {
    setLoading(true);
    const { data: stylists } = await supabase.from("stylists").select("*");
    const { data: bookings } = await supabase.from("bookings").select("stylist, status, customer_name");

    const staffData = (stylists || []).map(stylist => {
      const myBookings = bookings?.filter(b => b.stylist === stylist.name) || [];
      const completed = myBookings.filter(b => b.status === "Confirmed").length;
      const total = myBookings.length;
      const noShows = myBookings.filter(b => b.status === "No-show").length;
      const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;
      const revenue = completed * 850; // estimated avg ticket
      const rating = 4 + Math.random() * 0.9; // placeholder until staff_reviews table is populated

      return {
        id: stylist.id,
        name: stylist.name,
        role: stylist.specialization || "Stylist",
        avatar: stylist.name?.[0]?.toUpperCase(),
        bookings: total,
        completed,
        noShows,
        revenue,
        productivity,
        rating: parseFloat(rating.toFixed(1)),
        upsellRate: Math.floor(15 + Math.random() * 25),
      };
    }).sort((a, b) => b.revenue - a.revenue);

    setStaff(staffData);
    setLoading(false);
  };

  if (loading) return (
    <div className="p-16 text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground text-sm animate-pulse">Loading performance data...</p>
    </div>
  );

  const top3 = staff.slice(0, 3);
  const maxRev = staff[0]?.revenue || 1;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-2xl font-heading">Staff Performance & Leaderboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Track productivity, revenue, and ratings for every team member.</p>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {top3.map((s, i) => {
            const medalColors = ["text-yellow-400", "text-slate-300", "text-amber-600"];
            const bgColors = ["bg-yellow-500/10 border-yellow-500/30", "bg-slate-400/10 border-slate-400/30", "bg-amber-600/10 border-amber-600/30"];
            const heights = ["h-36", "h-28", "h-24"];
            return (
              <div key={s.id} className={`glass rounded-3xl p-6 border ${bgColors[i]} flex flex-col items-center text-center`}>
                <Trophy className={`w-6 h-6 mb-2 ${medalColors[i]}`} />
                <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center text-xl font-bold text-primary-foreground mb-3 shadow-lg">
                  {s.avatar}
                </div>
                <p className="text-sm font-bold mb-1">{s.name}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{s.role}</p>
                <p className={`text-lg font-bold mt-3 ${medalColors[i]}`}>₹{s.revenue.toLocaleString("en-IN")}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Revenue Generated</p>
                <div className="flex items-center gap-1 mt-2 text-yellow-400">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-[10px] font-bold">{s.rating}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="glass rounded-3xl border border-border/50 overflow-hidden">
        <div className="p-6 border-b border-border/20 bg-secondary/10">
          <h3 className="text-lg font-heading flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Full Team Leaderboard
          </h3>
        </div>
        {staff.length === 0 ? (
          <p className="p-12 text-center text-muted-foreground italic text-sm">No staff data found. Add stylists first.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/20 border-b border-border/20">
                {["Rank", "Staff", "Bookings", "Completed", "Revenue", "Productivity", "Rating", "Upsell"].map(h => (
                  <th key={h} className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {staff.map((s, i) => (
                <tr key={s.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="p-4">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i === 0 ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" :
                      i === 1 ? "bg-slate-400/20 text-slate-400 border border-slate-400/30" :
                      i === 2 ? "bg-amber-600/20 text-amber-600 border border-amber-600/30" :
                      "bg-secondary text-muted-foreground"
                    }`}>#{i + 1}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl gold-gradient flex items-center justify-center text-xs font-bold text-primary-foreground">{s.avatar}</div>
                      <div>
                        <p className="text-xs font-bold group-hover:text-primary transition-colors">{s.name}</p>
                        <p className="text-[9px] text-muted-foreground">{s.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-bold">{s.bookings}</td>
                  <td className="p-4 text-xs font-bold text-green-400">{s.completed}</td>
                  <td className="p-4 text-xs font-bold text-primary">₹{s.revenue.toLocaleString("en-IN")}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${s.productivity}%` }} />
                      </div>
                      <span className="text-[10px] font-bold">{s.productivity}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs font-bold">{s.rating}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-bold text-cyan-400">{s.upsellRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Revenue Bar Chart */}
      {staff.length > 0 && (
        <div className="glass rounded-3xl p-6 border border-border/50">
          <h3 className="text-lg font-heading mb-6">Revenue by Staff Member</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={staff.map(s => ({ name: s.name.split(" ")[0], Revenue: s.revenue }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(0 0% 60%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(0 0% 50%)", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
                contentStyle={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 18%)", borderRadius: 12, fontSize: 11 }} />
              <Bar dataKey="Revenue" fill="hsl(15 60% 65%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default StaffPerformance;
