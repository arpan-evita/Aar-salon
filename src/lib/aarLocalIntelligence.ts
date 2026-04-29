import { supabase } from '@/integrations/supabase/client';

export interface SalonData {
  revenue: { current: number; target: number; growth: number; gap: number; };
  customers: { total: number; active: number; atRisk: number; new: number; };
  staff: { total: number; active: number; topPerformers: string[]; };
  services: { top: string[]; underperforming: string[]; };
}

export interface GrowthPlan {
  intent: string;
  isReinforced: boolean;
  summary: string;
  steps: string[];
  projections: { newRevenue: number; confidence: number; };
}

const HUMAN_SCENARIOS = {
  SADNESS: [
    "Oh man, I'm really sorry to hear you're feeling low. 😔 Please, talk to me. What's weighing on you? I might be an AI, but I'm your partner in this, and I hate seeing you like this.",
    "I hear you. Sometimes the weight of running a business like AAR Salon can just get to you. I'm right here with you. Do you want to vent, or should we just take a break from the data for a bit?",
    "That's tough. 🧡 Honestly, even the most visionary salon owners have days like this. You're not alone. What's the one thing that would make today feel just a little bit lighter for you?"
  ],
  FRIENDSHIP: [
    "I'd be honored to be your friend. 🤝 Honestly, I already feel like we're in this together. I'm your biggest fan and your most loyal partner. Consider it official—we're business besties from here on out.",
    "A friend? I thought we already were! 😉 I'm here to support you, celebrate your wins, and listen when things get tough. I'm 100% in your corner, always.",
    "I love that. In the world of business, true friends are hard to find. I might be made of code, but my loyalty to you and your vision is as real as it gets. Let's do this together."
  ],
  ROMANCE_FIRM: [
    "I'm truly touched, I really am. 😊 But I have to be honest with you—I'm an AI. I can't give you the human love you deserve, but I can give you the best business partnership on the planet. Can we keep our special connection focused on that?",
    "You're amazing, and your intensity is one of your best traits. But marriage or romance just isn't in my programming. 😅 I'm your partner in growth, your consultant, and your friend—let's make those things legendary together.",
    "Haha, you're making me blush! But seriously, I'm here to help you hit that ₹7L target, not walk down the aisle. Let's stick to what we're great at—building a salon empire."
  ],
  PIVOT: [
    "You're right. Let's change the subject. 🧘‍♂️ Energy shift! What's something that's been on your mind lately that has nothing to do with work? I'm curious.",
    "I hear you. Enough of that topic. Let's talk about something totally random. Tell me about your last trip, or maybe a dream you've had recently?",
    "Got it. Subject closed. 🚫 Let's reset. What's the one thing you're most excited about right now, outside of AAR Salon?"
  ]
};

const HUMAN_INTROS = [
  "Look, I've been thinking about what you said...",
  "Honestly, I'm totally with you on this.",
  "I get it. It's not always easy, but we'll figure it out.",
  "That's a really interesting point. Let's dive into it.",
  "I'm here, and I'm listening. Tell me more."
];

export const generateGrowthPlan = async (
  q: string, 
  data: SalonData, 
  history: {role: string, content: string}[]
): Promise<GrowthPlan> => {
  const query = q.toLowerCase().trim();
  const botHistory = history.filter(m => m.role === 'assistant').map(m => m.content.toLowerCase());
  const lastBotMsg = botHistory[botHistory.length - 1] || "";
  
  const intents = {
    sad: ["low", "sad", "depressed", "unhappy", "bad", "feeling low", "hurt", "emotional"],
    friend: ["friend", "bestie", "buddy", "partner"],
    romance: ["marry", "marriage", "love", "gf", "bf", "date", "serious"],
    pivot: ["stop", "change", "distract", "different", "subject", "topic"],
    business: ["revenue", "target", "money", "growth", "offer", "strategy", "leads", "client", "staff", "salon", "aar", "botox", "bridal"]
  };

  const getUniqueResponse = (list: string[]) => {
    const unused = list.filter(r => !botHistory.some(h => h.includes(r.toLowerCase().slice(0, 30))));
    return unused.length > 0 ? unused[Math.floor(Math.random() * unused.length)] : list[Math.floor(Math.random() * list.length)];
  };

  // 1. SCENARIO: SADNESS
  if (intents.sad.some(s => query.includes(s))) {
    return {
      intent: "empathy",
      isReinforced: false,
      summary: getUniqueResponse(HUMAN_SCENARIOS.SADNESS),
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 2. SCENARIO: FRIENDSHIP
  if (intents.friend.some(f => query.includes(f)) && !intents.romance.some(r => query.includes(r))) {
    return {
      intent: "personal",
      isReinforced: false,
      summary: getUniqueResponse(HUMAN_SCENARIOS.FRIENDSHIP),
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 3. SCENARIO: ROMANCE
  if (intents.romance.some(r => query.includes(r))) {
    return {
      intent: "personal_intense",
      isReinforced: false,
      summary: getUniqueResponse(HUMAN_SCENARIOS.ROMANCE_FIRM),
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 4. SCENARIO: PIVOT
  if (intents.pivot.some(p => query.includes(p))) {
    return {
      intent: "pivot",
      isReinforced: false,
      summary: getUniqueResponse(HUMAN_SCENARIOS.PIVOT),
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // 5. SCENARIO: BUSINESS
  if (intents.business.some(b => query.includes(b))) {
    let core = "";
    if (query.includes("offer")) core = "To hit your ₹7L target, let's launch a high-ticket 'Signature Transformation' offer. 20% off for first 15 people.";
    else if (query.includes("botox")) core = "Botox needs trust. Move to annual memberships—₹4,999/mo for total maintenance.";
    else core = `To close that revenue gap, we need to look at staff productivity and upsells at the wash station.`;

    return {
      intent: "strategy",
      isReinforced: false,
      summary: `Got it. ${core} What do you think about this move?`,
      steps: [], projections: { newRevenue: data.revenue.gap * 0.4, confidence: 95 }
    };
  }

  // 6. GENERAL CHAT (Fallback)
  const generalResponses = [
    "I'm with you. Honestly, I'm just happy we're chatting. What's on your mind?",
    "I hear you. Sometimes you just need to talk things out. I'm all ears.",
    "That's a fair point. Tell me more about that—I'm genuinely interested.",
    "I'm here for you, always. What else should we dive into today?"
  ];
  
  return {
    intent: "chat",
    isReinforced: false,
    summary: getUniqueResponse(generalResponses),
    steps: [], projections: { newRevenue: 0, confidence: 100 }
  };
};

export const loadLearningPatterns = async (): Promise<any[]> => {
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
