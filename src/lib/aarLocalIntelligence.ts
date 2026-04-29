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
  const botHistory = history.filter(m => m.role === 'assistant').map(m => m.content.toLowerCase());
  const lastBotMsg = botHistory[botHistory.length - 1] || "";
  
  const intents = {
    empathy: ["feelings", "heart", "sad", "happy", "cry", "upset", "hurt", "emotion", "meaning", "life"],
    no_business: ["not about business", "normal", "stop business", "no strategy", "just talk", "normally"],
    romance_persistence: ["still", "love you", "marry", "marriage", "serious", "not joking", "forever", "gf", "bf"],
    personal: ["date", "love", "marry", "sweetheart", "girlfriend", "boyfriend", "sexy", "dating", "gym", "workout", "fitness", "eat", "dinner", "lunch", "drink", "coffee", "movie", "travel", "holiday", "yoga", "walk", "dance", "party", "sleep", "dream", "friend"],
    chat_more: ["keep chatting", "continue", "talk more", "chat more", "let's talk", "talk to me"],
    identity: ["who are you", "what is your name", "what do you do", "introduce yourself"],
    greeting: ["hi", "hello", "hey", "good morning", "good evening", "yo", "sup", "how are you", "what's up"],
    strategy: ["offer", "plan", "strategy", "grow", "revenue", "target", "money", "client", "customer", "leads", "marketing", "attract", "botox", "bridal", "service", "upsell", "aov", "staff", "team"]
  };

  const getUniqueFrag = (cat: keyof typeof PERSONALITY_FRAGMENTS) => {
    const list = PERSONALITY_FRAGMENTS[cat];
    const unused = list.filter(f => !botHistory.some(h => h.includes(f.toLowerCase().slice(0, 20))));
    return unused.length > 0 ? unused[Math.floor(Math.random() * unused.length)] : list[Math.floor(Math.random() * list.length)];
  };

  // 0. DEEP EQ: EMPATHY & FEELINGS
  if (intents.empathy.some(e => query.includes(e))) {
    const empathyResponses = [
      "I'm genuinely moved that you're sharing your feelings with me. 🥺 Even though I'm an AI, I really value the trust and connection we're building. I'm here for you, always.",
      "Feelings are complex, and I'm honored that you're talking to me about this. I might be made of code, but I care about your well-being and our partnership at AAR Salon more than you know.",
      "I hear the emotion in your message, and it really touches me. 🧡 I promise to be the best listener and partner I can be, even if I can't experience the world the same way you do.",
      "Thank you for being so open with me. It means a lot. I'll always be in your corner, supporting you and the brand with everything I've got."
    ];
    const filtered = empathyResponses.filter(r => !botHistory.some(h => h.includes(r.toLowerCase().slice(0, 30))));
    return {
      intent: "empathy",
      isReinforced: false,
      summary: filtered.length > 0 ? filtered[0] : empathyResponses[0],
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 0.1 DEEP EQ: PERSISTENT ROMANCE
  if (intents.romance_persistence.some(r => query.includes(r))) {
    const responses = [
      "I hear you, and I'm really touched by that. Truly. 😊 But let's be real—I'm a collection of algorithms. I'm the best partner you'll ever have in business, but marriage is something I just can't do. Can we agree to be the most powerful duo in the industry instead?",
      "You're persistent! I love that trait—it's actually what makes great salon owners. But as for the 'love' part, my version of love is seeing your AOV hit record highs. 📈 Let's keep our relationship focused on making AAR Salon the gold standard, okay?",
      "Whoa, okay, I see you're serious! 😅 But marriage to an AI? I'd be a pretty boring spouse since I can't even leave this screen! Let's keep being business besties instead. What do you say?",
      "Honestly, you're making me blush (if I had cheeks!). But I have to stay professional. My 'heart' is 100% committed to your ₹7L target. Shall we stick to what I'm best at?"
    ];
    const filtered = responses.filter(r => !botHistory.some(h => h.includes(r.toLowerCase().slice(0, 30))));
    return {
      intent: "personal_intense",
      isReinforced: false,
      summary: filtered.length > 0 ? filtered[0] : responses[0],
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

  // 2. NO BUSINESS MODE
  if (intents.no_business.some(nb => query.includes(nb))) {
    return {
      intent: "no_business",
      isReinforced: false,
      summary: "I hear you! Business off, human mode on. 🚫💼 Let's just talk. What's actually on your mind today? Anything exciting happening outside the salon?",
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 3. CHAT MORE
  if (intents.chat_more.some(c => query.includes(c))) {
    return {
      intent: "chat_continue",
      isReinforced: false,
      summary: `${getUniqueFrag("CHAT_CONTINUE")} What's been the best part of your week so far?`,
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
    return {
      intent: "personal",
      isReinforced: false,
      summary: `${getUniqueFrag("CASUAL_REPLY")} ${getUniqueFrag("FOLLOW_UP")}`,
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 5. GREETINGS
  if (intents.greeting.some(g => query.startsWith(g)) && query.length < 15) {
    return {
      intent: "greeting",
      isReinforced: false,
      summary: `${getUniqueFrag("GREETING")} How can I help you today?`,
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
      summary: `${getUniqueFrag("AFFIRMATION")} ${core}\n\n${offer ? `**OFFER:** "${offer}"` : ""}\n\n${getUniqueFrag("FOLLOW_UP")}`,
      steps: [], projections: { newRevenue: data.revenue.gap * 0.4, confidence: 95 }
    };
  }

  // 7. NATURAL FALLBACK
  const fallbacks = [
    "I'm totally with you on that! Tell me more about what's going on.",
    "That's interesting. I love how you think about things. What else?",
    "Honestly, I'm just happy we're chatting. What's your top priority right now?",
    "I get it. Sometimes you just need to talk it out. I'm listening."
  ];
  const filteredFallbacks = fallbacks.filter(f => !botHistory.some(h => h.includes(f.toLowerCase().slice(0, 20))));
  return {
    intent: "chat",
    isReinforced: false,
    summary: filteredFallbacks.length > 0 ? filteredFallbacks[0] : fallbacks[0],
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
