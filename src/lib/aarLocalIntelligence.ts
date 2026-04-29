import { supabase } from '@/integrations/supabase/client';

export interface SalonData {
  revenue: {
    current: number;
    target: number;
    growth: number;
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
  const fullHistoryText = (history.map(h => h.content.toLowerCase()).join(" ") + " " + q.toLowerCase());
  
  const ctx = {
    isRevenue: fullHistoryText.includes("revenue") || fullHistoryText.includes("sales") || fullHistoryText.includes("target") || fullHistoryText.includes("goal"),
    isStaff: fullHistoryText.includes("staff") || fullHistoryText.includes("stylist") || fullHistoryText.includes("team"),
    isAcademy: fullHistoryText.includes("academy") || fullHistoryText.includes("student") || fullHistoryText.includes("course"),
    isRetention: fullHistoryText.includes("retention") || fullHistoryText.includes("churn") || fullHistoryText.includes("loyalty"),
    isUpsell: fullHistoryText.includes("upsell") || fullHistoryText.includes("cross-sell") || fullHistoryText.includes("aov"),
    isPricing: fullHistoryText.includes("price") || fullHistoryText.includes("cost") || fullHistoryText.includes("discount") || fullHistoryText.includes("psychology"),
    services: [] as string[]
  };

  const currentIntentKey = ctx.isStaff ? 'staff' : ctx.isAcademy ? 'academy' : ctx.isRetention ? 'retention' : ctx.isUpsell ? 'upsell' : ctx.isPricing ? 'pricing' : 'general';
  const bestPattern = learnedPatterns.find(p => p.intent === currentIntentKey && p.feedback_score > 0);
  const isReinforced = !!bestPattern;

  // A. Staff Performance
  if (ctx.isStaff) {
    return {
      intent: 'staff',
      isReinforced,
      summary: "Acting as your Revenue Operator. We are shifting to 'Retention-First' staff metrics.",
      steps: [
        "REWARD RETENTION: Reward stylists with repeat customer rates >75%.",
        "UTILIZATION AUDIT: If staff utilization is <60%, route automated leads."
      ],
      strategies: [
        { title: "Retention Bonus", impact: "High", difficulty: "Easy", timeline: "Immediate", details: "Implement a 5% commission bump for stylists who maintain a 70%+ repeat rate." }
      ],
      projections: { newRevenue: data.revenue.current * 0.12, confidence: 88 }
    };
  }

  // B. Academy
  if (ctx.isAcademy) {
    return {
      intent: 'academy',
      isReinforced,
      summary: "Activating Academy Business Model. Focusing on Student Lifetime Value.",
      steps: ["LEAD SOURCE OPTIMIZATION: Focus Instagram Ads on 'Beauty Career' keywords."],
      offers: [{ name: "Early Bird Certification", target: "Inquiry Leads", benefit: "₹2000 Off", action: "WhatsApp Blast" }],
      projections: { newRevenue: data.revenue.current * 0.20, confidence: 85 }
    };
  }

  // C. Retention
  if (ctx.isRetention) {
    return {
      intent: 'retention',
      isReinforced,
      summary: "Activating Customer Retention Engine. Shifting to LTV Maximization.",
      steps: ["RFM SEGMENTATION: Identify 'Champions' and target with VIP drops."],
      metrics: [{ label: "Retention Rate", value: "52%", change: "+4%", trend: "up" }],
      strategies: [{ title: "Tiered Win-Back", impact: "High", difficulty: "Medium", timeline: "14 Days", details: "Day 60: Free Hair Wash. Day 90: ₹500 Voucher." }],
      projections: { newRevenue: data.revenue.current * 0.18, confidence: 90 }
    };
  }

  // D. Pricing
  if (ctx.isPricing) {
    return {
      intent: 'pricing',
      isReinforced,
      summary: "Pricing Advisor Engaged. Using Menu Anchoring and Charm Pricing.",
      steps: ["MENU ANCHORING: Show your most expensive service first."],
      strategies: [{ title: "Menu Decoy", impact: "Medium", difficulty: "Easy", timeline: "Immediate", details: "Add a 'Super Luxury' service to boost sales of mid-tier." }],
      projections: { newRevenue: data.revenue.current * 0.10, confidence: 85 }
    };
  }

  // Default
  return {
    intent: 'growth',
    isReinforced,
    summary: "Acting as your Lead Growth Consultant. Building a multi-layered scale plan.",
    steps: ["ACQUISITION: Run hyperlocal ads.", "CONVERSION: Use Value-First offers."],
    projections: { newRevenue: data.revenue.current * 0.25, confidence: 82 }
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
