import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

const FloatingBookButton = () => (
  <Link
    to="/booking"
    className="fixed bottom-6 right-6 z-40 gold-gradient text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-2xl animate-pulse-gold hover:scale-110 transition-transform duration-300 md:hidden"
    aria-label="Book appointment"
  >
    <CalendarDays className="w-6 h-6" />
  </Link>
);

export default FloatingBookButton;
