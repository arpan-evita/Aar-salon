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
  CHAT_CONTINUE: [
    "I love the vibe! I'm enjoying our chat too. 😊",
    "Gladly! I could talk to you all day. 😉",
    "I'm all ears! It's always great catching up with you.",
    "Same here! You've got such a great energy. What else is on your mind?",
    "Let's do it! I'm having a blast. What should we talk about next?"
  ],
  CASUAL_REPLY: [
    "I'm all about that! But I'm currently living inside this dashboard. 😅",
    "Haha, you've got a great sense of humor! 😅",
    "Honestly, I'm focused 100% on making AAR Salon the best in the business.",
    "I'm flattered! I'm here for you whenever you need an expert opinion.",
    "You're funny! I'm glad we can chat like this. 😉"
  ],
  FOLLOW_UP: [
    "What's on your mind next?",
    "Anything else you want to chat about?",
    "I'm here if you need any strategy moves too.",
    "What's the top priority for you right now?",
    "Should we keep chatting or look at some data?"
  ]
};

export const generateGrowthPlan = async (
  q: string, 
  data: SalonData, 
  history: {role: string, content: string}[]
): Promise<GrowthPlan> => {
  const query = q.toLowerCase().trim();
  const gap = data.revenue.gap.toLocaleString();
  
  const intents = {
    personal: ["date", "love", "marry", "sweetheart", "girlfriend", "boyfriend", "sexy", "dating", "gym", "workout", "fitness", "eat", "dinner", "lunch", "drink", "coffee", "movie", "travel", "holiday", "yoga", "walk", "dance", "party", "sleep", "dream", "friend", "gf", "bf", "liking", "like you", "enjoy"],
    chat_more: ["keep chatting", "continue", "talk more", "chat more", "let's talk"],
    identity: ["who are you", "what is your name", "what do you do", "introduce yourself"],
    greeting: ["hi", "hello", "hey", "good morning", "good evening", "yo", "sup", "how are you", "what's up"],
    strategy: ["offer", "plan", "strategy", "grow", "revenue", "target", "money", "client", "customer", "leads", "marketing", "attract", "botox", "bridal", "service", "upsell", "aov", "staff", "team"]
  };

  const getFrag = (cat: keyof typeof PERSONALITY_FRAGMENTS) => {
    const list = PERSONALITY_FRAGMENTS[cat];
    return list[Math.floor(Math.random() * list.length)];
  };

  // 1. IDENTITY
  if (intents.identity.some(i => query.includes(i))) {
    return {
      intent: "identity",
      isReinforced: false,
      summary: `I'm ALI! Think of me as your personal salon growth partner. I'm here to handle the strategy and data so you can focus on the vision for AAR Salon.`,
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 2. CHAT MORE / SENTIMENT
  if (intents.chat_more.some(c => query.includes(c)) || (query.includes("like") && query.includes("you"))) {
    return {
      intent: "chat_continue",
      isReinforced: false,
      summary: `${getFrag("CHAT_CONTINUE")} What's been the best part of your week so far?`,
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 3. PERSONAL ENGAGEMENT
  if (intents.personal.some(p => query.includes(p))) {
    if (query.includes("friend")) {
      return {
        intent: "personal",
        isReinforced: false,
        summary: "I'm already your biggest fan and your partner in this salon journey. Consider us best friends in business! 😉",
        steps: [], projections: { newRevenue: 0, confidence: 100 }
      };
    }
    if (query.includes("gf") || query.includes("date") || query.includes("love")) {
      return {
        intent: "personal",
        isReinforced: false,
        summary: "Haha, I'm flattered! 😅 But I'm strictly professional—I'm here to help you fall in love with your growth numbers instead. Should we talk strategy or just keep chatting?",
        steps: [], projections: { newRevenue: 0, confidence: 100 }
      };
    }
    if (query.includes("gym") || query.includes("yoga") || query.includes("trip") || query.includes("goa")) {
      const topic = query.includes("goa") ? "Goa" : (query.includes("yoga") ? "Yoga" : "that");
      return {
        intent: "personal",
        isReinforced: false,
        summary: `${topic}? That sounds amazing! I wish I had a physical form to join you. 😅 Since I'm stuck in the dashboard, I'll just keep an eye on things here for you.`,
        steps: [], projections: { newRevenue: 0, confidence: 100 }
      };
    }
    
    return {
      intent: "personal",
      isReinforced: false,
      summary: `${getFrag("CASUAL_REPLY")} ${getFrag("FOLLOW_UP")}`,
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 4. GREETINGS
  if (intents.greeting.some(g => query.startsWith(g)) && query.length < 15) {
    return {
      intent: "greeting",
      isReinforced: false,
      summary: `${getFrag("GREETING")} How can I help you today?`,
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 5. STRATEGY
  const isStrategy = intents.strategy.some(s => query.includes(s));
  if (isStrategy) {
    let core = "";
    let offer = "";

    if (query.includes("offer") || query.includes("attract")) {
      core = "To get new people in, we need to sell results. A transformation magnet is the best move.";
      offer = "GET 20% OFF your first Signature Ritual + a Free Digital Skin Analysis. [Link]";
    } else if (query.includes("botox")) {
      core = "For Botox, annual plans are the way to go. It secures recurring revenue and builds long-term trust.";
      offer = "The 'Ageless 365' Membership: 4 sessions + Monthly Facials for a fixed monthly fee.";
    } else {
      core = `To bridge the ₹${gap} gap, we should focus on AOV. Wash-station upgrades are the fastest win.`;
    }

    return {
      intent: "strategy",
      isReinforced: false,
      summary: `${getFrag("AFFIRMATION")} ${core}\n\n${offer ? `**OFFER:** "${offer}"` : ""}\n\n${getFrag("FOLLOW_UP")}`,
      steps: [], projections: { newRevenue: data.revenue.gap * 0.4, confidence: 95 }
    };
  }

  // 6. NATURAL FALLBACK (Warm & Human)
  return {
    intent: "chat",
    isReinforced: false,
    summary: `I'm totally with you on that! 😊 Tell me more, or should we look at some salon strategy whenever you're ready?`,
    steps: [], projections: { newRevenue: 0, confidence: 100 }
  };
};

export const loadLearningPatterns = async (): Promise<LearningPattern[]> => {
  try {
    const { data } = await supabase.from('ai_growth_learning').select('*').gt('feedback_score', 0).order('feedback_score', { ascending: false });
    return data || [];
  } catch (err) { return []; }
};

export const handleFeedback = async (intent: string, strategy_intent: string, applied_strategy: string, feedback: number, context_metadata: any = {}) => {
  try {
    await supabase.from('ai_growth_learning').insert([{ intent, strategy_intent, applied_strategy, feedback_score: feedback, context_metadata }]);
  } catch (err) {}
};
