import userEvent from '@testing-library/user-event';

// Common test setup utilities
export const setupMockClearing = () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
};

export const setupUserEvent = () => userEvent.setup();

export const setupTimers = () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
};
