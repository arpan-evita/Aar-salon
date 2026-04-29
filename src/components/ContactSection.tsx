import { useState } from "react";
import { MapPin, Phone, Clock, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("Name and Phone are required");
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      source: "Website Contact Form",
      interest: formData.message || "General Inquiry",
      status: "New"
    });
    
    setLoading(false);
    if (error) {
      toast.error("Failed to send message. Please try again.");
    } else {
      toast.success("Message sent successfully! We'll be in touch soon.");
      setFormData({ name: "", phone: "", email: "", message: "" });
    }
  };

  return (
    <section id="contact" className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <p className="text-primary/80 tracking-[0.3em] text-xs uppercase mb-3 md:mb-4">Get In Touch</p>
          <h2 className="font-heading text-3xl md:text-5xl text-primary mb-3 md:mb-4">Contact Us</h2>
          <div className="w-16 md:w-20 h-px gold-gradient mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Form Side */}
          <div className="glass rounded-2xl p-8">
            <h3 className="font-heading text-2xl text-foreground mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" placeholder="Your Name *" required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
              <input 
                type="text" placeholder="Your Phone Number *" required
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
              <input 
                type="email" placeholder="Your Email Address"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
              <textarea 
                placeholder="How can we help you?" rows={4}
                value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
              <button 
                type="submit" disabled={loading}
                className="w-full gold-gradient text-primary-foreground py-3 rounded-lg text-sm tracking-wider uppercase font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Sending..." : <><Send className="w-4 h-4" /> Send Message</>}
              </button>
            </form>
          </div>

          {/* Info Side */}
          <div className="space-y-6">
            <div className="glass rounded-xl p-6 flex items-start gap-4">
              <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-heading text-lg text-foreground mb-1">Address</h3>
                <p className="text-muted-foreground text-sm">Beside Hestia City Centre, Durgapur, West Bengal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-xl p-6 flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading text-lg text-foreground mb-1">Phone</h3>
                  <p className="text-muted-foreground text-sm">Contact via Justdial</p>
                </div>
              </div>

              <div className="glass rounded-xl p-6 flex items-start gap-4">
                <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading text-lg text-foreground mb-1">Hours</h3>
                  <p className="text-muted-foreground text-sm">Daily 10AM – 9PM</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <a
                href="tel:+919999999999"
                className="flex-1 glass text-foreground py-3 rounded-lg text-sm text-center tracking-wider uppercase font-medium hover:bg-secondary transition-colors"
              >
                Call Now
              </a>
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 gold-border text-primary py-3 rounded-lg text-sm text-center tracking-wider uppercase hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>

            <div className="rounded-2xl overflow-hidden h-[200px] glass">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3654.5!2d87.3119!3d23.5204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMxJzEzLjQiTiA4N8KwMTgnNDIuOCJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="AAR Salon Location"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
