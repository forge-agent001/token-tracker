import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // During build or when env vars are missing, return a mock
    if (typeof window === 'undefined') {
      return {
        auth: {
          getUser: async () => ({ data: { user: null }, error: null }),
          signInWithPassword: async () => ({ error: new Error('Not configured') }),
          signUp: async () => ({ error: new Error('Not configured') }),
          signOut: async () => ({ error: null }),
          exchangeCodeForSession: async () => ({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
      } as unknown as ReturnType<typeof createBrowserClient>;
    }
    throw new Error('Supabase URL and Anon Key must be provided');
  }

  return createBrowserClient(url, key);
}
