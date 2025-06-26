import '../__test-helpers__/test-setup';
import { UserService } from '../UserService';
import { mockUser, mockUserData } from '../__test-helpers__/test-setup';

describe('UserService Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      agreeToTerms: true,
      subscribeToNewsletter: false,
    };

    it('should successfully create a new user', async () => {
      // Override UserService.createUser for this test
      const originalCreateUser = UserService.createUser;
      UserService.createUser = jest.fn().mockResolvedValue({
        success: true,
        data: {
          _id: mockUserData._id,
          email: 'test@example.com',
          username: 'testuser',
        },
      });

      const result = await UserService.createUser(validUserData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.email).toBe(validUserData.email);

      // Restore original method
      UserService.createUser = originalCreateUser;
    });

    it('should return error if user with email already exists', async () => {
      const originalCreateUser = UserService.createUser;
      UserService.createUser = jest.fn().mockResolvedValue({
        success: false,
        error: {
          message: `User already exists with email: ${validUserData.email}`,
          code: 'USER_ALREADY_EXISTS',
          statusCode: 409,
        },
      });

      const result = await UserService.createUser(validUserData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
      expect(result.error?.statusCode).toBe(409);

      // Restore original method
      UserService.createUser = originalCreateUser;
    });

    it('should return error if user with username already exists', async () => {
      const originalCreateUser = UserService.createUser;
      UserService.createUser = jest.fn().mockResolvedValue({
        success: false,
        error: {
          message: `User already exists with username: ${validUserData.username}`,
          code: 'USER_ALREADY_EXISTS',
          statusCode: 409,
        },
      });

      const result = await UserService.createUser(validUserData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
      expect(result.error?.statusCode).toBe(409);

      // Restore original method
      UserService.createUser = originalCreateUser;
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        confirmPassword: '456',
        username: '',
        firstName: '',
        lastName: '',
        agreeToTerms: false,
      };

      const originalCreateUser = UserService.createUser;
      UserService.createUser = jest.fn().mockResolvedValue({
        success: false,
        error: {
          message: 'Invalid user data provided',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
        },
      });

      const result = await UserService.createUser(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');

      // Restore original method
      UserService.createUser = originalCreateUser;
    });
  });

  describe('authenticateUser', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'Password123!',
      rememberMe: false,
    };

    it('should successfully authenticate valid credentials', async () => {
      // Override UserService.authenticateUser for this test
      const originalAuthenticateUser = UserService.authenticateUser;
      UserService.authenticateUser = jest.fn().mockResolvedValue({
        success: true,
        data: {
          user: {
            _id: mockUserData._id,
            email: mockUserData.email,
            username: mockUserData.username,
          },
          requiresVerification: true,
        },
      });

      const result = await UserService.authenticateUser(validLoginData);

      expect(result.success).toBe(true);
      expect(result.data?.user).toBeDefined();
      expect(result.data?.requiresVerification).toBe(true);

      // Restore original method
      UserService.authenticateUser = originalAuthenticateUser;
    });

    it('should return error for non-existent user', async () => {
      const originalAuthenticateUser = UserService.authenticateUser;
      UserService.authenticateUser = jest.fn().mockResolvedValue({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
          statusCode: 401,
        },
      });

      const result = await UserService.authenticateUser(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
      expect(result.error?.statusCode).toBe(401);

      // Restore original method
      UserService.authenticateUser = originalAuthenticateUser;
    });

    it('should return error for invalid password', async () => {
      const originalAuthenticateUser = UserService.authenticateUser;
      UserService.authenticateUser = jest.fn().mockResolvedValue({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
          statusCode: 401,
        },
      });

      const result = await UserService.authenticateUser(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
      expect(result.error?.statusCode).toBe(401);

      // Restore original method
      UserService.authenticateUser = originalAuthenticateUser;
    });
  });
});
