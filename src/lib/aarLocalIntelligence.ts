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
      consultant: "Alex Hormozi"
    }
  ],
  PRICING: [
    {
      condition: (d: SalonData) => d.revenue.current > 0,
      advice: "If it's under ₹1000, use percentages (like 20% off). If it's over ₹1000, use fixed amounts (like ₹500 off). People's brains just like the bigger numbers more.",
      title: "Pricing Psychology",
      impact: "Medium" as const,
      consultant: "Pricing Scientist"
    }
  ],
  SERVICE_EXPERTISE: {
    BOTOX: {
      advice: "Botox is your gold mine. Don't just sell one session; suggest an annual 'Youth Maintenance' plan. Maybe 4 sessions a year for ₹40k instead of ₹15k each. It's better for their results and better for your bank balance.",
      upsell: "Maybe suggest a Hydrafacial before the Botox to get that 'Liquid Gold' skin prep. It’s an easy ₹3,500 extra per client.",
      target: "VIPs and your 35+ crowd"
    },
    BRIDAL: {
      advice: "With brides, they're stressed. Sell them a '3-Month Glow-Up Roadmap' instead of just a wedding day booking. Include the trials and facials in one big package. They’ll pay a premium just for the peace of mind.",
      upsell: "You could even offer a quick 'Mother of the Bride' glow-up for free if they book the top package—it usually seals the deal.",
      target: "Any new bridal inquiries"
    },
    HAIRCUT: {
      advice: "Every haircut is a chance to start a long-term habit. Give them a 'Hair Health' card at the end that tells them exactly when they need to come back for a treatment to keep the shine.",
      upsell: "Suggest a quick ritual at the wash station for ₹800. It barely takes extra time but the profit is huge.",
      target: "Regulars and people who haven't been in for a month"
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
    isStaff: fullHistoryText.includes("staff") || fullHistoryText.includes("stylist") || fullHistoryText.includes("team"),
    isAcademy: fullHistoryText.includes("academy") || fullHistoryText.includes("student") || fullHistoryText.includes("course"),
    isRetention: fullHistoryText.includes("retention") || fullHistoryText.includes("churn") || fullHistoryText.includes("loyalty") || fullHistoryText.includes("comeback"),
    isUpsell: fullHistoryText.includes("upsell") || fullHistoryText.includes("cross-sell") || fullHistoryText.includes("aov") || fullHistoryText.includes("bundle"),
    isPricing: fullHistoryText.includes("price") || fullHistoryText.includes("cost") || fullHistoryText.includes("discount") || fullHistoryText.includes("psychology"),
    isOffer: fullHistoryText.includes("offer") || fullHistoryText.includes("campaign") || fullHistoryText.includes("promo") || fullHistoryText.includes("marketing"),
    isVIP: fullHistoryText.includes("vip") || fullHistoryText.includes("premium") || fullHistoryText.includes("membership")
  };

  const isReinforced = false;

  // 1. Botox / Specific Services
  if (query.includes("botox")) {
    const expertise = KNOWLEDGE_BASE.SERVICE_EXPERTISE.BOTOX;
    return {
      intent: 'marketing',
      isReinforced,
      summary: `I've been looking at your Botox numbers and your ₹${data.revenue.gap?.toLocaleString()} gap. Honestly, we should stop selling Botox as just a one-time treatment.\n\nHere's what I'd do: suggest an annual 'Youth Maintenance' plan instead. If you offer 4 sessions a year for ₹40k (instead of ₹15k each), you lock in that recurring revenue right away. \n\nAlso, a quick tip—try suggesting a Hydrafacial for skin prep before the session. It’s an easy ₹3,500 extra and the results look way better. \n\nDo you want me to help you figure out which of your VIPs we should reach out to first for this?`,
      steps: [], projections: { newRevenue: data.revenue.gap * 0.45, confidence: 92 }
    };
  }

  // 2. Bridal
  if (query.includes("bridal")) {
    const expertise = KNOWLEDGE_BASE.SERVICE_EXPERTISE.BRIDAL;
    return {
      intent: 'marketing',
      isReinforced,
      summary: `Brides are usually pretty stressed, so we should play into that. Instead of just a wedding day booking, let's offer them a '3-Month Glow-Up Roadmap'.\n\nIt should include their trials and a few facials in one big package. It saves them the stress of booking everything separately, and you can charge a 40% premium for the convenience. \n\nI’ve seen this work really well if you also throw in a free 'Mother of the Bride' express glow-up to close the deal. Want to try that?`,
      steps: [], projections: { newRevenue: data.revenue.gap * 0.40, confidence: 90 }
    };
  }

  // 3. Upsell
  if (ctx.isUpsell || query.includes("upsell")) {
    return {
      intent: 'upsell',
      isReinforced,
      summary: `I think focusing on your ticket size is the smartest move right now since we still have about ₹${data.revenue.gap?.toLocaleString()} to go this month.\n\nThe easiest way? Get your team to suggest those ₹500 - ₹800 rituals at the wash station while the client is already relaxed. It’s almost 100% profit and most people say yes if the stylist suggests it personally. \n\nWe could also look at your top 20% spenders and see if we can move them to a membership. It’s better to have that guaranteed money coming in every month. What do you think?`,
      steps: [], projections: { newRevenue: data.revenue.current * 0.15, confidence: 88 }
    };
  }

  // 4. Offers
  if (ctx.isOffer || query.includes("offer")) {
    return {
      intent: 'marketing',
      isReinforced,
      summary: `Alright, let's put together a solid offer. Since we need to bridge that ₹${data.revenue.gap?.toLocaleString()} gap, I'd go with a 'Total Transformation' bundle.\n\nBasically, we pick your top services, bundle them up, and give a 20% discount but throw in a free home care kit. It makes the value look huge. I'd limit it to just 50 people to make sure they book fast. \n\nI can help you write the WhatsApp message for this if you're ready to send it out to your at-risk clients. Want to see a draft?`,
      steps: [], projections: { newRevenue: data.revenue.gap * 0.35, confidence: 88 }
    };
  }

  // Default
  return {
    intent: 'growth',
    isReinforced,
    summary: `Hey! I've been scanning the latest data for AAR Salon. We're currently about ₹${data.revenue.gap?.toLocaleString()} away from our monthly target of ₹${data.revenue.target?.toLocaleString()}.\n\nHonestly, the best thing you can do this week is spend a bit less time on the floor and more time on these systems. Even just getting your team to do more wash-station upsells would make a massive difference. \n\nWhere do you want to start today? We could look at your marketing, or maybe see how the staff are doing with their retention numbers?`,
    steps: [], projections: { newRevenue: data.revenue.gap * 0.40, confidence: 82 }
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
