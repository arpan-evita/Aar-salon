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

const EXPERT_PILLARS = {
  ACQUISITION: [
    "In the high-end salon industry, acquisition isn't about 'getting more feet in the door'—it's about attracting the top 10% of spenders in AAR Salon's local radius. I recommend we stop chasing new clients with discounts and instead launch a 'Signature Transformation' campaign on Instagram. We should showcase the specific results of your Botox and Bridal rituals, as these are your highest-trust services.",
    "To hit our ₹7L target, every new lead must be treated as a high-ticket opportunity. I suggest using a 'Digital Consultation' magnet where potential clients can upload a photo for an expert skin or hair analysis. This builds professional authority before they even step into the salon, making them much more likely to book a premium ₹5k+ package rather than a basic haircut.",
    "We need to focus on 'Mirror Marketing'. Your current VIPs are your best referral source. I suggest an exclusive 'Invitation Only' event where your top 20 clients can bring one friend for a complimentary 'Express Glow-up'. This ensures your new acquisitions are pre-vetted and have the same spending capacity as your best customers."
  ],
  SCALING: [
    "To scale AAR Salon effectively, we must move from 'Operator Mode' to 'Systems Mode'. If your presence is required for the salon to function, you don't have a business—you have a job. We need to implement 'People-Independent' SOPs for every touchpoint, from the moment a lead clicks an ad to the post-service follow-up.",
    "Scaling from one branch to many requires absolute consistency. We should start by standardizing your 'Client Consultation Flow'. Every stylist should follow the exact same 3-step diagnosis process. This ensures the AAR Salon 'Signature Experience' is identical, regardless of who is performing the service.",
    "Systems are the only way to fill our ₹{gap} revenue gap without burning out your team. By automating the win-back and birthday flows, we ensure the business is working for you 24/7, allowing you to focus on high-level expansion strategy."
  ],
  TEAM_PERFORMANCE: [
    "We need to shift your stylists from being technicians to 'Growth Partners'. Using the 'Performance' pillar of our growth model, we should reward team members who maintain a repeat customer rate of 75% or higher. These aren't just employees; they are the custodians of your revenue stability.",
    "I've noticed some underutilization in the current floor schedule. We should implement a 'Dynamic Commission' model where stylists get a bonus for converting basic haircuts into 'Ritual Bundles' (e.g., Haircut + Kerastase + Home Care). This aligns their income directly with our ₹7L monthly goal.",
    "The secret to a high-performing salon team is 'Continuous Education'. Not just in technical skills, but in 'Consultative Selling'. Your team shouldn't 'sell' products; they should 'prescribe' solutions. Every client should leave with a 28-day roadmap for their hair or skin health."
  ],
  REVENUE_MAXIMIZATION: [
    "To bridge the ₹{gap} gap, we must focus on Average Order Value (AOV). The fastest way to do this is at the wash station. A ₹800 'Flash Treatment' takes zero extra time but has a 95% profit margin. If we convert just 30% of your daily traffic, we hit our targets significantly faster.",
    "We need to implement 'Anchor Pricing' across your service menu. By placing a high-end ₹50k 'Full Restoration' package at the top, your ₹15k Botox and ₹8k Skin treatments look like incredible value. It’s a psychological move that shifts the client's mindset from 'cost' to 'investment'.",
    "Grand Slam Offers are our best tool for rapid revenue recovery. I recommend a 'Bridal Glow-Up Roadmap'—a 3-month package that includes trials, facials, and a home-care kit. By bundling the stress-relief of 'Certainty' with the technical service, you can charge a 40% premium over single bookings."
  ]
};

const HUMANIZE_FRAGMENTS = {
  scaling: "Looking at AAR Salon's current operations and your goal to scale beyond the current floor limits...",
  team: "Regarding your team's performance—to hit our ₹7L target, we need to move them into 'Growth Partner' roles...",
  retention: "I've been analyzing our client retention data. With a ₹{gap} gap, we can't afford a single 'One-and-Done' visit...",
  acquisition: "For our acquisition strategy, I've designed a high-leverage plan to attract premium spenders...",
  revenue: "To maximize our revenue and bridge that ₹{gap} gap, we need to focus on our high-margin 'Signature Rituals'...",
  general: "I've been scanning the latest metrics for AAR Salon and comparing them against our ₹7L growth roadmap..."
};

