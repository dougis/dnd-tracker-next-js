import '../__test-helpers__/test-setup';
import { UserServiceAuth } from '../UserServiceAuth';
import {
  exerciseCreateUserVariations,
  exerciseAuthenticateUserVariations,
  exerciseChangePasswordVariations,
  exercisePasswordResetVariations,
  exerciseEmailVerificationVariations,
  exerciseErrorScenarios
} from './UserServiceAuth.test-helpers';

/**
 * Additional comprehensive tests for UserServiceAuth to reach 80% coverage
 * Simplified approach using centralized helper functions
 */
describe('UserServiceAuth - Additional Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateUser variations', () => {
    it('should exercise authenticateUser with multiple scenarios', async () => {
      await exerciseAuthenticateUserVariations();
    });
  });

  describe('changePassword variations', () => {
    it('should exercise changePassword with multiple scenarios', async () => {
      await exerciseChangePasswordVariations();
    });
  });

  describe('requestPasswordReset variations', () => {
    it('should exercise requestPasswordReset with multiple scenarios', async () => {
      await exercisePasswordResetVariations();
    });
  });

  describe('verifyEmail variations', () => {
    it('should exercise verifyEmail with multiple scenarios', async () => {
      await exerciseEmailVerificationVariations();
    });
  });

  describe('Error scenarios', () => {
    it('should exercise all error paths', async () => {
      await exerciseErrorScenarios();
    });
  });

  describe('createUser variations', () => {
    it('should exercise createUser with multiple scenarios', async () => {
      await exerciseCreateUserVariations();
    });
  });
});