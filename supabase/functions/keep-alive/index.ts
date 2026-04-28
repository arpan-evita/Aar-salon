/**
 * AAR Salon — Supabase Edge Function: Keep-Alive
 * 
 * This Edge Function can be called by an external cron service
 * (like cron-job.org or UptimeRobot) every 3 days to keep the
 * Supabase project alive on the free tier.
 * 
 * Endpoint URL (after deployment):
 * https://ywtmtmpcyfvraxnyayyg.supabase.co/functions/v1/keep-alive
 * 
 * Deploy with:
 * supabase functions deploy keep-alive
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Lightweight ping — count customers (reads 0 bytes of actual data)
    const { count, error } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    const timestamp = new Date().toISOString();
    const response = {
      status: "alive",
      message: "AAR Salon Supabase project is active ✅",
      timestamp,
      ping_result: {
        customers_count: count ?? 0,
        database: "responsive",
      },
    };

    console.log(`[KeepAlive] Pinged at ${timestamp}. Customers: ${count}`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("[KeepAlive] Error:", err);
    return new Response(
      JSON.stringify({ status: "error", message: String(err) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
