// Import mocked NextRequest - the real one will be replaced with our mock
import { NextRequest } from 'next/server';
import { POST } from '../register/route';
import { UserService } from '@/lib/services/UserService';

// Configure Jest to use our mocks
jest.mock('next/server');

// Mock the UserService
jest.mock('@/lib/services/UserService', () => {
  return {
    UserService: {
      createUser: jest.fn(),
    },
  };
});

describe('POST /api/auth/register', () => {
  const mockUserData = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john.doe@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    agreeToTerms: true,
    subscribeToNewsletter: false,
  };

  const createMockRequest = (body: any) => {
    const req = new NextRequest('https://example.com');
    // Use the mocked json method
    (req.json as jest.Mock).mockResolvedValue(body);
    return req;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully registers a new user', async () => {
    // Mock the UserService.createUser method to return success
    UserService.createUser = jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: '12345',
        email: 'john.doe@example.com',
        username: 'johndoe',
      },
    });

    const request = createMockRequest(mockUserData);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(201);
    expect(responseData).toEqual({
      success: true,
      message: 'User registered successfully',
      user: {
        id: '12345',
        email: 'john.doe@example.com',
        username: 'johndoe',
      },
    });
    expect(UserService.createUser).toHaveBeenCalledWith(mockUserData);
  });

  it('returns validation errors for invalid data', async () => {
    // Invalid data (missing required fields)
    const invalidData = {
      email: 'invalid-email',
      password: 'short',
    };

    const request = createMockRequest(invalidData);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Validation error');
    expect(responseData.errors).toBeDefined();
    expect(responseData.errors.length).toBeGreaterThan(0);
    expect(UserService.createUser).not.toHaveBeenCalled();
  });

  it('handles service errors', async () => {
    // Mock the UserService.createUser method to return an error
    const mockError = {
      success: false,
      error: {
        message: 'Email already exists',
        statusCode: 409,
        details: [{ field: 'email', message: 'Email already exists' }],
      },
    };

    UserService.createUser = jest.fn().mockResolvedValue(mockError);

    const request = createMockRequest(mockUserData);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(409);
    expect(responseData).toEqual({
      success: false,
      message: 'Email already exists',
      errors: [{ field: 'email', message: 'Email already exists' }],
    });
    expect(UserService.createUser).toHaveBeenCalledWith(mockUserData);
  });

  it('handles unexpected errors', async () => {
    // Mock the UserService.createUser method to throw an error
    UserService.createUser = jest
      .fn()
      .mockRejectedValue(new Error('Unexpected error'));

    const request = createMockRequest(mockUserData);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({
      success: false,
      message: 'An unexpected error occurred',
    });
    expect(UserService.createUser).toHaveBeenCalledWith(mockUserData);
  });

  it('handles actual duplicate email registration correctly', async () => {
    // First, mock a successful user creation
    UserService.createUser = jest.fn().mockResolvedValueOnce({
      success: true,
      data: {
        id: '12345',
        email: 'duplicate@example.com',
        username: 'duplicateuser',
      },
    });

    // Create first user successfully
    const firstUserData = {
      ...mockUserData,
      email: 'duplicate@example.com',
      username: 'duplicateuser',
    };
    const firstRequest = createMockRequest(firstUserData);
    const firstResponse = await POST(firstRequest);
    expect(firstResponse.status).toBe(201);

    // Now mock the error for duplicate user
    UserService.createUser = jest.fn().mockResolvedValueOnce({
      success: false,
      error: {
        message: 'User already exists with email: duplicate@example.com',
        code: 'USER_ALREADY_EXISTS',
        statusCode: 409,
      },
    });

    // Try to create the same user again
    const secondRequest = createMockRequest(firstUserData);
    const secondResponse = await POST(secondRequest);
    const secondResponseData = await secondResponse.json();

    expect(secondResponse.status).toBe(409);
    expect(secondResponseData.success).toBe(false);
    expect(secondResponseData.message).toBe('User already exists with email: duplicate@example.com');
  });

  it('handles actual duplicate username registration correctly', async () => {
    // Mock the error for duplicate username
    UserService.createUser = jest.fn().mockResolvedValueOnce({
      success: false,
      error: {
        message: 'User already exists with username: duplicateusername',
        code: 'USER_ALREADY_EXISTS',
        statusCode: 409,
      },
    });

    const duplicateUsernameData = {
      ...mockUserData,
      email: 'different@example.com',
      username: 'duplicateusername',
    };

    const request = createMockRequest(duplicateUsernameData);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(409);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('User already exists with username: duplicateusername');
  });

  it('handles internal server errors correctly instead of returning 409', async () => {
    // Mock an internal server error (like database connection issues)
    UserService.createUser = jest.fn().mockResolvedValueOnce({
      success: false,
      error: {
        message: 'An unexpected error occurred during registration',
        code: 'REGISTRATION_FAILED',
        statusCode: 500,
      },
    });

    const request = createMockRequest(mockUserData);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('An unexpected error occurred during registration');
    // Register route adds errors field for all non-success responses
    expect(responseData.errors).toEqual([{ field: '', message: 'An unexpected error occurred during registration' }]);
  });

  it('handles unknown database errors correctly', async () => {
    // Mock an unknown database error
    UserService.createUser = jest.fn().mockResolvedValueOnce({
      success: false,
      error: {
        message: 'Connection timeout',
        code: 'DATABASE_ERROR',
        statusCode: 500,
      },
    });

    const request = createMockRequest(mockUserData);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    // Should get the actual error message, not default to "User already exists"
    expect(responseData.message).toBe('Connection timeout');
  });
});
