import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays, Users, Scissors, BarChart3, Clock, ArrowLeft,
  TrendingUp, IndianRupee, UserCheck, Calendar, LogOut, Plus, Mail, Shield, Trash2,
  Package, BookOpen, Target, Star, LayoutDashboard, TicketPercent, Award, ChevronDown,
  Menu, X, Search, Bell, Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ServicesTab from "@/components/admin/ServicesTab";
import GrowthCommandCenter from "@/components/admin/GrowthCommandCenter";
import CustomerCRM from "@/components/admin/crm/CustomerCRM";
import AcademyDashboard from "@/components/admin/academy/AcademyDashboard";
import BillingSystem from "@/components/admin/billing/BillingSystem";
import OffersManager from "@/components/admin/offers/OffersManager";
import InventoryControl from "@/components/admin/inventory/InventoryControl";
import SmartAutomation from "@/components/admin/automation/SmartAutomation";
import MessagingHub from "@/components/admin/automation/MessagingHub";
import LeadPipeline from "@/components/admin/leads/LeadPipeline";
import ReviewsEngine from "@/components/admin/reviews/ReviewsEngine";
import LoyaltyProgram from "@/components/admin/loyalty/LoyaltyProgram";
import StaffManagement from "@/components/admin/staff/StaffManagement";
import StaffPerformance from "@/components/admin/staff/StaffPerformance";
import CampaignBuilder from "@/components/admin/automation/CampaignBuilder";
import logo from "@/assets/logo.jpg";

type TabGroup = {
  label: string;
  items: { id: string; label: string; icon: any }[];
};

const tabGroups: TabGroup[] = [
  {
    label: "Core",
    items: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "bookings", label: "Bookings", icon: CalendarDays },
      { id: "customers", label: "CRM", icon: Users },
      { id: "staff", label: "Staff", icon: UserCheck },
      { id: "services", label: "Services", icon: Scissors },
    ]
  },
  {
    label: "Revenue & Growth",
    items: [
      { id: "billing", label: "Billing", icon: IndianRupee },
      { id: "offers", label: "Offers", icon: TicketPercent },
      { id: "loyalty", label: "Loyalty", icon: Award },
      { id: "inventory", label: "Inventory", icon: Package },
    ]
  },
  {
    label: "Learning",
    items: [
      { id: "academy", label: "Academy", icon: BookOpen },
    ]
  },
  {
    label: "Growth Engine",
    items: [
      { id: "campaigns", label: "Campaigns", icon: Target },
      { id: "automation", label: "Automation", icon: Zap },
      { id: "messaging", label: "Messages", icon: Mail },
      { id: "leads", label: "Leads", icon: TrendingUp },
      { id: "reviews", label: "Reviews", icon: Star },
    ]
  }
];

// Flatten for easier state management
const allTabs = tabGroups.flatMap(group => group.items);

type Booking = {
  id: string;
  customer_name: string;
  service: string;
  stylist: string;
  booking_date: string;
  booking_time: string;
  booking_end_time: string | null;
  status: string;
};

