import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterStatsManager } from './CharacterStatsManager';
import { CharacterService } from '@/lib/services/CharacterService';

// Mock the CharacterService
jest.mock('@/lib/services/CharacterService', () => ({
  CharacterService: {
    getCharacterById: jest.fn(),
    calculateCharacterStats: jest.fn(),
    updateCharacter: jest.fn(),
  }
}));

// Mock character data
const mockCharacter = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Test Character',
  type: 'pc' as const,
  race: 'human',
  size: 'medium' as const,
  classes: [
    { class: 'fighter', level: 5, subclass: 'Champion', hitDie: 10 }
  ],
  abilityScores: {
    strength: 16,
    dexterity: 14,
    constitution: 15,
    intelligence: 12,
    wisdom: 13,
    charisma: 10
  },
  hitPoints: {
    maximum: 47,
    current: 47,
    temporary: 0
  },
  armorClass: 18,
  speed: 30,
  proficiencyBonus: 3,
  savingThrows: {
    strength: true,
    dexterity: false,
    constitution: true,
    intelligence: false,
    wisdom: false,
    charisma: false
  },
  skills: new Map([
    ['athletics', true],
    ['intimidation', true],
    ['perception', false]
  ]),
  equipment: [
    {
      name: 'Longsword',
      quantity: 1,
      weight: 3,
      value: 15,
      equipped: true,
      magical: false
    }
  ],
  backstory: 'A brave warrior',
  notes: 'Remember to track rations',
  isPublic: false,
  ownerId: '507f1f77bcf86cd799439012',
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockStats = {
  abilityModifiers: {
    strength: 3,
    dexterity: 2,
    constitution: 2,
    intelligence: 1,
    wisdom: 1,
    charisma: 0
  },
  savingThrows: {
    strength: 6,
    dexterity: 2,
    constitution: 5,
    intelligence: 1,
    wisdom: 1,
    charisma: 0
  },
  skills: {
    athletics: 6,
    intimidation: 3,
    perception: 1
  },
  totalLevel: 5,
  classLevels: { fighter: 5 },
  proficiencyBonus: 3,
  initiativeModifier: 2,
  armorClass: 18,
  effectiveHitPoints: 47,
  status: 'alive' as const,
  isAlive: true,
  isUnconscious: false
};

