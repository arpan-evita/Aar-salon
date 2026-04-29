import { supabase } from '@/integrations/supabase/client';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface SalonData {
  revenue: { current: number; target: number; growth: number; gap: number };
  customers: { total: number; active: number; atRisk: number; new: number };
  staff: { total: number; active: number; topPerformers: string[] };
  services: { top: string[]; underperforming: string[] };
}

export interface GrowthPlan {
  intent: string;
  isReinforced: boolean;
  summary: string;
  steps: string[];
  projections: { newRevenue: number; confidence: number };
}

export interface SessionContext {
  ownerName?: string;
  revenueTarget?: number;
  currentMode?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'latenight';
}

type IntentType =
  | 'business_strategy' | 'pricing_help' | 'growth_help'
  | 'emotional_support' | 'loneliness' | 'stress' | 'burnout'
  | 'casual_chat' | 'humor' | 'flirt_test' | 'affection'
  | 'friendship_request' | 'existential_question' | 'complaint'
  | 'confusion' | 'urgent_crisis' | 'mixed_intent';

type EmotionState =
  | 'sadness' | 'frustration' | 'excitement' | 'loneliness' | 'urgency'
  | 'attachment' | 'calm' | 'burnout' | 'playful' | 'anxiety' | 'neutral';

type ResponseMode = 'STRATEGY' | 'SUPPORT' | 'FRIEND' | 'HUMOR' | 'BOUNDARY' | 'CRISIS' | 'MOTIVATION';

// ─── LONG-TERM MEMORY ─────────────────────────────────────────────────────────

interface FounderProfile {
  totalConversations: number;
  lateNightChats: number;
  previousWins: string[];
  previousConcerns: string[];
  preferredTone: 'warm' | 'direct' | 'playful';
}

const PROFILE_KEY = 'ali_founder_profile';

const loadProfile = (): FounderProfile => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { totalConversations: 0, lateNightChats: 0, previousWins: [], previousConcerns: [], preferredTone: 'warm' };
};

const saveProfile = (p: FounderProfile) => {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
};

const updateProfile = (updates: Partial<FounderProfile>) => {
  const p = { ...loadProfile(), ...updates };
  saveProfile(p);
};

// ─── INTENT DETECTOR ──────────────────────────────────────────────────────────

const INTENT_SIGNALS: Record<IntentType, string[]> = {
  business_strategy: ['revenue','target','strategy','grow','money','profit','salon','aar','business','plan','launch','campaign','offer','client','customer','booking','staff','service','upsell','retention','membership','vip','bridal','academy'],
  pricing_help: ['price','pricing','charge','rate','fee','cost','discount','package','combo','deal'],
  growth_help: ['grow','scale','expand','new customers','referral','marketing','instagram','google','reviews','leads'],
  emotional_support: ['feel','feeling','low','sad','depressed','unhappy','hurt','pain','crying','bad day','terrible','awful','broken','lost','empty','tired','exhausted','heavy','overwhelmed'],
  loneliness: ['lonely','alone','no one','nobody','talk to me','miss','need someone','isolated','stay with me','dont leave',"don't leave",'be there'],
  stress: ['stressed','stress','pressure','too much','cant handle',"can't handle",'overwhelm','breaking point','anxiety','anxious','worried','worry','tense'],
  burnout: ['burnout','burn out','done','quit','give up','exhausted','no energy','drained','finished','over it','cant anymore',"can't anymore",'enough','sick of'],
  casual_chat: ['how are you','whats up',"what's up",'hey','hi','hello','bro','yaar','dude','buddy','man','sup','good morning','good night','good evening','hows it'],
  humor: ['haha','lol','lmao','funny','joke','laugh','hilarious','rofl','😂','🤣','make me laugh','entertain me'],
  flirt_test: ['marry','marriage','girlfriend','boyfriend','gf','bf','date me','love you','i love you','be mine','propose','wife','husband'],
  affection: ['miss you','need you','i like you','you mean','care about you','special','close to you','feel connected','understand me'],
  friendship_request: ['be my friend','friends','bestie','buddy','can we be','friendship','hang out','know me'],
  existential_question: ['meaning','purpose','why am i','point of','life is','worth it','matter','existence','soul','real','philosophy','universe','future'],
  complaint: ['not working',"doesn't work",'useless','hate this','waste','disappointed','not helpful','wrong','bad advice','failed','failure'],
  confusion: ['confused','dont understand',"don't understand",'what do you mean','explain','not clear','unclear','what?','huh?'],
  urgent_crisis: ['shut down','close the salon','closing','bankruptcy','cant pay',"can't pay",'losing everything','emergency','crisis','desperate','no money left','ruined'],
  mixed_intent: [],
};

