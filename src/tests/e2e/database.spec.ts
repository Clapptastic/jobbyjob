import { test, expect } from '@playwright/test';
import { databaseValidator } from '../../lib/databaseValidator';

test.describe('Database Operations', () => {
  test('validates database connection and schema', async () => {
    // Test connection
    const isConnected = await databaseValidator.validateConnection();
    expect(isConnected).toBe(true);

    // Test schema validation
    const schemaResult = await databaseValidator.validateSchema();
    expect(schemaResult.valid).toBe(true);
    expect(schemaResult.errors).toHaveLength(0);
  });

  test('handles database operations', async () => {
    const testData = {
      id: `test-${Date.now()}`,
      name: 'Test User',
      email: 'test@example.com'
    };

    // Test insert
    const insertResult = await databaseValidator.testInsert(testData);
    expect(insertResult.success).toBe(true);

    // Test retrieve
    const retrieveResult = await databaseValidator.testRetrieve(testData.id);
    expect(retrieveResult.success).toBe(true);
    expect(retrieveResult.data).toEqual(testData);

    // Test delete
    const deleteResult = await databaseValidator.testDelete(testData.id);
    expect(deleteResult.success).toBe(true);
  });

  test('handles invalid operations', async () => {
    // Test invalid insert
    const invalidData = { invalid: true };
    const insertResult = await databaseValidator.testInsert(invalidData);
    expect(insertResult.success).toBe(false);
    expect(insertResult.error).toContain('Invalid data format');
  });
});