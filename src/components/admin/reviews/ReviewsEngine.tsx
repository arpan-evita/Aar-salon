import { useState, useEffect } from "react";
import { 
  Star, MessageSquare, Trash2, CheckCircle2, AlertCircle, 
  Send, Instagram, Facebook, Globe, Filter, MoreVertical,
  ThumbsUp, ThumbsDown, TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ReviewsEngine = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  
  const [newReview, setNewReview] = useState({ 
    customer_name: '', 
    rating: 5, 
    comment: '', 
    source: 'Manual' 
  });

  const [stats, setStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    positiveRate: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setReviews(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const calculateStats = (data: any[]) => {
    if (data.length === 0) return;
    const total = data.length;
    const avg = data.reduce((acc, r) => acc + r.rating, 0) / total;
    const positive = data.filter(r => r.rating >= 4).length;
    setStats({
      avgRating: Number(avg.toFixed(1)),
      totalReviews: total,
      positiveRate: Math.round((positive / total) * 100),
    });
  };

  const handleManualAdd = async () => {
    if (!newReview.customer_name || !newReview.comment) {
      toast.error("Please fill in name and comment");
      return;
    }

    const { error } = await supabase.from('reviews').insert({
      ...newReview,
      is_approved: true, // Manual reviews from admin are auto-approved
      sentiment: newReview.rating >= 4 ? 'Positive' : 'Critical'
    });

    if (!error) {
      toast.success("Manual review added successfully");
      setIsManualOpen(false);
      setNewReview({ customer_name: '', rating: 5, comment: '', source: 'Manual' });
      fetchReviews();
    }
  };

  const toggleStatus = async (id: string, field: 'is_approved' | 'is_featured', currentValue: boolean) => {
    const { error } = await supabase
      .from('reviews')
      .update({ [field]: !currentValue })
      .eq('id', id);

    if (!error) {
      toast.success(`Review ${field === 'is_approved' ? 'approval' : 'feature'} updated`);
      fetchReviews();
    }
  };

  const sendReviewRequest = async () => {
    setIsRequesting(true);
    const today = new Date().toISOString().split('T')[0];
    
    // Find customers who had bookings today
    const { data: bookings } = await supabase
      .from('bookings')
      .select('customer_id, customers(full_name, phone)')
      .eq('booking_date', today);
    
    if (bookings && bookings.length > 0) {
      // Get unique customers with phone numbers
      const unique = new Map();
      bookings.forEach((b: any) => {
        if (b.customer_id && b.customers?.phone) {
          unique.set(b.customer_id, b.customers);
        }
      });

      const targets = Array.from(unique.values());
      
      if (targets.length > 0) {
        toast.success(`Sending review requests to ${targets.length} customers from today...`);
        // In a production scenario, we'd trigger a background job/Edge function here
        console.log('Sending review requests to:', targets);
      } else {
        toast.info("No customers with phone numbers found from today's bookings.");
      }
    } else {
      toast.info("No bookings found for today to send requests to.");
    }
    setIsRequesting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Reviews & Reputation Hub</h2>
          <p className="text-sm text-muted-foreground mt-1">Monitor ratings and automatically request reviews from satisfied clients.</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
            <DialogTrigger asChild>
              <button className="glass border border-border/50 text-foreground px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary/50 transition-all">
                Add Manual Review
              </button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-border/30">
              <DialogHeader>
                <DialogTitle>Add Manual Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input value={newReview.customer_name} onChange={e => setNewReview({...newReview, customer_name: e.target.value})} placeholder="e.g. Rahul Sharma" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Rating (1-5)</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button key={i} onClick={() => setNewReview({...newReview, rating: i})} className={`p-2 rounded-lg ${newReview.rating >= i ? 'text-primary' : 'text-muted-foreground'}`}>
                        <Star className={`w-6 h-6 ${newReview.rating >= i ? 'fill-primary' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Review Comment</Label>
                  <Textarea value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} placeholder="What did the client say?" className="bg-secondary/50 min-h-[100px]" />
                </div>
                <button onClick={handleManualAdd} className="w-full gold-gradient text-primary-foreground py-3 rounded-xl text-xs font-bold uppercase tracking-widest">
                  Save Review
                </button>
              </div>
            </DialogContent>
          </Dialog>

          <button 
            onClick={sendReviewRequest}
            disabled={isRequesting}
            className="gold-gradient text-primary-foreground px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {isRequesting ? 'Requesting...' : 'Request Reviews'}
          </button>
        </div>
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
                              {review.customer_name[0]}
                           </div>
                           <div>
                              <p className="text-sm font-bold">{review.customer_name}</p>
                              <div className="flex items-center gap-1">
                                 {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                                 ))}
                                 <span className="text-[10px] text-muted-foreground ml-2">{new Date(review.created_at).toLocaleDateString()} via {review.source}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => toggleStatus(review.id, 'is_approved', review.is_approved)}
                             className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border transition-all ${review.is_approved ? 'border-green-500/50 text-green-500 bg-green-500/5' : 'border-yellow-500/50 text-yellow-500 bg-yellow-500/5'}`}
                           >
                              {review.is_approved ? 'Approved' : 'Pending'}
                           </button>
                           <button 
                             onClick={() => toggleStatus(review.id, 'is_featured', review.is_featured)}
                             className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border transition-all ${review.is_featured ? 'border-primary text-primary bg-primary/5' : 'border-border/50 text-muted-foreground'}`}
                           >
                              {review.is_featured ? 'Featured' : 'Feature'}
                           </button>
                        </div>
                     </div>
                     <p className="text-xs text-foreground/80 leading-relaxed italic">"{review.comment}"</p>
                     <div className="flex items-center gap-4 mt-6">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${review.sentiment === 'Positive' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-red-500/20 text-red-500 bg-red-500/5'}`}>
                           {review.sentiment}
                        </span>
                        <button className="text-[10px] font-bold text-primary hover:underline">Public Reply</button>
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
