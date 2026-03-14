import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays, Users, Scissors, BarChart3, Clock, ArrowLeft,
  TrendingUp, IndianRupee, UserCheck, Calendar, LogOut, Plus, Mail, Shield, Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ServicesTab from "@/components/admin/ServicesTab";
import logo from "@/assets/logo.jpg";

const tabs = [
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "customers", label: "Customers", icon: Users },
  { id: "staff", label: "Staff", icon: UserCheck },
  { id: "services", label: "Services", icon: Scissors },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

type Booking = {
  id: string;
  customer_name: string;
  service: string;
  stylist: string;
  booking_date: string;
  booking_time: string;
  status: string;
};

type StaffMember = {
  user_id: string;
  role: string;
  email?: string;
  full_name?: string;
};

const AdminDashboard = () => {
  const { user, roles, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);

  // Staff state
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("staff");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, count } = await supabase
        .from("bookings")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setBookings(data);
      if (count !== null) setTotalBookings(count);
    };
    load();
  }, []);

  // Load staff when tab is active
  useEffect(() => {
    if (activeTab !== "staff") return;
    loadStaff();
  }, [activeTab]);

  const loadStaff = async () => {
    setStaffLoading(true);
    const { data } = await supabase
      .from("user_roles")
      .select("user_id, role");
    
    if (data) {
      // Fetch profiles for names
      const userIds = data.map(d => d.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      
      setStaffList(data.map(d => ({
        user_id: d.user_id,
        role: d.role,
        full_name: profileMap.get(d.user_id) || "",
      })));
    }
    setStaffLoading(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError("");
    setInviteMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("invite-staff", {
        body: { email: inviteEmail.trim(), role: inviteRole },
      });

      if (error) {
        setInviteError(error.message || "Failed to invite staff");
      } else if (data?.error) {
        setInviteError(data.error);
      } else {
        setInviteMessage(data.message);
        setInviteEmail("");
        setShowInviteForm(false);
        loadStaff();
      }
    } catch (err: any) {
      setInviteError(err.message || "Something went wrong");
    }
    setInviting(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const roleColor = (role: string) => {
    if (role === "admin") return "bg-primary/10 text-primary border-primary/30";
    if (role === "manager") return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    return "bg-green-500/10 text-green-400 border-green-500/30";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 glass-strong border-r border-border/30 p-6 hidden lg:flex flex-col">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <img src={logo} alt="AAR Salon" className="w-8 h-8 rounded-full object-cover" />
          <span className="font-heading text-lg text-primary">AAR Salon</span>
        </Link>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">Admin Panel</p>
        <nav className="space-y-1 flex-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 ${
                activeTab === tab.id ? "bg-primary/10 text-primary gold-border" : "text-foreground/60 hover:text-foreground hover:bg-secondary/50"
              }`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border/30 pt-4 mt-4">
          <p className="text-xs text-muted-foreground mb-2 truncate">{user?.email}</p>
          <p className="text-xs text-primary mb-3 capitalize">{roles.join(", ")}</p>
          <button onClick={async () => { await signOut(); navigate("/login"); }}
            className="flex items-center gap-2 text-sm text-foreground/60 hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8">
        <div className="lg:hidden flex items-center justify-between mb-6">
          <Link to="/" className="font-heading text-lg text-primary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-6">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all ${
                activeTab === tab.id ? "gold-gradient text-primary-foreground" : "bg-secondary text-foreground/60"
              }`}>
              <tab.icon className="w-3 h-3" />{tab.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: String(totalBookings), icon: CalendarDays },
            { label: "Pending", value: String(bookings.filter((b) => b.status === "Pending").length), icon: Clock },
            { label: "Confirmed", value: String(bookings.filter((b) => b.status === "Confirmed").length), icon: UserCheck },
            { label: "Team Members", value: String(staffList.length || roles.length), icon: Users },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4 md:p-6">
              <stat.icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bookings tab */}
        {activeTab === "bookings" && (
          <div className="glass rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border/30">
              <h2 className="font-heading text-xl text-foreground">Recent Bookings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left text-xs text-muted-foreground font-medium p-4 uppercase tracking-wider">Customer</th>
                    <th className="text-left text-xs text-muted-foreground font-medium p-4 uppercase tracking-wider">Service</th>
                    <th className="text-left text-xs text-muted-foreground font-medium p-4 uppercase tracking-wider hidden md:table-cell">Stylist</th>
                    <th className="text-left text-xs text-muted-foreground font-medium p-4 uppercase tracking-wider">Date</th>
                    <th className="text-left text-xs text-muted-foreground font-medium p-4 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No bookings yet</td></tr>
                  ) : bookings.map((b) => (
                    <tr key={b.id} className="border-b border-border/20 hover:bg-secondary/30 transition-colors">
                      <td className="p-4 text-sm text-foreground">{b.customer_name}</td>
                      <td className="p-4 text-sm text-foreground/70">{b.service}</td>
                      <td className="p-4 text-sm text-foreground/70 hidden md:table-cell">{b.stylist}</td>
                      <td className="p-4 text-sm text-foreground/70">{formatDate(b.booking_date)}, {b.booking_time}</td>
                      <td className="p-4">
                        <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)}
                          className={`text-xs px-3 py-1 rounded-full bg-transparent border cursor-pointer ${
                            b.status === "Confirmed" ? "border-green-500/30 text-green-400" : b.status === "Cancelled" ? "border-red-500/30 text-red-400" : "border-primary/30 text-primary"
                          }`}>
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Staff tab */}
        {activeTab === "staff" && (
          <div>
            {/* Invite feedback */}
            {inviteMessage && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg p-4 mb-6 flex items-center gap-2">
                <Mail className="w-4 h-4" /> {inviteMessage}
              </div>
            )}
            {inviteError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg p-4 mb-6">
                {inviteError}
              </div>
            )}

            <div className="glass rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border/30 flex items-center justify-between">
                <h2 className="font-heading text-xl text-foreground">Team Members</h2>
                {hasRole("admin") && (
                  <button onClick={() => { setShowInviteForm(!showInviteForm); setInviteError(""); setInviteMessage(""); }}
                    className="gold-gradient text-primary-foreground px-4 py-2 text-xs font-medium tracking-wider uppercase rounded flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <Plus className="w-3 h-3" /> Invite Staff
                  </button>
                )}
              </div>

              {/* Invite form */}
              {showInviteForm && (
                <div className="p-6 border-b border-border/30 bg-secondary/20">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Staff email address"
                      className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                      className="bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors">
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}
                      className="gold-gradient text-primary-foreground px-6 py-3 text-sm font-medium tracking-wider uppercase rounded hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                      {inviting ? "Sending..." : "Send Invite"}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    An invitation email will be sent. If they already have an account, the role will be assigned directly.
                  </p>
                </div>
              )}

              {/* Staff list */}
              <div className="divide-y divide-border/20">
                {staffLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : staffList.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <UserCheck className="w-10 h-10 text-primary/30 mx-auto mb-3" />
                    <p>No team members yet. Invite your first staff member.</p>
                  </div>
                ) : (
                  staffList.map((s) => (
                    <div key={`${s.user_id}-${s.role}`} className="p-5 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <Shield className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-foreground font-medium">
                            {s.full_name || "Unnamed User"}
                            {s.user_id === user?.id && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{s.user_id.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-3 py-1 rounded-full border capitalize ${roleColor(s.role)}`}>
                          {s.role}
                        </span>
                        {hasRole("admin") && s.user_id !== user?.id && (
                          <button
                            onClick={async () => {
                              if (!confirm(`Remove "${s.role}" role from ${s.full_name || "this user"}?`)) return;
                              await supabase.from("user_roles").delete().eq("user_id", s.user_id).eq("role", s.role as any);
                              loadStaff();
                            }}
                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Remove role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Services tab */}
        {activeTab === "services" && <ServicesTab />}

        {/* Other tabs placeholder */}
        {activeTab !== "bookings" && activeTab !== "staff" && activeTab !== "services" && (
          <div className="glass rounded-xl p-12 text-center">
            <Clock className="w-12 h-12 text-primary/40 mx-auto mb-4" />
            <h3 className="font-heading text-xl text-foreground mb-2">{tabs.find(t => t.id === activeTab)?.label}</h3>
            <p className="text-muted-foreground text-sm">This section is under development.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
