/**
 * AAR LOCAL INTELLIGENCE (ALI)
 * A proprietary, heuristic-driven expert system for salon growth.
 * Operates entirely locally without external LLM dependencies.
 */

export type SalonData = {
  revenue: { current: number; target: number; pace: number; gap: number };
  customers: { total: number; churnRisk: number; vips: number; newThisMonth: number };
  staff: { total: number; avgUtilization: number; topPerformer: string };
  inventory: { lowStockItems: number };
  bookings: { emptySlotsNext3Days: number };
  settings: { brandVoice: string; branch: string };
};

export type ALIRecommendation = {
  title: string;
  strategy: string;
  impact: "High" | "Medium" | "Low";
  difficulty: "Easy" | "Medium" | "Hard";
  expectedROI: string;
  source: "Data Pattern" | "Industry Benchmark" | "Predictive Heuristic";
};

// Internal Knowledge Base: Salon Industry Best Practices & Heuristics
// Infused with Rajiv Talreja's "Business Growth Blueprint" and Dr. Basesh Gala's "Zero to 500 Crore" roadmap
const KNOWLEDGE_BASE = {
  RETENTION: [
    {
      condition: (d: SalonData) => d.customers.churnRisk > (d.customers.total * 0.15),
      advice: "Your retention bucket is leaking. In the Janani vs Khaala (Mother vs Aunt) analogy, your team isn't feeling the shared pain of this leakage. Stop the 'Diwali vs Diwala' income cycle. Dr. Basesh Gala says: Respect is the ultimate lead indicator of revenue. If you don't treat your team with radical trust, they won't protect your 'Janani' (the business).",
      title: "Retention & Leadership Audit",
      impact: "High" as const,
      consultant: "Dr. Basesh Gala"
    },
    {
      condition: (d: SalonData) => d.customers.vips > 0 && d.revenue.gap > 50000,
      advice: "Target the 'MAN' (Money, Authority, Need) within the 'India 2' (9%) aspirational class. Your VIPs are your 'Vital Solution'—don't treat them like a 'Push Product'. Use the 'Kahania Bikti Hai' (Stories Sell) strategy to sell them a luxury lifestyle, not just a service.",
      title: "India 2 VIP Strategy",
      impact: "Medium" as const,
      consultant: "Dr. Basesh Gala"
    }
  ],
  REVENUE: [
    {
      condition: (d: SalonData) => d.revenue.gap > 0 && d.bookings.emptySlotsNext3Days > 10,
      advice: "Slots are expiring inventory. If you don't sell them today, the 'Fuel' in your bus is wasted. Apply the 'Faster, Cheaper, Easier' framework. If you can't fill these slots, your process isn't easy enough for the customer to book. Deploy a 'Flash Fill' system immediately.",
      title: "Faster-Cheaper-Easier Audit",
      impact: "High" as const,
      consultant: "Dr. Basesh Gala"
    },
    {
      condition: (d: SalonData) => d.revenue.pace < (d.revenue.target / 30),
      advice: "You are in an 'Accounting Void'. Scaling without systems is a suicide mission. Dr. Basesh Gala warns: If you don't have a weekly data audit of margins and credits, high volume means nothing. Eradicate financial excuses and master the 'Finance Pillar' now.",
      title: "Systemized Revenue Growth",
      impact: "High" as const,
      consultant: "Dr. Basesh Gala"
    }
  ],
  STAFF: [
    {
      condition: (d: SalonData) => d.staff.avgUtilization < 60,
      advice: "Skill provides security. Use this downtime to master the 'Tongue' and 'Skill' pillars. If you are the most intelligent person in the salon, you have failed. Use Rajiv Talreja's '6 R's' to remunerate and review your heroes. Remember the etiquette: 'Will you give me coffee?' Preserving dignity builds the 'Dua' of your laborers.",
      title: "Skill-First Team Optimization",
      impact: "Medium" as const,
      consultant: "Dr. Basesh Gala"
    }
  ],
  ADVANCED_STRATEGY: [
    {
      condition: (d: SalonData) => d.revenue.current > 300000,
      advice: "Deploy the '3S Formula' (Systems, Sales, Strategy). To exit 'Operator Mode', you must move from technical service to strategic leadership. Apply the 'Ansoff Matrix': Focus on 'Market Penetration' by increasing visit frequency of your existing 15% VIP base rather than just hunting new leads.",
      title: "3S Formula Expansion",
      impact: "High" as const,
      consultant: "Business Growth Blueprint"
    },
    {
      condition: (d: SalonData) => d.customers.total > 100,
      advice: "Implement a 'Recurring Revenue Membership'. Move from transactional to contractual. Tier 1: 'Essential Glow' (1 service/mo), Tier 2: 'Elite Transformation' (Unlimited blowouts + priority booking). This stabilizes your 'Energy Vessel' and guarantees break-even by the 5th of every month.",
      title: "Membership Model Deployment",
      impact: "High" as const,
      consultant: "LTV Optimization"
    },
    {
      condition: (d: SalonData) => d.revenue.gap > 0,
      advice: "Use the 'ERRC Framework': ELIMINATE low-margin services that drain time. REDUCE inventory wastage. RAISE your 'India 2' positioning. CREATE high-ticket 'Bundled Experiences' that solve a complete client problem (e.g., 'Wedding Ready' 6-month roadmap).",
      title: "ERRC Profit Audit",
      impact: "High" as const,
      consultant: "Strategic Management"
    }
  ],
  HORMOZI_OFFERS: [
    {
      condition: (d: SalonData) => true,
      advice: "Apply the Hormozi 'Value Equation': Value = (Dream Outcome * Likelihood) / (Time Delay * Effort). Your offers must maximize the top and minimize the bottom. A discount just lowers the price; a 'Grand Slam Offer' increases the perceived value so much that price becomes irrelevant.",
      title: "Value Equation Optimization",
      impact: "High" as const,
      consultant: "Alex Hormozi"
    },
    {
      condition: (d: SalonData) => d.bookings.emptySlotsNext3Days > 5,
      advice: "Create a 'Grand Slam Offer' for your empty slots. Don't just offer 20% off. Offer the 'Total Identity Reset' package: Haircut + Scalp Detox + Home Care Kit + 15-min Styling Lesson. Add Scarcity: 'Only 3 slots left for this transformation'. Add Urgency: 'Must book before 6 PM today'.",
      title: "Grand Slam Slot Filling",
      impact: "High" as const,
      consultant: "Alex Hormozi"
    },
    {
      condition: (d: SalonData) => d.customers.churnRisk > 10,
      advice: "Use 'Risk Reversal'. For your at-risk clients, offer a '100% Satisfaction or your next 3 services are on us' guarantee. Hormozi says: If you aren't afraid of your guarantee, it's not strong enough. This eliminates the 'Perceived Risk' of returning to a salon they haven't visited in months.",
      title: "Aggressive Risk Reversal",
      impact: "High" as const,
      consultant: "Alex Hormozi"
    }
  ],
  AVATAR_ENGINE: [
    {
      condition: (d: SalonData) => d.customers.total > 50,
      advice: "Apply the 'Lost Chapter' logic: Stop serving everyone. Your bottom 80% of customers are draining your energy. Survey your top 20% (VIPs) to find their 'Leading Indicators'. Do they work in tech? Are they married? Are they 'India 2' aspirational? Re-engineer your ads to speak ONLY to them.",
      title: "Hormozi Avatar Focus",
      impact: "High" as const,
      consultant: "Alex Hormozi"
    },
    {
      condition: (d: SalonData) => d.revenue.gap > 0,
      advice: "Reverse-engineer your best customers' buying journey. What was the 'Trigger Event' that made them book their first ₹5,000+ service? Replicate that event for all new leads. Quality > Quantity. It's better to have 10 high-value leads than 100 'bottom-feeders' who complain about price.",
      title: "Buying Process Reverse-Engineering",
      impact: "High" as const,
      consultant: "Alex Hormozi"
    }
  ],
  PRICING_PSYCHOLOGY: [
    {
      condition: (d: SalonData) => d.revenue.current > 0,
      advice: "Apply 'Charm Pricing'. End your service prices in .99 or .95. The 'Left-Digit Bias' makes ₹499 feel significantly cheaper than ₹500. For luxury services, use whole numbers (₹5000) to signal prestige.",
      title: "Psychological Thresholds",
      impact: "Medium" as const,
      consultant: "Pricing Scientist"
    },
    {
      condition: (d: SalonData) => d.revenue.gap > 50000,
      advice: "Use the 'Decoy Effect'. When offering a ₹2000 facial and a ₹5000 luxury spa, introduce a ₹4500 'Plus' option that is only slightly better than the ₹2000 one. The ₹5000 luxury option will now look like the 'obvious winner'.",
      title: "Asymmetric Dominance (Decoy)",
      impact: "High" as const,
      consultant: "Pricing Scientist"
    },
    {
      condition: (d: SalonData) => d.revenue.current > 0,
      advice: "Rule of 100: For services under ₹1000, show discounts as percentages (25% OFF). For services over ₹1000, show absolute values (₹500 OFF). The larger number always wins in the customer's brain.",
      title: "Discount Formatting",
      impact: "Medium" as const,
      consultant: "Pricing Scientist"
    },
    {
      condition: (d: SalonData) => d.revenue.current > 0,
      advice: "Descending Order: List your most expensive services first on your menu. Customers fear losing quality as they scan down, making them more likely to pick the higher-priced mid-tier options.",
      title: "Menu Order Psychology",
      impact: "Medium" as const,
      consultant: "Pricing Scientist"
    }
  ],
  MINDSET: [
    {
      condition: (d: SalonData) => d.revenue.current > 500000,
      advice: "Do you have the 'Energy Vessel' for a 100 Crore empire? If you feel a 'pinch in the heart' when investing, you are stuck in 'Operator Mode'. Adopt the 'Zero-Exit Mandate': Failure is not an option. Persistence must be your default operational state.",
      title: "Zero-Exit Mindset",
      impact: "Low" as const,
      consultant: "Dr. Basesh Gala"
    }
  ]
};

