/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import CharacterDetailPage from './page';
import { CharacterService } from '@/lib/services/CharacterService';
import { createMockCharacter } from '@/lib/services/__tests__/CharacterService.test-helpers';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/services/CharacterService', () => ({
  CharacterService: {
    getById: jest.fn(),
  },
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const createMockCharacterService = CharacterService as jest.Mocked<typeof CharacterService>;

describe('CharacterDetailPage', () => {
  const mockRouterPush = jest.fn();
  const mockRouterBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockRouterPush,
      back: mockRouterBack,
    } as any);
  });

  it('should render character detail page with basic information', async () => {
    const testCharacter = createMockCharacter({
      name: 'Test Character',
      race: 'human',
      type: 'pc',
      level: 5,
    });

    createMockCharacterService.getById.mockResolvedValue(testCharacter);

    render(<CharacterDetailPage params={{ id: 'test-id' }} />);

    await waitFor(() => {
      expect(screen.getByText('Test Character')).toBeInTheDocument();
      expect(screen.getByText('human')).toBeInTheDocument();
      expect(screen.getByText('Level 5')).toBeInTheDocument();
    });
  });

  it('should render loading state while fetching character', () => {
    createMockCharacterService.getById.mockReturnValue(new Promise(() => {}));

    render(<CharacterDetailPage params={{ id: 'test-id' }} />);

    expect(screen.getByText('Loading character...')).toBeInTheDocument();
  });

  it('should render error state when character not found', async () => {
    createMockCharacterService.getById.mockRejectedValue(new Error('Character not found'));

    render(<CharacterDetailPage params={{ id: 'test-id' }} />);

    await waitFor(() => {
      expect(screen.getByText('Character not found')).toBeInTheDocument();
    });
  });

  it('should display character stats section', async () => {
    const testCharacter = createMockCharacter({
      hitPoints: { max: 45, current: 35, temp: 0 },
      armorClass: 15,
      speed: 30,
    });

    createMockCharacterService.getById.mockResolvedValue(testCharacter);

    render(<CharacterDetailPage params={{ id: 'test-id' }} />);

    await waitFor(() => {
      expect(screen.getByText('35 / 45')).toBeInTheDocument(); // HP
      expect(screen.getByText('15')).toBeInTheDocument(); // AC
      expect(screen.getByText('30 ft')).toBeInTheDocument(); // Speed
    });
  });

  it('should display ability scores section', async () => {
    const testCharacter = createMockCharacter({
      abilityScores: {
        strength: 16,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      },
    });

    createMockCharacterService.getById.mockResolvedValue(testCharacter);

    render(<CharacterDetailPage params={{ id: 'test-id' }} />);

    await waitFor(() => {
      expect(screen.getByText('16 (+3)')).toBeInTheDocument(); // STR
      expect(screen.getByText('14 (+2)')).toBeInTheDocument(); // DEX
      expect(screen.getByText('13 (+1)')).toBeInTheDocument(); // CON
      expect(screen.getByText('12 (+1)')).toBeInTheDocument(); // INT
      expect(screen.getByText('10 (+0)')).toBeInTheDocument(); // WIS
      expect(screen.getByText('8 (-1)')).toBeInTheDocument(); // CHA
    });
  });

  it('should display multiclass information', async () => {
    const testCharacter = createMockCharacter({
      classes: [
        { class: 'Fighter', level: 3, subclass: 'Battle Master', hitDie: 10 },
        { class: 'Rogue', level: 2, subclass: 'Arcane Trickster', hitDie: 8 },
      ],
    });

    createMockCharacterService.getById.mockResolvedValue(testCharacter);

    render(<CharacterDetailPage params={{ id: 'test-id' }} />);

    await waitFor(() => {
      expect(screen.getByText('Fighter (Battle Master) - Level 3')).toBeInTheDocument();
      expect(screen.getByText('Rogue (Arcane Trickster) - Level 2')).toBeInTheDocument();
    });
  });

  it('should display edit and share buttons', async () => {
    const testCharacter = createMockCharacter({
      _id: 'test-id',
      name: 'Test Character',
    });

    createMockCharacterService.getById.mockResolvedValue(testCharacter);

    render(<CharacterDetailPage params={{ id: 'test-id' }} />);

    await waitFor(() => {
      expect(screen.getByText('Edit Character')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
    });
  });

  it('should navigate to edit page when edit button is clicked', async () => {
    const testCharacter = createMockCharacter({
      _id: 'test-id',
      name: 'Test Character',
    });

    createMockCharacterService.getById.mockResolvedValue(testCharacter);

    render(<CharacterDetailPage params={{ id: 'test-id' }} />);

    await waitFor(() => {
      const editButton = screen.getByText('Edit Character');
      editButton.click();
    });

    expect(mockRouterPush).toHaveBeenCalledWith('/characters/test-id/edit');
  });

  it('should display equipment section when character has equipment', async () => {
    const testCharacter = createMockCharacter({
      equipment: [
        {
          name: 'Longsword',
          type: 'Weapon',
          rarity: 'Common',
          weight: 3,
          value: 15,
          equipped: true,
          magical: false,
        },
        {
          name: 'Chain Mail',
          type: 'Armor',
          rarity: 'Common',
          weight: 55,
          value: 75,
          equipped: true,
          magical: false,
        },
      ],
    });

    createMockCharacterService.getById.mockResolvedValue(testCharacter);

    render(<CharacterDetailPage params={{ id: 'test-id' }} />);

    await waitFor(() => {
      expect(screen.getByText('Equipment')).toBeInTheDocument();
      expect(screen.getByText('Longsword')).toBeInTheDocument();
      expect(screen.getByText('Chain Mail')).toBeInTheDocument();
    });
  });

  it('should display spells section when character has spells', async () => {
    const testCharacter = createMockCharacter({
      spells: [
        {
          name: 'Fireball',
          level: 3,
          school: 'Evocation',
          components: ['V', 'S', 'M'],
          duration: 'Instantaneous',
          prepared: true,
        },
        {
          name: 'Magic Missile',
          level: 1,
          school: 'Evocation',
          components: ['V', 'S'],
          duration: 'Instantaneous',
          prepared: true,
        },
      ],
    });

    createMockCharacterService.getById.mockResolvedValue(testCharacter);

    render(<CharacterDetailPage params={{ id: 'test-id' }} />);

    await waitFor(() => {
      expect(screen.getByText('Spells')).toBeInTheDocument();
      expect(screen.getByText('Fireball')).toBeInTheDocument();
      expect(screen.getByText('Magic Missile')).toBeInTheDocument();
    });
  });

  it('should display notes section when character has notes', async () => {
    const testCharacter = createMockCharacter({
      notes: 'This is a test character with some notes.',
    });

    createMockCharacterService.getById.mockResolvedValue(testCharacter);

    render(<CharacterDetailPage params={{ id: 'test-id' }} />);

    await waitFor(() => {
      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('This is a test character with some notes.')).toBeInTheDocument();
    });
  });

  it('should display backstory section when character has backstory', async () => {
    const testCharacter = createMockCharacter({
      backstory: 'Born in a small village, this character has a rich history.',
    });

    createMockCharacterService.getById.mockResolvedValue(testCharacter);

    render(<CharacterDetailPage params={{ id: 'test-id' }} />);

    await waitFor(() => {
      expect(screen.getByText('Backstory')).toBeInTheDocument();
      expect(screen.getByText('Born in a small village, this character has a rich history.')).toBeInTheDocument();
    });
  });
});