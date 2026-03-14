import { useEffect, useState } from "react";
import { Scissors, Sparkles, Palette, Wind, Heart, Hand, Gem, Flower2, Crown, ShoppingBag, Luggage, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, React.ElementType> = {
  Scissors, Sparkles, Palette, Wind, Heart, Hand, Gem, Flower2, Crown, ShoppingBag, Luggage, Wrench,
};

type Service = { title: string; description: string | null; icon: string; price: string };

const fallbackServices: Service[] = [
  { title: "Haircut & Styling", description: "Precision cuts and trending styles for men & women by expert stylists.", icon: "Scissors", price: "₹200" },
  { title: "Hair Coloring", description: "Global color, highlights, balayage & fashion shades using premium products.", icon: "Palette", price: "₹1,500" },
  { title: "Bridal Makeup", description: "Complete bridal & party makeup packages with HD and airbrush options.", icon: "Crown", price: "₹5,000" },
  { title: "Facial & Skincare", description: "Deep cleansing facials, fruit facials, gold facials & anti-aging treatments.", icon: "Sparkles", price: "₹500" },
  { title: "Spa & Massage", description: "Relaxing body massage, head massage & aromatherapy spa treatments.", icon: "Heart", price: "₹800" },
  { title: "Nail Art & Care", description: "Manicure, pedicure, gel nails & creative nail art designs.", icon: "Gem", price: "₹300" },
  { title: "Hair Treatments", description: "Keratin smoothing, hair spa, dandruff treatment & hair fall solutions.", icon: "Wind", price: "₹1,000" },
  { title: "Waxing & Threading", description: "Full body waxing, eyebrow threading & upper lip shaping.", icon: "Hand", price: "₹150" },
  { title: "Beard Grooming", description: "Beard trim, shaping, hot towel shave & men's grooming packages.", icon: "Scissors", price: "₹150" },
];

const ServicesSection = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    supabase.from("services").select("title, description, icon, price")
      .eq("is_active", true).order("sort_order")
      .then(({ data }) => { setServices(data && data.length > 0 ? data : fallbackServices); });
  }, []);

  return (
    <section id="services" className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary/80 tracking-[0.3em] text-xs uppercase mb-4">What We Offer</p>
          <h2 className="font-heading text-3xl md:text-5xl text-primary mb-4">Our Services</h2>
          <div className="w-20 h-px gold-gradient mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = iconMap[service.icon] || Scissors;
            return (
              <div key={service.title} className="glass rounded-xl p-6 hover-lift hover-glow group cursor-pointer">
                <Icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-heading text-lg text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-medium">From {service.price}</span>
                  <a href="/booking" className="text-xs text-foreground/60 hover:text-primary transition-colors tracking-wider uppercase">
                    Book →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
