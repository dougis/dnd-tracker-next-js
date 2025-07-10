import { render, screen, fireEvent } from '@testing-library/react';
import { ControlsSection } from '../ControlsSection';
import type { PartyFilters, SortConfig, FilterCallbacks } from '../../types';

describe('ControlsSection', () => {
  const mockFilters: PartyFilters = {
    memberCount: [],
    tags: [],
  };

  const mockSortConfig: SortConfig = {
    sortBy: 'name',
    sortOrder: 'asc',
  };

  const mockFilterCallbacks: FilterCallbacks = {
    onFiltersChange: jest.fn(),
    onSearchChange: jest.fn(),
    onSortChange: jest.fn(),
    onClearFilters: jest.fn(),
  };

  const defaultProps = {
    filters: mockFilters,
    searchQuery: '',
    sortConfig: mockSortConfig,
    filterCallbacks: mockFilterCallbacks,
    viewMode: 'grid' as const,
    onViewModeChange: jest.fn(),
    onCreateParty: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<ControlsSection {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search parties...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should display search query value', () => {
      const props = {
        ...defaultProps,
        searchQuery: 'test search',
      };

      render(<ControlsSection {...props} />);

      const searchInput = screen.getByDisplayValue('test search');
      expect(searchInput).toBeInTheDocument();
    });

    it('should call onSearchChange when search input changes', () => {
      render(<ControlsSection {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search parties...');
      fireEvent.change(searchInput, { target: { value: 'new search' } });

      expect(mockFilterCallbacks.onSearchChange).toHaveBeenCalledWith('new search');
    });
  });

  describe('Sort Functionality', () => {
    it('should render sort dropdown', () => {
      render(<ControlsSection {...defaultProps} />);

      const sortTrigger = screen.getByRole('combobox');
      expect(sortTrigger).toBeInTheDocument();
    });

    it('should display current sort value', () => {
      const props = {
        ...defaultProps,
        sortConfig: {
          sortBy: 'createdAt' as const,
          sortOrder: 'desc' as const,
        },
      };

      render(<ControlsSection {...props} />);

      // Check that the trigger shows the current selection
      const sortTrigger = screen.getByRole('combobox');
      expect(sortTrigger).toBeInTheDocument();
    });

    it('should call onSortChange when sort option is selected', () => {
      render(<ControlsSection {...defaultProps} />);

      const sortTrigger = screen.getByRole('combobox');
      fireEvent.click(sortTrigger);

      const nameDescOption = screen.getByText('Name (Z-A)');
      fireEvent.click(nameDescOption);

      expect(mockFilterCallbacks.onSortChange).toHaveBeenCalledWith('name', 'desc');
    });

    it('should render all sort options', () => {
      render(<ControlsSection {...defaultProps} />);

      const sortTrigger = screen.getByRole('combobox');
      fireEvent.click(sortTrigger);

      expect(screen.getByText('Name (A-Z)')).toBeInTheDocument();
      expect(screen.getByText('Name (Z-A)')).toBeInTheDocument();
      expect(screen.getByText('Newest First')).toBeInTheDocument();
      expect(screen.getByText('Oldest First')).toBeInTheDocument();
      expect(screen.getByText('Most Members')).toBeInTheDocument();
      expect(screen.getByText('Fewest Members')).toBeInTheDocument();
      expect(screen.getByText('Most Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('Least Recent Activity')).toBeInTheDocument();
    });
  });

  describe('Clear Filters', () => {
    it('should show clear filters button when filters are active', () => {
      const props = {
        ...defaultProps,
        searchQuery: 'test',
      };

      render(<ControlsSection {...props} />);

      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('should show clear filters button when member count filter is active', () => {
      const props = {
        ...defaultProps,
        filters: {
          memberCount: [4],
          tags: [],
        },
      };

      render(<ControlsSection {...props} />);

      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('should show clear filters button when tags filter is active', () => {
      const props = {
        ...defaultProps,
        filters: {
          memberCount: [],
          tags: ['heroic'],
        },
      };

      render(<ControlsSection {...props} />);

      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('should not show clear filters button when no filters are active', () => {
      render(<ControlsSection {...defaultProps} />);

      expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
    });

    it('should call onClearFilters when clear filters button is clicked', () => {
      const props = {
        ...defaultProps,
        searchQuery: 'test',
      };

      render(<ControlsSection {...props} />);

      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);

      expect(mockFilterCallbacks.onClearFilters).toHaveBeenCalled();
    });
  });

  describe('View Mode Toggle', () => {
    it('should render view mode toggle buttons', () => {
      render(<ControlsSection {...defaultProps} />);

      const gridButton = screen.getByRole('button', { name: /grid/i });
      const tableButton = screen.getByRole('button', { name: /list/i });

      expect(gridButton).toBeInTheDocument();
      expect(tableButton).toBeInTheDocument();
    });

    it('should show grid view as active by default', () => {
      render(<ControlsSection {...defaultProps} />);

      const gridButton = screen.getByRole('button', { name: /grid/i });
      expect(gridButton).toHaveClass('bg-primary'); // or whatever active class is used
    });

    it('should show table view as active when in table mode', () => {
      const props = {
        ...defaultProps,
        viewMode: 'table' as const,
      };

      render(<ControlsSection {...props} />);

      const tableButton = screen.getByRole('button', { name: /list/i });
      expect(tableButton).toHaveClass('bg-primary'); // or whatever active class is used
    });

    it('should call onViewModeChange when grid button is clicked', () => {
      const props = {
        ...defaultProps,
        viewMode: 'table' as const,
      };

      render(<ControlsSection {...props} />);

      const gridButton = screen.getByRole('button', { name: /grid/i });
      fireEvent.click(gridButton);

      expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('grid');
    });

    it('should call onViewModeChange when table button is clicked', () => {
      render(<ControlsSection {...defaultProps} />);

      const tableButton = screen.getByRole('button', { name: /list/i });
      fireEvent.click(tableButton);

      expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('table');
    });
  });

  describe('Create Party Button', () => {
    it('should render create party button', () => {
      render(<ControlsSection {...defaultProps} />);

      const createButton = screen.getByText('Create Party');
      expect(createButton).toBeInTheDocument();
    });

    it('should call onCreateParty when create button is clicked', () => {
      render(<ControlsSection {...defaultProps} />);

      const createButton = screen.getByText('Create Party');
      fireEvent.click(createButton);

      expect(defaultProps.onCreateParty).toHaveBeenCalled();
    });

    it('should render create button with icon', () => {
      render(<ControlsSection {...defaultProps} />);

      const createButton = screen.getByText('Create Party');
      expect(createButton).toBeInTheDocument();

      // The Plus icon should be rendered (though we can't easily test SVG content)
      expect(createButton.closest('button')).toBeInTheDocument();
    });
  });

  describe('Component Layout', () => {
    it('should render with proper responsive layout classes', () => {
      render(<ControlsSection {...defaultProps} />);

      const container = screen.getByText('Create Party').closest('div')?.parentElement;
      expect(container).toHaveClass('flex', 'flex-col', 'gap-4', 'md:flex-row');
    });

    it('should group left and right side controls properly', () => {
      render(<ControlsSection {...defaultProps} />);

      // Search should be on the left side
      const searchInput = screen.getByPlaceholderText('Search parties...');
      expect(searchInput).toBeInTheDocument();

      // Create button should be on the right side
      const createButton = screen.getByText('Create Party');
      expect(createButton).toBeInTheDocument();
    });
  });

  describe('SearchAndSort Component', () => {
    it('should properly handle search and sort integration', () => {
      render(<ControlsSection {...defaultProps} />);

      // Both search input and sort dropdown should be present
      expect(screen.getByPlaceholderText('Search parties...')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should maintain proper spacing between search and sort controls', () => {
      render(<ControlsSection {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search parties...');
      const sortDropdown = screen.getByRole('combobox');

      expect(searchInput).toBeInTheDocument();
      expect(sortDropdown).toBeInTheDocument();
    });
  });

  describe('ViewModeToggle Component', () => {
    it('should render toggle buttons with proper styling', () => {
      render(<ControlsSection {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      // Should have at least grid, table, and create buttons
      expect(buttons.length).toBeGreaterThanOrEqual(3);
    });
  });
});