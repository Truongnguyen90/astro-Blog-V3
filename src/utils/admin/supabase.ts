/**
 * Supabase Client Configuration
 *
 * This module initializes and exports the Supabase client for the admin dashboard.
 * Environment variables are validated to ensure proper configuration.
 *
 * @module utils/admin/supabase
 */

import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

// Only validate in browser (not during build)
if (typeof window !== 'undefined') {
  if (!supabaseUrl) {
    console.error(
      'Missing PUBLIC_SUPABASE_URL environment variable. ' +
      'Please add it to your .env file.'
    );
  }

  if (!supabaseAnonKey) {
    console.error(
      'Missing PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
      'Please add it to your .env file.'
    );
  }
}

/**
 * Configured Supabase client instance
 *
 * This client provides access to:
 * - Authentication (auth)
 * - Database (from)
 * - Storage (storage)
 * - Real-time subscriptions (realtime)
 *
 * Uses lazy initialization to avoid errors during build time.
 *
 * @example
 * ```typescript
 * import { supabase } from '@/utils/admin/supabase';
 *
 * // Get current session
 * const { data: { session } } = await supabase.auth.getSession();
 *
 * // Query database
 * const { data, error } = await supabase.from('media_meta').select('*');
 *
 * // Upload file
 * const { data, error } = await supabase.storage
 *   .from('media')
 *   .upload('filename.jpg', file);
 * ```
 */
let _supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!_supabaseClient) {
    // Use placeholder values during build if env vars not set
    const url = supabaseUrl || 'https://placeholder.supabase.co';
    const key = supabaseAnonKey || 'placeholder-key';

    _supabaseClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _supabaseClient;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    return client[prop as keyof typeof client];
  },
});

/**
 * Type-safe database types (to be generated later)
 *
 * Generate types with:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
 */
export type Database = {
  public: {
    Tables: {
      media_meta: {
        Row: {
          id: string;
          filename: string;
          url: string;
          size: number;
          mime_type: string;
          uploaded_by: string | null;
          uploaded_at: string;
          alt_text: string | null;
          tags: string[] | null;
        };
        Insert: {
          id?: string;
          filename: string;
          url: string;
          size: number;
          mime_type: string;
          uploaded_by?: string | null;
          uploaded_at?: string;
          alt_text?: string | null;
          tags?: string[] | null;
        };
        Update: {
          id?: string;
          filename?: string;
          url?: string;
          size?: number;
          mime_type?: string;
          uploaded_by?: string | null;
          uploaded_at?: string;
          alt_text?: string | null;
          tags?: string[] | null;
        };
      };
    };
  };
};
