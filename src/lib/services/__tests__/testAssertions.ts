/**
 * Common assertion helpers for UserService tests
 */

// Common assertion helpers
export const expectSensitiveFieldsRemoved = (user: any) => {
  const sensitiveFields = [
    'passwordHash',
    'emailVerificationToken',
    'passwordResetToken',
    'passwordResetExpires',
  ];

  sensitiveFields.forEach(field => {
    expect(user).not.toHaveProperty(field);
  });
};

export const expectUserIdConversion = (user: any, expectedId: string) => {
  expect(user.id).toBe(expectedId);
  expect(user).not.toHaveProperty('_id');
};

export const expectMockCalls = (
  mockUser: any,
  email?: string,
  username?: string
) => {
  if (email) {
    expect(mockUser.findByEmail).toHaveBeenCalledWith(email);
  }
  if (username) {
    expect(mockUser.findByUsername).toHaveBeenCalledWith(username);
  }
};

export const expectErrorThrown = async (
  testFunction: () => Promise<any>,
  errorClass: any,
  expectedMessage?: string
) => {
  await expect(testFunction()).rejects.toThrow(errorClass);
  if (expectedMessage) {
    await expect(testFunction()).rejects.toThrow(expectedMessage);
  }
};

export const expectQueryChainCalls = (
  mockUser: any,
  mockSort: any,
  mockSkip: any,
  mockLimit: any,
  mockLean: any,
  query: any,
  skip?: number,
  limit?: number
) => {
  expect(mockUser.find).toHaveBeenCalledWith(query);
  expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
  if (skip !== undefined) expect(mockSkip).toHaveBeenCalledWith(skip);
  if (limit !== undefined) expect(mockLimit).toHaveBeenCalledWith(limit);
  expect(mockLean).toHaveBeenCalled();
  expect(mockUser.countDocuments).toHaveBeenCalledWith(query);
};

export const expectPaginatedResult = (
  result: any,
  expectedUsers: any[],
  expectedTotal: number
) => {
  expect(result).toEqual({
    users: expectedUsers,
    total: expectedTotal,
  });
};

export const expectPaginationValues = (
  pagination: any,
  page: number,
  limit: number,
  total: number,
  totalPages: number
) => {
  expect(pagination).toEqual({
    page,
    limit,
    total,
    totalPages,
  });
};

// Response expectation helpers to eliminate duplication
export const expectSuccessResponse = (result: any, expectedData?: any) => {
  if (expectedData !== undefined) {
    expect(result).toEqual({
      success: true,
      data: expectedData,
    });
  } else {
    expect(result).toEqual({
      success: true,
    });
  }
};

export const expectErrorResponse = (result: any, error: any) => {
  expect(result).toEqual({
    success: false,
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    },
  });
};

export const expectErrorResponseFields = (
  result: any,
  expectedCode: string,
  expectedStatus: number
) => {
  expect(result.success).toBe(false);
  expect(result.error?.code).toBe(expectedCode);
  expect(result.error?.statusCode).toBe(expectedStatus);
};

export const expectDefaultUserValues = (result: any) => {
  expect(result).toEqual({
    _id: undefined,
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    role: 'user',
    subscriptionTier: 'free',
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      emailNotifications: true,
      pushNotifications: true,
      autoSaveEncounters: true,
    },
    isEmailVerified: false,
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  });
};

export const expectMockHandleServiceErrorCall = (
  mockFn: jest.Mock,
  error: any,
  message: string,
  code: string,
  statusCode: number = 500
) => {
  expect(mockFn).toHaveBeenCalledWith(error, message, code, statusCode);
};
