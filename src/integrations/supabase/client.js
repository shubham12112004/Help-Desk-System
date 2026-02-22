import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("❌ Supabase ENV missing. Check .env file and restart server.");
}

// Session Configuration:
// - persistSession: true = Allow OAuth callbacks to work properly
// - autoRefreshToken: true = Keep session alive during single browser session
// - storage: sessionStorage = Sessions cleared when browser/tab closes (not localStorage)
// - Manual clearing in useAuth on normal app start (not OAuth callbacks)
// Result: OAuth works, but sessions cleared when tab/browser closes or app restarts
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // Enable for OAuth to work
    autoRefreshToken: true, // Keep session alive during browser session
    detectSessionInUrl: true,
    flowType: "pkce",
    storage: window.sessionStorage, // Use sessionStorage (cleared on tab/browser close)
    storageKey: `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`,
  },
  global: {
    headers: {
      'x-client-info': 'help-desk-system',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});