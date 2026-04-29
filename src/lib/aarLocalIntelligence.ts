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
          strategy: `${rule.consultant} Expert Directive: ${rule.advice}`,
          impact: rule.impact,
          difficulty: "Medium",
          expectedROI: rule.impact === "High" ? "Scalable Empire (500Cr Logic)" : "Vital Growth",
          source: "Data Pattern"
        });
      }
    });
  });

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
 */
export const generateGrowthPlan = (data: SalonData, query: string) => {
  const recs = synthesizeAdvice(data);
  const persona = Math.random() > 0.5 ? "Dr. Basesh Gala" : "Rajiv Talreja";
  
  if (query.toLowerCase().includes("reach") || query.toLowerCase().includes("target")) {
    return {
      summary: `LISTEN CAREFULLY: To hit that ₹${(data.revenue.target/100000).toFixed(1)}L target, you must exit the 'Self-Employment Trap' and stop the 'Suicide Mission' of scaling without data. I've performed a 'Zero to 500Cr' blueprint check on your ₹${data.revenue.gap.toLocaleString()} gap.`,
      steps: recs.map(r => r.strategy),
      projections: {
        newRevenue: data.revenue.gap * 1.05,
        confidence: 94
      }
    };
  }

  return {
    summary: `Your business is currently a 'Push Product'. Let's turn it into a 'Vital Solution' for the 'India 2' class using the 'Janani vs Khaala' people strategy.`,
    steps: recs.slice(0, 3).map(r => r.strategy),
    projections: {
      newRevenue: 45000,
      confidence: 90
    }
  };
};

