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
      .eq('provider', 'moonshot')
      .single();

    if (!apiKeyData) {
      return NextResponse.json({ error: 'No API key found' }, { status: 404 });
    }

    // Decrypt the API key
    const apiKey = decrypt(apiKeyData.encrypted_key);

    // Fetch balance from Moonshot API (global endpoint)
    const response = await fetch('https://api.moonshot.ai/v1/users/me/balance', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Moonshot API error:', response.status, errorData);
      return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
    }

    const data = await response.json();

    return NextResponse.json({
      balance: data.data?.available_balance ?? '0',
      cashBalance: data.data?.cash_balance,
      voucherBalance: data.data?.voucher_balance,
      currency: 'USD',
    });
  } catch (error) {
    console.error('Error fetching Moonshot usage:', error);
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
