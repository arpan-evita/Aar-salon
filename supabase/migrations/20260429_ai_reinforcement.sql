-- AI Growth Reinforcement Learning Table
CREATE TABLE IF NOT EXISTS ai_growth_learning (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    intent TEXT NOT NULL, -- e.g., 'offer', 'revenue', 'staff'
    context_data JSONB NOT NULL, -- snapshot of SalonData
    query TEXT NOT NULL,
    strategy_applied TEXT NOT NULL,
    feedback_score INTEGER DEFAULT 0, -- +1 for upvote, -1 for downvote
    success_metrics JSONB DEFAULT '{}', -- e.g., actual revenue increase
    is_active BOOLEAN DEFAULT TRUE
);

-- Index for fast lookup by intent and context patterns
CREATE INDEX IF NOT EXISTS idx_ai_growth_learning_intent ON ai_growth_learning(intent);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ai_growth_learning;
