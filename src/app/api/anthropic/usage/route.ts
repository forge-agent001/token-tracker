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
      // Fetch usage report from Anthropic Admin API
      // Note: cost_report endpoint doesn't exist; use usage_report/messages
      const usageResponse = await fetch(
        `https://api.anthropic.com/v1/organizations/usage_report/messages?` +
        `starting_at=${startDate.toISOString()}&` +
        `ending_at=${endDate.toISOString()}`,
        {
          headers: {
            'X-Api-Key': adminKey,
            'anthropic-version': '2023-06-01',
          },
        }
      );

      if (usageResponse.ok) {
        const usageData = await usageResponse.json();

        // Aggregate data by date
        const dailyMap = new Map();
        let totalInputTokens = 0;
        let totalOutputTokens = 0;

        for (const dayEntry of usageData.data || []) {
          const date = dayEntry.starting_at?.split('T')[0];
          if (!date) continue;

          // Sum up all results for this day
          let dayInput = 0;
          let dayOutput = 0;

          for (const result of dayEntry.results || []) {
            // Cache reads count as input tokens
            dayInput += (result.uncached_input_tokens || 0) +
                        (result.cache_read_input_tokens || 0) +
                        (result.cache_creation?.ephemeral_1h_input_tokens || 0) +
                        (result.cache_creation?.ephemeral_5m_input_tokens || 0);
            dayOutput += result.output_tokens || 0;
          }

          // Estimate daily cost (Claude 3.5 Sonnet pricing: $3/M input, $15/M output)
          const dayCost = (dayInput / 1000000) * 3 + (dayOutput / 1000000) * 15;
          dailyMap.set(date, { date, input: dayInput, output: dayOutput, cost: dayCost });
          totalInputTokens += dayInput;
          totalOutputTokens += dayOutput;
        }

        const dailyUsage = Array.from(dailyMap.values()).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Total cost from daily entries
        const totalCost = dailyUsage.reduce((sum, day) => sum + day.cost, 0);

        return NextResponse.json({
          totalInputTokens,
          totalOutputTokens,
          totalCost,
          dailyUsage,
          isRealData: true,
        });
      } else {
        const errorText = await usageResponse.text();
        console.error('Anthropic Admin API error:', usageResponse.status, errorText);
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
