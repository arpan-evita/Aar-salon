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

const HUMAN_INTROS = [
  "Look, I've been crunching the numbers for AAR Salon and that ₹{gap} gap is definitely bridgeable if we make the right moves.",
  "Honestly, hitting the ₹7L target is all about focus. Right now, we're ₹{gap} away, and I have a clear plan for it.",
  "Let's be real—to hit ₹7L this month, we can't just keep doing the same thing. Here's how I see us closing that ₹{gap} gap.",
  "I was just looking at your latest metrics. That ₹{gap} revenue gap looks like a massive opportunity once we fix the leakage.",
  "If I were in your shoes right now, knowing we have a ₹{gap} gap to hit ₹7L, I'd double down on what's working."
];

const GREETINGS = [
  "Hey there! How's everything going at AAR Salon today?",
  "Hello! Ready to make some moves on that ₹7L target today?",
  "Hey! Hope you're having a great day. How can I help you out today?",
  "Hi! I've been scanning the latest metrics—everything's looking sharp. What's on your mind?",
  "Hey! Good to see you. Ready to dive into some strategy or just checking in?"
];

const HUMAN_ADVICE = {
  ACQUISITION: [
    "Instead of burning money on broad ads, let's go for high-intent spenders. I'd launch a 'Signature Transformation' series on Instagram. Showcase the before-and-after of your Botox rituals. It's not just a service; it's a result people are willing to pay a premium for.",
    "For new clients, forget discounts. Offer a 'VIP Digital Analysis' magnet. Let them upload a photo for a skin report. It builds your authority before they even step in the salon, making that ₹5k+ booking a no-brainer.",
    "We should also look at 'Mirror Marketing'. Your current VIPs are gold. Why not give them an exclusive 'Guest Invitation' to bring a friend for a complimentary consultation? It pre-vettes your new acquisitions to have the same spending power as your best clients."
  ],
  SCALING: [
    "If we want to scale AAR Salon without you burning out, we need to get you out of 'Operator Mode'. The business shouldn't stop because you stepped away. We need standard SOPs for the consultation—every stylist following the same diagnosis flow ensures the 'Signature Experience' is identical every time.",
    "Systems are the only way to fill that gap. I'd set up automated win-back triggers on WhatsApp for anyone who hasn't visited in 45 days. It's money on the table that doesn't require any manual work from your side.",
    "Think of it this way: build the people who build the business. If the team is following a system, you're free to focus on the high-level growth moves that actually move the needle."
  ],
  TEAM: [
    "Your team shouldn't just be technicians; they need to be growth partners. I'd reward the stylists who keep their repeat customer rate above 75%. They're the ones building your long-term revenue base, not just one-off haircuts.",
    "I'd also start pushing 'Consultative Prescriptions' instead of sales. Stylists shouldn't 'sell' products—they should prescribe a 28-day roadmap for hair health. It's a psychological shift that increases AOV by default.",
    "If I were you, I'd implement a dynamic bonus for converting basic services into 'Ritual Bundles'. It aligns their income directly with our ₹7L goal."
  ],
  REVENUE: [
    "The fastest way to close that ₹{gap} gap is at the wash station. A ₹800 'Flash Ritual' takes zero extra time but has a massive profit margin. If we convert just 30% of your daily traffic, we hit our targets significantly faster.",
    "We also need to look at 'Anchor Pricing'. Put a high-end ₹50k 'Full Restoration' package at the top of your menu. It makes your ₹15k Botox and ₹8k Skin treatments look like incredible value in comparison. It’s a pure psychological move.",
    "For rapid revenue, 'Grand Slam Offers' are the way to go. Combine your top-performing services into a 3-month 'Glow-Up Roadmap'. By selling 'Certainty' and results instead of just sessions, you can charge a 40% premium."
  ]
};

const HUMAN_FOLLOW_UPS = [
  "Does that sound like a move we should prioritize this week?",
  "Shall we start by mapping out that consultation SOP together?",
  "Want me to draft the social media roadmap for those transformation stories?",
  "Which part of this resonates most with your vision for the brand?",
  "Should I check the database to see which VIPs are perfect for this?"
];

