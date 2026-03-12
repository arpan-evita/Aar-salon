import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";

const Footer = () => (
  <footer className="border-t border-border/30 py-12 px-4">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Hair Dot Com" className="w-10 h-10 rounded-full object-cover" />
            <h3 className="font-heading text-xl text-primary">Hair Dot Com</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Salon & Academy — Where Style Meets Confidence. Premium unisex salon in Durgapur.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-sm text-foreground mb-4 tracking-wider uppercase">Quick Links</h4>
          <div className="space-y-2">
            <Link to="/services" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Services</Link>
            <Link to="/booking" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Book Now</Link>
            <Link to="/gallery" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Gallery</Link>
            <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading text-sm text-foreground mb-4 tracking-wider uppercase">More</h4>
          <div className="space-y-2">
            <Link to="/stylists" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Our Stylists</Link>
            <Link to="/reviews" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Reviews</Link>
            <Link to="/membership" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Membership</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/30 pt-8 text-center">
        <p className="text-muted-foreground text-xs">© 2026 Hair Dot Com Salon & Academy. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
