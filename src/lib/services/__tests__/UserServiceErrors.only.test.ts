/**
 * UserService Error Classes Tests
 *
 * Tests for UserService error classes without importing the full service
 * to avoid ES module issues with MongoDB/Mongoose in the test environment.
 */

import {
    UserServiceError,
    UserNotFoundError,
    UserAlreadyExistsError,
    InvalidCredentialsError,
    TokenExpiredError,
    TokenInvalidError,
    handleServiceError,
} from '../UserServiceErrors';

describe('UserService Error Classes', () => {

    describe('UserServiceError', () => {

        it('should create basic UserServiceError correctly', () => {

            const error = new UserServiceError('Test message', 'TEST_CODE', 400);
            expect(error.message).toBe('Test message');
            expect(error.code).toBe('TEST_CODE');
            expect(error.statusCode).toBe(400);
            expect(error.name).toBe('UserServiceError');

        });

        it('should use default status code', () => {

            const error = new UserServiceError('Test message', 'TEST_CODE');
            expect(error.statusCode).toBe(400);

        });

    });

    describe('UserNotFoundError', () => {

        it('should create UserNotFoundError correctly', () => {

            const error = new UserNotFoundError('test-id');
            expect(error.message).toBe('User not found: test-id');
            expect(error.code).toBe('USER_NOT_FOUND');
            expect(error.statusCode).toBe(404);

        });

    });

    describe('UserAlreadyExistsError', () => {

        it('should create UserAlreadyExistsError correctly', () => {

            const error = new UserAlreadyExistsError('email', 'test@example.com');
            expect(error.message).toBe(
                'User already exists with email: test@example.com'
            );
            expect(error.code).toBe('USER_ALREADY_EXISTS');
            expect(error.statusCode).toBe(409);

        });

    });

    describe('InvalidCredentialsError', () => {

        it('should create InvalidCredentialsError correctly', () => {

            const error = new InvalidCredentialsError();
            expect(error.message).toBe('Invalid email or password');
            expect(error.code).toBe('INVALID_CREDENTIALS');
            expect(error.statusCode).toBe(401);

        });

    });

    describe('TokenExpiredError', () => {

        it('should create TokenExpiredError correctly', () => {

            const error = new TokenExpiredError('reset');
            expect(error.message).toBe('reset token has expired');
            expect(error.code).toBe('TOKEN_EXPIRED');
            expect(error.statusCode).toBe(410);

        });

    });

    describe('TokenInvalidError', () => {

        it('should create TokenInvalidError correctly', () => {

            const error = new TokenInvalidError('verification');
            expect(error.message).toBe('Invalid verification token');
            expect(error.code).toBe('TOKEN_INVALID');
            expect(error.statusCode).toBe(400);

        });

    });

    describe('handleServiceError', () => {

        it('should handle UserServiceError correctly', () => {

            const customError = new UserNotFoundError('123');
            const result = handleServiceError(customError, 'Default', 'DEFAULT');

            expect(result.success).toBe(false);
            expect(result.error?.message).toBe('User not found: 123');
            expect(result.error?.code).toBe('USER_NOT_FOUND');
            expect(result.error?.statusCode).toBe(404);

        });

        it('should handle validation errors', () => {

            const validationError = new Error('validation failed');
            const result = handleServiceError(validationError, 'Default', 'DEFAULT');

            expect(result.success).toBe(false);
            expect(result.error?.message).toBe('Invalid user data provided');
            expect(result.error?.code).toBe('VALIDATION_ERROR');
            expect(result.error?.statusCode).toBe(400);

        });

        it('should handle generic errors', () => {

            const genericError = new Error('Something went wrong');
            const result = handleServiceError(
                genericError,
                'Default message',
                'DEFAULT_CODE',
                500
            );

            expect(result.success).toBe(false);
            expect(result.error?.message).toBe('Default message');
            expect(result.error?.code).toBe('DEFAULT_CODE');
            expect(result.error?.statusCode).toBe(500);

        });

        it('should handle unknown errors', () => {

            const result = handleServiceError(
                'unknown error',
                'Default message',
                'DEFAULT_CODE'
            );

            expect(result.success).toBe(false);
            expect(result.error?.message).toBe('Default message');
            expect(result.error?.code).toBe('DEFAULT_CODE');
            expect(result.error?.statusCode).toBe(500);

        });

    });

});
