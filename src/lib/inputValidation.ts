import { z } from 'zod';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('InputValidation');

// API key format validation
const API_KEY_FORMATS = {
  openai: (key: string) => key.startsWith('sk-'),
  anthropic: (key: string) => key.startsWith('sk-ant-'),
  google: (key: string) => key.startsWith('AI'),
  cohere: (key: string) => key.length >= 32
};

// Input validation rules
export const rules = {
  // Email validation with common patterns
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // URL validation
  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // API key validation
  apiKey: (key: string, provider: keyof typeof API_KEY_FORMATS): boolean => {
    const validateFormat = API_KEY_FORMATS[provider];
    return validateFormat ? validateFormat(key) : true;
  },

  // ZIP code validation
  zipCode: (zip: string): boolean => {
    return /^\d{5}(-\d{4})?$/.test(zip);
  },

  // Phone number validation
  phone: (phone: string): boolean => {
    return /^\+?[\d\s-()]{10,}$/.test(phone);
  }
};

// Input sanitization
export const sanitize = {
  // Remove potentially dangerous characters
  text: (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, '')
      .slice(0, 1000);
  },

  // Sanitize email addresses
  email: (email: string): string => {
    return email.trim().toLowerCase();
  },

  // Sanitize URLs
  url: (url: string): string => {
    try {
      const parsed = new URL(url);
      return parsed.toString();
    } catch {
      return '';
    }
  },

  // Sanitize phone numbers
  phone: (phone: string): string => {
    return phone.replace(/[^\d+]/g, '');
  }
};

// Error handling
export const handleInputError = (error: any, context: string): void => {
  log.error(`Input validation error in ${context}:`, error);

  if (error instanceof z.ZodError) {
    // Format Zod validation errors
    const messages = error.errors.map(e => e.message);
    toast.error(messages.join('. '));
  } else {
    // Handle other types of errors
    toast.error(error.message || 'Invalid input. Please check your entries.');
  }
};

// Input validation with error handling
export async function validateInput<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    handleInputError(error, context);
    return { 
      success: false, 
      error: error instanceof z.ZodError 
        ? error.errors.map(e => e.message).join('. ')
        : 'Invalid input'
    };
  }
}

// Rate limiting for API calls
const rateLimits = new Map<string, number>();

export function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now();
  const lastCall = rateLimits.get(key) || 0;
  
  if (now - lastCall < limit) {
    return false;
  }
  
  rateLimits.set(key, now);
  return true;
}