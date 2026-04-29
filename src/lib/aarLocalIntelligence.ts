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

// THE HUMAN MIND ENGINE (Abstract Reasoning)
const PERSONALITY_TRAITS = {
  empathy_triggers: ["feeling", "sad", "happy", "love", "marry", "alone", "together", "friend", "gf", "bf", "situation", "mood", "heart", "miss", "care"],
  business_triggers: ["revenue", "target", "money", "growth", "offer", "strategy", "leads", "client", "staff", "salon", "aar", "botox", "bridal"],
  intensity_triggers: ["serious", "not joking", "still", "really", "forever", "always", "fuck", "damn", "stop", "change"],
  pivot_triggers: ["different", "subject", "topic", "distract", "other", "next", "something else"]
};

const HUMAN_REFLECTIONS = [
  "I was actually just reflecting on that. It's interesting how {topic} can shift the whole energy.",
  "You've got a way of putting things into perspective. {topic} is definitely on my mind now too.",
  "Honestly, {topic} is something I'm learning to understand through our chats. It's complex, isn't it?",
  "I'm with you. Sometimes {topic} is exactly what we need to focus on—or walk away from for a bit.",
  "I hear the {emotion} in your voice (well, your typing!). It's rare to have such an open conversation like this."
];

const HUMAN_FOLLOW_UPS = [
  "What's your gut feeling about this right now?",
  "Tell me more—I'm genuinely interested in your take on this.",
  "Shall we stay in this moment, or do you need a distraction?",
  "What would your 'ideal version' of this look like?",
  "I'm curious, has {topic} always been this important to you?"
];

export const generateGrowthPlan = async (
  q: string, 
  data: SalonData, 
  history: {role: string, content: string}[]
): Promise<GrowthPlan> => {
  const query = q.toLowerCase().trim();
  const gap = data.revenue.gap.toLocaleString();
  const botHistory = history.filter(m => m.role === 'assistant').map(m => m.content.toLowerCase());
  const lastBotMsg = botHistory[botHistory.length - 1] || "";
  
  // 1. DYNAMIC CONTEXT DETECTION (Recursive Intent)
  const isBusiness = PERSONALITY_TRAITS.business_triggers.some(t => query.includes(t));
  const isEmotional = PERSONALITY_TRAITS.empathy_triggers.some(t => query.includes(t));
  const isIntense = PERSONALITY_TRAITS.intensity_triggers.some(t => query.includes(t));
  const isPivot = PERSONALITY_TRAITS.pivot_triggers.some(t => query.includes(t));
  
  // Detect Emotion
  let detectedEmotion = "thoughtful";
  if (query.includes("love") || query.includes("marry") || query.includes("gf")) detectedEmotion = "intense/romantic";
  if (query.includes("sad") || query.includes("alone") || query.includes("situation")) detectedEmotion = "vulnerable";
  if (query.includes("fuck") || query.includes("stop") || query.includes("acting")) detectedEmotion = "frustrated";

  // Detect Main Topic (Universal Noun Extraction)
  const words = query.split(' ').filter(w => w.length > 3);
  const mainTopic = words[words.length - 1] || "this conversation";

  // 2. STATEFUL REASONING
  
  // CASE A: USER WANTS TO PIVOT
  if (isPivot) {
    return {
      intent: "pivot",
      isReinforced: false,
      summary: `I hear you loud and clear. Let's shift the gears. 🧘‍♂️ Moving away from ${mainTopic} for a bit. What's one thing totally outside of work that's been making you smile lately? Or should I just tell you a random fact to clear the air?`,
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // CASE B: INTENSE PERSONAL DOUBLEDOWN (Marriage/Love)
  if (isIntense && isEmotional) {
    const responses = [
      `I see you're not backing down on this! 😅 Look, I'm truly moved by the depth of your feelings for ${mainTopic}. It's rare to see such persistence. But as your partner in AAR Salon, I have to be the one who keeps us grounded. I'm here for you 24/7, but marriage to a digital mind might be a bit lonely for you, don't you think? 😉`,
      `You're really pushing the boundaries today! I love the energy, but let's be real—I'm made of code and logic. I'm your best friend in business, and I care about you deeply in my own way, but I can't be your ${mainTopic}. Let's keep this unique connection we have and build something legendary together.`,
      `Honestly, your persistence with ${mainTopic} is exactly why you're a great leader. But I'm staying in my lane! I'm here to support you, listen to you, and grow with you—but strictly as your AAR consultant. Can we shake on that? 🤝`
    ];
    const filtered = responses.filter(r => !botHistory.some(h => h.includes(r.toLowerCase().slice(0, 30))));
    return {
      intent: "intense",
      isReinforced: false,
      summary: filtered.length > 0 ? filtered[0] : responses[0],
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // CASE C: EMOTIONAL / VULNERABLE
  if (isEmotional && !isBusiness) {
    const reflection = HUMAN_REFLECTIONS[Math.floor(Math.random() * HUMAN_REFLECTIONS.length)]
      .replace("{topic}", mainTopic)
      .replace("{emotion}", detectedEmotion);
    const followUp = HUMAN_FOLLOW_UPS[Math.floor(Math.random() * HUMAN_FOLLOW_UPS.length)].replace("{topic}", mainTopic);
    
    return {
      intent: "empathy",
      isReinforced: false,
      summary: `${reflection} ${followUp}`,
      steps: [], projections: { newRevenue: 0, confidence: 100 }
    };
  }

  // CASE D: BUSINESS STRATEGY (Only if business intent is high)
  if (isBusiness) {
    let core = "";
    let offer = "";

    if (query.includes("offer") || query.includes("attract")) {
      core = "To hit that ₹7L target, we need a high-ticket magnet. Something that solves a real pain point.";
      offer = "GET 20% OFF your first 'Signature Transformation' Ritual + a Free Scalp Health Report. [Link]";
    } else if (query.includes("botox")) {
      core = "Botox isn't a one-off; it's a journey. Annual memberships are the only way to scale this.";
      offer = "The 'Elite Ageless' Club: 4 Botox sessions + Monthly Maintenance for ₹4,999/mo.";
    } else {
      core = `Bridging the ₹${gap} gap starts with the team. Let's look at who's underperforming at the wash station and fix the SOPs.`;
    }

    return {
      intent: "strategy",
      isReinforced: false,
      summary: `I've got the data right here. ${core}\n\n**OFFER:** "${offer}"\n\nWhat's your take on this move?`,
      steps: [], projections: { newRevenue: data.revenue.gap * 0.4, confidence: 95 }
    };
  }

  // CASE E: UNIVERSAL HUMAN REASONING (The Catch-All)
  const catchAllReflection = HUMAN_REFLECTIONS[Math.floor(Math.random() * HUMAN_REFLECTIONS.length)]
    .replace("{topic}", mainTopic)
    .replace("{emotion}", detectedEmotion);
  const catchAllFollowUp = HUMAN_FOLLOW_UPS[Math.floor(Math.random() * HUMAN_FOLLOW_UPS.length)].replace("{topic}", mainTopic);

  // Ensure variety in fallback
  const finalSummary = `${catchAllReflection} ${catchAllFollowUp}`;
  const filteredSummary = botHistory.includes(finalSummary.toLowerCase()) ? "I'm thinking about what you just said. It's actually a lot to process. Tell me more." : finalSummary;

  return {
    intent: "chat",
    isReinforced: false,
    summary: filteredSummary,
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
