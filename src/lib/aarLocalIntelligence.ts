import { supabase } from '@/integrations/supabase/client';

export interface SalonData {
  revenue: {
    current: number;
    target: number;
    growth: number;
    gap: number;
  };
  customers: {
    total: number;
    active: number;
    atRisk: number;
    new: number;
  };
  staff: {
    total: number;
    active: number;
    topPerformers: string[];
  };
  services: {
    top: string[];
    underperforming: string[];
  };
}

export interface LearningPattern {
  intent: string;
  strategy_intent: string;
  applied_strategy: string;
  feedback_score: number;
  context_metadata?: any;
}

export interface GrowthPlan {
  intent: string;
  isReinforced: boolean;
  summary: string;
  steps: string[];
  strategies?: {
    title: string;
    impact: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    timeline: string;
    details: string;
  }[];
  offers?: {
    name: string;
    target: string;
    benefit: string;
    action: string;
  }[];
  metrics?: {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
  }[];
  projections: {
    newRevenue: number;
    confidence: number;
  };
}

export const KNOWLEDGE_BASE = {
  OFFERS: [
    {
      condition: (d: SalonData) => d.revenue.current < d.revenue.target * 0.8,
      advice: "Grand Slam Offer: Combine your top 3 services into a 'Total Transformation Bundle'. Price it at a 20% discount but add a free 'Home Care Kit'. This maximizes upfront cash and ensures results.",
      title: "The $100M Bundle",
      impact: "High" as const,
      consultant: "Alex Hormozi"
    }
  ],
  PRICING: [
    {
      condition: (d: SalonData) => d.revenue.current > 0,
      advice: "Rule of 100: For items under ₹1000, offer percentage discounts (e.g., 20% off). For items over ₹1000, offer absolute discounts (e.g., ₹500 off). The larger number always feels like a bigger win.",
      title: "Psychological Discounting",
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
  UPSELL_CROSS_SELL: [
    {
      condition: (d: SalonData) => d.revenue.current > 0,
      advice: "Activate 'Post-Purchase Joy'. The moment after a customer books/pays is their most engaged state. Use the confirmation page to offer a one-click 'Instant Upgrade'.",
      title: "Digital Impulse Buy",
      impact: "High" as const,
      consultant: "Shopify/Vogue Tech"
    }
  ],
  RETENTION_CRM: [
    {
      condition: (d: SalonData) => d.revenue.current > 0,
      advice: "Apply RFM Analysis: Segment your customers into 'Champions', 'At Risk', and 'One-and-Done'. Target Champions with VIP early-access and At-Risk with escalating win-back offers.",
      title: "RFM Segmentation",
      impact: "High" as const,
      consultant: "Nector/HubSpot"
    }
  ],
  SALON_BENCHMARKS: [
    {
      condition: (d: SalonData) => d.revenue.current > 0,
      advice: "Retention Scoring: <40% (Critical), 40-55% (Weak), 55-65% (Average), 65-75% (Good), 75-85% (Excellent), 85%+ (Elite).",
      title: "Retention Performance",
      impact: "High" as const,
      consultant: "Industry Standard"
    }
  ],
  MINDSET: [
    {
      condition: (d: SalonData) => d.revenue.current > 500000,
      advice: "Shift from 'Operator' to 'Owner'. Stop doing haircuts and start building systems. Your time is worth ₹5000/hr in strategy, but only ₹500/hr in execution.",
      title: "CEO Identity Shift",
      impact: "High" as const,
      consultant: "Growth Mentor"
    }
  ]
};

export const generateGrowthPlan = async (
  q: string, 
  data: SalonData, 
  history: {role: string, content: string}[],
  learnedPatterns: LearningPattern[] = []
): Promise<GrowthPlan> => {
  const query = q.toLowerCase();
  const fullHistoryText = (history.map(h => h.content.toLowerCase()).join(" ") + " " + query);
  
  const ctx = {
    isRevenue: fullHistoryText.includes("revenue") || fullHistoryText.includes("sales") || fullHistoryText.includes("target") || fullHistoryText.includes("goal"),
    isStaff: fullHistoryText.includes("staff") || fullHistoryText.includes("stylist") || fullHistoryText.includes("team"),
    isAcademy: fullHistoryText.includes("academy") || fullHistoryText.includes("student") || fullHistoryText.includes("course"),
    isRetention: fullHistoryText.includes("retention") || fullHistoryText.includes("churn") || fullHistoryText.includes("loyalty") || fullHistoryText.includes("comeback"),
    isUpsell: fullHistoryText.includes("upsell") || fullHistoryText.includes("cross-sell") || fullHistoryText.includes("aov") || fullHistoryText.includes("bundle"),
    isPricing: fullHistoryText.includes("price") || fullHistoryText.includes("cost") || fullHistoryText.includes("discount") || fullHistoryText.includes("psychology"),
    isOffer: fullHistoryText.includes("offer") || fullHistoryText.includes("campaign") || fullHistoryText.includes("promo") || fullHistoryText.includes("marketing"),
    isVIP: fullHistoryText.includes("vip") || fullHistoryText.includes("premium") || fullHistoryText.includes("membership")
  };

  const currentIntentKey = ctx.isStaff ? 'staff' : ctx.isAcademy ? 'academy' : ctx.isRetention ? 'retention' : ctx.isUpsell ? 'upsell' : ctx.isPricing ? 'pricing' : 'general';
  const bestPattern = learnedPatterns.find(p => p.intent === currentIntentKey && p.feedback_score > 0);
  const isReinforced = !!bestPattern;

  // A. Offer & Campaign Synthesis
  if (ctx.isOffer || query.includes("offer") || query.includes("campaign")) {
    const advice = KNOWLEDGE_BASE.OFFERS[0].advice;
    return {
      intent: 'marketing',
      isReinforced,
      summary: `Synthesizing a high-conversion campaign. Based on your current revenue gap of ₹${data.revenue.gap?.toLocaleString()}, we need a 'Grand Slam' move.`,
      steps: [
        "BUNDLE CREATION: Combine top services (Haircut + Botox) into a signature package.",
        "URGENCY INJECTION: Set a 48-hour limit for the first 50 bookings.",
        "WHATSAPP DEPLOYMENT: Target your 'At-Risk' segment (${data.customers.atRisk}% churn risk)."
      ],
      offers: [
        { name: "The GrowthOS Bundle", target: "At-Risk Customers", benefit: "20% Off + Free Kit", action: "WhatsApp Blast" }
      ],
      strategies: [
        { title: "Hormozi Grand Slam", impact: "High", difficulty: "Medium", timeline: "48 Hours", details: advice }
      ],
      projections: { newRevenue: data.revenue.gap * 0.35, confidence: 88 }
    };
  }

  // B. Staff Performance
  if (ctx.isStaff) {
    return {
      intent: 'staff',
      isReinforced,
      summary: "Acting as your Revenue Operator. We are shifting to 'Retention-First' staff metrics to stabilize the floor.",
      steps: [
        "REWARD RETENTION: Implement a commission bump for stylists with repeat rates >75%.",
        "UTILIZATION AUDIT: Redirect leads to underutilized staff (Active: ${data.staff.active}/${data.staff.total})."
      ],
      strategies: [
        { title: "Retention Bonus", impact: "High", difficulty: "Easy", timeline: "Immediate", details: "Implement a 5% commission bump for stylists who maintain a 70%+ repeat rate." }
      ],
      projections: { newRevenue: data.revenue.current * 0.12, confidence: 91 }
    };
  }

  // C. Academy & Lead Gen
  if (ctx.isAcademy) {
    return {
      intent: 'academy',
      isReinforced,
      summary: "Activating Academy Business Model. Focusing on Student Lifetime Value and high-ticket enrollment.",
      steps: [
        "LEAD SOURCE OPTIMIZATION: Shift budget from Google to Instagram for visual 'Success Stories'.",
        "CONVERSION EVENT: Host a free 'Masterclass' to filter high-intent students."
      ],
      offers: [{ name: "Early Bird Certification", target: "Inquiry Leads", benefit: "₹2000 Off", action: "WhatsApp Blast" }],
      projections: { newRevenue: data.revenue.current * 0.20, confidence: 85 }
    };
  }

  // D. Retention & Churn
  if (ctx.isRetention || data.customers.atRisk > 20) {
    return {
      intent: 'retention',
      isReinforced,
      summary: `Retention Crisis Mode. Churn risk is at ${data.customers.atRisk}%. We must activate win-back flows immediately.`,
      steps: [
        "RFM SEGMENTATION: Segment customers into 'Loyal' vs 'Lost'.",
        "TIERED VOUCHERS: Send escalation offers (10% -> 20% -> 30%) over 3 months."
      ],
      metrics: [{ label: "Churn Risk", value: `${data.customers.atRisk}%`, change: "Critical", trend: "down" }],
      strategies: [{ title: "Tiered Win-Back", impact: "High", difficulty: "Medium", timeline: "14 Days", details: KNOWLEDGE_BASE.RETENTION_CRM[0].advice }],
      projections: { newRevenue: data.revenue.current * 0.18, confidence: 90 }
    };
  }

  // E. Pricing Psychology
  if (ctx.isPricing) {
    return {
      intent: 'pricing',
      isReinforced,
      summary: "Pricing Advisor Engaged. We are implementing 'Menu Anchoring' to boost average ticket size.",
      steps: [
        "MENU ANCHORING: Place 'Royal Bridal Package' at top to anchor price expectation.",
        "CHARM PRICING: End all prices in .99 or .95 to trigger impulse buying."
      ],
      strategies: [
        { title: "Psychological Discounting", impact: "Medium", difficulty: "Easy", timeline: "Immediate", details: KNOWLEDGE_BASE.PRICING[0].advice }
      ],
      projections: { newRevenue: data.revenue.current * 0.10, confidence: 85 }
    };
  }

  // Default / Global Growth
  return {
    intent: 'growth',
    isReinforced,
    summary: "Lead Growth Consultant Active. Scanning your salon data for untapped revenue pockets.",
    steps: [
      `TARGET GAP: We have ₹${data.revenue.gap?.toLocaleString()} to recover this month.`,
      "UPSYSTEMS: Activate 'Post-Purchase' upsells for every booking.",
      "CEO SHIFT: Spend 4 hours this week purely on these strategy implementations."
    ],
    strategies: [
      { title: "Owner vs Operator", impact: "High", difficulty: "Hard", timeline: "Ongoing", details: KNOWLEDGE_BASE.MINDSET[0].advice }
    ],
    projections: { newRevenue: data.revenue.gap * 0.40, confidence: 82 }
  };
};

export const loadLearningPatterns = async (): Promise<LearningPattern[]> => {
  try {
    const { data, error } = await supabase
      .from('ai_growth_learning')
      .select('*')
      .gt('feedback_score', 0)
      .order('feedback_score', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error loading learning patterns:", err);
    return [];
  }
};

export const handleFeedback = async (
  intent: string,
  strategyIntent: string,
  appliedStrategy: string,
  feedback: number,
  contextMetadata: any = {}
) => {
  try {
    const { error } = await supabase
      .from('ai_growth_learning')
      .insert([{
        intent,
        strategy_intent: strategyIntent,
        applied_strategy: appliedStrategy,
        feedback_score: feedback,
        context_metadata: contextMetadata
      }]);
    
    if (error) throw error;
  } catch (err) {
    console.error("Error saving feedback:", err);
  }
};
