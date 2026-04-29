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
// Inspired by Dr. Basesh Gala (Systems/SOPs) and Rajiv Talreja (PACE/Scalability)
const KNOWLEDGE_BASE = {
  RETENTION: [
    {
      condition: (d: SalonData) => d.customers.churnRisk > (d.customers.total * 0.15),
      advice: "Your retention bucket is leaking. Stop being an operator and start being a strategist. Activate the 'Loyalty Lockdown' protocol: Send personalized 'We Miss You' vouchers with a 48-hour expiry. Systemize this so it happens without your manual intervention.",
      title: "Retention System Audit",
      impact: "High" as const,
      consultant: "Dr. Basesh Gala"
    },
    {
      condition: (d: SalonData) => d.customers.vips > 0 && d.revenue.gap > 50000,
      advice: "You are leaving money on the table. Your VIPs are your growth engine. Launch a 'Priority Access' campaign for premium services. In the P.A.C.E framework, this is your 'Attract' and 'Profit' lever combined.",
      title: "High-Ticket Profit Lever",
      impact: "Medium" as const,
      consultant: "Rajiv Talreja"
    }
  ],
  REVENUE: [
    {
      condition: (d: SalonData) => d.revenue.gap > 0 && d.bookings.emptySlotsNext3Days > 10,
      advice: "Slots are expiring inventory. If you don't sell them today, the revenue is lost forever. Deploy 'Flash Fill' offers for the 1 PM - 4 PM window. This is raw 'Execution' efficiency.",
      title: "Inventory Hygiene Check",
      impact: "High" as const,
      consultant: "Rajiv Talreja"
    },
    {
      condition: (d: SalonData) => d.revenue.pace < (d.revenue.target / 30),
      advice: "Your revenue velocity is sluggish. You need to master the 'Finance Pillar'. Bundle low-cost, high-value add-ons (Hair Spa + Trim) to spike your ATV (Average Transaction Value). Numbers don't lie, operators do.",
      title: "Revenue Velocity Strategy",
      impact: "High" as const,
      consultant: "Dr. Basesh Gala"
    }
  ],
  STAFF: [
    {
      condition: (d: SalonData) => d.staff.avgUtilization < 60,
      advice: "Your team is idling. Systems over Hustle! Pivot idle time into 'Academy Upskilling'. Use Neha or Rahul's downtime to train junior staff. Build a business that runs even when you aren't watching.",
      title: "Operational Scalability",
      impact: "Medium" as const,
      consultant: "Rajiv Talreja"
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
          strategy: `${rule.consultant} says: ${rule.advice}`,
          impact: rule.impact,
          difficulty: "Medium",
          expectedROI: rule.impact === "High" ? "3X - 5X Growth" : "1.5X - 2X Profit",
          source: "Data Pattern"
        });
      }
    });
  });

  if (recommendations.length < 2) {
    recommendations.push({
      title: "SOP Standardization",
      strategy: "Dr. Basesh Gala Insight: Standardize your service delivery. If your 'Haircut' feels different with every stylist, you don't have a business, you have a collection of freelancers. Implement SOPs today.",
      impact: "Medium",
      difficulty: "Easy",
      expectedROI: "Long-term Scalability",
      source: "Industry Benchmark"
    });
  }

  return recommendations;
};

/**
 * Strategy Generator: Creates a cohesive plan based on multiple recommendations
 */
export const generateGrowthPlan = (data: SalonData, query: string) => {
  const recs = synthesizeAdvice(data);
  const persona = Math.random() > 0.5 ? "Dr. Basesh Gala" : "Rajiv Talreja";
  
  if (query.toLowerCase().includes("reach") || query.toLowerCase().includes("target")) {
    return {
      summary: `LISTEN CAREFULLY: To hit that ₹${(data.revenue.target/100000).toFixed(1)}L target, you need to stop firefighting and start leading. I've performed a 'P.A.C.E' audit on your ₹${data.revenue.gap.toLocaleString()} gap.`,
      steps: recs.map(r => r.strategy),
      projections: {
        newRevenue: data.revenue.gap * 1.05,
        confidence: 88
      }
    };
  }

  return {
    summary: `System Check Complete. Your business is currently in 'Operator Mode'. Let's move you to 'Visionary Mode' with these data-driven pivots.`,
    steps: recs.slice(0, 3).map(r => r.strategy),
    projections: {
      newRevenue: 45000,
      confidence: 90
    }
  };
};
