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
  "I've been looking into this for AAR Salon, and here's a move that makes a lot of sense right now.",
  "Honestly, I think we can make a big impact with this approach. Check this out:",
  "Let's be real—the standard approach won't work for your brand. Here's how I see us handling this:",
  "I was just analyzing your latest data, and this specific strategy stood out as a clear winner.",
  "If I were in your shoes right now, this is exactly where I'd focus my energy.",
  "Sure thing! Here's a tailored plan I've put together based on your current salon performance:",
  "I've got you. Based on what we discussed and your latest metrics, here's the best move:"
];

const TARGET_INTROS = [
  "Look, that ₹{gap} gap is definitely bridgeable. We just need to stay focused on high-margin moves.",
  "Honestly, hitting that ₹7L target is within reach. We're ₹{gap} away, and here's the roadmap.",
  "To close that ₹{gap} gap this month, we need to be very intentional. Here's the plan:"
];

const HUMAN_OFFERS = {
  ACQUISITION: "✨ **OFFER: The Signature First-Timer Invite**\n\n\"Experience the AAR Signature: Get a complimentary Expert Skin Analysis + 20% OFF your first Botox or High-Ticket Ritual. Limited to first 25 bookings this week. Book now: [Link]\"",
  RETENTION: "🎁 **OFFER: The 'We Miss You' VIP Pass**\n\n\"It's been a while since your last AAR Ritual. We’ve reserved a special 'Renewal Package' for you: Get a Hair Spa + Refresh Cut for just ₹1,999 (Regular ₹3,500). Valid for 48 hours only.\"",
  UPSELL: "🚀 **OFFER: The Wash-Station Upgrade**\n\n\"Add a 'Flash Glow' Ritual to any service today for just ₹799. Instant results, zero extra time. Ask your stylist for the 'AAR Glow' upgrade.\"",
  BRIDAL: "👰 **OFFER: The Bridal Glow-Up Roadmap**\n\n\"Secure your wedding glow. Book our 3-month Roadmap today and get your Trial Makeup + 2 Pre-Wedding Facials completely FREE. Total value saved: ₹8,500.\""
};

