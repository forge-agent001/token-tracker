import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Dashboard from '@/components/Dashboard';

export default async function DashboardPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch user's API keys
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', user.id);

  const anthropicKey = apiKeys?.find(k => k.provider === 'anthropic');
  const moonshotKey = apiKeys?.find(k => k.provider === 'moonshot');

  return (
    <Dashboard 
      user={user} 
      hasAnthropicKey={!!anthropicKey}
      hasMoonshotKey={!!moonshotKey}
    />
  );
}
