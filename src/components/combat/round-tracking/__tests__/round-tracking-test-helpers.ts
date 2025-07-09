/**
 * Main entry point for round tracking test helpers
 * Organized into focused modules for better maintainability
 */

// Re-export all helpers from focused modules
export * from './helpers/test-data';
export * from './helpers/encounter-helpers';
export * from './helpers/interaction-helpers';
export * from './helpers/assertion-helpers';
export * from './helpers/scenario-helpers';
export * from './helpers/hook-helpers';

// Note: This file serves as a centralized entry point for all round tracking test utilities.
// Helpers have been split into focused modules:
//
// - test-data: Mock data types, constants, and generators
// - encounter-helpers: Encounter creation and setup utilities
// - interaction-helpers: User interaction simulation utilities
// - assertion-helpers: Test assertion and expectation utilities
// - scenario-helpers: Test scenario builders and pre-defined scenarios
// - hook-helpers: useRoundTracking specific test helpers
//
// This organization keeps each file focused and under the 450-line limit while maintaining
// comprehensive test utility coverage for the round tracking system.