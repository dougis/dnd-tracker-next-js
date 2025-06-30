import {
  validateForm,
  extractFormData,
  formatValidationErrors,
  validationRules,
  dndValidators,
  type ValidationRule,
  type FieldValidator,
  type FormData,
  type ValidationResult,
} from '../form-utils';
import { createFieldValidator, mockFormData, restoreFormData } from './test-utils';

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

      const result = validateForm(data, validators);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
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

      const result = validateForm(data, validators);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
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

      const result = validateForm(data, validators);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
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

      const result = validateForm(data, validators);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        field: 'name',
        message: 'Name is required',
      });
    });

    it('should handle empty validators array', () => {
      const data: FormData = {
        anything: 'value',
      };

      const result = validateForm(data, []);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('extractFormData', () => {
    it('should extract data from HTML form element', () => {
      const formElement = document.createElement('form');

      const originalFormData = mockFormData([
        ['name', 'John Doe'],
        ['email', 'john@example.com'],
      ]);

      const result = extractFormData(formElement);

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
      });

      restoreFormData(originalFormData);
    });

    it('should handle empty form', () => {
      const formElement = document.createElement('form');

      const originalFormData = mockFormData([]);

      const result = extractFormData(formElement);

      expect(result).toEqual({});

      restoreFormData(originalFormData);
    });

    it('should handle multiple values for same field', () => {
      const formElement = document.createElement('form');

      const originalFormData = mockFormData([
        ['hobbies', 'reading'],
      ]);

      const result = extractFormData(formElement);

      expect(result).toEqual({
        hobbies: 'reading',
      });

      restoreFormData(originalFormData);
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
      // Create form data
      const formData: FormData = {
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
      };

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
      const result = validateForm(formData, validators);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should handle complex validation scenarios', () => {
      const formData: FormData = {
        characterName: 'A', // Too short
        level: 25, // Too high
        hitPoints: -10, // Negative
        armorClass: 0, // Too low
        strength: 35, // Too high
      };

      const validators: FieldValidator[] = [
        createFieldValidator('characterName', dndValidators.characterName),
        createFieldValidator('level', dndValidators.level),
        createFieldValidator('hitPoints', dndValidators.hitPoints),
        createFieldValidator('armorClass', dndValidators.armorClass),
        createFieldValidator('strength', dndValidators.abilityScore),
      ];

      const result = validateForm(formData, validators);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(5);

      // Check that we get one error per field (stops at first error)
      const fieldNames = result.errors.map(error => error.field);
      expect(fieldNames).toEqual(['characterName', 'level', 'hitPoints', 'armorClass', 'strength']);
    });
  });
});
