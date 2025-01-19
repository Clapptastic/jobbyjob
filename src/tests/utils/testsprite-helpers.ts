import { TestSprite } from './mock-testsprite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../..');

// Initialize TestSprite with your configuration
const testSprite = new TestSprite({
  projectRoot,
  configPath: join(projectRoot, 'testsprite.config.ts')
});

// Check TestSprite credits
export async function checkCredits() {
  try {
    const credits = await testSprite.getCredits();
    return {
      available: credits.remaining > 0,
      remaining: credits.remaining,
      resetDate: credits.resetDate
    };
  } catch (error) {
    console.warn('Failed to check TestSprite credits:', error);
    return { available: false, remaining: 0, resetDate: null };
  }
}

// Helper to run API tests
export async function runApiTests(endpoint: string) {
  const credits = await checkCredits();
  if (!credits.available) {
    console.log('TestSprite credits exhausted, skipping API tests. Credits reset on:', credits.resetDate);
    return { success: true, skipped: true };
  }
  return testSprite.runApiTests({
    endpoints: [endpoint]
  });
}

// Helper to run UI tests
export async function runUiTests(scenario: string) {
  const credits = await checkCredits();
  if (!credits.available) {
    console.log('TestSprite credits exhausted, skipping UI tests. Credits reset on:', credits.resetDate);
    return { success: true, skipped: true };
  }
  return testSprite.runUiTests({
    scenarios: [scenario]
  });
}

// Helper to generate test cases
export async function generateTestCases(component: string) {
  const credits = await checkCredits();
  if (!credits.available) {
    console.log('TestSprite credits exhausted, skipping test generation. Credits reset on:', credits.resetDate);
    return { success: true, skipped: true };
  }
  return testSprite.generateTests({
    component,
    outputPath: `./src/tests/generated/${component}.test.ts`
  });
}

// Helper to analyze test coverage
export async function analyzeTestCoverage() {
  const credits = await checkCredits();
  if (!credits.available) {
    console.log('TestSprite credits exhausted, skipping coverage analysis. Credits reset on:', credits.resetDate);
    return { success: true, skipped: true, coverage: null };
  }
  return testSprite.analyzeCoverage({
    includeUntestedScenarios: true
  });
}

// Helper to validate test configuration
export async function validateTestConfig() {
  const credits = await checkCredits();
  if (!credits.available) {
    console.log('TestSprite credits exhausted, skipping config validation. Credits reset on:', credits.resetDate);
    return true; // Return true to not block the test pipeline
  }
  return testSprite.validateConfig();
}

// Helper to run autonomous testing session
export async function runAutonomousTests() {
  const credits = await checkCredits();
  if (!credits.available) {
    console.log('TestSprite credits exhausted, skipping autonomous tests. Credits reset on:', credits.resetDate);
    return { success: true, skipped: true };
  }
  return testSprite.runAutonomous({
    duration: '1h',
    maxConcurrency: 4,
    stopOnFailure: false
  });
}

// Helper to generate test reports
export async function generateTestReport() {
  const credits = await checkCredits();
  if (!credits.available) {
    console.log('TestSprite credits exhausted, skipping report generation. Credits reset on:', credits.resetDate);
    return { success: true, skipped: true };
  }
  return testSprite.generateReport({
    format: 'html',
    outputPath: './test-reports/latest.html'
  });
} 