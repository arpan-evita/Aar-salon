import Navbar from "@/components/Navbar";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";

const ReviewsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24">
      <ReviewsSection />
    </div>
    <Footer />
  </div>
);

export default ReviewsPage;
