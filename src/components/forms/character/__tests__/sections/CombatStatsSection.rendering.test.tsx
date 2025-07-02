import React from 'react';
import { render, screen } from '@testing-library/react';
import { CombatStatsSection } from '../../sections/CombatStatsSection';

describe('CombatStatsSection - Rendering and Display', () => {
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

  describe('Field Values Display', () => {
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
  });

  describe('Calculated Values Display', () => {
    it('displays initiative modifier correctly', () => {
      render(<CombatStatsSection {...defaultProps} />);

      // Find the initiative section and its parent to get the value
      const initiativeText = screen.getByText('Initiative');
      const initiativeContainer = initiativeText.parentElement;
      const initiativeValue = initiativeContainer?.querySelector('.font-mono');
      expect(initiativeValue).toHaveTextContent('+2');
    });

    it('displays hit die based on class', () => {
      render(<CombatStatsSection {...defaultProps} />);

      // Fighter uses d10 hit die
      expect(screen.getByText('d10')).toBeInTheDocument();
    });

    it('displays total level correctly', () => {
      render(<CombatStatsSection {...defaultProps} />);

      // Single level 1 class
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('displays calculated proficiency bonus', () => {
      render(<CombatStatsSection {...defaultProps} />);

      // Find the prof bonus section and its value
      const profBonusText = screen.getByText('Prof. Bonus');
      const profBonusContainer = profBonusText.parentElement;
      const profBonusValue = profBonusContainer?.querySelector('.font-mono');
      expect(profBonusValue).toHaveTextContent('+2');
    });

    it('updates calculated values when ability scores change', () => {
      const props = {
        ...defaultProps,
        abilityScores: {
          ...defaultProps.abilityScores,
          dexterity: 18, // +4 modifier
        },
      };
      render(<CombatStatsSection {...props} />);

      // Find the initiative section and check for updated modifier
      const initiativeText = screen.getByText('Initiative');
      const initiativeContainer = initiativeText.parentElement;
      const initiativeValue = initiativeContainer?.querySelector('.font-mono');
      expect(initiativeValue).toHaveTextContent('+4');
    });

    it('updates calculated values when classes change', () => {
      const props = {
        ...defaultProps,
        classes: [
          { className: 'rogue', level: 1 }, // d8 hit die
        ],
      };
      render(<CombatStatsSection {...props} />);

      // Should show rogue hit die
      expect(screen.getByText('d8')).toBeInTheDocument();
    });

    it('handles multiclass total level calculation', () => {
      const props = {
        ...defaultProps,
        classes: [
          { className: 'fighter', level: 3 },
          { className: 'rogue', level: 2 },
        ],
      };
      render(<CombatStatsSection {...props} />);

      // Total level should be 5
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });
});