/**
 * Reasoning Engine: Matches salon data against the Knowledge Base
 * to synthesize custom growth strategies.
 */
export const synthesizeAdvice = (data: SalonData): ALIRecommendation[] => {
  const recommendations: ALIRecommendation[] = [];

  Object.values(KNOWLEDGE_BASE).forEach(category => {
    category.forEach(rule => {
      if (rule.condition(data)) {
        recommendations.push({
          title: rule.title,
          strategy: rule.advice,
          impact: rule.impact,
          difficulty: "Medium",
          expectedROI: rule.impact === "High" ? "Scalable Empire (500Cr Logic)" : "Vital Growth",
          source: "Data Pattern"
        });
      }
    });
  });

  // Dynamic data-driven additions
  if (data.bookings.emptySlotsNext3Days > 5) {
    recommendations.push({
      title: "Inventory Monetization",
      strategy: `You have ${data.bookings.emptySlotsNext3Days} expiring slots in the next 72 hours. This is 'expiring inventory'. Deploy a 'Flash Fill' WhatsApp blast to your Top 50 repeat clients with a 15% 'Early Bird' loyalty bonus for tomorrow morning.`,
      impact: "High",
      difficulty: "Easy",
      expectedROI: "Immediate Cashflow",
      source: "Predictive Heuristic"
    });
  }

  if (data.customers.churnRisk > 10) {
    recommendations.push({
      title: "Retention Recovery",
      strategy: `${data.customers.churnRisk} of your regulars are at risk. They haven't visited in 45+ days. Stop the 'Accounting Void' and send a 'We Miss You' personalized video note via WhatsApp. Dr. Basesh Gala says: Relationships are your primary asset, not just hair and nails.`,
      impact: "High",
      difficulty: "Medium",
      expectedROI: "Recovered Revenue",
      source: "Data Pattern"
    });
  }

  if (recommendations.length < 2) {
    recommendations.push({
      title: "SOP Standardization",
      strategy: "Dr. Basesh Gala Mandate: Stop the 'Gut Feeling' management. Scaling without systems is suicide. Implement weekly data audits and regional mastery (Asal Marathi/Local Pride) in your marketing today.",
      impact: "Medium",
      difficulty: "Easy",
      expectedROI: "Effortless Success",
      source: "Industry Benchmark"
    });
  }

  return recommendations;
};

