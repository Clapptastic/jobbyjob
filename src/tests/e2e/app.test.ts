import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../../lib/supabase';
import { storage } from '../../lib/storage';
import { ai } from '../../lib/ai';
import { auth } from '../../lib/auth';

describe('End-to-End Application Flow', () => {
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

  test('complete user flow', async () => {
    // 1. Test Resume Upload
    const mockPdf = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const { path, url } = await storage.uploadResume(mockPdf, userId);
    expect(path).toBeDefined();
    expect(url).toBeDefined();
    resumeUrl = url;

    // 2. Test Resume Parsing
    const parsedContent = await ai.parseResume('test content');
    expect(parsedContent).toHaveProperty('skills');
    expect(parsedContent).toHaveProperty('experience');
    expect(parsedContent).toHaveProperty('education');

    // 3. Test Profile Update
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        resume_url: resumeUrl,
        resume_content: parsedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    expect(updateError).toBeNull();

    // 4. Test Job Search
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .order('match_score', { ascending: false });
    expect(jobsError).toBeNull();
    expect(jobs).toBeDefined();

    // 5. Test Application Creation
    const { error: applicationError } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        job_id: jobs?.[0]?.id,
        status: 'applied',
        applied_at: new Date().toISOString()
      });
    expect(applicationError).toBeNull();
  });

  test('error handling', async () => {
    // Test invalid file upload
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    await expect(storage.uploadResume(invalidFile, userId))
      .rejects.toThrow('Invalid file type');

    // Test oversized file
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    await expect(storage.uploadResume(largeFile, userId))
      .rejects.toThrow('File size must be less than 5MB');

    // Test invalid job application
    const { error: applicationError } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        job_id: 'invalid-id',
        status: 'applied'
      });
    expect(applicationError).toBeDefined();
  });
});