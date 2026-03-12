import Navbar from "@/components/Navbar";
import StylistsSection from "@/components/StylistsSection";
import Footer from "@/components/Footer";

const StylistsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24">
      <StylistsSection />
    </div>
    <Footer />
  </div>
);

export default StylistsPage;
