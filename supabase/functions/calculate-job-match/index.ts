import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { resume, jobDescription } = await req.json();

    if (!resume || !jobDescription) {
      throw new Error('Missing required parameters');
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAIApi(
      new Configuration({
        apiKey: openaiKey,
      })
    );

    // Implement retry logic
    const maxRetries = 3;
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const completion = await openai.createChatCompletion({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Analyze the match between a resume and job description. Return a JSON object with a match score (0-100) and reasons for the score.',
            },
            {
              role: 'user',
              content: `Resume: ${JSON.stringify(resume)}\n\nJob Description: ${jobDescription}`,
            },
          ],
          response_format: { type: "json_object" }
        });

        const content = completion.data.choices[0].message?.content;
        if (!content) {
          throw new Error('No content returned from OpenAI');
        }

        return new Response(content, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries - 1) throw error;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError;
  } catch (error) {
    console.error('Job matching error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to calculate job match',
        details: error.toString(),
        timestamp: new Date().toISOString()
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});