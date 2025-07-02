import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterListView } from '../CharacterListView';
import { CharacterService } from '@/lib/services/CharacterService';
import type { ICharacter } from '@/lib/models/Character';

// Mock the CharacterService
jest.mock('@/lib/services/CharacterService');
const mockCharacterService = CharacterService as jest.Mocked<typeof CharacterService>;

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Test data
const mockCharacters: ICharacter[] = [
  {
    _id: 'char1',
    name: 'Aragorn',
    type: 'pc',
    level: 5,
    race: 'human',
    classes: [{ class: 'ranger', level: 5, subclass: '', hitDie: 10 }],
    ownerId: 'user1',
    hitPoints: { current: 45, maximum: 45, temporary: 0 },
    armorClass: 16,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    _id: 'char2',
    name: 'Legolas',
    type: 'pc',
    level: 4,
    race: 'elf',
    classes: [{ class: 'ranger', level: 4, subclass: '', hitDie: 10 }],
    ownerId: 'user1',
    hitPoints: { current: 32, maximum: 32, temporary: 0 },
    armorClass: 15,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-06'),
  },
  {
    _id: 'char3',
    name: 'Gimli',
    type: 'pc',
    level: 3,
    race: 'dwarf',
    classes: [{ class: 'fighter', level: 3, subclass: '', hitDie: 10 }],
    ownerId: 'user1',
    hitPoints: { current: 28, maximum: 28, temporary: 0 },
    armorClass: 18,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-04'),
  },
] as ICharacter[];

