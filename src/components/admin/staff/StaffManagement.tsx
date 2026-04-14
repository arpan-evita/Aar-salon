import { useState, useEffect } from "react";
import { 
  Users, UserCheck, Shield, Trash2, Plus, Mail, 
  TrendingUp, IndianRupee, Clock, Award, CheckCircle2,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
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
  is_available?: boolean;
};

const StaffManagement = () => {
  const { user, roles, hasRole } = useAuth();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("staff");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("user_roles")
      .select("user_id, role");
    
    if (data) {
      const userIds = data.map(d => d.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, commission_rate, is_available")
        .in("id", userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      setStaffList(data.map(d => ({
        user_id: d.user_id,
        role: d.role,
        full_name: profileMap.get(d.user_id)?.full_name || "New Stylist",
        commission_rate: profileMap.get(d.user_id)?.commission_rate || 10,
        is_available: profileMap.get(d.user_id)?.is_available ?? true,
      })));
    }
    setLoading(false);
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
        loadStaff();
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
    setInviting(false);
  };

  const updateStaffAvailability = async (userId: string, current: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_available: !current })
      .eq('id', userId);
    
    if (!error) {
      setStaffList(prev => prev.map(s => s.user_id === userId ? { ...s, is_available: !current } : s));
      toast.success("Availability updated.");
    }
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
          <h2 className="text-2xl font-heading text-foreground">Staff Performance & Payroll</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your dream team, track commissions and daily attendance.</p>
        </div>
        <button 
          onClick={() => setIsInviteSheetOpen(true)}
          className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: staffList.length, icon: Users, color: "text-primary" },
          { label: "On Duty", value: staffList.filter(s => s.is_available).length, icon: UserCheck, color: "text-green-400" },
          { label: "Avg Performance", value: "88%", icon: TrendingUp, color: "text-blue-400" },
          { label: "Pending Payroll", value: "2/12 Paid", icon: IndianRupee, color: "text-yellow-500" },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/30 bg-secondary/10 flex flex-col md:flex-row gap-4 items-center justify-between">
           <h3 className="text-sm font-bold flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Active Stylists & Performance</h3>
           <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Filter:</span>
              <select className="bg-background border border-border/50 rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none">
                 <option>Performance (High to Low)</option>
                 <option>Payroll Type</option>
              </select>
           </div>
        </div>

        <div className="divide-y divide-border/10">
          {loading ? (
            <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
          ) : staffList.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground italic">No team members found. Start by inviting your staff.</div>
          ) : staffList.map((s) => (
            <div key={`${s.user_id}-${s.role}`} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-secondary/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="relative">
                   <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center border border-border/30">
                     <Users className="w-6 h-6 text-primary" />
                   </div>
                   <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${s.is_available ? 'bg-green-500' : 'bg-gray-500'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground font-bold">{s.full_name}</p>
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-border/50 ${roleColor(s.role)}`}>
                      {s.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Shift: 10:00 AM - 08:00 PM
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-1 max-w-lg">
                 <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Commission</p>
                    <p className="text-sm font-bold text-primary">{s.commission_rate}% <span className="text-[9px] text-muted-foreground font-normal">per service</span></p>
                 </div>
                 <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Generated Revenue</p>
                    <p className="text-sm font-bold">₹12,450 <span className="text-[9px] text-green-400">↑ 12%</span></p>
                 </div>
                 <div className="hidden md:block">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Rating</p>
                    <div className="flex items-center gap-1">
                       <Award className="w-3 h-3 text-yellow-500" />
                       <span className="text-sm font-bold">4.9</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateStaffAvailability(s.user_id, s.is_available ?? true)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    s.is_available ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                  }`}
                >
                  {s.is_available ? "Offline" : "Check-in"}
                </button>
                <button className="p-2.5 rounded-xl border border-border/30 text-muted-foreground hover:text-primary transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    placeholder="staff@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Initial Role</label>
                  <select 
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                  >
                    <option value="staff">Staff / Stylist</option>
                    <option value="manager">Salon Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                   <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                     * Staff members will be able to mark their attendance and view their own commissions. Managers can see performance reports for their branch.
                   </p>
                </div>
              </div>
            </div>

            <div className="mt-auto p-6 border-t border-border/10 bg-secondary/10">
               <button 
                  onClick={handleInvite} 
                  disabled={inviting || !inviteEmail.trim()}
                  className="w-full gold-gradient text-primary-foreground py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 {inviting ? "Sending Invitation..." : "Send Invitation"}
               </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StaffManagement;
