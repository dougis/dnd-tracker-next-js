import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CombatStatsSection } from '../../sections/CombatStatsSection';

describe('CombatStatsSection', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    value: {
      hitPoints: {
        maximum: 10,
        current: 10,
        temporary: 0,
      },
      armorClass: 12,
      speed: 30,
      proficiencyBonus: 2,
    },
    onChange: mockOnChange,
    errors: {},
    abilityScores: {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 11,
      charisma: 10,
    },
    classes: [
      { className: 'fighter', level: 1 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders section header with proper title', () => {
      render(<CombatStatsSection {...defaultProps} />);

      expect(screen.getByText('Combat Statistics')).toBeInTheDocument();
      expect(screen.getByText(/set your character's combat-related statistics/i)).toBeInTheDocument();
    });

    it('renders all hit points fields', () => {
      render(<CombatStatsSection {...defaultProps} />);

      expect(screen.getByLabelText(/maximum hit points/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/current hit points/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/temporary hit points/i)).toBeInTheDocument();
    });

    it('renders armor class and speed fields', () => {
      render(<CombatStatsSection {...defaultProps} />);

      expect(screen.getByLabelText(/armor class/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/speed \(feet\)/i)).toBeInTheDocument();
    });

    it('renders proficiency bonus field', () => {
      render(<CombatStatsSection {...defaultProps} />);

      expect(screen.getByLabelText(/proficiency bonus/i)).toBeInTheDocument();
    });

    it('displays calculated values section', () => {
      render(<CombatStatsSection {...defaultProps} />);

      expect(screen.getByText('Calculated Values')).toBeInTheDocument();
      expect(screen.getByText('Initiative')).toBeInTheDocument();
      expect(screen.getByText('Hit Die')).toBeInTheDocument();
      expect(screen.getByText('Total Level')).toBeInTheDocument();
      expect(screen.getByText('Prof. Bonus')).toBeInTheDocument();
    });
  });

  describe('Field Values and Updates', () => {
    it('displays current hit points values', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const maxHpField = screen.getByLabelText(/maximum hit points/i);
      const currentHpField = screen.getByLabelText(/current hit points/i);
      const tempHpField = screen.getByLabelText(/temporary hit points/i);

      expect(maxHpField).toHaveValue(10);
      expect(currentHpField).toHaveValue(10);
      expect(tempHpField).toHaveValue(0);
    });

    it('displays combat stats values', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const acField = screen.getByLabelText(/armor class/i);
      const speedField = screen.getByLabelText(/speed \(feet\)/i);
      const profBonusField = screen.getByLabelText(/proficiency bonus/i);

      expect(acField).toHaveValue(12);
      expect(speedField).toHaveValue(30);
      expect(profBonusField).toHaveValue(2);
    });

    it('calls onChange when maximum hit points is changed', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const maxHpField = screen.getByLabelText(/maximum hit points/i);
      fireEvent.change(maxHpField, { target: { value: '15' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultProps.value,
        hitPoints: {
          ...defaultProps.value.hitPoints,
          maximum: 15,
        },
      });
    });

    it('calls onChange when current hit points is changed', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const currentHpField = screen.getByLabelText(/current hit points/i);
      fireEvent.change(currentHpField, { target: { value: '8' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultProps.value,
        hitPoints: {
          ...defaultProps.value.hitPoints,
          current: 8,
        },
      });
    });

    it('calls onChange when temporary hit points is changed', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const tempHpField = screen.getByLabelText(/temporary hit points/i);
      fireEvent.change(tempHpField, { target: { value: '5' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultProps.value,
        hitPoints: {
          ...defaultProps.value.hitPoints,
          temporary: 5,
        },
      });
    });

    it('calls onChange when armor class is changed', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const acField = screen.getByLabelText(/armor class/i);
      fireEvent.change(acField, { target: { value: '16' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultProps.value,
        armorClass: 16,
      });
    });

    it('calls onChange when speed is changed', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const speedField = screen.getByLabelText(/speed \(feet\)/i);
      fireEvent.change(speedField, { target: { value: '25' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultProps.value,
        speed: 25,
      });
    });

    it('calls onChange when proficiency bonus is changed', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const profBonusField = screen.getByLabelText(/proficiency bonus/i);
      fireEvent.change(profBonusField, { target: { value: '3' } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultProps.value,
        proficiencyBonus: 3,
      });
    });
  });

  describe('Calculated Values Display', () => {
    it('calculates and displays initiative modifier from dexterity', () => {
      const props = {
        ...defaultProps,
        abilityScores: { ...defaultProps.abilityScores, dexterity: 16 },
      };
      render(<CombatStatsSection {...props} />);

      // Dexterity 16 = +3 modifier
      expect(screen.getByText('+3')).toBeInTheDocument();
    });

    it('handles negative dexterity modifier correctly', () => {
      const props = {
        ...defaultProps,
        abilityScores: { ...defaultProps.abilityScores, dexterity: 8 },
      };
      render(<CombatStatsSection {...props} />);

      // Dexterity 8 = -1 modifier
      expect(screen.getByText('-1')).toBeInTheDocument();
    });

    it('calculates total level from multiple classes', () => {
      const props = {
        ...defaultProps,
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
        ...defaultProps,
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
        ...defaultProps,
        classes: [{ className: 'fighter', level: 1 }],
      };
      render(<CombatStatsSection {...fighterProps} />);
      expect(screen.getByText('d10')).toBeInTheDocument();

      // Test barbarian
      const barbarianProps = {
        ...defaultProps,
        classes: [{ className: 'barbarian', level: 1 }],
      };
      render(<CombatStatsSection {...barbarianProps} />);
      expect(screen.getByText('d12')).toBeInTheDocument();

      // Test wizard (d6 class)
      const wizardProps = {
        ...defaultProps,
        classes: [{ className: 'wizard', level: 1 }],
      };
      render(<CombatStatsSection {...wizardProps} />);
      expect(screen.getByText('d6')).toBeInTheDocument();
    });

    it('shows default hit die when no classes', () => {
      const props = {
        ...defaultProps,
        classes: [],
      };
      render(<CombatStatsSection {...props} />);

      expect(screen.getByText('d8')).toBeInTheDocument();
    });
  });

  describe('Helper Text and Modifiers', () => {
    it('displays constitution modifier in hit points helper text', () => {
      const props = {
        ...defaultProps,
        abilityScores: { ...defaultProps.abilityScores, constitution: 16 },
      };
      render(<CombatStatsSection {...props} />);

      // Constitution 16 = +3 modifier
      expect(screen.getByText(/CON modifier: \+3/i)).toBeInTheDocument();
    });

    it('displays dexterity modifier in armor class helper text', () => {
      const props = {
        ...defaultProps,
        abilityScores: { ...defaultProps.abilityScores, dexterity: 18 },
      };
      render(<CombatStatsSection {...props} />);

      // Dexterity 18 = +4 modifier
      expect(screen.getByText(/DEX modifier: \+4/i)).toBeInTheDocument();
    });

    it('handles negative constitution modifier', () => {
      const props = {
        ...defaultProps,
        abilityScores: { ...defaultProps.abilityScores, constitution: 8 },
      };
      render(<CombatStatsSection {...props} />);

      // Constitution 8 = -1 modifier
      expect(screen.getByText(/CON modifier: -1/i)).toBeInTheDocument();
    });

    it('shows default speed helper text', () => {
      render(<CombatStatsSection {...defaultProps} />);

      expect(screen.getByText(/default: 30 feet/i)).toBeInTheDocument();
    });

    it('shows temporary hit points as optional', () => {
      render(<CombatStatsSection {...defaultProps} />);

      expect(screen.getByText('Optional')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error messages for hit points fields', () => {
      const props = {
        ...defaultProps,
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
        ...defaultProps,
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
      render(<CombatStatsSection {...defaultProps} />);

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
      render(<CombatStatsSection {...defaultProps} />);

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
      render(<CombatStatsSection {...defaultProps} />);

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
        ...defaultProps,
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

    it('handles string input conversion to numbers', async () => {
      const user = userEvent.setup();
      render(<CombatStatsSection {...defaultProps} />);

      const maxHpField = screen.getByLabelText(/maximum hit points/i);
      await user.clear(maxHpField);
      await user.type(maxHpField, 'abc'); // invalid input

      fireEvent.blur(maxHpField);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultProps.value,
        hitPoints: {
          ...defaultProps.value.hitPoints,
          maximum: 0, // should convert invalid string to 0
        },
      });
    });

    it('correctly updates current HP max based on maximum HP', () => {
      const props = {
        ...defaultProps,
        value: {
          ...defaultProps.value,
          hitPoints: {
            maximum: 25,
            current: 20,
            temporary: 0,
          },
        },
      };
      render(<CombatStatsSection {...props} />);

      const currentHpField = screen.getByLabelText(/current hit points/i);
      expect(currentHpField).toHaveAttribute('max', '25');
    });
  });

  describe('Accessibility', () => {
    it('has proper section heading structure', () => {
      render(<CombatStatsSection {...defaultProps} />);

      const heading = screen.getByRole('heading', { name: /combat statistics/i });
      expect(heading).toHaveAttribute('aria-level', '3');
    });

    it('has proper form field types and attributes', () => {
      render(<CombatStatsSection {...defaultProps} />);

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