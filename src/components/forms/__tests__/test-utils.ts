/**
 * Shared test utilities for form validation tests
 */

import { type ValidationRule, type FieldValidator } from '../form-utils';

/**
 * Helper to create a validation rule for testing
 */
export function createTestRule(
  test: (_value: any) => boolean,
  message = 'Test message'
): ValidationRule {
  return { test, message };
}

/**
 * Helper to create a field validator for testing
 */
export function createFieldValidator(
  field: string,
  rules: ValidationRule[]
): FieldValidator {
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
export function mockFormData(entries: [string, string][]): typeof FormData {
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

  expectBasicValidation(
    rule: ValidationRule,
    validValue: any,
    invalidValue: any
  ): void {
    expect(rule.test(validValue)).toBe(true);
    expect(rule.test(invalidValue)).toBe(false);
  },
};

/**
 * D&D specific test data and utilities
 */
export const dndTestData = {
  characterName: {
    valid: ['Aragorn', 'Gandalf the Grey', 'Dr'],
    invalid: ['', 'A', 'A'.repeat(51)],
    messages: [
      'Character name is required',
      'Character name must be at least 2 characters',
      'Character name must be no more than 50 characters',
    ],
  },
  abilityScore: {
    valid: [1, 15, 30],
    invalid: ['', 'not-a-number', 0, 35], // empty, non-number, too low, too high
    messages: [
      'Ability score is required',
      'Ability score must be a number',
      'Ability score must be at least 1',
      'Ability score cannot exceed 30',
    ],
  },
  hitPoints: {
    valid: [0, 50, 9999],
    invalid: ['', 'not-a-number', -5, 10000], // empty, non-number, negative, too high
    messages: [
      'Hit points are required',
      'Hit points must be a number',
      'Hit points cannot be negative',
      'Hit points cannot exceed 9999',
    ],
  },
  armorClass: {
    valid: [1, 15, 30],
    invalid: ['', 'not-a-number', 0, 35], // empty, non-number, too low, too high
    messages: [
      'Armor class is required',
      'Armor class must be a number',
      'Armor class must be at least 1',
      'Armor class cannot exceed 30',
    ],
  },
  initiative: {
    valid: [-10, 5, 20],
    invalid: ['not-a-number', -15, 25],
    messages: [
      'Initiative must be a number',
      'Initiative modifier cannot be less than -10',
      'Initiative modifier cannot exceed +20',
    ],
  },
  level: {
    valid: [1, 10, 20],
    invalid: ['', 'not-a-number', 0, 21], // empty, non-number, too low, too high
    messages: [
      'Level is required',
      'Level must be a number',
      'Level must be at least 1',
      'Level cannot exceed 20',
    ],
  },
};

/**
 * Helper to test D&D validator structure
 */
export function testDndValidatorStructure(
  validators: ValidationRule[],
  expectedMessages: string[]
): void {
  expect(validators).toHaveLength(expectedMessages.length);
  expectedMessages.forEach((message, index) => {
    expect(validators[index].message).toBe(message);
  });
}

/**
 * Helper to test D&D validator values - simplified approach
 */
export function testDndValidatorValues(
  validators: ValidationRule[],
  validValues: any[],
  invalidValues: any[]
): void {
  // Test each valid value against appropriate validators
  validValues.forEach(value => {
    // For most validators, skip the first (required) rule when testing with actual values
    const startIndex = validators.length > 3 ? 1 : 0;
    for (let i = startIndex; i < validators.length; i++) {
      expect(validators[i].test(value)).toBe(true);
    }
  });

  // Test invalid values against their corresponding validators
  // Each invalid value is designed to fail a specific validator
  invalidValues.forEach((invalidValue, index) => {
    if (validators[index]) {
      expect(validators[index].test(invalidValue)).toBe(false);
    }
  });
}

/**
 * Helper to create complete D&D character data for testing
 */
export function createDndCharacterData(overrides: any = {}): any {
  return {
    characterName: 'Gandalf the Grey',
    level: 20,
    hitPoints: 150,
    armorClass: 17,
    strength: 13,
    dexterity: 16,
    constitution: 16,
    intelligence: 25,
    wisdom: 15,
    charisma: 16,
    ...overrides,
  };
}

/**
 * Helper to test complete validation workflow
 */
export function testValidationWorkflow(
  formData: any,
  validators: FieldValidator[],
  expectedValid: boolean,
  expectedErrorCount: number = 0,
  expectedErrorFields: string[] = []
): any {
  const { validateForm } = require('../form-utils');
  const result = validateForm(formData, validators);

  expect(result.isValid).toBe(expectedValid);
  expect(result.errors).toHaveLength(expectedErrorCount);

  if (expectedErrorFields.length > 0) {
    const fieldNames = result.errors.map((error: any) => error.field);
    expect(fieldNames).toEqual(expectedErrorFields);
  }

  return result;
}

/**
 * Helper to test FormData extraction with mocking
 */
export function testFormDataExtraction(
  entries: [string, string][],
  expectedResult: any
): void {
  const { extractFormData } = require('../form-utils');
  const formElement = document.createElement('form');

  const originalFormData = mockFormData(entries);
  const result = extractFormData(formElement);

  expect(result).toEqual(expectedResult);
  restoreFormData(originalFormData);
}
