import { useState, useEffect } from "react";
import { Menu, X, User, CalendarDays, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.jpg";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Book Now", href: "/booking" },
  { label: "Gallery", href: "/gallery" },
  { label: "Our Team", href: "/stylists" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, user, roles, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAdmin = roles.length > 0;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-strong py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="RSL Care" className="w-9 h-9 rounded-full object-cover" />
          <span className="font-heading text-xl md:text-2xl text-primary tracking-wide">RSL Care</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`text-sm tracking-wider uppercase transition-colors duration-300 ${
                location.pathname === link.href
                  ? "text-primary"
                  : "text-foreground/70 hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="text-sm text-foreground/60 hover:text-primary transition-colors">
                  Dashboard
                </Link>
              )}
              <Link to="/my-bookings" className="flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors">
                <CalendarDays className="w-4 h-4" />
                My Bookings
              </Link>
              <button onClick={async () => { await signOut(); navigate("/"); }}
                className="flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors">
              <User className="w-4 h-4" />
              Sign In
            </Link>
          )}
          <Link
            to="/booking"
            className="gold-gradient text-primary-foreground px-6 py-2.5 text-sm font-medium tracking-wider uppercase rounded transition-all duration-300 hover:opacity-90"
          >
            Book Now
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-foreground"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden glass-strong mt-2 mx-4 rounded-lg p-6 animate-fade-in">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-lg tracking-wide transition-colors ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link to="/my-bookings" onClick={() => setMenuOpen(false)}
                  className="text-foreground/80 hover:text-primary transition-colors text-lg">
                  My Bookings
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)}
                    className="text-foreground/80 hover:text-primary transition-colors text-lg">
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={async () => { setMenuOpen(false); await signOut(); navigate("/"); }}
                  className="text-foreground/60 hover:text-primary transition-colors text-lg text-left">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="text-foreground/60 hover:text-primary transition-colors text-lg">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
