import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, LogOut, Clock, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Booking = {
  id: string;
  service: string;
  stylist: string;
  booking_date: string;
  booking_time: string;
  status: string;
  created_at: string;
};

const MyBookings = () => {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !session) navigate("/login");
  }, [authLoading, session, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, service, stylist, booking_date, booking_time, status, created_at")
        .eq("user_id", user.id)
        .order("booking_date", { ascending: false });
      if (data) setBookings(data);
      setLoading(false);
    };
    load();
  }, [user]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const statusIcon = (status: string) => {
    if (status === "Confirmed") return <Check className="w-4 h-4 text-green-400" />;
    if (status === "Cancelled") return <X className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-primary" />;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl text-primary mb-1">My Bookings</h1>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
            <button onClick={async () => { await signOut(); navigate("/"); }}
              className="flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          {/* Book new CTA */}
          <Link to="/booking"
            className="glass rounded-xl p-6 flex items-center justify-between mb-8 hover-lift group cursor-pointer block">
            <div>
              <h3 className="font-heading text-lg text-foreground mb-1">Book a New Appointment</h3>
              <p className="text-muted-foreground text-sm">Schedule your next visit with us</p>
            </div>
            <CalendarDays className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
          </Link>

          {/* Bookings list */}
          {bookings.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <CalendarDays className="w-12 h-12 text-primary/30 mx-auto mb-4" />
              <h3 className="font-heading text-xl text-foreground mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground text-sm mb-6">You haven't booked any appointments yet.</p>
              <Link to="/booking"
                className="gold-gradient text-primary-foreground px-6 py-3 text-sm font-medium tracking-wider uppercase rounded inline-block">
                Book Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="glass rounded-xl p-5 hover-lift">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading text-base text-foreground mb-1">{b.service}</h3>
                      <p className="text-muted-foreground text-sm">with {b.stylist}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusIcon(b.status)}
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        b.status === "Confirmed" ? "bg-green-500/10 text-green-400"
                        : b.status === "Cancelled" ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                      }`}>{b.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> {formatDate(b.booking_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {b.booking_time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyBookings;
