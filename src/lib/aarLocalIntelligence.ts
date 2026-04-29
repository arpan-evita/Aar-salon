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
 * Now uses intent detection to be more "Human Consultant" like.
 */
export const generateGrowthPlan = (data: SalonData, query: string, history: any[] = []) => {
  const recs = synthesizeAdvice(data);
  const q = query.toLowerCase();

  // Intent Detection
  const isOffer = q.includes("offer") || q.includes("discount") || q.includes("promo") || q.includes("deal") || q.includes("free") || q.includes("gift");
  const isRevenue = q.includes("revenue") || q.includes("money") || q.includes("target") || q.includes("income") || q.includes("profit") || q.includes("reach");
  const isStaff = q.includes("staff") || q.includes("team") || q.includes("stylist") || q.includes("employee") || q.includes("performance");
  const isMarketing = q.includes("marketing") || q.includes("ads") || q.includes("campaign") || q.includes("social");
  const isSpecificService = q.includes("haircut") || q.includes("facial") || q.includes("spa") || q.includes("pedicure") || q.includes("manicure") || q.includes("color") || q.includes("keratin");

  // Reference memory if available - Fix the doubling bug by checking if previous content already has the prefix
  const hadPreviousDiscussion = history.length > 0;
  let memoryContext = "";
  if (hadPreviousDiscussion) {
    const lastMsg = history[history.length-1].content;
    if (!lastMsg.startsWith("Continuing our analysis")) {
      memoryContext = `Continuing our analysis of ${lastMsg.slice(0, 40)}... `;
    }
  }

  // 1. Handle Specific Service Proposals (e.g., "what if we give one free haircut")
  if (isSpecificService && (q.includes("free") || q.includes("offer") || q.includes("what if"))) {
    const service = q.match(/haircut|facial|spa|pedicure|manicure|color|keratin/)?.[0] || "service";
    const isFree = q.includes("free");
    
    if (isFree) {
      return {
        summary: `${memoryContext}Analyzing your 'Free ${service.toUpperCase()}' proposal through the Dr. Basesh Gala 'Finance Pillar' lens:`,
        steps: [
          `CAUTION: A free ${service} has a high 'Acquisition Cost'. Unless it's tied to a high-ticket upsell (like a Keratin treatment or a 12-month membership), you are just leaking 'Fuel'.`,
          `STRATEGY: Instead of 'Free', use 'Value Add'. Give a free scalp massage with every ${service}. It preserves the 'Dignity' of the service while increasing the 'Dua' of the customer.`,
          `DATA CHECK: You have ${data.bookings.emptySlotsNext3Days} empty slots. Use the ${service} offer ONLY for 'Flash Fill' during non-peak hours (Tue-Thu 11am-4pm) to avoid cannibalizing full-price weekend revenue.`
        ],
        projections: {
          newRevenue: -500, // Short term loss for long term gain
          confidence: 75
        }
      };
    }
  }

  // 2. Handle Offers/Promotions
  if (isOffer) {
    const offerAdvice = [];
    if (data.bookings.emptySlotsNext3Days > 3) {
      offerAdvice.push(`Since you have ${data.bookings.emptySlotsNext3Days} empty slots coming up, I recommend a 'Flash Fill' discount of 20% for any booking in the next 24 hours.`);
    }
    if (data.customers.churnRisk > 5) {
      offerAdvice.push(`To address your ${data.customers.churnRisk} at-risk clients, let's create a 'Comeback Special': A complimentary deep conditioning treatment with any service above ₹1,000.`);
    }
    if (data.customers.vips > 0) {
      offerAdvice.push(`For your ${data.customers.vips} VIPs, don't just give a discount. Give them 'Exclusive Access' to a new service trial.`);
    }

    return {
      summary: `${memoryContext}To make a truly 'Great Offer', we must solve for your current bottlenecks. Based on your data, here is your 3-tier promotion strategy:`,
      steps: offerAdvice.length > 0 ? offerAdvice : ["Create a 'Bundle & Save' offer for low-utilization services to increase ARPU."],
      projections: {
        newRevenue: data.customers.churnRisk * 800 + (data.bookings.emptySlotsNext3Days * 1200),
        confidence: 88
      }
    };
  }

  // 3. Handle Revenue/Targets
  if (isRevenue) {
    return {
      summary: `${memoryContext}LISTEN CAREFULLY: To hit that ₹${(data.revenue.target/100000).toFixed(1)}L target, we need to bridge a ₹${data.revenue.gap.toLocaleString()} gap. This isn't about working harder; it's about the 'Zero-Exit Mandate' and systems.`,
      steps: [
        `Focus on your ${data.customers.vips} VIPs—they are your 'Vital Solution'. Increasing their frequency by 10% closes 40% of your gap.`,
        `Your pace is currently ${data.revenue.pace > 1 ? 'strong' : 'lagging'}. We need to shift from 'Push Product' to 'India 2' aspirational marketing immediately.`,
        "Implement a weekly 'Accounting Void' check to ensure margins aren't leaking in your top services."
      ],
      projections: {
        newRevenue: data.revenue.gap * 0.4,
        confidence: 94
      }
    };
  }

  // 4. Handle Staff
  if (isStaff) {
    return {
      summary: `${memoryContext}Team performance is the 'Energy Vessel' of your salon. With an average utilization of ${data.staff.avgUtilization}%, you have room for growth without hiring.`,
      steps: [
        `Identify why your ${data.staff.topPerformer ? data.staff.topPerformer : 'top team members'} are succeeding and map their 'Tongue' pillar scripts for the rest of the team.`,
        "Use Rajiv Talreja's '6 R's' (Remunerate, Review, Reward, etc.) to automate management. Stop being the 'Firefighter' in your business.",
        "Preserve the 'Dua' of your laborers by investing in their skill mastery during the current downtime."
      ],
      projections: {
        newRevenue: 25000,
        confidence: 82
      }
    };
  }

  // 5. Handle Marketing
  if (isMarketing) {
    return {
      summary: `${memoryContext}Your marketing must move from 'Information' to 'Emotion'. You are selling luxury, not hair.`,
      steps: [
        "Stop boring ads. Use 'Kahania Bikti Hai' (Stories Sell) to showcase the transformation of your clients.",
        `Leverage your ${data.customers.total} customer base. A referral program for your ${data.customers.vips} VIPs is 5x cheaper than new ads.`,
        "Focus on the 'India 2' class—they have the money and the aspiration. Your brand voice must reflect their status."
      ],
      projections: {
        newRevenue: 30000,
        confidence: 85
      }
    };
  }

  // Default: General Growth Strategy
  return {
    summary: `${memoryContext}I've analyzed your full operational stack. Your business is currently a 'Push Product'. Let's turn it into a 'Vital Solution' using the 'Janani vs Khaala' people strategy and systemized growth.`,
    steps: recs.slice(0, 3).map(r => r.strategy),
    projections: {
      newRevenue: 45000,
      confidence: 90
    }
  };
};

