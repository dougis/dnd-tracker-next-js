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
    req.json.mockResolvedValue(body);
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
});
