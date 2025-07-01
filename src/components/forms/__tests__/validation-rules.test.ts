import { validationRules } from '../form-utils';
import { testRuleWithValues, commonAssertions, testData } from './test-utils';

describe('Validation Rules', () => {
  describe('required', () => {
    it('should validate required string fields', () => {
      const rule = validationRules.required();

      testRuleWithValues(
        rule,
        [
          'valid string',
          ' valid with spaces ',
          123,
          0,
          false,
          true,
          [1],
          ['item'],
        ],
        ['', '   ', null, undefined, []]
      );

      expect(rule.message).toBe('This field is required');
    });

    it('should accept custom message', () => {
      const customMessage = 'Custom required message';
      const rule = validationRules.required(customMessage);

      commonAssertions.expectCustomMessage(rule, customMessage);
      expect(rule.test('')).toBe(false);
    });
  });

  describe('minLength', () => {
    it('should validate minimum length', () => {
      const rule = validationRules.minLength(5);

      testRuleWithValues(rule, ['hello', 'hello world', ''], ['hi', 'ab']);

      expect(rule.message).toBe('Must be at least 5 characters');
    });

    it('should accept custom message', () => {
      const customMessage = 'Password too short';
      const rule = validationRules.minLength(8, customMessage);

      commonAssertions.expectCustomMessage(rule, customMessage);
      expect(rule.test('short')).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const rule = validationRules.minLength(5);
      commonAssertions.expectEmptyValueAllowed(rule);
    });
  });

  describe('maxLength', () => {
    it('should validate maximum length', () => {
      const rule = validationRules.maxLength(5);

      testRuleWithValues(
        rule,
        ['hello', 'hi', ''],
        ['hello world', testData.longString]
      );

      expect(rule.message).toBe('Must be no more than 5 characters');
    });

    it('should accept custom message', () => {
      const customMessage = 'Username too long';
      const rule = validationRules.maxLength(20, customMessage);

      commonAssertions.expectCustomMessage(rule, customMessage);
      expect(rule.test('very long username that exceeds limit')).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const rule = validationRules.maxLength(5);
      commonAssertions.expectEmptyValueAllowed(rule);
    });
  });

  describe('email', () => {
    it('should validate email format', () => {
      const rule = validationRules.email();

      testRuleWithValues(
        rule,
        [
          testData.validEmail,
          'user.name@domain.co.uk',
          'user+tag@example.org',
          '',
        ],
        [testData.invalidEmail, 'test@', '@example.com', 'test.example.com']
      );

      expect(rule.message).toBe('Must be a valid email address');
    });

    it('should accept custom message', () => {
      const customMessage = 'Please enter a valid email';
      const rule = validationRules.email(customMessage);

      commonAssertions.expectCustomMessage(rule, customMessage);
      expect(rule.test(testData.invalidEmail)).toBe(false);
    });
  });

  describe('number', () => {
    it('should validate number values', () => {
      const rule = validationRules.number();

      testRuleWithValues(
        rule,
        [123, '123', '123.45', '-123', 0, '0', ''],
        ['abc', '12abc', testData.invalidNumber]
      );

      expect(rule.message).toBe('Must be a valid number');
    });

    it('should accept custom message', () => {
      const customMessage = 'Enter a valid number';
      const rule = validationRules.number(customMessage);

      commonAssertions.expectCustomMessage(rule, customMessage);
      expect(rule.test(testData.invalidNumber)).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const rule = validationRules.number();
      commonAssertions.expectEmptyValueAllowed(rule);
    });
  });

  describe('min', () => {
    it('should validate minimum value', () => {
      const rule = validationRules.min(10);

      testRuleWithValues(rule, [10, '10', 15, '15', ''], [0, '0', 5, '5']);

      expect(rule.message).toBe('Must be at least 10');
    });

    it('should accept custom message', () => {
      const customMessage = 'Value too small';
      const rule = validationRules.min(5, customMessage);

      commonAssertions.expectCustomMessage(rule, customMessage);
      expect(rule.test(3)).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const rule = validationRules.min(10);
      commonAssertions.expectEmptyValueAllowed(rule);
    });
  });

  describe('max', () => {
    it('should validate maximum value', () => {
      const rule = validationRules.max(100);

      testRuleWithValues(
        rule,
        [100, '100', 50, '50', 0, '0', ''],
        [150, '150']
      );

      expect(rule.message).toBe('Must be no more than 100');
    });

    it('should accept custom message', () => {
      const customMessage = 'Value too large';
      const rule = validationRules.max(50, customMessage);

      commonAssertions.expectCustomMessage(rule, customMessage);
      expect(rule.test(75)).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const rule = validationRules.max(100);
      commonAssertions.expectEmptyValueAllowed(rule);
    });
  });

  describe('pattern', () => {
    it('should validate regex patterns', () => {
      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
      const rule = validationRules.pattern(phoneRegex);

      testRuleWithValues(
        rule,
        ['123-456-7890', ''],
        ['1234567890', '123-45-6789']
      );

      expect(rule.message).toBe('Invalid format');
    });

    it('should accept custom message', () => {
      const customMessage = 'Invalid phone format';
      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
      const rule = validationRules.pattern(phoneRegex, customMessage);

      commonAssertions.expectCustomMessage(rule, customMessage);
      expect(rule.test('invalid')).toBe(false);
    });

    it('should work with complex patterns', () => {
      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      const rule = validationRules.pattern(
        strongPasswordRegex,
        'Password must be strong'
      );

      testRuleWithValues(rule, ['StrongP@ss1', ''], ['weakpass']);
    });
  });
});
