import React from 'react';
import { render, screen } from '@testing-library/react';
import { CharacterPreview } from '../CharacterPreview';
import { defaultCharacterPreviewProps } from './helpers/CharacterPreview.helpers';

describe('CharacterPreview - Combat Stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Combat Stats Display', () => {
    it('displays hit points correctly', () => {
      render(<CharacterPreview {...defaultCharacterPreviewProps} />);

      expect(screen.getByText('Hit Points')).toBeInTheDocument();
      expect(screen.getByText('45/45')).toBeInTheDocument();
    });

    it('displays hit points with temporary HP', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        combatStats: {
          ...defaultCharacterPreviewProps.combatStats,
          hitPoints: {
            maximum: 50,
            current: 35,
            temporary: 5,
          },
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('35/50 (+5)')).toBeInTheDocument();
    });

    it('handles zero temporary hit points correctly', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        combatStats: {
          ...defaultCharacterPreviewProps.combatStats,
          hitPoints: {
            maximum: 40,
            current: 30,
            temporary: 0,
          },
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('30/40')).toBeInTheDocument();
      // Note: (+0) may appear due to ability score modifiers, so this test checks HP format specifically
      const hitPointsSection = screen.getByText('30/40');
      expect(hitPointsSection.textContent).toBe('30/40');
    });

    it('displays armor class', () => {
      render(<CharacterPreview {...defaultCharacterPreviewProps} />);

      expect(screen.getByText('Armor Class')).toBeInTheDocument();
      expect(screen.getAllByText('16')).toHaveLength(2); // AC and STR score are both 16
    });

    it('displays speed with default value', () => {
      render(<CharacterPreview {...defaultCharacterPreviewProps} />);

      expect(screen.getByText('Speed')).toBeInTheDocument();
      expect(screen.getByText('30 ft')).toBeInTheDocument();
    });

    it('displays custom speed value', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        combatStats: {
          ...defaultCharacterPreviewProps.combatStats,
          speed: 40,
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('40 ft')).toBeInTheDocument();
    });

    it('displays speed fallback when undefined', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        combatStats: {
          ...defaultCharacterPreviewProps.combatStats,
          speed: undefined as any,
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('30 ft')).toBeInTheDocument(); // Should fallback to 30
    });

    it('displays proficiency bonus', () => {
      render(<CharacterPreview {...defaultCharacterPreviewProps} />);

      expect(screen.getByText('Proficiency Bonus')).toBeInTheDocument();
      expect(screen.getByText('+3')).toBeInTheDocument();
    });

    it('displays proficiency bonus fallback', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        combatStats: {
          ...defaultCharacterPreviewProps.combatStats,
          proficiencyBonus: undefined as any,
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('+2')).toBeInTheDocument(); // Should fallback to +2
    });
  });
});