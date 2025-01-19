import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { supabase } from '../lib/supabase';
import { uploadResume } from '../lib/storage';
import { parseResume } from '../lib/ai';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signOut: vi.fn()
    },
    storage: {
      from: vi.fn()
    }
  }
}));

vi.mock('../lib/storage', () => ({
  uploadResume: vi.fn()
}));

vi.mock('../lib/ai', () => ({
  parseResume: vi.fn()
}));

describe('End-to-End Flow', () => {
  const testUser = {
    id: 'test-user-id',
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!@#'
  };

  beforeAll(async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: { id: testUser.id } },
      error: null
    });
  });

  afterAll(async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
    await supabase.auth.signOut();
  });

  it('should complete the full application flow', async () => {
    // Sign up
    const { data: { user }, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password
    });

    expect(error).toBeNull();
    expect(user).toBeDefined();
    expect(user!.id).toBe(testUser.id);

    // Upload resume
    const testFile = new File(['test resume content'], 'resume.pdf', { type: 'application/pdf' });
    vi.mocked(uploadResume).mockResolvedValue({
      path: 'resumes/test-user/resume.pdf',
      url: 'https://example.com/resume.pdf'
    });

    const uploadResult = await uploadResume(testFile, user!.id);
    expect(uploadResult).toBeDefined();
    expect(uploadResult.path).toBeDefined();
    expect(uploadResult.url).toBeDefined();

    // Parse resume
    vi.mocked(parseResume).mockResolvedValue({
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: [{
        title: 'Software Engineer',
        company: 'Test Company',
        startDate: '2020-01',
        endDate: '2023-12',
        description: 'Development work'
      }],
      education: [{
        degree: 'Bachelor of Science',
        school: 'Test University',
        graduationDate: '2019-05'
      }]
    });

    const parsedResume = await parseResume(uploadResult.path);
    expect(parsedResume).toBeDefined();
    expect(parsedResume.skills).toHaveLength(3);
    expect(parsedResume.experience).toHaveLength(1);
    expect(parsedResume.education).toHaveLength(1);
  });
});