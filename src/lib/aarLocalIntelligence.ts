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
    team: query.includes("staff") || query.includes("team") || query.includes("stylist") || query.includes("employee"),
    retention: query.includes("retention") || query.includes("churn") || query.includes("loyalty") || query.includes("comeback"),
    upsell: query.includes("upsell") || query.includes("aov") || query.includes("ticket") || query.includes("bundle"),
    botox: query.includes("botox") || query.includes("filler") || query.includes("premium"),
    bridal: query.includes("bridal") || query.includes("wedding"),
    acquisition: query.includes("acquisition") || query.includes("new client") || query.includes("leads") || query.includes("marketing") || query.includes("attract") || query.includes("customer")
  };

  let summary = "";
  let strategies: GrowthPlan['strategies'] = [];
  let offers: GrowthPlan['offers'] = [];
  let metrics: GrowthPlan['metrics'] = [];
  let intentName = "growth";

  // ACQUISITION / MARKETING
  if (intents.acquisition || query.includes("marketing")) {
    intentName = "marketing";
    summary = `Based on our current revenue gap of ₹${gap.toLocaleString()}, I've designed a high-leverage acquisition plan to attract premium spenders to AAR Salon. We should stop chasing new clients with generic discounts and instead launch a 'Signature Transformation' campaign.`;
    
    strategies = [
      {
        title: "Signature Transformation Campaign",
        impact: "High (₹1.2L+)",
        difficulty: "Medium",
        timeline: "14 Days",
        details: "Showcase the specific results of your Botox and Bridal rituals on Instagram. Focus on the 'V-Shape' facial results to attract high-intent spenders."
      },
      {
        title: "Digital Consultation Magnet",
        impact: "Medium (₹45k+)",
        difficulty: "Easy",
        timeline: "7 Days",
        details: "Implement a digital analysis where leads upload a photo for a skin/hair report. Builds authority before they ever step into the salon."
      }
    ];

    offers = [
      {
        name: "First-Timer Premium Glow",
        target: "Local High-Spenders",
        benefit: "₹2,500 off high-ticket ritual",
        action: "Launch Instagram Ad"
      }
    ];
  } 
  // SCALING / SYSTEMS
  else if (intents.scaling || query.includes("system")) {
    intentName = "strategy";
    summary = `To scale AAR Salon effectively, we must move from 'Operator Mode' to 'Systems Mode'. Your presence shouldn't be the bottleneck for revenue growth. I've outlined the core SOPs we need to implement to bridge the ₹${gap.toLocaleString()} gap.`;
    
    strategies = [
      {
        title: "Client Consultation SOP",
        impact: "High (Systems)",
        difficulty: "Medium",
        timeline: "10 Days",
        details: "Standardize the 3-step diagnosis process for every stylist. Ensures a consistent 'AAR Salon Experience' regardless of who is working."
      },
      {
        title: "Automated Win-Back Flows",
        impact: "Medium (₹35k+)",
        difficulty: "Easy",
        timeline: "3 Days",
        details: "Set up background triggers for clients who haven't visited in 45 days. Fully automated via our WhatsApp integration."
      }
    ];
  }
  // TEAM / STAFF
  else if (intents.team || query.includes("staff")) {
    intentName = "staff";
    summary = `Your team is the 'Employee' pillar of the PACE framework. To hit our ₹7L target, we need to shift them from technicians to growth partners. I've identified two key areas for performance improvement.`;
    
    metrics = [
      { label: "Avg Stylist Utilization", value: "64%", change: "+5%", trend: "up" },
      { label: "Upsell Conversion", value: "22%", change: "-3%", trend: "down" }
    ];

    strategies = [
      {
        title: "Consultative Sales Training",
        impact: "High (₹80k+)",
        difficulty: "Medium",
        timeline: "21 Days",
        details: "Train staff to 'prescribe' solutions rather than 'sell' products. Every client leaves with a 28-day health roadmap."
      }
    ];
  }
  // BOTOX / PREMIUM
  else if (intents.botox || query.includes("premium")) {
    intentName = "strategy";
    summary = `Botox and premium rituals are your highest-margin services. To bridge the ₹${gap.toLocaleString()} gap, we should stop selling single sessions and transition to 'Youth Maintenance' annual plans.`;
    
    offers = [
      {
        name: "Annual Youth Maintenance",
        target: "VIP / 35+ Demographic",
        benefit: "4 Sessions for ₹40k (Save ₹20k)",
        action: "Send to VIPs"
      }
    ];

    metrics = [
      { label: "Botox Margin", value: "65%", change: "Industry Peak", trend: "up" }
    ];
  }
  // DEFAULT
  else {
    summary = `Hey! I've been scanning the latest metrics for AAR Salon. We're currently about ₹${gap.toLocaleString()} away from our monthly target of ₹${data.revenue.target?.toLocaleString()}. I've put together a mixed strategy to bridge this gap through upselling and systems.`;
    
    strategies = [
      {
        title: "Wash-Station Ritual Upsell",
        impact: "High (90% Profit)",
        difficulty: "Easy",
        timeline: "Immediate",
        details: "Convert 30% of haircut clients to a ₹800 'Flash Ritual'. Takes 5 mins extra, massive revenue impact."
      }
    ];
  }

  return {
    intent: intentName,
    isReinforced: false,
    summary,
    steps: [],
    strategies,
    offers,
    metrics,
    projections: { newRevenue: gap * 0.45, confidence: 92 }
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
