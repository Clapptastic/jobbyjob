import { test, expect } from './test.setup';
import { databaseValidator } from '../../lib/databaseValidator';
import { supabase } from '../../lib/supabase';

test('validates database connection and schema', async () => {
  // Test connection
  const isConnected = await databaseValidator.validateConnection();
  expect(isConnected).toBe(true);

  // Test schema validation
  const schemaResult = await databaseValidator.validateSchema();
  expect(schemaResult.valid).toBe(true);
  expect(schemaResult.errors).toHaveLength(0);
});

test('handles database operations', async ({ testUser }) => {
  // Test data insertion
  const insertResult = await databaseValidator.testInsert({
    id: testUser.id,
    email: testUser.email,
    created_at: testUser.created_at
  });
  expect(insertResult.success).toBe(true);

  // Test data retrieval
  const retrieveResult = await databaseValidator.testRetrieve(testUser.id);
  expect(retrieveResult.success).toBe(true);
  expect(retrieveResult.data).toBeTruthy();
  expect(retrieveResult.data.email).toBe(testUser.email);

  // Test data deletion
  const deleteResult = await databaseValidator.testDelete(testUser.id);
  expect(deleteResult.success).toBe(true);

  // Verify deletion
  const verifyResult = await databaseValidator.testRetrieve(testUser.id);
  expect(verifyResult.success).toBe(false);
  expect(verifyResult.error).toBeTruthy();
});

test('handles storage operations', async ({ testUser }) => {
  const bucketName = 'resumes';
  const fileName = `test-${Date.now()}.txt`;
  const fileContent = 'Test file content';

  // Upload file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileContent);

  expect(uploadError).toBeNull();
  expect(uploadData).toBeTruthy();
  expect(uploadData.path).toBe(fileName);

  // Download file
  const { data: downloadData, error: downloadError } = await supabase.storage
    .from(bucketName)
    .download(fileName);

  expect(downloadError).toBeNull();
  expect(downloadData).toBeTruthy();

  // Convert downloaded data to text
  const text = await downloadData.text();
  expect(text).toBe(fileContent);

  // Delete file
  const { error: deleteError } = await supabase.storage
    .from(bucketName)
    .remove([fileName]);

  expect(deleteError).toBeNull();

  // Verify deletion
  const { data: verifyData, error: verifyError } = await supabase.storage
    .from(bucketName)
    .download(fileName);

  expect(verifyError).toBeTruthy();
  expect(verifyData).toBeNull();
});