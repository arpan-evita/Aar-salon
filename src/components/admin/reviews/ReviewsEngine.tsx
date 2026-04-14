import { useState, useEffect } from "react";
import { 
  Star, MessageSquare, Trash2, CheckCircle2, AlertCircle, 
  Send, Instagram, Facebook, Globe, Filter, MoreVertical,
  ThumbsUp, ThumbsDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ReviewsEngine = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgRating: 4.9,
    totalReviews: 128,
    positiveRate: 98,
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    // In a real app, this would fetch from a 'reviews' table or GMB API
    const initialReviews = [
      { id: '1', name: "Anjali Mehta", rating: 5, comment: "Absolutely loved the keratin treatment! The staff is so professional and the vibe is premium.", source: "Google", date: "2024-04-12", sentiment: 'Positive' },
      { id: '2', name: "Karan Johar", rating: 4, comment: "Great haircut, but had to wait 10 mins despite an appointment.", source: "Website", date: "2024-04-11", sentiment: 'Positive' },
      { id: '3', name: "Sneha Gupta", rating: 5, comment: "Best bridal makeup in the city. Highly recommended!", source: "Google", date: "2024-04-10", sentiment: 'Positive' },
    ];
    setReviews(initialReviews);
    setLoading(false);
  };

  const sendReviewRequest = () => {
    toast.success("Review request link sent via WhatsApp!");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Reviews & Reputation Hub</h2>
          <p className="text-sm text-muted-foreground mt-1">Monitor ratings and automatically request reviews from satisfied clients.</p>
        </div>
        <button 
          onClick={sendReviewRequest}
          className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Send className="w-4 h-4" /> Request Review
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Google Rating", value: `${stats.avgRating}/5.0`, icon: Star, color: "text-primary" },
          { label: "Total Reviews", value: stats.totalReviews, icon: MessageSquare, color: "text-blue-400" },
          { label: "Positive Sentiment", value: `${stats.positiveRate}%`, icon: ThumbsUp, color: "text-green-500" },
          { label: "Action Needed", value: "0", icon: AlertCircle, color: "text-red-400" },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-4 border border-border/50">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <Globe className="w-4 h-4" /> Recent Feedback
            </h3>
            <div className="space-y-3">
               {loading ? (
                  <div className="p-12 text-center text-muted-foreground italic">Syncing with review platforms...</div>
               ) : reviews.map((review) => (
                  <div key={review.id} className="glass rounded-2xl p-5 border border-border/50 hover:border-primary/30 transition-all group">
                     <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                              {review.name[0]}
                           </div>
                           <div>
                              <p className="text-sm font-bold">{review.name}</p>
                              <div className="flex items-center gap-1">
                                 {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                                 ))}
                                 <span className="text-[10px] text-muted-foreground ml-2">{review.date} via {review.source}</span>
                              </div>
                           </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                     </div>
                     <p className="text-xs text-foreground/80 leading-relaxed italic">"{review.comment}"</p>
                     <div className="flex items-center gap-4 mt-6">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-green-500/20 text-green-500 bg-green-500/5`}>
                           {review.sentiment}
                        </span>
                        <button className="text-[10px] font-bold text-primary hover:underline">Public Reply</button>
                        <button className="text-[10px] font-bold text-muted-foreground hover:text-primary">Feature on Website</button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <TrendingUp className="w-4 h-4" /> Reputation Stats
            </h3>
            <div className="glass rounded-2xl p-6 border border-border/50">
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] font-medium">Service Quality</span>
                        <span className="text-[11px] font-bold">4.9/5</span>
                     </div>
                     <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[98%]" />
                     </div>
                  </div>
                  <div>
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] font-medium">Hygiene Standards</span>
                        <span className="text-[11px] font-bold">5.0/5</span>
                     </div>
                     <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[100%]" />
                     </div>
                  </div>
                  <div>
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] font-medium">Value for Money</span>
                        <span className="text-[11px] font-bold">4.7/5</span>
                     </div>
                     <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[94%]" />
                     </div>
                  </div>
               </div>

               <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                     <CheckCircle2 className="w-4 h-4 text-primary" />
                     <p className="text-[11px] font-bold text-foreground">AI Insight</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                     Your "Keratin Treatment" is trending in recent reviews. Consider promoting it as a "Most Loved" service.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReviewsEngine;
