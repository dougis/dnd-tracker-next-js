const Sequencer = require('@jest/test-sequencer').default;

/**
 * Custom Jest test sequencer for optimal parallel execution
 * 
 * This sequencer optimizes test execution by:
 * 1. Running slower tests first to maximize parallel utilization
 * 2. Grouping tests by type (unit, integration, e2e)
 * 3. Separating database-dependent tests from pure unit tests
 * 4. Prioritizing critical path tests
 */
class CustomSequencer extends Sequencer {
  sort(tests) {
    // Create a copy of the tests array to avoid mutation
    const sortedTests = Array.from(tests);
    
    // Sort tests by priority and estimated execution time
    return sortedTests.sort((testA, testB) => {
      const pathA = testA.path;
      const pathB = testB.path;
      
      // Priority 1: API tests (typically slower, database-dependent)
      const isApiTestA = pathA.includes('/api/');
      const isApiTestB = pathB.includes('/api/');
      
      if (isApiTestA && !isApiTestB) return -1;
      if (!isApiTestA && isApiTestB) return 1;
      
      // Priority 2: Component tests (medium complexity)
      const isComponentTestA = pathA.includes('/components/');
      const isComponentTestB = pathB.includes('/components/');
      
      if (isComponentTestA && !isComponentTestB) return -1;
      if (!isComponentTestA && isComponentTestB) return 1;
      
      // Priority 3: Hook tests (typically faster)
      const isHookTestA = pathA.includes('/hooks/');
      const isHookTestB = pathB.includes('/hooks/');
      
      if (isHookTestA && !isHookTestB) return 1;
      if (!isHookTestA && isHookTestB) return -1;
      
      // Priority 4: Service layer tests (medium complexity)
      const isServiceTestA = pathA.includes('/services/');
      const isServiceTestB = pathB.includes('/services/');
      
      if (isServiceTestA && !isServiceTestB) return -1;
      if (!isServiceTestA && isServiceTestB) return 1;
      
      // Priority 5: Validation tests (typically fast)
      const isValidationTestA = pathA.includes('/validations/');
      const isValidationTestB = pathB.includes('/validations/');
      
      if (isValidationTestA && !isValidationTestB) return 1;
      if (!isValidationTestA && isValidationTestB) return -1;
      
      // Priority 6: Utility tests (typically fastest)
      const isUtilTestA = pathA.includes('/utils/');
      const isUtilTestB = pathB.includes('/utils/');
      
      if (isUtilTestA && !isUtilTestB) return 1;
      if (!isUtilTestA && isUtilTestB) return -1;
      
      // Secondary sort: by file size (larger files typically have more tests)
      const sizeA = testA.context?.hasteFS?.getSize?.(pathA) || 0;
      const sizeB = testB.context?.hasteFS?.getSize?.(pathB) || 0;
      
      if (sizeA !== sizeB) {
        return sizeB - sizeA; // Larger files first
      }
      
      // Tertiary sort: alphabetical for consistency
      return pathA.localeCompare(pathB);
    });
  }
}

module.exports = CustomSequencer;