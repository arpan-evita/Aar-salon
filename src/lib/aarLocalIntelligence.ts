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
  ],
  SERVICE_EXPERTISE: {
    BOTOX: {
      advice: "Botox is a high-trust, high-margin service. Don't sell the 'treatment', sell the 'Time Machine'. Use a 'Membership Anchor' where one session is ₹15k, but an annual 'Youth Maintenance' plan is ₹40k for 4 sessions. This locks in recurring revenue.",
      upsell: "Pair with Hydrafacial for 'Liquid Gold' skin prep. Increases AOV by ₹3,500 instantly.",
      target: "VIP Customers / 35+ Demographic"
    },
    BRIDAL: {
      advice: "Bridal is a 'Package' play, not a service play. Create a 3-month 'Glow-Up Roadmap' instead of a one-day booking. Include 3 facials, 2 trials, and a home-care kit. The psychological value of 'Reduced Stress' is worth a 40% premium.",
      upsell: "Add 'Mother of the Bride' express glow-up as a complimentary value-add to close high-ticket bookings.",
      target: "Inquiry Leads / Academy Leads"
    },
    HAIRCUT: {
      advice: "Haircuts are your greatest acquisition tool. Every haircut customer should be converted to a 'Hair Health' regular. Use a 'Post-Service RX' card: 'Your hair will need X treatment in 28 days to maintain this shine'.",
      upsell: "Add 'Kerastase Ritual' for ₹800 at the wash station. 90% profit margin.",
      target: "New Customers / 25-day Inactive"
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

  const currentIntentKey = ctx.isStaff ? 'staff' : ctx.isAcademy ? 'academy' : ctx.isRetention ? 'retention' : ctx.isUpsell ? 'upsell' : ctx.isPricing ? 'pricing' : 'general';
  const bestPattern = learnedPatterns.find(p => p.intent === currentIntentKey && p.feedback_score > 0);
  const isReinforced = !!bestPattern;

  // A. Specific Service Intelligence (e.g., Botox, Bridal)
  const serviceKey = query.includes("botox") ? "BOTOX" : query.includes("bridal") ? "BRIDAL" : query.includes("hair") ? "HAIRCUT" : null;
  
  if (serviceKey) {
    const expertise = (KNOWLEDGE_BASE.SERVICE_EXPERTISE as any)[serviceKey];
    return {
      intent: 'marketing',
      isReinforced,
      summary: `I've analyzed your ${serviceKey} performance against your current ₹${data.revenue.gap?.toLocaleString()} revenue gap. To hit your ₹7L target, we need to stop treating ${serviceKey} as a simple service and start treating it as a high-margin recurring engine.\n\n**The Strategy:**\n${expertise.advice}\n\n**Immediate Upsell:**\n${expertise.upsell}\n\n**Action Plan:**\n1. **Anchor Your Price:** Set a high-ticket membership first to make single sessions look like a steal.\n2. **Target Your VIPs:** We'll focus exclusively on your ${expertise.target} group who already have the highest trust in your brand.\n\nWould you like me to draft the WhatsApp campaign for this strategy?`,
      steps: [
        `ANCHOR PRICING: ${expertise.advice.split('.')[0]}.`,
        `UPSELL FLOW: ${expertise.upsell}`,
        `TARGETING: Focus exclusively on your ${expertise.target}.`
      ],
      strategies: [
        { 
          title: `${serviceKey} Profit Max`, 
          impact: "High", 
          difficulty: "Medium", 
          timeline: "7 Days", 
          details: expertise.advice 
        }
      ],
      offers: [
        { name: `${serviceKey} VIP Roadmap`, target: expertise.target, benefit: "Priority Booking + Add-on", action: "Personalized WhatsApp" }
      ],
      projections: { newRevenue: data.revenue.gap * 0.45, confidence: 92 }
    };
  }

  // B. Upsell & AOV Strategy
  if (ctx.isUpsell || query.includes("upsell")) {
    return {
      intent: 'upsell',
      isReinforced,
      summary: `Increasing your Average Order Value (AOV) is the fastest way to bridge your ₹${data.revenue.gap?.toLocaleString()} gap without spending more on ads. I recommend we activate **'Post-Purchase Joy'** points throughout the customer journey.\n\n**Core Recommendations:**\n\n- **The Wash Station Upsell:** Train your team to offer ₹500 rituals while the customer is already relaxed at the wash station. It has a 90% profit margin.\n- **Bundle Anchoring:** Stop offering single services. Every booking should be a 'Mini-Transformation'.\n- **Membership Conversion:** We should target your top 20% spenders and move them to annual recurring plans to lock in revenue.\n\nDoes this sound like a plan you'd like to implement with your staff this week?`,
      steps: [
        "WASH STATION UPSELL: Train staff to offer ₹500 - ₹800 add-ons during the hair wash.",
        "BUNDLE ANCHORING: Replace single services with 'Mini-Transformation' bundles.",
        "MEMBERSHIP PUSH: Convert high-spenders (Top 20%) to annual recurring plans."
      ],
      strategies: [
        { title: "Digital Impulse Buy", impact: "High", difficulty: "Easy", timeline: "Immediate", details: KNOWLEDGE_BASE.UPSELL_CROSS_SELL[0].advice }
      ],
      projections: { newRevenue: data.revenue.current * 0.15, confidence: 88 }
    };
  }

  // C. Offer & Campaign Synthesis
  if (ctx.isOffer || query.includes("offer") || query.includes("campaign")) {
    const advice = KNOWLEDGE_BASE.OFFERS[0].advice;
    return {
      intent: 'marketing',
      isReinforced,
      summary: `I'm building a **Grand Slam Offer** tailored to your current metrics. With a ₹${data.revenue.gap?.toLocaleString()} gap and ${data.customers.atRisk}% churn risk, we need a high-urgency move to recover revenue fast.\n\n**The 'GrowthOS' Bundle:**\nWe should combine your top services into a 'Total Transformation' package. \n\n**Execution Steps:**\n1. **Limit Supply:** Only 50 slots available to create immediate urgency.\n2. **Target Inactive Clients:** We'll deploy this via WhatsApp to everyone who hasn't visited in 45+ days.\n3. **The Hook:** ${advice}\n\nShall I generate the campaign creative for you?`,
      steps: [
        "BUNDLE CREATION: Combine top services into a signature package.",
        "URGENCY INJECTION: Set a 48-hour limit for the first 50 bookings.",
        "WHATSAPP DEPLOYMENT: Target your 'At-Risk' segment."
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

  // D. Staff Performance
  if (ctx.isStaff) {
    return {
      intent: 'staff',
      isReinforced,
      summary: `I see we have ${data.staff.active} active staff members out of ${data.staff.total}. To hit our goals, we need to shift from 'Service-First' to **'Retention-First'** metrics.\n\n**The Plan:**\n\n- **Retention Bonus:** We should reward stylists who maintain a repeat customer rate of over 75%.\n- **Utilization Audit:** I've noticed some staff are underutilized. We can route automated leads specifically to them to balance the floor load.\n\nWould you like me to see which stylists are currently below the 70% retention threshold?`,
      steps: [
        "REWARD RETENTION: Implement a commission bump for stylists with repeat rates >75%.",
        "UTILIZATION AUDIT: Redirect leads to underutilized staff."
      ],
      strategies: [
        { title: "Retention Bonus", impact: "High", difficulty: "Easy", timeline: "Immediate", details: "Implement a 5% commission bump for stylists who maintain a 70%+ repeat rate." }
      ],
      projections: { newRevenue: data.revenue.current * 0.12, confidence: 91 }
    };
  }

  // E. Academy & Lead Gen
  if (ctx.isAcademy) {
    return {
      intent: 'academy',
      isReinforced,
      summary: `Activating your **Academy Business Model**. To hit your enrollment goals, we need to focus on Student Lifetime Value and high-ticket certifications.\n\n**Strategic Recommendation:**\nI recommend shifting your budget from generic search ads to Instagram 'Success Stories'. We should also host a free 'Masterclass' webinar to filter high-intent leads before they even talk to your team.\n\nShall I set up the tracking for your next academy intake?`,
      steps: [
        "LEAD SOURCE OPTIMIZATION: Shift budget from Google to Instagram for visual 'Success Stories'.",
        "CONVERSION EVENT: Host a free 'Masterclass' to filter high-intent students."
      ],
      offers: [{ name: "Early Bird Certification", target: "Inquiry Leads", benefit: "₹2000 Off", action: "WhatsApp Blast" }],
      projections: { newRevenue: data.revenue.current * 0.20, confidence: 85 }
    };
  }

  // F. Retention & Churn
  if (ctx.isRetention || data.customers.atRisk > 20) {
    return {
      intent: 'retention',
      isReinforced,
      summary: `I've flagged a **Retention Risk**. Your current churn risk is at ${data.customers.atRisk}%, which is impacting your baseline revenue. We need to move from 'one-off' visits to an LTV-focused engine.\n\n**The Win-Back Framework:**\n- **RFM Segmentation:** I'll help you segment your customers into 'Loyal' vs 'Lost'.\n- **Tiered Escalation:** We'll send escalating WhatsApp offers (10% -> 20% -> 30%) over the next 90 days to recover these clients.\n\nShould we start with the 'Lost' segment (clients who haven't visited in 60+ days)?`,
      steps: [
        "RFM SEGMENTATION: Segment customers into 'Loyal' vs 'Lost'.",
        "TIERED VOUCHERS: Send escalation offers (10% -> 20% -> 30%) over 3 months."
      ],
      metrics: [{ label: "Churn Risk", value: `${data.customers.atRisk}%`, change: "Critical", trend: "down" }],
      strategies: [{ title: "Tiered Win-Back", impact: "High", difficulty: "Medium", timeline: "14 Days", details: KNOWLEDGE_BASE.RETENTION_CRM[0].advice }],
      projections: { newRevenue: data.revenue.current * 0.18, confidence: 90 }
    };
  }

  // G. Pricing Psychology
  if (ctx.isPricing) {
    return {
      intent: 'pricing',
      isReinforced,
      summary: `I'm engaging your **Pricing Advisor** module. We can boost your margins by at least 10% just by applying psychological anchoring to your menu.\n\n**Immediate Moves:**\n- **Menu Anchoring:** Place your most expensive service (e.g., 'Royal Bridal') at the very top. This makes your ₹5k - ₹10k services look affordable by comparison.\n- **Charm Pricing:** We'll adjust your core service prices to end in .99 or .95 to trigger the 'left-digit' effect.\n\nWould you like me to audit your current service list for these pricing opportunities?`,
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
    summary: `I'm scanning your salon data right now. We have exactly ₹${data.revenue.gap?.toLocaleString()} left to recover to hit your monthly target of ₹${data.revenue.target?.toLocaleString()}.\n\nTo bridge this gap, I'm recommending a **CEO Identity Shift**: spend less time on the floor and more time on these high-leverage systems. \n\n**Key Move:**\n${KNOWLEDGE_BASE.MINDSET[0].advice}\n\nWhat specific part of the business shall we optimize first—your marketing, staff performance, or retention flows?`,
    steps: [
      `TARGET GAP: We have ₹${data.revenue.gap?.toLocaleString()} to recover this month.`,
      "UPSYSTEMS: Activate 'Post-Purchase' upsells for every booking."
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
