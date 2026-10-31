import { createClient } from '@supabase/supabase-js';
let singleton;
export function configured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
export function supabaseBrowser() {
  if (!configured()) return null;
  if (!singleton) singleton = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  return singleton;
}
export const money = value => 'GH₵ ' + Number(value||0).toLocaleString('en-GH',{minimumFractionDigits:2,maximumFractionDigits:2});
export function readableDate(value){if(!value)return '—';return new Date(value).toLocaleDateString('en-GH',{day:'numeric',month:'short',year:'numeric'});}
