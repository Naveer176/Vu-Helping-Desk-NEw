/* ============================================================
   Apni Supabase project ki details yahan daalein.
   Dashboard > Project Settings > API mein milengi.
   ============================================================ */
const SUPABASE_URL = 'https://inulhhwbooafkdfukbqp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludWxoaHdib29hZmtkZnVrYnFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzk0NDEsImV4cCI6MjEwMjkxNTQ0MX0._YURh-eu5zvnLqWq9ooj1qFlfZ5KibCa-gzFS1PcPi4 ';

const sb = (typeof window.supabase !== 'undefined')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
