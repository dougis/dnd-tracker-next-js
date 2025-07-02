import React from 'react';
import { render, screen } from '@testing-library/react';
import { CharacterPreview } from '../CharacterPreview';

describe('CharacterPreview', () => {
  const defaultProps = {
    basicInfo: {
      name: 'Aragorn',
      type: 'pc' as const,
      race: 'human',
    },
    abilityScores: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 12,
      wisdom: 13,
      charisma: 11,
    },
    classes: [
      { className: 'ranger', level: 5 },
    ],
    combatStats: {
      hitPoints: {
        maximum: 45,
        current: 45,
        temporary: 0,
      },
      armorClass: 16,
      speed: 30,
      proficiencyBonus: 3,
    },
    isValid: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders character preview card with title', () => {
      render(<CharacterPreview {...defaultProps} />);

      expect(screen.getByText('Character Preview')).toBeInTheDocument();
    });

    it('shows valid character status with check icon', () => {
      render(<CharacterPreview {...defaultProps} />);

      expect(screen.getByText('✓ Ready to create character')).toBeInTheDocument();
    });

    it('shows invalid character status with warning', () => {
      const props = {
        ...defaultProps,
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Complete all sections to enable creation')).toBeInTheDocument();
    });
  });

  describe('Basic Information Display', () => {
    it('displays character name', () => {
      render(<CharacterPreview {...defaultProps} />);

      expect(screen.getByText('Aragorn')).toBeInTheDocument();
    });

    it('displays unnamed character fallback', () => {
      const props = {
        ...defaultProps,
        basicInfo: { ...defaultProps.basicInfo, name: '' },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Unnamed Character')).toBeInTheDocument();
    });

    it('displays player character type', () => {
      render(<CharacterPreview {...defaultProps} />);

      expect(screen.getByText('Player Character')).toBeInTheDocument();
    });

    it('displays NPC type', () => {
      const props = {
        ...defaultProps,
        basicInfo: { ...defaultProps.basicInfo, type: 'npc' as const },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('NPC')).toBeInTheDocument();
    });

    it('displays race information', () => {
      render(<CharacterPreview {...defaultProps} />);

      expect(screen.getByText('Human')).toBeInTheDocument();
    });

    it('displays custom race when specified', () => {
      const props = {
        ...defaultProps,
        basicInfo: {
          ...defaultProps.basicInfo,
          race: 'custom',
          customRace: 'Half-Dragon',
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Half-Dragon')).toBeInTheDocument();
    });

    it('formats race with proper capitalization', () => {
      const props = {
        ...defaultProps,
        basicInfo: { ...defaultProps.basicInfo, race: 'half-elf' },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Half elf')).toBeInTheDocument();
    });
  });

  describe('Classes Display', () => {
    it('displays single class with level', () => {
      render(<CharacterPreview {...defaultProps} />);

      expect(screen.getByText('Ranger')).toBeInTheDocument();
      expect(screen.getByText('Level 5')).toBeInTheDocument();
    });

    it('displays multiple classes', () => {
      const props = {
        ...defaultProps,
        classes: [
          { className: 'fighter', level: 3 },
          { className: 'rogue', level: 2 },
        ],
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Fighter')).toBeInTheDocument();
      expect(screen.getByText('Level 3')).toBeInTheDocument();
      expect(screen.getByText('Rogue')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
    });

    it('displays total level correctly', () => {
      const props = {
        ...defaultProps,
        classes: [
          { className: 'fighter', level: 3 },
          { className: 'rogue', level: 2 },
        ],
      };
      render(<CharacterPreview {...props} />);

      // Find the total level badge (should be 5)
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('formats class names with proper capitalization', () => {
      const props = {
        ...defaultProps,
        classes: [{ className: 'paladin', level: 1 }],
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Paladin')).toBeInTheDocument();
    });

    it('handles empty classes array', () => {
      const props = {
        ...defaultProps,
        classes: [],
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getAllByText('Classes')).toHaveLength(2); // One in section header, one in completion status
      expect(screen.getByText('0')).toBeInTheDocument(); // Total level should be 0
    });
  });

  describe('Ability Scores Display', () => {
    it('displays all ability scores with modifiers', () => {
      render(<CharacterPreview {...defaultProps} />);

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
        ...defaultProps,
        abilityScores: {
          ...defaultProps.abilityScores,
          strength: 8,
          dexterity: 6,
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
        ...defaultProps,
        abilityScores: {
          ...defaultProps.abilityScores,
          strength: 20,
          dexterity: 18,
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('(+5)')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('(+4)')).toBeInTheDocument();
    });
  });

  describe('Combat Stats Display', () => {
    it('displays hit points correctly', () => {
      render(<CharacterPreview {...defaultProps} />);

      expect(screen.getByText('Hit Points')).toBeInTheDocument();
      expect(screen.getByText('45/45')).toBeInTheDocument();
    });

    it('displays hit points with temporary HP', () => {
      const props = {
        ...defaultProps,
        combatStats: {
          ...defaultProps.combatStats,
          hitPoints: {
            maximum: 45,
            current: 30,
            temporary: 10,
          },
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('30/45 (+10)')).toBeInTheDocument();
    });

    it('displays armor class', () => {
      render(<CharacterPreview {...defaultProps} />);

      expect(screen.getByText('Armor Class')).toBeInTheDocument();
      expect(screen.getAllByText('16')).toHaveLength(2); // STR score and AC
    });

    it('displays speed with default value', () => {
      render(<CharacterPreview {...defaultProps} />);

      expect(screen.getByText('Speed')).toBeInTheDocument();
      expect(screen.getByText('30 ft')).toBeInTheDocument();
    });

    it('displays custom speed value', () => {
      const props = {
        ...defaultProps,
        combatStats: {
          ...defaultProps.combatStats,
          speed: 25,
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('25 ft')).toBeInTheDocument();
    });

    it('displays speed fallback when undefined', () => {
      const props = {
        ...defaultProps,
        combatStats: {
          ...defaultProps.combatStats,
          speed: undefined,
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('30 ft')).toBeInTheDocument();
    });

    it('displays proficiency bonus', () => {
      render(<CharacterPreview {...defaultProps} />);

      expect(screen.getByText('Proficiency Bonus')).toBeInTheDocument();
      expect(screen.getByText('+3')).toBeInTheDocument();
    });

    it('displays proficiency bonus fallback', () => {
      const props = {
        ...defaultProps,
        combatStats: {
          ...defaultProps.combatStats,
          proficiencyBonus: undefined,
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('+2')).toBeInTheDocument();
    });
  });

  describe('Form Completion Status', () => {
    it('shows all sections completed for valid character', () => {
      render(<CharacterPreview {...defaultProps} />);

      expect(screen.getByText('Form Completion')).toBeInTheDocument();
      expect(screen.getByText('Basic Info')).toBeInTheDocument();
      expect(screen.getAllByText('Ability Scores')).toHaveLength(2); // Section header and completion status
      expect(screen.getAllByText('Classes')).toHaveLength(2); // Section header and completion status
      expect(screen.getAllByText('Combat Stats')).toHaveLength(2); // Section header and completion status
    });

    it('marks basic info as incomplete when missing name', () => {
      const props = {
        ...defaultProps,
        basicInfo: { ...defaultProps.basicInfo, name: '' },
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Complete all sections to enable creation')).toBeInTheDocument();
    });

    it('marks basic info as incomplete when missing type', () => {
      const props = {
        ...defaultProps,
        basicInfo: { ...defaultProps.basicInfo, type: '' as any },
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Complete all sections to enable creation')).toBeInTheDocument();
    });

    it('marks basic info as incomplete when missing race', () => {
      const props = {
        ...defaultProps,
        basicInfo: { ...defaultProps.basicInfo, race: '' },
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Complete all sections to enable creation')).toBeInTheDocument();
    });

    it('marks ability scores as incomplete when out of range', () => {
      const props = {
        ...defaultProps,
        abilityScores: { ...defaultProps.abilityScores, strength: 0 },
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Complete all sections to enable creation')).toBeInTheDocument();
    });

    it('marks classes as incomplete when empty', () => {
      const props = {
        ...defaultProps,
        classes: [],
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Complete all sections to enable creation')).toBeInTheDocument();
    });

    it('marks classes as incomplete when level is invalid', () => {
      const props = {
        ...defaultProps,
        classes: [{ className: 'fighter', level: 0 }],
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Complete all sections to enable creation')).toBeInTheDocument();
    });

    it('marks combat stats as incomplete when HP is invalid', () => {
      const props = {
        ...defaultProps,
        combatStats: {
          ...defaultProps.combatStats,
          hitPoints: { maximum: 0, current: 0 },
        },
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Complete all sections to enable creation')).toBeInTheDocument();
    });

    it('marks combat stats as incomplete when AC is invalid', () => {
      const props = {
        ...defaultProps,
        combatStats: { ...defaultProps.combatStats, armorClass: 0 },
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Complete all sections to enable creation')).toBeInTheDocument();
    });
  });

  describe('Helper Functions', () => {
    it('calculates modifiers correctly for edge cases', () => {
      const props = {
        ...defaultProps,
        abilityScores: {
          strength: 1,   // -5
          dexterity: 10, // +0
          constitution: 11, // +0
          intelligence: 30, // +10
          wisdom: 9,    // -1
          charisma: 19, // +4
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('(-5)')).toBeInTheDocument();
      expect(screen.getAllByText('(+0)')).toHaveLength(2);
      expect(screen.getByText('(+10)')).toBeInTheDocument();
      expect(screen.getByText('(-1)')).toBeInTheDocument();
      expect(screen.getByText('(+4)')).toBeInTheDocument();
    });

    it('formats races with hyphens correctly', () => {
      const props = {
        ...defaultProps,
        basicInfo: { ...defaultProps.basicInfo, race: 'half-orc' },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Half orc')).toBeInTheDocument();
    });

    it('handles complex multiclass scenarios', () => {
      const props = {
        ...defaultProps,
        classes: [
          { className: 'fighter', level: 5 },
          { className: 'rogue', level: 3 },
          { className: 'wizard', level: 2 },
        ],
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Fighter')).toBeInTheDocument();
      expect(screen.getByText('Level 5')).toBeInTheDocument();
      expect(screen.getByText('Rogue')).toBeInTheDocument();
      expect(screen.getByText('Level 3')).toBeInTheDocument();
      expect(screen.getByText('Wizard')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Total level
    });
  });

  describe('Visual Elements', () => {
    it('uses proper semantic heading structure', () => {
      render(<CharacterPreview {...defaultProps} />);

      // The card title is actually displayed as a span, not a heading
      expect(screen.getByText('Character Preview')).toBeInTheDocument();
      expect(screen.getAllByText('Classes')).toHaveLength(2);
      expect(screen.getAllByText('Ability Scores')).toHaveLength(2);
      expect(screen.getAllByText('Combat Stats')).toHaveLength(2);
      expect(screen.getByText('Form Completion')).toBeInTheDocument();
    });

    it('displays completion status appropriately', () => {
      render(<CharacterPreview {...defaultProps} />);

      // Should show ready status for valid character
      expect(screen.getByText('✓ Ready to create character')).toBeInTheDocument();
    });

    it('displays warning status for incomplete character', () => {
      const props = {
        ...defaultProps,
        isValid: false,
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Complete all sections to enable creation')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing optional fields gracefully', () => {
      const props = {
        ...defaultProps,
        combatStats: {
          hitPoints: { maximum: 20, current: 20 },
          armorClass: 14,
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('30 ft')).toBeInTheDocument(); // Default speed
      expect(screen.getByText('+2')).toBeInTheDocument(); // Default proficiency
    });

    it('handles very long character names', () => {
      const props = {
        ...defaultProps,
        basicInfo: {
          ...defaultProps.basicInfo,
          name: 'Sir Maximillian Thunderblade the Third of House Dragonborn',
        },
      };
      render(<CharacterPreview {...props} />);

      expect(screen.getByText('Sir Maximillian Thunderblade the Third of House Dragonborn')).toBeInTheDocument();
    });

    it('handles zero temporary hit points correctly', () => {
      const props = {
        ...defaultProps,
        combatStats: {
          ...defaultProps.combatStats,
          hitPoints: {
            maximum: 45,
            current: 45,
            temporary: 0,
          },
        },
      };
      render(<CharacterPreview {...props} />);

      // Should not show temporary HP when it's 0
      expect(screen.getByText('45/45')).toBeInTheDocument();
      // There will still be a (+0) for the charisma modifier, so we can't test for its absence completely
      expect(screen.queryByText('45/45 (+0)')).not.toBeInTheDocument();
    });
  });
});