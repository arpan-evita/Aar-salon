import { useState, useEffect } from "react";
import logo from "@/assets/logo.jpg";

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2200);
    const t4 = setTimeout(() => onComplete(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center transition-opacity duration-500 ${phase >= 3 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      {/* Logo */}
      <img
        src={logo}
        alt="Hair Dot Com Salon & Academy"
        className={`w-28 h-28 md:w-36 md:h-36 rounded-full object-cover mb-6 transition-all duration-700 ease-out ${phase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
      />

      {/* Tagline */}
      <p
        className={`font-heading italic text-sm md:text-base text-primary/70 mt-2 transition-all duration-700 ease-out ${phase >= 2 ? "opacity-100" : "opacity-0"}`}
      >
        Where Style Meets Confidence
      </p>

      {/* Loading bar */}
      <div className="mt-10 w-40 h-[1px] bg-border/30 overflow-hidden rounded-full">
        <div
          className={`h-full gold-gradient transition-all ease-out ${phase >= 1 ? "w-full duration-[1800ms]" : "w-0"}`}
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
