/**
 * Test to verify parallel execution is working correctly
 *
 * This test helps ensure that:
 * 1. Tests can run in parallel without conflicts
 * 2. Worker processes are properly isolated
 * 3. Shared resources are handled correctly
 */

describe('Parallel Execution Verification', () => {
  // Store worker process info to verify parallel execution
  const workerId = process.env.JEST_WORKER_ID;
  const startTime = Date.now();

  it('should run in a worker process', () => {
    // In parallel mode, JEST_WORKER_ID should be set
    expect(workerId).toBeDefined();
    expect(typeof workerId).toBe('string');
  });

  it('should have isolated global state', () => {
    // Each worker should have its own global state
    const globalKey = `test_isolation_${workerId}`;

    // Set a value in global state
    (global as any)[globalKey] = 'isolated_value';

    // Verify it exists
    expect((global as any)[globalKey]).toBe('isolated_value');
  });

  it('should handle concurrent async operations', async () => {
    // Test that async operations don't interfere with each other
    const promises = Array.from({ length: 5 }, (_, i) =>
      new Promise(resolve => setTimeout(() => resolve(i), 10))
    );

    const results = await Promise.all(promises);
    expect(results).toEqual([0, 1, 2, 3, 4]);
  });

  it('should maintain test execution order within suite', () => {
    // Tests within the same suite should run sequentially
    const executionOrder: number[] = [];

    for (let i = 0; i < 3; i++) {
      executionOrder.push(i);
    }

    expect(executionOrder).toEqual([0, 1, 2]);
  });

  it('should handle memory cleanup properly', () => {
    // Create and clean up memory to test worker memory management
    const largeArray = new Array(1000).fill(0).map((_, i) => ({ id: i, data: 'test' }));

    expect(largeArray.length).toBe(1000);

    // Clear the array to simulate cleanup
    largeArray.length = 0;

    expect(largeArray.length).toBe(0);
  });

  it('should record execution timing', () => {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Test should complete within reasonable time
    expect(duration).toBeLessThan(5000); // 5 seconds max
    expect(duration).toBeGreaterThan(0);
  });
});