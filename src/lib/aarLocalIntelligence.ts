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
// Infused with Rajiv Talreja's "Business Growth Blueprint" and Dr. Basesh Gala's "3S Framework"
const KNOWLEDGE_BASE = {
  RETENTION: [
    {
      condition: (d: SalonData) => d.customers.churnRisk > (d.customers.total * 0.15),
      advice: "Your business is in the 'Diwali vs Diwala' trap—high income today, financial drought tomorrow. Stop being a 'Useless Son-in-law' to your own business and implement a Retention System. Your customers are screaming at the 'Bus Driver' because they don't have a destination. Lock down loyalty with automated vouchers before they board a competitor's bus.",
      title: "Retention System Overhaul",
      impact: "High" as const,
      consultant: "Rajiv Talreja"
    },
    {
      condition: (d: SalonData) => d.customers.vips > 0 && d.revenue.gap > 50000,
      advice: "Target the 'MAN' (Money, Authority, Need) within your top 10 lakh audience. Your VIPs have the Money and the Need—don't let them become 'Betal' ghosts on your shoulders by ignoring them. Use Perceptive Value Pricing to upsell premium memberships and fulfill your 'Trinity of Margin'.",
      title: "VIP Revenue Logic",
      impact: "Medium" as const,
      consultant: "Rajiv Talreja"
    }
  ],
  REVENUE: [
    {
      condition: (d: SalonData) => d.revenue.gap > 0 && d.bookings.emptySlotsNext3Days > 10,
      advice: "Empty slots are expiring inventory. If you don't fill them, you're wasting 'Fuel' in your bus. This is a failure of 'Execution' in the P.A.C.E framework. Deploy a 'Flash Fill' system for the 1 PM - 4 PM window immediately.",
      title: "P.A.C.E Execution Audit",
      impact: "High" as const,
      consultant: "Rajiv Talreja"
    },
    {
      condition: (d: SalonData) => d.revenue.pace < (d.revenue.target / 30),
      advice: "You are suffering from 'Decision Fatigue' because you lack a Sales System. Numbers don't lie, operators do. Master the 'Finance Pillar' by bundling services to spike your ATV. Remember: Value - Margin = Targeted Cost. Don't just add profit, design it.",
      title: "Revenue Velocity Pillar",
      impact: "High" as const,
      consultant: "Dr. Basesh Gala"
    }
  ],
  STAFF: [
    {
      condition: (d: SalonData) => d.staff.avgUtilization < 60,
      advice: "Hiring random people for random jobs is a disaster. If you are the most intelligent person in this salon, you have already failed. Use the '6 R's'—Recruit with ASK clarity, then Review. If your team is idle, it's because your 'SOPs' are missing. Mentor + System + Team = Effortless Success.",
      title: "6 R's Team Performance",
      impact: "Medium" as const,
      consultant: "Rajiv Talreja"
    }
  ],
  MINDSET: [
    {
      condition: (d: SalonData) => d.revenue.current > 500000,
      advice: "You have the budget, but do you have the 'Energy Vessel'? If you feel a 'pinch in the heart' when investing in your business growth, your vessel is too small. Practice systemic kindness to yourself so you can lead a high-performance team.",
      title: "Energy Vessel Expansion",
      impact: "Low" as const,
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
          strategy: `${rule.consultant} Direct Insight: ${rule.advice}`,
          impact: rule.impact,
          difficulty: "Medium",
          expectedROI: rule.impact === "High" ? "Scalable Empire" : "Breakthrough Profit",
          source: "Data Pattern"
        });
      }
    });
  });

  if (recommendations.length < 2) {
    recommendations.push({
      title: "SOP Standardization",
      strategy: "Dr. Basesh Gala says: Stop firefighting. If your service delivery depends on the mood of the stylist, you have a cage, not a business. Implement SOPs today to move from Operator to Visionary.",
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
 */
export const generateGrowthPlan = (data: SalonData, query: string) => {
  const recs = synthesizeAdvice(data);
  const persona = Math.random() > 0.5 ? "Dr. Basesh Gala" : "Rajiv Talreja";
  
  if (query.toLowerCase().includes("reach") || query.toLowerCase().includes("target")) {
    return {
      summary: `LISTEN CAREFULLY: To hit that ₹${(data.revenue.target/100000).toFixed(1)}L target, you must exit the 'Self-Employment Trap'. I've run a blueprint check on your ₹${data.revenue.gap.toLocaleString()} gap. Your goal is the 'Business Breakthrough'.`,
      steps: recs.map(r => r.strategy),
      projections: {
        newRevenue: data.revenue.gap * 1.05,
        confidence: 92
      }
    };
  }

  return {
    summary: `Your salon is currently in 'Firefighting Mode'. Let's move you to the 'AAR Empire' orbit with these system-driven pivots.`,
    steps: recs.slice(0, 3).map(r => r.strategy),
    projections: {
      newRevenue: 45000,
      confidence: 90
    }
  };
};
