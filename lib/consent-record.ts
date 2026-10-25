import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Records the explicit consent (UK/EU GDPR Art. 9(2)(a)) a user gave on the
// sign-in page to the processing of sensitive, health-related information.
// Kept as the FIRST time it was given; withdrawing it = deleting the account.
// Best-effort and separate from the login itself (needs migration 074).
export async function recordSensitiveDataConsent(admin: SupabaseClient, userId: string): Promise<void> {
  const { error } = await admin.from('users')
    .update({ sensitive_data_consent_at: new Date().toISOString() })
    .eq('id', userId)
    .is('sensitive_data_consent_at', null)
  if (error) logger.error('consent: could not record sensitive-data consent', { userId, error: error.message })
}
