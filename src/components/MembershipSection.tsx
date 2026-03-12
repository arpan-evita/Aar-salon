import { Check, Crown, Sparkles } from "lucide-react";

const plans = [
  {
    icon: Sparkles,
    name: "Silver Membership",
    price: "₹2,999/year",
    benefits: ["5% discount on all services", "Priority booking", "Free hair wash on every visit"],
  },
  {
    icon: Crown,
    name: "Gold Membership",
    price: "₹5,999/year",
    benefits: ["10% discount on all services", "Priority booking", "Free hair spa on birthday", "Exclusive member events", "Complimentary beverages"],
    featured: true,
  },
];

const MembershipSection = () => (
  <section className="section-padding">
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mb-16">
        <p className="text-primary/80 tracking-[0.3em] text-xs uppercase mb-4">Exclusive Access</p>
        <h2 className="font-heading text-3xl md:text-5xl text-primary mb-4">Membership & Offers</h2>
        <div className="w-20 h-px gold-gradient mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-8 hover-lift transition-all duration-500 ${
              plan.featured ? "glass gold-border gold-glow" : "glass"
            }`}
          >
            <plan.icon className="w-10 h-10 text-primary mb-4" />
            <h3 className="font-heading text-2xl text-foreground mb-2">{plan.name}</h3>
            <p className="text-primary text-xl font-medium mb-6">{plan.price}</p>
            <ul className="space-y-3">
              {plan.benefits.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm text-foreground/70">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <button className="w-full mt-8 gold-border text-primary py-3 rounded-lg text-sm tracking-wider uppercase hover:bg-primary/10 transition-all duration-300">
              Join Now
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default MembershipSection;
