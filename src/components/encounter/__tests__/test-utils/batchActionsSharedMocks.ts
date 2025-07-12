/**
 * Shared mock setup for BatchActions tests
 * Eliminates duplication of common mock configurations across test files
 */

/**
 * Common mock setup for BatchActions utils
 */
export const setupBatchActionsMocks = () => {
  // Mock the utils - this is the same in both test files
  jest.mock('../../BatchActions/utils', () => ({
    getEncounterText: jest.fn((count: number) =>
      `${count} encounter${count !== 1 ? 's' : ''}`
    ),
  }));
};

/**
 * Common constants for test files
 */
export const COMMON_TEST_ENCOUNTERS = ['enc1', 'enc2', 'enc3'];
export const COMMON_TEST_COUNT = 3;

/**
 * Helper to create mock API response for successful batch operations
 */
export const createMockApiResponse = (successful = COMMON_TEST_COUNT, failed = 0) => ({
  ok: true,
  json: async () => ({
    results: COMMON_TEST_ENCOUNTERS.slice(0, successful),
    errors: [],
    summary: { successful, failed }
  }),
});

/**
 * Helper to mock a successful fetch response
 */
export const mockSuccessfulResponse = (mockFetch: jest.Mock, successful = COMMON_TEST_COUNT, failed = 0) => {
  mockFetch.mockResolvedValueOnce(createMockApiResponse(successful, failed));
};

/**
 * Helper to mock an error fetch response
 */
export const mockErrorResponse = (mockFetch: jest.Mock, errorMessage = 'API Error') => {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({
      error: errorMessage
    }),
  });
};

/**
 * Common test execution patterns to eliminate duplication
 */
export interface TestActionParams {
  mockFetch: jest.Mock;
  buttonName: string | RegExp;
  expectedToastTitle: string;
  expectedDescription?: string;
  renderProps?: any;
  isDeleteAction?: boolean;
}

/**
 * Helper to execute and verify a successful action test
 */
export const executeActionTest = async (
  params: TestActionParams,
  renderFn: (_props?: any) => void,
  clickButtonFn: (_buttonName: string | RegExp) => Promise<void>,
  waitForFn: (_callback: () => void) => Promise<void>,
  expectToastFn: (_title: string, _description: string) => void,
  expectCallbacksFn: () => void
) => {
  // Mock successful API response
  mockSuccessfulResponse(params.mockFetch);

  renderFn({ selectedEncounters: COMMON_TEST_ENCOUNTERS, ...params.renderProps });

  if (params.isDeleteAction) {
    await clickButtonFn(/delete/i);
    await clickButtonFn('Delete');
  } else {
    await clickButtonFn(params.buttonName);
  }

  // Determine action type from title for description
  const actionType = params.expectedToastTitle.includes('duplicate') ? 'duplicated' :
                   params.expectedToastTitle.includes('archive') ? 'archived' : 'deleted';

  const description = params.expectedDescription ||
    `${COMMON_TEST_COUNT} encounters have been ${actionType} successfully.`;

  await waitForFn(() => {
    expectToastFn(params.expectedToastTitle, description);
    expectCallbacksFn();
  });
};

/**
 * Helper to execute and verify delete dialog workflow
 */
export const executeDeleteDialogTest = async (
  actionType: 'open' | 'cancel' | 'confirm',
  mockFetch: jest.Mock,
  renderFn: (_props?: any) => void,
  clickButtonFn: (_buttonName: string | RegExp) => Promise<void>,
  waitForFn: (_callback: () => void) => Promise<void>,
  screen: any,
  expectToastFn?: (_title: string, _description: string) => void,
  expectCallbacksFn?: () => void
) => {
  if (actionType === 'confirm') {
    mockSuccessfulResponse(mockFetch);
  }

  renderFn({ selectedEncounters: COMMON_TEST_ENCOUNTERS });

  // Open dialog
  await clickButtonFn(/delete/i);

  if (actionType === 'open') {
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Encounters')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete 3 encounters?/)).toBeInTheDocument();
  } else if (actionType === 'cancel') {
    await clickButtonFn(/cancel/i);
    await waitForFn(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  } else if (actionType === 'confirm') {
    await clickButtonFn('Delete');

    await waitForFn(() => {
      expectToastFn?.('Encounters deleted', '3 encounters have been deleted successfully.');
      expectCallbacksFn?.();
    });
  }
};

/**
 * Helper to execute and verify error action test
 */
export const executeErrorActionTest = async (
  params: {
    mockFetch: jest.Mock;
    buttonName: string | RegExp;
    errorMessage?: string;
    isDeleteAction?: boolean;
  },
  renderFn: (_props?: any) => void,
  clickButtonFn: (_buttonName: string | RegExp) => Promise<void>,
  waitForFn: (_callback: () => void) => Promise<void>,
  expectErrorToastFn: (_message: string) => void
) => {
  // Mock API error response
  mockErrorResponse(params.mockFetch, params.errorMessage);

  renderFn({ selectedEncounters: COMMON_TEST_ENCOUNTERS });

  if (params.isDeleteAction) {
    await clickButtonFn(/delete/i);
    await clickButtonFn('Delete');
  } else {
    await clickButtonFn(params.buttonName);
  }

  await waitForFn(() => {
    expectErrorToastFn(params.errorMessage || 'API Error');
  });
};