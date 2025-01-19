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
    const lines = text.split('\n').map(line => line.trim());
    const result: ParsedResume = {
      skills: [],
      experience: [],
      education: []
    };

    let currentSection = '';
    let currentItem: any = {};

    for (const line of lines) {
      // Skip empty lines
      if (!line) continue;

      // Detect sections
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('skills') || lowerLine.includes('technologies')) {
        currentSection = 'skills';
        continue;
      }
      if (lowerLine.includes('experience') || lowerLine.includes('employment')) {
        currentSection = 'experience';
        continue;
      }
      if (lowerLine.includes('education') || lowerLine.includes('academic')) {
        currentSection = 'education';
        continue;
      }

      // Process line based on section
      switch (currentSection) {
        case 'skills':
          // Split skills by common delimiters
          const skills = line.split(/[,•|]/).map(s => s.trim()).filter(Boolean);
          result.skills.push(...skills);
          break;

        case 'experience':
          if (line.match(/\d{4}/)) { // Line contains a year - likely a new position
            if (currentItem.title) {
              result.experience.push({ ...currentItem });
            }
            currentItem = {
              title: line,
              company: '',
              duration: '',
              description: ''
            };
          } else if (currentItem.title && !currentItem.company) {
            currentItem.company = line;
          } else if (currentItem.title) {
            currentItem.description += line + ' ';
          }
          break;

        case 'education':
          if (line.match(/\d{4}/)) { // Line contains a year - likely a new degree
            if (currentItem.degree) {
              result.education.push({ ...currentItem });
            }
            currentItem = {
              degree: line,
              school: '',
              year: line.match(/\d{4}/)[0]
            };
          } else if (currentItem.degree && !currentItem.school) {
            currentItem.school = line;
          }
          break;
      }
    }

    // Add last items if any
    if (currentSection === 'experience' && currentItem.title) {
      result.experience.push(currentItem);
    } else if (currentSection === 'education' && currentItem.degree) {
      result.education.push(currentItem);
    }

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