export const generateGrowthPlan = async (
  q: string, 
  data: SalonData, 
  history: {role: string, content: string}[],
  learnedPatterns: LearningPattern[] = []
): Promise<GrowthPlan> => {
  const query = q.toLowerCase().trim();
  const gapNum = data.revenue.gap || 0;
  const gap = gapNum.toLocaleString();
  
  // 1. Detect Greeting
  const isGreeting = ["hi", "hello", "hey", "good morning", "good evening", "yo"].includes(query);
  
  if (isGreeting) {
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)].replace(/{gap}/g, gap);
    return {
      intent: "greeting",
      isReinforced: false,
      summary: greeting,
      steps: [],
      projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 2. Detect Small Talk / Meta
  if (query.length < 10 && !query.includes("₹") && !query.includes("target")) {
    return {
      intent: "chat",
      isReinforced: false,
      summary: "I'm here! What's on your mind regarding the salon today? We can talk strategy, marketing, or even just check how the team's doing.",
      steps: [],
      projections: { newRevenue: 0, confidence: 100 }
    };
  }

  const intents = {
    scaling: query.includes("scale") || query.includes("system") || query.includes("sop") || query.includes("expand"),
    team: query.includes("staff") || query.includes("team") || query.includes("stylist") || query.includes("employee") || query.includes("performance"),
    retention: query.includes("retention") || query.includes("churn") || query.includes("loyalty") || query.includes("comeback"),
    upsell: query.includes("upsell") || query.includes("aov") || query.includes("ticket") || query.includes("bundle"),
    botox: query.includes("botox") || query.includes("filler") || query.includes("premium"),
    bridal: query.includes("bridal") || query.includes("wedding"),
    acquisition: query.includes("acquisition") || query.includes("new client") || query.includes("leads") || query.includes("marketing") || query.includes("attract") || query.includes("customer")
  };

  let advicePool: string[] = [];
  let intentName = "general";

  if (intents.acquisition) {
    advicePool = [HUMAN_ADVICE.ACQUISITION[0], HUMAN_ADVICE.ACQUISITION[1]];
    intentName = "acquisition";
  } else if (intents.scaling) {
    advicePool = [HUMAN_ADVICE.SCALING[0], HUMAN_ADVICE.SCALING[1]];
    intentName = "scaling";
  } else if (intents.team) {
    advicePool = [HUMAN_ADVICE.TEAM[0], HUMAN_ADVICE.TEAM[1]];
    intentName = "team";
  } else if (intents.botox || intents.upsell || query.includes("revenue")) {
    advicePool = [HUMAN_ADVICE.REVENUE[0], HUMAN_ADVICE.REVENUE[1]];
    intentName = "revenue";
  } else if (intents.retention) {
    advicePool = [HUMAN_ADVICE.SCALING[1], HUMAN_ADVICE.ACQUISITION[2]];
    intentName = "retention";
  } else {
    advicePool = [HUMAN_ADVICE.REVENUE[2], HUMAN_ADVICE.TEAM[2]];
    intentName = "general";
  }

  const intro = HUMAN_INTROS[Math.floor(Math.random() * HUMAN_INTROS.length)].replace(/{gap}/g, gap);
  const core = advicePool.map(a => a.replace(/{gap}/g, gap)).join("\n\n");
  const followUp = HUMAN_FOLLOW_UPS[Math.floor(Math.random() * HUMAN_FOLLOW_UPS.length)];

  let serviceBonus = "";
  if (query.includes("botox")) {
    serviceBonus = "\n\n**Just a thought:** Botox is a high-trust service. I'd stop selling single sessions and move to an annual 'Youth Maintenance' plan. It secures our recurring revenue and keeps the client happy long-term.";
  } else if (query.includes("bridal")) {
    serviceBonus = "\n\n**Pro tip:** Brides are buying 'Certainty'. Our strategy should be a 3-month 'Glow-Up Roadmap' that bundles everything. It's a much easier sell than individual appointments.";
  }

  const finalSummary = `${intro}\n\n${core}${serviceBonus}\n\n${followUp}`;

  return {
    intent: intentName,
    isReinforced: false,
    summary: finalSummary,
    steps: [],
    projections: { newRevenue: gapNum * 0.40, confidence: 94 }
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
  applied_strategy: string,
  feedback: number,
  contextMetadata: any = {}
) => {
  try {
    const { error } = await supabase
      .from('ai_growth_learning')
      .insert([{
        intent,
        strategy_intent: strategyIntent,
        applied_strategy: applied_strategy,
        feedback_score: feedback,
        context_metadata: contextMetadata
      }]);
    
    if (error) throw error;
  } catch (err) {
    console.error("Error saving feedback:", err);
  }
};
