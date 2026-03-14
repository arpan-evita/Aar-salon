import { useState, useEffect } from "react";
import { Check, ChevronRight, Calendar, Clock, User, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/* ─── helpers ─── */

const OPEN_HOUR = 10;   // salon opens 10:00 AM
const CLOSE_HOUR = 21;  // last slot cannot END after 9:00 PM

/** Convert "10:00 AM" → total minutes from midnight (600) */
const parseTime = (t: string): number => {
  const [time, period] = t.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

/** Convert total minutes from midnight → "10:00 AM" */
const formatMinutes = (mins: number): string => {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
};

/** Generate available start-time slots for a given duration */
const generateTimeSlots = (durationMinutes: number): string[] => {
  const slots: string[] = [];
  const start = OPEN_HOUR * 60;          // 600
  const latestStart = CLOSE_HOUR * 60 - durationMinutes;  // service must end before close
  const step = Math.max(15, durationMinutes);
  for (let t = start; t <= latestStart; t += step) {
    slots.push(formatMinutes(t));
  }
  return slots;
};

/** Check if two time ranges overlap */
const rangesOverlap = (
  startA: number, endA: number,
  startB: number, endB: number,
): boolean => startA < endB && startB < endA;

type ServiceItem = { title: string; duration_minutes: number; price: string };

type ExistingBooking = {
  booking_time: string;
  booking_end_time: string | null;
  stylist: string;
  status: string;
};

const steps = ["Service", "Expert", "Date", "Time", "Details"];

const BookingSection = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState("");
  const [selectedStylist, setSelectedStylist] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [stylists, setStylists] = useState<{ name: string; specialty: string }[]>([]);
  const [existingBookings, setExistingBookings] = useState<ExistingBooking[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  /* ── load services & stylists ── */
  useEffect(() => {
    const load = async () => {
      const [svcRes, styRes] = await Promise.all([
        supabase.from("services").select("title, duration_minutes, price").eq("is_active", true).order("sort_order"),
        supabase.from("stylists").select("name, specialty").eq("is_active", true),
      ]);
      if (svcRes.data) setServices(svcRes.data);
      if (styRes.data) setStylists([...styRes.data, { name: "Any Available", specialty: "First available expert" }]);
    };
    load();
  }, []);

  /* ── fetch existing bookings when date changes ── */
  useEffect(() => {
    if (!selectedDate) { setExistingBookings([]); return; }
    const fetchBookings = async () => {
      setLoadingSlots(true);
      const query = supabase
        .from("bookings")
        .select("booking_time, booking_end_time, stylist, status")
        .eq("booking_date", selectedDate)
        .neq("status", "Cancelled");

      const { data } = await query;
      if (data) setExistingBookings(data);
      setLoadingSlots(false);
    };
    fetchBookings();
  }, [selectedDate]);

  /* ── derived values ── */
  const activeService = services.find((s) => s.title === selectedService);
  const durationMinutes = activeService?.duration_minutes ?? 30;
  const timeSlots = generateTimeSlots(durationMinutes);

  /** Check if a slot is occupied */
  const isSlotOccupied = (slot: string): boolean => {
    const slotStart = parseTime(slot);
    const slotEnd = slotStart + durationMinutes;

    return existingBookings.some((b) => {
      // Only block for the same stylist (or if "Any Available" is selected, block all)
      if (selectedStylist !== "Any Available" && b.stylist !== selectedStylist) return false;

      const bStart = parseTime(b.booking_time);
      const bEnd = b.booking_end_time ? parseTime(b.booking_end_time) : bStart + 30; // fallback 30 min
      return rangesOverlap(slotStart, slotEnd, bStart, bEnd);
    });
  };

  /* ── navigation guards ── */
  const canProceed = () => {
    switch (step) {
      case 0: return !!selectedService;
      case 1: return !!selectedStylist;
      case 2: return !!selectedDate;
      case 3: return !!selectedTime;
      case 4: return !!name && !!phone;
      default: return false;
    }
  };

  /* ── confirm booking ── */
  const handleConfirm = async () => {
    setSubmitting(true);
    const endTime = formatMinutes(parseTime(selectedTime) + durationMinutes);
    const { error } = await supabase.from("bookings").insert({
      service: selectedService,
      stylist: selectedStylist,
      booking_date: selectedDate,
      booking_time: selectedTime,
      booking_end_time: endTime,
      customer_name: name,
      customer_phone: phone,
      customer_email: email || null,
      notes: notes || null,
      user_id: user?.id || null,
    });
    setSubmitting(false);
    if (!error) setConfirmed(true);
  };

  const resetForm = () => {
    setConfirmed(false); setStep(0); setSelectedService(""); setSelectedStylist("");
    setSelectedDate(""); setSelectedTime(""); setName(""); setPhone(""); setEmail(""); setNotes("");
    setExistingBookings([]);
  };

  const generateDates = () => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  };

  /* ─── Confirmation Screen ─── */
  if (confirmed) {
    const endTime = formatMinutes(parseTime(selectedTime) + durationMinutes);
    return (
      <section id="booking" className="section-padding">
        <div className="container mx-auto max-w-2xl">
          <div className="glass rounded-2xl p-8 md:p-12 text-center gold-glow">
            <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="font-heading text-3xl text-primary mb-4">Service Booked!</h2>
            <p className="text-foreground/70 mb-8">Your service has been scheduled. We look forward to restoring your items.</p>
            <div className="glass rounded-lg p-6 text-left space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="text-foreground">{selectedService}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expert</span><span className="text-foreground">{selectedStylist}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground">{formatDate(selectedDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="text-foreground">{selectedTime} – {endTime}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="text-foreground">{durationMinutes} min</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="text-foreground">{name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="text-foreground">{phone}</span></div>
            </div>
            <button onClick={resetForm} className="mt-8 text-primary/70 hover:text-primary text-sm transition-colors">
              Book Another Service
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ─── Wizard Steps ─── */
  return (
    <section id="booking" className="section-padding">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-primary/80 tracking-[0.3em] text-xs uppercase mb-4">Schedule Your Visit</p>
          <h2 className="font-heading text-3xl md:text-5xl text-primary mb-4">Book a Service</h2>
          <div className="w-20 h-px gold-gradient mx-auto" />
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-12">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                i <= step ? "gold-gradient text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className="hidden md:inline text-xs text-muted-foreground">{s}</span>
              {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground/40" />}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-6 md:p-10">
          {/* Step 0 — Service */}
          {step === 0 && (
            <div>
              <h3 className="font-heading text-xl text-foreground mb-6 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" /> Choose Your Service
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((s) => (
                  <button key={s.title} onClick={() => { setSelectedService(s.title); setSelectedTime(""); }}
                    className={`p-4 rounded-lg text-left transition-all duration-300 ${
                      selectedService === s.title ? "gold-border bg-primary/10 text-primary" : "bg-secondary/50 text-foreground/70 hover:bg-secondary"
                    }`}>
                    <span className="text-sm font-medium">{s.title}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {s.duration_minutes} min
                      </span>
                      <span className="text-xs text-primary/70">{s.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — Expert */}
          {step === 1 && (
            <div>
              <h3 className="font-heading text-xl text-foreground mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Select Your Expert
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stylists.map((s) => (
                  <button key={s.name} onClick={() => { setSelectedStylist(s.name); setSelectedTime(""); }}
                    className={`p-4 rounded-lg text-left transition-all duration-300 ${
                      selectedStylist === s.name ? "gold-border bg-primary/10" : "bg-secondary/50 hover:bg-secondary"
                    }`}>
                    <span className={`text-sm font-medium ${selectedStylist === s.name ? "text-primary" : "text-foreground/80"}`}>{s.name}</span>
                    <p className="text-xs text-muted-foreground mt-1">{s.specialty}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Date */}
          {step === 2 && (
            <div>
              <h3 className="font-heading text-xl text-foreground mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Choose a Date
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {generateDates().map((d) => (
                  <button key={d} onClick={() => { setSelectedDate(d); setSelectedTime(""); }}
                    className={`p-3 rounded-lg text-center text-sm transition-all duration-300 ${
                      selectedDate === d ? "gold-border bg-primary/10 text-primary" : "bg-secondary/50 text-foreground/70 hover:bg-secondary"
                    }`}>{formatDate(d)}</button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Time */}
          {step === 3 && (
            <div>
              <h3 className="font-heading text-xl text-foreground mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Choose a Time Slot
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Each slot is <span className="text-primary font-medium">{durationMinutes} min</span> for{" "}
                <span className="text-foreground font-medium">{selectedService}</span>.
                Greyed-out slots are already booked.
              </p>
              {loadingSlots ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {timeSlots.map((t) => {
                    const occupied = isSlotOccupied(t);
                    return (
                      <button key={t} onClick={() => !occupied && setSelectedTime(t)} disabled={occupied}
                        className={`p-3 rounded-lg text-center text-xs transition-all duration-300 ${
                          occupied
                            ? "bg-secondary/30 text-muted-foreground/40 cursor-not-allowed line-through"
                            : selectedTime === t
                              ? "gold-border bg-primary/10 text-primary"
                              : "bg-secondary/50 text-foreground/70 hover:bg-secondary"
                        }`}>
                        {t}
                        {occupied && <span className="block text-[10px] mt-0.5 no-underline" style={{ textDecoration: "none" }}>Booked</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Details */}
          {step === 4 && (
            <div>
              <h3 className="font-heading text-xl text-foreground mb-6">Your Details</h3>
              <div className="space-y-4">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name *"
                  className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number *"
                  className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)"
                  className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" />
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe item(s) for service (optional)" rows={3}
                  className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none" />
              </div>

              {/* Booking Summary */}
              <div className="glass rounded-lg p-4 mt-6 space-y-2 text-sm">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Booking Summary</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="text-foreground">{selectedService}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Expert</span><span className="text-foreground">{selectedStylist}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground">{formatDate(selectedDate)}</span></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-foreground">{selectedTime} – {formatMinutes(parseTime(selectedTime) + durationMinutes)}</span>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="text-primary font-medium">{durationMinutes} min</span></div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button onClick={() => setStep(Math.max(0, step - 1))}
              className={`text-sm text-foreground/60 hover:text-foreground transition-colors ${step === 0 ? "invisible" : ""}`}>
              ← Back
            </button>
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                className="gold-gradient text-primary-foreground px-8 py-3 text-sm font-medium tracking-wider uppercase rounded transition-all duration-300 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
                Continue
              </button>
            ) : (
              <button onClick={handleConfirm} disabled={!canProceed() || submitting}
                className="gold-gradient text-primary-foreground px-8 py-3 text-sm font-medium tracking-wider uppercase rounded transition-all duration-300 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed animate-pulse-gold">
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
