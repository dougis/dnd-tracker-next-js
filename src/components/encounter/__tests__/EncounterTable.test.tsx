import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EncounterTable } from '../EncounterTable';
import type { EncounterListItem, TableSortConfig, TableSelectionConfig } from '../types';
import { Types } from 'mongoose';

// Mock the LoadingCard component
jest.mock('@/components/shared/LoadingCard', () => ({
  LoadingCard: ({ className }: any) => (
    <div data-testid="loading-card" className={className}>
      Mock LoadingCard
    </div>
  ),
}));

// Mock table components
jest.mock('../table/TableHeader', () => ({
  TableHeader: ({
    isAllSelected,
    onSelectAll,
    sortBy,
    sortOrder,
    onSort,
  }: any) => (
    <thead data-testid="table-header">
      <tr>
        <th>
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onSelectAll}
            data-testid="select-all-checkbox"
          />
        </th>
        <th>
          <button onClick={() => onSort('name')} data-testid="sort-name">
            Name (Sort: {sortBy === 'name' ? sortOrder : 'none'})
          </button>
        </th>
        <th>
          <button onClick={() => onSort('difficulty')} data-testid="sort-difficulty">
            Difficulty (Sort: {sortBy === 'difficulty' ? sortOrder : 'none'})
          </button>
        </th>
      </tr>
    </thead>
  ),
}));

jest.mock('../table/TableRow', () => ({
  TableRow: ({ encounter, isSelected, onSelect, onRefetch }: any) => (
    <tr data-testid={`table-row-${encounter.id}`}>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(encounter.id)}
          data-testid={`select-${encounter.id}`}
        />
      </td>
      <td>Mock Row: {encounter.name}</td>
      <td>
        <button onClick={onRefetch} data-testid={`refetch-${encounter.id}`}>
          Refetch
        </button>
      </td>
    </tr>
  ),
}));

// Mock table utilities
jest.mock('../table/tableUtils', () => ({
  createSortHandler: jest.fn((sortBy, sortOrder, onSort) => {
    return (column: string) => {
      const newSortOrder = column === sortBy && sortOrder === 'asc' ? 'desc' : 'asc';
      onSort(column, newSortOrder);
    };
  }),
}));

const createMockEncounter = (overrides: Partial<EncounterListItem> = {}): EncounterListItem => ({
  id: 'test-encounter-id',
  ownerId: new Types.ObjectId(),
  name: 'Test Encounter',
  description: 'A test encounter',
  tags: ['test'],
  difficulty: 'medium',
  estimatedDuration: 60,
  targetLevel: 5,
  participants: [],
  settings: {
    allowPlayerNotes: true,
    autoRollInitiative: false,
    trackResources: true,
    enableTurnTimer: false,
    turnTimerDuration: 300,
    showInitiativeToPlayers: true,
  },
  combatState: {
    isActive: false,
    currentTurn: 0,
    currentRound: 0,
    startedAt: null,
    endedAt: null,
    history: [],
  },
  status: 'draft',
  partyId: new Types.ObjectId(),
  isPublic: false,
  sharedWith: [],
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  participantCount: 0,
  playerCount: 0,
  ...overrides,
});

const createMockSelectionConfig = (overrides: Partial<TableSelectionConfig> = {}): TableSelectionConfig => ({
  selectedEncounters: [],
  isAllSelected: false,
  onSelectAll: jest.fn(),
  onSelectEncounter: jest.fn(),
  ...overrides,
});

const createMockSortConfig = (overrides: Partial<TableSortConfig> = {}): TableSortConfig => ({
  sortBy: 'name',
  sortOrder: 'asc',
  onSort: jest.fn(),
  ...overrides,
});

