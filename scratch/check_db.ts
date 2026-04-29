import { supabase } from './src/integrations/supabase/client';

async function checkTables() {
  console.log("Checking sessions...");
  const { data: s, error: se } = await supabase.from('ai_growth_sessions').select('*').limit(1);
  console.log("Sessions:", s, se);

  console.log("Checking messages...");
  const { data: m, error: me } = await supabase.from('ai_growth_messages').select('*').limit(1);
  console.log("Messages:", m, me);
}

// This won't run directly since it's TS and needs vite context, 
// but I'll just check the file system for SQL migrations.
