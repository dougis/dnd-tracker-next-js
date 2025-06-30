import {
  validationRules,
  validateForm,
  dndValidators,
  extractFormData,
  formatValidationErrors,
  type ValidationRule,
  type FieldValidator,
  type FormData,
  type ValidationResult,
} from '../form-utils';

describe('Form Utils', () => {
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

  describe('validationRules.required', () => {
    it('should validate required string fields', () => {
      const rule = validationRules.required();
      
      expect(rule.test('valid string')).toBe(true);
      expect(rule.test(' valid with spaces ')).toBe(true);
      expect(rule.test('')).toBe(false);
      expect(rule.test('   ')).toBe(false);
      expect(rule.message).toBe('This field is required');
    });

    it('should validate required array fields', () => {
      const rule = validationRules.required();
      
      expect(rule.test([1, 2, 3])).toBe(true);
      expect(rule.test(['item'])).toBe(true);
      expect(rule.test([])).toBe(false);
    });

    it('should validate required other field types', () => {
      const rule = validationRules.required();
      
      expect(rule.test(123)).toBe(true);
      expect(rule.test(0)).toBe(true);
      expect(rule.test(false)).toBe(true);
      expect(rule.test(true)).toBe(true);
      expect(rule.test(null)).toBe(false);
      expect(rule.test(undefined)).toBe(false);
    });

    it('should accept custom message', () => {
      const customMessage = 'Custom required message';
      const rule = validationRules.required(customMessage);
      
      expect(rule.message).toBe(customMessage);
      expect(rule.test('')).toBe(false);
    });
  });

  describe('validationRules.minLength', () => {
    it('should validate minimum length', () => {
      const rule = validationRules.minLength(5);
      
      expect(rule.test('hello')).toBe(true);
      expect(rule.test('hello world')).toBe(true);
      expect(rule.test('hi')).toBe(false);
      expect(rule.test('')).toBe(true); // Empty is allowed for optional fields
      expect(rule.message).toBe('Must be at least 5 characters');
    });

    it('should accept custom message', () => {
      const customMessage = 'Password too short';
      const rule = validationRules.minLength(8, customMessage);
      
      expect(rule.message).toBe(customMessage);
      expect(rule.test('short')).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const rule = validationRules.minLength(5);
      
      expect(rule.test(null as any)).toBe(true);
      expect(rule.test(undefined as any)).toBe(true);
    });
  });

  describe('validationRules.maxLength', () => {
    it('should validate maximum length', () => {
      const rule = validationRules.maxLength(5);
      
      expect(rule.test('hello')).toBe(true);
      expect(rule.test('hi')).toBe(true);
      expect(rule.test('')).toBe(true);
      expect(rule.test('hello world')).toBe(false);
      expect(rule.message).toBe('Must be no more than 5 characters');
    });

    it('should accept custom message', () => {
      const customMessage = 'Username too long';
      const rule = validationRules.maxLength(20, customMessage);
      
      expect(rule.message).toBe(customMessage);
      expect(rule.test('very long username that exceeds limit')).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const rule = validationRules.maxLength(5);
      
      expect(rule.test(null as any)).toBe(true);
      expect(rule.test(undefined as any)).toBe(true);
    });
  });

  describe('validationRules.email', () => {
    it('should validate email format', () => {
      const rule = validationRules.email();
      
      expect(rule.test('test@example.com')).toBe(true);
      expect(rule.test('user.name@domain.co.uk')).toBe(true);
      expect(rule.test('user+tag@example.org')).toBe(true);
      expect(rule.test('')).toBe(true); // Empty is allowed for optional fields
      expect(rule.test('invalid-email')).toBe(false);
      expect(rule.test('test@')).toBe(false);
      expect(rule.test('@example.com')).toBe(false);
      expect(rule.test('test.example.com')).toBe(false);
      expect(rule.message).toBe('Must be a valid email address');
    });

    it('should accept custom message', () => {
      const customMessage = 'Please enter a valid email';
      const rule = validationRules.email(customMessage);
      
      expect(rule.message).toBe(customMessage);
      expect(rule.test('invalid')).toBe(false);
    });
  });

  describe('validationRules.number', () => {
    it('should validate number values', () => {
      const rule = validationRules.number();
      
      expect(rule.test(123)).toBe(true);
      expect(rule.test('123')).toBe(true);
      expect(rule.test('123.45')).toBe(true);
      expect(rule.test('-123')).toBe(true);
      expect(rule.test(0)).toBe(true);
      expect(rule.test('0')).toBe(true);
      expect(rule.test('')).toBe(true); // Empty is allowed for optional fields
      expect(rule.test('abc')).toBe(false);
      expect(rule.test('12abc')).toBe(false);
      expect(rule.message).toBe('Must be a valid number');
    });

    it('should accept custom message', () => {
      const customMessage = 'Enter a valid number';
      const rule = validationRules.number(customMessage);
      
      expect(rule.message).toBe(customMessage);
      expect(rule.test('invalid')).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const rule = validationRules.number();
      
      expect(rule.test(null as any)).toBe(true);
      expect(rule.test(undefined as any)).toBe(true);
    });
  });

  describe('validationRules.min', () => {
    it('should validate minimum value', () => {
      const rule = validationRules.min(10);
      
      expect(rule.test(10)).toBe(true);
      expect(rule.test('10')).toBe(true);
      expect(rule.test(15)).toBe(true);
      expect(rule.test('15')).toBe(true);
      expect(rule.test(0)).toBe(false); // Zero fails min(10) test
      expect(rule.test('0')).toBe(false);
      expect(rule.test(5)).toBe(false);
      expect(rule.test('5')).toBe(false);
      expect(rule.test('')).toBe(true); // Empty is allowed for optional fields
      expect(rule.message).toBe('Must be at least 10');
    });

    it('should accept custom message', () => {
      const customMessage = 'Value too small';
      const rule = validationRules.min(5, customMessage);
      
      expect(rule.message).toBe(customMessage);
      expect(rule.test(3)).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const rule = validationRules.min(10);
      
      expect(rule.test(null as any)).toBe(true);
      expect(rule.test(undefined as any)).toBe(true);
    });
  });

  describe('validationRules.max', () => {
    it('should validate maximum value', () => {
      const rule = validationRules.max(100);
      
      expect(rule.test(100)).toBe(true);
      expect(rule.test('100')).toBe(true);
      expect(rule.test(50)).toBe(true);
      expect(rule.test('50')).toBe(true);
      expect(rule.test(0)).toBe(true);
      expect(rule.test('0')).toBe(true);
      expect(rule.test(150)).toBe(false);
      expect(rule.test('150')).toBe(false);
      expect(rule.test('')).toBe(true); // Empty is allowed for optional fields
      expect(rule.message).toBe('Must be no more than 100');
    });

    it('should accept custom message', () => {
      const customMessage = 'Value too large';
      const rule = validationRules.max(50, customMessage);
      
      expect(rule.message).toBe(customMessage);
      expect(rule.test(75)).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const rule = validationRules.max(100);
      
      expect(rule.test(null as any)).toBe(true);
      expect(rule.test(undefined as any)).toBe(true);
    });
  });

  describe('validationRules.pattern', () => {
    it('should validate regex patterns', () => {
      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
      const rule = validationRules.pattern(phoneRegex);
      
      expect(rule.test('123-456-7890')).toBe(true);
      expect(rule.test('')).toBe(true); // Empty is allowed for optional fields
      expect(rule.test('1234567890')).toBe(false);
      expect(rule.test('123-45-6789')).toBe(false);
      expect(rule.message).toBe('Invalid format');
    });

    it('should accept custom message', () => {
      const customMessage = 'Invalid phone format';
      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
      const rule = validationRules.pattern(phoneRegex, customMessage);
      
      expect(rule.message).toBe(customMessage);
      expect(rule.test('invalid')).toBe(false);
    });

    it('should work with complex patterns', () => {
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      const rule = validationRules.pattern(strongPasswordRegex, 'Password must be strong');
      
      expect(rule.test('StrongP@ss1')).toBe(true);
      expect(rule.test('weakpass')).toBe(false);
      expect(rule.test('')).toBe(true); // Empty allowed
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
        {
          field: 'name',
          rules: [validationRules.required(), validationRules.minLength(2)],
        },
        {
          field: 'email',
          rules: [validationRules.required(), validationRules.email()],
        },
        {
          field: 'age',
          rules: [validationRules.number(), validationRules.min(18)],
        },
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
        {
          field: 'name',
          rules: [validationRules.required('Name is required')],
        },
        {
          field: 'email',
          rules: [validationRules.email('Invalid email format')],
        },
        {
          field: 'age',
          rules: [validationRules.number('Age must be a number')],
        },
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
        {
          field: 'password',
          rules: [
            validationRules.required('Password is required'),
            validationRules.minLength(8, 'Password too short'),
          ],
        },
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
        {
          field: 'name',
          rules: [validationRules.required('Name is required')],
        },
        {
          field: 'email',
          rules: [validationRules.email()],
        },
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

  describe('dndValidators', () => {
    describe('characterName', () => {
      it('should have correct validation rules', () => {
        const validators = dndValidators.characterName;
        
        expect(validators).toHaveLength(3);
        expect(validators[0].message).toBe('Character name is required');
        expect(validators[1].message).toBe('Character name must be at least 2 characters');
        expect(validators[2].message).toBe('Character name must be no more than 50 characters');
      });

      it('should validate character names correctly', () => {
        const validators = dndValidators.characterName;
        
        // Valid names
        expect(validators[0].test('Aragorn')).toBe(true);
        expect(validators[1].test('Aragorn')).toBe(true);
        expect(validators[2].test('Aragorn')).toBe(true);

        // Invalid names
        expect(validators[0].test('')).toBe(false); // Required
        expect(validators[1].test('A')).toBe(false); // Too short
        expect(validators[2].test('A'.repeat(51))).toBe(false); // Too long
      });
    });

    describe('abilityScore', () => {
      it('should have correct validation rules', () => {
        const validators = dndValidators.abilityScore;
        
        expect(validators).toHaveLength(4);
        expect(validators[0].message).toBe('Ability score is required');
        expect(validators[1].message).toBe('Ability score must be a number');
        expect(validators[2].message).toBe('Ability score must be at least 1');
        expect(validators[3].message).toBe('Ability score cannot exceed 30');
      });

      it('should validate ability scores correctly', () => {
        const validators = dndValidators.abilityScore;
        
        // Valid scores
        expect(validators[1].test(15)).toBe(true);
        expect(validators[2].test(15)).toBe(true);
        expect(validators[3].test(15)).toBe(true);

        // Invalid scores
        expect(validators[1].test('not-a-number')).toBe(false);
        expect(validators[2].test(0)).toBe(false);
        expect(validators[3].test(35)).toBe(false);
      });
    });

    describe('hitPoints', () => {
      it('should have correct validation rules', () => {
        const validators = dndValidators.hitPoints;
        
        expect(validators).toHaveLength(4);
        expect(validators[0].message).toBe('Hit points are required');
        expect(validators[1].message).toBe('Hit points must be a number');
        expect(validators[2].message).toBe('Hit points cannot be negative');
        expect(validators[3].message).toBe('Hit points cannot exceed 9999');
      });

      it('should validate hit points correctly', () => {
        const validators = dndValidators.hitPoints;
        
        // Valid HP
        expect(validators[1].test(50)).toBe(true);
        expect(validators[2].test(0)).toBe(true); // Zero HP allowed
        expect(validators[3].test(100)).toBe(true);

        // Invalid HP
        expect(validators[2].test(-5)).toBe(false);
        expect(validators[3].test(10000)).toBe(false);
      });
    });

    describe('armorClass', () => {
      it('should have correct validation rules', () => {
        const validators = dndValidators.armorClass;
        
        expect(validators).toHaveLength(4);
        expect(validators[0].message).toBe('Armor class is required');
        expect(validators[1].message).toBe('Armor class must be a number');
        expect(validators[2].message).toBe('Armor class must be at least 1');
        expect(validators[3].message).toBe('Armor class cannot exceed 30');
      });

      it('should validate armor class correctly', () => {
        const validators = dndValidators.armorClass;
        
        // Valid AC
        expect(validators[1].test(15)).toBe(true);
        expect(validators[2].test(10)).toBe(true);
        expect(validators[3].test(20)).toBe(true);

        // Invalid AC
        expect(validators[2].test(0)).toBe(false);
        expect(validators[3].test(35)).toBe(false);
      });
    });

    describe('initiative', () => {
      it('should have correct validation rules', () => {
        const validators = dndValidators.initiative;
        
        expect(validators).toHaveLength(3);
        expect(validators[0].message).toBe('Initiative must be a number');
        expect(validators[1].message).toBe('Initiative modifier cannot be less than -10');
        expect(validators[2].message).toBe('Initiative modifier cannot exceed +20');
      });

      it('should validate initiative correctly', () => {
        const validators = dndValidators.initiative;
        
        // Valid initiative
        expect(validators[0].test(5)).toBe(true);
        expect(validators[1].test(-5)).toBe(true);
        expect(validators[2].test(10)).toBe(true);

        // Invalid initiative
        expect(validators[1].test(-15)).toBe(false);
        expect(validators[2].test(25)).toBe(false);
      });
    });

    describe('level', () => {
      it('should have correct validation rules', () => {
        const validators = dndValidators.level;
        
        expect(validators).toHaveLength(4);
        expect(validators[0].message).toBe('Level is required');
        expect(validators[1].message).toBe('Level must be a number');
        expect(validators[2].message).toBe('Level must be at least 1');
        expect(validators[3].message).toBe('Level cannot exceed 20');
      });

      it('should validate level correctly', () => {
        const validators = dndValidators.level;
        
        // Valid levels
        expect(validators[1].test(10)).toBe(true);
        expect(validators[2].test(1)).toBe(true);
        expect(validators[3].test(20)).toBe(true);

        // Invalid levels
        expect(validators[2].test(0)).toBe(false);
        expect(validators[3].test(21)).toBe(false);
      });
    });
  });

  describe('extractFormData', () => {
    it('should extract data from HTML form element', () => {
      // Create a mock form element
      const formElement = document.createElement('form');
      
      // Add input elements
      const nameInput = document.createElement('input');
      nameInput.name = 'name';
      nameInput.value = 'John Doe';
      formElement.appendChild(nameInput);

      const emailInput = document.createElement('input');
      emailInput.name = 'email';
      emailInput.value = 'john@example.com';
      formElement.appendChild(emailInput);

      // Mock FormData to simulate browser behavior
      const mockFormData = new Map();
      mockFormData.set('name', 'John Doe');
      mockFormData.set('email', 'john@example.com');

      // Mock FormData constructor
      const originalFormData = global.FormData;
      global.FormData = jest.fn().mockImplementation(() => ({
        entries: () => mockFormData.entries(),
      })) as any;

      const result = extractFormData(formElement);

      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
      });

      // Restore original FormData
      global.FormData = originalFormData;
    });

    it('should handle empty form', () => {
      const formElement = document.createElement('form');
      
      // Mock empty FormData
      const mockFormData = new Map();

      const originalFormData = global.FormData;
      global.FormData = jest.fn().mockImplementation(() => ({
        entries: () => mockFormData.entries(),
      })) as any;

      const result = extractFormData(formElement);

      expect(result).toEqual({});

      global.FormData = originalFormData;
    });

    it('should handle multiple values for same field', () => {
      const formElement = document.createElement('form');
      
      // Mock FormData with multiple values
      const mockFormData = new Map();
      mockFormData.set('hobbies', 'reading');
      // Note: FormData.entries() would only return the last value for duplicate keys
      // This simulates that behavior

      const originalFormData = global.FormData;
      global.FormData = jest.fn().mockImplementation(() => ({
        entries: () => mockFormData.entries(),
      })) as any;

      const result = extractFormData(formElement);

      expect(result).toEqual({
        hobbies: 'reading',
      });

      global.FormData = originalFormData;
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
        { field: 'characterName', rules: dndValidators.characterName },
        { field: 'level', rules: dndValidators.level },
        { field: 'hitPoints', rules: dndValidators.hitPoints },
        { field: 'armorClass', rules: dndValidators.armorClass },
        { field: 'strength', rules: dndValidators.abilityScore },
        { field: 'dexterity', rules: dndValidators.abilityScore },
        { field: 'constitution', rules: dndValidators.abilityScore },
        { field: 'intelligence', rules: dndValidators.abilityScore },
        { field: 'wisdom', rules: dndValidators.abilityScore },
        { field: 'charisma', rules: dndValidators.abilityScore },
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
        { field: 'characterName', rules: dndValidators.characterName },
        { field: 'level', rules: dndValidators.level },
        { field: 'hitPoints', rules: dndValidators.hitPoints },
        { field: 'armorClass', rules: dndValidators.armorClass },
        { field: 'strength', rules: dndValidators.abilityScore },
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