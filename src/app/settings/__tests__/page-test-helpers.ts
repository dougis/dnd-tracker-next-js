import { useSession } from 'next-auth/react';

export const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

export const createSessionMock = (overrides: any = {}) => ({
  data: {
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      ...overrides.user,
    },
    expires: '2024-12-31',
    ...overrides.data,
  },
  status: 'authenticated' as const,
  update: jest.fn(),
  ...overrides,
});

export const loadingSessionMock = {
  data: null,
  status: 'loading' as const,
  update: jest.fn(),
};

export const unauthenticatedSessionMock = {
  data: null,
  status: 'unauthenticated' as const,
  update: jest.fn(),
};

export const sessionWithoutUserMock = {
  data: {
    expires: '2024-12-31',
  } as any,
  status: 'authenticated' as const,
  update: jest.fn(),
};

export const nullSessionMock = {
  data: null,
  status: 'authenticated' as const,
  update: jest.fn(),
};

export const userWithEmailOnlyMock = createSessionMock({
  user: {
    id: '1',
    email: 'test@example.com',
    name: undefined,
  },
});

export const userWithNameAndEmailMock = createSessionMock({
  user: {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  },
});