import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log("Checking growth triggers...")

    // 1. Fetch Active Automation Rules
    const { data: rules, error: rulesError } = await supabaseClient
      .from('automation_rules')
      .select('*')
      .eq('is_active', true)

    if (rulesError) throw rulesError

    const results = []

    for (const rule of rules) {
      console.log(`Processing rule: ${rule.name} (${rule.trigger_type})`)
      
      let targets = []

      // 2. Identify Targets based on Trigger Type
      if (rule.trigger_type === 'birthday') {
        const today = new Date().toISOString().split('T')[0]
        const { data } = await supabaseClient
          .from('customers')
          .select('id, full_name, phone, whatsapp_opt_in')
          .eq('whatsapp_opt_in', true)
          // Rough birthday check (needs actual date logic in prod)
          .filter('birthday', 'eq', today)
        targets = data || []
      } 
      
      else if (rule.trigger_type === 'inactivity') {
        const inactivityDays = rule.delay_days || 30
        const thresholdDate = new Date()
        thresholdDate.setDate(thresholdDate.getDate() - inactivityDays)
        const thresholdISO = thresholdDate.toISOString().split('T')[0]

        const { data } = await supabaseClient
          .from('customers')
          .select('id, full_name, phone, whatsapp_opt_in, last_visit_at')
          .eq('whatsapp_opt_in', true)
          .lt('last_visit_at', thresholdISO)
        
        targets = data || []
      }

      // 3. Send Messages (Mock/Log)
      for (const target of targets) {
        // Simple template replacement
        const message = rule.message_template
          .replace('{{name}}', target.full_name)
          .replace('{{date}}', new Date().toLocaleDateString())
          .replace('{{review_link}}', 'https://g.page/aar-salon/review')

        console.log(`Sending ${rule.channel} to ${target.phone}: ${message}`)

        // Log the message
        await supabaseClient.from('messaging_logs').insert({
          customer_id: target.id,
          type: rule.channel,
          content: message,
          status: 'Sent', // In real world, this would be 'Pending' until WhatsApp API responds
          campaign_id: null
        })

        results.push({ customer: target.full_name, rule: rule.name })
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, details: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
