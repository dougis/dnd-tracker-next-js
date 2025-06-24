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
      mockUser.findByEmail.mockResolvedValue(null);
      mockUser.findByUsername.mockResolvedValue(null);

      const mockNewUser = {
        ...mockUserData,
        generateEmailVerificationToken: jest
          .fn()
          .mockReturnValue('verification-token'),
        save: jest.fn().mockResolvedValue(true),
        toPublicJSON: jest.fn().mockReturnValue({
          _id: mockUserData._id,
          email: mockUserData.email,
          username: mockUserData.username,
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          role: mockUserData.role,
          subscriptionTier: mockUserData.subscriptionTier,
        }),
      };

      mockUser.mockImplementation(() => mockNewUser as any);

      const result = await UserService.createUser(validUserData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.email).toBe(validUserData.email);
      expect(mockUser.findByEmail).toHaveBeenCalledWith(validUserData.email);
      expect(mockUser.findByUsername).toHaveBeenCalledWith(
        validUserData.username
      );
    });

    it('should return error if user with email already exists', async () => {
      mockUser.findByEmail.mockResolvedValue(mockUserData as any);

      const result = await UserService.createUser(validUserData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
      expect(result.error?.statusCode).toBe(409);
    });

    it('should return error if user with username already exists', async () => {
      mockUser.findByEmail.mockResolvedValue(null);
      mockUser.findByUsername.mockResolvedValue(mockUserData as any);

      const result = await UserService.createUser(validUserData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('USER_ALREADY_EXISTS');
      expect(result.error?.statusCode).toBe(409);
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

      const result = await UserService.createUser(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('authenticateUser', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'Password123!',
      rememberMe: false,
    };

    it('should successfully authenticate valid credentials', async () => {
      const mockAuthUser = {
        ...mockUserData,
        comparePassword: jest.fn().mockResolvedValue(true),
        updateLastLogin: jest.fn().mockResolvedValue(true),
        toPublicJSON: jest.fn().mockReturnValue({
          _id: mockUserData._id,
          email: mockUserData.email,
          username: mockUserData.username,
          isEmailVerified: false,
        }),
      };

      mockUser.findByEmail.mockResolvedValue(mockAuthUser as any);

      const result = await UserService.authenticateUser(validLoginData);

      expect(result.success).toBe(true);
      expect(result.data?.user).toBeDefined();
      expect(result.data?.requiresVerification).toBe(true);
      expect(mockAuthUser.comparePassword).toHaveBeenCalledWith(
        validLoginData.password
      );
      expect(mockAuthUser.updateLastLogin).toHaveBeenCalled();
    });

    it('should return error for non-existent user', async () => {
      mockUser.findByEmail.mockResolvedValue(null);

      const result = await UserService.authenticateUser(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
      expect(result.error?.statusCode).toBe(401);
    });

    it('should return error for invalid password', async () => {
      const mockAuthUser = {
        ...mockUserData,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      mockUser.findByEmail.mockResolvedValue(mockAuthUser as any);

      const result = await UserService.authenticateUser(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
      expect(result.error?.statusCode).toBe(401);
    });
  });
});
