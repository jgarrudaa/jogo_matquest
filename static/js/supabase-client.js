(() => {
  const config = window.TRIQUEST_CONFIG;
  if (!config?.supabaseUrl || !config?.supabaseKey || !window.supabase) return;
  window.triquestSupabase = window.supabase.createClient(config.supabaseUrl, config.supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
})();
