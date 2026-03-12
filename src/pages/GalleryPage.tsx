import Navbar from "@/components/Navbar";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";

const GalleryPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24">
      <GallerySection />
    </div>
    <Footer />
  </div>
);

export default GalleryPage;