describe('CharacterStatsManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (CharacterService.getCharacterById as jest.Mock).mockResolvedValue({
      success: true,
      data: mockCharacter
    });
    (CharacterService.calculateCharacterStats as jest.Mock).mockResolvedValue({
      success: true,
      data: mockStats
    });
  });

  describe('Basic Rendering', () => {
    it('should render character stats manager component', async () => {
      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('character-stats-manager')).toBeInTheDocument();
      });
    });

    it('should display loading state initially', () => {
      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      expect(screen.getByTestId('stats-loading')).toBeInTheDocument();
    });

    it('should display character name when loaded', async () => {
      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Character')).toBeInTheDocument();
      });
    });
  });

  describe('Ability Scores Display', () => {
    it('should display all six ability scores', async () => {
      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('ability-strength')).toBeInTheDocument();
        expect(screen.getByTestId('ability-dexterity')).toBeInTheDocument();
        expect(screen.getByTestId('ability-constitution')).toBeInTheDocument();
        expect(screen.getByTestId('ability-intelligence')).toBeInTheDocument();
        expect(screen.getByTestId('ability-wisdom')).toBeInTheDocument();
        expect(screen.getByTestId('ability-charisma')).toBeInTheDocument();
      });
    });

    it('should display ability scores with correct values', async () => {
      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('ability-strength')).toHaveTextContent('16');
        expect(screen.getByTestId('ability-strength')).toHaveTextContent('+3');
      });
    });

    it('should allow editing ability scores when in edit mode', async () => {
      const user = userEvent.setup();
      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('ability-strength')).toBeInTheDocument();
      });

      // Click edit button
      const editButton = screen.getByTestId('edit-stats-button');
      await user.click(editButton);

      // Should see editable input
      const strengthInput = screen.getByTestId('ability-strength-input');
      expect(strengthInput).toBeInTheDocument();
      expect(strengthInput).toHaveValue(16);
    });
  });

  describe('Derived Stats Display', () => {
    it('should display armor class, initiative, and hit points', async () => {
      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('armor-class')).toHaveTextContent('18');
        expect(screen.getByTestId('initiative')).toHaveTextContent('+2');
        expect(screen.getByTestId('hit-points')).toHaveTextContent('47/47');
      });
    });

    it('should display saving throws with proficiency indicators', async () => {
      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('saving-throw-strength')).toHaveTextContent('+6');
        expect(screen.getByTestId('saving-throw-strength')).toHaveClass('proficient');
        expect(screen.getByTestId('saving-throw-dexterity')).toHaveTextContent('+2');
        expect(screen.getByTestId('saving-throw-dexterity')).not.toHaveClass('proficient');
      });
    });

    it('should display skills with proficiency indicators', async () => {
      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('skill-athletics')).toHaveTextContent('+6');
        expect(screen.getByTestId('skill-athletics')).toHaveClass('proficient');
        expect(screen.getByTestId('skill-perception')).toHaveTextContent('+1');
        expect(screen.getByTestId('skill-perception')).not.toHaveClass('proficient');
      });
    });
  });

  describe('Equipment Management', () => {
    it('should display equipment list', async () => {
      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('equipment-list')).toBeInTheDocument();
        expect(screen.getByText('Longsword')).toBeInTheDocument();
      });
    });

    it('should allow adding new equipment', async () => {
      const user = userEvent.setup();
      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('equipment-list')).toBeInTheDocument();
      });

      const addButton = screen.getByTestId('add-equipment-button');
      await user.click(addButton);

      expect(screen.getByTestId('new-equipment-form')).toBeInTheDocument();
    });

    it('should calculate total equipment weight', async () => {
      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('total-weight')).toHaveTextContent('3 lbs');
      });
    });
  });

  describe('Character Notes', () => {
    it('should display backstory and notes sections', async () => {
      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('backstory-section')).toBeInTheDocument();
        expect(screen.getByTestId('notes-section')).toBeInTheDocument();
        expect(screen.getByText('A brave warrior')).toBeInTheDocument();
        expect(screen.getByText('Remember to track rations')).toBeInTheDocument();
      });
    });

    it('should allow editing backstory and notes', async () => {
      const user = userEvent.setup();
      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('backstory-section')).toBeInTheDocument();
      });

      const editButton = screen.getByTestId('edit-backstory-button');
      await user.click(editButton);

      const backstoryTextarea = screen.getByTestId('backstory-textarea');
      expect(backstoryTextarea).toBeInTheDocument();
      expect(backstoryTextarea).toHaveValue('A brave warrior');
    });
  });

  describe('Error Handling', () => {
    it('should display error message when character loading fails', async () => {
      (CharacterService.getCharacterById as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Character not found', code: 'NOT_FOUND' }
      });

      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Character not found');
      });
    });

    it('should display error message when stats calculation fails', async () => {
      (CharacterService.calculateCharacterStats as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Failed to calculate stats', code: 'CALCULATION_ERROR' }
      });

      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('stats-error')).toHaveTextContent('Failed to calculate stats');
      });
    });
  });

  describe('Save Functionality', () => {
    it('should save changes when save button is clicked', async () => {
      const user = userEvent.setup();
      (CharacterService.updateCharacter as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCharacter
      });

      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('ability-strength')).toBeInTheDocument();
      });

      // Enter edit mode and modify strength
      const editButton = screen.getByTestId('edit-stats-button');
      await user.click(editButton);

      const strengthInput = screen.getByTestId('ability-strength-input') as HTMLInputElement;
      expect(strengthInput).toHaveValue(16);
      
      // Use fireEvent to properly clear and set the value
      fireEvent.change(strengthInput, { target: { value: '18' } });
      expect(strengthInput).toHaveValue(18);

      // Save changes
      const saveButton = screen.getByTestId('save-stats-button');
      await user.click(saveButton);

      await waitFor(() => {
        expect(CharacterService.updateCharacter).toHaveBeenCalledWith(
          '507f1f77bcf86cd799439011',
          '507f1f77bcf86cd799439012',
          expect.objectContaining({
            abilityScores: expect.objectContaining({
              strength: 18
            })
          })
        );
      });
    });

    it('should display save confirmation message', async () => {
      const user = userEvent.setup();
      (CharacterService.updateCharacter as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCharacter
      });

      render(<CharacterStatsManager characterId="507f1f77bcf86cd799439011" userId="507f1f77bcf86cd799439012" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('edit-stats-button')).toBeInTheDocument();
      });

      const editButton = screen.getByTestId('edit-stats-button');
      await user.click(editButton);

      const saveButton = screen.getByTestId('save-stats-button');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId('save-success-message')).toBeInTheDocument();
      });
    });
  });
});