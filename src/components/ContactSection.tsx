import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";

const ContactSection = () => (
  <section id="contact" className="section-padding">
    <div className="container mx-auto">
      <div className="text-center mb-10 md:mb-16">
        <p className="text-primary/80 tracking-[0.3em] text-xs uppercase mb-3 md:mb-4">Get In Touch</p>
        <h2 className="font-heading text-3xl md:text-5xl text-primary mb-3 md:mb-4">Visit Us</h2>
        <div className="w-16 md:w-20 h-px gold-gradient mx-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="rounded-2xl overflow-hidden h-[300px] lg:h-auto glass">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3654.5!2d87.3119!3d23.5204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMxJzEzLjQiTiA4N8KwMTgnNDIuOCJF!5e0!3m2!1sen!2sin!4v1234567890"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: 300 }}
            allowFullScreen
            loading="lazy"
            title="AAR Salon Location"
          />
        </div>

        <div className="space-y-6">
          <div className="glass rounded-xl p-6 flex items-start gap-4">
            <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-heading text-lg text-foreground mb-1">Address</h3>
              <p className="text-muted-foreground text-sm">Beside Hestia City Centre, Durgapur, West Bengal</p>
            </div>
          </div>

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
              <h3 className="font-heading text-lg text-foreground mb-1">Opening Hours</h3>
              <p className="text-muted-foreground text-sm">Open Daily · 10:00 AM – 9:00 PM</p>
            </div>
          </div>

          <div className="flex gap-4">
            <a
              href="tel:+919999999999"
              className="flex-1 gold-gradient text-primary-foreground py-3 rounded-lg text-sm text-center tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
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
        </div>
      </div>
    </div>
  </section>
);

export default ContactSection;
