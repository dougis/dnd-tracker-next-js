import React from 'react';
import { render, screen } from '@testing-library/react';
import { CharacterPreview } from '../CharacterPreview';
import {
  defaultCharacterPreviewProps,
  createInvalidBasicInfoProps,
  createInvalidAbilityScoresProps,
  createInvalidClassesProps,
  createInvalidCombatStatsProps
} from './helpers/CharacterPreview.helpers';

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
      const props = createInvalidBasicInfoProps('name', '');
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Basic Information')).toBeInTheDocument();
    });

    it('marks basic info as incomplete when missing type', () => {
      const props = createInvalidBasicInfoProps('type', undefined);
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Basic Information')).toBeInTheDocument();
    });

    it('marks basic info as incomplete when missing race', () => {
      const props = createInvalidBasicInfoProps('race', '');
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Basic Information')).toBeInTheDocument();
    });

    it('marks ability scores as incomplete when out of range', () => {
      const props = createInvalidAbilityScoresProps({ strength: 0 });
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Ability Scores')).toBeInTheDocument();
    });

    it('marks classes as incomplete when empty', () => {
      const props = createInvalidClassesProps([]);
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Classes')).toBeInTheDocument();
    });

    it('marks classes as incomplete when level is invalid', () => {
      const props = createInvalidClassesProps([{ className: 'fighter', level: 0 }]);
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Classes')).toBeInTheDocument();
    });

    it('marks combat stats as incomplete when HP is invalid', () => {
      const props = createInvalidCombatStatsProps({
        hitPoints: { maximum: 0, current: 0, temporary: 0 }
      });
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Combat Stats')).toBeInTheDocument();
    });

    it('marks combat stats as incomplete when AC is invalid', () => {
      const props = createInvalidCombatStatsProps({ armorClass: 0 });
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('⚠ Combat Stats')).toBeInTheDocument();
    });
  });
});