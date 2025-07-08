import React from 'react';
import { render, screen } from '@testing-library/react';
import { CharacterPreview } from '../CharacterPreview';
import { defaultCharacterPreviewProps } from './helpers/CharacterPreview.helpers';

describe('CharacterPreview - Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Completion Status', () => {
    it('shows all sections completed for valid character', () => {
      render(<CharacterPreview {...defaultCharacterPreviewProps} />);

      expect(screen.getByText('✓ Basic Information')).toBeInTheDocument();
      expect(screen.getByText('✓ Ability Scores')).toBeInTheDocument();
      expect(screen.getByText('✓ Classes')).toBeInTheDocument();
      expect(screen.getByText('✓ Combat Stats')).toBeInTheDocument();
    });

    it('marks basic info as incomplete when missing name', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        basicInfo: { ...defaultCharacterPreviewProps.basicInfo, name: '' },
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Basic Information')).toBeInTheDocument();
    });

    it('marks basic info as incomplete when missing type', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        basicInfo: { ...defaultCharacterPreviewProps.basicInfo, type: undefined as any },
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Basic Information')).toBeInTheDocument();
    });

    it('marks basic info as incomplete when missing race', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        basicInfo: { ...defaultCharacterPreviewProps.basicInfo, race: '' as any },
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Basic Information')).toBeInTheDocument();
    });

    it('marks ability scores as incomplete when out of range', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        abilityScores: {
          ...defaultCharacterPreviewProps.abilityScores,
          strength: 0, // Invalid value
        },
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Ability Scores')).toBeInTheDocument();
    });

    it('marks classes as incomplete when empty', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        classes: [],
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Classes')).toBeInTheDocument();
    });

    it('marks classes as incomplete when level is invalid', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        classes: [{ className: 'fighter', level: 0 }], // Invalid level
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Classes')).toBeInTheDocument();
    });

    it('marks combat stats as incomplete when HP is invalid', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        combatStats: {
          ...defaultCharacterPreviewProps.combatStats,
          hitPoints: {
            maximum: 0, // Invalid HP
            current: 0,
            temporary: 0,
          },
        },
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Combat Stats')).toBeInTheDocument();
    });

    it('marks combat stats as incomplete when AC is invalid', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        combatStats: {
          ...defaultCharacterPreviewProps.combatStats,
          armorClass: 0, // Invalid AC
        },
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Combat Stats')).toBeInTheDocument();
    });
  });
});