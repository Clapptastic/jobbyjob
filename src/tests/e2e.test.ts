import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../lib/supabase';
import { resumeParser } from '../lib/resumeParser';
import { auth } from '../lib/auth';

describe('End-to-End Flow', () => {
  let userId: string;
  let resumeUrl: string;

  beforeAll(async () => {
    // Create test user
    const { data: { user }, error } = await auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!@#'
    });
    
    if (error) throw error;
    userId = user!.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (userId) {
      await supabase.storage.from('resumes').remove([`${userId}/*`]);
      await supabase.from('profiles').delete().eq('id', userId);
    }
  });

  it('should handle complete user flow', async () => {
    // 1. Upload resume
    const mockResume = new File(['test resume content'], 'resume.pdf', { type: 'application/pdf' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(`${userId}/resume.pdf`, mockResume);

    expect(uploadError).toBeNull();
    expect(uploadData).toBeDefined();
    resumeUrl = uploadData!.path;

    // 2. Parse resume
    const parsedContent = await resumeParser.parse('test resume content');
    expect(parsedContent).toHaveProperty('skills');
    expect(parsedContent).toHaveProperty('experience');
    expect(parsedContent).toHaveProperty('education');

    // 3. Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        resume_url: resumeUrl,
        resume_content: parsedContent
      })
      .eq('id', userId);

    expect(updateError).toBeNull();

    // 4. Verify profile update
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    expect(profileError).toBeNull();
    expect(profile).toBeDefined();
    expect(profile!.resume_url).toBe(resumeUrl);
    expect(profile!.resume_content).toEqual(parsedContent);
  });
});