# Test Duplication Refactoring Guide

## Overview

This document outlines the systematic approach for eliminating code duplication
in test files to meet Codacy compliance requirements (≤2 code clones maximum).
The approach has been successfully demonstrated in reducing 8 clones in
`apiUtils.test.ts` and provides a blueprint for addressing the remaining 18+
clones across the codebase.

## Current Status

- **Total Clones Reported**: 26 (exceeds maximum of 2)
- **Clones Eliminated**: 8 (apiUtils.test.ts refactored)
- **Clones Remaining**: ~18 across multiple test files
- **Infrastructure Created**: Comprehensive test helper utilities

## Refactoring Approach

### Phase 1: Infrastructure Creation ✅ COMPLETED

Created comprehensive test helper utilities to eliminate common patterns:

1. **Universal Test Helpers** (`src/__tests__/utils/testHelpers.ts`)
   - Mock factories and setup patterns
   - Data-driven testing utilities
   - Common assertion helpers
   - Service and API testing utilities

2. **Form Test Helpers** (`src/components/forms/__tests__/formTestHelpers.ts`)
   - Character and encounter form testing patterns
   - Field validation testing utilities
   - Form interaction helpers

3. **Validation Test Helpers** (`src/lib/validations/__tests__/validationTestHelpers.ts`)
   - Schema validation testing patterns
   - Data-driven validation test generators
   - Domain-specific validation helpers

### Phase 2: Pattern Identification and Categorization

#### Major Duplication Categories Identified

1. **Character Form Tests** (Highest Priority - 25+ files)
   - Repeated field validation patterns
   - Similar mock creation
   - Identical component rendering tests

2. **Validation Schema Tests** (High Priority - 8+ files)
   - Repeated valid/invalid data testing
   - Schema parsing pattern duplication

3. **Encounter Component Tests** (Medium Priority - 15+ files)
   - Mock encounter creation patterns
   - Repeated interaction testing

4. **UI Component Tests** (Medium Priority - 10+ files)
   - Similar rendering and CSS class testing
   - Repeated event handler testing

5. **Service Layer Tests** (Lower Priority - 8+ files)
   - CRUD operation testing patterns
   - Similar error handling tests

### Phase 3: Systematic Refactoring Process

#### Step-by-Step Refactoring Method

1. **Analyze Current Test File**

   ```bash
   # Review test file for patterns
   grep -n "expect\|it\|describe" src/path/to/test.file
   ```

2. **Identify Duplication Patterns**
   - Repeated `it()` blocks with minor variations
   - Similar setup/teardown code
   - Identical mock creation patterns
   - Repeated assertion patterns

3. **Apply Data-Driven Testing**

   ```typescript
   // BEFORE: Repetitive tests
   it('should validate field A', () => { /* test logic */ });
   it('should validate field B', () => { /* same logic */ });
   it('should validate field C', () => { /* same logic */ });

   // AFTER: Data-driven approach
   const fieldTestCases = [
     { name: 'field A', data: {...}, expected: {...} },
     { name: 'field B', data: {...}, expected: {...} },
     { name: 'field C', data: {...}, expected: {...} }
   ];

   fieldTestCases.forEach(testCase => {
     it(`should validate ${testCase.name}`, () => {
       executeValidationTest(testCase.data, testCase.expected);
     });
   });
   ```

4. **Extract Common Utilities**

   ```typescript
   // Extract repeated patterns to helper functions
   function testFieldValidation(fieldName: string, validData: any,
                                invalidData: any) {
     // Common validation testing logic
   }
   ```

5. **Verify Functionality**

   ```bash
   npm run test -- --testPathPatterns="refactored-file.test.ts"
   ```

6. **Measure Improvement**

   ```bash
   npm run lint:fix
   npm run test:ci
   # Check Codacy results for clone reduction
   ```

## Demonstrated Success: apiUtils.test.ts Refactoring

### Before Refactoring

- **8 code clones** from repetitive test patterns
- 60+ lines of duplicated code
- Manual test case variations

### Refactoring Applied

