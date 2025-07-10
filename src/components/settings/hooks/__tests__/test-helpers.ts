import { act } from '@testing-library/react';

export const createMockEvent = (): React.FormEvent => ({
  preventDefault: jest.fn(),
} as unknown as React.FormEvent);

export const createMockSession = () => ({
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
});

export const createMockSessionReturn = (session: any = createMockSession()) => ({
  data: session,
  status: 'authenticated' as const,
  update: jest.fn(),
});

export const createAsyncPromise = () => {
  let resolvePromise: (_value: any) => void;
  const promise = new Promise(resolve => {
    resolvePromise = resolve;
  });
  return { promise, resolvePromise: resolvePromise! };
};

export const expectSuccessMessage = (result: any) => {
  expect(result.current.message).toEqual({
    type: 'success',
    text: 'Settings saved successfully',
  });
};

export const expectErrorMessage = (result: any) => {
  expect(result.current.message).toEqual({
    type: 'error',
    text: 'Failed to save settings. Please try again.',
  });
};

export const expectValidationErrors = (result: any, errors: { name?: string; email?: string }) => {
  expect(result.current.formErrors).toEqual(errors);
};

export const actAsync = async (callback: () => Promise<void>) => {
  await act(async () => {
    await callback();
  });
};