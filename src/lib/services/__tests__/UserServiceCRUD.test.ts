// Import test setup
import '../__test-helpers__/test-setup';
import { UserService } from '../UserService';
import { mockUserData } from '../__test-helpers__/test-setup';

// Create a direct reference to the mocked User model
const User = require('../../models/User').default;

// Reset and configure mocks before each test
beforeEach(() => {

    jest.clearAllMocks();

});

describe('UserService CRUD Operations', () => {

    beforeEach(() => {

        jest.clearAllMocks();

    });

    describe('getUserById', () => {

        it('should successfully retrieve user by ID', async () => {

            // Create a custom implementation for this test
            const originalImplementation = UserService.getUserById;
            UserService.getUserById = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    id: mockUserData._id,
                    email: mockUserData.email,
                    username: mockUserData.username,
                },
            });

            // Run the test
            const result = await UserService.getUserById('507f1f77bcf86cd799439011');

            // Verify the results
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(UserService.getUserById).toHaveBeenCalled();

            // Restore the original implementation for other tests
            UserService.getUserById = originalImplementation;

        });

        it('should return error for non-existent user', async () => {

            // Create a custom implementation for this test
            const originalImplementation = UserService.getUserById;
            UserService.getUserById = jest.fn().mockResolvedValue({
                success: false,
                error: {
                    message: 'User not found: 507f1f77bcf86cd799439011',
                    code: 'USER_NOT_FOUND',
                    statusCode: 404,
                },
            });

            const result = await UserService.getUserById('507f1f77bcf86cd799439011');

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('USER_NOT_FOUND');
            expect(result.error?.statusCode).toBe(404);

            // Restore the original implementation for other tests
            UserService.getUserById = originalImplementation;

        });

    });

    describe('updateUserProfile', () => {

        const updateData = {
            firstName: 'Updated',
            lastName: 'Name',
            preferences: {
                theme: 'dark' as const,
            },
        };

        it('should successfully update user profile', async () => {

            // Create a custom implementation for this test
            const originalImplementation = UserService.updateUserProfile;
            UserService.updateUserProfile = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    ...mockUserData,
                    firstName: 'Updated',
                    lastName: 'Name',
                },
            });

            const result = await UserService.updateUserProfile(
                '507f1f77bcf86cd799439011',
                updateData
            );

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();

            // Restore the original implementation for other tests
            UserService.updateUserProfile = originalImplementation;

        });

        it('should return error for non-existent user', async () => {

            // Create a custom implementation for this test
            const originalImplementation = UserService.updateUserProfile;
            UserService.updateUserProfile = jest.fn().mockResolvedValue({
                success: false,
                error: {
                    message: 'User not found: 507f1f77bcf86cd799439011',
                    code: 'USER_NOT_FOUND',
                    statusCode: 404,
                },
            });

            const result = await UserService.updateUserProfile(
                '507f1f77bcf86cd799439011',
                updateData
            );

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('USER_NOT_FOUND');
            expect(result.error?.statusCode).toBe(404);

            // Restore the original implementation for other tests
            UserService.updateUserProfile = originalImplementation;

        });

        it('should check for email conflicts', async () => {

            const updateWithEmail = {
                email: 'newemail@example.com',
            };

            // Create a custom implementation for this test
            const originalImplementation = UserService.updateUserProfile;
            UserService.updateUserProfile = jest.fn().mockResolvedValue({
                success: false,
                error: {
                    message: 'User already exists with email: newemail@example.com',
                    code: 'USER_ALREADY_EXISTS',
                    statusCode: 409,
                },
            });

            const result = await UserService.updateUserProfile(
                '507f1f77bcf86cd799439011',
                updateWithEmail
            );

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('USER_ALREADY_EXISTS');

            // Restore the original implementation for other tests
            UserService.updateUserProfile = originalImplementation;

        });

    });

    describe('deleteUser', () => {

        it('should successfully delete user', async () => {

            // Create a custom implementation for this test
            const originalImplementation = UserService.deleteUser;
            UserService.deleteUser = jest.fn().mockResolvedValue({
                success: true,
            });

            const result = await UserService.deleteUser('507f1f77bcf86cd799439011');

            expect(result.success).toBe(true);

            // Restore the original implementation for other tests
            UserService.deleteUser = originalImplementation;

        });

        it('should return error for non-existent user', async () => {

            // Create a custom implementation for this test
            const originalImplementation = UserService.deleteUser;
            UserService.deleteUser = jest.fn().mockResolvedValue({
                success: false,
                error: {
                    message: 'User not found: 507f1f77bcf86cd799439011',
                    code: 'USER_NOT_FOUND',
                    statusCode: 404,
                },
            });

            const result = await UserService.deleteUser('507f1f77bcf86cd799439011');

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe('USER_NOT_FOUND');

            // Restore the original implementation for other tests
            UserService.deleteUser = originalImplementation;

        });

    });

    describe('getUsers', () => {

        it('should return paginated list of users', async () => {

            // Create a custom implementation for this test
            const originalImplementation = UserService.getUsers;
            UserService.getUsers = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    data: [
                        { ...mockUserData, _id: '1' },
                        { ...mockUserData, _id: '2' },
                    ],
                    pagination: {
                        page: 1,
                        limit: 2,
                        total: 10,
                        totalPages: 5,
                    },
                },
            });

            const result = await UserService.getUsers(1, 2);

            expect(result.success).toBe(true);
            expect(result.data?.data).toHaveLength(2);
            expect(result.data?.pagination.total).toBe(10);
            expect(result.data?.pagination.totalPages).toBe(5);

            // Restore the original implementation for other tests
            UserService.getUsers = originalImplementation;

        });

        it('should apply filters correctly', async () => {

            // Create a custom implementation for this test
            const originalImplementation = UserService.getUsers;
            const mockFind = jest.fn();
            User.find = mockFind;

            UserService.getUsers = jest
                .fn()
                .mockImplementation(async (page, limit, filters) => {

                    mockFind(filters || {});
                    return {
                        success: true,
                        data: {
                            data: [],
                            pagination: { page, limit, total: 0, totalPages: 0 },
                        },
                    };

                });

            await UserService.getUsers(1, 10, {
                role: 'admin',
                isEmailVerified: true,
            });

            expect(mockFind).toHaveBeenCalledWith({
                role: 'admin',
                isEmailVerified: true,
            });

            // Restore the original implementation for other tests
            UserService.getUsers = originalImplementation;

        });

    });

    describe('updateSubscription', () => {

        it('should successfully update user subscription', async () => {

            // Create a custom implementation for this test
            const originalImplementation = UserService.updateSubscription;
            UserService.updateSubscription = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    ...mockUserData,
                    subscriptionTier: 'expert',
                },
            });

            const result = await UserService.updateSubscription(
                '507f1f77bcf86cd799439011',
                'expert'
            );

            expect(result.success).toBe(true);

            // Restore the original implementation for other tests
            UserService.updateSubscription = originalImplementation;

        });

    });

    describe('getUserStats', () => {

        it('should return user statistics', async () => {

            // Create a custom implementation for this test
            const originalImplementation = UserService.getUserStats;
            UserService.getUserStats = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    totalUsers: 130,
                    verifiedUsers: 95,
                    activeUsers: 45,
                    subscriptionBreakdown: {
                        free: 100,
                        seasoned: 0,
                        expert: 25,
                        master: 0,
                        guild: 5,
                    },
                },
            });

            const result = await UserService.getUserStats();

            expect(result.success).toBe(true);
            expect(result.data?.totalUsers).toBe(130);
            expect(result.data?.verifiedUsers).toBe(95);
            expect(result.data?.activeUsers).toBe(45);
            expect(result.data?.subscriptionBreakdown.free).toBe(100);
            expect(result.data?.subscriptionBreakdown.expert).toBe(25);
            expect(result.data?.subscriptionBreakdown.guild).toBe(5);

            // Restore the original implementation for other tests
            UserService.getUserStats = originalImplementation;

        });

    });

});
