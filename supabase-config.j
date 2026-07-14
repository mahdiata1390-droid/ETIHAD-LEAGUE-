// اتصال به Supabase از طریق CDN (بدون نیاز به npm/build) — جایگزین firebase-config.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// این دو مقدار را از Supabase Dashboard > Project Settings > API کپی کنید
export const SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";

// UID حساب مدیر لیگ (از Supabase Dashboard > Authentication > Users کپی کنید)
export const ADMIN_UID = "YOUR_ADMIN_USER_UUID";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
