import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, company, reason } = await req.json()

    // Validate required environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables')
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Create access request with proper error handling
    const { error: requestError } = await supabase
      .from('access_requests')
      .insert({
        email,
        company,
        reason,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (requestError) {
      console.error('Error creating access request:', requestError)
      throw new Error('Failed to create access request')
    }

    // Create notification record
    const { error: notificationError } = await supabase
      .from('admin_notifications')
      .insert({
        type: 'access_request',
        data: {
          email,
          company,
          reason,
          timestamp: new Date().toISOString()
        },
        status: 'pending'
      })

    if (notificationError) {
      console.error('Error creating notification:', notificationError)
      // Don't throw - access request was created successfully
    }

    // Trigger notification processing
    const { error: processError } = await supabase
      .rpc('process_pending_notifications')

    if (processError) {
      console.error('Error triggering notification processing:', processError)
      // Don't throw - access request was created successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Access request submitted successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in send-access-request:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        success: false
      }),
      { 
        status: error.status || 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})