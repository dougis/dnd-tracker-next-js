import React from 'react';
import { render, screen } from '@testing-library/react';
import { BasicInfoSection } from '../../sections/BasicInfoSection';
import {
  setupSectionTest,
  expectFieldToBeRequired,
  expectBasicInfoFieldsToBeRendered,
  testFieldChanges,
  testFieldErrors,
  testCharacterCount,
  testSectionLayout,
  testSectionAccessibility,
  FieldChangeTestCase,
  ErrorTestCase
} from '../utils';

describe('BasicInfoSection', () => {
  const { defaultSectionProps } = setupSectionTest();

  const testProps = {
    ...defaultSectionProps,
    value: {
      name: '',
      type: 'pc' as const,
      race: 'human' as const,
      customRace: '',
    },
  };

  // Define test data for data-driven testing
  const fieldChangeTestCases: FieldChangeTestCase<typeof testProps.value>[] = [
    {
      fieldName: 'name',
      labelPattern: /character name/i,
      newValue: 'Test Character',
      expectedStateChange: { name: 'Test Character' },
    },
    {
      fieldName: 'type',
      labelPattern: /character type/i,
      newValue: 'npc',
      expectedStateChange: { type: 'npc' },
    },
    {
      fieldName: 'race',
      labelPattern: /race/i,
      newValue: 'elf',
      expectedStateChange: { race: 'elf' },
    },
    {
      fieldName: 'customRace',
      labelPattern: /custom race name/i,
      newValue: 'Test Race',
      expectedStateChange: { customRace: 'Test Race' },
    },
  ];

  const errorTestCases: ErrorTestCase[] = [
    {
      fieldName: 'name',
      errorMessage: 'Character name is required',
      labelPattern: /character name/i,
    },
    {
      fieldName: 'type',
      errorMessage: 'Character type is required',
      labelPattern: /character type/i,
    },
    {
      fieldName: 'race',
      errorMessage: 'Race is required',
      labelPattern: /race/i,
    },
  ];

  describe('Character Name Field', () => {
    it('renders character name input with proper label', () => {
      render(<BasicInfoSection {...testProps} />);

      const nameField = screen.getByLabelText(/character name/i);
      expect(nameField).toBeInTheDocument();
      expectFieldToBeRequired(nameField);
      expect(nameField).toHaveAttribute('maxlength', '100');
    });

    it('renders all basic info fields using utility', () => {
      render(<BasicInfoSection {...testProps} />);
      expectBasicInfoFieldsToBeRendered();
    });

    // Test character count using utility
    const characterCountTest = testCharacterCount(BasicInfoSection, testProps, 'name', 'Test', 100);
    it(characterCountTest.name, characterCountTest.test);
  });

  describe('Character Type Selection', () => {
    it('renders character type select field', () => {
      render(<BasicInfoSection {...testProps} />);

      const typeField = screen.getByLabelText(/character type/i);
      expect(typeField).toBeInTheDocument();
      expect(typeField).toHaveAttribute('role', 'combobox');
    });

    it('shows PC selected by default', () => {
      render(<BasicInfoSection {...testProps} />);
      expect(screen.getByText('Player Character')).toBeInTheDocument();
    });
  });

  describe('Race Selection', () => {
    it('renders race select field', () => {
      render(<BasicInfoSection {...testProps} />);

      const raceField = screen.getByLabelText(/race/i);
      expect(raceField).toBeInTheDocument();
      expect(raceField).toHaveAttribute('role', 'combobox');
    });

    it('displays current race value', () => {
      const props = {
        ...testProps,
        value: { ...testProps.value, race: 'elf' },
      };
      render(<BasicInfoSection {...props} />);

      expect(screen.getByText('Elf')).toBeInTheDocument();
    });

    it('shows custom race input when custom is selected', () => {
      const props = {
        ...testProps,
        value: { ...testProps.value, race: 'custom' as const },
      };
      render(<BasicInfoSection {...props} />);

      const customRaceField = screen.getByLabelText(/custom race name/i);
      expect(customRaceField).toBeInTheDocument();
      expect(customRaceField).toHaveAttribute('aria-required', 'true');
      expect(customRaceField).toHaveAttribute('maxlength', '50');
    });

    // Test custom race character count using utility
    const customRaceCountTest = testCharacterCount(
      BasicInfoSection,
      { ...testProps, value: { ...testProps.value, race: 'custom' as const } },
      'customRace',
      'Test',
      50
    );
    it(customRaceCountTest.name, customRaceCountTest.test);

    it('shows validation error for custom race', () => {
      const props = {
        ...testProps,
        value: { ...testProps.value, race: 'custom' as const },
        errors: { customRace: 'Custom race name is required' },
      };
      render(<BasicInfoSection {...props} />);

      expect(screen.getByText('Custom race name is required')).toBeInTheDocument();
    });
  });

  // Data-driven field change tests
  describe('Field Value Changes', () => {
    const fieldChangeTests = testFieldChanges(BasicInfoSection, testProps.value, fieldChangeTestCases);
    fieldChangeTests.forEach(({ name, test }) => {
      it(name, test);
    });
  });

  // Data-driven error validation tests
  describe('Field Error Validation', () => {
    const errorTests = testFieldErrors(BasicInfoSection, testProps, errorTestCases);
    errorTests.forEach(({ name, test }) => {
      it(name, test);
    });
  });

  // Section layout tests using utility
  describe('Section Layout', () => {
    const layoutTests = testSectionLayout(BasicInfoSection, testProps, {
      title: 'Basic Information',
      description: "character's fundamental details",
      testId: 'basic-info-section',
      expectedClasses: ['space-y-4'],
    });
    layoutTests.forEach(({ name, test }) => {
      it(name, test);
    });

    it('groups name and type fields together', () => {
      render(<BasicInfoSection {...testProps} />);

      const nameField = screen.getByLabelText(/character name/i);
      const typeField = screen.getByLabelText(/character type/i);

      const nameContainer = nameField.closest('[data-testid="name-type-group"]');
      const typeContainer = typeField.closest('[data-testid="name-type-group"]');

      expect(nameContainer).toBe(typeContainer);
    });
  });

  // Accessibility tests using utility
  describe('Accessibility', () => {
    const accessibilityTests = testSectionAccessibility(BasicInfoSection, testProps, {
      headingText: 'Basic Information',
      headingLevel: 3,
      fieldPatterns: [/character name/i, /character type/i, /race/i],
      describedByFields: [
        { field: /character name/i, describedBy: /choose a memorable name/i }
      ],
    });
    accessibilityTests.forEach(({ name, test }) => {
      it(name, test);
    });

    it('links helper text to field with proper ID relationship', () => {
      render(<BasicInfoSection {...testProps} />);

      const nameField = screen.getByLabelText(/character name/i);
      const describedBy = nameField.getAttribute('aria-describedby');
      const helperText = screen.getByText(/choose a memorable name/i);

      expect(helperText.id).toBe(describedBy);
      expect(describedBy).toMatch(/-helper$/);
    });

    it('announces validation errors to screen readers', () => {
      const props = {
        ...testProps,
        errors: { name: 'Character name is required' },
      };
      render(<BasicInfoSection {...props} />);

      const errorMessage = screen.getByText('Character name is required');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      const nameField = screen.getByLabelText(/character name/i);
      expect(nameField).toHaveAttribute('aria-invalid', 'true');
    });
  });
});