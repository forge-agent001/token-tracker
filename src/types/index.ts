export type Provider = 'anthropic-admin' | 'moonshot' | 'openai' | 'deepseek' | 'minimax' | 'google';

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

// OpenAI API Types
export interface OpenAIUsage {
  total_usage: number; // in cents
  daily_usage: {
    date: string;
    usage: number; // in cents
  }[];
}

export interface OpenAICredits {
  total_granted: number;
  total_used: number;
  total_available: number;
}

// DeepSeek API Types
export interface DeepSeekBalance {
  balance: string;
  currency: string;
}

// MiniMax API Types
export interface MiniMaxBalance {
  // MiniMax doesn't provide a public balance API
  // This is a placeholder for future implementation
  unavailable: true;
  message: string;
}

// Google/Gemini API Types
export interface GoogleUsage {
  // Google Cloud billing requires complex setup
  // This is a placeholder directing to Cloud Console
  consoleUrl: string;
  message: string;
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
  openai: {
    isConnected: boolean;
    totalUsed: number;
    totalGranted: number;
    totalAvailable: number;
    lastUpdated?: string;
  };
  deepseek: {
    isConnected: boolean;
    balance: string;
    currency: string;
    lastUpdated?: string;
  };
  minimax: {
    isConnected: boolean;
    unavailable: boolean;
    message: string;
  };
  google: {
    isConnected: boolean;
    consoleUrl: string;
    message: string;
  };
}