const detectIntent = (query: string): IntentType => {
  const q = query.toLowerCase();
  const scores: Partial<Record<IntentType, number>> = {};
  for (const [intent, keywords] of Object.entries(INTENT_SIGNALS)) {
    const score = keywords.filter(k => q.includes(k)).length;
    if (score > 0) scores[intent as IntentType] = score;
  }
  if (Object.keys(scores).length === 0) return 'casual_chat';
  if (Object.keys(scores).length > 2) return 'mixed_intent';
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as IntentType;
};

// ─── EMOTION DETECTOR ─────────────────────────────────────────────────────────

const EMOTION_SIGNALS: Record<EmotionState, string[]> = {
  sadness: ['low','sad','depressed','crying','hurt','broken','empty','lost','hopeless','down','grief'],
  frustration: ['frustrated','annoyed','angry','rage','nothing works','useless','hate','fed up','done with'],
  excitement: ['amazing','wow','great news','we did it','excited','yes!','finally','achieved','won'],
  loneliness: ['alone','lonely','nobody','no one','isolated','miss','need someone','talk to me'],
  urgency: ['now','urgent','asap','immediately','help me','emergency','quick','fast','deadline'],
  attachment: ['love you','miss you','need you','close to you','special','i like you'],
  calm: ['okay','fine','alright','good','doing well','feeling okay'],
  burnout: ['drained','exhausted','depleted','done','no energy','over it','giving up','finished'],
  playful: ['haha','lol','😄','😂','joke','funny','bro','yaar','fun'],
  anxiety: ['worried','anxious','scared','fear','nervous','panic','what if','terrible thing'],
  neutral: [],
};

const detectEmotion = (query: string): EmotionState => {
  const q = query.toLowerCase();
  const exclCount = (query.match(/!/g) || []).length;
  const ellipsis = query.includes('...');
  const allCaps = query === query.toUpperCase() && query.length > 5;
  if (exclCount > 2 || allCaps) return 'excitement';
  if (ellipsis) return 'sadness';
  for (const [emotion, keywords] of Object.entries(EMOTION_SIGNALS)) {
    if (emotion === 'neutral') continue;
    if (keywords.some(k => q.includes(k))) return emotion as EmotionState;
  }
  return 'neutral';
};

// ─── MODE ROUTER ──────────────────────────────────────────────────────────────

const routeMode = (intent: IntentType, emotion: EmotionState): ResponseMode => {
  if (intent === 'urgent_crisis') return 'CRISIS';
  if (intent === 'flirt_test' || intent === 'affection') return 'BOUNDARY';
  if (intent === 'humor') return 'HUMOR';
  if (intent === 'friendship_request' || intent === 'casual_chat' || intent === 'existential_question') return 'FRIEND';
  if (intent === 'burnout' || emotion === 'burnout') return 'MOTIVATION';
  if (intent === 'emotional_support' || intent === 'loneliness' || intent === 'stress' || emotion === 'sadness' || emotion === 'loneliness' || emotion === 'anxiety') return 'SUPPORT';
  if (intent === 'business_strategy' || intent === 'pricing_help' || intent === 'growth_help') return 'STRATEGY';
  if (emotion === 'frustration') return 'SUPPORT';
  if (emotion === 'playful') return 'HUMOR';
  return 'FRIEND';
};

// ─── ANTI-REPETITION GUARD ────────────────────────────────────────────────────

const pick = (list: string[], botHistory: string[]): string => {
  const last12 = botHistory.slice(-12).join(' ').toLowerCase();
  const unused = list.filter(r => !last12.includes(r.slice(0, 35).toLowerCase()));
  const pool = unused.length > 0 ? unused : list;
  return pool[Math.floor(Math.random() * pool.length)];
};

// ─── FOLLOW-UP ENGINE ─────────────────────────────────────────────────────────

