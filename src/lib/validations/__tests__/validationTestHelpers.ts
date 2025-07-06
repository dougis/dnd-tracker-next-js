/**
 * Shared test utilities for validation schemas
 * Reduces code duplication across validation test files
 */

import { z } from 'zod';

/**
 * Safe validation wrapper for testing
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown) {
  try {
    const result = schema.parse(data);
    return { success: true, data: result, error: null };
  } catch (error) {
    return { success: false, data: null, error: error as z.ZodError };
  }
}

/**
 * Test case data structure
 */
export interface ValidationTestCase<T = any> {
  name: string;
  data: T;
  shouldPass: boolean;
  expectedErrors?: string[];
}

/**
 * Data-driven validation test runner
 */
export function runValidationTests<T>(
  schema: z.ZodSchema<T>,
  testCases: ValidationTestCase<any>[]
) {
  testCases.forEach(({ name, data, shouldPass, expectedErrors }) => {
    it(name, () => {
      const result = safeValidate(schema, data);

      if (shouldPass) {
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      } else {
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();

        if (expectedErrors) {
          const errorMessages = result.error?.issues.map(issue => issue.message) || [];
          expectedErrors.forEach(expectedError => {
            expect(errorMessages).toContain(expectedError);
          });
        }
      }
    });
  });
}

/**
 * String validation test cases generator
 */
export function createStringValidationTests(fieldName: string, constraints: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}): ValidationTestCase[] {
  const tests: ValidationTestCase[] = [];

  if (constraints.required) {
    tests.push(
      {
        name: `should reject empty ${fieldName}`,
        data: { [fieldName]: '' },
        shouldPass: false,
        expectedErrors: ['String must contain at least 1 character(s)'],
      },
      {
        name: `should reject missing ${fieldName}`,
        data: {},
        shouldPass: false,
        expectedErrors: ['Required'],
      }
    );
  }

  if (constraints.minLength) {
    tests.push({
      name: `should reject ${fieldName} shorter than ${constraints.minLength} characters`,
      data: { [fieldName]: 'a'.repeat(constraints.minLength - 1) },
      shouldPass: false,
      expectedErrors: [`String must contain at least ${constraints.minLength} character(s)`],
    });
  }

  if (constraints.maxLength) {
    tests.push({
      name: `should reject ${fieldName} longer than ${constraints.maxLength} characters`,
      data: { [fieldName]: 'a'.repeat(constraints.maxLength + 1) },
      shouldPass: false,
      expectedErrors: [`String must contain at most ${constraints.maxLength} character(s)`],
    });
  }

  if (constraints.pattern) {
    tests.push({
      name: `should reject ${fieldName} with invalid format`,
      data: { [fieldName]: 'invalid-format' },
      shouldPass: false,
      expectedErrors: ['Invalid'],
    });
  }

  tests.push({
    name: `should accept valid ${fieldName}`,
    data: { [fieldName]: 'valid-value' },
    shouldPass: true,
  });

  return tests;
}

/**
 * Number validation test cases generator
 */
export function createNumberValidationTests(fieldName: string, constraints: {
  required?: boolean;
  min?: number;
  max?: number;
  integer?: boolean;
}): ValidationTestCase[] {
  const tests: ValidationTestCase[] = [];

  if (constraints.required) {
    tests.push({
      name: `should reject missing ${fieldName}`,
      data: {},
      shouldPass: false,
      expectedErrors: ['Required'],
    });
  }

  if (constraints.min !== undefined) {
    tests.push({
      name: `should reject ${fieldName} below minimum ${constraints.min}`,
      data: { [fieldName]: constraints.min - 1 },
      shouldPass: false,
      expectedErrors: [`Number must be greater than or equal to ${constraints.min}`],
    });
  }

  if (constraints.max !== undefined) {
    tests.push({
      name: `should reject ${fieldName} above maximum ${constraints.max}`,
      data: { [fieldName]: constraints.max + 1 },
      shouldPass: false,
      expectedErrors: [`Number must be less than or equal to ${constraints.max}`],
    });
  }

  if (constraints.integer) {
    tests.push({
      name: `should reject non-integer ${fieldName}`,
      data: { [fieldName]: 3.14 },
      shouldPass: false,
      expectedErrors: ['Expected integer, received float'],
    });
  }

  tests.push({
    name: `should accept valid ${fieldName}`,
    data: { [fieldName]: constraints.min || 1 },
    shouldPass: true,
  });

  return tests;
}

/**
 * Email validation test cases
 */
export function createEmailValidationTests(fieldName: string = 'email'): ValidationTestCase[] {
  return [
    {
      name: `should accept valid ${fieldName}`,
      data: { [fieldName]: 'test@example.com' },
      shouldPass: true,
    },
    {
      name: `should reject invalid ${fieldName} format`,
      data: { [fieldName]: 'invalid-email' },
      shouldPass: false,
      expectedErrors: ['Invalid email'],
    },
    {
      name: `should reject ${fieldName} without domain`,
      data: { [fieldName]: 'test@' },
      shouldPass: false,
      expectedErrors: ['Invalid email'],
    },
    {
      name: `should reject ${fieldName} without @`,
      data: { [fieldName]: 'testexample.com' },
      shouldPass: false,
      expectedErrors: ['Invalid email'],
    },
  ];
}

/**
 * Array validation test cases generator
 */
