// Main test entry point for useRoundTracking hook
// Tests have been split into focused files for better maintainability:

import './useRoundTracking.rounds.test';
import './useRoundTracking.duration.test';
import './useRoundTracking.effects.test';
import './useRoundTracking.triggers.test';
import './useRoundTracking.history.test';
import './useRoundTracking.summary.test';
import './useRoundTracking.performance.test';
import './useRoundTracking.errors.test';

// Note: This file serves as a centralized entry point for all useRoundTracking tests.
// Each test file focuses on a specific aspect of the hook:
//
// - rounds.test: Round management (next, previous, set, validation)
// - duration.test: Duration tracking and calculations
// - effects.test: Effect management (add, remove, expiry)
// - triggers.test: Trigger management (add, activate, due/upcoming)
// - history.test: History tracking and event management
// - summary.test: Session summary and data export
// - performance.test: Performance optimizations and memory management
// - errors.test: Error handling and edge cases
//
// This organization keeps each file under the 450-line limit while maintaining
// comprehensive test coverage for the useRoundTracking hook.