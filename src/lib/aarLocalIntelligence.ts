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
      advice: "Try a 'Total Transformation Bundle'. Put your top 3 services together, give a 20% discount but throw in a free home care kit. It brings in quick cash and keeps people coming back.",
      title: "The Bundle Move",
      impact: "High" as const,
      consultant: "Strategy Engine"
    }
  ],
  MINDSET: [
    {
      condition: (d: SalonData) => d.revenue.current > 500000,
      advice: "Think of your business as a system. Move from being an operator to a true owner. Focus on the P-A-C-E system (Performance, Accounting, Customer, Employee). Your primary job is to build the people who run the floor, not do the work yourself.",
      title: "CEO Identity Shift",
      impact: "High" as const,
      consultant: "Strategy Engine"
    }
  ],
  SCALING: [
    {
      condition: (d: SalonData) => d.revenue.current > 0,
      advice: "To scale effectively, your business must be 'People Independent'. If the salon stops when you leave, you have a job, not a business. We need Standard Operating Procedures (SOPs) for every customer touchpoint.",
      title: "The Scaling Blueprint",
      impact: "High" as const,
      consultant: "Strategy Engine"
    }
  ],
  SERVICE_EXPERTISE: {
    BOTOX: {
      advice: "Apply the High-Margin Rule: Botox is your premium anchor. Suggest an annual 'Maintenance' plan—4 sessions a year for ₹40k instead of ₹15k each. It locks in your recurring revenue.",
      upsell: "Pair it with a Hydrafacial for skin prep. It’s an easy ₹3,500 extra per client and the results are night and day.",
      target: "VIPs and your 35+ crowd"
    },
    BRIDAL: {
      advice: "Brides are looking for certainty, not just makeup. Offer a 3-month Roadmap including trials and facials. They’ll pay a significant premium for the peace of mind of having a system in place.",
      upsell: "Offer a free 'Mother of the Bride' express service as a value-add to close high-ticket bookings.",
      target: "Any new bridal inquiries"
    },
    HAIRCUT: {
      advice: "The Retention Rule: Every haircut is a lead for your high-margin services. Use a 'Hair Health' card to show them exactly when they need a treatment to maintain the look.",
      upsell: "Suggest a quick ritual at the wash station for ₹800. It’s 100% profit.",
      target: "Regulars"
    }
  }
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
    isStaff: fullHistoryText.includes("staff") || fullHistoryText.includes("stylist") || fullHistoryText.includes("team") || fullHistoryText.includes("employee"),
    isAcademy: fullHistoryText.includes("academy") || fullHistoryText.includes("student") || fullHistoryText.includes("course"),
    isRetention: fullHistoryText.includes("retention") || fullHistoryText.includes("churn") || fullHistoryText.includes("loyalty") || fullHistoryText.includes("comeback"),
    isUpsell: fullHistoryText.includes("upsell") || fullHistoryText.includes("cross-sell") || fullHistoryText.includes("aov") || fullHistoryText.includes("bundle"),
    isPricing: fullHistoryText.includes("price") || fullHistoryText.includes("cost") || fullHistoryText.includes("discount") || fullHistoryText.includes("psychology"),
    isOffer: fullHistoryText.includes("offer") || fullHistoryText.includes("campaign") || fullHistoryText.includes("promo") || fullHistoryText.includes("marketing"),
    isVIP: fullHistoryText.includes("vip") || fullHistoryText.includes("premium") || fullHistoryText.includes("membership"),
    isScaling: fullHistoryText.includes("scale") || fullHistoryText.includes("system") || fullHistoryText.includes("sop") || fullHistoryText.includes("growth"),
    isAcquisition: fullHistoryText.includes("acquisition") || fullHistoryText.includes("new client") || fullHistoryText.includes("leads") || fullHistoryText.includes("marketing")
  };

  const isReinforced = false;
  const gap = data.revenue.gap || 0;

  // 1. Scaling & Systems
  if (ctx.isScaling || query.includes("system")) {
    const advice = KNOWLEDGE_BASE.SCALING[0].advice;
    return {
      intent: 'growth',
      isReinforced,
      summary: `I've been looking at your numbers and your goal to scale. I firmly believe your business must become 'people-independent' to reach the next level. \n\nRight now, we have a ₹${gap.toLocaleString()} gap to bridge. The key isn't working harder, but building better SOPs. \n\n${advice}\n\nShall we start by mapping out your 'Customer Welcome' system to ensure every new lead is handled with 100% consistency?`,
      steps: [], projections: { newRevenue: gap * 0.50, confidence: 95 }
    };
  }

  // 2. Team & Performance
  if (ctx.isStaff || query.includes("team")) {
    return {
      intent: 'staff',
      isReinforced,
      summary: `To bridge your ₹${gap.toLocaleString()} gap, we should focus on the 'Employees' pillar of our growth model. \n\nI think we have room to shift your team from being technicians to true growth partners. \n\n**My Recommendation:** ${KNOWLEDGE_BASE.MINDSET[0].advice}\n\nDo you want me to check which team members are hitting their targets and who might need a bit of coaching?`,
      steps: [], projections: { newRevenue: data.revenue.current * 0.15, confidence: 91 }
    };
  }

  // 3. Customer Acquisition
  if (ctx.isAcquisition || query.includes("acquisition")) {
    return {
      intent: 'marketing',
      isReinforced,
      summary: `For acquisition, we need to look at our 'Customer' pillar. \n\nWith our ₹${gap.toLocaleString()} target, I'd suggest a 'High-Value Lead Magnet' on social media. Instead of just showing haircuts, let's show 'Success Stories' and offer a free 'Hair Health Consultation'. \n\nIt builds trust before they even step into the salon. Want me to draft a quick social media campaign for this?`,
      steps: [], projections: { newRevenue: gap * 0.30, confidence: 85 }
    };
  }

  // 4. Botox / Specific Services
  if (query.includes("botox")) {
    const expertise = KNOWLEDGE_BASE.SERVICE_EXPERTISE.BOTOX;
    return {
      intent: 'marketing',
      isReinforced,
      summary: `I've been looking at your Botox numbers and that ₹${gap.toLocaleString()} gap. Honestly, we should stop selling Botox as just a one-time treatment.\n\nWe should use the 'High-Margin Rule' here: suggest an annual 'Maintenance' plan. If you offer 4 sessions for ₹40k, you lock in recurring revenue right away. \n\nAlso, try suggesting a Hydrafacial for prep—it's an easy extra ₹3,500. Want me to see which VIPs we should reach out to first?`,
      steps: [], projections: { newRevenue: gap * 0.45, confidence: 92 }
    };
  }

  // 5. Offers
  if (ctx.isOffer || query.includes("offer")) {
    return {
      intent: 'marketing',
      isReinforced,
      summary: `Let's build a 'Grand Slam' offer to bridge that ₹${gap.toLocaleString()} gap. \n\nI recommend a 'Total Transformation' bundle: pick your top services, bundle them up, and throw in a free home care kit. It makes the value look huge. \n\nI can help you write the WhatsApp message for this if you're ready. Want to see a draft?`,
      steps: [], projections: { newRevenue: gap * 0.35, confidence: 88 }
    };
  }

  // Default
  return {
    intent: 'growth',
    isReinforced,
    summary: `Hey! I've been scanning the latest data. We're currently about ₹${gap.toLocaleString()} away from our monthly target of ₹${data.revenue.target?.toLocaleString()}.\n\nThe best thing you can do this week is move from being an operator to an owner. Focus on your systems and coaching the team. \n\nWhere do you want to start today? We could look at your marketing, or maybe your team's retention numbers?`,
    steps: [], projections: { newRevenue: gap * 0.40, confidence: 82 }
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
