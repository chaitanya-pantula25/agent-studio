import { createClient } from '@supabase/supabase-js';

// This will print to your terminal every time the app starts
console.log("--- DEBUG START ---");
console.log("URL FOUND:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "YES" : "NO");
console.log("KEY FOUND:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "YES" : "NO");
console.log("--- DEBUG END ---");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase environment variables are missing!');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);