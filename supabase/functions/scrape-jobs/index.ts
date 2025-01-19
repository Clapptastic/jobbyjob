import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobPreferences {
  keywords: string[]
  zipCode?: string
  radius?: number
  remote: boolean
}

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  description: string
  requirements: string[]
  posted: string
  source: string
  sourceUrl: string
  active: boolean
  matchScore?: number
  matchReasons?: string[]
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    )

    // Get user from auth
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { preferences, resumeContent } = await req.json()

    // Initialize job sites to scrape
    const jobSites = [
      {
        name: 'LinkedIn',
        baseUrl: 'https://www.linkedin.com/jobs/search',
        buildUrl: (prefs: JobPreferences) => {
          const url = new URL('https://www.linkedin.com/jobs/search')
          url.searchParams.set('keywords', prefs.keywords.join(' '))
          if (prefs.zipCode) {
            url.searchParams.set('location', prefs.zipCode)
          }
          if (prefs.remote) {
            url.searchParams.set('f_WT', '2')
          }
          return url.toString()
        },
      },
      {
        name: 'Indeed',
        baseUrl: 'https://www.indeed.com/jobs',
        buildUrl: (prefs: JobPreferences) => {
          const url = new URL('https://www.indeed.com/jobs')
          url.searchParams.set('q', prefs.keywords.join(' '))
          if (prefs.zipCode) {
            url.searchParams.set('l', prefs.zipCode)
          }
          if (prefs.remote) {
            url.searchParams.set('remotejob', '032b3046-06a3-4876-8dfd-474eb5e7ed11')
          }
          return url.toString()
        },
      },
    ]

    // Initialize OpenAI for job matching
    const openai = new OpenAIApi(
      new Configuration({
        apiKey: Deno.env.get('OPENAI_API_KEY'),
      })
    )

    const jobs: Job[] = []

    // Scrape each job site
    for (const site of jobSites) {
      try {
        const url = site.buildUrl(preferences)
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        })

        const html = await response.text()
        const doc = new DOMParser().parseFromString(html, 'text/html')

        if (!doc) continue

        // Extract jobs based on site-specific selectors
        const jobElements = site.name === 'LinkedIn' 
          ? doc.querySelectorAll('.job-card-container')
          : doc.querySelectorAll('.job_seen_beacon')

        for (const element of jobElements) {
          const job: Job = {
            id: crypto.randomUUID(),
            title: element.querySelector(site.name === 'LinkedIn' ? '.job-card-title' : '.jobTitle')?.textContent?.trim() ?? '',
            company: element.querySelector(site.name === 'LinkedIn' ? '.job-card-company' : '.companyName')?.textContent?.trim() ?? '',
            location: element.querySelector(site.name === 'LinkedIn' ? '.job-card-location' : '.companyLocation')?.textContent?.trim() ?? '',
            type: 'full-time',
            description: element.querySelector(site.name === 'LinkedIn' ? '.job-card-description' : '.job-snippet')?.textContent?.trim() ?? '',
            requirements: [],
            posted: new Date().toISOString(),
            source: site.name,
            sourceUrl: element.querySelector('a')?.getAttribute('href') ?? '',
            active: true,
          }

          // Use OpenAI to analyze job match
          if (resumeContent) {
            const completion = await openai.createChatCompletion({
              model: 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: 'Analyze the match between a job posting and a candidate\'s resume. Return a JSON object with a match score (0-100) and reasons for the score.',
                },
                {
                  role: 'user',
                  content: `Resume: ${resumeContent}\n\nJob: ${JSON.stringify(job)}`,
                },
              ],
            })

            const analysis = JSON.parse(completion.data.choices[0].message?.content ?? '{}')
            job.matchScore = analysis.score
            job.matchReasons = analysis.reasons
          }

          jobs.push(job)
        }
      } catch (error) {
        console.error(`Error scraping ${site.name}:`, error)
      }
    }

    // Sort jobs by match score
    const sortedJobs = jobs.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))

    return new Response(
      JSON.stringify(sortedJobs),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})