import { useState, useEffect } from "react";
import { 
  Users, UserCheck, Shield, Trash2, Plus, Mail, 
  TrendingUp, IndianRupee, Clock, Award, CheckCircle2,
  Settings, History, CreditCard, Activity, BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import StaffPerformance from "./StaffPerformance";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type StaffMember = {
  user_id: string;
  role: string;
  email?: string;
  full_name?: string;
  commission_rate?: number;
  base_salary?: number;
  is_available?: boolean;
  generated_revenue?: number;
  total_commissions?: number;
  attendance_count?: number;
  shift_start?: string;
  shift_end?: string;
};

const StaffManagement = () => {
  const { user, roles, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "payroll">("overview");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("staff");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadStaffData();
  }, [activeTab]);

  const loadStaffData = async () => {
    setLoading(true);
    
    // 1. Fetch Staff Roles
    const { data: rolesData } = await supabase.from("user_roles").select("user_id, role");
    
    if (rolesData) {
      const userIds = rolesData.map(d => d.user_id);
      
      // 2. Fetch Profiles with full details
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);
      
      // 3. Fetch Performance Metrics (Generated Revenue from Invoices)
      const { data: perfData } = await supabase
        .from('invoice_items')
        .select('staff_id, total_price')
        .not('staff_id', 'is', null);

      const revenueMap = new Map();
      perfData?.forEach(item => {
        const current = revenueMap.get(item.staff_id) || 0;
        revenueMap.set(item.staff_id, current + Number(item.total_price));
      });

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const mappedStaff = rolesData.map(d => {
        const profile = profileMap.get(d.user_id);
        const revenue = revenueMap.get(d.user_id) || 0;
        const commRate = profile?.commission_rate || 10;
        
        return {
          user_id: d.user_id,
          role: d.role,
          full_name: profile?.full_name || "New Stylist",
          commission_rate: commRate,
          base_salary: profile?.base_salary || 0,
          is_available: profile?.is_available ?? true,
          generated_revenue: revenue,
          total_commissions: (revenue * commRate) / 100,
          shift_start: profile?.shift_start || "10:00:00",
          shift_end: profile?.shift_end || "20:00:00",
        };
      });

      setStaffList(mappedStaff);

      if (activeTab === 'payroll') {
        const { data: payroll } = await supabase
          .from('staff_payroll')
          .select('*, profiles(full_name)')
          .order('created_at', { ascending: false });
        setPayrollRecords(payroll || []);
      }
    }
    setLoading(false);
  };

  const handleClockToggle = async (staffId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_available: !currentStatus })
      .eq('id', staffId);

    if (error) {
      toast.error("Failed to update status.");
    } else {
      // Record in attendance table
      if (!currentStatus) {
        await supabase.from('staff_attendance').insert({ staff_id: staffId, clock_in: new Date().toISOString() });
        toast.success("Clocked in successfully.");
      } else {
        const { data: openAttendance } = await supabase
          .from('staff_attendance')
          .select('id')
          .eq('staff_id', staffId)
          .is('clock_out', null)
          .order('clock_in', { ascending: false })
          .limit(1)
          .single();
        
        if (openAttendance) {
          await supabase.from('staff_attendance').update({ clock_out: new Date().toISOString() }).eq('id', openAttendance.id);
        }
        toast.success("Clocked out successfully.");
      }
      loadStaffData();
    }
  };

  const processPayroll = async (staff: StaffMember) => {
    const periodStart = new Date();
    periodStart.setMonth(periodStart.getMonth() - 1);
    periodStart.setDate(1);
    
    const periodEnd = new Date();
    periodEnd.setDate(0); // Last day of prev month

    const { error } = await supabase.from('staff_payroll').insert({
      staff_id: staff.user_id,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      base_amount: staff.base_salary,
      commission_amount: staff.total_commissions,
      total_amount: (staff.base_salary || 0) + (staff.total_commissions || 0),
      status: 'Pending'
    });

    if (error) toast.error("Failed to generate payroll.");
    else {
      toast.success(`Payroll generated for ${staff.full_name}`);
      setActiveTab('payroll');
      loadStaffData();
    }
  };

  const markPayrollAsPaid = async (payrollId: string) => {
     const { error } = await supabase
       .from('staff_payroll')
       .update({ status: 'Paid', payment_date: new Date().toISOString() })
       .eq('id', payrollId);
     
     if (error) toast.error("Update failed.");
     else {
       toast.success("Payroll marked as paid.");
       loadStaffData();
     }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);

    try {
      const { data, error } = await supabase.functions.invoke("invite-staff", {
        body: { email: inviteEmail.trim(), role: inviteRole },
      });

      if (error || data?.error) {
        toast.error(error?.message || data?.error || "Failed to invite staff");
      } else {
        toast.success(data.message);
        setInviteEmail("");
        setIsInviteSheetOpen(false);
        loadStaffData();
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
    setInviting(false);
  };

  const roleColor = (role: string) => {
    if (role === "admin") return "bg-primary/10 text-primary border-primary/30";
    if (role === "manager") return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    return "bg-green-500/10 text-green-400 border-green-500/30";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Staff Excellence Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Unified command for team performance, real-time attendance, and automated payroll.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-secondary/30 p-1 rounded-xl border border-border/20 backdrop-blur-md">
             {(["overview", "performance", "payroll"] as const).map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                   activeTab === tab ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-secondary"
                 }`}
               >
                 {tab}
               </button>
             ))}
          </div>
          <button 
            onClick={() => setIsInviteSheetOpen(true)}
            className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Add Team Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Team", value: staffList.length, icon: Users, color: "text-primary" },
          { label: "Active Now", value: staffList.filter(s => s.is_available).length, icon: UserCheck, color: "text-green-400" },
          { label: "Payroll Liability", value: `₹${staffList.reduce((acc, s) => acc + (s.base_salary || 0) + (s.total_commissions || 0), 0).toLocaleString()}`, icon: CreditCard, color: "text-red-400" },
          { label: "Revenue Share", value: "₹2.2L", icon: BarChart3, color: "text-blue-400" },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-secondary/50 ${stat.color}`}>
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

      {activeTab === 'payroll' ? (
        <div className="glass rounded-2xl border border-border/50 overflow-hidden shadow-xl">
           <div className="p-4 border-b border-border/30 bg-secondary/10 flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Payroll Disbursement Log</h3>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic animate-pulse">Checking for pending cycles...</div>
           </div>
           <div className="overflow-x-auto no-scrollbar">
              <table className="w-full">
                 <thead>
                    <tr className="bg-secondary/20 border-b border-border/30">
                       <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Staff Member</th>
                       <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Period</th>
                       <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Salary</th>
                       <th className="text-right p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border/10">
                    {payrollRecords.length === 0 ? (
                      <tr><td colSpan={4} className="p-12 text-center text-muted-foreground italic">No payroll records found. Go to Performance to generate one.</td></tr>
                    ) : payrollRecords.map((p) => (
                      <tr key={p.id} className="hover:bg-secondary/10 transition-colors">
                         <td className="p-4">
                            <p className="text-xs font-bold text-foreground">{p.profiles?.full_name}</p>
                            <p className="text-[9px] text-muted-foreground italic tracking-tight">ID: {p.id.slice(0, 8)}</p>
                         </td>
                         <td className="p-4 text-xs font-mono text-muted-foreground">
                            {new Date(p.period_start).toLocaleDateString()} - {new Date(p.period_end).toLocaleDateString()}
                         </td>
                         <td className="p-4 text-xs font-bold text-foreground">₹{Number(p.total_amount).toLocaleString()}</td>
                         <td className="p-4 text-right">
                            {p.status === 'Paid' ? (
                              <span className="text-[9px] font-bold uppercase px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 shadow-sm">Distributed</span>
                            ) : (
                              <button 
                                onClick={() => markPayrollAsPaid(p.id)}
                                className="text-[9px] font-bold uppercase px-3 py-1 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                              >
                                Release Payment
                              </button>
                            )}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      ) : activeTab === 'performance' ? (
        <StaffPerformance />
      ) : (
        <div className="glass rounded-2xl border border-border/50 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-border/30 bg-secondary/10 flex flex-col md:flex-row gap-4 items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Real-time Team Status
            </h3>
          </div>

          <div className="divide-y divide-border/10">
            {loading ? (
              <div className="p-24 text-center">
                 <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Workforce Data...</p>
              </div>
            ) : staffList.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground italic">No team members onboarded.</div>
            ) : staffList.map((s) => (
              <div key={`${s.user_id}-${s.role}`} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-secondary/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center border border-border/30 shadow-inner group-hover:border-primary/30 transition-all">
                      <Users className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background shadow-lg ${s.is_available ? 'bg-green-500 animate-pulse' : 'bg-secondary'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base text-foreground font-bold tracking-tight">{s.full_name}</p>
                      <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${roleColor(s.role)} shadow-sm`}>
                        {s.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                       <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium italic">
                         <Clock className="w-3 h-3" /> {s.shift_start.slice(0, 5)} - {s.shift_end.slice(0, 5)}
                       </p>
                       <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                          <History className="w-3 h-3" /> 12 Services Ready
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-8 flex-1 max-w-xl">
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Current Status</p>
                    <p className={`text-sm font-bold ${s.is_available ? 'text-green-400' : 'text-muted-foreground'}`}>
                       {s.is_available ? 'Station Active' : 'Offline / Rest'}
                    </p>
                  </div>
                  <div className="space-y-1 text-right md:text-left">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Satisfaction</p>
                    <div className="flex items-center justify-end md:justify-start gap-1 text-yellow-500">
                      <StarIcon />
                      <span className="text-sm font-bold">4.8</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleClockToggle(s.user_id, s.is_available ?? true)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg ${
                      s.is_available 
                        ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 shadow-red-500/5" 
                        : "gold-gradient text-primary-foreground hover:opacity-90 shadow-primary/20"
                    }`}
                  >
                    {s.is_available ? "Clock Out" : "Clock In"}
                  </button>
                  <button 
                    onClick={() => processPayroll(s)}
                    className="p-2.5 rounded-xl border border-border/30 text-muted-foreground hover:text-primary transition-all hover:bg-primary/5"
                    title="Generate Pay Record"
                  >
                    <IndianRupee className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Member Sheet */}
      <Sheet open={isInviteSheetOpen} onOpenChange={setIsInviteSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto glass-strong border-l border-border/30 p-0">
          <div className="flex flex-col h-full">
            <div className="p-8">
              <SheetHeader className="mb-8">
                <SheetTitle className="text-2xl font-heading text-foreground">Invite Team Member</SheetTitle>
                <SheetDescription>Send an invitation to join the salon management system.</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-heading">Email Address</label>
                  <input
                    type="email"
                    placeholder="staff@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-secondary/30 border border-border/30 rounded-xl px-4 py-3.5 text-sm focus:border-primary/50 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-heading">Operational Role</label>
                  <select 
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-secondary/30 border border-border/30 rounded-xl px-4 py-3.5 text-sm focus:border-primary/50 outline-none transition-all cursor-pointer"
                  >
                    <option value="staff">Stylist / Technician</option>
                    <option value="manager">Salon Manager</option>
                    <option value="admin">Platform Administrator</option>
                  </select>
                </div>
                
                <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
                   <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Shield className="w-5 h-5" />
                   </div>
                   <p className="text-[10px] text-muted-foreground leading-relaxed italic font-medium">
                     New team members will receive an email to set their password. Once they log in, they can view their assigned services and track their daily commissions.
                   </p>
                </div>
              </div>
            </div>

            <div className="mt-auto p-6 bg-secondary/10 border-t border-border/20">
               <button 
                  onClick={handleInvite} 
                  disabled={inviting || !inviteEmail.trim()}
                  className="w-full gold-gradient text-primary-foreground py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 {inviting ? (
                   <>
                     <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                     Negotiating Handshake...
                   </>
                 ) : "Deploy Invitation"}
               </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const StarIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default StaffManagement;
