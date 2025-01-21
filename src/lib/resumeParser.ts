import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import logger from './logger';
import axios from 'axios';

const log = logger('ResumeParser');

const OPEN_RESUME_URL = process.env.NODE_ENV === 'development' 
  ? 'http://open-resume:3000'
  : process.env.VITE_OPEN_RESUME_URL;

export interface ParsedResume {
  basics: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    summary?: string;
  };
  work: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    area: string;
    studyType: string;
    startDate: string;
    endDate?: string;
  }>;
  skills: Array<{
    name: string;
    level?: string;
    keywords?: string[];
  }>;
}

export class ResumeParserService {
  private static instance: ResumeParserService;

  private constructor() {}

  public static getInstance(): ResumeParserService {
    if (!ResumeParserService.instance) {
      ResumeParserService.instance = new ResumeParserService();
    }
    return ResumeParserService.instance;
  }

  async parseResume(file: File): Promise<ParsedResume> {
    try {
      logger.info('Sending resume to OpenResume parser');
      
      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post(`${OPEN_RESUME_URL}/api/parse`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      logger.info('Resume parsed successfully');
      return response.data;
    } catch (error) {
      logger.error('Failed to parse resume:', error);
      throw new Error('Failed to parse resume. Please try again.');
    }
  }

  async validateResume(parsedResume: ParsedResume): Promise<boolean> {
    try {
      logger.info('Validating parsed resume');
      
      const response = await axios.post(`${OPEN_RESUME_URL}/api/validate`, parsedResume);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      logger.info('Resume validation successful');
      return response.data.valid;
    } catch (error) {
      logger.error('Resume validation failed:', error);
      throw new Error('Failed to validate resume. Please check the format.');
    }
  }

  async generateATS(parsedResume: ParsedResume, jobDescription: string): Promise<string> {
    try {
      logger.info('Generating ATS-friendly version');
      
      const response = await axios.post(`${OPEN_RESUME_URL}/api/optimize`, {
        resume: parsedResume,
        jobDescription
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      logger.info('ATS version generated successfully');
      return response.data.optimizedResume;
    } catch (error) {
      logger.error('Failed to generate ATS version:', error);
      throw new Error('Failed to generate ATS version. Please try again.');
    }
  }
}