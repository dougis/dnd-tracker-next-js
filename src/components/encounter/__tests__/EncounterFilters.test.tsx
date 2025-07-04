import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EncounterFilters } from '../EncounterFilters';
import { createMockProps, createMockFilters, setupTestEnvironment } from './test-helpers';
import {
  setupComponentTest,
  expectElementToBeInDocument,
  expectElementNotToBeInDocument,
  expectPlaceholderToBeInDocument,
  expectDisplayValueToBeInDocument,
  expectFilterBadge,
  expectClearButton,
  expectNoClearButton,
  testBasicRendering,
  testConditionalRendering,
  testFilterDropdown,
  testFilterSelection,
  testSearchInput,
  testSearchClear,
  openDropdown,
  openDropdownByRole,
  selectDropdownOption,
} from './test-utils/componentTestHelpers';

describe('EncounterFilters', () => {
  const { cleanup } = setupTestEnvironment();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    jest.clearAllMocks();
    const setup = setupComponentTest();
    user = setup.user;
  });

  afterEach(() => {
    cleanup();
  });

  describe('Component Rendering', () => {
    it('renders without errors', () => {
      testBasicRendering(EncounterFilters, [
        'Status',
        'Difficulty', 
        'Sort'
      ]);
      expectPlaceholderToBeInDocument('Search encounters...');
    });

    it('displays current search query', () => {
      testConditionalRendering(
        EncounterFilters,
        { searchQuery: 'dragon encounter' },
        { elements: [], condition: 'displays search value' }
      );
      expectDisplayValueToBeInDocument('dragon encounter');
    });

    it('shows filter badges when filters are active', () => {
      testConditionalRendering(
        EncounterFilters,
        {
          filters: createMockFilters({
            status: ['active', 'draft'],
            difficulty: ['hard'],
          }),
        },
        { elements: ['2', '1'], condition: 'shows badge counts' }
      );
    });

    it('shows clear filters button when filters are active', () => {
      testConditionalRendering(
        EncounterFilters,
        {
          searchQuery: 'test',
          filters: createMockFilters({ status: ['active'] }),
        },
        { elements: ['Clear'], condition: 'shows clear button' }
      );
    });

    it('does not show clear filters button when no filters are active', () => {
      testConditionalRendering(
        EncounterFilters,
        {},
        { elements: [], condition: 'no filters active' },
        { elements: ['Clear'], condition: 'should not show clear' }
      );
    });
  });

  describe('Search Functionality', () => {
    it('calls onSearchChange when typing in search input', async () => {
      await testSearchInput(EncounterFilters, user, 'Search encounters...', 'dr');
    });

    it('handles empty search input', async () => {
      await testSearchClear(EncounterFilters, user, 'existing query');
    });
  });

  describe('Status Filter', () => {
    it('opens status filter dropdown', async () => {
      await testFilterDropdown(
        EncounterFilters,
        user,
        'Status',
        ['Draft', 'Active', 'Completed', 'Archived'],
        'Filter by Status'
      );
    });

    it('toggles status filter selection', async () => {
      await testFilterSelection(
        EncounterFilters,
        user,
        'Status',
        'Draft',
        { status: ['draft'] }
      );
    });

    it('removes status filter when already selected', async () => {
      const mockProps = createMockProps.encounterFilters({
        filters: createMockFilters({ status: ['draft', 'active'] }),
      });
      
      await testFilterSelection(
        EncounterFilters,
        user,
        'Status',
        'Draft',
        { status: ['active'] },
        mockProps
      );
    });
  });

  describe('Difficulty Filter', () => {
    it('opens difficulty filter dropdown', async () => {
      const props = createMockProps.encounterFilters();
      render(<EncounterFilters {...props} />);

      await openDropdownByRole(user, /difficulty/i);

      expectElementToBeInDocument('Filter by Difficulty');
      ['Trivial', 'Easy', 'Medium', 'Hard', 'Deadly'].forEach(difficulty => {
        expectElementToBeInDocument(difficulty);
      });
    });

    it('toggles difficulty filter selection', async () => {
      const props = createMockProps.encounterFilters();
      render(<EncounterFilters {...props} />);

      await openDropdownByRole(user, /difficulty/i);
      await selectDropdownOption(user, 'Hard');

      expect(props.callbacks.onFiltersChange).toHaveBeenCalledWith({
        difficulty: ['hard'],
      });
    });
  });

  describe('Sort Functionality', () => {
    it('opens sort dropdown', async () => {
      await testFilterDropdown(
        EncounterFilters,
        user,
        'Sort',
        ['Name', 'Created Date', 'Updated Date', 'Participants', 'Target Level'],
        'Sort by'
      );
      expect(screen.getByRole('menuitem', { name: 'Difficulty' })).toBeInTheDocument();
    });

    it('changes sort order when clicking same sort field', async () => {
      const props = createMockProps.encounterFilters({
        sortConfig: {
          sortBy: 'name',
          sortOrder: 'asc',
        },
      });
      render(<EncounterFilters {...props} />);

      await openDropdown(user, 'Sort');
      await selectDropdownOption(user, 'Name');

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

      await openDropdown(user, 'Sort');
      
      const difficultyOption = screen.getByRole('menuitem', { name: 'Difficulty' });
      await user.click(difficultyOption);

      expect(props.callbacks.onSortChange).toHaveBeenCalledWith('difficulty', 'asc');
    });

    it('displays sort button with correct icon', () => {
      testBasicRendering(EncounterFilters, ['Sort']);
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
      testConditionalRendering(
        EncounterFilters,
        {
          searchQuery: '',
          filters: createMockFilters({ status: ['active'] }),
        },
        { elements: ['Clear'], condition: 'shows clear for active filters' }
      );
    });

    it('detects search query as active filter', () => {
      testConditionalRendering(
        EncounterFilters,
        {
          searchQuery: 'test',
          filters: createMockFilters(),
        },
        { elements: ['Clear'], condition: 'shows clear for search query' }
      );
    });

    it('detects target level filters as active', () => {
      testConditionalRendering(
        EncounterFilters,
        {
          filters: createMockFilters({
            targetLevelMin: 1,
            targetLevelMax: 10,
          }),
        },
        { elements: ['Clear'], condition: 'shows clear for target level filters' }
      );
    });

    it('detects tag filters as active', () => {
      testConditionalRendering(
        EncounterFilters,
        {
          filters: createMockFilters({ tags: ['combat'] }),
        },
        { elements: ['Clear'], condition: 'shows clear for tag filters' }
      );
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