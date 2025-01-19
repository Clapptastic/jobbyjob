import { test as base } from '@playwright/test';
import { runUiTests, runAutonomousTests, checkCredits } from '../utils/testsprite-helpers';

// Extend the test context
type TestFixtures = {
  testUser: {
    email: string;
    password: string;
  };
  testSpriteAvailable: boolean;
};

// Create the extended test
export const test = base.extend<TestFixtures>({
  // Define the testUser fixture
  testUser: async ({}, use) => {
    const user = {
      email: `test${Date.now()}@example.com`,
      password: 'testPassword123!'
    };
    await use(user);
  },

  // Define the testSpriteAvailable fixture
  testSpriteAvailable: async ({}, use) => {
    const { available } = await checkCredits();
    await use(available);
  }
});

export { expect } from '@playwright/test'; 