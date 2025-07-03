/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import CharacterDetailView from './CharacterDetailView';
import { createMockCharacter } from '@/lib/services/__tests__/CharacterService.test-helpers';

describe('CharacterDetailView', () => {
  const mockOnEdit = jest.fn();
  const mockOnShare = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render character basic information', () => {
    const testCharacter = createMockCharacter({
      name: 'Aragorn',
      race: 'human',
      type: 'pc',
      level: 10,
    });

    render(
      <CharacterDetailView
        character={testCharacter}
        onEdit={mockOnEdit}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('Aragorn')).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return content.includes('human') && content.includes('Level 10');
    })).toBeInTheDocument();
  });

  it('should render character stats', () => {
    const testCharacter = createMockCharacter({
      hitPoints: { maximum: 85, current: 70, temporary: 5 },
      armorClass: 18,
      speed: 30,
      proficiencyBonus: 4,
    });

    render(
      <CharacterDetailView
        character={testCharacter}
        onEdit={mockOnEdit}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('70 / 85')).toBeInTheDocument();
    expect(screen.getByText('+5 temp')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('30 ft')).toBeInTheDocument();
    expect(screen.getByText('+4')).toBeInTheDocument();
  });

  it('should render ability scores with modifiers', () => {
    const testCharacter = createMockCharacter({
      abilityScores: {
        strength: 20,
        dexterity: 16,
        constitution: 18,
        intelligence: 14,
        wisdom: 12,
        charisma: 10,
      },
    });

    render(
      <CharacterDetailView
        character={testCharacter}
        onEdit={mockOnEdit}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('20 (+5)')).toBeInTheDocument(); // STR
    expect(screen.getByText('16 (+3)')).toBeInTheDocument(); // DEX
    expect(screen.getByText('18 (+4)')).toBeInTheDocument(); // CON
    expect(screen.getByText('14 (+2)')).toBeInTheDocument(); // INT
    expect(screen.getByText('12 (+1)')).toBeInTheDocument(); // WIS
    expect(screen.getByText('10 (+0)')).toBeInTheDocument(); // CHA
  });

  it('should render multiclass information', () => {
    const testCharacter = createMockCharacter({
      classes: [
        { class: 'Paladin', level: 6, subclass: 'Devotion', hitDie: 10 },
        { class: 'Sorcerer', level: 4, subclass: 'Draconic Bloodline', hitDie: 6 },
      ],
    });

    render(
      <CharacterDetailView
        character={testCharacter}
        onEdit={mockOnEdit}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('Paladin (Devotion) - Level 6')).toBeInTheDocument();
    expect(screen.getByText('Sorcerer (Draconic Bloodline) - Level 4')).toBeInTheDocument();
  });

  it('should render saving throws', () => {
    const testCharacter = createMockCharacter({
      savingThrows: {
        strength: true,
        dexterity: false,
        constitution: true,
        intelligence: false,
        wisdom: false,
        charisma: false,
      },
      abilityScores: {
        strength: 16,
        dexterity: 14,
        constitution: 18,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      },
      proficiencyBonus: 3,
    });

    render(
      <CharacterDetailView
        character={testCharacter}
        onEdit={mockOnEdit}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('STR +6')).toBeInTheDocument(); // 3 + 3 (prof)
    expect(screen.getByText('CON +7')).toBeInTheDocument(); // 4 + 3 (prof)
    expect(screen.getByText('WIS +0')).toBeInTheDocument(); // 0 (no prof)
  });

  it('should render skills', () => {
    const testCharacter = createMockCharacter({
      skills: {
        'Athletics': true,
        'Stealth': true,
        'Perception': false,
      },
      abilityScores: {
        strength: 16,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 15,
        charisma: 10,
      },
      proficiencyBonus: 3,
    });

    render(
      <CharacterDetailView
        character={testCharacter}
        onEdit={mockOnEdit}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('Athletics +6')).toBeInTheDocument(); // STR 3 + prof 3
    expect(screen.getByText('Stealth +5')).toBeInTheDocument(); // DEX 2 + prof 3
    expect(screen.getByText('Perception +2')).toBeInTheDocument(); // WIS 2 (no prof)
  });

  it('should render equipment list', () => {
    const testCharacter = createMockCharacter({
      equipment: [
        {
          name: 'Flametongue Sword',
          quantity: 1,
          weight: 3,
          value: 500,
          equipped: true,
          magical: true,
        },
        {
          name: 'Studded Leather Armor',
          quantity: 1,
          weight: 13,
          value: 45,
          equipped: true,
          magical: false,
        },
      ],
    });

    render(
      <CharacterDetailView
        character={testCharacter}
        onEdit={mockOnEdit}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('Equipment')).toBeInTheDocument();
    expect(screen.getByText('Flametongue Sword')).toBeInTheDocument();
    expect(screen.getByText('Studded Leather Armor')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('should render spells grouped by level', () => {
    const testCharacter = createMockCharacter({
      spells: [
        {
          name: 'Fireball',
          level: 3,
          school: 'Evocation',
          components: 'V, S, M',
          duration: 'Instantaneous',
          isPrepared: true,
        },
        {
          name: 'Magic Missile',
          level: 1,
          school: 'Evocation',
          components: 'V, S',
          duration: 'Instantaneous',
          isPrepared: true,
        },
        {
          name: 'Shield',
          level: 1,
          school: 'Abjuration',
          components: 'V, S',
          duration: '1 round',
          isPrepared: false,
        },
      ],
    });

    render(
      <CharacterDetailView
        character={testCharacter}
        onEdit={mockOnEdit}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('Spells')).toBeInTheDocument();
    expect(screen.getByText('1st Level')).toBeInTheDocument();
    expect(screen.getByText('3rd Level')).toBeInTheDocument();
    expect(screen.getByText('Magic Missile')).toBeInTheDocument();
    expect(screen.getByText('Shield')).toBeInTheDocument();
    expect(screen.getByText('Fireball')).toBeInTheDocument();
  });

  it('should render notes section', () => {
    const testCharacter = createMockCharacter({
      notes: 'This character has a mysterious past and carries ancient secrets.',
    });

    render(
      <CharacterDetailView
        character={testCharacter}
        onEdit={mockOnEdit}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('This character has a mysterious past and carries ancient secrets.')).toBeInTheDocument();
  });

  it('should render backstory section', () => {
    const testCharacter = createMockCharacter({
      backstory: 'Born in the northern kingdoms, trained as a ranger from childhood.',
    });

    render(
      <CharacterDetailView
        character={testCharacter}
        onEdit={mockOnEdit}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('Backstory')).toBeInTheDocument();
    expect(screen.getByText('Born in the northern kingdoms, trained as a ranger from childhood.')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const testCharacter = createMockCharacter({
      name: 'Test Character',
    });

    render(
      <CharacterDetailView
        character={testCharacter}
        onEdit={mockOnEdit}
        onShare={mockOnShare}
      />
    );

    fireEvent.click(screen.getByText('Edit Character'));
    expect(mockOnEdit).toHaveBeenCalledWith(testCharacter);
  });

  it('should call onShare when share button is clicked', () => {
    const testCharacter = createMockCharacter({
      name: 'Test Character',
    });

    render(
      <CharacterDetailView
        character={testCharacter}
        onEdit={mockOnEdit}
        onShare={mockOnShare}
      />
    );

    fireEvent.click(screen.getByText('Share'));
    expect(mockOnShare).toHaveBeenCalledWith(testCharacter);
  });

  it('should display tabs for different sections', () => {
    const testCharacter = createMockCharacter({
      name: 'Test Character',
    });

    render(
      <CharacterDetailView
        character={testCharacter}
        onEdit={mockOnEdit}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByText('Equipment')).toBeInTheDocument();
    expect(screen.getByText('Spells')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('should switch between tabs when clicked', () => {
    const testCharacter = createMockCharacter({
      name: 'Test Character',
      equipment: [
        {
          name: 'Sword',
          quantity: 1,
          weight: 3,
          value: 15,
          equipped: true,
          magical: false,
        },
      ],
    });

    render(
      <CharacterDetailView
        character={testCharacter}
        onEdit={mockOnEdit}
        onShare={mockOnShare}
      />
    );

    // Click on Equipment tab
    fireEvent.click(screen.getByText('Equipment'));
    expect(screen.getByText('Sword')).toBeInTheDocument();

    // Click back to Overview tab
    fireEvent.click(screen.getByText('Overview'));
    expect(screen.getByText('Test Character')).toBeInTheDocument();
  });
});