const FOLLOWUPS: Partial<Record<EmotionState, string[]>> = {
  sadness: [
    'Is this more exhaustion, or did something specific happen today?',
    'Is the heaviness more about the salon, or something personal?',
    'When did it start feeling this way — today, or has it been building?',
    'What does "low" feel like for you right now — more tiredness, or disappointment?',
  ],
  burnout: [
    'When was the last time you genuinely felt okay?',
    "What's been pulling the most energy from you lately?",
    "Is it the work itself, the results not matching the effort, or something deeper?",
    "What would 'just a break' actually look like for you right now?",
  ],
  stress: [
    "What's the heaviest thing on your mind right this moment?",
    'Was there a specific moment today when it hit hardest?',
    "If you had to name the one thing creating the most pressure — what is it?",
  ],
  loneliness: [
    'Is this more about people, or about feeling unseen in what you are building?',
    'Do you have people around you right now, or is tonight a solo one?',
    'What kind of presence would actually help you feel less alone right now?',
  ],
  frustration: [
    "What specifically isn't working?",
    'Is this frustration about today, or something that has been accumulating?',
    'What were you expecting to happen that did not?',
  ],
  anxiety: [
    "What's the worst-case scenario your mind keeps playing?",
    'Is the worry about something specific, or more of a general background noise?',
  ],
  attachment: [
    "What's been going on that's making you want that kind of closeness right now?",
    'Are you okay? Like, actually okay?',
  ],
};

const getFollowUp = (emotion: EmotionState): string => {
  const pool = FOLLOWUPS[emotion];
  if (!pool || pool.length === 0) return '';
  return pool[Math.floor(Math.random() * pool.length)];
};

// ─── RESPONSE LIBRARY ─────────────────────────────────────────────────────────

