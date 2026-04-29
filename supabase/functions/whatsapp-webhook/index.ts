import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Handle WhatsApp Webhook Verification (GET request from Meta)
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    // Get the configured verify token from business_settings table
    const { data: settings } = await supabase
      .from('business_settings')
      .select('setting_value')
      .eq('setting_key', 'WHATSAPP_WEBHOOK_SECRET')
      .single()

    if (mode === 'subscribe' && token === settings?.setting_value) {
      console.log('WEBHOOK_VERIFIED')
      return new Response(challenge, { status: 200 })
    }
    return new Response('Verification failed', { status: 403 })
  }

  // Handle Inbound Messages (POST request from Meta)
  try {
    const payload = await req.json()
    console.log('Received WhatsApp payload:', JSON.stringify(payload, null, 2))

    // WhatsApp payload structure: entry[] -> changes[] -> value -> messages[]
    const entry = payload.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const message = value?.messages?.[0]

    if (message) {
      const fromPhone = message.from // This is the sender's phone number
      const messageText = message.text?.body || `[Media/Other: ${message.type}]`
      
      // 1. Find existing customer by phone
      let { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', fromPhone)
        .single()

      // 2. If customer doesn't exist, create a basic record
      if (!customer) {
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert({ 
            full_name: `WhatsApp: ${fromPhone}`, 
            phone: fromPhone,
            status: 'Active'
          })
          .select('id')
          .single()
        
        if (!createError) {
          customer = newCustomer
        } else {
          console.error('Error creating customer from webhook:', createError)
        }
      }

      // 3. Log the inbound message in the unified messaging hub
      if (customer) {
        const { error: logError } = await supabase.from('messaging_logs').insert({
          customer_id: customer.id,
          type: 'WhatsApp',
          content: messageText,
          direction: 'Inbound',
          status: 'Received'
        })
        
        if (logError) {
          console.error('Error logging inbound message:', logError)
        } else {
          console.log(`Successfully logged inbound message from ${fromPhone}`)
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })
  } catch (error) {
    console.error('Error processing webhook payload:', error)
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    })
  }
})
