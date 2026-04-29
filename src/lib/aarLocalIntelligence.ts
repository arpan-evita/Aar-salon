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
  MINDSET: [
    {
      condition: (d: SalonData) => d.revenue.current > 500000,
      advice: "Rajiv Talreja says: Move from being a 'Self-Employed' operator to a 'Business Owner'. Stop focusing on technical skills and start focusing on the P-A-C-E system (Performance, Accounting, Customer, Employee). Your job isn't to cut hair; it's to build the person who cuts the hair.",
      title: "CEO Identity Shift",
      impact: "High" as const,
      consultant: "Rajiv Talreja"
    }
  ],
  SCALING_GALA: [
    {
      condition: (d: SalonData) => d.revenue.current > 0,
      advice: "Dr. Basesh Gala Framework: To scale from 1 branch to 10, you need 'Systems that are People Independent'. If your salon stops when you leave, you don't have a business, you have a job. Focus on Standard Operating Procedures (SOPs) for every single customer touchpoint.",
      title: "The Scaling Blueprint",
      impact: "High" as const,
      consultant: "Dr. Basesh Gala"
    }
  ],
  SERVICE_EXPERTISE: {
    BOTOX: {
      advice: "Gala's High-Margin Rule: Botox is your 'Premium Anchor'. Don't just sell one session; suggest an annual 'Youth Maintenance' plan. Maybe 4 sessions a year for ₹40k instead of ₹15k each. It's better for their results and better for your bank balance.",
      upsell: "Pair with Hydrafacial for skin prep. It’s an easy ₹3,500 extra per client.",
      target: "VIPs and your 35+ crowd"
    },
    BRIDAL: {
      advice: "Talreja's Customer Experience: Brides aren't buying makeup; they're buying 'Certainty'. Offer a 3-month Roadmap. Include trials and facials in one package. They’ll pay a 40% premium just for the peace of mind.",
      upsell: "Throw in a free Mother of the Bride express service to close high-ticket bookings.",
      target: "Any new bridal inquiries"
    },
    HAIRCUT: {
      advice: "Talreja's Retention Rule: Every haircut is a lead for your high-margin services. Give them a 'Hair Health' card that tells them exactly when they need a treatment to keep the shine.",
      upsell: "Suggest a quick ritual at the wash station for ₹800. 100% profit.",
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

  // 1. Scaling & Systems (Dr. Basesh Gala Focus)
  if (ctx.isScaling || query.includes("system")) {
    const advice = KNOWLEDGE_BASE.SCALING_GALA[0].advice;
    return {
      intent: 'growth',
      isReinforced,
      summary: `I've been thinking about your goal of scaling. Dr. Basesh Gala always says: "Your business must be people-independent." \n\nRight now, we have a ₹${gap.toLocaleString()} gap, and the only way to fill it without burning out is to build SOPs. \n\n${advice}\n\nShall we start by mapping out your 'Customer Welcome' SOP to ensure every new lead is handled perfectly?`,
      steps: [], projections: { newRevenue: gap * 0.50, confidence: 95 }
    };
  }

  // 2. Performance & Team (Rajiv Talreja Focus)
  if (ctx.isStaff || query.includes("team")) {
    return {
      intent: 'staff',
      isReinforced,
      summary: `To bridge your ₹${gap.toLocaleString()} gap, we need to focus on your 'Employees'—the 'E' in Rajiv Talreja’s P-A-C-E system.\n\nYour current staff utilization seems to have room for growth. We need to shift them from being 'technicians' to 'growth partners'. \n\n**Action Move:** ${KNOWLEDGE_BASE.MINDSET[0].advice}\n\nDo you want me to look at which team members are hitting their retail targets and who needs coaching?`,
      steps: [], projections: { newRevenue: data.revenue.current * 0.15, confidence: 91 }
    };
  }

  // 3. Customer Acquisition
  if (ctx.isAcquisition || query.includes("acquisition")) {
    return {
      intent: 'marketing',
      isReinforced,
      summary: `If we're talking acquisition, we need to look at 'Customer'—the 'C' in P-A-C-E. \n\nSince we have a ₹${gap.toLocaleString()} target, I'd suggest a 'High-Value Lead Magnet' on Instagram. Instead of just showing haircuts, show 'Success Stories' and offer a free 'Hair Health Consultation'. \n\nIt builds massive trust before they even step into the salon. Want to try a draft for a social media campaign?`,
      steps: [], projections: { newRevenue: gap * 0.30, confidence: 85 }
    };
  }

  // 4. Botox / Specific Services
  if (query.includes("botox")) {
    return {
      intent: 'marketing',
      isReinforced,
      summary: `I've been looking at your Botox numbers and that ₹${gap.toLocaleString()} gap. Honestly, we should stop selling Botox as just a one-time treatment.\n\nApplying Gala's High-Margin Rule: suggest an annual 'Youth Maintenance' plan. If you offer 4 sessions for ₹40k, you lock in recurring revenue right away. \n\nAlso, try suggesting a Hydrafacial for prep. It’s an easy ₹3,500 extra. Do you want me to help you figure out which VIPs to reach out to first?`,
      steps: [], projections: { newRevenue: gap * 0.45, confidence: 92 }
    };
  }

  // 5. Offers
  if (ctx.isOffer || query.includes("offer")) {
    return {
      intent: 'marketing',
      isReinforced,
      summary: `Let's build a 'Grand Slam' offer to bridge that ₹${gap.toLocaleString()} gap. \n\nI recommend a 'Total Transformation' bundle. We pick your top services, bundle them up, and give a 20% discount but throw in a free home care kit. \n\nI can help you write the WhatsApp message for this if you're ready to send it out to your at-risk clients. Want to see a draft?`,
      steps: [], projections: { newRevenue: gap * 0.35, confidence: 88 }
    };
  }

  // Default
  return {
    intent: 'growth',
    isReinforced,
    summary: `Hey! I've been scanning the latest data. We're currently about ₹${gap.toLocaleString()} away from our monthly target of ₹${data.revenue.target?.toLocaleString()}.\n\nApplying the Talreja mindset: the best thing you can do this week is move from being an operator to an owner. Focus on your systems and team coaching. \n\nWhere do you want to start today? We could look at your marketing, or maybe your team's retention numbers?`,
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
