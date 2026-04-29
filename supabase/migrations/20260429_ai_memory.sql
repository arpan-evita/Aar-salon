-- Create a table for AI Growth Assistant Chat History
CREATE TABLE IF NOT EXISTS ai_growth_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE ai_growth_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own growth chats"
    ON ai_growth_chats
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_growth_chats_user_created ON ai_growth_chats(user_id, created_at DESC);
