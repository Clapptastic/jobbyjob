import { z } from 'zod';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('Validation');

// Common validation schemas
export const schemas = {
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  
  jobPreferences: z.object({
    keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
    zipCode: z.string().regex(/^\d{5}$/, 'Please enter a valid ZIP code').optional(),
    radius: z.number().min(0).max(100).optional(),
    remote: z.boolean()
  }),

  apiKey: z.object({
    provider: z.enum(['openai', 'anthropic', 'cohere', 'google']),
    key: z.string().min(1, 'API key is required')
  }),

  accessRequest: z.object({
    email: z.string().email('Please enter a valid email address'),
    company: z.string().min(2, 'Company name is required'),
    reason: z.string().min(10, 'Please provide a detailed reason')
  })
};

// Generic validation function
export async function validateInput<T>(
  schema: z.ZodType<T>,
  data: unknown,
  options: {
    onError?: (error: z.ZodError) => void;
    onSuccess?: (data: T) => void;
  } = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const validatedData = await schema.parseAsync(data);
    options.onSuccess?.(validatedData);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => e.message).join('. ');
      log.error('Validation error:', error);
      options.onError?.(error);
      toast.error(message);
      return { success: false, error: message };
    }
    
    log.error('Unexpected validation error:', error);
    toast.error('An unexpected error occurred');
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Reasonable length limit
}

// File validation
export function validateFile(file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
}): { valid: boolean; error?: string } {
  const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB default
  const allowedTypes = options.allowedTypes || ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`
    };
  }

  return { valid: true };
}