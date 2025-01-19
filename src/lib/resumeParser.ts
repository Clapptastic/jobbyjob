import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('ResumeParser');

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

export const resumeParser = {
  async parse(text: string): Promise<ParsedResume> {
    try {
      // First try Affinda
      const { data: affindaKey, error: affindaError } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('provider', 'affinda')
        .eq('is_active', true)
        .single();

      if (!affindaError && affindaKey?.key_value) {
        try {
          log.info('Using Affinda for resume parsing');
          
          // Create FormData with file
          const formData = new FormData();
          formData.append('file', new Blob([text], { type: 'text/plain' }));
          formData.append('wait', 'true');

          // Call Affinda API
          const response = await fetch('https://api.affinda.com/v3/resumes', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${affindaKey.key_value}`
            },
            body: formData
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Affinda API error');
          }

          const data = await response.json();
          
          // Transform Affinda response to our format
          return {
            skills: data.data.skills?.map((s: any) => s.name) || [],
            experience: data.data.workExperience?.map((exp: any) => ({
              title: exp.jobTitle || '',
              company: exp.organization || '',
              duration: `${exp.startDate || ''} - ${exp.endDate || ''}`,
              description: exp.jobDescription || ''
            })) || [],
            education: data.data.education?.map((edu: any) => ({
              degree: edu.accreditation?.education || '',
              school: edu.organization || '',
              year: edu.dates?.completionDate?.split('-')[0] || ''
            })) || []
          };
        } catch (error) {
          log.warn('Affinda parsing failed, falling back to OpenAI:', error);
        }
      }

      // Fallback to OpenAI
      log.info('Using OpenAI for resume parsing');
      
      const { data: openaiKey, error: openaiError } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('provider', 'openai')
        .eq('is_active', true)
        .single();

      if (openaiError || !openaiKey?.key_value) {
        throw new Error('No resume parsing service configured. Please configure either Affinda or OpenAI API key.');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey.key_value}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Parse the resume text into structured data. Return valid JSON with skills (array of strings), experience (array of objects with title, company, duration, description), and education (array of objects with degree, school, year).'
            },
            {
              role: 'user',
              content: text
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error: any) {
      log.error('Resume parsing failed:', error);
      throw error;
    }
  }
};