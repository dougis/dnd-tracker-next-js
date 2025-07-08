import React from 'react';
import { render, screen } from '@testing-library/react';
import { CharacterPreview } from '../CharacterPreview';
import { defaultCharacterPreviewProps } from './helpers/CharacterPreview.helpers';

describe('CharacterPreview - Ability Scores', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Ability Scores Display', () => {
    it('displays all ability scores with modifiers', () => {
      render(<CharacterPreview {...defaultCharacterPreviewProps} />);

      expect(screen.getByText('STR')).toBeInTheDocument();
      expect(screen.getAllByText('16')).toHaveLength(2); // STR score and AC
      expect(screen.getByText('(+3)')).toBeInTheDocument();

      expect(screen.getByText('DEX')).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument();
      expect(screen.getAllByText('(+2)')).toHaveLength(2); // DEX and CON modifiers

      expect(screen.getByText('CON')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();

      expect(screen.getByText('INT')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getAllByText('(+1)')).toHaveLength(2); // INT and WIS modifiers

      expect(screen.getByText('WIS')).toBeInTheDocument();
      expect(screen.getByText('13')).toBeInTheDocument();

      expect(screen.getByText('CHA')).toBeInTheDocument();
      expect(screen.getByText('11')).toBeInTheDocument();
      expect(screen.getByText('(+0)')).toBeInTheDocument();
    });

    it('calculates negative modifiers correctly', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        abilityScores: {
          ...defaultCharacterPreviewProps.abilityScores,
          strength: 8, // Should give -1 modifier
          charisma: 6, // Should give -2 modifier
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('(-1)')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('(-2)')).toBeInTheDocument();
    });

    it('calculates high modifiers correctly', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        abilityScores: {
          ...defaultCharacterPreviewProps.abilityScores,
          strength: 20, // Should give +5 modifier
          dexterity: 18, // Should give +4 modifier
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('(+5)')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('(+4)')).toBeInTheDocument();
    });

    it('calculates modifiers correctly for edge cases', () => {
      const props = {
        ...defaultCharacterPreviewProps,
        abilityScores: {
          strength: 1,   // -5 modifier
          dexterity: 3,  // -4 modifier
          constitution: 30, // +10 modifier
          intelligence: 10, // +0 modifier
          wisdom: 11,    // +0 modifier
          charisma: 9,   // -1 modifier
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('(-5)')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('(-4)')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('(+10)')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('11')).toBeInTheDocument();
      expect(screen.getAllByText('(+0)')).toHaveLength(2); // INT and WIS
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getByText('(-1)')).toBeInTheDocument();
    });
  });
});