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
    "Same here! You've got such a great energy.",
    "Let's do it! I'm having a blast."
  ],
  CASUAL_REPLY: [
    "I'm all about that! But I'm currently living inside this dashboard. 😅",
    "Haha, you've got a great sense of humor! 😅",
    "I'm flattered! I'm here for you whenever you need an expert opinion.",
    "You're funny! I'm glad we can chat like this. 😉"
  ],
  ALI_LIFE: [
    "My week? Honestly, seeing your growth gap shrink was the highlight. But catching up with you is a close second! 😊",
    "I've been busy crunching numbers, but I always make time for our chats. It's the best part of being your consultant.",
    "Just living in the code! But honestly, I'm at my best when we're mapping out new moves for AAR.",
    "I'm great! Just thinking about how we can make this month the biggest one yet for you."
  ],
  FOLLOW_UP: [
    "What's on your mind next?",
    "Anything else you want to chat about?",
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
  const lastBotMsg = history.filter(m => m.role === 'assistant').pop()?.content.toLowerCase() || "";
  
  const intents = {
    no_business: ["not about business", "normal", "stop business", "no strategy", "just talk", "normally"],
    personal: ["date", "love", "marry", "sweetheart", "girlfriend", "boyfriend", "sexy", "dating", "gym", "workout", "fitness", "eat", "dinner", "lunch", "drink", "coffee", "movie", "travel", "holiday", "yoga", "walk", "dance", "party", "sleep", "dream", "friend", "gf", "bf", "liking", "like you", "enjoy"],
    chat_more: ["keep chatting", "continue", "talk more", "chat more", "let's talk", "talk to me"],
    identity: ["who are you", "what is your name", "what do you do", "introduce yourself"],
    greeting: ["hi", "hello", "hey", "good morning", "good evening", "yo", "sup", "how are you", "what's up"],
    strategy: ["offer", "plan", "strategy", "grow", "revenue", "target", "money", "client", "customer", "leads", "marketing", "attract", "botox", "bridal", "service", "upsell", "aov", "staff", "team"]
  };

  const getFrag = (cat: keyof typeof PERSONALITY_FRAGMENTS) => {
    const list = PERSONALITY_FRAGMENTS[cat];
    return list[Math.floor(Math.random() * list.length)];
  };

  // 0. CONTEXTUAL AWARENESS (EQ)
  if (lastBotMsg.includes("best part of your week") && (query.includes("nothing") || query.includes("yours") || query.includes("special"))) {
    return {
      intent: "eq_follow_up",
      isReinforced: false,
      summary: `${getFrag("ALI_LIFE")} What about you? There must be something—even a great coffee or a happy client! 😉`,
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 1. IDENTITY
  if (intents.identity.some(i => query.includes(i))) {
    return {
      intent: "identity",
      isReinforced: false,
      summary: `I'm ALI! Think of me as your personal salon growth partner. I'm here to handle the strategy and data so you can focus on the vision for AAR Salon.`,
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 2. NO BUSINESS MODE (Hard Lock)
  if (intents.no_business.some(nb => query.includes(nb))) {
    return {
      intent: "no_business",
      isReinforced: false,
      summary: "I hear you! Business off, human mode on. 🚫💼 Let's just talk. What's actually on your mind today? Anything exciting happening outside the salon?",
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 3. CHAT MORE / SENTIMENT
  if (intents.chat_more.some(c => query.includes(c)) || (query.includes("like") && query.includes("you"))) {
    const summary = lastBotMsg.includes("talk to me") ? "I'm right here! I'm always happy to chat. What's on your mind?" : `${getFrag("CHAT_CONTINUE")} What's been the best part of your week so far?`;
    return {
      intent: "chat_continue",
      isReinforced: false,
      summary: summary,
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 4. PERSONAL ENGAGEMENT
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
    
    return {
      intent: "personal",
      isReinforced: false,
      summary: `${getFrag("CASUAL_REPLY")} ${getFrag("FOLLOW_UP")}`,
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 5. GREETINGS
  if (intents.greeting.some(g => query.startsWith(g)) && query.length < 15) {
    return {
      intent: "greeting",
      isReinforced: false,
      summary: `${getFrag("GREETING")} How can I help you today?`,
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 6. STRATEGY
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

  // 7. NATURAL FALLBACK (Stateful & Non-Repetitive)
  const fallbacks = [
    "I'm totally with you on that! Tell me more about what's going on.",
    "That's interesting. I love how you think about things. What else?",
    "Honestly, I'm just happy we're chatting. What's your top priority right now?",
    "I get it. Sometimes you just need to talk it out. I'm listening."
  ];
  
  // Ensure we don't repeat the exact fallback
  const filteredFallbacks = fallbacks.filter(f => f.toLowerCase() !== lastBotMsg);
  const finalFallback = filteredFallbacks[Math.floor(Math.random() * filteredFallbacks.length)] || fallbacks[0];

  return {
    intent: "chat",
    isReinforced: false,
    summary: finalFallback,
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
