import {
  formatValidationErrors,
  validationRules,
  dndValidators,
  type ValidationRule,
  type FieldValidator,
  type FormData,
  type ValidationResult,
} from '../form-utils';
import {
  createFieldValidator,
  testFormDataExtraction,
  testValidationWorkflow,
  createDndCharacterData
} from './test-utils';

describe('Form Validation and Utilities', () => {
  describe('Type Definitions', () => {
    it('should define correct types', () => {
      // Test type structure with runtime validation
      const rule: ValidationRule = {
        test: (value) => value !== null,
        message: 'Test message',
      };

      expect(rule.test).toBeInstanceOf(Function);
      expect(typeof rule.message).toBe('string');

      const validator: FieldValidator = {
        field: 'testField',
        rules: [rule],
      };

      expect(typeof validator.field).toBe('string');
      expect(Array.isArray(validator.rules)).toBe(true);

      const formData: FormData = {
        testField: 'test value',
      };

      expect(typeof formData).toBe('object');

      const result: ValidationResult = {
        isValid: true,
        errors: [],
      };

      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('validateForm', () => {
    it('should validate form with valid data', () => {
      const data: FormData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      const validators: FieldValidator[] = [
        createFieldValidator('name', [validationRules.required(), validationRules.minLength(2)]),
        createFieldValidator('email', [validationRules.required(), validationRules.email()]),
        createFieldValidator('age', [validationRules.number(), validationRules.min(18)]),
      ];

      testValidationWorkflow(data, validators, true, 0);
    });

    it('should return errors for invalid data', () => {
      const data: FormData = {
        name: '',
        email: 'invalid-email',
        age: 'not-a-number',
      };

      const validators: FieldValidator[] = [
        createFieldValidator('name', [validationRules.required('Name is required')]),
        createFieldValidator('email', [validationRules.email('Invalid email format')]),
        createFieldValidator('age', [validationRules.number('Age must be a number')]),
      ];

      const result = testValidationWorkflow(data, validators, false, 3);
      expect(result.errors).toEqual([
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Invalid email format' },
        { field: 'age', message: 'Age must be a number' },
      ]);
    });

    it('should stop at first error per field', () => {
      const data: FormData = {
        password: 'a', // Fails both required and minLength
      };

      const validators: FieldValidator[] = [
        createFieldValidator('password', [
          validationRules.required('Password is required'),
          validationRules.minLength(8, 'Password too short'),
        ]),
      ];

      const result = testValidationWorkflow(data, validators, false, 1);
      expect(result.errors[0].message).toBe('Password too short');
    });

    it('should handle missing fields', () => {
      const data: FormData = {
        // Missing 'name' field
        email: 'test@example.com',
      };

      const validators: FieldValidator[] = [
        createFieldValidator('name', [validationRules.required('Name is required')]),
        createFieldValidator('email', [validationRules.email()]),
      ];

      const result = testValidationWorkflow(data, validators, false, 1);
      expect(result.errors[0]).toEqual({
        field: 'name',
        message: 'Name is required',
      });
    });

    it('should handle empty validators array', () => {
      const data: FormData = {
        anything: 'value',
      };

      testValidationWorkflow(data, [], true, 0);
    });
  });

  describe('extractFormData', () => {
    it('should extract data from HTML form element', () => {
      testFormDataExtraction(
        [['name', 'John Doe'], ['email', 'john@example.com']],
        { name: 'John Doe', email: 'john@example.com' }
      );
    });

    it('should handle empty form', () => {
      testFormDataExtraction([], {});
    });

    it('should handle multiple values for same field', () => {
      testFormDataExtraction(
        [['hobbies', 'reading']],
        { hobbies: 'reading' }
      );
    });
  });

  describe('formatValidationErrors', () => {
    it('should format errors correctly', () => {
      const inputErrors = [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Invalid email' },
      ];

      const result = formatValidationErrors(inputErrors);

      expect(result).toEqual([
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Invalid email' },
      ]);
    });

    it('should handle empty errors array', () => {
      const result = formatValidationErrors([]);
      expect(result).toEqual([]);
    });

    it('should handle single error', () => {
      const inputErrors = [
        { field: 'password', message: 'Password too weak' },
      ];

      const result = formatValidationErrors(inputErrors);
      expect(result).toEqual([
        { field: 'password', message: 'Password too weak' },
      ]);
    });

    it('should create new array instance', () => {
      const inputErrors = [
        { field: 'test', message: 'Test error' },
      ];

      const result = formatValidationErrors(inputErrors);

      expect(result).not.toBe(inputErrors); // Should be new array
      expect(result).toEqual(inputErrors); // But with same content
    });
  });

  describe('Integration Tests', () => {
    it('should work with complete form validation workflow', () => {
      // Create form data using helper
      const formData = createDndCharacterData();

      // Create validators using D&D validators
      const validators: FieldValidator[] = [
        createFieldValidator('characterName', dndValidators.characterName),
        createFieldValidator('level', dndValidators.level),
        createFieldValidator('hitPoints', dndValidators.hitPoints),
        createFieldValidator('armorClass', dndValidators.armorClass),
        createFieldValidator('strength', dndValidators.abilityScore),
        createFieldValidator('dexterity', dndValidators.abilityScore),
        createFieldValidator('constitution', dndValidators.abilityScore),
        createFieldValidator('intelligence', dndValidators.abilityScore),
        createFieldValidator('wisdom', dndValidators.abilityScore),
        createFieldValidator('charisma', dndValidators.abilityScore),
      ];

      // Validate form
      testValidationWorkflow(formData, validators, true, 0);
    });

    it('should handle complex validation scenarios', () => {
      const formData = createDndCharacterData({
        characterName: 'A', // Too short
        level: 25, // Too high
        hitPoints: -10, // Negative
        armorClass: 0, // Too low
        strength: 35, // Too high
      });

      const validators: FieldValidator[] = [
        createFieldValidator('characterName', dndValidators.characterName),
        createFieldValidator('level', dndValidators.level),
        createFieldValidator('hitPoints', dndValidators.hitPoints),
        createFieldValidator('armorClass', dndValidators.armorClass),
        createFieldValidator('strength', dndValidators.abilityScore),
      ];

      const result = testValidationWorkflow(formData, validators, false, 5);

      // Check that we get one error per field (stops at first error)
      const fieldNames = result.errors.map((error: any) => error.field);
      expect(fieldNames).toEqual(['characterName', 'level', 'hitPoints', 'armorClass', 'strength']);
    });
  });
});
