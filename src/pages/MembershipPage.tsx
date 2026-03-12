import Navbar from "@/components/Navbar";
import MembershipSection from "@/components/MembershipSection";
import Footer from "@/components/Footer";

const MembershipPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24">
      <MembershipSection />
    </div>
    <Footer />
  </div>
);

export default MembershipPage;
