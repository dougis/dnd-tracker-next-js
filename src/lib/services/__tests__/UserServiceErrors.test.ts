import {
  UserServiceError,
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  TokenExpiredError,
  TokenInvalidError,
} from '../UserServiceErrors';

describe('UserService Error Classes', () => {
  it('should create UserServiceError with correct properties', () => {
    const error = new UserServiceError('Test message', 'TEST_CODE', 400);

    expect(error.message).toBe('Test message');
    expect(error.code).toBe('TEST_CODE');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('UserServiceError');
  });

  it('should create UserNotFoundError with correct properties', () => {
    const error = new UserNotFoundError('user123');

    expect(error.message).toBe('User not found: user123');
    expect(error.code).toBe('USER_NOT_FOUND');
    expect(error.statusCode).toBe(404);
  });

  it('should create UserAlreadyExistsError with correct properties', () => {
    const error = new UserAlreadyExistsError('email', 'test@example.com');

    expect(error.message).toBe('User already exists with email: test@example.com');
    expect(error.code).toBe('USER_ALREADY_EXISTS');
    expect(error.statusCode).toBe(409);
  });

  it('should create InvalidCredentialsError with correct properties', () => {
    const error = new InvalidCredentialsError();

    expect(error.message).toBe('Invalid email or password');
    expect(error.code).toBe('INVALID_CREDENTIALS');
    expect(error.statusCode).toBe(401);
  });

  it('should create TokenExpiredError with correct properties', () => {
    const error = new TokenExpiredError('password reset');

    expect(error.message).toBe('password reset token has expired');
    expect(error.code).toBe('TOKEN_EXPIRED');
    expect(error.statusCode).toBe(410);
  });

  it('should create TokenInvalidError with correct properties', () => {
    const error = new TokenInvalidError('email verification');

    expect(error.message).toBe('Invalid email verification token');
    expect(error.code).toBe('TOKEN_INVALID');
    expect(error.statusCode).toBe(400);
  });
});