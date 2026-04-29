import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays, Users, Scissors, BarChart3, Clock, ArrowLeft,
  TrendingUp, IndianRupee, UserCheck, Calendar, LogOut, Plus, Mail, Shield, Trash2,
  Package, BookOpen, Target, Star, LayoutDashboard, TicketPercent, Award, ChevronDown,
  Menu, X, Search, Bell, Zap, Bot, Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import BookingManagement from "@/components/admin/bookings/BookingManagement";
import logo from "@/assets/logo.jpg";
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
import PremiumGrowthModules from "@/components/admin/PremiumGrowthModules";

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
      { id: "assistant", label: "AI Growth", icon: Bot },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
    ]
  },
  {
    label: "Control",
    items: [
      { id: "settings", label: "Settings", icon: Settings },
    ]
  }
];

// Flatten for easier state management
const allTabs = tabGroups.flatMap(group => group.items);

const AdminDashboard = () => {
  const { user, roles, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");

  const searchResults = allTabs.filter((tab) =>
    `${tab.label} ${tab.id}`.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const openTab = (tabId: string) => {
    setActiveTab(tabId);
    setGlobalSearch("");
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const showNotifications = () => {
    toast.info("Today: 18 appointments, 6 inactive VIPs, 3 low-stock products, and 4 birthday vouchers ready.");
  };

  return (
    <div className="h-screen bg-background flex flex-col md:flex-row overflow-hidden">
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
        fixed md:sticky top-0 h-screen z-40 w-64 glass-strong border-r border-border/30 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 pb-2">
          <Link to="/" className="hidden md:flex items-center gap-2 mb-8">
            <img src={logo} alt="AAR Salon" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-heading text-lg text-primary">AAR Salon</span>
          </Link>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input 
              type="text" 
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Quick Search..." 
              className="w-full bg-secondary/50 border border-border/30 rounded-lg pl-9 pr-3 py-2 text-[11px] focus:outline-none focus:border-primary/50"
            />
            {globalSearch && (
              <div className="absolute left-0 right-0 top-11 z-50 rounded-xl border border-border/40 bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
                {searchResults.length === 0 ? (
                  <p className="px-3 py-2 text-[11px] text-muted-foreground">No module found.</p>
                ) : searchResults.slice(0, 6).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => openTab(tab.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[11px] text-foreground/80 transition-colors hover:bg-secondary"
                  >
                    <tab.icon className="h-3.5 w-3.5 text-primary" />
                    Open {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <nav className="flex-1 overflow-y-auto px-6 py-2 no-scrollbar space-y-6">
          {tabGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3 px-2">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((tab) => (
                  <button key={tab.id} onClick={() => openTab(tab.id)}
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

        <div className="mt-auto p-4 border-t border-border/10 bg-secondary/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-inner">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-foreground truncate">{user?.email}</p>
              <p className="text-[9px] text-primary uppercase tracking-tighter font-medium">{roles.join(" / ")}</p>
            </div>
          </div>
          <button onClick={async () => { await signOut(); navigate("/admin-login"); }}
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
            <button onClick={showNotifications} className="p-2 rounded-full hover:bg-secondary transition-colors relative">
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
          {activeTab === "bookings" && <BookingManagement />}

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

          {/* AI Growth Assistant */}
          {activeTab === "assistant" && <PremiumGrowthModules module="assistant" />}

          {/* Advanced Analytics */}
          {activeTab === "analytics" && <PremiumGrowthModules module="analytics" />}

          {/* Admin Settings */}
          {activeTab === "settings" && <PremiumGrowthModules module="settings" />}

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
