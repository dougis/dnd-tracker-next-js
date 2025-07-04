import { renderHook, act } from '@testing-library/react';
import { useEncounterFilters } from '../../hooks/useEncounterFilters';
import { createMockFilters } from '../test-helpers';
import {
  actWrapper,
  createFilterStateExpectations,
} from '../test-utils/commonTestHelpers';

// Simple helpers to eliminate duplication
const setup = () => renderHook(() => useEncounterFilters());
const updateFilters = (result: any, filters: any) => actWrapper(() => result.current.updateFilters(filters));
const updateSearch = (result: any, query: string) => actWrapper(() => result.current.updateSearchQuery(query));
const updateSort = (result: any, sortBy: any, sortOrder: any) => actWrapper(() => result.current.updateSort(sortBy, sortOrder));
const { expectInitialFilters, expectFiltersChanged } = createFilterStateExpectations();

describe('useEncounterFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('returns initial state values', () => {
      const { result } = setup();
      expectInitialFilters(result, createMockFilters());
    });
  });

  describe('Filter Management', () => {
    it('updates filters correctly', () => {
      const { result } = setup();

      updateFilters(result, {
        status: ['active', 'draft'],
        difficulty: ['hard'],
      });

      expectFiltersChanged(result, {
        status: ['active', 'draft'],
        difficulty: ['hard'],
      });
    });

    it('merges filter updates with existing filters', () => {
      const { result } = setup();

      updateFilters(result, { status: ['active'] });
      updateFilters(result, { difficulty: ['hard'] });

      expectFilters(result, {
        status: ['active'],
        difficulty: ['hard'],
      });
    });

    it('overwrites specific filter arrays when updating', () => {
      const { result } = setup();

      updateFilters(result, { status: ['active', 'draft'] });
      updateFilters(result, { status: ['completed'] });

      expect(result.current.filters.status).toEqual(['completed']);
    });
  });

  describe('Search Query Management', () => {
    it('updates search query correctly', () => {
      const { result } = setup();

      updateSearch(result, 'dragon encounter');

      expect(result.current.searchQuery).toBe('dragon encounter');
    });

    it('handles empty search query', () => {
      const { result } = setup();

      updateSearch(result, 'test');
      updateSearch(result, '');

      expect(result.current.searchQuery).toBe('');
    });
  });

  describe('Sort Management', () => {
    it('updates sort correctly', () => {
      const { result } = setup();

      updateSort(result, 'name', 'asc');

      expect(result.current.sortBy).toBe('name');
      expect(result.current.sortOrder).toBe('asc');
    });

    it('updates both sort field and order together', () => {
      const { result } = setup();

      updateSort(result, 'difficulty', 'desc');

      expect(result.current.sortBy).toBe('difficulty');
      expect(result.current.sortOrder).toBe('desc');
    });
  });

  describe('Clear Filters', () => {
    it('clears all filters and resets to initial state', () => {
      const { result } = setup();

      // Set some filters and search
      updateFilters(result, {
        status: ['active'],
        difficulty: ['hard'],
        tags: ['combat'],
      });
      updateSearch(result, 'test search');
      updateSort(result, 'name', 'asc');

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
      const { result } = setup();

      updateFilters(result, {
        targetLevelMin: 5,
        targetLevelMax: 10,
      });

      expect(result.current.filters.targetLevelMin).toBe(5);
      expect(result.current.filters.targetLevelMax).toBe(10);
    });

    it('handles tag filters', () => {
      const { result } = setup();

      updateFilters(result, {
        tags: ['combat', 'dungeon', 'outdoor'],
      });

      expect(result.current.filters.tags).toEqual(['combat', 'dungeon', 'outdoor']);
    });

    it('maintains filter state independence', () => {
      const { result } = setup();

      updateFilters(result, { status: ['active'] });
      updateSearch(result, 'test');
      updateSort(result, 'name', 'asc');

      // Update only filters, search and sort should remain unchanged
      updateFilters(result, { difficulty: ['hard'] });

      expect(result.current.filters.status).toEqual(['active']);
      expect(result.current.filters.difficulty).toEqual(['hard']);
      expect(result.current.searchQuery).toBe('test');
      expect(result.current.sortBy).toBe('name');
      expect(result.current.sortOrder).toBe('asc');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined values in filter updates', () => {
      const { result } = setup();

      updateFilters(result, {
        targetLevelMin: undefined,
        targetLevelMax: undefined,
      });

      expect(result.current.filters.targetLevelMin).toBeUndefined();
      expect(result.current.filters.targetLevelMax).toBeUndefined();
    });

    it('handles empty arrays in filter updates', () => {
      const { result } = setup();

      updateFilters(result, {
        status: [],
        difficulty: [],
        tags: [],
      });

      expect(result.current.filters.status).toEqual([]);
      expect(result.current.filters.difficulty).toEqual([]);
      expect(result.current.filters.tags).toEqual([]);
    });

    it('handles partial filter objects', () => {
      const { result } = setup();

      updateFilters(result, { status: ['active'] });

      expect(result.current.filters.status).toEqual(['active']);
      expect(result.current.filters.difficulty).toEqual([]);
      expect(result.current.filters.tags).toEqual([]);
    });
  });
});