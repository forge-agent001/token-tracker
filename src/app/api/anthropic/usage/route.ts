import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the admin API key
    const { data: adminKeyData } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('provider', 'anthropic-admin')
      .single();

    // If no admin key, return message
    if (!adminKeyData) {
      return NextResponse.json({
        requiresAdminKey: true,
        message: 'Add an Anthropic Admin API key to see real usage data.',
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCost: 0,
        dailyUsage: [],
      });
    }

    // Fetch real usage data
    const adminKey = decrypt(adminKeyData.encrypted_key);

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    try {
      // Fetch cost report from Anthropic Admin API
      const costResponse = await fetch(
        `https://api.anthropic.com/v1/organizations/cost_report?` +
        `starting_at=${startDate.toISOString()}&` +
        `ending_at=${endDate.toISOString()}`,
        {
          headers: {
            'X-Api-Key': adminKey,
            'anthropic-version': '2023-06-01',
          },
        }
      );

      if (costResponse.ok) {
        const costData = await costResponse.json();

        // Aggregate data by date
        const dailyMap = new Map();
        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        let totalCost = 0;

        for (const entry of costData.data || []) {
          const date = entry.starting_at?.split('T')[0];
          if (!date) continue;

          if (!dailyMap.has(date)) {
            dailyMap.set(date, { date, input: 0, output: 0, cost: 0 });
          }

          const day = dailyMap.get(date);
          day.input += entry.input_tokens || 0;
          day.output += entry.output_tokens || 0;
          day.cost += entry.cost_usd || 0;

          totalInputTokens += entry.input_tokens || 0;
          totalOutputTokens += entry.output_tokens || 0;
          totalCost += entry.cost_usd || 0;
        }

        const dailyUsage = Array.from(dailyMap.values()).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return NextResponse.json({
          totalInputTokens,
          totalOutputTokens,
          totalCost,
          dailyUsage,
          isRealData: true,
        });
      } else {
        const errorText = await costResponse.text();
        console.error('Anthropic Admin API error:', costResponse.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching from Anthropic Admin API:', error);
    }

    return NextResponse.json({
      error: 'Failed to fetch usage from Admin API',
      requiresAdminKey: true,
      adminKeyError: true,
    }, { status: 500 });
  } catch (error) {
    console.error('Error fetching Anthropic usage:', error);
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
