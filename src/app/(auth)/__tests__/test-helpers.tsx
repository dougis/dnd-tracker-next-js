import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import userEvent from '@testing-library/user-event';

export const TEST_USER_ID = '123';
export const TEST_EMAIL = 'test@example.com';

export const createMockRouter = () => ({
  push: jest.fn(),
});

export const createMockSession = (overrides: any = {}) => ({
  user: {
    id: TEST_USER_ID,
    email: TEST_EMAIL,
    name: 'John Doe',
    ...overrides.user,
  },
  ...overrides,
});

export const mockSessionHook = (session: any = null, status: string = 'authenticated') => {
  (useSession as jest.Mock).mockReturnValue({
    data: session,
    status,
  });
};

export const mockRouterHook = (router: any = createMockRouter()) => {
  (useRouter as jest.Mock).mockReturnValue(router);
};

export const createSuccessfulFetchMock = (responseData: any = {}) => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({
      success: true,
      message: 'Profile updated successfully',
      user: { id: TEST_USER_ID, displayName: 'John Doe', ...responseData },
    }),
  });
};

export const createFailedFetchMock = (status: number = 400, errors: any[] = []) => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: false,
    status,
    json: jest.fn().mockResolvedValue({
      success: false,
      message: 'Profile update failed',
      errors,
    }),
  });
};

export const fillDisplayNameField = async (value: string) => {
  const displayNameInput = document.querySelector('input[type="text"]') as HTMLInputElement;
  if (displayNameInput) {
    await userEvent.clear(displayNameInput);
    await userEvent.type(displayNameInput, value);
  }
};

export const submitForm = async () => {
  const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
  if (submitButton) {
    await userEvent.click(submitButton);
  }
};

export const setupMocksForTest = () => {
  const mockRouter = createMockRouter();
  const mockSession = createMockSession();

  mockRouterHook(mockRouter);
  mockSessionHook(mockSession);
  createSuccessfulFetchMock();

  return { mockRouter, mockSession };
};