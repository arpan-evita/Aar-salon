import { useState, useEffect } from "react";
import { 
  Calendar, Clock, Search, Filter, Trash2, 
  ChevronRight, MoreVertical, CheckCircle2, 
  XCircle, AlertCircle, Eye, Download,
  TrendingUp, CalendarDays, MoreHorizontal
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const BookingManagement = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    let query = supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false });

    if (statusFilter !== "All") {
      query = query.eq("status", statusFilter);
    }

    // Basic date filtering
    if (dateFilter === "Today") {
      const today = new Date().toISOString().split("T")[0];
      query = query.eq("booking_date", today);
    } else if (dateFilter === "This Week") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query = query.gte("booking_date", sevenDaysAgo.toISOString().split("T")[0]);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to fetch bookings");
    } else {
      setBookings(data || []);
      
      // Calculate stats from all data or a separate fetch
      const total = data?.length || 0;
      const confirmed = data?.filter(b => b.status === "Confirmed").length || 0;
      const pending = data?.filter(b => b.status === "Pending").length || 0;
      const cancelled = data?.filter(b => b.status === "Cancelled").length || 0;
      setStats({ total, confirmed, pending, cancelled });
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Update failed");
    } else {
      toast.success(`Booking ${newStatus.toLowerCase()}`);
      fetchBookings();
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this booking? This action cannot be undone.")) return;

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete booking");
    } else {
      toast.success("Booking deleted successfully");
      fetchBookings();
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.customer_phone.includes(searchQuery) ||
    b.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Load", value: stats.total, icon: CalendarDays, color: "text-primary" },
          { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, color: "text-green-400" },
          { label: "Pipeline", value: stats.pending, icon: Clock, color: "text-yellow-400" },
          { label: "Dropped", value: stats.cancelled, icon: XCircle, color: "text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl bg-secondary/50 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-0.5">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="glass rounded-2xl p-4 border border-border/50 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name, phone, or service..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/30 border border-border/50 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-primary/50 outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-secondary/30 border border-border/50 rounded-xl px-3 py-1">
             <Filter className="w-3.5 h-3.5 text-muted-foreground" />
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none cursor-pointer p-1"
             >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
             </select>
          </div>

          <div className="flex items-center gap-2 bg-secondary/30 border border-border/50 rounded-xl px-3 py-1">
             <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
             <select 
               value={dateFilter}
               onChange={(e) => setDateFilter(e.target.value)}
               className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none cursor-pointer p-1"
             >
                <option value="All Time">All dates</option>
                <option value="Today">Today</option>
                <option value="This Week">Last 7 Days</option>
             </select>
          </div>
        </div>
      </div>

      {/* Advanced Table */}
      <div className="glass rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/20 border-b border-border/30">
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer Intelligence</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Service Allocation</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Temporal Matrix</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Workforce</th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Execution Status</th>
                <th className="text-right p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">No bookings indexed in the current segment.</td></tr>
              ) : filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-secondary/10 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-[11px] font-heavy text-primary border border-border/20 group-hover:gold-glow transition-all">
                          {b.customer_name[0]}
                       </div>
                       <div>
                          <p className="text-xs font-bold text-foreground">{b.customer_name}</p>
                          <p className="text-[10px] text-muted-foreground">{b.customer_phone}</p>
                       </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-0.5">
                       <p className="text-xs font-bold text-foreground/80">{b.service}</p>
                       <p className="text-[9px] text-primary uppercase font-bold tracking-widest">Premium Service</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-0.5">
                       <p className="text-xs font-bold text-foreground/80">{formatDate(b.booking_date)}</p>
                       <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {b.booking_time}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-medium text-foreground/70">{b.stylist}</span>
                  </td>
                  <td className="p-4">
                    <select 
                      value={b.status} 
                      onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                      className={`text-[9px] font-heavy uppercase tracking-[0.1em] px-3 py-1.5 rounded-xl bg-background border cursor-pointer transition-all ${
                        b.status === "Confirmed" ? "border-green-500/30 text-green-400" : b.status === "Cancelled" ? "border-red-500/30 text-red-400" : "border-primary/30 text-primary"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => { setSelectedBooking(b); setIsDetailsOpen(true); }}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBooking(b.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto glass-strong border-l border-border/30 p-0 shadow-2xl">
          {selectedBooking && (
            <div className="flex flex-col h-full">
               <div className="p-10 border-b border-border/20 bg-primary/5">
                  <SheetHeader className="text-left">
                     <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl font-bold text-primary border border-border/30 shadow-2xl">
                           {selectedBooking.customer_name[0]}
                        </div>
                        <div>
                           <SheetTitle className="text-3xl font-heading text-foreground mb-1">{selectedBooking.customer_name}</SheetTitle>
                           <SheetDescription className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${
                                selectedBooking.status === "Confirmed" ? "border-green-500/30 text-green-400 bg-green-500/5" : selectedBooking.status === "Cancelled" ? "border-red-500/30 text-red-400 bg-red-500/5" : "border-primary/30 text-primary bg-primary/5"
                              }`}>
                                {selectedBooking.status}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em]">Verified Appointment</span>
                           </SheetDescription>
                        </div>
                     </div>
                  </SheetHeader>
               </div>

               <div className="p-10 space-y-12">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Service Item</p>
                        <p className="text-sm font-bold text-foreground">{selectedBooking.service}</p>
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Selected Expert</p>
                        <p className="text-sm font-bold text-foreground">{selectedBooking.stylist}</p>
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Appointment Date</p>
                        <p className="text-sm font-bold text-foreground">{formatDate(selectedBooking.booking_date)}</p>
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Time Slot</p>
                        <p className="text-sm font-bold text-foreground">{selectedBooking.booking_time}</p>
                     </div>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-border/10">
                     <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Contact Intelligence</h4>
                     <div className="glass rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-xs text-muted-foreground">Mobile Phone</span>
                           <span className="text-sm font-bold text-foreground">{selectedBooking.customer_phone}</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-xs text-muted-foreground">Email Address</span>
                           <span className="text-sm font-bold text-foreground">{selectedBooking.customer_email || 'Not provided'}</span>
                        </div>
                     </div>
                  </div>

                  {selectedBooking.notes && (
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Special Provisions / Notes</h4>
                       <div className="p-6 rounded-2xl bg-secondary/30 italic text-xs text-muted-foreground leading-relaxed border border-border/10">
                          "{selectedBooking.notes}"
                       </div>
                    </div>
                  )}

                  <div className="pt-8 border-t border-border/10 flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                     <p>Indexing ID: {selectedBooking.id.slice(0, 8)}...</p>
                     <p>Logged At: {new Date(selectedBooking.created_at).toLocaleString()}</p>
                  </div>
               </div>

               <div className="mt-auto p-10 bg-secondary/10 border-t border-border/10 flex gap-4">
                  <button onClick={() => setIsDetailsOpen(false)} className="flex-1 bg-background border border-border/50 text-foreground py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-all">Close Entry</button>
                  <button className="flex-1 gold-gradient text-primary-foreground py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2">
                     <Download className="w-4 h-4" /> Download Receipt
                  </button>
               </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BookingManagement;
