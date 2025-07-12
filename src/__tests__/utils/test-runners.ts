/**
 * Test runner utilities to eliminate repetitive test execution patterns
 */

import { resetAllMocks } from './test-setup';

export async function runTestSuite<T>(
  testCases: T[],
  testFunction: (_testCase: T) => Promise<void>,
  cleanupMocks?: jest.MockedFunction<any>[]
) {
  for (const testCase of testCases) {
    await testFunction(testCase);

    if (cleanupMocks && cleanupMocks.length > 0) {
      resetAllMocks(...cleanupMocks);
    }
  }
}

export function createIterativeTestRunner(cleanupMocks: jest.MockedFunction<any>[]) {
  return async <T>(
    items: T[],
    testFn: (_item: T) => Promise<void>
  ) => {
    for (const item of items) {
      await testFn(item);
      resetAllMocks(...cleanupMocks);
    }
  };
}

export function createParameterizedTest<T>(
  testName: string,
  testCases: Array<{ description: string; data: T }>,
  testFunction: (_testCase: T) => Promise<void>
) {
  return testCases.forEach(({ description, data }) => {
    it(`${testName} ${description}`, async () => {
      await testFunction(data);
    });
  });
}