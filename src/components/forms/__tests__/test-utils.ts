/**
 * Shared test utilities for form validation tests
 */

import { type ValidationRule, type FieldValidator } from '../form-utils';

/**
 * Helper to create a validation rule for testing
 */
export function createTestRule(test: (_value: any) => boolean, message = 'Test message'): ValidationRule {
  return { test, message };
}

/**
 * Helper to create a field validator for testing
 */
export function createFieldValidator(field: string, rules: ValidationRule[]): FieldValidator {
  return { field, rules };
}

/**
 * Common test data for validation tests
 */
export const testData = {
  validEmail: 'test@example.com',
  invalidEmail: 'invalid-email',
  validNumber: 123,
  invalidNumber: 'not-a-number',
  emptyString: '',
  whitespaceString: '   ',
  shortString: 'ab',
  longString: 'a'.repeat(100),
};

/**
 * Helper to test validation rule with multiple values
 */
export function testRuleWithValues(
  rule: ValidationRule,
  validValues: any[],
  invalidValues: any[]
): void {
  validValues.forEach(_value => {
    expect(rule.test(_value)).toBe(true);
  });

  invalidValues.forEach(_value => {
    expect(rule.test(_value)).toBe(false);
  });
}

/**
 * Helper to mock FormData for testing extractFormData
 */
export function mockFormData(entries: [string, string][]): void {
  const mockMap = new Map(entries);

  const originalFormData = global.FormData;
  global.FormData = jest.fn().mockImplementation(() => ({
    entries: () => mockMap.entries(),
  })) as any;

  return originalFormData;
}

/**
 * Helper to restore original FormData
 */
export function restoreFormData(originalFormData: typeof FormData): void {
  global.FormData = originalFormData;
}

/**
 * Common assertion patterns for validation rules
 */
export const commonAssertions = {
  expectCustomMessage(rule: ValidationRule, expectedMessage: string): void {
    expect(rule.message).toBe(expectedMessage);
  },

  expectEmptyValueAllowed(rule: ValidationRule): void {
    expect(rule.test('')).toBe(true);
    expect(rule.test(null)).toBe(true);
    expect(rule.test(undefined)).toBe(true);
  },

  expectBasicValidation(rule: ValidationRule, validValue: any, invalidValue: any): void {
    expect(rule.test(validValue)).toBe(true);
    expect(rule.test(invalidValue)).toBe(false);
  },
};