describe('CharacterListView', () => {
  const defaultProps = {
    userId: 'user1',
    onCharacterSelect: jest.fn(),
    onCharacterEdit: jest.fn(),
    onCharacterDelete: jest.fn(),
    onCharacterDuplicate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCharacterService.getCharactersByOwner.mockResolvedValue({
      success: true,
      data: {
        items: mockCharacters,
        pagination: {
          page: 1,
          limit: 12,
          total: 3,
          totalPages: 1,
        },
      },
    });
  });

  describe('Component Rendering', () => {
    it('should render character list view with loading state initially', () => {
      render(<CharacterListView {...defaultProps} />);

      expect(screen.getByText(/loading characters/i)).toBeInTheDocument();
    });

    it('should render character list after data loads', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
        expect(screen.getByText('Legolas')).toBeInTheDocument();
        expect(screen.getByText('Gimli')).toBeInTheDocument();
      });
    });

    it('should display character essential information in cards', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        // Check for character details
        expect(screen.getByText('Level 5')).toBeInTheDocument();
        expect(screen.getByText('Human Ranger')).toBeInTheDocument();
        expect(screen.getByText('AC 16')).toBeInTheDocument();
        expect(screen.getByText('HP 45/45')).toBeInTheDocument();
      });
    });
  });

  describe('View Options', () => {
    it('should toggle between grid and table view', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Find view toggle buttons
      const tableViewButton = screen.getByRole('button', { name: /table view/i });
      const gridViewButton = screen.getByRole('button', { name: /grid view/i });

      expect(tableViewButton).toBeInTheDocument();
      expect(gridViewButton).toBeInTheDocument();

      // Click table view
      fireEvent.click(tableViewButton);

      // Should show table headers
      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Level')).toBeInTheDocument();
        expect(screen.getByText('Class')).toBeInTheDocument();
        expect(screen.getByText('Race')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filtering', () => {
    it('should render search input', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search characters/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should filter characters by search term', async () => {
      const user = userEvent.setup();
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search characters/i);
      await user.type(searchInput, 'Aragorn');

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
        expect(screen.queryByText('Legolas')).not.toBeInTheDocument();
        expect(screen.queryByText('Gimli')).not.toBeInTheDocument();
      });
    });

    it('should filter characters by class', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const classFilter = screen.getByRole('combobox', { name: /filter by class/i });
      fireEvent.change(classFilter, { target: { value: 'ranger' } });

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
        expect(screen.getByText('Legolas')).toBeInTheDocument();
        expect(screen.queryByText('Gimli')).not.toBeInTheDocument();
      });
    });

    it('should filter characters by race', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const raceFilter = screen.getByRole('combobox', { name: /filter by race/i });
      fireEvent.change(raceFilter, { target: { value: 'human' } });

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
        expect(screen.queryByText('Legolas')).not.toBeInTheDocument();
        expect(screen.queryByText('Gimli')).not.toBeInTheDocument();
      });
    });
  });

  describe('Sorting', () => {
    it('should sort characters by name ascending', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
      fireEvent.change(sortSelect, { target: { value: 'name-asc' } });

      // Characters should be sorted: Aragorn, Gimli, Legolas
      const characterNames = screen.getAllByTestId(/character-name/i);
      expect(characterNames[0]).toHaveTextContent('Aragorn');
      expect(characterNames[1]).toHaveTextContent('Gimli');
      expect(characterNames[2]).toHaveTextContent('Legolas');
    });

    it('should sort characters by level descending', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
      fireEvent.change(sortSelect, { target: { value: 'level-desc' } });

      // Characters should be sorted: Aragorn (5), Legolas (4), Gimli (3)
      const characterLevels = screen.getAllByTestId(/character-level/i);
      expect(characterLevels[0]).toHaveTextContent('Level 5');
      expect(characterLevels[1]).toHaveTextContent('Level 4');
      expect(characterLevels[2]).toHaveTextContent('Level 3');
    });

    it('should sort characters by date created', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
      fireEvent.change(sortSelect, { target: { value: 'date-desc' } });

      // Characters should be sorted by date: Legolas (Jan 5), Gimli (Jan 3), Aragorn (Jan 1)
      const characterNames = screen.getAllByTestId(/character-name/i);
      expect(characterNames[0]).toHaveTextContent('Legolas');
      expect(characterNames[1]).toHaveTextContent('Gimli');
      expect(characterNames[2]).toHaveTextContent('Aragorn');
    });
  });

  describe('Character Actions', () => {
    it('should call onCharacterEdit when edit button is clicked', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);

      expect(defaultProps.onCharacterEdit).toHaveBeenCalledWith(mockCharacters[0]);
    });

    it('should call onCharacterDelete when delete button is clicked', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      expect(defaultProps.onCharacterDelete).toHaveBeenCalledWith(mockCharacters[0]);
    });

    it('should call onCharacterDuplicate when duplicate button is clicked', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const duplicateButtons = screen.getAllByRole('button', { name: /duplicate/i });
      fireEvent.click(duplicateButtons[0]);

      expect(defaultProps.onCharacterDuplicate).toHaveBeenCalledWith(mockCharacters[0]);
    });

    it('should call onCharacterSelect when character card is clicked', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const characterCard = screen.getByTestId('character-card-char1');
      fireEvent.click(characterCard);

      expect(defaultProps.onCharacterSelect).toHaveBeenCalledWith(mockCharacters[0]);
    });
  });

  describe('Batch Operations', () => {
    it('should allow selecting multiple characters', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');

      // Select first two characters
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      // Should show selected count
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    it('should show batch action buttons when characters are selected', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      // Should show batch actions
      expect(screen.getByRole('button', { name: /delete selected/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /duplicate selected/i })).toBeInTheDocument();
    });

    it('should select all characters when select all checkbox is clicked', async () => {
      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      // Switch to table view to see the select all checkbox
      const tableViewButton = screen.getByRole('button', { name: /table view/i });
      fireEvent.click(tableViewButton);

      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
      });

      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
      fireEvent.click(selectAllCheckbox);

      expect(screen.getByText('3 selected')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when character loading fails', async () => {
      mockCharacterService.getCharactersByOwner.mockResolvedValue({
        success: false,
        error: {
          type: 'DatabaseError',
          message: 'Failed to load characters',
          code: 'DB_ERROR',
        },
      });

      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load characters/i)).toBeInTheDocument();
      });
    });

    it('should display empty state when no characters exist', async () => {
      mockCharacterService.getCharactersByOwner.mockResolvedValue({
        success: true,
        data: {
          items: [],
          pagination: {
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 0,
          },
        },
      });

      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/no characters found/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create your first character/i })).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should handle pagination when there are multiple pages', async () => {
      mockCharacterService.getCharactersByOwner.mockResolvedValue({
        success: true,
        data: {
          items: mockCharacters,
          pagination: {
            page: 1,
            limit: 12,
            total: 25,
            totalPages: 3,
          },
        },
      });

      render(<CharacterListView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Aragorn')).toBeInTheDocument();
      });

      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    });
  });
});