import { supabase } from '@/integrations/supabase/client';

export interface SalonData {
  revenue: { current: number; target: number; growth: number; gap: number; };
  customers: { total: number; active: number; atRisk: number; new: number; };
  staff: { total: number; active: number; topPerformers: string[]; };
  services: { top: string[]; underperforming: string[]; };
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
  projections: { newRevenue: number; confidence: number; };
}

// HUMAN REASONING PILLARS
const PERSONALITY_FRAGMENTS = {
  GREETING: ["Hey!", "Hello there!", "Hey, good to see you.", "Hi! Hope your day is going great.", "Yo! Ready to dive in?"],
  AFFIRMATION: ["I hear you.", "Totally get that.", "That makes sense.", "I'm on it.", "Got it, let's look at this.", "Interesting point."],
  CASUAL_NO: [
    "Haha, I wish! But I'm stuck inside this dashboard for now. 😅",
    "Umm... I don't think my digital self is quite ready for that yet! 😅",
    "I'd love to, but I think I'd just be a bunch of code on your screen. Maybe next time?",
    "Honestly, I'm a bit of a homebody—stuck right here in the AAR systems. 🏠",
    "As much as I'd like to, I don't have the legs (or a physical form) for that! 🤖"
  ],
  BRIDGE_TO_BUSINESS: [
    "But hey, while we're here, should we talk about your salon?",
    "Anyway, back to business—what's the plan for today?",
    "That aside, I've got some ideas for your revenue gap.",
    "But enough about me—how's the team at AAR Salon doing?",
    "Regardless, I'm here to help you hit that ₹7L target. What's next?"
  ],
  FOLLOW_UP: [
    "What do you think?",
    "Sound like a plan?",
    "Shall we dive deeper into this?",
    "Which part should we tackle first?",
    "Want me to draft something for you?"
  ]
};

const HUMAN_STRATEGY = {
  OFFER: "✨ **ACTUAL OFFER:** \"{offer_text}\"\n\n*Action:* Launch this on WhatsApp to your VIP list today.",
  EXPERT_MOVE: "💡 **EXPERT MOVE:** {move_text}"
};

