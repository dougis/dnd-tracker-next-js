import { renderHook, act } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useSettingsForm } from '../useSettingsForm';
import { updateUser } from '@/lib/api/users';
import '@testing-library/jest-dom';
import {
  createMockSessionReturn,
  createAsyncPromise,
  expectSuccessMessage,
  expectErrorMessage,
  expectValidationErrors,
  actAsync,
  setupUseSettingsFormTest,
  createProfileDataWith,
  createValidationErrors,
  expectNoApiCall,
  expectApiCallWith,
  expectLoadingState,
} from './test-helpers';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock user API
jest.mock('@/lib/api/users');
const mockUpdateUser = updateUser as jest.MockedFunction<typeof updateUser>;

describe('useSettingsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue(createMockSessionReturn());
  });

  describe('Initial State', () => {
    it('should initialize with user profile data', () => {
      const { result } = renderHook(() => useSettingsForm());

      expect(result.current.profileData).toEqual(createProfileDataWith());
    });

    it('should initialize with user notification preferences', () => {
      const { result } = renderHook(() => useSettingsForm());

      expect(result.current.notifications).toEqual({
        email: true,
        combat: false,
        encounters: true,
        weeklyDigest: false,
        productUpdates: true,
        securityAlerts: true,
      });
    });

    it('should initialize with empty states', () => {
      const { result } = renderHook(() => useSettingsForm());

      expect(result.current.formErrors).toEqual({});
      expect(result.current.message).toBeNull();
      expect(result.current.isLoadingProfile).toBe(false);
      expect(result.current.isLoadingNotifications).toBe(false);
    });
  });

  describe('Profile Data Management', () => {
    it('should update profile data', () => {
      const { result } = renderHook(() => useSettingsForm());
      const updatedData = createProfileDataWith({ name: 'Updated Name', email: 'updated@example.com' });

      act(() => {
        result.current.setProfileData(updatedData);
      });

      expect(result.current.profileData).toEqual(updatedData);
    });
  });

  describe('Notification Management', () => {
    it('should toggle notification preferences', () => {
      const { result } = renderHook(() => useSettingsForm());

      act(() => {
        result.current.handleNotificationChange('email');
      });

      expect(result.current.notifications.email).toBe(false);
    });

    it('should toggle multiple notification preferences', () => {
      const { result } = renderHook(() => useSettingsForm());

      act(() => {
        result.current.handleNotificationChange('combat');
        result.current.handleNotificationChange('weeklyDigest');
      });

      expect(result.current.notifications.combat).toBe(true);
      expect(result.current.notifications.weeklyDigest).toBe(true);
    });
  });

  describe('Profile Form Submission', () => {
    it('should handle successful profile submission', async () => {
      mockUpdateUser.mockResolvedValue({ success: true });
      const { result } = renderHook(() => useSettingsForm());
      const { mockEvent } = setupUseSettingsFormTest();

      await actAsync(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expectApiCallWith(mockUpdateUser, '1', createProfileDataWith());
      expectSuccessMessage(result);
    });

    it('should handle profile submission with validation errors', async () => {
      const { result } = renderHook(() => useSettingsForm());
      const invalidData = createProfileDataWith({ name: '', email: 'invalid-email' });
      const expectedErrors = createValidationErrors({
        name: 'Name is required',
        email: 'Please enter a valid email address',
      });

      act(() => {
        result.current.setProfileData(invalidData);
      });

      const { mockEvent } = setupUseSettingsFormTest();

      await actAsync(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expectValidationErrors(result, expectedErrors);
      expectNoApiCall(mockUpdateUser);
    });

    it('should handle profile submission API error', async () => {
      mockUpdateUser.mockRejectedValue(new Error('API Error'));
      const { result } = renderHook(() => useSettingsForm());
      const { mockEvent } = setupUseSettingsFormTest();

      await actAsync(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expectErrorMessage(result);
    });

    it('should show loading state during profile submission', async () => {
      const { promise, resolvePromise } = createAsyncPromise();
      mockUpdateUser.mockReturnValue(promise);

      const { result } = renderHook(() => useSettingsForm());
      const { mockEvent } = setupUseSettingsFormTest();

      act(() => {
        result.current.handleProfileSubmit(mockEvent);
      });

      expectLoadingState(result, 'profile', true);

      await act(async () => {
        resolvePromise({ success: true });
        await promise;
      });

      expectLoadingState(result, 'profile', false);
    });
  });

  describe('Notifications Form Submission', () => {
    it('should handle successful notifications submission', async () => {
      mockUpdateUser.mockResolvedValue({ success: true });
      const { result } = renderHook(() => useSettingsForm());
      const { mockEvent } = setupUseSettingsFormTest();

      await actAsync(async () => {
        await result.current.handleNotificationsSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expectApiCallWith(mockUpdateUser, '1', {
        notifications: result.current.notifications,
      });
      expectSuccessMessage(result);
    });

    it('should handle notifications submission API error', async () => {
      mockUpdateUser.mockRejectedValue(new Error('API Error'));
      const { result } = renderHook(() => useSettingsForm());
      const { mockEvent } = setupUseSettingsFormTest();

      await actAsync(async () => {
        await result.current.handleNotificationsSubmit(mockEvent);
      });

      expectErrorMessage(result);
    });

    it('should show loading state during notifications submission', async () => {
      const { promise, resolvePromise } = createAsyncPromise();
      mockUpdateUser.mockReturnValue(promise);

      const { result } = renderHook(() => useSettingsForm());
      const { mockEvent } = setupUseSettingsFormTest();

      act(() => {
        result.current.handleNotificationsSubmit(mockEvent);
      });

      expectLoadingState(result, 'notifications', true);

      await act(async () => {
        resolvePromise({ success: true });
        await promise;
      });

      expectLoadingState(result, 'notifications', false);
    });
  });

  describe('Form Validation', () => {
    it('should validate required name field', async () => {
      const { result } = renderHook(() => useSettingsForm());
      const invalidData = createProfileDataWith({ name: '', email: 'test@example.com' });

      act(() => {
        result.current.setProfileData(invalidData);
      });

      const { mockEvent } = setupUseSettingsFormTest();

      await actAsync(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expect(result.current.formErrors.name).toBe('Name is required');
    });

    it('should validate name minimum length', async () => {
      const { result } = renderHook(() => useSettingsForm());
      const invalidData = createProfileDataWith({ name: 'A', email: 'test@example.com' });

      act(() => {
        result.current.setProfileData(invalidData);
      });

      const { mockEvent } = setupUseSettingsFormTest();

      await actAsync(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expect(result.current.formErrors.name).toBe('Name must be at least 2 characters');
    });

    it('should validate email format', async () => {
      const { result } = renderHook(() => useSettingsForm());
      const invalidData = createProfileDataWith({ name: 'Test User', email: 'invalid-email' });

      act(() => {
        result.current.setProfileData(invalidData);
      });

      const { mockEvent } = setupUseSettingsFormTest();

      await actAsync(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expect(result.current.formErrors.email).toBe('Please enter a valid email address');
    });

    it('should clear form errors on new submission', async () => {
      const { result } = renderHook(() => useSettingsForm());
      const { mockEvent } = setupUseSettingsFormTest();

      // First submission with errors
      const invalidData = createProfileDataWith({ name: '', email: 'invalid' });
      act(() => {
        result.current.setProfileData(invalidData);
      });

      await actAsync(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expect(Object.keys(result.current.formErrors)).toHaveLength(2);

      // Fix the data and submit again
      const validData = createProfileDataWith();
      act(() => {
        result.current.setProfileData(validData);
      });

      mockUpdateUser.mockResolvedValue({ success: true });

      await actAsync(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expect(result.current.formErrors).toEqual({});
    });
  });
});