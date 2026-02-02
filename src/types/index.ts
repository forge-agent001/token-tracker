export type Provider = 'anthropic' | 'anthropic-admin' | 'moonshot';

export interface ApiKey {
  id: string;
  user_id: string;
  provider: Provider;
  encrypted_key: string;
  created_at: string;
  updated_at: string;
}

export interface UsageCache {
  id: string;
  user_id: string;
  provider: Provider;
  data: AnthropicUsage | MoonshotUsage;
  fetched_at: string;
}

// Anthropic API Types
export interface AnthropicUsage {
  org_id: string;
  usage: {
    date: string;
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
  }[];
}

// Moonshot API Types
export interface MoonshotBalance {
  currency: string;
  total_balance: string;
  granted_balance: string;
  topped_up_balance: string;
}

export interface MoonshotUsage {
  balance: MoonshotBalance;
  // Moonshot doesn't provide detailed token usage via API
  // Only balance information is available
}

// UI Types
export interface DashboardStats {
  anthropic: {
    isConnected: boolean;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    lastUpdated?: string;
  };
  moonshot: {
    isConnected: boolean;
    balance: string;
    currency: string;
    lastUpdated?: string;
  };
}
