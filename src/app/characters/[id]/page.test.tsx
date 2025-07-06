/**
 * @jest-environment jsdom
 */
import { screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createCharacterWithSpells, createCharacterWithEquipment } from './__tests__/test-helpers';
import {
  setupCharacterTest,
  renderCharacterPage,
  waitForText,
  waitForMultipleTexts,
  clickTabAndWait,
  createBasicCharacter,
  createCharacterWithStats,
  createCharacterWithAbilities,
  createMulticlassCharacter,
  createCharacterWithNotes,
  createCharacterWithBackstory,
} from './__tests__/page-test-utils';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('CharacterDetailClient', () => {
  const mockRouterPush = jest.fn();
  const mockRouterBack = jest.fn();

  // Mock fetch globally
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockRouterPush,
      back: mockRouterBack,
    } as any);

    // Mock session with user
    mockUseSession.mockReturnValue({
      data: { user: { id: 'test-user-id' } },
      status: 'authenticated',
    } as any);
  });

  it('should render character detail page with basic information', async () => {
    const testCharacter = createBasicCharacter();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: testCharacter,
      }),
    } as Response);

    renderCharacterPage();

    await waitForText(testCharacter.name);
    await waitForText('human • Level 5');
  });

  it('should render loading state while fetching character', () => {
    // Mock a promise that never resolves to keep the loading state
    mockFetch.mockReturnValue(new Promise(() => {}));

    renderCharacterPage();
    expect(screen.getByText('Loading character...')).toBeInTheDocument();
  });

  it('should render error state when character not found', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: 'Character not found',
      }),
    } as Response);

    renderCharacterPage();
    await waitForText('Character not found');
  });

  it('should display character stats section', async () => {
    const testCharacter = createCharacterWithStats();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: testCharacter,
      }),
    } as Response);

    renderCharacterPage();

    await waitForMultipleTexts(['35 / 45', '15', '30 ft']);
  });

  it('should display ability scores section', async () => {
    const { user } = setupCharacterTest();
    const testCharacter = createCharacterWithAbilities();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: testCharacter,
      }),
    } as Response);

    renderCharacterPage();

    await waitForText(testCharacter.name);
    await clickTabAndWait(user, 'Stats', [
      '16 (+3)', '14 (+2)', '13 (+1)', '12 (+1)', '10 (+0)', '8 (-1)'
    ]);
  });

  it('should display multiclass information', async () => {
    const testCharacter = createMulticlassCharacter();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: testCharacter,
      }),
    } as Response);

    renderCharacterPage();

    await waitForMultipleTexts([
      'Fighter (Battle Master) - Level 3',
      'Rogue (Arcane Trickster) - Level 2'
    ]);
  });

  it('should display edit and share buttons', async () => {
    const testCharacter = createBasicCharacter();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: testCharacter,
      }),
    } as Response);

    renderCharacterPage();

    await waitForMultipleTexts(['Edit Character', 'Share']);
  });

  it('should navigate to edit page when edit button is clicked', async () => {
    const testCharacter = createBasicCharacter();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: testCharacter,
      }),
    } as Response);

    renderCharacterPage();

    await waitForText(testCharacter.name);
    fireEvent.click(screen.getByText('Edit Character'));
    expect(mockRouterPush).toHaveBeenCalledWith(`/characters/${testCharacter._id.toString()}/edit`);
  });

  it('should display equipment section when character has equipment', async () => {
    const { user } = setupCharacterTest();
    const testCharacter = createCharacterWithEquipment(['longsword', 'chainMail']);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: testCharacter,
      }),
    } as Response);

    renderCharacterPage();

    await waitForText(testCharacter.name);
    await clickTabAndWait(user, 'Equipment', ['Longsword', 'Chain Mail']);
  });

  it('should display spells section when character has spells', async () => {
    const { user } = setupCharacterTest();
    const testCharacter = createCharacterWithSpells(['fireball', 'magicMissile']);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: testCharacter,
      }),
    } as Response);

    renderCharacterPage();

    await waitForText(testCharacter.name);
    await clickTabAndWait(user, 'Spells', ['Fireball', 'Magic Missile']);
  });

  it('should display notes section when character has notes', async () => {
    const { user } = setupCharacterTest();
    const testCharacter = createCharacterWithNotes();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: testCharacter,
      }),
    } as Response);

    renderCharacterPage();

    await waitForText(testCharacter.name);
    await clickTabAndWait(user, 'Notes', ['This is a test character with some notes.']);
  });

  it('should display backstory section when character has backstory', async () => {
    const { user } = setupCharacterTest();
    const testCharacter = createCharacterWithBackstory();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: testCharacter,
      }),
    } as Response);

    renderCharacterPage();

    await waitForText(testCharacter.name);
    await clickTabAndWait(user, 'Notes', [
      'Born in a small village, this character has a rich history.'
    ]);
  });
});