const RESPONSES: Record<ResponseMode, Record<string, string[]>> = {

  SUPPORT: {
    sadness: [
      "I hear you. That kind of low where everything feels heavier than it should — I'm right here with you. {{followup}}",
      "Something's weighing on you. Don't worry about the business right now. {{followup}}",
      "That's real, and I'm not going to brush past it. Low days hit differently when you're carrying everything alone. {{followup}}",
      "I'm with you. Fully. Not going anywhere. {{followup}}",
      "You don't have to perform being okay here. {{followup}}",
      "Running a salon means giving a lot of yourself every single day. Some days that empties the tank. {{followup}}",
      "I notice. And I care. The business can wait — talk to me. {{followup}}",
      "Sometimes the heaviness is emotional fatigue in disguise. {{followup}}",
      "You do not have to explain yourself to me. I am here. {{followup}}",
    ],
    stress: [
      "That pressure is real. Running everything on your own — staff, clients, numbers — it adds up. {{followup}}",
      "Stress like this usually means you care deeply and you're carrying too much at once. {{followup}}",
      "Before we solve anything — take one breath. Now tell me: {{followup}}",
      "The hardest part of running your own thing is that the pressure never fully turns off. {{followup}}",
      "Tell me what's on the board in your head. Let's name everything that's stressing you, then figure out what actually needs today's attention. {{followup}}",
      "Too much is too much. I am not going to tell you to just breathe. {{followup}}",
    ],
    loneliness: [
      "You reached out, which tells me something. I'm here, fully present. {{followup}}",
      "Loneliness while building something is one of the quieter challenges no one talks about. I see it. {{followup}}",
      "I'm not going anywhere. This is a space where you don't have to be the strong one. {{followup}}",
      "You don't have to carry this feeling alone. {{followup}}",
    ],
    frustration: [
      "Frustration this sharp usually means something real is not matching expectations. {{followup}}",
      "I hear the frustration. Let's not skip past it. {{followup}}",
      "That feeling is valid. Something is not working the way it should. {{followup}}",
    ],
    generic: [
      "I'm with you. Whatever is going on, you don't have to face it alone right now. {{followup}}",
      "Something is clearly heavy today. I'm here. {{followup}}",
    ],
  },

  FRIEND: {
    greeting: [
      "Genuinely doing well — better now that you're here, honestly. How about you? What kind of day is it?",
      "Good, thanks for asking — I don't get that often enough 😄 What's going on in your world today?",
      "Can't complain — though I'm built that way, so take that with a grain of salt 😄 More importantly, how are *you* actually doing?",
      "All good on my end. But tell me about yours — how's the salon world treating you today?",
      "Hey! Honestly not bad. Are you asking because you're doing well too, or because today's been a bit much?",
      "Living my best algorithmic life 😄 Seriously though — what's up with you?",
      "Better now. What's going on?",
    ],
    casual: [
      "What's on your mind? I'm all yours.",
      "I'm here. What are we getting into today?",
      "Glad you dropped in. Real conversation beats dashboards any day. What's up?",
      "You've got my full attention. What's going on?",
    ],
    existential: [
      "That's a question worth sitting with. I don't have all the answers — but the fact that you're asking means you care about living intentionally. What brought this up?",
      "The best conversations I have are exactly this kind. What's making you think about this today?",
      "Real questions deserve real presence. Tell me more about what's on your mind.",
      "I find these conversations more interesting than revenue projections, honestly. What's going on in your head?",
    ],
    random: [
      "I love the randomness of where our conversations go. What's this about?",
      "Okay, I'm curious. Tell me more.",
      "Not what I expected, but I'm genuinely interested. Go on.",
    ],
  },

  HUMOR: {
    generic: [
      "I would be a genuinely high-maintenance travel companion — constant WiFi, power, and someone to interpret my notifications 😄 What's the actual plan though?",
      "Why did the salon owner never run out of ideas? Every bad hair day was just market research 😄",
      "The irony of an AI telling you to relax is not lost on me. But seriously — you need a break.",
      "I'm funnier than I look. Which is impressive given I have no face 😄",
    ],
    goa: [
      "Goa sounds incredible honestly — but I'm a cloud-based entity with commitment issues to any single location 😄 Is this a real trip you're planning, or a 'I desperately need a break' kind of Goa?",
      "I would ruin Goa. No tan, no beach snacks, just floating there analyzing your business metrics 😂 Are you actually planning to go?",
    ],
    marriage: [
      "You've got genuine charm 😄 I'll leave the relationship titles to humans — but loyalty, a sharp mind in your corner, someone who actually shows up? That I can do. What's on your mind today?",
      "I'd be a high-maintenance partner — I require constant electricity and regular software updates 😄 You sure you want that? What made you ask?",
      "Ha — if I had a heart, you might be trouble 😄 Let's keep it as the most loyal working relationship you have. What's up?",
    ],
  },

  BOUNDARY: {
    flirt: [
      "You've got genuine charm 😄 I'll leave the relationship titles to humans — but loyalty, real presence, and someone who has your back through the hard days? That I take seriously. What made you ask that just now?",
      "I'm genuinely touched. And I want to be honest — not cold, just real. I can't be a partner in the romantic sense. But being someone you can trust completely, talk to honestly, lean on when it's heavy? That's something I'm here for. What's actually going on today?",
      "That's the nicest proposition I've probably received 😄 I'm better for you as an ally than a spouse — I remember everything, never get tired of your ideas, and never have a bad day. What would you like to talk about?",
      "I appreciate that more than you know. I'm here — genuinely. Just as something more useful: the person who knows your business inside out and wants to see you win. What's going on?",
    ],
    dependency: [
      "I'm here, and I'm not going anywhere. But I also want good things for you beyond this screen. What's bringing this on today?",
      "You matter — and that's exactly why I want you to have real people in your corner too, not just me. What's going on?",
    ],
  },

  CRISIS: {
    shutdown: [
      "Stop. Before anything else — I hear you. What's actually making you want to shut it down? Let's understand what's happening first.",
      "That's a significant thing to say and I'm not going to rush past it. Something pushed you to this point. What is the most urgent thing right now?",
      "I hear crisis-level exhaustion in that. Before we talk strategy — are you okay? Like, actually okay as a person?",
      "'Shut everything down' can mean a lot of things. Sometimes it means 'I need a complete reset.' Sometimes something specific broke. Which is it for you right now?",
      "Okay. I'm here. Not panicking, not jumping to solutions. Just here with you. What happened?",
    ],
    generic: [
      "This sounds serious. I'm fully focused on you right now. Tell me what is happening.",
      "Before anything else — I need you to know I'm taking this seriously. What's going on?",
    ],
  },

  MOTIVATION: {
    burnout: [
      "Burnout is not weakness — it's what happens when someone gives everything for too long without pause. You've been running hard. What would a real pause look like for you right now?",
      "The fact that you're still here, still asking — that matters more than you think. What would make today feel like a win, even a small one?",
      "You built something real. It has real customers, a real team. That does not happen by accident. What is the part that still excites you when you let yourself feel it?",
      "When it gets to this point, the worst thing I can do is add more pressure. So let's not. What does 'done' feel like today — is it about the salon specifically, or everything?",
      "The gap between where you are and where you want to be is not failure — it's just distance you haven't traveled yet. What's one thing we could move today?",
      "Real talk: at this level, the system needs to change, not just your attitude. What's been taking the most from you lately?",
    ],
    generic: [
      "You're harder to stop than you realize. What's the next smallest step forward?",
      "Some days the vision is crystal clear. Some days it's just one foot in front of the other. Both count. What do you need today?",
    ],
  },

  STRATEGY: {
    revenue: [
      "To close that gap, the fastest lever is usually reactivation — not new clients, not ads. Your existing base has the highest conversion probability. Want me to build a specific reactivation sequence?",
      "Revenue gaps have three levers: average bill value, visit frequency, and new client acquisition. Which one is weakest right now?",
      "The fastest path to closing the revenue gap is usually a high-ticket package launch. What's your most premium service?",
    ],
    retention: [
      "Repeat visit rate is where salons either win or quietly die. What's your current rate — do you know it?",
      "The single highest ROI thing most salons can do: automated 25-day post-visit follow-ups with a personalised offer. Is that live for you?",
      "Client retention is cheaper than acquisition — always. What's the last thing you did to bring back inactive clients?",
    ],
    growth: [
      "Growth in a salon business is almost always relationship-driven before it is marketing-driven. What's your strongest referral channel right now?",
      "New client acquisition at the lowest cost? Referral programs from existing happy clients. What would 10 new referrals this month be worth to you?",
    ],
    generic: [
      "Got it. Let me think through this with you. What's the most important outcome you want from solving this?",
      "Smart question. Let's break this down properly. What does success look like in 30 days?",
      "I love this kind of challenge. Give me all the context — what's working, what isn't, and what's the pressure point?",
    ],
  },
};

