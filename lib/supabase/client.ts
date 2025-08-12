import { createClient } from "@supabase/supabase-js"

export const isSupabaseConfigured =
  typeof process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY === "string" &&
  process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance && isSupabaseConfigured) {
    supabaseInstance = createClient(
      process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseInstance
}

export const supabase = getSupabaseClient()
