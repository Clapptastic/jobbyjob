import { supabase } from './supabase';
import { withRetry } from './networkRetry';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('AI');

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

// Local fallback parser
const localParser = {
  parseText(text: string): ParsedResume {
    const sections = text.split('\n\n');
    const result = {
      skills: [] as string[],
      experience: [] as any[],
      education: [] as any[]
    };

    let currentSection = '';
    let currentItem = null;

    sections.forEach(section => {
      const lines = section.trim().split('\n');
      if (lines[0] === 'SKILLS') {
        result.skills = lines[1].split(', ');
      } else if (lines[0] === 'EXPERIENCE') {
        currentSection = 'experience';
        if (lines.length >= 3) {
          result.experience.push({
            title: lines[1],
            company: lines[2],
            description: lines[3] || '',
            duration: ''
          });
        }
      } else if (lines[0] === 'EDUCATION') {
        currentSection = 'education';
        if (lines.length >= 2) {
          result.education.push({
            degree: lines[1],
            school: lines[2] || '',
            year: lines[1].match(/\d{4}/)?.[0] || ''
          });
        }
      }
    });

    return result;
  }
};

export const ai = {
  async parseResume(text: string): Promise<ParsedResume> {
    try {
      // Get Affinda API key
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

          // Call Affinda API with retries
          return await withRetry(async () => {
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
          }, {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 5000,
            shouldRetry: (error) => {
              return error.message?.includes('rate limit') ||
                     error.message?.includes('timeout');
            }
          });
        } catch (error) {
          log.warn('Affinda parsing failed, using local parser:', error);
        }
      }

      // Use local parser as fallback
      log.info('Using local parser for resume parsing');
      return localParser.parseText(text);

    } catch (error: any) {
      log.error('Resume parsing failed:', error);
      throw error;
    }
  }
};