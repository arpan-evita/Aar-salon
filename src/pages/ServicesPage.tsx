import Navbar from "@/components/Navbar";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";

const ServicesPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24">
      <ServicesSection />
    </div>
    <Footer />
  </div>
);

export default ServicesPage;
