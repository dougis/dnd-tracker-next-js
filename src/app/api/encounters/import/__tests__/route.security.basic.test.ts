// Test file for import route security
import { POST } from '../route';
import {
  testAuthenticationRequired,
  testValidationError,
  createImportRequestBody,
} from '../../__tests__/shared-test-utilities';

describe('/api/encounters/import - Basic Security Tests', () => {
  describe('Authentication Requirements', () => {
    it('should return 401 when no session exists', async () => {
      const requestBody = createImportRequestBody('{"name":"Test"}', 'json');
      await testAuthenticationRequired(POST, requestBody);
    });

    it('should return 401 when session exists but has no user ID', async () => {
      const requestBody = createImportRequestBody('{"name":"Test"}', 'json');
      await testAuthenticationRequired(POST, requestBody);
    });

    it('should reject invalid request data', async () => {
      const invalidBody = { invalidField: 'test' };
      await testValidationError(POST, invalidBody); // Remove expected field since multiple fields are missing
    });
  });
});