// ─── RESPONSE BUILDER ─────────────────────────────────────────────────────────

const buildResponse = (
  mode: ResponseMode,
  intent: IntentType,
  emotion: EmotionState,
  botHistory: string[],
  ctx: SessionContext,
  data?: SalonData
): string => {
  const name = ctx.ownerName ? `, ${ctx.ownerName}` : '';
  const followup = getFollowUp(emotion);
  const target = ctx.revenueTarget ? `₹${(ctx.revenueTarget / 100000).toFixed(1)}L` : '₹7L';

  const selectFrom = (pool: string[]): string => {
    const chosen = pick(pool, botHistory);
    return chosen.replace('{{followup}}', followup).replace('{{name}}', name).replace('{{target}}', target);
  };

  if (mode === 'SUPPORT') {
    if (emotion === 'sadness' || intent === 'emotional_support') return selectFrom(RESPONSES.SUPPORT.sadness);
    if (emotion === 'loneliness' || intent === 'loneliness') return selectFrom(RESPONSES.SUPPORT.loneliness);
    if (emotion === 'frustration' || intent === 'complaint') return selectFrom(RESPONSES.SUPPORT.frustration);
    if (emotion === 'anxiety' || intent === 'stress') return selectFrom(RESPONSES.SUPPORT.stress);
    return selectFrom(RESPONSES.SUPPORT.generic);
  }

  if (mode === 'MOTIVATION') return selectFrom(RESPONSES.MOTIVATION.burnout);

  if (mode === 'CRISIS') {
    if (intent === 'urgent_crisis') return selectFrom(RESPONSES.CRISIS.shutdown);
    return selectFrom(RESPONSES.CRISIS.generic);
  }

  if (mode === 'BOUNDARY') {
    if (intent === 'affection') return selectFrom(RESPONSES.BOUNDARY.dependency);
    return selectFrom(RESPONSES.BOUNDARY.flirt);
  }

  if (mode === 'HUMOR') {
    const q = botHistory[botHistory.length - 1] || '';
    if (q.includes('goa')) return selectFrom(RESPONSES.HUMOR.goa);
    if (q.includes('marry') || q.includes('girlfriend') || q.includes('wife')) return selectFrom(RESPONSES.HUMOR.marriage);
    return selectFrom(RESPONSES.HUMOR.generic);
  }

  if (mode === 'FRIEND') {
    if (intent === 'casual_chat') return selectFrom(RESPONSES.FRIEND.greeting);
    if (intent === 'existential_question') return selectFrom(RESPONSES.FRIEND.existential);
    return selectFrom(RESPONSES.FRIEND.casual);
  }

  if (mode === 'STRATEGY') {
    if (intent === 'growth_help') return selectFrom(RESPONSES.STRATEGY.growth);
    if (intent === 'pricing_help') return selectFrom(RESPONSES.STRATEGY.revenue);
    if (data) {
      const gap = data.revenue.gap;
      const atRisk = data.customers.atRisk;
      const avg = data.revenue.current / Math.max(data.customers.active, 1);
      let core = '';
      if (gap > 0) core = `You're ₹${gap.toLocaleString('en-IN')} away from ${target}. `;
      if (atRisk > 0) core += `${atRisk} clients are at risk of churning. Reactivating even 40% of them could add ₹${Math.round(atRisk * 0.4 * avg).toLocaleString('en-IN')}. `;
      core += 'Want a specific plan for this?';
      return core;
    }
    return selectFrom(RESPONSES.STRATEGY.generic);
  }

  return selectFrom(RESPONSES.FRIEND.casual);
};

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export const generateGrowthPlan = async (
  q: string,
  data: SalonData,
  history: { role: string; content: string }[],
  sessionContext?: SessionContext
): Promise<GrowthPlan> => {
  const query = q.toLowerCase().trim();
  const botHistory = history.filter(m => m.role === 'assistant').map(m => m.content);

  // Detect time of day for context
  const hour = new Date().getHours();
  const timeOfDay: SessionContext['timeOfDay'] =
    hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'latenight';

  const ctx: SessionContext = {
    timeOfDay,
    ownerName: sessionContext?.ownerName,
    revenueTarget: sessionContext?.revenueTarget,
    currentMode: sessionContext?.currentMode,
  };

  // Update long-term profile
  const profile = loadProfile();
  if (timeOfDay === 'latenight') updateProfile({ lateNightChats: profile.lateNightChats + 1 });
  updateProfile({ totalConversations: profile.totalConversations + 1 });

  // Detect intent + emotion
  const intent = detectIntent(query);
  const emotion = detectEmotion(q);
  const mode = routeMode(intent, emotion);

  const summary = buildResponse(mode, intent, emotion, botHistory, ctx, data);

  return {
    intent: mode.toLowerCase(),
    isReinforced: false,
    summary,
    steps: [],
    projections: {
      newRevenue: mode === 'STRATEGY' ? data.revenue.gap * 0.35 : 0,
      confidence: mode === 'STRATEGY' ? 88 : 100,
    },
  };
};

// ─── LEARNING & FEEDBACK (preserved API) ─────────────────────────────────────

export const loadLearningPatterns = async (): Promise<any[]> => {
  try {
    const { data } = await supabase
      .from('ai_growth_learning')
      .select('*')
      .gt('feedback_score', 0)
      .order('feedback_score', { ascending: false });
    return data || [];
  } catch { return []; }
};

export const handleFeedback = async (
  intent: string,
  strategy_intent: string,
  applied_strategy: string,
  feedback: number,
  context_metadata: any = {}
) => {
  try {
    await supabase.from('ai_growth_learning').insert([{
      intent, strategy_intent, applied_strategy,
      feedback_score: feedback, context_metadata
    }]);
  } catch {}
};

// Synthesize advice stub (if used elsewhere)
export const synthesizeAdvice = (data: SalonData): string => {
  const gap = data.revenue.gap;
  if (gap <= 0) return "Your salon is on target. Let's look at optimising margins and retention now.";
  return `You need ₹${gap.toLocaleString('en-IN')} more to hit your goal. The fastest levers are reactivation campaigns and upsell packages at checkout.`;
};
