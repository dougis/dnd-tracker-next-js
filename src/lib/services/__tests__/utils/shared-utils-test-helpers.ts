/**
 * Shared Test Utilities for Service Utils Tests
 *
 * Consolidates common patterns and reduces duplication across utility test files.
 */

import { createSuccessResult, createErrorResult, CharacterServiceErrors } from '../../CharacterServiceErrors';

// Mock factories for common patterns
export const createMockModel = () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  aggregate: jest.fn(),
});

export const createMockDocument = () => ({
  save: jest.fn(),
});

// Validation factories
export const createSuccessValidation = () => () => createSuccessResult(true);
export const createErrorValidation = (errorMsg: string) => () =>
  createErrorResult(CharacterServiceErrors.invalidCharacterId(errorMsg));

// Operation factories
export const createMockOperation = (returnValue: any, shouldReject = false) => {
  return shouldReject
    ? jest.fn().mockRejectedValue(returnValue)
    : jest.fn().mockResolvedValue(returnValue);
};

export const createMockSyncOperation = (returnValue: any, shouldThrow = false) => {
  return shouldThrow
    ? jest.fn().mockImplementation(() => { throw returnValue; })
    : jest.fn().mockReturnValue(returnValue);
};

// Assertion helpers
export const expectDatabaseSuccess = (result: any, expectedData?: any, methodMock?: jest.Mock, expectedArgs?: any[]) => {
  expect(result.success).toBe(true);
  if (expectedData !== undefined) {
    expect(result.data).toBe(expectedData);
  }
  if (methodMock && expectedArgs) {
    expect(methodMock).toHaveBeenCalledWith(...expectedArgs);
  }
};

export const expectDatabaseError = (result: any, expectedErrorFragment: string) => {
  expect(result.success).toBe(false);
  expect(result.error.message).toContain(expectedErrorFragment);
};

export const expectValidationSuccess = (result: any, expectedData?: any, operationMock?: jest.Mock) => {
  expect(result.success).toBe(true);
  if (expectedData !== undefined) {
    expect(result.data).toBe(expectedData);
  }
  if (operationMock) {
    expect(operationMock).toHaveBeenCalled();
  }
};

export const expectValidationError = (result: any, expectedErrorFragment: string, operationMock?: jest.Mock) => {
  expect(result.success).toBe(false);
  expect(result.error.message).toContain(expectedErrorFragment);
  if (operationMock) {
    expect(operationMock).not.toHaveBeenCalled();
  }
};

export const expectOperationSuccess = (result: any, expectedData: any, operationMock: jest.Mock) => {
  expect(result.success).toBe(true);
  expect(result.data).toBe(expectedData);
  expect(operationMock).toHaveBeenCalled();
};

export const expectOperationError = (result: any, expectedErrorFragments: string[], operationMock?: jest.Mock) => {
  expect(result.success).toBe(false);
  expectedErrorFragments.forEach(fragment => {
    expect(result.error.message).toContain(fragment);
  });
  if (operationMock) {
    expect(operationMock).toHaveBeenCalled();
  }
};

// Test data factory
export const TEST_DATA_FACTORY = {
  character: {
    found: { _id: '123', name: 'Test Character' },
    updated: { _id: '123', name: 'Updated Character' },
    deleted: { _id: '123', name: 'Deleted Character' },
    new: { name: 'New Character' },
    saved: { _id: '123', name: 'New Character' },
  },

  ids: {
    valid: '123',
    invalid: '456',
    missing: 'missing-id',
  },

  errors: {
    database: new Error('Database connection failed'),
    validation: new Error('Validation failed'),
    save: new Error('Save failed'),
    aggregation: new Error('Aggregation failed'),
  },

  operations: {
    finalResult: 'final-result',
    step1: 'step1',
    step2: 'step2',
    bulkItem1: 'result1',
    bulkItem3: 'result3',
  }
};

// Common test scenario builders
export const createStandardErrorScenario = (
  operationName: string,
  mockMethod: jest.Mock,
  wrapperMethod: Function,
  args: any[],
  expectedErrorFragment: string
) => ({
  name: `should handle ${operationName} errors`,
  test: async () => {
    const error = TEST_DATA_FACTORY.errors.database;
    mockMethod.mockRejectedValue(error);

    const result = await wrapperMethod(...args);

    expectDatabaseError(result, expectedErrorFragment);
  }
});

export const createStandardSuccessScenario = (
  operationName: string,
  mockMethod: jest.Mock,
  wrapperMethod: Function,
  args: any[],
  mockData: any,
  expectedArgs: any[]
) => ({
  name: `should return success when ${operationName} succeeds`,
  test: async () => {
    mockMethod.mockResolvedValue(mockData);

    const result = await wrapperMethod(...args);

    expectDatabaseSuccess(result, mockData, mockMethod, expectedArgs);
  }
});

// Validation array builders
export const createValidationArray = (count: number, allSucceed = true) => {
  const validations = [];
  for (let i = 0; i < count; i++) {
    if (allSucceed || i === 0) {
      validations.push(createSuccessValidation());
    } else {
      validations.push(createErrorValidation(`fail-${i}`));
    }
  }
  return validations;
};

export const createMixedValidationArray = (successCount: number, errorIndex: number, errorMsg: string) => {
  const validations = [];
  for (let i = 0; i < successCount + 1; i++) {
    if (i === errorIndex) {
      validations.push(createErrorValidation(errorMsg));
    } else {
      validations.push(createSuccessValidation());
    }
  }
  return validations;
};

// Specialized helpers for sequence operations
export const createSequenceOperations = (failAtIndex?: number) => {
  const operations = [
    createMockOperation(createSuccessResult(TEST_DATA_FACTORY.operations.step1)),
    createMockOperation(createSuccessResult(TEST_DATA_FACTORY.operations.step2))
  ];

  if (failAtIndex !== undefined) {
    operations[failAtIndex] = createMockOperation(createErrorResult(CharacterServiceErrors.invalidCharacterId('fail')));
    // Add a third operation that shouldn't be called
    operations.push(createMockOperation(createSuccessResult('step3')));
  }

  return operations;
};

export const expectSequenceSuccess = (result: any, finalOperation: jest.Mock, operations: jest.Mock[]) => {
  expectOperationSuccess(result, TEST_DATA_FACTORY.operations.finalResult, finalOperation);
  operations.forEach(op => expect(op).toHaveBeenCalled());
};

export const expectSequenceFailure = (result: any, finalOperation: jest.Mock, operations: jest.Mock[], stoppedAt: number) => {
  expectValidationError(result, 'Invalid character ID', finalOperation);
  operations.slice(0, stoppedAt + 1).forEach(op => expect(op).toHaveBeenCalled());
  operations.slice(stoppedAt + 1).forEach(op => expect(op).not.toHaveBeenCalled());
};

// Specialized helpers for bulk operations
export const createBulkOperation = () =>
  jest.fn()
    .mockResolvedValueOnce(createSuccessResult('result1'))
    .mockResolvedValueOnce(createErrorResult(CharacterServiceErrors.invalidCharacterId('item2')))
    .mockResolvedValueOnce(createSuccessResult('result3'));

export const expectBulkSuccess = (result: any, operation: jest.Mock, items: any[]) => {
  expect(result.success).toBe(true);
  expect(result.data.successful).toEqual(['result1', 'result3']);
  expect(result.data.failed).toHaveLength(1);
  expect(result.data.failed[0].item).toBe('item2');
  expect(result.data.failed[0].error).toContain('Invalid character ID');
  expect(operation).toHaveBeenCalledTimes(items.length);
};