import { useState, useEffect } from "react";
import { Check, ChevronRight, Calendar, Clock, User, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const timeSlots = [
  "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM",
  "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM",
];

const steps = ["Service", "Stylist", "Date", "Time", "Details"];

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

  const [services, setServices] = useState<{ title: string }[]>([]);
  const [stylists, setStylists] = useState<{ name: string; specialty: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [svcRes, styRes] = await Promise.all([
        supabase.from("services").select("title").eq("is_active", true).order("sort_order"),
        supabase.from("stylists").select("name, specialty").eq("is_active", true),
      ]);
      if (svcRes.data) setServices(svcRes.data);
      if (styRes.data) setStylists([...styRes.data, { name: "Any Available", specialty: "First available stylist" }]);
    };
    load();
  }, []);

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

  const handleConfirm = async () => {
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      service: selectedService,
      stylist: selectedStylist,
      booking_date: selectedDate,
      booking_time: selectedTime,
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
  };

  const generateDates = () => {
    const dates = [];
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

  if (confirmed) {
    return (
      <section id="booking" className="section-padding">
        <div className="container mx-auto max-w-2xl">
          <div className="glass rounded-2xl p-8 md:p-12 text-center gold-glow">
            <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="font-heading text-3xl text-primary mb-4">Booking Confirmed!</h2>
            <p className="text-foreground/70 mb-8">Your appointment has been reserved. We look forward to seeing you.</p>
            <div className="glass rounded-lg p-6 text-left space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="text-foreground">{selectedService}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Stylist</span><span className="text-foreground">{selectedStylist}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground">{formatDate(selectedDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="text-foreground">{selectedTime}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="text-foreground">{name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="text-foreground">{phone}</span></div>
            </div>
            <button onClick={resetForm} className="mt-8 text-primary/70 hover:text-primary text-sm transition-colors">
              Book Another Appointment
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="section-padding">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-primary/80 tracking-[0.3em] text-xs uppercase mb-4">Schedule Your Visit</p>
          <h2 className="font-heading text-3xl md:text-5xl text-primary mb-4">Book Your Appointment</h2>
          <div className="w-20 h-px gold-gradient mx-auto" />
        </div>

        {/* Steps indicator */}
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
          {step === 0 && (
            <div>
              <h3 className="font-heading text-xl text-foreground mb-6 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-primary" /> Choose Your Service
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((s) => (
                  <button key={s.title} onClick={() => setSelectedService(s.title)}
                    className={`p-4 rounded-lg text-left text-sm transition-all duration-300 ${
                      selectedService === s.title ? "gold-border bg-primary/10 text-primary" : "bg-secondary/50 text-foreground/70 hover:bg-secondary"
                    }`}>{s.title}</button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 className="font-heading text-xl text-foreground mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Select Your Stylist
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stylists.map((s) => (
                  <button key={s.name} onClick={() => setSelectedStylist(s.name)}
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

          {step === 2 && (
            <div>
              <h3 className="font-heading text-xl text-foreground mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Choose a Date
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {generateDates().map((d) => (
                  <button key={d} onClick={() => setSelectedDate(d)}
                    className={`p-3 rounded-lg text-center text-sm transition-all duration-300 ${
                      selectedDate === d ? "gold-border bg-primary/10 text-primary" : "bg-secondary/50 text-foreground/70 hover:bg-secondary"
                    }`}>{formatDate(d)}</button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-heading text-xl text-foreground mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Choose a Time Slot
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {timeSlots.map((t) => (
                  <button key={t} onClick={() => setSelectedTime(t)}
                    className={`p-3 rounded-lg text-center text-xs transition-all duration-300 ${
                      selectedTime === t ? "gold-border bg-primary/10 text-primary" : "bg-secondary/50 text-foreground/70 hover:bg-secondary"
                    }`}>{t}</button>
                ))}
              </div>
            </div>
          )}

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
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special requests (optional)" rows={3}
                  className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none" />
              </div>
            </div>
          )}

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