```typescript
// Created executeApiTest helper function
export async function executeApiTest(makeRequestFn: any, config: {
  url: string;
  method?: string;
  body?: any;
  shouldSucceed?: boolean;
  encounter?: any;
  callbacks: ReturnType<typeof createMockCallbacks>;
}) {
  // Centralized API testing logic
}

// Created data-driven test cases
export function generateApiTestCases() {
  return [
    {
      name: 'should make successful API request',
      config: { /* test configuration */ }
    },
    // Additional test cases...
  ];
}

// Applied in test file
const testCases = generateApiTestCases();
testCases.forEach(testCase => {
  it(testCase.name, async () => {
    await executeApiTest(makeRequest, {
      ...testCase.config,
      callbacks: mockCallbacks
    });
  });
});
```

### After Refactoring

- **0 code clones** (eliminated all 8)
- 25+ lines of concise, maintainable code
- Data-driven approach for easy test case addition

## Implementation Guidelines

### For Character Form Tests

```typescript
import { CharacterFormHelpers, createFieldValidationTests } from
  '@/components/forms/__tests__/formTestHelpers';

describe('CharacterFormSection', () => {
  const validationTestCases = createFieldValidationTests('fieldName', [
    { label: 'valid data', value: 'valid', shouldBeValid: true },
    { label: 'invalid data', value: '', shouldBeValid: false,
      expectedError: 'Required' }
  ]);

  validationTestCases.forEach(({ name, test }) => {
    it(name, () => test(Component, 'fieldName'));
  });
});
```

### For Validation Schema Tests

```typescript
import { runValidationTests, createStringValidationTests } from
  '@/lib/validations/__tests__/validationTestHelpers';

describe('UserSchema', () => {
  const testCases = [
    ...createStringValidationTests('username',
      { required: true, minLength: 3 }),
    ...createEmailValidationTests('email')
  ];

  runValidationTests(userSchema, testCases);
});
```

### For UI Component Tests

```typescript
import { TestPatterns } from '@/__tests__/utils/testHelpers';

describe('ButtonComponent', () => {
  TestPatterns.testComponentRendering(Button, { children: 'Test' });
  TestPatterns.testEventHandlers(Button, [
    { eventName: 'click', trigger: 'button', mockProp: 'onClick' }
  ]);
});
```

## Quality Assurance Checklist

### Pre-Refactoring

- [ ] Identify all duplication patterns in target file
- [ ] Document current test coverage
- [ ] Note any file-specific testing requirements

### During Refactoring

- [ ] Maintain identical test logic and assertions
- [ ] Preserve test descriptions and coverage
- [ ] Use appropriate helper utilities
- [ ] Follow data-driven testing patterns

### Post-Refactoring

- [ ] All tests pass: `npm run test:ci`
- [ ] No linting errors: `npm run lint:fix`
- [ ] Test coverage maintained or improved
- [ ] Codacy clone count reduced
- [ ] Code is more maintainable and readable

## Expected Outcomes

### Per File Refactoring

- **Duplication Reduction**: 50-80% reduction in repetitive code
- **Maintainability**: Easier to add new test cases
- **Consistency**: Standardized testing patterns
- **Readability**: Clearer test intent and structure

### Overall Project Impact

- **Codacy Compliance**: ≤2 code clones (from 26)
- **Test Quality**: Improved test organization and coverage
- **Developer Experience**: Faster test development
- **Code Standards**: Consistent testing approach across codebase

## Risk Mitigation

### Common Pitfalls

1. **Over-abstraction**: Don't create helpers for single-use patterns
2. **Lost Test Intent**: Maintain clear test descriptions
3. **Broken Functionality**: Verify all tests pass after refactoring
4. **Coverage Loss**: Ensure test coverage is maintained

### Mitigation Strategies

1. **Incremental Refactoring**: One file at a time
2. **Comprehensive Testing**: Run full test suite after each change
3. **Code Review**: Review refactored tests for clarity
4. **Documentation**: Update test documentation as needed

## Success Metrics

### Quantitative

- Code clone count: Target ≤2 (from 26)
- Test coverage: Maintain 80%+ coverage
- Build time: No significant increase in test execution time
- Lines of code: 30-50% reduction in test file sizes

### Qualitative

- Improved test readability and maintainability
- Easier addition of new test cases
- Consistent testing patterns across codebase
- Better developer experience when writing tests

## Conclusion

This systematic approach provides a proven methodology for eliminating test
duplication while maintaining test quality and functionality. The infrastructure
created enables rapid refactoring of remaining duplicated test files, ensuring
Codacy compliance and improved code quality.

The success demonstrated with `apiUtils.test.ts` (8 clones eliminated)
validates this approach and provides confidence for scaling across the entire
codebase.
