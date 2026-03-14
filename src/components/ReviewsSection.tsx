import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Review = { customer_name: string; rating: number; comment: string };

const fallbackReviews: Review[] = [
  { customer_name: "Ananya D.", rating: 5, comment: "Best salon in Durgapur! The stylists really know their craft. Got an amazing hair makeover." },
  { customer_name: "Sourav M.", rating: 5, comment: "Clean, professional and great service. Best haircut I've ever had. Highly recommended!" },
  { customer_name: "Ritika S.", rating: 5, comment: "Wonderful bridal makeup experience. Everyone at the wedding complimented my look!" },
];

const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase.from("reviews").select("customer_name, rating, comment")
      .eq("is_approved", true).order("created_at", { ascending: false })
      .then(({ data }) => { setReviews(data && data.length > 0 ? data : fallbackReviews); });
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10 md:mb-16">
          <p className="text-primary/80 tracking-[0.3em] text-xs uppercase mb-3 md:mb-4">Testimonials</p>
          <h2 className="font-heading text-3xl md:text-5xl text-primary mb-3 md:mb-4">What Our Clients Say</h2>
          <div className="w-16 md:w-20 h-px gold-gradient mx-auto" />
        </div>

        <div className="glass rounded-2xl p-8 md:p-12 text-center relative">
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: reviews[current].rating }).map((_, i) => (
              <Star key={i} className="w-5 h-5 text-primary fill-primary" />
            ))}
          </div>
          <p className="text-foreground/80 text-lg md:text-xl italic font-heading leading-relaxed mb-8">
            "{reviews[current].comment}"
          </p>
          <p className="text-primary font-medium">{reviews[current].customer_name}</p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={() => setCurrent((current - 1 + reviews.length) % reviews.length)}
              className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-foreground/60 hover:text-primary hover:bg-secondary transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? "bg-primary w-6" : "bg-muted-foreground/30"}`} />
              ))}
            </div>
            <button onClick={() => setCurrent((current + 1) % reviews.length)}
              className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-foreground/60 hover:text-primary hover:bg-secondary transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
