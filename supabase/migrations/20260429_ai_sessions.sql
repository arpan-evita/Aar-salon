-- Create a table for AI Growth Sessions
CREATE TABLE IF NOT EXISTS ai_growth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Strategy Session',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add session_id to ai_growth_chats
ALTER TABLE ai_growth_chats ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES ai_growth_sessions(id) ON DELETE CASCADE;

-- Add RLS policies for sessions
ALTER TABLE ai_growth_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own growth sessions"
    ON ai_growth_sessions
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Index for session lookups
CREATE INDEX IF NOT EXISTS idx_growth_chats_session ON ai_growth_chats(session_id);
CREATE INDEX IF NOT EXISTS idx_growth_sessions_user ON ai_growth_sessions(user_id, last_message_at DESC);
