import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import stylist1 from "@/assets/stylist-1.jpg";
import stylist2 from "@/assets/stylist-2.jpg";
import stylist3 from "@/assets/stylist-3.jpg";

const fallbackPhotos = [stylist1, stylist2, stylist3];

type Stylist = { name: string; specialty: string; experience: string | null; rating: number | null; photo_url: string | null };

const StylistsSection = () => {
  const [stylists, setStylists] = useState<Stylist[]>([]);

  useEffect(() => {
    supabase.from("stylists").select("name, specialty, experience, rating, photo_url")
      .eq("is_active", true)
      .then(({ data }) => { if (data) setStylists(data); });
  }, []);

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary/80 tracking-[0.3em] text-xs uppercase mb-4">Meet The Team</p>
          <h2 className="font-heading text-3xl md:text-5xl text-primary mb-4">Our Experts</h2>
          <div className="w-20 h-px gold-gradient mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stylists.map((s, i) => (
            <div key={s.name} className="glass rounded-2xl overflow-hidden hover-lift hover-glow group">
              <div className="aspect-[3/4] overflow-hidden">
                <img src={s.photo_url || fallbackPhotos[i % fallbackPhotos.length]} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
              <div className="p-6">
                <h3 className="font-heading text-lg text-foreground">{s.name}</h3>
                <p className="text-primary text-sm mb-2">{s.specialty}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{s.experience}</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-primary fill-primary" />
                    {s.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StylistsSection;
