import { createClient } from '@supabase/supabase-js'

export function createServiceRoleClient() {
  const config = useRuntimeConfig()
  const supabaseUrl = process.env.SUPABASE_URL!
  const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY!

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase service role credentials')
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
