import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

function loadSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      '\n╔═══════════════════════════════════════════════════════╗\n' +
      '║  FATAL: Supabase configuration is missing            ║\n' +
      '╚═══════════════════════════════════════════════════════╝\n\n' +
      '  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.\n' +
      '  Copy server/.env.example to server/.env and fill in the values.\n'
    );
    process.exit(1);
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabase = loadSupabaseClient();
