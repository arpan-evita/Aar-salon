import Navbar from "@/components/Navbar";
import BookingSection from "@/components/BookingSection";
import Footer from "@/components/Footer";

const BookingPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24">
      <BookingSection />
    </div>
    <Footer />
  </div>
);

export default BookingPage;
