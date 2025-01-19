import { exec } from 'child_process';
import { promisify } from 'util';
import {
  validateTestConfig,
  runAutonomousTests,
  analyzeTestCoverage,
  generateTestReport,
  checkCredits
} from '../src/tests/utils/testsprite-helpers.js';

const execAsync = promisify(exec);

async function runTests() {
  try {
    // Check TestSprite credits first
    const credits = await checkCredits();
    console.log('TestSprite credits status:', {
      available: credits.available,
      remaining: credits.remaining,
      resetDate: credits.resetDate
    });

    if (credits.available) {
      // 1. Validate TestSprite configuration
      console.log('Validating TestSprite configuration...');
      const configValid = await validateTestConfig();
      if (!configValid) {
        throw new Error('TestSprite configuration validation failed');
      }

      // 2. Run autonomous tests
      console.log('Running autonomous tests...');
      const autonomousResults = await runAutonomousTests();
      if (!autonomousResults.success && !autonomousResults.skipped) {
        console.error('Autonomous tests failed:', autonomousResults.failures);
      }
    } else {
      console.log('Skipping TestSprite operations due to credit limitations');
    }

    // 3. Run traditional tests (always run these)
    console.log('Running traditional tests...');
    const { stdout, stderr } = await execAsync('npm run test:ci');
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    if (credits.available) {
      // 4. Analyze coverage
      console.log('Analyzing test coverage...');
      const coverage = await analyzeTestCoverage();
      if (!coverage.skipped) {
        console.log('Coverage report:', coverage);
      }

      // 5. Generate final report
      console.log('Generating test report...');
      await generateTestReport();
    }

    console.log('All tests completed successfully!');
    if (!credits.available) {
      console.log(`TestSprite operations were skipped. Credits will reset on: ${credits.resetDate}`);
    }
    process.exit(0);
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

runTests(); 