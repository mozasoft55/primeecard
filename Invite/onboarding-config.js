import { SUPABASE_CONFIG } from './supabase-config.js';

const projectUrl = SUPABASE_CONFIG.url.replace(/\/+$/, '');

export const ONBOARDING_CONFIG = Object.freeze({
  supabaseUrl: projectUrl,
  publishableKey: SUPABASE_CONFIG.anonKey,
  onboardingEndpoint: `${projectUrl}/functions/v1/onboarding`,
  dashboardEndpoint: `${projectUrl}/functions/v1/customer-dashboard`,
  verifyPaymentEndpoint: `${projectUrl}/functions/v1/verify-payment`,
  turnstileSiteKey: 'SET_CLOUDFLARE_TURNSTILE_SITE_KEY'
});
