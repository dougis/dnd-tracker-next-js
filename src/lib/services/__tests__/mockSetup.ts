import User from '../../models/User';

/**
 * Shared mock setup utilities to reduce duplication across UserService tests
 */

export const setupUserMocks = () => {
  const mockUser = User as jest.Mocked<typeof User>;
  
  const mockSort = jest.fn();
  const mockSkip = jest.fn();
  const mockLimit = jest.fn();
  const mockLean = jest.fn();
  
  // Reset all mocks and setup default chain
  const resetMocks = () => {
    jest.clearAllMocks();
    
    // Setup default mock chain for query helpers
    mockUser.find.mockReturnValue({
      sort: mockSort,
    } as any);
    mockSort.mockReturnValue({
      skip: mockSkip,
    } as any);
    mockSkip.mockReturnValue({
      limit: mockLimit,
    } as any);
    mockLimit.mockReturnValue({
      lean: mockLean,
    } as any);
    mockLean.mockResolvedValue([]);
  };
  
  return {
    mockUser,
    mockSort,
    mockSkip,
    mockLimit,
    mockLean,
    resetMocks,
  };
};

export const setupBasicUserMocks = () => {
  const mockUser = User as jest.Mocked<typeof User>;
  
  const resetMocks = () => {
    jest.clearAllMocks();
  };
  
  return {
    mockUser,
    resetMocks,
  };
};