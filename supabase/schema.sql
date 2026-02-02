-- Enable Row Level Security
alter table auth.users enable row level security;

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('anthropic-admin', 'moonshot')),
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Usage data cache table
CREATE TABLE IF NOT EXISTS usage_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('anthropic-admin', 'moonshot')),
  data JSONB NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tables
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean migration)
DROP POLICY IF EXISTS "Users can only access their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can only access their own usage cache" ON usage_cache;

-- Policies for api_keys
CREATE POLICY "Users can only access their own API keys"
  ON api_keys FOR ALL
  USING (auth.uid() = user_id);

-- Policies for usage_cache
CREATE POLICY "Users can only access their own usage cache"
  ON usage_cache FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_usage_cache_user_id ON usage_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_cache_provider ON usage_cache(provider);

-- Migration: Remove old 'anthropic' keys (regular API keys, not admin)
DELETE FROM api_keys WHERE provider = 'anthropic';
DELETE FROM usage_cache WHERE provider = 'anthropic';
