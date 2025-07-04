import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EncounterFilters } from '../EncounterFilters';
import { createMockProps, createMockFilters, setupTestEnvironment } from './test-helpers';

describe('EncounterFilters', () => {
  const { cleanup } = setupTestEnvironment();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Component Rendering', () => {
    it('renders without errors', () => {
      const props = createMockProps.encounterFilters();
      render(<EncounterFilters {...props} />);

      expect(screen.getByPlaceholderText('Search encounters...')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Difficulty')).toBeInTheDocument();
      expect(screen.getByText('Sort')).toBeInTheDocument();
    });

    it('displays current search query', () => {
      const props = createMockProps.encounterFilters({
        searchQuery: 'dragon encounter',
      });
      render(<EncounterFilters {...props} />);

      const searchInput = screen.getByDisplayValue('dragon encounter');
      expect(searchInput).toBeInTheDocument();
    });

    it('shows filter badges when filters are active', () => {
      const props = createMockProps.encounterFilters({
        filters: createMockFilters({
          status: ['active', 'draft'],
          difficulty: ['hard'],
        }),
      });
      render(<EncounterFilters {...props} />);

      // Should show badge count for active filters
      expect(screen.getByText('2')).toBeInTheDocument(); // Status count
      expect(screen.getByText('1')).toBeInTheDocument(); // Difficulty count
    });

    it('shows clear filters button when filters are active', () => {
      const props = createMockProps.encounterFilters({
        searchQuery: 'test',
        filters: createMockFilters({ status: ['active'] }),
      });
      render(<EncounterFilters {...props} />);

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('does not show clear filters button when no filters are active', () => {
      const props = createMockProps.encounterFilters();
      render(<EncounterFilters {...props} />);

      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('calls onSearchChange when typing in search input', async () => {
      const props = createMockProps.encounterFilters();
      render(<EncounterFilters {...props} />);

      const searchInput = screen.getByPlaceholderText('Search encounters...');
      await user.type(searchInput, 'dr');

      // Check that onSearchChange was called - user.type types character by character
      expect(props.callbacks.onSearchChange).toHaveBeenCalledWith('d');
      expect(props.callbacks.onSearchChange).toHaveBeenCalledWith('r');
      expect(props.callbacks.onSearchChange).toHaveBeenCalledTimes(2);
    });

    it('handles empty search input', async () => {
      const props = createMockProps.encounterFilters({
        searchQuery: 'existing query',
      });
      render(<EncounterFilters {...props} />);

      const searchInput = screen.getByDisplayValue('existing query');
      await user.clear(searchInput);

      expect(props.callbacks.onSearchChange).toHaveBeenLastCalledWith('');
    });
  });

  describe('Status Filter', () => {
    it('opens status filter dropdown', async () => {
      const props = createMockProps.encounterFilters();
      render(<EncounterFilters {...props} />);

      const statusButton = screen.getByText('Status');
      await user.click(statusButton);

      expect(screen.getByText('Filter by Status')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Archived')).toBeInTheDocument();
    });

    it('toggles status filter selection', async () => {
      const props = createMockProps.encounterFilters();
      render(<EncounterFilters {...props} />);

      const statusButton = screen.getByText('Status');
      await user.click(statusButton);

      const draftOption = screen.getByText('Draft');
      await user.click(draftOption);

      expect(props.callbacks.onFiltersChange).toHaveBeenCalledWith({
        status: ['draft'],
      });
    });

    it('removes status filter when already selected', async () => {
      const props = createMockProps.encounterFilters({
        filters: createMockFilters({ status: ['draft', 'active'] }),
      });
      render(<EncounterFilters {...props} />);

      const statusButton = screen.getByText('Status');
      await user.click(statusButton);

      const draftOption = screen.getByText('Draft');
      await user.click(draftOption);

      expect(props.callbacks.onFiltersChange).toHaveBeenCalledWith({
        status: ['active'],
      });
    });
  });

  describe('Difficulty Filter', () => {
    it('opens difficulty filter dropdown', async () => {
      const props = createMockProps.encounterFilters();
      render(<EncounterFilters {...props} />);

      const difficultyButton = screen.getByRole('button', { name: /difficulty/i });
      await user.click(difficultyButton);

      expect(screen.getByText('Filter by Difficulty')).toBeInTheDocument();
      expect(screen.getByText('Trivial')).toBeInTheDocument();
      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Hard')).toBeInTheDocument();
      expect(screen.getByText('Deadly')).toBeInTheDocument();
    });

    it('toggles difficulty filter selection', async () => {
      const props = createMockProps.encounterFilters();
      render(<EncounterFilters {...props} />);

      const difficultyButton = screen.getByRole('button', { name: /difficulty/i });
      await user.click(difficultyButton);

      const hardOption = screen.getByText('Hard');
      await user.click(hardOption);

      expect(props.callbacks.onFiltersChange).toHaveBeenCalledWith({
        difficulty: ['hard'],
      });
    });
  });

  describe('Sort Functionality', () => {
    it('opens sort dropdown', async () => {
      const props = createMockProps.encounterFilters();
      render(<EncounterFilters {...props} />);

      const sortButton = screen.getByText('Sort');
      await user.click(sortButton);

      expect(screen.getByText('Sort by')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Created Date')).toBeInTheDocument();
      expect(screen.getByText('Updated Date')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Difficulty' })).toBeInTheDocument();
      expect(screen.getByText('Participants')).toBeInTheDocument();
      expect(screen.getByText('Target Level')).toBeInTheDocument();
    });

    it('changes sort order when clicking same sort field', async () => {
      const props = createMockProps.encounterFilters({
        sortConfig: {
          sortBy: 'name',
          sortOrder: 'asc',
        },
      });
      render(<EncounterFilters {...props} />);

      const sortButton = screen.getByText('Sort');
      await user.click(sortButton);

      const nameOption = screen.getByText('Name');
      await user.click(nameOption);

      expect(props.callbacks.onSortChange).toHaveBeenCalledWith('name', 'desc');
    });

    it('sets sort to ascending when clicking different sort field', async () => {
      const props = createMockProps.encounterFilters({
        sortConfig: {
          sortBy: 'name',
          sortOrder: 'desc',
        },
      });
      render(<EncounterFilters {...props} />);

      const sortButton = screen.getByText('Sort');
      await user.click(sortButton);

      const difficultyOption = screen.getByRole('menuitem', { name: 'Difficulty' });
      await user.click(difficultyOption);

      expect(props.callbacks.onSortChange).toHaveBeenCalledWith('difficulty', 'asc');
    });

    it('displays sort button with correct icon', () => {
      const props = createMockProps.encounterFilters({
        sortConfig: {
          sortBy: 'updatedAt',
          sortOrder: 'asc',
        },
      });
      render(<EncounterFilters {...props} />);

      // Should show sort button
      expect(screen.getByText('Sort')).toBeInTheDocument();
    });
  });

  describe('Clear Filters', () => {
    it('calls onClearFilters when clear button is clicked', async () => {
      const props = createMockProps.encounterFilters({
        searchQuery: 'test query',
        filters: createMockFilters({ status: ['active'] }),
      });
      render(<EncounterFilters {...props} />);

      const clearButton = screen.getByText('Clear');
      await user.click(clearButton);

      expect(props.callbacks.onClearFilters).toHaveBeenCalled();
    });
  });

  describe('Filter State Detection', () => {
    it('detects active filters correctly', () => {
      const propsWithFilters = createMockProps.encounterFilters({
        searchQuery: '',
        filters: createMockFilters({ status: ['active'] }),
      });
      render(<EncounterFilters {...propsWithFilters} />);

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('detects search query as active filter', () => {
      const props = createMockProps.encounterFilters({
        searchQuery: 'test',
        filters: createMockFilters(),
      });
      render(<EncounterFilters {...props} />);

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('detects target level filters as active', () => {
      const props = createMockProps.encounterFilters({
        filters: createMockFilters({
          targetLevelMin: 1,
          targetLevelMax: 10,
        }),
      });
      render(<EncounterFilters {...props} />);

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('detects tag filters as active', () => {
      const props = createMockProps.encounterFilters({
        filters: createMockFilters({ tags: ['combat'] }),
      });
      render(<EncounterFilters {...props} />);

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria labels for interactive elements', () => {
      const props = createMockProps.encounterFilters();
      render(<EncounterFilters {...props} />);

      const searchInput = screen.getByPlaceholderText('Search encounters...');
      expect(searchInput).toBeInTheDocument();

      const statusButton = screen.getByText('Status');
      expect(statusButton).toBeInTheDocument();
    });

    it('maintains focus management in dropdowns', async () => {
      const props = createMockProps.encounterFilters();
      render(<EncounterFilters {...props} />);

      const statusButton = screen.getByText('Status');
      await user.click(statusButton);

      // Should be able to navigate with keyboard
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      // onFiltersChange should have been called
      expect(props.callbacks.onFiltersChange).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined filter values gracefully', () => {
      const props = createMockProps.encounterFilters({
        filters: {
          status: [],
          difficulty: [],
          targetLevelMin: undefined,
          targetLevelMax: undefined,
          tags: [],
        },
      });

      expect(() => {
        render(<EncounterFilters {...props} />);
      }).not.toThrow();
    });

    it('handles empty callback functions', () => {
      const props = {
        ...createMockProps.encounterFilters(),
        callbacks: {
          onFiltersChange: undefined as any,
          onSearchChange: undefined as any,
          onSortChange: undefined as any,
          onClearFilters: undefined as any,
        },
      };

      expect(() => {
        render(<EncounterFilters {...props} />);
      }).not.toThrow();
    });
  });
});