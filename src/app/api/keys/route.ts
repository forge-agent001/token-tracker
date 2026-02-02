import { createClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/encryption';
import { NextRequest, NextResponse } from 'next/server';

// Allowed providers - strict validation
const ALLOWED_PROVIDERS = ['anthropic-admin', 'moonshot'] as const;
type Provider = typeof ALLOWED_PROVIDERS[number];

// Basic API key format validation
function isValidApiKeyFormat(provider: Provider, key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  if (key.length < 20 || key.length > 200) return false;

  // Basic format checks (not exhaustive, but catches obvious issues)
  if (provider === 'anthropic-admin') {
    // Admin keys typically start with sk-ant-admin- or similar, but accept any sk-ant- or sk- prefix
    return key.startsWith('sk-ant-') || key.startsWith('sk-');
  }
  if (provider === 'moonshot') {
    return key.startsWith('sk-');
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { provider, apiKey } = body;

    // Strict provider validation
    if (!provider || !ALLOWED_PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 400 });
    }

    // Validate API key format
    if (!isValidApiKeyFormat(provider as Provider, apiKey)) {
      return NextResponse.json({ error: 'Invalid API key format' }, { status: 400 });
    }

    // Encrypt the API key
    const encryptedKey = encrypt(apiKey);

    // Upsert the API key
    const { error } = await supabase
      .from('api_keys')
      .upsert({
        user_id: user.id,
        provider,
        encrypted_key: encryptedKey,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) {
      console.error('Error saving API key:', error);
      return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in keys API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    // Strict provider validation
    if (!provider || !ALLOWED_PROVIDERS.includes(provider as Provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider);

    if (error) {
      console.error('Error deleting API key:', error);
      return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in keys API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
