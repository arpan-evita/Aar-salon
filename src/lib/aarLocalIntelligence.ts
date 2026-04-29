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
 * Now uses FULL history scan to maintain context across the entire session.
 */
export const generateGrowthPlan = (data: SalonData, query: string, history: any[] = []) => {
  const recs = synthesizeAdvice(data);
  const q = query.toLowerCase();

  // 1. Context Extraction: Scan full history for persistent topics
  const fullHistoryText = history.map(h => h.content.toLowerCase()).join(" ") + " " + q;
  
  const ctx = {
    isOffer: fullHistoryText.includes("offer") || fullHistoryText.includes("discount") || fullHistoryText.includes("promo") || fullHistoryText.includes("free"),
    isRevenue: fullHistoryText.includes("revenue") || fullHistoryText.includes("money") || fullHistoryText.includes("target") || fullHistoryText.includes("gap"),
    isStaff: fullHistoryText.includes("staff") || fullHistoryText.includes("team") || fullHistoryText.includes("stylist") || fullHistoryText.includes("performance"),
    isMarketing: fullHistoryText.includes("marketing") || fullHistoryText.includes("ads") || fullHistoryText.includes("campaign"),
    services: [] as string[]
  };

  ["haircut", "facial", "spa", "pedicure", "manicure", "color", "keratin"].forEach(s => {
    if (fullHistoryText.includes(s)) ctx.services.push(s);
  });

  // Determine the "Active Intent" (current query priority vs history)
  const currentIntent = {
    offer: q.includes("offer") || q.includes("discount") || q.includes("promo") || q.includes("deal") || q.includes("free"),
    revenue: q.includes("revenue") || q.includes("money") || q.includes("target") || q.includes("income") || q.includes("profit") || q.includes("reach"),
    staff: q.includes("staff") || q.includes("team") || q.includes("stylist") || q.includes("employee") || q.includes("performance"),
    marketing: q.includes("marketing") || q.includes("ads") || q.includes("campaign") || q.includes("social"),
    service: ctx.services.some(s => q.includes(s))
  };

  // Check for refinement queries (e.g. "tell me more", "how?", "another option")
  const isRefinement = q.includes("more") || q.includes("how") || q.includes("elaborate") || q.includes("why") || q.includes("another") || q.includes("explain") || q.length < 15;

  // 2. Memory Context Synthesis - Avoid prefixing "Continuing our analysis" if already present
  let memorySummary = "";
  if (history.length > 0) {
    const topics = [];
    if (ctx.isOffer) topics.push("promotions");
    if (ctx.isRevenue) topics.push("revenue targets");
    if (ctx.isStaff) topics.push("team performance");
    if (ctx.services.length > 0) topics.push(ctx.services.join("/") + " services");

    memorySummary = `Deepening our consult on your ${topics.join(", ")}. `;
  }

  // 3. Response Routing Logic

  // A. Specific Service & Offer Refinement (e.g. "what if we give one free haircut" followed by "how?")
  if ((currentIntent.service || (isRefinement && ctx.services.length > 0)) && ctx.isOffer) {
    const mainService = ctx.services[ctx.services.length - 1] || "service";
    return {
      summary: `${memorySummary}Let's drill down into the 'Free ${mainService.toUpperCase()}' strategy. In the Dr. Basesh Gala 'Finance Pillar', we must avoid 'Suicide Scaling'.`,
      steps: [
        `ROI AUDIT: A free ${mainService} costs you ~₹${mainService === 'haircut' ? '250' : '800'} in variable labor. To break even, you MUST secure a re-booking on the spot.`,
        "TACTIC: Instead of just 'Free', offer a 'Mystery Upgrade'. Tell them: 'Book your next visit now and your ${mainService} today is on us'. This locks in the LTV (Lifetime Value).",
        `DATA LEVERAGE: You mentioned ${ctx.services.join(", ")}. Bundle them! A 'High-Value Package' is always better than a single free service.`
      ],
      projections: {
        newRevenue: 12000,
        confidence: 85
      }
    };
  }

  // B. Revenue & Growth Focus
  if (currentIntent.revenue || (isRefinement && ctx.isRevenue)) {
    return {
      summary: `${memorySummary}Focusing on your ₹${(data.revenue.target/100000).toFixed(1)}L goal and the ₹${data.revenue.gap.toLocaleString()} gap:`,
      steps: [
        `Prioritize your ${data.customers.vips} VIPs. If you move them from 1 visit/month to 1.2 visits/month, your gap shrinks by 20% instantly.`,
        "Apply the 'Faster, Cheaper, Easier' framework. Is your booking link in your Instagram bio? If not, you're losing 'Fuel' every hour.",
        "Dr. Basesh Gala says: 'Persistence is your default operational state.' Don't stop the campaign until the target is met."
      ],
      projections: {
        newRevenue: data.revenue.gap * 0.35,
        confidence: 92
      }
    };
  }

  // C. General Offer Focus
  if (currentIntent.offer || (isRefinement && ctx.isOffer)) {
    const offerAdvice = [];
    if (data.bookings.emptySlotsNext3Days > 3) {
      offerAdvice.push(`FLASH FILL: You have ${data.bookings.emptySlotsNext3Days} gaps. 20% off for 'Last Minute' bookings via WhatsApp.`);
    }
    if (data.customers.churnRisk > 5) {
      offerAdvice.push(`COMEBACK: Send a ₹500 'Welcome Back' credit to your ${data.customers.churnRisk} at-risk regulars.`);
    }
    
    return {
      summary: `${memorySummary}To maximize impact, we are using your 'Expiring Inventory' (${data.bookings.emptySlotsNext3Days} slots) as the anchor:`,
      steps: offerAdvice.length > 0 ? offerAdvice : ["Bundle your lowest utilization services into a 'Power Hour' package to boost mid-week ARPU."],
      projections: {
        newRevenue: 25000,
        confidence: 88
      }
    };
  }

  // D. Staff & Performance
  if (currentIntent.staff || (isRefinement && ctx.isStaff)) {
    return {
      summary: `${memorySummary}Optimizing your 'Energy Vessel' (Team Utilization: ${data.staff.avgUtilization}%):`,
      steps: [
        `Your top performer (${data.staff.topPerformer || 'Primary Stylist'}) is the benchmark. Record their consultation 'Tongue' scripts.`,
        "Implement Rajiv Talreja's '6 R's' system. Every Monday at 9 AM, review the previous week's 'Retail vs Service' ratios.",
        "Preserve 'Dua': When the salon is empty, invest in training. Skill mastery is the only true security for your team."
      ],
      projections: {
        newRevenue: 15000,
        confidence: 80
      }
    };
  }

  // E. Default: General Growth Strategy (using history if available)
  return {
    summary: `${memorySummary}I've analyzed your full operational stack. We are transitioning you from 'Push Product' to 'Vital Solution' logic.`,
    steps: recs.slice(0, 3).map(r => r.strategy),
    projections: {
      newRevenue: 45000,
      confidence: 90
    }
  };
};