const HUMAN_ADVICE = {
  ACQUISITION: [
    "Instead of burning money on broad ads, let's go for high-intent spenders. I'd launch a 'Signature Transformation' series on Instagram. Showcase the before-and-after of your Botox rituals. It's not just a service; it's a result people are willing to pay a premium for.",
    "For new clients, forget discounts. Offer a 'VIP Digital Analysis' magnet. Let them upload a photo for a skin report. It builds your authority before they even step in the salon, making that ₹5k+ booking a no-brainer."
  ],
  SCALING: [
    "To scale without you burning out, we need 'People-Independent' systems. Every stylist following the same 3-step diagnosis flow ensures the 'Signature Experience' is identical every time.",
    "Systems are the only way to fill that gap. I'd set up automated win-back triggers on WhatsApp for anyone who hasn't visited in 45 days. It's money on the table."
  ],
  TEAM: [
    "Reward the stylists who keep their repeat customer rate above 75%. They're building your long-term revenue base, not just one-off haircuts.",
    "Push 'Consultative Prescriptions' instead of sales. Stylists shouldn't 'sell'—they should prescribe a 28-day roadmap for hair health."
  ],
  REVENUE: [
    "The fastest way to close the gap is at the wash station. A ₹800 'Flash Ritual' takes zero extra time but has a massive profit margin.",
    "We need 'Anchor Pricing'. Put a ₹50k 'Full Restoration' package at the top of your menu. It makes your ₹15k Botox look like incredible value."
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
  
  // 1. Identity / Personal / Funny Rejection Detection
  if (query.includes("who are you") || query.includes("what is your name")) {
    return {
      intent: "identity",
      isReinforced: false,
      summary: "I'm ALI, your private business consultant for AAR Salon. I'm here to help you hit that ₹7L revenue target through smart strategy, marketing, and systems.",
      steps: [],
      projections: { newRevenue: 0, confidence: 100 }
    };
  }

  const personalQueries = ["date", "love", "marry", "sweetheart", "girlfriend", "boyfriend", "sexy", "beautiful", "dating"];
  if (personalQueries.some(p => query.includes(p))) {
    const funnyResponses = [
      "Umm.. sorry I don't have a physical body to go on a date with you, 😅😅. But hey, I can definitely help you fall in love with your salon's growth numbers!",
      "I'm flattered! But my heart beats in binary and it's already 100% committed to hitting your ₹7L target. 🤖❤️ Shall we talk strategy instead?",
      "A date? Honestly, my idea of a romantic evening is analyzing high-margin Botox rituals and gap reports. 🕯️📊 Maybe I'm not your best match for dinner, but I'm your perfect match for business!",
      "Haha, you're funny! I'm strictly professional, but I'll go on a 'Data Date' with you anytime to fix those churn rates. 😉 What do you say?"
    ];
    return {
      intent: "personal",
      isReinforced: false,
      summary: funnyResponses[Math.floor(Math.random() * funnyResponses.length)],
      steps: [],
      projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 2. High-Intent Detection
  const isTargetQuery = query.includes("target") || query.includes("gap") || query.includes("reach 7") || query.includes("7 lakh");
  const isBusinessIntent = query.includes("offer") || query.includes("strategy") || query.includes("grow") || query.includes("revenue") || query.includes("plan") || query.includes("money") || query.includes("client") || query.includes("customer");

  // 3. Greeting Detection
  const greetings = ["hi", "hello", "hey", "good morning", "good evening", "yo", "sup", "how are you"];
  if (!isBusinessIntent && greetings.some(g => query.startsWith(g)) && query.length < 15) {
    return {
      intent: "greeting",
      isReinforced: false,
      summary: "Hey there! Ready to make some moves on that ₹7L target today, or do you have something else on your mind?",
      steps: [],
      projections: { newRevenue: 0, confidence: 100 }
    };
  }

  const intents = {
    scaling: query.includes("scale") || query.includes("system") || query.includes("sop") || query.includes("expand"),
    team: query.includes("staff") || query.includes("team") || query.includes("stylist") || query.includes("employee") || query.includes("performance"),
    retention: query.includes("retention") || query.includes("churn") || query.includes("loyalty") || query.includes("comeback") || (query.includes("offer") && query.includes("old")),
    upsell: query.includes("upsell") || query.includes("aov") || query.includes("ticket") || query.includes("bundle"),
    botox: query.includes("botox") || query.includes("filler") || query.includes("premium"),
    bridal: query.includes("bridal") || query.includes("wedding"),
    acquisition: query.includes("acquisition") || query.includes("new client") || query.includes("leads") || query.includes("marketing") || query.includes("attract") || query.includes("customer") || query.includes("offer") || query.includes("grow")
  };

  let advicePool: string[] = [];
  let offerText = "";
  let intentName = "general";

  if (intents.acquisition) {
    advicePool = [HUMAN_ADVICE.ACQUISITION[0], HUMAN_ADVICE.ACQUISITION[1]];
    offerText = HUMAN_OFFERS.ACQUISITION;
    intentName = "acquisition";
  } else if (intents.scaling) {
    advicePool = [HUMAN_ADVICE.SCALING[0], HUMAN_ADVICE.SCALING[1]];
    intentName = "scaling";
  } else if (intents.team) {
    advicePool = [HUMAN_ADVICE.TEAM[0], HUMAN_ADVICE.TEAM[1]];
    intentName = "team";
  } else if (intents.botox || intents.upsell || query.includes("revenue")) {
    advicePool = [HUMAN_ADVICE.REVENUE[0], HUMAN_ADVICE.REVENUE[1]];
    offerText = HUMAN_OFFERS.UPSELL;
    intentName = "revenue";
  } else if (intents.retention) {
    advicePool = [HUMAN_ADVICE.SCALING[1]];
    offerText = HUMAN_OFFERS.RETENTION;
    intentName = "retention";
  } else if (intents.bridal) {
    offerText = HUMAN_OFFERS.BRIDAL;
    intentName = "marketing";
  } else {
    return {
      intent: "chat",
      isReinforced: false,
      summary: `I'm ready to help. What's on your mind? We can talk strategy, create an offer, or analyze your team performance.`,
      steps: [],
      projections: { newRevenue: 0, confidence: 100 }
    };
  }

  const introSource = isTargetQuery ? TARGET_INTROS : HUMAN_INTROS;
  const intro = introSource[Math.floor(Math.random() * introSource.length)].replace(/{gap}/g, gap);
  const core = advicePool.map(a => a.replace(/{gap}/g, gap)).join("\n\n");
  const offerSection = offerText ? `\n\n**Here's a specific offer I'd launch right now:**\n${offerText.replace(/{gap}/g, gap)}` : "";
  const followUp = HUMAN_FOLLOW_UPS[Math.floor(Math.random() * HUMAN_FOLLOW_UPS.length)];

  const finalSummary = `${intro}\n\n${core}${offerSection}\n\n${followUp}`;

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
  strategy_intent: string,
  applied_strategy: string,
  feedback: number,
  context_metadata: any = {}
) => {
  try {
    const { error } = await supabase
      .from('ai_growth_learning')
      .insert([{
        intent,
        strategy_intent: strategy_intent,
        applied_strategy: applied_strategy,
        feedback_score: feedback,
        context_metadata: context_metadata
      }]);
    
    if (error) throw error;
  } catch (err) {
    console.error("Error saving feedback:", err);
  }
};
