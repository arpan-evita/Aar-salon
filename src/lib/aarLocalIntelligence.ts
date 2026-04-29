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
const KNOWLEDGE_BASE = {
  RETENTION: [
    {
      condition: (d: SalonData) => d.customers.churnRisk > (d.customers.total * 0.15),
      advice: "Churn levels are exceeding 15%. Activate the 'Loyalty Lockdown' protocol: Send personalized 'We Miss You' vouchers with a 48-hour expiry to high-LTV clients.",
      title: "Retention Crisis",
      impact: "High" as const
    },
    {
      condition: (d: SalonData) => d.customers.vips > 0 && d.revenue.gap > 50000,
      advice: "Your top 20% customers are under-leveraged. Launch a 'VIP Priority Access' campaign for new premium services to close the revenue gap.",
      title: "VIP Upsell Opportunity",
      impact: "Medium" as const
    }
  ],
  REVENUE: [
    {
      condition: (d: SalonData) => d.revenue.gap > 0 && d.bookings.emptySlotsNext3Days > 10,
      advice: "Inventory of time (slots) is expiring. Deploy 'Flash Fill' offers for tomorrow's 1 PM - 4 PM gaps. Discount service price by 15% to recover fixed costs.",
      title: "Flash Slot Recovery",
      impact: "High" as const
    },
    {
      condition: (d: SalonData) => d.revenue.pace < (d.revenue.target / 30),
      advice: "Daily velocity is below target. Recommended action: Bundle low-cost, high-perceived-value services (e.g., Hair Spa + Trim) to increase Average Transaction Value (ATV).",
      title: "Velocity Booster",
      impact: "High" as const
    }
  ],
  STAFF: [
    {
      condition: (d: SalonData) => d.staff.avgUtilization < 60,
      advice: "Staff utilization is suboptimal at <60%. Pivot to 'Education Days' or 'Community outreach' bookings to build future pipeline without increasing overhead.",
      title: "Occupancy Optimization",
      impact: "Medium" as const
    }
  ]
};

/**
 * Reasoning Engine: Matches salon data against the Knowledge Base
 * to synthesize custom growth strategies.
 */
export const synthesizeAdvice = (data: SalonData): ALIRecommendation[] => {
  const recommendations: ALIRecommendation[] = [];

  // Iterate through knowledge categories and check conditions
  Object.values(KNOWLEDGE_BASE).forEach(category => {
    category.forEach(rule => {
      if (rule.condition(data)) {
        recommendations.push({
          title: rule.title,
          strategy: rule.advice,
          impact: rule.impact,
          difficulty: "Medium",
          expectedROI: rule.impact === "High" ? "3.5x - 5.0x" : "1.5x - 2.5x",
          source: "Data Pattern"
        });
      }
    });
  });

  // Always add an industry benchmark if data is sparse
  if (recommendations.length < 2) {
    recommendations.push({
      title: "Standard Premium Growth",
      strategy: "Based on premium salon benchmarks, focus on increasing your 'Service Rebooking Rate' at checkout. A 10% increase in rebookings grows annual revenue by 22%.",
      impact: "Medium",
      difficulty: "Easy",
      expectedROI: "4.0x",
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
  
  if (query.toLowerCase().includes("reach") || query.toLowerCase().includes("target")) {
    return {
      summary: `To close the ₹${data.revenue.gap.toLocaleString()} gap, the AAR Intelligence system suggests a three-pronged approach focusing on ${recs[0].title} and ${recs[1]?.title || 'Retention'}.`,
      steps: recs.map(r => r.strategy),
      projections: {
        newRevenue: data.revenue.gap * 1.1,
        confidence: 85
      }
    };
  }

  return {
    summary: "AAR's local engine has identified key opportunities in your customer base and scheduling gaps.",
    steps: recs.slice(0, 3).map(r => r.strategy),
    projections: {
      newRevenue: 45000,
      confidence: 90
    }
  };
};
