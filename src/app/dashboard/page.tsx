import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Dashboard from '@/components/Dashboard';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch user's API keys
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', user.id);

  const anthropicAdminKey = apiKeys?.find((k: { provider: string }) => k.provider === 'anthropic-admin');
  const moonshotKey = apiKeys?.find((k: { provider: string }) => k.provider === 'moonshot');
  const openaiKey = apiKeys?.find((k: { provider: string }) => k.provider === 'openai');
  const deepseekKey = apiKeys?.find((k: { provider: string }) => k.provider === 'deepseek');
  const minimaxKey = apiKeys?.find((k: { provider: string }) => k.provider === 'minimax');
  const googleKey = apiKeys?.find((k: { provider: string }) => k.provider === 'google');

  return (
    <Dashboard 
      user={user} 
      hasAnthropicAdminKey={!!anthropicAdminKey}
      hasMoonshotKey={!!moonshotKey}
      hasOpenAIKey={!!openaiKey}
      hasDeepSeekKey={!!deepseekKey}
      hasMiniMaxKey={!!minimaxKey}
      hasGoogleKey={!!googleKey}
    />
  );
}
