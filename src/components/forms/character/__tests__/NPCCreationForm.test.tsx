import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NPCCreationForm } from '../NPCCreationForm';
import { CharacterService } from '@/lib/services/CharacterService';
import { NPCTemplateService } from '@/lib/services/NPCTemplateService';

// Mock the services
jest.mock('@/lib/services/CharacterService');
jest.mock('@/lib/services/NPCTemplateService');
const mockCharacterService = CharacterService as jest.Mocked<typeof CharacterService>;
const mockNPCTemplateService = NPCTemplateService as jest.Mocked<typeof NPCTemplateService>;

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('NPCCreationForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();
  const defaultProps = {
    ownerId: 'user123',
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel,
    isOpen: true,
  };

  const mockNPCTemplates = [
    {
      id: 'template1',
      name: 'Guard',
      category: 'humanoid' as const,
      challengeRating: 0.125 as const,
      size: 'medium' as const,
      stats: {
        abilityScores: { strength: 13, dexterity: 12, constitution: 12, intelligence: 10, wisdom: 11, charisma: 10 },
        hitPoints: { maximum: 11, current: 11, temporary: 0 },
        armorClass: 16,
        speed: 30,
        proficiencyBonus: 2,
        savingThrows: {},
        skills: {},
        damageVulnerabilities: [],
        damageResistances: [],
        damageImmunities: [],
        conditionImmunities: [],
        senses: [],
        languages: [],
      },
      equipment: [],
      spells: [],
      actions: [],
      behavior: {
        personality: 'Disciplined',
        motivations: 'Protect',
        tactics: 'Defensive'
      },
      isSystem: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockCharacterService.createCharacter.mockResolvedValue({
      success: true,
      data: {
        id: 'new-npc-123',
        name: 'Test NPC',
        ownerId: 'user123',
        isPC: false,
        level: 1,
        challengeRating: 1,
      } as any,
    });
    mockNPCTemplateService.getTemplates.mockResolvedValue({
      success: true,
      data: mockNPCTemplates,
    });
  });

  describe('Basic Rendering', () => {
    it('renders the NPC creation dialog when open', () => {
      render(<NPCCreationForm {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create NPC')).toBeInTheDocument();
      expect(screen.getByText('Create a new NPC using templates or custom configuration')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<NPCCreationForm {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders tab navigation', () => {
      render(<NPCCreationForm {...defaultProps} />);

      expect(screen.getByRole('tab', { name: 'Templates' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Basic Info' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Stats & Combat' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Details & Behavior' })).toBeInTheDocument();
    });
  });

  describe('Template Tab', () => {
    it('shows template selection by default', () => {
      render(<NPCCreationForm {...defaultProps} />);

      expect(screen.getByText('Search Templates')).toBeInTheDocument();
      expect(screen.getByText('Filter by Category')).toBeInTheDocument();
    });

    it('displays available templates', async () => {
      render(<NPCCreationForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Guard')).toBeInTheDocument();
      });
    });

    it('allows template search', async () => {
      render(<NPCCreationForm {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search by name or type...');
      await userEvent.type(searchInput, 'Guard');

      expect(searchInput).toHaveValue('Guard');
    });
  });

  describe('Basic Info Tab', () => {
    it('shows basic info form when tab is clicked', async () => {
      render(<NPCCreationForm {...defaultProps} />);

      const basicTab = screen.getByRole('tab', { name: 'Basic Info' });
      await userEvent.click(basicTab);

      expect(screen.getByLabelText(/npc name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/creature type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/challenge rating/i)).toBeInTheDocument();
    });
  });

  describe('Stats Tab', () => {
    it('shows stats form when tab is clicked', async () => {
      render(<NPCCreationForm {...defaultProps} />);

      const statsTab = screen.getByRole('tab', { name: 'Stats & Combat' });
      await userEvent.click(statsTab);

      expect(screen.getByLabelText(/strength/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hit points/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/armor class/i)).toBeInTheDocument();
    });
  });

  describe('Details Tab', () => {
    it('shows details form when tab is clicked', async () => {
      render(<NPCCreationForm {...defaultProps} />);

      const detailsTab = screen.getByRole('tab', { name: 'Details & Behavior' });
      await userEvent.click(detailsTab);

      expect(screen.getByLabelText(/personality/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/motivations/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tactics/i)).toBeInTheDocument();
    });
  });

  describe('Form Actions', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      render(<NPCCreationForm {...defaultProps} />);

      // Navigate to details tab where cancel button is located
      const detailsTab = screen.getByRole('tab', { name: 'Details & Behavior' });
      await userEvent.click(detailsTab);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('handles form submission', async () => {
      render(<NPCCreationForm {...defaultProps} />);

      // Fill out basic info
      const basicTab = screen.getByRole('tab', { name: 'Basic Info' });
      await userEvent.click(basicTab);

      const nameInput = screen.getByLabelText(/npc name/i);
      await userEvent.type(nameInput, 'Test NPC');

      // Navigate to details tab where create button is located
      const detailsTab = screen.getByRole('tab', { name: 'Details & Behavior' });
      await userEvent.click(detailsTab);

      const createButton = screen.getByRole('button', { name: /create npc/i });
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(mockCharacterService.createCharacter).toHaveBeenCalled();
      });
    });
  });

  describe('Service Integration', () => {
    it('loads templates on mount', async () => {
      render(<NPCCreationForm {...defaultProps} />);

      await waitFor(() => {
        expect(mockNPCTemplateService.getTemplates).toHaveBeenCalled();
      });
    });

    it('handles template loading error gracefully', async () => {
      mockNPCTemplateService.getTemplates.mockResolvedValue({
        success: false,
        error: { code: 'ERROR', message: 'Failed to load templates' },
      });

      render(<NPCCreationForm {...defaultProps} />);

      // Should not crash and should still render the form
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles character creation error gracefully', async () => {
      mockCharacterService.createCharacter.mockResolvedValue({
        success: false,
        error: { code: 'ERROR', message: 'Failed to create character' },
      });

      render(<NPCCreationForm {...defaultProps} />);

      // Fill out basic info
      const basicTab = screen.getByRole('tab', { name: 'Basic Info' });
      await userEvent.click(basicTab);

      const nameInput = screen.getByLabelText(/npc name/i);
      await userEvent.type(nameInput, 'Test NPC');

      // Navigate to details tab and submit
      const detailsTab = screen.getByRole('tab', { name: 'Details & Behavior' });
      await userEvent.click(detailsTab);

      const createButton = screen.getByRole('button', { name: /create npc/i });
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(mockCharacterService.createCharacter).toHaveBeenCalled();
      });

      // Form should still be open (not closed on error)
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});