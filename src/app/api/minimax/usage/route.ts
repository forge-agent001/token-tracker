import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has MiniMax API key
    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', 'minimax')
      .single();

    if (!apiKeyData) {
      return NextResponse.json({ error: 'No API key found' }, { status: 404 });
    }

    // MiniMax does not provide a public API for balance/usage queries
    // Users need to check their balance on the MiniMax platform dashboard
    return NextResponse.json({
      unavailable: true,
      message: 'MiniMax does not provide a public balance API. Please check your balance at https://platform.minimax.io/',
      consoleUrl: 'https://platform.minimax.io/',
    });
  } catch (error) {
    console.error('Error in MiniMax usage route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
