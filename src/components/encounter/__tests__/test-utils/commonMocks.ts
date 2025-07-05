// Common mock patterns used across tests

export const createMockToast = () => jest.fn();

export const createConsoleSpy = () => {
  return jest.spyOn(console, 'log').mockImplementation(() => {});
};

export const mockToastModule = (mockToast: jest.Mock) => {
  jest.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
      toast: mockToast,
    }),
  }));
};

export const createMockEncounterService = () => ({
  getEncounters: jest.fn(),
  deleteEncounter: jest.fn(),
  cloneEncounter: jest.fn(),
});

export const mockEncounterServiceModule = (mockService: any) => {
  jest.mock('@/lib/services/EncounterService', () => ({
    EncounterService: mockService,
  }));
};

export const createErrorHandlerMocks = () => ({
  createSuccessHandler: jest.fn((toast) => jest.fn((action, target) => {
    toast({
      title: `Encounter ${action}d`,
      description: `"${target}" has been ${action}d successfully.`,
    });
  })),
  createErrorHandler: jest.fn((toast) => jest.fn((action) => {
    toast({
      title: 'Error',
      description: `Failed to ${action} encounter. Please try again.`,
      variant: 'destructive',
    });
  })),
});

export const mockErrorUtilsModule = (mocks: any) => {
  jest.mock('../actions/errorUtils', () => mocks);
};