import { renderHook, act } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useSettingsForm } from '../useSettingsForm';
import { updateUser } from '@/lib/api/users';
import '@testing-library/jest-dom';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock user API
jest.mock('@/lib/api/users');
const mockUpdateUser = updateUser as jest.MockedFunction<typeof updateUser>;

const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    subscriptionTier: 'free',
    notifications: {
      email: true,
      combat: false,
      encounters: true,
      weeklyDigest: false,
      productUpdates: true,
      securityAlerts: true,
    },
  },
  expires: '2024-12-31',
};

describe('useSettingsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: jest.fn(),
    });
  });

  describe('Initial State', () => {
    it('should initialize with user profile data', () => {
      const { result } = renderHook(() => useSettingsForm());

      expect(result.current.profileData).toEqual({
        name: 'Test User',
        email: 'test@example.com',
      });
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

      act(() => {
        result.current.setProfileData({ name: 'Updated Name', email: 'updated@example.com' });
      });

      expect(result.current.profileData).toEqual({
        name: 'Updated Name',
        email: 'updated@example.com',
      });
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

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalledWith('1', {
        name: 'Test User',
        email: 'test@example.com',
      });
      expect(result.current.message).toEqual({
        type: 'success',
        text: 'Settings saved successfully',
      });
    });

    it('should handle profile submission with validation errors', async () => {
      const { result } = renderHook(() => useSettingsForm());

      act(() => {
        result.current.setProfileData({ name: '', email: 'invalid-email' });
      });

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expect(result.current.formErrors).toEqual({
        name: 'Name is required',
        email: 'Please enter a valid email address',
      });
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('should handle profile submission API error', async () => {
      mockUpdateUser.mockRejectedValue(new Error('API Error'));
      const { result } = renderHook(() => useSettingsForm());

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expect(result.current.message).toEqual({
        type: 'error',
        text: 'Failed to save settings. Please try again.',
      });
    });

    it('should show loading state during profile submission', async () => {
      let resolvePromise: (_value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockUpdateUser.mockReturnValue(promise);

      const { result } = renderHook(() => useSettingsForm());

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      act(() => {
        result.current.handleProfileSubmit(mockEvent);
      });

      expect(result.current.isLoadingProfile).toBe(true);

      await act(async () => {
        resolvePromise({ success: true });
        await promise;
      });

      expect(result.current.isLoadingProfile).toBe(false);
    });
  });

  describe('Notifications Form Submission', () => {
    it('should handle successful notifications submission', async () => {
      mockUpdateUser.mockResolvedValue({ success: true });
      const { result } = renderHook(() => useSettingsForm());

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleNotificationsSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalledWith('1', {
        notifications: result.current.notifications,
      });
      expect(result.current.message).toEqual({
        type: 'success',
        text: 'Settings saved successfully',
      });
    });

    it('should handle notifications submission API error', async () => {
      mockUpdateUser.mockRejectedValue(new Error('API Error'));
      const { result } = renderHook(() => useSettingsForm());

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleNotificationsSubmit(mockEvent);
      });

      expect(result.current.message).toEqual({
        type: 'error',
        text: 'Failed to save settings. Please try again.',
      });
    });

    it('should show loading state during notifications submission', async () => {
      let resolvePromise: (_value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockUpdateUser.mockReturnValue(promise);

      const { result } = renderHook(() => useSettingsForm());

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      act(() => {
        result.current.handleNotificationsSubmit(mockEvent);
      });

      expect(result.current.isLoadingNotifications).toBe(true);

      await act(async () => {
        resolvePromise({ success: true });
        await promise;
      });

      expect(result.current.isLoadingNotifications).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should validate required name field', async () => {
      const { result } = renderHook(() => useSettingsForm());

      act(() => {
        result.current.setProfileData({ name: '', email: 'test@example.com' });
      });

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expect(result.current.formErrors.name).toBe('Name is required');
    });

    it('should validate name minimum length', async () => {
      const { result } = renderHook(() => useSettingsForm());

      act(() => {
        result.current.setProfileData({ name: 'A', email: 'test@example.com' });
      });

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expect(result.current.formErrors.name).toBe('Name must be at least 2 characters');
    });

    it('should validate email format', async () => {
      const { result } = renderHook(() => useSettingsForm());

      act(() => {
        result.current.setProfileData({ name: 'Test User', email: 'invalid-email' });
      });

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expect(result.current.formErrors.email).toBe('Please enter a valid email address');
    });

    it('should clear form errors on new submission', async () => {
      const { result } = renderHook(() => useSettingsForm());

      // First submission with errors
      act(() => {
        result.current.setProfileData({ name: '', email: 'invalid' });
      });

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expect(Object.keys(result.current.formErrors)).toHaveLength(2);

      // Fix the data and submit again
      act(() => {
        result.current.setProfileData({ name: 'Test User', email: 'test@example.com' });
      });

      mockUpdateUser.mockResolvedValue({ success: true });

      await act(async () => {
        await result.current.handleProfileSubmit(mockEvent);
      });

      expect(result.current.formErrors).toEqual({});
    });
  });
});