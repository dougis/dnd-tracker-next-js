import { renderHook, act } from '@testing-library/react';
import { useEncounterFilters } from '../../hooks/useEncounterFilters';
import { createMockFilters } from '../test-helpers';

describe('useEncounterFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('returns initial state values', () => {
      const { result } = renderHook(() => useEncounterFilters());

      expect(result.current.filters).toEqual(createMockFilters());
      expect(result.current.searchQuery).toBe('');
      expect(result.current.sortBy).toBe('updatedAt');
      expect(result.current.sortOrder).toBe('desc');
    });
  });

  describe('Filter Management', () => {
    it('updates filters correctly', () => {
      const { result } = renderHook(() => useEncounterFilters());

      act(() => {
        result.current.updateFilters({
          status: ['active', 'draft'],
          difficulty: ['hard'],
        });
      });

      expect(result.current.filters.status).toEqual(['active', 'draft']);
      expect(result.current.filters.difficulty).toEqual(['hard']);
    });

    it('merges filter updates with existing filters', () => {
      const { result } = renderHook(() => useEncounterFilters());

      act(() => {
        result.current.updateFilters({ status: ['active'] });
      });

      act(() => {
        result.current.updateFilters({ difficulty: ['hard'] });
      });

      expect(result.current.filters.status).toEqual(['active']);
      expect(result.current.filters.difficulty).toEqual(['hard']);
    });

    it('overwrites specific filter arrays when updating', () => {
      const { result } = renderHook(() => useEncounterFilters());

      act(() => {
        result.current.updateFilters({ status: ['active', 'draft'] });
      });

      act(() => {
        result.current.updateFilters({ status: ['completed'] });
      });

      expect(result.current.filters.status).toEqual(['completed']);
    });
  });

  describe('Search Query Management', () => {
    it('updates search query correctly', () => {
      const { result } = renderHook(() => useEncounterFilters());

      act(() => {
        result.current.updateSearchQuery('dragon encounter');
      });

      expect(result.current.searchQuery).toBe('dragon encounter');
    });

    it('handles empty search query', () => {
      const { result } = renderHook(() => useEncounterFilters());

      act(() => {
        result.current.updateSearchQuery('test');
      });

      act(() => {
        result.current.updateSearchQuery('');
      });

      expect(result.current.searchQuery).toBe('');
    });
  });

  describe('Sort Management', () => {
    it('updates sort correctly', () => {
      const { result } = renderHook(() => useEncounterFilters());

      act(() => {
        result.current.updateSort('name', 'asc');
      });

      expect(result.current.sortBy).toBe('name');
      expect(result.current.sortOrder).toBe('asc');
    });

    it('updates both sort field and order together', () => {
      const { result } = renderHook(() => useEncounterFilters());

      act(() => {
        result.current.updateSort('difficulty', 'desc');
      });

      expect(result.current.sortBy).toBe('difficulty');
      expect(result.current.sortOrder).toBe('desc');
    });
  });

  describe('Clear Filters', () => {
    it('clears all filters and resets to initial state', () => {
      const { result } = renderHook(() => useEncounterFilters());

      // Set some filters and search
      act(() => {
        result.current.updateFilters({
          status: ['active'],
          difficulty: ['hard'],
          tags: ['combat'],
        });
        result.current.updateSearchQuery('test search');
        result.current.updateSort('name', 'asc');
      });

      // Verify filters are set
      expect(result.current.filters.status).toEqual(['active']);
      expect(result.current.searchQuery).toBe('test search');
      expect(result.current.sortBy).toBe('name');

      // Clear filters
      act(() => {
        result.current.clearFilters();
      });

      // Verify reset to initial state
      expect(result.current.filters).toEqual(createMockFilters());
      expect(result.current.searchQuery).toBe('');
      expect(result.current.sortBy).toBe('updatedAt');
      expect(result.current.sortOrder).toBe('desc');
    });
  });

  describe('Complex Filter Scenarios', () => {
    it('handles target level range filters', () => {
      const { result } = renderHook(() => useEncounterFilters());

      act(() => {
        result.current.updateFilters({
          targetLevelMin: 5,
          targetLevelMax: 10,
        });
      });

      expect(result.current.filters.targetLevelMin).toBe(5);
      expect(result.current.filters.targetLevelMax).toBe(10);
    });

    it('handles tag filters', () => {
      const { result } = renderHook(() => useEncounterFilters());

      act(() => {
        result.current.updateFilters({
          tags: ['combat', 'dungeon', 'outdoor'],
        });
      });

      expect(result.current.filters.tags).toEqual(['combat', 'dungeon', 'outdoor']);
    });

    it('maintains filter state independence', () => {
      const { result } = renderHook(() => useEncounterFilters());

      act(() => {
        result.current.updateFilters({ status: ['active'] });
        result.current.updateSearchQuery('test');
        result.current.updateSort('name', 'asc');
      });

      // Update only filters, search and sort should remain unchanged
      act(() => {
        result.current.updateFilters({ difficulty: ['hard'] });
      });

      expect(result.current.filters.status).toEqual(['active']);
      expect(result.current.filters.difficulty).toEqual(['hard']);
      expect(result.current.searchQuery).toBe('test');
      expect(result.current.sortBy).toBe('name');
      expect(result.current.sortOrder).toBe('asc');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined values in filter updates', () => {
      const { result } = renderHook(() => useEncounterFilters());

      act(() => {
        result.current.updateFilters({
          targetLevelMin: undefined,
          targetLevelMax: undefined,
        });
      });

      expect(result.current.filters.targetLevelMin).toBeUndefined();
      expect(result.current.filters.targetLevelMax).toBeUndefined();
    });

    it('handles empty arrays in filter updates', () => {
      const { result } = renderHook(() => useEncounterFilters());

      act(() => {
        result.current.updateFilters({
          status: [],
          difficulty: [],
          tags: [],
        });
      });

      expect(result.current.filters.status).toEqual([]);
      expect(result.current.filters.difficulty).toEqual([]);
      expect(result.current.filters.tags).toEqual([]);
    });

    it('handles partial filter objects', () => {
      const { result } = renderHook(() => useEncounterFilters());

      act(() => {
        result.current.updateFilters({ status: ['active'] });
      });

      expect(result.current.filters.status).toEqual(['active']);
      expect(result.current.filters.difficulty).toEqual([]);
      expect(result.current.filters.tags).toEqual([]);
    });
  });
});