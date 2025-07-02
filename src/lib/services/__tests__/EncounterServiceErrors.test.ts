import { handleEncounterServiceError } from '../EncounterServiceErrors';
import {
  EncounterServiceError,
  EncounterNotFoundError,
  InvalidEncounterIdError,
  EncounterValidationError,
} from '../EncounterServiceErrors';

describe('EncounterServiceErrors', () => {
  describe('handleEncounterServiceError', () => {
    it('should handle EncounterServiceError instances', () => {
      const error = new EncounterNotFoundError('test-id');
      const result = handleEncounterServiceError(error, 'Default', 'DEFAULT');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ENCOUNTER_NOT_FOUND');
      expect(result.error?.statusCode).toBe(404);
      expect(result.error?.message).toBe('Encounter not found: test-id');
    });

    it('should handle MongoDB validation errors', () => {
      const error = new Error('validation failed: name is required');
      const result = handleEncounterServiceError(error, 'Default', 'DEFAULT');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.statusCode).toBe(400);
      expect(result.error?.message).toBe('Invalid encounter data provided');
    });

    it('should handle MongoDB duplicate key errors', () => {
      const error = new Error('Duplicate key error') as any;
      error.code = 11000;
      const result = handleEncounterServiceError(error, 'Default', 'DEFAULT');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DUPLICATE_ENCOUNTER');
      expect(result.error?.statusCode).toBe(409);
      expect(result.error?.message).toBe('Duplicate encounter data detected');
    });

    it('should handle MongoDB ObjectId casting errors', () => {
      const error = new Error('Cast to ObjectId failed');
      const result = handleEncounterServiceError(error, 'Default', 'DEFAULT');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_ID_FORMAT');
      expect(result.error?.statusCode).toBe(400);
      expect(result.error?.message).toBe('Invalid ID format provided');
    });

    it('should handle connection errors', () => {
      const error = new Error('connection failed');
      const result = handleEncounterServiceError(error, 'Default', 'DEFAULT');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DATABASE_ERROR');
      expect(result.error?.statusCode).toBe(503);
      expect(result.error?.message).toBe('Database connection error');
    });

    it('should handle timeout errors', () => {
      const error = new Error('timeout occurred');
      const result = handleEncounterServiceError(error, 'Default', 'DEFAULT');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DATABASE_ERROR');
      expect(result.error?.statusCode).toBe(503);
      expect(result.error?.message).toBe('Database connection error');
    });

    it('should handle ECONNREFUSED errors', () => {
      const error = new Error('ECONNREFUSED');
      const result = handleEncounterServiceError(error, 'Default', 'DEFAULT');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DATABASE_ERROR');
      expect(result.error?.statusCode).toBe(503);
      expect(result.error?.message).toBe('Database connection error');
    });

    it('should handle unknown errors with default values', () => {
      const error = new Error('Some unknown error');
      const result = handleEncounterServiceError(error, 'Default message', 'DEFAULT_CODE', 500);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DEFAULT_CODE');
      expect(result.error?.statusCode).toBe(500);
      expect(result.error?.message).toBe('Default message');
    });

    it('should handle non-Error objects', () => {
      const error = { someProperty: 'value' };
      const result = handleEncounterServiceError(error, 'Default message', 'DEFAULT_CODE');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DEFAULT_CODE');
      expect(result.error?.statusCode).toBe(500);
      expect(result.error?.message).toBe('Default message');
    });

    it('should use default status code when not provided', () => {
      const error = new Error('Test error');
      const result = handleEncounterServiceError(error, 'Default message', 'DEFAULT_CODE');

      expect(result.success).toBe(false);
      expect(result.error?.statusCode).toBe(500);
    });
  });

  describe('Error Classes', () => {
    describe('EncounterServiceError', () => {
      it('should create base error with correct properties', () => {
        const error = new EncounterServiceError('Test message', 'TEST_CODE', 400);

        expect(error.message).toBe('Test message');
        expect(error.code).toBe('TEST_CODE');
        expect(error.statusCode).toBe(400);
        expect(error.name).toBe('EncounterServiceError');
      });
    });

    describe('EncounterNotFoundError', () => {
      it('should create not found error with correct properties', () => {
        const error = new EncounterNotFoundError('test-id');

        expect(error.message).toBe('Encounter not found: test-id');
        expect(error.code).toBe('ENCOUNTER_NOT_FOUND');
        expect(error.statusCode).toBe(404);
      });
    });

    describe('InvalidEncounterIdError', () => {
      it('should create invalid ID error with correct properties', () => {
        const error = new InvalidEncounterIdError('invalid-id');

        expect(error.message).toBe('Invalid encounter ID format: invalid-id');
        expect(error.code).toBe('INVALID_ENCOUNTER_ID');
        expect(error.statusCode).toBe(400);
      });
    });

    describe('EncounterValidationError', () => {
      it('should create validation error with correct properties', () => {
        const error = new EncounterValidationError('name', 'Name is required');

        expect(error.message).toBe('Validation failed for name: Name is required');
        expect(error.code).toBe('ENCOUNTER_VALIDATION_ERROR');
        expect(error.statusCode).toBe(400);
      });
    });
  });
});