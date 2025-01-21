import { test as base } from '@playwright/test';
import { supabase } from '../../lib/supabase';
import { generateTestUser, generateTestResume } from '../utils/test-utils';
import { createLogger } from '../../lib/logger';

const log = createLogger('E2E Test Setup');

// Extend the test context
type TestFixtures = {
  testUser: {
    id: string;
    email: string;
    password: string;
    created_at: string;
  };
  authenticated: boolean;
  testResume: ReturnType<typeof generateTestResume>;
};

// Create the extended test
export const test = base.extend<TestFixtures>({
  // Define the testUser fixture
  testUser: async ({}, use) => {
    const user = generateTestUser();
    await use(user);

    // Cleanup any leftover test data
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('email', user.email);

      if (error) {
        log.error('Failed to cleanup test user profile:', error);
      }
    } catch (error) {
      log.error('Error during test user cleanup:', error);
    }
  },

  // Define the testResume fixture
  testResume: async ({}, use) => {
    const resume = generateTestResume();
    await use(resume);
  },

  // Define the authenticated fixture
  authenticated: async ({ testUser }, use) => {
    try {
      // First, ensure no existing user
      await supabase.auth.signOut();

      // Sign up the test user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          data: {
            created_at: testUser.created_at
          }
        }
      });

      if (signUpError) {
        log.error('Failed to sign up test user:', signUpError);
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error('No user data returned from sign up');
      }

      // Store the user ID
      testUser.id = signUpData.user.id;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: testUser.id,
          email: testUser.email,
          created_at: testUser.created_at
        });

      if (profileError) {
        log.error('Failed to create test user profile:', profileError);
        throw profileError;
      }

      await use(true);

      // Cleanup after test
      try {
        await supabase.auth.signOut();

        // Delete profile
        const { error: deleteProfileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', testUser.id);

        if (deleteProfileError) {
          log.error('Failed to delete test user profile:', deleteProfileError);
        }

        // Delete any uploaded resumes
        const { error: deleteResumesError } = await supabase
          .from('resumes')
          .delete()
          .eq('user_id', testUser.id);

        if (deleteResumesError) {
          log.error('Failed to delete test user resumes:', deleteResumesError);
        }

        // Delete any job applications
        const { error: deleteAppsError } = await supabase
          .from('applications')
          .delete()
          .eq('user_id', testUser.id);

        if (deleteAppsError) {
          log.error('Failed to delete test user applications:', deleteAppsError);
        }
      } catch (error) {
        log.error('Error during test cleanup:', error);
      }
    } catch (error) {
      log.error('Auth fixture error:', error);
      await use(false);
    }
  }
});

export { expect } from '@playwright/test'; 