export const generateGrowthPlan = async (
  q: string, 
  data: SalonData, 
  history: {role: string, content: string}[]
): Promise<GrowthPlan> => {
  const query = q.toLowerCase().trim();
  const gap = data.revenue.gap.toLocaleString();
  
  // DYNAMIC INTENT MAPPING
  const intents = {
    personal: ["date", "love", "marry", "sweetheart", "girlfriend", "boyfriend", "sexy", "dating", "gym", "workout", "fitness", "eat", "dinner", "lunch", "drink", "coffee", "movie", "travel", "holiday", "yoga", "walk", "dance", "party", "sleep", "dream"],
    identity: ["who are you", "what is your name", "what do you do", "introduce yourself"],
    greeting: ["hi", "hello", "hey", "good morning", "good evening", "yo", "sup", "how are you", "what's up"],
    strategy: ["offer", "plan", "strategy", "grow", "revenue", "target", "money", "client", "customer", "leads", "marketing", "attract", "botox", "bridal", "service", "upsell", "aov", "staff", "team"]
  };

  const getFrag = (cat: keyof typeof PERSONALITY_FRAGMENTS) => {
    const list = PERSONALITY_FRAGMENTS[cat];
    return list[Math.floor(Math.random() * list.length)];
  };

  // 1. IDENTITY & NAME
  if (intents.identity.some(i => query.includes(i))) {
    return {
      intent: "identity",
      isReinforced: false,
      summary: `I'm ALI! Think of me as your personal salon growth partner. I'm here to handle the heavy lifting—data, strategy, and offers—so you can focus on being the visionary for AAR Salon.`,
      steps: [],
      projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 2. PERSONAL / CASUAL (Deeply Human Layer)
  const personalMatch = intents.personal.find(p => query.includes(p));
  if (personalMatch || (query.length < 30 && !intents.strategy.some(s => query.includes(s)) && !intents.greeting.some(g => query.includes(g)))) {
    const topic = personalMatch || query.split(' ').pop()?.replace(/[?!.]/g, '') || "that";
    const funnyLines = [
      `${topic.charAt(0).toUpperCase() + topic.slice(1)}? Haha, now that's a stretch for an AI! 😅 I'd love to join, but I think I'd just be a bunch of pixels hanging out.`,
      `Honestly, I'm a bit of a homebody—stuck right here in the AAR systems. But I'm always up for some mental gymnastics with your salon data instead of ${topic}!`,
      `Umm... I don't think my digital self is quite ready for ${topic} yet! 😅 But hey, I can definitely help you fall in love with your salon's growth numbers.`,
      `As much as I'd like to, I don't have the legs (or a physical form) for ${topic}! 🤖 Maybe I'll stick to what I'm good at—making you money.`
    ];
    
    return {
      intent: "personal",
      isReinforced: false,
      summary: `${funnyLines[Math.floor(Math.random() * funnyLines.length)]} ${getFrag("BRIDGE_TO_BUSINESS")}`,
      steps: [],
      projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 3. GREETINGS & SMALL TALK
  if (intents.greeting.some(g => query.startsWith(g)) && query.length < 20) {
    const greeting = getFrag("GREETING");
    return {
      intent: "greeting",
      isReinforced: false,
      summary: `${greeting} I was just looking at the ₹7L target—we're making progress. What's on your mind today?`,
      steps: [],
      projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 4. DEEP STRATEGY ENGINE (Scenario Solving)
  const isStrategy = intents.strategy.some(s => query.includes(s));
  if (isStrategy) {
    let intro = getFrag("AFFIRMATION");
    let core = "";
    let offer = "";

    if (query.includes("offer") || query.includes("new client") || query.includes("attract")) {
      core = "Look, to get new people in, we need to stop selling 'services' and start selling 'results'. I'd push a transformation magnet.";
      offer = "GET 20% OFF your first Signature Ritual + a Free Digital Skin Analysis. Book in 24 hours. [Link]";
    } else if (query.includes("botox") || query.includes("high ticket")) {
      core = "Botox is about trust. I'd move to an annual plan. It's better for the client and locks in recurring revenue for us.";
      offer = "The 'Ageless 365' Membership: 4 Botox sessions + Monthly Facials for one fixed monthly fee.";
    } else if (query.includes("staff") || query.includes("team")) {
      core = "Your team needs to be partners. Let's implement a 'Ritual Upsell' bonus for anyone who hits a 30% conversion rate at the wash station.";
    } else {
      core = `To bridge that ₹${gap} gap, we need to look at AOV. Small upgrades at the wash station are the fastest way to see cash flow today.`;
    }

    const finalSummary = `${intro} ${core}\n\n${offer ? HUMAN_STRATEGY.OFFER.replace("{offer_text}", offer) : ""}\n\n${getFrag("FOLLOW_UP")}`;

    return {
      intent: "strategy",
      isReinforced: false,
      summary: finalSummary,
      steps: [],
      projections: { newRevenue: data.revenue.gap * 0.4, confidence: 95 }
    };
  }

  // 5. THE "EXPERT FRIEND" FALLBACK (Never Robotic)
  const words = query.split(' ');
  const randomWord = words[Math.floor(Math.random() * words.length)];
  
  return {
    intent: "chat",
    isReinforced: false,
    summary: `Honestly, I was just thinking about ${randomWord}—but in a business way. 😅 But seriously, I'm here if you want to talk about growing the brand or hitting that ₹7L goal. What's your top priority right now?`,
    steps: [],
    projections: { newRevenue: 0, confidence: 100 }
  };
};

export const loadLearningPatterns = async (): Promise<LearningPattern[]> => {
  try {
    const { data } = await supabase.from('ai_growth_learning').select('*').gt('feedback_score', 0).order('feedback_score', { ascending: false });
    return data || [];
  } catch (err) {
    return [];
  }
};

export const handleFeedback = async (intent: string, strategy_intent: string, applied_strategy: string, feedback: number, context_metadata: any = {}) => {
  try {
    await supabase.from('ai_growth_learning').insert([{ intent, strategy_intent, applied_strategy, feedback_score: feedback, context_metadata }]);
  } catch (err) {}
};
