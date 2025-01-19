import { z } from 'zod';
import { toast } from 'react-hot-toast';
import logger from './logger';

const log = logger('APIValidation');

// API key format validation schemas
const apiKeySchemas = {
  openai: z.string()
    .min(1, 'OpenAI API key is required')
    .regex(/^sk-/, 'OpenAI API key must start with sk-'),
  
  anthropic: z.string()
    .min(1, 'Anthropic API key is required')
    .regex(/^sk-ant-/, 'Anthropic API key must start with sk-ant-'),
  
  google: z.string()
    .min(1, 'Google AI API key is required')
    .regex(/^AI/, 'Google AI API key must start with AI'),
  
  cohere: z.string()
    .min(32, 'Cohere API key must be at least 32 characters')
};

// API configuration validation schema
const apiConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'cohere', 'google']),
  key: z.string().min(1, 'API key is required'),
  isActive: z.boolean().default(true)
});

// Rate limit configuration
const rateLimits: { [key: string]: { timestamp: number; count: number } } = {};
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 50;

export const apiValidation = {
  /**
   * Validates an API key based on the provider
   */
  validateApiKey(provider: string, key: string): { valid: boolean; error?: string } {
    try {
      const schema = apiKeySchemas[provider as keyof typeof apiKeySchemas];
      if (!schema) {
        return { valid: false, error: 'Invalid API provider' };
      }

      schema.parse(key);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, error: error.errors[0].message };
      }
      return { valid: false, error: 'Invalid API key format' };
    }
  },

  /**
   * Validates API configuration
   */
  async validateApiConfig(config: unknown): Promise<{ valid: boolean; error?: string }> {
    try {
      const validatedConfig = await apiConfigSchema.parseAsync(config);
      const keyValidation = this.validateApiKey(validatedConfig.provider, validatedConfig.key);
      
      if (!keyValidation.valid) {
        return keyValidation;
      }

      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, error: error.errors[0].message };
      }
      return { valid: false, error: 'Invalid API configuration' };
    }
  },

  /**
   * Checks rate limiting for API calls
   */
  checkRateLimit(apiKey: string): boolean {
    const now = Date.now();
    const limit = rateLimits[apiKey];

    if (!limit) {
      rateLimits[apiKey] = { timestamp: now, count: 1 };
      return true;
    }

    if (now - limit.timestamp > RATE_LIMIT_WINDOW) {
      rateLimits[apiKey] = { timestamp: now, count: 1 };
      return true;
    }

    if (limit.count >= MAX_REQUESTS) {
      return false;
    }

    limit.count++;
    return true;
  },

  /**
   * Handles API errors and provides user feedback
   */
  handleApiError(error: any): void {
    log.error('API error:', error);

    if (error.status === 429) {
      toast.error('Rate limit exceeded. Please try again later.');
      return;
    }

    if (error.status === 401) {
      toast.error('Invalid API key. Please check your credentials.');
      return;
    }

    if (error.status === 403) {
      toast.error('API access forbidden. Please check your permissions.');
      return;
    }

    if (error.status >= 500) {
      toast.error('API service is currently unavailable. Please try again later.');
      return;
    }

    toast.error(error.message || 'An unexpected error occurred');
  },

  /**
   * Tests API configuration
   */
  async testApiConfig(config: { provider: string; key: string }): Promise<boolean> {
    try {
      // Validate config format first
      const validation = await this.validateApiConfig(config);
      if (!validation.valid) {
        toast.error(validation.error);
        return false;
      }

      // Test rate limiting
      if (!this.checkRateLimit(config.key)) {
        toast.error('Rate limit exceeded. Please try again later.');
        return false;
      }

      // Provider-specific test endpoints
      const endpoints = {
        openai: 'https://api.openai.com/v1/models',
        anthropic: 'https://api.anthropic.com/v1/models',
        cohere: 'https://api.cohere.ai/v1/models',
        google: 'https://generativelanguage.googleapis.com/v1/models'
      };

      const endpoint = endpoints[config.provider as keyof typeof endpoints];
      if (!endpoint) {
        throw new Error('Invalid API provider');
      }

      // Test API connection
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API test failed: ${response.statusText}`);
      }

      toast.success('API configuration verified successfully');
      return true;

    } catch (error: any) {
      this.handleApiError(error);
      return false;
    }
  },

  /**
   * Validates and processes API response
   */
  async validateApiResponse<T>(
    response: Response,
    schema: z.ZodType<T>
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const validated = await schema.parseAsync(data);
      
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map(e => e.message).join('. ');
        log.error('API response validation error:', error);
        return { success: false, error: message };
      }

      log.error('API response error:', error);
      return { success: false, error: 'Failed to process API response' };
    }
  }
};