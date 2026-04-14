import { useState, useEffect } from "react";
import { 
  Users, TrendingUp, Star, Calendar, 
  Award, ShieldCheck, Zap, ArrowUpRight,
  PieChart, Activity, UserCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StaffPerformance = () => {
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffPerformance();
  }, []);

  const fetchStaffPerformance = async () => {
    setLoading(true);
    // Fetch from the new view we created in the migration
    const { data } = await supabase
      .from('staff_performance_summary')
      .select('*')
      .order('total_revenue', { ascending: false });
    
    if (data) setPerformanceData(data);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Operational Staff Intelligence</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time performance metrics and ROI analysis for your styling team.</p>
        </div>
        <div className="p-1 px-3 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Efficiency Meta Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Top Performer", value: performanceData[0]?.stylist_name || "N/A", icon: Award, color: "text-primary" },
          { label: "Avg. Occupancy", value: "78%", icon: Activity, color: "text-blue-400" },
          { label: "Guest Satisfaction", value: "4.8/5", icon: Star, color: "text-yellow-400" },
          { label: "Retention Rate", value: "62%", icon: UserCheck, color: "text-green-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl bg-secondary/50 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-0.5">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-3xl border border-border/50 overflow-hidden shadow-2xl">
           <div className="p-6 border-b border-border/30 bg-secondary/10">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <TrendingUp className="w-4 h-4" /> Revenue Contribution Leaderboard
              </h3>
           </div>
           <div className="overflow-x-auto no-scrollbar">
              <table className="w-full">
                 <thead>
                    <tr className="bg-secondary/20 border-b border-border/10">
                       <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stylist Name</th>
                       <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bookings</th>
                       <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Revenue</th>
                       <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rating</th>
                       <th className="text-right p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Growth</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border/10">
                    {loading ? (
                      <tr><td colSpan={5} className="p-12 text-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                    ) : performanceData.map((staff, i) => (
                      <tr key={staff.stylist_id} className="hover:bg-secondary/10 transition-colors group">
                         <td className="p-4">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-[10px] font-bold text-primary border border-border/20">
                                  {staff.stylist_name[0]}
                               </div>
                               <div>
                                  <p className="text-xs font-bold">{staff.stylist_name}</p>
                                  <p className="text-[9px] text-muted-foreground italic">{i === 0 ? 'Lead Specialist' : 'Senior Stylist'}</p>
                               </div>
                            </div>
                         </td>
                         <td className="p-4">
                            <p className="text-xs font-bold">{staff.total_bookings}</p>
                            <p className="text-[9px] text-muted-foreground">{staff.completed_bookings} Completed</p>
                         </td>
                         <td className="p-4 font-bold text-xs text-primary">₹{Number(staff.total_revenue).toLocaleString()}</td>
                         <td className="p-4">
                            <div className="flex items-center gap-1.5">
                               <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                               <span className="text-xs font-bold">{Number(staff.average_rating || 4.5).toFixed(1)}</span>
                            </div>
                         </td>
                         <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full inline-flex">
                               +12% <ArrowUpRight className="w-3 h-3" />
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        <div className="space-y-6">
           <div className="glass rounded-3xl p-8 border border-border/50 relative overflow-hidden h-full">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <h3 className="text-lg font-heading mb-8 flex items-center gap-3 relative z-10">
                 <Zap className="w-5 h-5 text-primary" /> Efficiency Meta
              </h3>
              <div className="space-y-8 relative z-10">
                 {[
                   { label: "Service Speed", value: "Optimal", color: "text-green-400" },
                   { label: "Upsell Rate", value: "24%", color: "text-primary" },
                   { label: "Cancel Rate", value: "< 5%", color: "text-blue-400" },
                   { label: "Product Sync", value: "Strong", color: "text-purple-400" },
                 ].map((meta, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-default">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{meta.label}</span>
                      <span className={`text-[11px] font-bold ${meta.color} group-hover:tracking-widest transition-all`}>{meta.value}</span>
                   </div>
                 ))}
                 
                 <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 mt-8">
                    <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                       <ShieldCheck className="w-3.5 h-3.5" /> Training Insight
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                      "Team-wide upsell rate increased by 5.5% this month. Recommend specialized 'Bridal Upsell' session for junior staff."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPerformance;
