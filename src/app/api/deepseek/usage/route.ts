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
      .eq('provider', 'deepseek')
      .single();

    if (!apiKeyData) {
      return NextResponse.json({ error: 'No API key found' }, { status: 404 });
    }

    // Decrypt the API key
    const apiKey = decrypt(apiKeyData.encrypted_key);

    // Fetch balance from DeepSeek API
    const response = await fetch('https://api.deepseek.com/user/balance', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', response.status, errorData);
      return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
    }

    const data = await response.json();

    // DeepSeek returns balance info in the response
    return NextResponse.json({
      balance: data.balance || '0',
      currency: data.currency || 'USD',
      total_balance: data.total_balance,
      granted_balance: data.granted_balance,
      topped_up_balance: data.topped_up_balance,
    });
  } catch (error) {
    console.error('Error fetching DeepSeek usage:', error);
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
