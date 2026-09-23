-- ============================================================
-- SIH 26006 Maritime Cargo Intelligence Platform
-- Migration 002: Create Persistent Chat History Tables
-- ChatGPT-Style Conversations & Message History
-- Non-destructive: Uses CREATE TABLE IF NOT EXISTS
-- ============================================================

-- 1. Chat Conversations Table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at 
    ON public.chat_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id 
    ON public.chat_conversations(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to chat_conversations" 
    ON public.chat_conversations FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to chat_conversations" 
    ON public.chat_conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to chat_conversations" 
    ON public.chat_conversations FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to chat_conversations" 
    ON public.chat_conversations FOR DELETE USING (true);


-- 2. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    message_order INT NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id 
    ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_order 
    ON public.chat_messages(conversation_id, message_order ASC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
    ON public.chat_messages(created_at ASC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to chat_messages" 
    ON public.chat_messages FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to chat_messages" 
    ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to chat_messages" 
    ON public.chat_messages FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to chat_messages" 
    ON public.chat_messages FOR DELETE USING (true);
