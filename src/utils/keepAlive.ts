/**
 * AAR Salon — Supabase Keep-Alive Utility
 * 
 * Keeps the free Supabase project alive by sending a lightweight
 * ping every 3 days. Supabase free-tier pauses after 7 days of
 * inactivity — this ensures the project never goes dormant.
 * 
 * Strategy:
 * - On every app load, checks localStorage for the last ping timestamp
 * - If 3+ days have passed (or never pinged), fires a lightweight DB query
 * - Logs the result silently in the background
 */

import { supabase } from "@/integrations/supabase/client";

const KEEP_ALIVE_KEY = "aar_supabase_last_ping";
const PING_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days in ms

export const initKeepAlive = async () => {
  try {
    const lastPing = localStorage.getItem(KEEP_ALIVE_KEY);
    const now = Date.now();

    const shouldPing =
      !lastPing || now - parseInt(lastPing, 10) >= PING_INTERVAL_MS;

    if (!shouldPing) {
      const nextPing = new Date(parseInt(lastPing!, 10) + PING_INTERVAL_MS);
      console.debug(
        `[KeepAlive] Supabase is active. Next ping scheduled: ${nextPing.toLocaleDateString()}`
      );
      return;
    }

    // Fire a lightweight query — just counts 1 row from a small table
    const { error } = await supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      // Fallback: try a simpler ping via the health endpoint
      console.warn("[KeepAlive] Primary ping failed, trying fallback...", error.message);
      await supabase.from("automation_rules").select("id").limit(1);
    }

    localStorage.setItem(KEEP_ALIVE_KEY, now.toString());
    console.info(
      `[KeepAlive] ✅ Supabase pinged successfully at ${new Date().toLocaleString()}. Next ping in 3 days.`
    );
  } catch (err) {
    // Silent fail — keep-alive should never break the app
    console.warn("[KeepAlive] Could not ping Supabase:", err);
  }
};

/**
 * Force a ping immediately (useful for testing or manual trigger)
 */
export const forceKeepAlivePing = async () => {
  localStorage.removeItem(KEEP_ALIVE_KEY);
  await initKeepAlive();
};

/**
 * Get the status of the keep-alive system
 */
export const getKeepAliveStatus = () => {
  const lastPing = localStorage.getItem(KEEP_ALIVE_KEY);
  if (!lastPing) return { status: "never_pinged", lastPing: null, nextPing: null };

  const lastPingDate = new Date(parseInt(lastPing, 10));
  const nextPingDate = new Date(parseInt(lastPing, 10) + PING_INTERVAL_MS);
  const now = Date.now();
  const isDue = now >= parseInt(lastPing, 10) + PING_INTERVAL_MS;

  return {
    status: isDue ? "due" : "active",
    lastPing: lastPingDate.toLocaleString(),
    nextPing: nextPingDate.toLocaleString(),
    daysUntilNext: Math.max(0, Math.ceil((nextPingDate.getTime() - now) / 86400000)),
  };
};
