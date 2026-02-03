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

    // Get the encrypted API key
    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('provider', 'openai')
      .single();

    if (!apiKeyData) {
      return NextResponse.json({ error: 'No API key found' }, { status: 404 });
    }

    // Decrypt the API key
    const apiKey = decrypt(apiKeyData.encrypted_key);

    // Fetch credit grants from OpenAI API
    const creditsResponse = await fetch('https://api.openai.com/dashboard/billing/credit_grants', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    let credits = {
      total_granted: 0,
      total_used: 0,
      total_available: 0,
    };

    if (creditsResponse.ok) {
      const creditsData = await creditsResponse.json();
      credits = {
        total_granted: creditsData.total_granted || 0,
        total_used: creditsData.total_used || 0,
        total_available: creditsData.total_available || 0,
      };
    }

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Fetch usage data from OpenAI API
    const usageResponse = await fetch(
      `https://api.openai.com/v1/usage?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let totalUsage = 0;
    const dailyUsage: { date: string; usage: number }[] = [];

    if (usageResponse.ok) {
      const usageData = await usageResponse.json();
      
      // Aggregate usage by date
      const usageMap = new Map<string, number>();
      
      for (const item of usageData.data || []) {
        const date = item.snapshot_id?.split('@')[0] || item.timestamp?.split('T')[0];
        if (date) {
          const current = usageMap.get(date) || 0;
          // Usage is in cents
          usageMap.set(date, current + (item.usage || 0));
          totalUsage += item.usage || 0;
        }
      }

      // Convert map to array and sort by date
      for (const [date, usage] of usageMap.entries()) {
        dailyUsage.push({ date, usage });
      }
      dailyUsage.sort((a, b) => a.date.localeCompare(b.date));
    }

    return NextResponse.json({
      total_granted: credits.total_granted,
      total_used: credits.total_used,
      total_available: credits.total_available,
      total_usage: totalUsage,
      daily_usage: dailyUsage,
    });
  } catch (error) {
    console.error('Error fetching OpenAI usage:', error);
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
