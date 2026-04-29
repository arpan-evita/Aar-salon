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

const REASONING_PILLARS = {
  SCALING: [
    "To scale effectively, your business must be 'People Independent'. If the salon stops when you leave, you have a job, not a business.",
    "The secret to moving from 1 to 10 branches is Standard Operating Procedures (SOPs) for every customer touchpoint.",
    "Systems are the only way to fill your revenue gap without burning yourself or your team out."
  ],
  TEAM: [
    "Move your staff from being 'technicians' to 'growth partners'. They should be the 'E' (Employee) pillar in your performance model.",
    "Your job as an owner is to build the people who build the business, not to do the technical work yourself.",
    "Reward stylists who maintain a 75%+ repeat rate—they are the backbone of your stable revenue."
  ],
  CUSTOMERS: [
    "Every haircut is actually a lead for a higher-margin service. Never let a client leave without a 'Hair Health' roadmap.",
    "Acquisition isn't about ads; it's about building trust. Show 'Success Stories' and offer 'Expert Consultations' rather than discounts.",
    "Segment your VIPs and treat them like gold. One high-ticket annual maintenance plan is worth 10 one-off bookings."
  ],
  REVENUE: [
    "Bridge your gap by focusing on ticket size (AOV). A ₹500 upsell at the wash station has a 90% profit margin.",
    "Anchor your prices. Put your most expensive package first to make everything else look like a steal.",
    "Grand Slam Offers: Combine services into a bundle, add a free kit, and limit it to 50 people to create massive urgency."
  ],
  ACQUISITION: [
    "For getting new clients, we need to focus on the 'Customer' pillar. I recommend a 'High-Value Lead Magnet'—offer a free 'Hair Health Consultation' on Instagram to build trust first.",
    "Stop chasing new clients with discounts. Instead, show 'Before & After' transformations of your top services. It attracts high-intent spenders.",
    "Target your local area with a 'VIP First-Timer Experience' package. It should feel like a premium invitation, not a promo."
  ]
};

const HUMANIZE_FRAGMENTS = {
  scaling: "Looking at your goal to scale the business and bridge that ₹{gap} gap...",
  team: "Thinking about your team performance and how we can hit that ₹7L target...",
  retention: "I've been scanning your retention metrics—with a ₹{gap} gap, we need to keep every client we have...",
  acquisition: "Regarding customer acquisition, I have a specific strategy to help you hit that ₹7L goal...",
  revenue: "To bridge your ₹{gap} revenue gap, we need to look at your high-margin services...",
  general: "I've been looking at your latest salon data and comparing it to our ₹7L target..."
};

const FOLLOW_UPS = [
  "Does that sound like something we should try this week?",
  "Shall we start mapping out the SOP for this together?",
  "Want me to see which of your VIPs we should reach out to first?",
  "Should I draft the WhatsApp message for this campaign?",
  "What do you think? Which part of this should we prioritize?"
];

export const generateGrowthPlan = async (
  q: string, 
  data: SalonData, 
  history: {role: string, content: string}[],
  learnedPatterns: LearningPattern[] = []
): Promise<GrowthPlan> => {
  const query = q.toLowerCase();
  const gap = data.revenue.gap || 0;
  
  // ADVANCED CONTEXT DETECTION
  const fullHistoryText = (history.map(h => h.content.toLowerCase()).join(" ") + " " + query);
  
  // 1. Determine Intent Scars
  const intents = {
    scaling: query.includes("scale") || query.includes("system") || query.includes("sop"),
    team: query.includes("staff") || query.includes("team") || query.includes("stylist") || query.includes("employee"),
    retention: query.includes("retention") || query.includes("churn") || query.includes("loyalty") || query.includes("old client") || query.includes("comeback"),
    upsell: query.includes("upsell") || query.includes("aov") || query.includes("ticket"),
    botox: query.includes("botox") || query.includes("premium") || query.includes("high ticket"),
    bridal: query.includes("bridal") || query.includes("wedding"),
    acquisition: query.includes("acquisition") || query.includes("new client") || query.includes("leads") || query.includes("marketing") || query.includes("attract") || query.includes("getting")
  };

  // 2. Select Reasoning Pillar & Intro
  let pillarAdvice: string[] = [];
  let intentName: keyof typeof HUMANIZE_FRAGMENTS = "general";

  if (intents.acquisition) {
    pillarAdvice = [REASONING_PILLARS.ACQUISITION[0], REASONING_PILLARS.ACQUISITION[1]];
    intentName = "acquisition";
  } else if (intents.scaling) {
    pillarAdvice = [REASONING_PILLARS.SCALING[0], REASONING_PILLARS.SCALING[1]];
    intentName = "scaling";
  } else if (intents.team) {
    pillarAdvice = [REASONING_PILLARS.TEAM[1], REASONING_PILLARS.TEAM[2]];
    intentName = "team";
  } else if (intents.botox || intents.upsell) {
    pillarAdvice = [REASONING_PILLARS.REVENUE[0], REASONING_PILLARS.REVENUE[1]];
    intentName = "revenue";
  } else if (intents.retention) {
    pillarAdvice = [REASONING_PILLARS.CUSTOMERS[0], REASONING_PILLARS.CUSTOMERS[2]];
    intentName = "retention";
  } else {
    pillarAdvice = [REASONING_PILLARS.SCALING[2], REASONING_PILLARS.TEAM[0]];
    intentName = "general";
  }

  // 3. Dynamic Response Construction
  const introTemplate = HUMANIZE_FRAGMENTS[intentName] || HUMANIZE_FRAGMENTS.general;
  const intro = introTemplate.replace("{gap}", gap.toLocaleString());
  const core = pillarAdvice.join(" ");
  const followUp = FOLLOW_UPS[Math.floor(Math.random() * FOLLOW_UPS.length)];

  // 4. Special Contextual Injection
  let serviceBonus = "";
  if (query.includes("botox")) {
    serviceBonus = "\n\n**Service Tip:** Suggest an annual 'Maintenance' plan—4 sessions for ₹40k. It locks in that recurring revenue right away.";
  } else if (query.includes("bridal")) {
    serviceBonus = "\n\n**Service Tip:** Offer a 3-month Roadmap. Brides pay a premium for 'Certainty' over just makeup.";
  }

  const finalSummary = `${intro}\n\n${core}${serviceBonus}\n\n${followUp}`;

  return {
    intent: intentName,
    isReinforced: false,
    summary: finalSummary,
    steps: [],
    projections: { newRevenue: gap * 0.40, confidence: 88 }
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
