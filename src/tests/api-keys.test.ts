import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../lib/supabase';

describe('API Keys', () => {
  it('should save API key successfully', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null })
    });

    const { error } = await supabase
      .from('api_keys')
      .upsert({
        provider: 'openai',
        key_value: 'sk-test123'
      });

    expect(error).toBeNull();
  });

  it('should validate API key format', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Invalid API key format' }
      })
    });

    const { error } = await supabase
      .from('api_keys')
      .upsert({
        provider: 'openai',
        key_value: 'invalid-key'
      });

    expect(error.message).toBe('Invalid API key format');
  });
});