export const generateGrowthPlan = async (
  q: string, 
  data: SalonData, 
  history: {role: string, content: string}[],
  learnedPatterns: LearningPattern[] = []
): Promise<GrowthPlan> => {
  const query = q.toLowerCase();
  const gap = data.revenue.gap || 0;
  const fullHistoryText = (history.map(h => h.content.toLowerCase()).join(" ") + " " + query);
  
  const intents = {
    scaling: query.includes("scale") || query.includes("system") || query.includes("sop") || query.includes("expand"),
    team: query.includes("staff") || query.includes("team") || query.includes("stylist") || query.includes("employee") || query.includes("performance"),
    retention: query.includes("retention") || query.includes("churn") || query.includes("loyalty") || query.includes("comeback") || query.includes("loyal"),
    upsell: query.includes("upsell") || query.includes("aov") || query.includes("ticket") || query.includes("bundle"),
    botox: query.includes("botox") || query.includes("filler") || query.includes("premium"),
    bridal: query.includes("bridal") || query.includes("wedding") || query.includes("bride"),
    acquisition: query.includes("acquisition") || query.includes("new client") || query.includes("leads") || query.includes("marketing") || query.includes("attract") || query.includes("getting") || query.includes("customer")
  };

  let pillarAdvice: string[] = [];
  let intentName: keyof typeof HUMANIZE_FRAGMENTS = "general";

  if (intents.acquisition) {
    pillarAdvice = [EXPERT_PILLARS.ACQUISITION[0], EXPERT_PILLARS.ACQUISITION[1]];
    intentName = "acquisition";
  } else if (intents.scaling) {
    pillarAdvice = [EXPERT_PILLARS.SCALING[0], EXPERT_PILLARS.SCALING[1]];
    intentName = "scaling";
  } else if (intents.team) {
    pillarAdvice = [EXPERT_PILLARS.TEAM_PERFORMANCE[0], EXPERT_PILLARS.TEAM_PERFORMANCE[1]];
    intentName = "team";
  } else if (intents.botox || intents.upsell || intents.revenue) {
    pillarAdvice = [EXPERT_PILLARS.REVENUE_MAXIMIZATION[0], EXPERT_PILLARS.REVENUE_MAXIMIZATION[1]];
    intentName = "revenue";
  } else if (intents.retention) {
    pillarAdvice = [EXPERT_PILLARS.TEAM_PERFORMANCE[0], EXPERT_PILLARS.ACQUISITION[2]];
    intentName = "retention";
  } else {
    pillarAdvice = [EXPERT_PILLARS.SCALING[2], EXPERT_PILLARS.REVENUE_MAXIMIZATION[2]];
    intentName = "general";
  }

  const introTemplate = HUMANIZE_FRAGMENTS[intentName] || HUMANIZE_FRAGMENTS.general;
  const intro = introTemplate.replace("{gap}", gap.toLocaleString());
  const core = pillarAdvice.join("\n\n");
  
  const followUps = [
    "Should we start by mapping out the 'Consultation SOP' for your top stylists this week?",
    "Want me to check our current client database for the best candidates for this 'Invitation Only' event?",
    "Shall I draft a social media roadmap for these 'Signature Transformation' stories?",
    "Which of these moves should we prioritize first to bridge the current revenue gap?",
    "Does this align with your vision for the AAR Salon brand experience?"
  ];
  const followUp = followUps[Math.floor(Math.random() * followUps.length)];

  let serviceBonus = "";
  if (query.includes("botox")) {
    serviceBonus = "\n\n**Expert Note:** Botox is a trust-based service. I recommend we stop selling single sessions and transition to a 'Youth Maintenance' annual plan. It secures our recurring revenue and ensures the client gets the best long-term results.";
  } else if (query.includes("bridal")) {
    serviceBonus = "\n\n**Expert Note:** Brides are buying 'Certainty' and 'Peace of Mind'. Our strategy should be a 3-month 'Glow-Up Roadmap' that bundles all trials and treatments into one high-ticket package.";
  }

  const finalSummary = `${intro}\n\n${core}${serviceBonus}\n\n${followUp}`;

  return {
    intent: intentName,
    isReinforced: false,
    summary: finalSummary,
    steps: [],
    projections: { newRevenue: gap * 0.40, confidence: 92 }
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
