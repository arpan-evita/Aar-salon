import { ArrowRight, MapPin, Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-fade-up">
          <p className="text-primary/80 tracking-[0.4em] text-xs md:text-sm uppercase mb-6">
            — Unisex Hair & Beauty —
          </p>
        </div>

        <h1 className="animate-fade-up delay-100 font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-primary mb-6 leading-tight">
          AAR Salon
        </h1>

        <p className="animate-fade-up delay-200 font-heading italic text-xl md:text-2xl text-foreground/80 mb-4">
          Style. Elegance. Confidence.
        </p>

        <p className="animate-fade-up delay-300 text-foreground/60 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
          Premium unisex salon in Durgapur offering expert haircuts, styling, skincare,
          bridal makeup & spa treatments. Your transformation starts here.
        </p>

        <div className="animate-fade-up delay-400 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/booking"
            className="gold-gradient text-primary-foreground px-8 py-4 text-sm font-medium tracking-wider uppercase rounded flex items-center gap-3 transition-all duration-300 hover:opacity-90 hover:gap-4"
          >
            Book Appointment
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/services"
            className="gold-border text-foreground px-8 py-4 text-sm tracking-wider uppercase rounded hover:bg-primary/10 transition-all duration-300"
          >
            Explore Services
          </Link>
        </div>

        <div className="animate-fade-up delay-500 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-foreground/60 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Beside Hestia City Centre, Durgapur</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            <span>4.5 Rating · 150+ Reviews</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Open Daily · 10 AM – 9 PM</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
