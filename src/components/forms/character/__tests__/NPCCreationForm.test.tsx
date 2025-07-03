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
      category: 'humanoid',
      challengeRating: 0.125,
      stats: {
        abilityScores: { strength: 13, dexterity: 12, constitution: 12, intelligence: 10, wisdom: 11, charisma: 10 },
        hitPoints: { maximum: 11, current: 11 },
        armorClass: 16,
        speed: 30,
      },
      equipment: ['Chain shirt', 'Shield', 'Spear'],
      spells: [],
    },
    {
      id: 'template2',
      name: 'Goblin',
      category: 'humanoid',
      challengeRating: 0.25,
      stats: {
        abilityScores: { strength: 8, dexterity: 14, constitution: 10, intelligence: 10, wisdom: 8, charisma: 8 },
        hitPoints: { maximum: 7, current: 7 },
        armorClass: 15,
        speed: 30,
      },
      equipment: ['Leather armor', 'Shield', 'Scimitar'],
      spells: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockCharacterService.createCharacter.mockResolvedValue({
      success: true,
      data: {
        id: 'npc123',
        name: 'Test NPC',
        type: 'npc',
        challengeRating: 1,
      } as any,
    });
    mockNPCTemplateService.getTemplates.mockResolvedValue({
      success: true,
      data: mockNPCTemplates,
    });
  });

  describe('Form Rendering', () => {
    it('renders the NPC creation form with all required sections', () => {
      render(<NPCCreationForm {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create NPC')).toBeInTheDocument();

      // Check for NPC-specific form sections
      expect(screen.getByLabelText(/npc name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/challenge rating/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/creature type/i)).toBeInTheDocument();
    });

    it('renders template selection section', () => {
      render(<NPCCreationForm {...defaultProps} />);

      expect(screen.getByText('Start from Template')).toBeInTheDocument();
      expect(screen.getByText('Create Custom NPC')).toBeInTheDocument();
    });

    it('renders all ability score fields', () => {
      render(<NPCCreationForm {...defaultProps} />);

      const abilityScores = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
      abilityScores.forEach(ability => {
        expect(screen.getByLabelText(new RegExp(ability, 'i'))).toBeInTheDocument();
      });
    });

    it('renders NPC-specific combat stats fields', () => {
      render(<NPCCreationForm {...defaultProps} />);

      expect(screen.getByLabelText(/hit points/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/armor class/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/speed/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/damage resistances/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/damage immunities/i)).toBeInTheDocument();
    });

    it('renders behavior and notes section', () => {
      render(<NPCCreationForm {...defaultProps} />);

      expect(screen.getByLabelText(/personality/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/motivations/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tactics/i)).toBeInTheDocument();
    });
  });

  describe('Template Selection', () => {
    it('loads and displays available NPC templates', async () => {
      render(<NPCCreationForm {...defaultProps} />);

      await waitFor(() => {
        expect(mockNPCTemplateService.getTemplates).toHaveBeenCalled();
      });

      // Check template cards are displayed
      expect(screen.getByText('Guard')).toBeInTheDocument();
      expect(screen.getByText('Goblin')).toBeInTheDocument();
      expect(screen.getByText('CR 1/8')).toBeInTheDocument();
      expect(screen.getByText('CR 1/4')).toBeInTheDocument();
    });

    it('filters templates by category', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Guard')).toBeInTheDocument();
      });

      const categoryFilter = screen.getByLabelText(/filter by category/i);
      await user.selectOptions(categoryFilter, 'humanoid');

      expect(screen.getByText('Guard')).toBeInTheDocument();
      expect(screen.getByText('Goblin')).toBeInTheDocument();
    });

    it('searches templates by name', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Guard')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText(/search templates/i);
      await user.type(searchInput, 'Guard');

      expect(screen.getByText('Guard')).toBeInTheDocument();
      expect(screen.queryByText('Goblin')).not.toBeInTheDocument();
    });

    it('pre-fills form when template is selected', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Guard')).toBeInTheDocument();
      });

      const guardTemplate = screen.getByText('Guard').closest('button');
      await user.click(guardTemplate!);

      // Check that form fields are pre-filled
      expect(screen.getByDisplayValue('Guard')).toBeInTheDocument();
      expect(screen.getByDisplayValue('13')).toBeInTheDocument(); // Strength
      expect(screen.getByDisplayValue('11')).toBeInTheDocument(); // Hit Points
      expect(screen.getByDisplayValue('16')).toBeInTheDocument(); // AC
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      render(<NPCCreationForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /create npc/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/npc name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/creature type is required/i)).toBeInTheDocument();
        expect(screen.getByText(/challenge rating is required/i)).toBeInTheDocument();
      });
    });

    it('validates challenge rating is within valid range', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      const crField = screen.getByLabelText(/challenge rating/i);
      await user.clear(crField);
      await user.type(crField, '35');

      const submitButton = screen.getByRole('button', { name: /create npc/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/challenge rating must be between 0 and 30/i)).toBeInTheDocument();
      });
    });

    it('validates ability scores are within valid range', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      const strengthField = screen.getByLabelText(/strength/i);
      await user.clear(strengthField);
      await user.type(strengthField, '31');

      const submitButton = screen.getByRole('button', { name: /create npc/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/strength must be between 1 and 30/i)).toBeInTheDocument();
      });
    });

    it('validates hit points are positive', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      const hpField = screen.getByLabelText(/hit points/i);
      await user.clear(hpField);
      await user.type(hpField, '-5');

      const submitButton = screen.getByRole('button', { name: /create npc/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/hit points must be at least 1/i)).toBeInTheDocument();
      });
    });
  });

  describe('Stat Block Creation', () => {
    it('calculates proficiency bonus based on challenge rating', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      const crField = screen.getByLabelText(/challenge rating/i);
      await user.clear(crField);
      await user.type(crField, '5');

      // Proficiency bonus should be calculated and displayed
      expect(screen.getByText(/proficiency bonus: \+3/i)).toBeInTheDocument();
    });

    it('calculates ability modifiers automatically', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      const strengthField = screen.getByLabelText(/strength/i);
      await user.clear(strengthField);
      await user.type(strengthField, '16');

      // Modifier should be calculated and displayed
      expect(screen.getByText(/\+3/)).toBeInTheDocument();
    });

    it('validates armor class calculation', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/npc name/i), 'Test NPC');
      await user.selectOptions(screen.getByLabelText(/creature type/i), 'humanoid');
      await user.type(screen.getByLabelText(/challenge rating/i), '1');

      // Set dexterity
      const dexField = screen.getByLabelText(/dexterity/i);
      await user.clear(dexField);
      await user.type(dexField, '14');

      // AC should suggest base 10 + dex modifier
      expect(screen.getByText(/suggested ac: 12/i)).toBeInTheDocument();
    });
  });

  describe('Equipment and Spells', () => {
    it('allows adding equipment items', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      const addEquipmentButton = screen.getByRole('button', { name: /add equipment/i });
      await user.click(addEquipmentButton);

      const equipmentInput = screen.getByLabelText(/equipment item/i);
      await user.type(equipmentInput, 'Longsword');

      expect(screen.getByDisplayValue('Longsword')).toBeInTheDocument();
    });

    it('allows adding spells for spellcaster NPCs', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      const spellcasterCheckbox = screen.getByLabelText(/spellcaster/i);
      await user.click(spellcasterCheckbox);

      const addSpellButton = screen.getByRole('button', { name: /add spell/i });
      await user.click(addSpellButton);

      const spellInput = screen.getByLabelText(/spell name/i);
      await user.type(spellInput, 'Magic Missile');

      expect(screen.getByDisplayValue('Magic Missile')).toBeInTheDocument();
    });

    it('removes equipment items', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      // Add equipment first
      const addEquipmentButton = screen.getByRole('button', { name: /add equipment/i });
      await user.click(addEquipmentButton);

      const equipmentInput = screen.getByLabelText(/equipment item/i);
      await user.type(equipmentInput, 'Shield');

      // Remove equipment
      const removeButton = screen.getByRole('button', { name: /remove equipment/i });
      await user.click(removeButton);

      expect(screen.queryByDisplayValue('Shield')).not.toBeInTheDocument();
    });
  });

  describe('NPC Behavior Notes', () => {
    it('allows entering personality traits', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      const personalityField = screen.getByLabelText(/personality/i);
      await user.type(personalityField, 'Gruff but fair');

      expect(screen.getByDisplayValue('Gruff but fair')).toBeInTheDocument();
    });

    it('allows entering motivations', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      const motivationsField = screen.getByLabelText(/motivations/i);
      await user.type(motivationsField, 'Protect the village');

      expect(screen.getByDisplayValue('Protect the village')).toBeInTheDocument();
    });

    it('allows entering tactical notes', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      const tacticsField = screen.getByLabelText(/tactics/i);
      await user.type(tacticsField, 'Fights defensively, calls for help');

      expect(screen.getByDisplayValue('Fights defensively, calls for help')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid NPC data', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      // Fill out the form
      await user.type(screen.getByLabelText(/npc name/i), 'Test Guard');
      await user.selectOptions(screen.getByLabelText(/creature type/i), 'humanoid');
      await user.type(screen.getByLabelText(/challenge rating/i), '0.5');

      // Fill ability scores
      const abilityFields = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
      for (const ability of abilityFields) {
        const field = screen.getByLabelText(new RegExp(ability, 'i'));
        await user.clear(field);
        await user.type(field, '12');
      }

      await user.type(screen.getByLabelText(/hit points/i), '8');
      await user.type(screen.getByLabelText(/armor class/i), '14');

      const submitButton = screen.getByRole('button', { name: /create npc/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCharacterService.createCharacter).toHaveBeenCalledWith('user123', expect.objectContaining({
          name: 'Test Guard',
          type: 'npc',
          creatureType: 'humanoid',
          challengeRating: 0.5,
          abilityScores: expect.objectContaining({
            strength: 12,
            dexterity: 12,
            constitution: 12,
            intelligence: 12,
            wisdom: 12,
            charisma: 12,
          }),
          hitPoints: expect.objectContaining({
            maximum: 8,
            current: 8,
          }),
          armorClass: 14,
        }));
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      mockCharacterService.createCharacter.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} as any }), 100))
      );

      render(<NPCCreationForm {...defaultProps} />);

      // Fill required fields (minimal)
      await user.type(screen.getByLabelText(/npc name/i), 'Test NPC');
      await user.selectOptions(screen.getByLabelText(/creature type/i), 'humanoid');
      await user.type(screen.getByLabelText(/challenge rating/i), '1');

      const submitButton = screen.getByRole('button', { name: /create npc/i });
      await user.click(submitButton);

      expect(screen.getByText(/creating npc/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('handles submission errors', async () => {
      const user = userEvent.setup();
      mockCharacterService.createCharacter.mockResolvedValue({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid NPC data',
          details: { field: 'challengeRating', message: 'Challenge rating is invalid' },
        },
      });

      render(<NPCCreationForm {...defaultProps} />);

      // Fill and submit form
      await user.type(screen.getByLabelText(/npc name/i), 'Test NPC');
      await user.selectOptions(screen.getByLabelText(/creature type/i), 'humanoid');
      await user.type(screen.getByLabelText(/challenge rating/i), '1');

      const submitButton = screen.getByRole('button', { name: /create npc/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid npc data/i)).toBeInTheDocument();
      });
    });
  });

  describe('Import from External Sources', () => {
    it('shows import options', () => {
      render(<NPCCreationForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: /import from d&d beyond/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /import from json/i })).toBeInTheDocument();
    });

    it('handles JSON import', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      const jsonImportButton = screen.getByRole('button', { name: /import from json/i });
      await user.click(jsonImportButton);

      const jsonInput = screen.getByLabelText(/paste json data/i);
      const mockNPCData = JSON.stringify({
        name: 'Imported NPC',
        type: 'npc',
        challengeRating: 2,
        abilityScores: { strength: 14, dexterity: 12, constitution: 13, intelligence: 10, wisdom: 11, charisma: 9 },
      });

      await user.type(jsonInput, mockNPCData);
      
      const importButton = screen.getByRole('button', { name: /import/i });
      await user.click(importButton);

      expect(screen.getByDisplayValue('Imported NPC')).toBeInTheDocument();
      expect(screen.getByDisplayValue('14')).toBeInTheDocument(); // Strength
    });
  });

  describe('NPC Variants and Customization', () => {
    it('allows creating variants of existing NPCs', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      const variantCheckbox = screen.getByLabelText(/create variant/i);
      await user.click(variantCheckbox);

      const baseNPCSelect = screen.getByLabelText(/base npc/i);
      expect(baseNPCSelect).toBeInTheDocument();
    });

    it('applies variant modifiers', async () => {
      const user = userEvent.setup();
      render(<NPCCreationForm {...defaultProps} />);

      const variantCheckbox = screen.getByLabelText(/create variant/i);
      await user.click(variantCheckbox);

      const modifierSelect = screen.getByLabelText(/variant type/i);
      await user.selectOptions(modifierSelect, 'elite');

      // Should show modifier explanation
      expect(screen.getByText(/elite variant increases challenge rating/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and ARIA attributes', () => {
      render(<NPCCreationForm {...defaultProps} />);

      // Check that all form controls have labels
      const nameField = screen.getByLabelText(/npc name/i);
      expect(nameField).toHaveAttribute('aria-required', 'true');

      const crField = screen.getByLabelText(/challenge rating/i);
      expect(crField).toHaveAttribute('aria-required', 'true');

      // Check ability score fields have proper attributes
      const strengthField = screen.getByLabelText(/strength/i);
      expect(strengthField).toHaveAttribute('type', 'number');
      expect(strengthField).toHaveAttribute('min', '1');
      expect(strengthField).toHaveAttribute('max', '30');
    });

    it('announces form errors to screen readers', async () => {
      render(<NPCCreationForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /create npc/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/npc name is required/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });
});