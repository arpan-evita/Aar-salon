import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import BookingSection from "@/components/BookingSection";
import StylistsSection from "@/components/StylistsSection";
import GallerySection from "@/components/GallerySection";
import ReviewsSection from "@/components/ReviewsSection";
import MembershipSection from "@/components/MembershipSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import FloatingBookButton from "@/components/FloatingBookButton";
import LoadingScreen from "@/components/LoadingScreen";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const handleComplete = useCallback(() => setLoading(false), []);

  return (
    <div className="min-h-screen bg-background">
      {loading && <LoadingScreen onComplete={handleComplete} />}
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <BookingSection />
      <StylistsSection />
      <GallerySection />
      <ReviewsSection />
      <MembershipSection />
      <ContactSection />
      <Footer />
      <FloatingBookButton />
    </div>
  );
};

export default Index;
