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

  return (
    <Dashboard 
      user={user} 
      hasAnthropicAdminKey={!!anthropicAdminKey}
      hasMoonshotKey={!!moonshotKey}
    />
  );
}
