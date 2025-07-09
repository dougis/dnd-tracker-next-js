// Main test entry point for CharacterValidationForm
// Tests have been split into focused files for better maintainability:

import './CharacterValidationForm.rendering.test';
import './CharacterValidationForm.validation.test';
import './CharacterValidationForm.sections.test';
import './CharacterValidationForm.classes.test';
import './CharacterValidationForm.submission.test';
import './CharacterValidationForm.modal.test';

// Note: This file serves as a centralized entry point for all CharacterValidationForm tests.
// Each test file focuses on a specific aspect of the component:
//
// - rendering.test: Basic rendering and initial values
// - validation.test: Real-time validation and form status
// - sections.test: Basic info, ability scores, combat stats, and character preview
// - classes.test: Class management (add, remove, limits)
// - submission.test: Form submission, error handling, loading states
// - modal.test: Modal behavior and interactions
//
// This organization keeps each file under the 450-line limit while maintaining
// comprehensive test coverage for the CharacterValidationForm component.