/**
 * Strategy Generator: Creates a cohesive plan based on multiple recommendations
 * Now uses FULL history scan + LEARNED patterns + Alex Hormozi's frameworks.
 */
export const generateGrowthPlan = (data: SalonData, query: string, history: any[] = [], learnedPatterns: any[] = []) => {
  const recs = synthesizeAdvice(data);
  const q = query.toLowerCase();

  // 1. Context Extraction: Scan full history for persistent topics
  const fullHistoryText = history.map(h => h.content.toLowerCase()).join(" ") + " " + q;
  
  const ctx = {
    isOffer: fullHistoryText.includes("offer") || fullHistoryText.includes("discount") || fullHistoryText.includes("promo") || fullHistoryText.includes("free") || fullHistoryText.includes("deal"),
    isRevenue: fullHistoryText.includes("revenue") || fullHistoryText.includes("money") || fullHistoryText.includes("target") || fullHistoryText.includes("gap"),
    isStaff: fullHistoryText.includes("staff") || fullHistoryText.includes("team") || fullHistoryText.includes("stylist") || fullHistoryText.includes("performance"),
    isMarketing: fullHistoryText.includes("marketing") || fullHistoryText.includes("ads") || fullHistoryText.includes("campaign"),
    isAdvanced: fullHistoryText.includes("strategy") || fullHistoryText.includes("scale") || fullHistoryText.includes("growth") || fullHistoryText.includes("plan") || fullHistoryText.includes("advanced") || fullHistoryText.includes("grand slam"),
    isAvatar: fullHistoryText.includes("avatar") || fullHistoryText.includes("customer") || fullHistoryText.includes("lead") || fullHistoryText.includes("target audience") || fullHistoryText.includes("journey"),
    isPricing: fullHistoryText.includes("price") || fullHistoryText.includes("cost") || fullHistoryText.includes("discount") || fullHistoryText.includes("menu") || fullHistoryText.includes("psychology"),
    services: [] as string[]
  };

  ["haircut", "facial", "spa", "pedicure", "manicure", "color", "keratin"].forEach(s => {
    if (fullHistoryText.includes(s)) ctx.services.push(s);
  });

  // 2. Reinforcement Learning: Check if we have high-performing patterns for this intent
  const currentIntentKey = ctx.isPricing ? 'pricing' : ctx.isAvatar ? 'avatar' : ctx.isOffer ? 'offer' : ctx.isRevenue ? 'revenue' : ctx.isStaff ? 'staff' : 'general';
  const bestPattern = learnedPatterns.find(p => p.intent === currentIntentKey && p.feedback_score > 0);
  const isReinforced = !!bestPattern;

  // 3. Alex Hormozi's Value Equation Logic
  const applyValueEquation = (offerTitle: string, outcome: string) => {
    return {
      equation: "Value = (Dream Outcome * Perceived Likelihood) / (Time Delay * Effort/Sacrifice)",
      analysis: `Hormozi Analysis: Your '${offerTitle}' must maximize the '${outcome}' while minimizing 'Effort'.`,
      tip: "Instead of discounting price, add 'Bonuses' that increase likelihood of success (like a home maintenance kit)."
    };
  };

  // 4. Response Routing Logic

  // A. Pricing Psychology Strategy
  if (ctx.isPricing || q.includes("psychology")) {
    return {
      intent: 'pricing',
      isReinforced,
      summary: `Activating Pricing Psychology Engine. We are moving from 'Cost-Plus' to 'Psychological Value' pricing.`,
      steps: [
        "RULE OF 100: For services < ₹1000, use % discounts (e.g., 20% OFF). For services > ₹1000, use absolute values (e.g., ₹500 OFF). The larger numerical value feels like a bigger win to the brain.",
        "DECOY INSTALLATION: Don't just offer one price. If you have a ₹2500 facial, introduce a ₹5500 'Luxury' option and a ₹5000 'Plus' decoy. The ₹5500 will become your best-seller.",
        "MENU ANCHORING: List your most expensive service at the TOP. This anchors the customer to a high number, making every subsequent price feel like a bargain.",
        "CHARM PRICING: Use 'Left-Digit Bias'. ₹999 converts 28% better than ₹1000 for standard services. Keep whole numbers (₹10,000) ONLY for your most premium membership tiers."
      ],
      projections: {
        newRevenue: data.revenue.current * 0.22,
        confidence: 88
      }
    };
  }

  // B. Avatar & Lost Chapter Strategy
  if (ctx.isAvatar || q.includes("lost chapter")) {
    return {
      intent: 'avatar',
      isReinforced,
      summary: `Deploying Alex Hormozi's 'Lost Chapter' Avatar Logic. We are shifting from 'Quantity' to 'High-Margin Quality'.`,
      steps: [
        "80/20 AUDIT: Your top 20% of customers bring in 80% of your revenue. Identify them today. What is their 'Leading Indicator'? (e.g., Are they busy professionals? Do they value time over price?)",
        "REVERSE-ENGINEER: What was the 'Trigger Event' that made your best customer spend ₹${(data.revenue.current/data.customers.total*2).toFixed(0)}+? Replicate that experience for all new leads.",
        "REPEL THE REST: Stop selling to anyone with a pulse. Be upfront about your requirements. Use your marketing to attract your 'Dream Avatar' and intentionally repel 'bottom-feeders' who drain your team's energy."
      ],
      projections: {
        newRevenue: data.revenue.current * 0.40,
        confidence: 92
      }
    };
  }

  // B. Alex Hormozi's Grand Slam Offer / Advanced Strategy
  if (ctx.isAdvanced || (q.includes("hormozi") || q.includes("grand slam"))) {
    return {
      intent: 'advanced',
      isReinforced,
      summary: `Transitioning to Alex Hormozi's '$100M Offers' framework. We are moving from 'Commodity' to 'Category of One'.`,
      steps: [
        "NAMING: Use the M-A-G-I-C Formula (Magnet, Avatar, Goal, Interval, Container). Instead of 'Haircut', call it the '6-Week Identity Transformation Blueprint'.",
        "VALUE EQUATION: Increase the 'Dream Outcome'. Add a free 15-min styling masterclass and a 'Likelihood of Achievement' guarantee: 'If you don't look 5 years younger, we re-do it for free + give you a ₹1,000 credit'.",
        "SCARCITY & URGENCY: Only 5 'Transformation' packages available this week for 'India 2' clients. This isn't a discount; it's an exclusive investment in their personal brand."
      ],
      projections: {
        newRevenue: data.revenue.current * 0.55,
        confidence: 98
      }
    };
  }

  // B. Specific Service & Offer Refinement (e.g. "free haircut")
  if (ctx.services.length > 0 && ctx.isOffer) {
    const mainService = ctx.services[ctx.services.length - 1] || "service";
    const v = applyValueEquation(`Free ${mainService}`, "Identity Transformation");
    
    return {
      intent: 'offer',
      isReinforced,
      summary: `Analyzing your '${mainService.toUpperCase()}' offer through the Hormozi Value Equation:`,
      steps: [
        `${v.analysis}`,
        `BONUS STACK: Don't just give it away. Stack it with a 'Risk Reversal' guarantee. 'Free ${mainService} if you aren't the most complimented person in the room by tomorrow'.`,
        `EFFORT REDUCTION: Offer 'VIP Priority Lane' for these clients. If they have to wait 20 mins, the 'Effort/Sacrifice' part of the equation kills the value.`
      ],
      projections: {
        newRevenue: 15000,
        confidence: 88
      }
    };
  }

  // C. Revenue & Growth Focus
  if (ctx.isRevenue) {
    return {
      intent: 'revenue',
      isReinforced,
      summary: `Bridging the ₹${data.revenue.gap.toLocaleString()} gap using the 'Zero-Exit Mandate' and 'Ansoff Matrix' penetration:`,
      steps: [
        bestPattern ? `LEARNED SUCCESS: ${bestPattern.strategy_applied.split('.')[0]}` : `Focus on your ${data.customers.vips} VIPs. Increase visit frequency via 'Exclusive Member-Only' nights.`,
        "ERRC Profit Audit: ELIMINATE services that take > 90 mins but return < ₹1,500. CREATE 'Identity Packages' that bundle 4 services into one 3-hour luxury session.",
        "Systems Scale: If you are still doing the haircuts, you are a technician, not a CEO. Use Rajiv Talreja's '3S Formula' to automate the 'Sales' pillar today."
      ],
      projections: {
        newRevenue: data.revenue.gap * 0.45,
        confidence: 94
      }
    };
  }

  // D. Default: General Growth Strategy
  return {
    intent: 'general',
    isReinforced,
    summary: `I've analyzed your operational stack. We are deploying a 'Grand Slam' strategy to turn your salon into a 'Vital Solution'.`,
    steps: recs.slice(0, 3).map(r => r.strategy),
    projections: {
      newRevenue: 45000,
      confidence: 90
    }
  };
};

