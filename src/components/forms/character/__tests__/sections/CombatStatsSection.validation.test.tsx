import React from 'react';
import { render, screen } from '@testing-library/react';
import { CombatStatsSection } from '../../sections/CombatStatsSection';
import {
  setupSectionTest,
  expectCombatStatsFieldsToBeRendered,
  TEST_CHARACTER_DATA,
  DEFAULT_HIT_POINTS
} from '../utils';

describe('CombatStatsSection - Validation and Edge Cases', () => {
  const { defaultSectionProps } = setupSectionTest();

  const testProps = {
    ...defaultSectionProps,
    value: {
      hitPoints: DEFAULT_HIT_POINTS,
      armorClass: 12,
      speed: 30,
      proficiencyBonus: 2,
    },
    abilityScores: TEST_CHARACTER_DATA.enhancedAbilities,
    classes: [{ className: 'fighter', level: 1 }],
  };

  describe('Component Rendering', () => {
    it('renders all combat stats fields using utility', () => {
      render(<CombatStatsSection {...testProps} />);
      expectCombatStatsFieldsToBeRendered();
    });
  });

  describe('Calculated Values Display', () => {
    it('calculates and displays initiative modifier from dexterity', () => {
      const props = {
        ...testProps,
        abilityScores: { ...testProps.abilityScores, dexterity: 16 },
      };
      render(<CombatStatsSection {...props} />);

      // Dexterity 16 = +3 modifier
      expect(screen.getByText('+3')).toBeInTheDocument();
    });

    it('handles negative dexterity modifier correctly', () => {
      const props = {
        ...testProps,
        abilityScores: { ...testProps.abilityScores, dexterity: 8 },
      };
      render(<CombatStatsSection {...props} />);

      // Dexterity 8 = -1 modifier
      expect(screen.getByText('-1')).toBeInTheDocument();
    });

    it('calculates total level from multiple classes', () => {
      const props = {
        ...testProps,
        classes: [
          { className: 'fighter', level: 3 },
          { className: 'rogue', level: 2 },
        ],
      };
      render(<CombatStatsSection {...props} />);

      expect(screen.getByText('5')).toBeInTheDocument(); // total level
    });

    it('calculates proficiency bonus based on total level', () => {
      const props = {
        ...testProps,
        classes: [
          { className: 'fighter', level: 4 },
          { className: 'rogue', level: 1 },
        ],
      };
      render(<CombatStatsSection {...props} />);

      // Level 5 = +3 proficiency bonus
      const suggestedText = screen.getByText(/suggested based on level: \+3/i);
      expect(suggestedText).toBeInTheDocument();
    });

    it('displays correct hit die for different classes', () => {
      const fighterProps = {
        ...testProps,
        classes: [{ className: 'fighter', level: 1 }],
      };
      render(<CombatStatsSection {...fighterProps} />);
      expect(screen.getByText('d10')).toBeInTheDocument();

      // Test barbarian
      const barbarianProps = {
        ...testProps,
        classes: [{ className: 'barbarian', level: 1 }],
      };
      render(<CombatStatsSection {...barbarianProps} />);
      expect(screen.getByText('d12')).toBeInTheDocument();

      // Test wizard (d6 class)
      const wizardProps = {
        ...testProps,
        classes: [{ className: 'wizard', level: 1 }],
      };
      render(<CombatStatsSection {...wizardProps} />);
      expect(screen.getByText('d6')).toBeInTheDocument();
    });

    it('shows default hit die when no classes', () => {
      const props = {
        ...testProps,
        classes: [],
      };
      render(<CombatStatsSection {...props} />);

      expect(screen.getByText('d8')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error messages for hit points fields', () => {
      const props = {
        ...testProps,
        errors: {
          maxHitPoints: 'Maximum hit points is required',
          currentHitPoints: 'Current hit points cannot exceed maximum',
          temporaryHitPoints: 'Temporary hit points must be positive',
        },
      };
      render(<CombatStatsSection {...props} />);

      expect(screen.getByText('Maximum hit points is required')).toBeInTheDocument();
      expect(screen.getByText('Current hit points cannot exceed maximum')).toBeInTheDocument();
      expect(screen.getByText('Temporary hit points must be positive')).toBeInTheDocument();
    });

    it('displays error messages for combat stats', () => {
      const props = {
        ...testProps,
        errors: {
          armorClass: 'Armor class is required',
          speed: 'Speed must be a positive number',
          proficiencyBonus: 'Proficiency bonus must be between 2 and 6',
        },
      };
      render(<CombatStatsSection {...props} />);

      expect(screen.getByText('Armor class is required')).toBeInTheDocument();
      expect(screen.getByText('Speed must be a positive number')).toBeInTheDocument();
      expect(screen.getByText('Proficiency bonus must be between 2 and 6')).toBeInTheDocument();
    });
  });

  describe('Field Constraints', () => {
    it('sets proper min/max values for hit points fields', () => {
      render(<CombatStatsSection {...testProps} />);

      const maxHpField = screen.getByLabelText(/maximum hit points/i);
      expect(maxHpField).toHaveAttribute('min', '1');
      expect(maxHpField).toHaveAttribute('max', '9999');

      const currentHpField = screen.getByLabelText(/current hit points/i);
      expect(currentHpField).toHaveAttribute('min', '0');
      expect(currentHpField).toHaveAttribute('max', '10'); // matches maximum

      const tempHpField = screen.getByLabelText(/temporary hit points/i);
      expect(tempHpField).toHaveAttribute('min', '0');
      expect(tempHpField).toHaveAttribute('max', '999');
    });

    it('sets proper min/max values for combat stats', () => {
      render(<CombatStatsSection {...testProps} />);

      const acField = screen.getByLabelText(/armor class/i);
      expect(acField).toHaveAttribute('min', '1');
      expect(acField).toHaveAttribute('max', '30');

      const speedField = screen.getByLabelText(/speed \(feet\)/i);
      expect(speedField).toHaveAttribute('min', '0');
      expect(speedField).toHaveAttribute('max', '120');

      const profBonusField = screen.getByLabelText(/proficiency bonus/i);
      expect(profBonusField).toHaveAttribute('min', '2');
      expect(profBonusField).toHaveAttribute('max', '6');
    });

    it('marks required fields properly', () => {
      render(<CombatStatsSection {...testProps} />);

      expect(screen.getByLabelText(/maximum hit points/i)).toHaveAttribute('required');
      expect(screen.getByLabelText(/current hit points/i)).toHaveAttribute('required');
      expect(screen.getByLabelText(/armor class/i)).toHaveAttribute('required');

      // Optional fields should not have required attribute
      expect(screen.getByLabelText(/temporary hit points/i)).not.toHaveAttribute('required');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing optional values gracefully', () => {
      const props = {
        ...testProps,
        value: {
          hitPoints: {
            maximum: 10,
            current: 10,
          },
          armorClass: 12,
        },
      };
      render(<CombatStatsSection {...props} />);

      // Should display defaults for missing values
      expect(screen.getByDisplayValue('0')).toBeInTheDocument(); // temporary HP
      expect(screen.getByDisplayValue('30')).toBeInTheDocument(); // speed default
    });
  });

  describe('Accessibility', () => {
    it('has proper section heading structure', () => {
      render(<CombatStatsSection {...testProps} />);

      const heading = screen.getByRole('heading', { name: /combat statistics/i });
      expect(heading).toHaveAttribute('aria-level', '3');
    });

    it('has proper form field types and attributes', () => {
      render(<CombatStatsSection {...testProps} />);

      const numberFields = [
        /maximum hit points/i,
        /current hit points/i,
        /temporary hit points/i,
        /armor class/i,
        /speed/i,
        /proficiency bonus/i,
      ];

      numberFields.forEach(fieldPattern => {
        const field = screen.getByLabelText(fieldPattern);
        expect(field).toHaveAttribute('type', 'number');
      });
    });
  });
});