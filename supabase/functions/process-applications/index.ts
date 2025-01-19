import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  try {
    // Initialize clients
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const openai = new OpenAIApi(
      new Configuration({
        apiKey: Deno.env.get('OPENAI_API_KEY'),
      })
    )

    // Get pending jobs from queue
    const { data: jobs } = await supabaseClient
      .from('job_sync_queue')
      .select('*')
      .eq('status', 'pending')
      .limit(10)

    if (!jobs?.length) {
      return new Response(
        JSON.stringify({ message: 'No jobs to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process each job
    for (const job of jobs) {
      try {
        // Get user's resume and preferences
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', job.user_id)
          .single()

        if (!profile?.resume_content) continue

        // Get automation config
        const { data: config } = await supabaseClient
          .from('automation_config')
          .select('config')
          .eq('user_id', job.user_id)
          .single()

        // Process application
        const { data: jobData } = await supabaseClient
          .from('jobs')
          .select('*')
          .eq('id', job.job_id)
          .single()

        // Generate application materials
        const [coverLetter, optimizedResume] = await Promise.all([
          openai.createChatCompletion({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'Generate a professional cover letter based on the resume and job description.',
              },
              {
                role: 'user',
                content: `Resume: ${profile.resume_content}\n\nJob: ${JSON.stringify(jobData)}`,
              },
            ],
          }),
          openai.createChatCompletion({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'Optimize the resume content for the specific job.',
              },
              {
                role: 'user',
                content: `Resume: ${profile.resume_content}\n\nJob: ${JSON.stringify(jobData)}`,
              },
            ],
          }),
        ])

        // Submit application
        await supabaseClient
          .from('applications')
          .insert({
            user_id: job.user_id,
            job_id: job.job_id,
            status: 'applied',
            customized_resume: optimizedResume.data.choices[0].message?.content,
            notes: coverLetter.data.choices[0].message?.content,
          })

        // Update job status
        await supabaseClient
          .from('job_sync_queue')
          .update({ status: 'completed', processed_at: new Date().toISOString() })
          .eq('id', job.id)

      } catch (error) {
        console.error('Error processing job:', error)
        await supabaseClient
          .from('job_sync_queue')
          .update({ 
            status: 'failed',
            error: error.message,
            processed_at: new Date().toISOString()
          })
          .eq('id', job.id)
      }
    }

    return new Response(
      JSON.stringify({ message: 'Jobs processed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})