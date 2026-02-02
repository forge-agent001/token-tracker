import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the encrypted API key
    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('provider', 'anthropic')
      .single();

    if (!apiKeyData) {
      return NextResponse.json({ error: 'No API key found' }, { status: 404 });
    }

    // Decrypt the API key
    const apiKey = decrypt(apiKeyData.encrypted_key);

    // Fetch usage from Anthropic API
    // Anthropic's usage API requires an admin key and org ID
    // For now, we'll return mock data or fetch what we can
    
    // Try to get usage data from Anthropic
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Anthropic doesn't have a simple token usage endpoint for regular API keys
    // The cost/usage API requires an admin key with org-level access
    // For this demo, we'll return simulated data
    
    // In production, you would use:
    // const response = await fetch(
    //   `https://api.anthropic.com/v1/organizations/{org_id}/cost_report?` +
    //   `start_time=${startDate.toISOString()}&end_time=${endDate.toISOString()}`,
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${apiKey}`,
    //       'anthropic-version': '2023-06-01',
    //     },
    //   }
    // );

    // Simulated data for demo
    const dailyUsage = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        input: Math.floor(Math.random() * 100000),
        output: Math.floor(Math.random() * 50000),
        cost: Math.random() * 10,
      };
    });

    const totalInputTokens = dailyUsage.reduce((sum, d) => sum + d.input, 0);
    const totalOutputTokens = dailyUsage.reduce((sum, d) => sum + d.output, 0);
    const totalCost = dailyUsage.reduce((sum, d) => sum + d.cost, 0);

    return NextResponse.json({
      totalInputTokens,
      totalOutputTokens,
      totalCost,
      dailyUsage,
    });
  } catch (error) {
    console.error('Error fetching Anthropic usage:', error);
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
