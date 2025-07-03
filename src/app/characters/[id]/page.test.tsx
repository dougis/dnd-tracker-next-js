/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { CharacterDetailClient } from './CharacterDetailClient';
import { CharacterService } from '@/lib/services/CharacterService';
import { createMockCharacter } from '@/lib/services/__tests__/CharacterService.test-helpers';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/services/CharacterService', () => ({
  CharacterService: {
    getCharacterById: jest.fn(),
  },
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const createMockCharacterService = CharacterService as jest.Mocked<typeof CharacterService>;

describe('CharacterDetailClient', () => {
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

    createMockCharacterService.getCharacterById.mockResolvedValue({
      success: true,
      data: testCharacter,
    });

    render(<CharacterDetailClient id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Test Character')).toBeInTheDocument();
      expect(screen.getByText((content, _element) => {
        return content.includes('human') && content.includes('Level 5');
      })).toBeInTheDocument();
    });
  });

  it('should render loading state while fetching character', () => {
    createMockCharacterService.getCharacterById.mockReturnValue(new Promise(() => {}));

    render(<CharacterDetailClient id="test-id" />);

    expect(screen.getByText('Loading character...')).toBeInTheDocument();
  });

  it('should render error state when character not found', async () => {
    createMockCharacterService.getCharacterById.mockResolvedValue({
      success: false,
      error: { message: 'Character not found', code: 'NOT_FOUND' },
    });

    render(<CharacterDetailClient id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('Character not found')).toBeInTheDocument();
    });
  });

  it('should display character stats section', async () => {
    const testCharacter = createMockCharacter({
      hitPoints: { maximum: 45, current: 35, temporary: 0 },
      armorClass: 15,
      speed: 30,
    });

    createMockCharacterService.getCharacterById.mockResolvedValue({
      success: true,
      data: testCharacter,
    });

    render(<CharacterDetailClient id="test-id" />);

    await waitFor(() => {
      expect(screen.getByText('35 / 45')).toBeInTheDocument(); // HP
      expect(screen.getByText('15')).toBeInTheDocument(); // AC
      expect(screen.getByText('30 ft')).toBeInTheDocument(); // Speed
    });
  });

  it('should display ability scores section', async () => {
    const user = userEvent.setup();

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

    createMockCharacterService.getCharacterById.mockResolvedValue({
      success: true,
      data: testCharacter,
    });

    render(<CharacterDetailClient id="test-id" />);

    // First wait for character to load
    await waitFor(() => {
      expect(screen.getByText('Test Character')).toBeInTheDocument();
    });

    // Find and click on Stats tab using userEvent
    const statsTab = screen.getByRole('tab', { name: 'Stats' });
    await user.click(statsTab);

    // Then wait for ability scores to appear
    await waitFor(() => {
      expect(screen.getByText('16 (+3)')).toBeInTheDocument(); // STR
      expect(screen.getByText('14 (+2)')).toBeInTheDocument(); // DEX
      expect(screen.getByText('13 (+1)')).toBeInTheDocument(); // CON
      expect(screen.getByText('12 (+1)')).toBeInTheDocument(); // INT
      expect(screen.getByText('10 (+0)')).toBeInTheDocument(); // WIS
      expect(screen.getByText('8 (-1)')).toBeInTheDocument(); // CHA
    }, { timeout: 3000 });
  });

  it('should display multiclass information', async () => {
    const testCharacter = createMockCharacter({
      classes: [
        { class: 'Fighter', level: 3, subclass: 'Battle Master', hitDie: 10 },
        { class: 'Rogue', level: 2, subclass: 'Arcane Trickster', hitDie: 8 },
      ],
    });

    createMockCharacterService.getCharacterById.mockResolvedValue({
      success: true,
      data: testCharacter,
    });

    render(<CharacterDetailClient id="test-id" />);

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

    createMockCharacterService.getCharacterById.mockResolvedValue({
      success: true,
      data: testCharacter,
    });

    render(<CharacterDetailClient id="test-id" />);

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

    createMockCharacterService.getCharacterById.mockResolvedValue({
      success: true,
      data: testCharacter,
    });

    render(<CharacterDetailClient id="test-id" />);

    // First wait for character to load
    await waitFor(() => {
      expect(screen.getByText('Test Character')).toBeInTheDocument();
    });

    // Click the edit button
    fireEvent.click(screen.getByText('Edit Character'));

    expect(mockRouterPush).toHaveBeenCalledWith('/characters/test-id/edit');
  });

  it('should display equipment section when character has equipment', async () => {
    const user = userEvent.setup();

    const testCharacter = createMockCharacter({
      equipment: [
        {
          name: 'Longsword',
          quantity: 1,
          weight: 3,
          value: 15,
          equipped: true,
          magical: false,
        },
        {
          name: 'Chain Mail',
          quantity: 1,
          weight: 55,
          value: 75,
          equipped: true,
          magical: false,
        },
      ],
    });

    createMockCharacterService.getCharacterById.mockResolvedValue({
      success: true,
      data: testCharacter,
    });

    render(<CharacterDetailClient id="test-id" />);

    // First wait for character to load
    await waitFor(() => {
      expect(screen.getByText('Test Character')).toBeInTheDocument();
    });

    // Click on Equipment tab using userEvent
    const equipmentTab = screen.getByRole('tab', { name: 'Equipment' });
    await user.click(equipmentTab);

    // Then wait for equipment to appear
    await waitFor(() => {
      expect(screen.getByText('Longsword')).toBeInTheDocument();
      expect(screen.getByText('Chain Mail')).toBeInTheDocument();
    });
  });

  it('should display spells section when character has spells', async () => {
    const user = userEvent.setup();

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
      ],
    });

    createMockCharacterService.getCharacterById.mockResolvedValue({
      success: true,
      data: testCharacter,
    });

    render(<CharacterDetailClient id="test-id" />);

    // First wait for character to load
    await waitFor(() => {
      expect(screen.getByText('Test Character')).toBeInTheDocument();
    });

    // Click on Spells tab using userEvent
    const spellsTab = screen.getByRole('tab', { name: 'Spells' });
    await user.click(spellsTab);

    // Then wait for spells to appear
    await waitFor(() => {
      expect(screen.getByText('Fireball')).toBeInTheDocument();
      expect(screen.getByText('Magic Missile')).toBeInTheDocument();
    });
  });

  it('should display notes section when character has notes', async () => {
    const user = userEvent.setup();

    const testCharacter = createMockCharacter({
      notes: 'This is a test character with some notes.',
    });

    createMockCharacterService.getCharacterById.mockResolvedValue({
      success: true,
      data: testCharacter,
    });

    render(<CharacterDetailClient id="test-id" />);

    // First wait for character to load
    await waitFor(() => {
      expect(screen.getByText('Test Character')).toBeInTheDocument();
    });

    // Click on Notes tab using userEvent
    const notesTab = screen.getByRole('tab', { name: 'Notes' });
    await user.click(notesTab);

    // Then wait for notes content to appear
    await waitFor(() => {
      expect(screen.getByText('This is a test character with some notes.')).toBeInTheDocument();
    });
  });

  it('should display backstory section when character has backstory', async () => {
    const user = userEvent.setup();

    const testCharacter = createMockCharacter({
      backstory: 'Born in a small village, this character has a rich history.',
    });

    createMockCharacterService.getCharacterById.mockResolvedValue({
      success: true,
      data: testCharacter,
    });

    render(<CharacterDetailClient id="test-id" />);

    // First wait for character to load
    await waitFor(() => {
      expect(screen.getByText('Test Character')).toBeInTheDocument();
    });

    // Click on Notes tab using userEvent
    const notesTab = screen.getByRole('tab', { name: 'Notes' });
    await user.click(notesTab);

    // Then wait for backstory content to appear
    await waitFor(() => {
      expect(screen.getByText('Backstory')).toBeInTheDocument();
      expect(screen.getByText('Born in a small village, this character has a rich history.')).toBeInTheDocument();
    });
  });
});