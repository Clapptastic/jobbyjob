import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../../lib/supabase';
import { storage } from '../../lib/storage';
import { ai } from '../../lib/ai';

describe('Resume Integration', () => {
  let userId: string;
  let resumeUrl: string;

  beforeAll(async () => {
    const { data: { user }, error } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!@#'
    });
    
    if (error) throw error;
    userId = user!.id;
  });

  afterAll(async () => {
    if (userId) {
      await supabase.storage.from('resumes').remove([`${userId}/*`]);
      await supabase.from('profiles').delete().eq('id', userId);
    }
  });

  test('complete resume flow', async () => {
    // 1. Upload Resume
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const { url } = await storage.uploadResume(file, userId);
    expect(url).toBeDefined();
    resumeUrl = url;

    // 2. Parse Resume
    const parsedContent = await ai.parseResume('test content');
    expect(parsedContent).toHaveProperty('skills');

    // 3. Update Profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        resume_url: resumeUrl,
        resume_content: parsedContent
      })
      .eq('id', userId);
    expect(updateError).toBeNull();

    // 4. Verify Profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    expect(profileError).toBeNull();
    expect(profile?.resume_url).toBe(resumeUrl);
    expect(profile?.resume_content).toEqual(parsedContent);
  });
});