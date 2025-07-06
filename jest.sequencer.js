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
    return sortedTests.sort(this.compareTests.bind(this));
  }

  compareTests(testA, testB) {
    const pathA = testA.path;
    const pathB = testB.path;

    // Use priority-based comparison
    const priorityA = this.getTestPriority(pathA);
    const priorityB = this.getTestPriority(pathB);

    if (priorityA !== priorityB) {
      return priorityA - priorityB; // Lower priority number = higher priority
    }

    // Secondary sort: by file size (larger files typically have more tests)
    const sizeA = testA.context?.hasteFS?.getSize?.(pathA) || 0;
    const sizeB = testB.context?.hasteFS?.getSize?.(pathB) || 0;

    if (sizeA !== sizeB) {
      return sizeB - sizeA; // Larger files first
    }

    // Tertiary sort: alphabetical for consistency
    return pathA.localeCompare(pathB);
  }

  getTestPriority(path) {
    // Priority 1: API tests (typically slower, database-dependent)
    if (path.includes('/api/')) return 1;

    // Priority 2: Component tests (medium complexity)
    if (path.includes('/components/')) return 2;

    // Priority 3: Service layer tests (medium complexity)
    if (path.includes('/services/')) return 3;

    // Priority 4: Validation tests (typically fast)
    if (path.includes('/validations/')) return 4;

    // Priority 5: Hook tests (typically faster)
    if (path.includes('/hooks/')) return 5;

    // Priority 6: Utility tests (typically fastest)
    if (path.includes('/utils/')) return 6;

    // Default priority for other tests
    return 7;
  }
}

module.exports = CustomSequencer;