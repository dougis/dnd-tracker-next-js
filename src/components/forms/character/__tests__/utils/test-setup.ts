/**
 * Shared test setup utilities to reduce duplication across test files
 */

// Common beforeEach setup - replaces duplicate jest.clearAllMocks() calls
export const setupCommonMocks = () => {
  jest.clearAllMocks();
};

// Common props factory to reduce duplication
export const createCommonTestProps = (overrides: any = {}) => ({
  ownerId: 'user123',
  onSuccess: jest.fn(),
  onError: jest.fn(),
  onCancel: jest.fn(),
  isOpen: true,
  ...overrides,
});

// Character service mock setup - consolidates repeated mock configurations
export const setupCharacterServiceMock = () => {
  const mockCharacterService = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByOwner: jest.fn(),
  };

  // Common success response
  mockCharacterService.create.mockResolvedValue({
    success: true,
    data: {
      _id: 'char123',
      ownerId: 'user123',
      name: 'Test Character',
      type: 'pc',
      race: 'human',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return mockCharacterService;
};

// Next.js navigation mock setup - consolidates router mocking
export const setupNextNavigationMock = () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockBack = jest.fn();

  jest.mock('next/navigation', () => ({
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/characters',
  }));

  return { mockPush, mockReplace, mockBack };
};

// Form component test setup - pre-configured for character forms
export const setupFormComponentTest = () => {
  setupCommonMocks();
  const mockService = setupCharacterServiceMock();

  return {
    mockService,
    defaultProps: createCommonTestProps(),
  };
};

// Hook test setup - pre-configured for character hooks
export const setupHookTest = () => {
  setupCommonMocks();
  const mockService = setupCharacterServiceMock();
  const navigation = setupNextNavigationMock();

  return {
    mockService,
    navigation,
    defaultProps: createCommonTestProps(),
  };
};

// Section test setup - pre-configured for form sections
export const setupSectionTest = () => {
  setupCommonMocks();

  const defaultSectionProps = {
    value: {},
    onChange: jest.fn(),
    errors: {},
  };

  return { defaultSectionProps };
};

// Validation test setup - pre-configured for validation tests
export const setupValidationTest = () => {
  setupCommonMocks();

  const mockFormMethods = {
    register: jest.fn(),
    handleSubmit: jest.fn(),
    setValue: jest.fn(),
    watch: jest.fn(() => ({})),
    formState: { errors: {}, isSubmitting: false },
    control: {},
  };

  return { mockFormMethods };
};