const AdminDashboard = () => {
  const { user, roles, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden glass border-b border-border/30 p-4 flex items-center justify-between z-50">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="AAR Salon" className="w-6 h-6 rounded-full object-cover" />
          <span className="font-heading text-base text-primary">AAR Salon</span>
        </Link>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-foreground/70">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-0 z-40 w-64 glass-strong border-r border-border/30 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-6">
          <Link to="/" className="hidden md:flex items-center gap-2 mb-8">
            <img src={logo} alt="AAR Salon" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-heading text-lg text-primary">AAR Salon</span>
          </Link>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Quick Search..." 
              className="w-full bg-secondary/50 border border-border/30 rounded-lg pl-9 pr-3 py-2 text-[11px] focus:outline-none focus:border-primary/50"
            />
          </div>

          <nav className="space-y-6 flex-1 overflow-y-auto max-h-[calc(100vh-250px)] no-scrollbar pr-2">
            {tabGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3 px-4">{group.label}</p>
                <div className="space-y-1">
                  {group.items.map((tab) => (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 group ${
                        activeTab === tab.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-foreground/60 hover:text-foreground hover:bg-secondary/50"
                      }`}>
                      <tab.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === tab.id ? "" : "text-primary/70"}`} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-border/10 bg-secondary/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-inner">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-foreground truncate">{user?.email}</p>
              <p className="text-[9px] text-primary uppercase tracking-tighter font-medium">{roles.join(" • ")}</p>
            </div>
          </div>
          <button onClick={async () => { await signOut(); navigate("/login"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background/50 backdrop-blur-sm relative">
        {/* Top Bar (Desktop) */}
        <div className="hidden md:flex items-center justify-between p-8 border-b border-border/10">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground capitalize">
              {tabGroups.find(g => g.items.find(i => i.id === activeTab))?.label} / {allTabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-secondary transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </button>
            <div className="h-8 w-[1px] bg-border/30 mx-2" />
            <div className="text-right">
              <p className="text-xs font-bold text-foreground capitalize">{user?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-muted-foreground">{roles[0]}</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Growth Command Center (Dashboard) */}
          {activeTab === "overview" && <GrowthCommandCenter />}

          {/* Customers (CRM) tab */}
          {activeTab === "customers" && <CustomerCRM />}

          {/* Academy tab */}
          {activeTab === "academy" && <AcademyDashboard />}
          
          {/* Billing tab */}
          {activeTab === "billing" && <BillingSystem />}

          {/* Bookings tab */}
          {activeTab === "bookings" && (
            <div className="glass rounded-2xl overflow-hidden border border-border/50 animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-border/30 flex items-center justify-between">
                <h2 className="font-heading text-xl text-foreground">Recent Bookings</h2>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-secondary/50 border border-border/30 hover:bg-secondary transition-colors">
                    <Calendar className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30 bg-secondary/20">
                      <th className="text-left text-[10px] text-muted-foreground font-bold p-4 uppercase tracking-widest">Customer</th>
                      <th className="text-left text-[10px] text-muted-foreground font-bold p-4 uppercase tracking-widest">Service</th>
                      <th className="text-left text-[10px] text-muted-foreground font-bold p-4 uppercase tracking-widest hidden md:table-cell">Stylist</th>
                      <th className="text-left text-[10px] text-muted-foreground font-bold p-4 uppercase tracking-widest">Date & Time</th>
                      <th className="text-left text-[10px] text-muted-foreground font-bold p-4 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {bookings.length === 0 ? (
                      <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">No bookings found</td></tr>
                    ) : bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-secondary/20 transition-colors group">
                        <td className="p-4 text-sm font-medium text-foreground">{b.customer_name}</td>
                        <td className="p-4 text-sm text-foreground/70">{b.service}</td>
                        <td className="p-4 text-sm text-foreground/70 hidden md:table-cell">{b.stylist}</td>
                        <td className="p-4 text-sm text-foreground/70 font-mono">{formatDate(b.booking_date)} • {b.booking_time}</td>
                        <td className="p-4">
                          <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)}
                            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-background border cursor-pointer transition-all ${
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
          {activeTab === "staff" && <StaffManagement />}

          {/* Services tab */}
          {activeTab === "services" && (
             <div className="animate-in slide-in-from-bottom-4 duration-500">
                <ServicesTab />
             </div>
          )}

          {/* Offers tab */}
          {activeTab === "offers" && <OffersManager />}

          {/* Loyalty tab */}
          {activeTab === "loyalty" && <LoyaltyProgram />}

          {/* Inventory tab */}
          {activeTab === "inventory" && <InventoryControl />}

          {/* Campaigns tab */}
          {activeTab === "campaigns" && <CampaignBuilder />}

          {/* Automation tab */}
          {activeTab === "automation" && <SmartAutomation />}

          {/* Messaging tab */}
          {activeTab === "messaging" && <MessagingHub />}

          {/* Leads tab */}
          {activeTab === "leads" && <LeadPipeline />}

          {/* Reviews tab */}
          {activeTab === "reviews" && <ReviewsEngine />}

          {/* Placeholder for remaining new modules */}
          {!allTabs.map(t => t.id).includes(activeTab) && (
            <div className="glass rounded-2xl p-20 text-center border border-dashed border-border/50 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                {(() => {
                  const Icon = allTabs.find(t => t.id === activeTab)?.icon || LayoutDashboard;
                  return <Icon className="w-10 h-10 text-primary/40" />;
                })()}
              </div>
              <h3 className="font-heading text-2xl text-foreground mb-3">{allTabs.find(t => t.id === activeTab)?.label} Module</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
                The {allTabs.find(t => t.id === activeTab)?.label} engine is being optimized. 
                We are building a robust backend to handle high-performance data operations for this module.
              </p>
              <button 
                onClick={() => setActiveTab('overview')}
                className="gold-gradient text-primary-foreground px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