describe('EncounterTable', () => {
  const defaultProps = {
    encounters: [],
    isLoading: false,
    selection: createMockSelectionConfig(),
    sort: createMockSortConfig(),
    onRefetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should render loading cards when isLoading is true', () => {
      render(<EncounterTable {...defaultProps} isLoading={true} />);
      
      const loadingCards = screen.getAllByTestId('loading-card');
      expect(loadingCards).toHaveLength(5);
    });

    it('should render loading cards with correct height class', () => {
      render(<EncounterTable {...defaultProps} isLoading={true} />);
      
      const loadingCards = screen.getAllByTestId('loading-card');
      loadingCards.forEach(card => {
        expect(card).toHaveClass('h-16');
      });
    });

    it('should not render table when loading', () => {
      const encounters = [createMockEncounter()];
      
      render(
        <EncounterTable 
          {...defaultProps} 
          encounters={encounters} 
          isLoading={true} 
        />
      );
      
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByTestId('table-header')).not.toBeInTheDocument();
    });

    it('should render loading cards in a space-y-4 container', () => {
      render(<EncounterTable {...defaultProps} isLoading={true} />);
      
      const container = screen.getAllByTestId('loading-card')[0].parentElement;
      expect(container).toHaveClass('space-y-4');
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no encounters and not loading', () => {
      render(<EncounterTable {...defaultProps} encounters={[]} isLoading={false} />);
      
      expect(screen.getByText('No encounters found')).toBeInTheDocument();
      expect(screen.getByText(/Create your first encounter to get started/)).toBeInTheDocument();
    });

    it('should render empty state in centered layout', () => {
      render(<EncounterTable {...defaultProps} encounters={[]} isLoading={false} />);
      
      const emptyContainer = screen.getByText('No encounters found').closest('div');
      expect(emptyContainer?.parentElement).toHaveClass('text-center', 'py-12');
    });

    it('should not render empty state when loading', () => {
      render(<EncounterTable {...defaultProps} encounters={[]} isLoading={true} />);
      
      expect(screen.queryByText('No encounters found')).not.toBeInTheDocument();
    });

    it('should not render table when showing empty state', () => {
      render(<EncounterTable {...defaultProps} encounters={[]} isLoading={false} />);
      
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Table Rendering', () => {
    it('should render table with encounters', () => {
      const encounters = [
        createMockEncounter({ id: 'encounter-1', name: 'First Encounter' }),
        createMockEncounter({ id: 'encounter-2', name: 'Second Encounter' }),
      ];
      
      render(<EncounterTable {...defaultProps} encounters={encounters} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByTestId('table-header')).toBeInTheDocument();
      expect(screen.getByTestId('table-row-encounter-1')).toBeInTheDocument();
      expect(screen.getByTestId('table-row-encounter-2')).toBeInTheDocument();
    });

    it('should render table with proper structure and classes', () => {
      const encounters = [createMockEncounter()];
      
      render(<EncounterTable {...defaultProps} encounters={encounters} />);
      
      const scrollContainer = screen.getByRole('table').parentElement;
      expect(scrollContainer).toHaveClass('overflow-x-auto');
      
      const tableContainer = scrollContainer?.parentElement;
      expect(tableContainer).toHaveClass('border', 'rounded-md');
      
      const table = screen.getByRole('table');
      expect(table).toHaveClass('w-full');
    });

    it('should render encounters with correct data', () => {
      const encounters = [
        createMockEncounter({ id: 'test-1', name: 'Test Name 1' }),
        createMockEncounter({ id: 'test-2', name: 'Test Name 2' }),
      ];
      
      render(<EncounterTable {...defaultProps} encounters={encounters} />);
      
      expect(screen.getByText('Mock Row: Test Name 1')).toBeInTheDocument();
      expect(screen.getByText('Mock Row: Test Name 2')).toBeInTheDocument();
    });
  });

  describe('Selection Handling', () => {
    it('should pass selection props to TableHeader', () => {
      const encounters = [createMockEncounter({ id: 'encounter-1' })];
      const selection = createMockSelectionConfig({
        isAllSelected: true,
        selectedEncounters: ['encounter-1'],
      });
      
      render(<EncounterTable {...defaultProps} encounters={encounters} selection={selection} />);
      
      const selectAllCheckbox = screen.getByTestId('select-all-checkbox');
      expect(selectAllCheckbox).toBeChecked();
    });

    it('should call onSelectAll when select all checkbox is clicked', async () => {
      const encounters = [createMockEncounter()];
      const selection = createMockSelectionConfig();
      const user = userEvent.setup();
      
      render(<EncounterTable {...defaultProps} encounters={encounters} selection={selection} />);
      
      const selectAllCheckbox = screen.getByTestId('select-all-checkbox');
      await user.click(selectAllCheckbox);
      
      expect(selection.onSelectAll).toHaveBeenCalledTimes(1);
    });

    it('should show selected state for selected encounters', () => {
      const encounters = [
        createMockEncounter({ id: 'encounter-1' }),
        createMockEncounter({ id: 'encounter-2' }),
      ];
      const selection = createMockSelectionConfig({
        selectedEncounters: ['encounter-1'],
      });
      
      render(
        <EncounterTable 
          {...defaultProps} 
          encounters={encounters}
          selection={selection}
        />
      );
      
      const checkbox1 = screen.getByTestId('select-encounter-1');
      const checkbox2 = screen.getByTestId('select-encounter-2');
      
      expect(checkbox1).toBeChecked();
      expect(checkbox2).not.toBeChecked();
    });

    it('should call onSelectEncounter when individual encounter is selected', async () => {
      const encounters = [createMockEncounter({ id: 'test-encounter' })];
      const selection = createMockSelectionConfig();
      const user = userEvent.setup();
      
      render(
        <EncounterTable 
          {...defaultProps} 
          encounters={encounters}
          selection={selection}
        />
      );
      
      const checkbox = screen.getByTestId('select-test-encounter');
      await user.click(checkbox);
      
      expect(selection.onSelectEncounter).toHaveBeenCalledWith('test-encounter');
    });
  });

  describe('Sorting Handling', () => {
    it('should pass sort props to TableHeader', () => {
      const encounters = [createMockEncounter()];
      const sort = createMockSortConfig({
        sortBy: 'difficulty',
        sortOrder: 'desc',
      });
      
      render(<EncounterTable {...defaultProps} encounters={encounters} sort={sort} />);
      
      expect(screen.getByText('Name (Sort: none)')).toBeInTheDocument();
      expect(screen.getByText('Difficulty (Sort: desc)')).toBeInTheDocument();
    });

    it('should create sort handler and pass to TableHeader', () => {
      const { createSortHandler } = require('../table/tableUtils');
      const sort = createMockSortConfig();
      
      render(<EncounterTable {...defaultProps} sort={sort} />);
      
      expect(createSortHandler).toHaveBeenCalledWith(
        sort.sortBy,
        sort.sortOrder,
        sort.onSort
      );
    });

    it('should handle sort button clicks', async () => {
      const encounters = [createMockEncounter()];
      const sort = createMockSortConfig();
      const user = userEvent.setup();
      
      render(<EncounterTable {...defaultProps} encounters={encounters} sort={sort} />);
      
      const nameSort = screen.getByTestId('sort-name');
      await user.click(nameSort);
      
      expect(sort.onSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('should toggle sort order for same column', async () => {
      const encounters = [createMockEncounter()];
      const sort = createMockSortConfig({
        sortBy: 'name',
        sortOrder: 'asc',
      });
      const user = userEvent.setup();
      
      render(<EncounterTable {...defaultProps} encounters={encounters} sort={sort} />);
      
      const nameSort = screen.getByTestId('sort-name');
      await user.click(nameSort);
      
      expect(sort.onSort).toHaveBeenCalledWith('name', 'desc');
    });
  });

  describe('Refetch Handling', () => {
    it('should call onRefetch when refetch button is clicked in TableRow', async () => {
      const encounters = [createMockEncounter({ id: 'test-encounter' })];
      const user = userEvent.setup();
      
      render(<EncounterTable {...defaultProps} encounters={encounters} />);
      
      const refetchButton = screen.getByTestId('refetch-test-encounter');
      await user.click(refetchButton);
      
      expect(defaultProps.onRefetch).toHaveBeenCalledTimes(1);
    });

    it('should pass onRefetch to all TableRow components', () => {
      const encounters = [
        createMockEncounter({ id: 'encounter-1' }),
        createMockEncounter({ id: 'encounter-2' }),
      ];
      
      render(<EncounterTable {...defaultProps} encounters={encounters} />);
      
      expect(screen.getByTestId('refetch-encounter-1')).toBeInTheDocument();
      expect(screen.getByTestId('refetch-encounter-2')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle large number of encounters', () => {
      const encounters = Array.from({ length: 100 }, (_, i) => 
        createMockEncounter({ id: `encounter-${i}`, name: `Encounter ${i}` })
      );
      
      render(<EncounterTable {...defaultProps} encounters={encounters} />);
      
      // Check that all encounters are rendered
      encounters.forEach((encounter) => {
        expect(screen.getByTestId(`table-row-${encounter.id}`)).toBeInTheDocument();
      });
    });

    it('should handle empty selectedEncounters array', () => {
      const encounters = [createMockEncounter({ id: 'test-id' })];
      const selection = createMockSelectionConfig({
        selectedEncounters: [],
      });
      
      render(
        <EncounterTable 
          {...defaultProps} 
          encounters={encounters}
          selection={selection}
        />
      );
      
      const checkbox = screen.getByTestId('select-test-id');
      expect(checkbox).not.toBeChecked();
    });

    it('should handle all encounters selected', () => {
      const encounters = [
        createMockEncounter({ id: 'encounter-1' }),
        createMockEncounter({ id: 'encounter-2' }),
      ];
      const selection = createMockSelectionConfig({
        selectedEncounters: ['encounter-1', 'encounter-2'],
        isAllSelected: true,
      });
      
      render(
        <EncounterTable 
          {...defaultProps} 
          encounters={encounters}
          selection={selection}
        />
      );
      
      const selectAllCheckbox = screen.getByTestId('select-all-checkbox');
      const checkbox1 = screen.getByTestId('select-encounter-1');
      const checkbox2 = screen.getByTestId('select-encounter-2');
      
      expect(selectAllCheckbox).toBeChecked();
      expect(checkbox1).toBeChecked();
      expect(checkbox2).toBeChecked();
    });

    it('should maintain selection state across re-renders', () => {
      const encounters = [createMockEncounter({ id: 'test-id' })];
      const selection = createMockSelectionConfig({
        selectedEncounters: ['test-id'],
      });
      
      const { rerender } = render(
        <EncounterTable 
          {...defaultProps} 
          encounters={encounters}
          selection={selection}
        />
      );
      
      expect(screen.getByTestId('select-test-id')).toBeChecked();
      
      // Re-render with same props
      rerender(
        <EncounterTable 
          {...defaultProps} 
          encounters={encounters}
          selection={selection}
        />
      );
      
      expect(screen.getByTestId('select-test-id')).toBeChecked();
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive overflow classes', () => {
      const encounters = [createMockEncounter()];
      
      render(<EncounterTable {...defaultProps} encounters={encounters} />);
      
      const scrollContainer = screen.getByRole('table').parentElement;
      expect(scrollContainer).toHaveClass('overflow-x-auto');
    });

    it('should apply proper table container styling', () => {
      const encounters = [createMockEncounter()];
      
      render(<EncounterTable {...defaultProps} encounters={encounters} />);
      
      const scrollContainer = screen.getByRole('table').parentElement;
      const tableContainer = scrollContainer?.parentElement;
      expect(tableContainer).toHaveClass('border', 'rounded-md');
    });
  });

  describe('Performance Considerations', () => {
    it('should use encounter id as key for React reconciliation', () => {
      const encounters = [
        createMockEncounter({ id: 'encounter-1' }),
        createMockEncounter({ id: 'encounter-2' }),
      ];
      
      render(<EncounterTable {...defaultProps} encounters={encounters} />);
      
      // Verify unique testids are used (which indicates proper keys)
      expect(screen.getByTestId('table-row-encounter-1')).toBeInTheDocument();
      expect(screen.getByTestId('table-row-encounter-2')).toBeInTheDocument();
    });

    it('should efficiently handle sort handler creation', () => {
      const { createSortHandler } = require('../table/tableUtils');
      
      render(<EncounterTable {...defaultProps} />);
      
      expect(createSortHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Table Structure', () => {
    it('should render proper HTML table structure', () => {
      const encounters = [createMockEncounter()];
      
      render(<EncounterTable {...defaultProps} encounters={encounters} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByTestId('table-header')).toBeInTheDocument();
      expect(screen.getAllByRole('rowgroup')).toHaveLength(2); // thead and tbody
    });

    it('should render TableHeader with correct props', () => {
      const encounters = [createMockEncounter()];
      const selection = createMockSelectionConfig({ isAllSelected: true });
      const sort = createMockSortConfig({ sortBy: 'difficulty', sortOrder: 'desc' });
      
      render(
        <EncounterTable 
          {...defaultProps} 
          encounters={encounters}
          selection={selection}
          sort={sort}
        />
      );
      
      expect(screen.getByTestId('select-all-checkbox')).toBeChecked();
      expect(screen.getByText('Difficulty (Sort: desc)')).toBeInTheDocument();
    });

    it('should render TableRow for each encounter with correct props', () => {
      const encounters = [createMockEncounter({ id: 'test', name: 'Test Name' })];
      const selection = createMockSelectionConfig({ selectedEncounters: ['test'] });
      
      render(
        <EncounterTable 
          {...defaultProps} 
          encounters={encounters}
          selection={selection}
        />
      );
      
      expect(screen.getByText('Mock Row: Test Name')).toBeInTheDocument();
      expect(screen.getByTestId('select-test')).toBeChecked();
    });
  });
});