export function createArrayValidationTests(fieldName: string, constraints: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  itemType?: 'string' | 'number' | 'object';
}): ValidationTestCase[] {
  const tests: ValidationTestCase[] = [];

  if (constraints.required) {
    tests.push({
      name: `should reject missing ${fieldName}`,
      data: {},
      shouldPass: false,
      expectedErrors: ['Required'],
    });
  }

  if (constraints.minLength) {
    tests.push({
      name: `should reject ${fieldName} with fewer than ${constraints.minLength} items`,
      data: { [fieldName]: new Array(constraints.minLength - 1).fill('item') },
      shouldPass: false,
      expectedErrors: [`Array must contain at least ${constraints.minLength} element(s)`],
    });
  }

  if (constraints.maxLength) {
    tests.push({
      name: `should reject ${fieldName} with more than ${constraints.maxLength} items`,
      data: { [fieldName]: new Array(constraints.maxLength + 1).fill('item') },
      shouldPass: false,
      expectedErrors: [`Array must contain at most ${constraints.maxLength} element(s)`],
    });
  }

  tests.push({
    name: `should accept valid ${fieldName}`,
    data: { [fieldName]: ['valid', 'items'] },
    shouldPass: true,
  });

  return tests;
}

/**
 * Object validation test helper
 */
export function createObjectValidationTests(fieldName: string, requiredFields: string[]): ValidationTestCase[] {
  const tests: ValidationTestCase[] = [];

  tests.push({
    name: `should reject missing ${fieldName}`,
    data: {},
    shouldPass: false,
    expectedErrors: ['Required'],
  });

  requiredFields.forEach(field => {
    const incompleteObject = requiredFields.reduce((obj, key) => {
      if (key !== field) {
        obj[key] = 'value';
      }
      return obj;
    }, {} as Record<string, any>);

    tests.push({
      name: `should reject ${fieldName} missing ${field}`,
      data: { [fieldName]: incompleteObject },
      shouldPass: false,
      expectedErrors: ['Required'],
    });
  });

  const completeObject = requiredFields.reduce((obj, key) => {
    obj[key] = 'value';
    return obj;
  }, {} as Record<string, any>);

  tests.push({
    name: `should accept valid ${fieldName}`,
    data: { [fieldName]: completeObject },
    shouldPass: true,
  });

  return tests;
}

/**
 * Enum validation test cases generator
 */
export function createEnumValidationTests<T extends string>(
  fieldName: string,
  validValues: T[],
  required: boolean = true
): ValidationTestCase[] {
  const tests: ValidationTestCase[] = [];

  if (required) {
    tests.push({
      name: `should reject missing ${fieldName}`,
      data: {},
      shouldPass: false,
      expectedErrors: ['Required'],
    });
  }

  tests.push({
    name: `should reject invalid ${fieldName}`,
    data: { [fieldName]: 'invalid-value' },
    shouldPass: false,
    expectedErrors: ['Invalid enum value'],
  });

  validValues.forEach(value => {
    tests.push({
      name: `should accept ${fieldName} value: ${value}`,
      data: { [fieldName]: value },
      shouldPass: true,
    });
  });

  return tests;
}

/**
 * Character-specific validation test helpers
 */
export namespace CharacterValidationHelpers {
  export function createAbilityScoreTests(): ValidationTestCase[] {
    return [
      ...createNumberValidationTests('strength', { required: true, min: 1, max: 30, integer: true }),
      ...createNumberValidationTests('dexterity', { required: true, min: 1, max: 30, integer: true }),
      ...createNumberValidationTests('constitution', { required: true, min: 1, max: 30, integer: true }),
      ...createNumberValidationTests('intelligence', { required: true, min: 1, max: 30, integer: true }),
      ...createNumberValidationTests('wisdom', { required: true, min: 1, max: 30, integer: true }),
      ...createNumberValidationTests('charisma', { required: true, min: 1, max: 30, integer: true }),
    ];
  }

  export function createCharacterBasicTests(): ValidationTestCase[] {
    return [
      ...createStringValidationTests('name', { required: true, minLength: 1, maxLength: 100 }),
      ...createStringValidationTests('race', { required: true }),
      ...createStringValidationTests('characterClass', { required: true }),
      ...createNumberValidationTests('level', { required: true, min: 1, max: 20, integer: true }),
    ];
  }
}

/**
 * User validation test helpers
 */
export namespace UserValidationHelpers {
  export function createUserAuthTests(): ValidationTestCase[] {
    return [
      ...createEmailValidationTests('email'),
      ...createStringValidationTests('username', { required: true, minLength: 3, maxLength: 30 }),
      ...createStringValidationTests('password', { required: true, minLength: 8 }),
    ];
  }

  export function createUserProfileTests(): ValidationTestCase[] {
    return [
      ...createStringValidationTests('firstName', { required: true, maxLength: 50 }),
      ...createStringValidationTests('lastName', { required: true, maxLength: 50 }),
      ...createStringValidationTests('bio', { required: false, maxLength: 500 }),
    ];
  }
}

/**
 * Encounter validation test helpers
 */
export namespace EncounterValidationHelpers {
  export function createEncounterBasicTests(): ValidationTestCase[] {
    return [
      ...createStringValidationTests('name', { required: true, minLength: 1, maxLength: 100 }),
      ...createStringValidationTests('description', { required: false, maxLength: 1000 }),
      ...createEnumValidationTests('difficulty', ['Easy', 'Medium', 'Hard', 'Deadly']),
      ...createNumberValidationTests('targetLevel', { required: true, min: 1, max: 20, integer: true }),
    ];
  }

  export function createParticipantTests(): ValidationTestCase[] {
    return [
      ...createStringValidationTests('name', { required: true, minLength: 1 }),
      ...createNumberValidationTests('maxHitPoints', { required: true, min: 1, integer: true }),
      ...createNumberValidationTests('armorClass', { required: true, min: 1, max: 30, integer: true }),
      ...createNumberValidationTests('initiative', { required: true, min: 0, max: 50 }),
    ];
  }
}