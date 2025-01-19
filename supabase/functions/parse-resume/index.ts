import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedResume {
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error('Invalid or empty resume text provided');
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

    // Process text in chunks to handle large resumes
    const MAX_CHUNK_SIZE = 4000;
    const chunks = text.match(new RegExp(`.{1,${MAX_CHUNK_SIZE}}`, 'gs')) || [text];

    // Process each chunk with retries
    const results = await Promise.all(chunks.map(async (chunk, index) => {
      const maxRetries = 3;
      let lastError;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const completion = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'Parse the resume text into structured data. Return valid JSON with skills (array of strings), experience (array of objects with title, company, duration, description), and education (array of objects with degree, school, year).',
              },
              {
                role: 'user',
                content: chunk,
              },
            ],
            response_format: { type: "json_object" }
          });

          const content = completion.data.choices[0].message?.content;
          if (!content) {
            throw new Error(`No content returned from OpenAI for chunk ${index + 1}`);
          }

          return JSON.parse(content) as Partial<ParsedResume>;
        } catch (error) {
          lastError = error;
          if (attempt === maxRetries - 1) throw error;
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }

      throw lastError;
    }));

    // Merge results
    const parsedResume = results.reduce<ParsedResume>(
      (acc, curr) => ({
        skills: [...new Set([...(acc.skills || []), ...(curr.skills || [])])],
        experience: [...(acc.experience || []), ...(curr.experience || [])],
        education: [...(acc.education || []), ...(curr.education || [])]
      }),
      { skills: [], experience: [], education: [] }
    );

    return new Response(
      JSON.stringify(parsedResume),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Resume parsing error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to parse resume',
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