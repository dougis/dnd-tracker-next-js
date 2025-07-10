import { renderHook, act } from '@testing-library/react';
import { usePartyFilters } from '../usePartyFilters';

describe('usePartyFilters', () => {
  it('should initialize with default filter values', () => {
    const { result } = renderHook(() => usePartyFilters());

    expect(result.current.filters).toEqual({
      memberCount: [],
      tags: [],
    });
    expect(result.current.searchQuery).toBe('');
    expect(result.current.sortBy).toBe('name');
    expect(result.current.sortOrder).toBe('asc');
  });

  it('should update search query', () => {
    const { result } = renderHook(() => usePartyFilters());

    act(() => {
      result.current.updateSearchQuery('test search');
    });

    expect(result.current.searchQuery).toBe('test search');
  });

  it('should update sort configuration', () => {
    const { result } = renderHook(() => usePartyFilters());

    act(() => {
      result.current.updateSort('createdAt', 'desc');
    });

    expect(result.current.sortBy).toBe('createdAt');
    expect(result.current.sortOrder).toBe('desc');
  });

  it('should update filters', () => {
    const { result } = renderHook(() => usePartyFilters());

    const newFilters = {
      memberCount: [4, 6],
      tags: ['heroic', 'balanced'],
    };

    act(() => {
      result.current.updateFilters(newFilters);
    });

    expect(result.current.filters).toEqual(newFilters);
  });

  it('should update partial filters', () => {
    const { result } = renderHook(() => usePartyFilters());

    act(() => {
      result.current.updateFilters({ memberCount: [4] });
    });

    expect(result.current.filters).toEqual({
      memberCount: [4],
      tags: [],
    });

    act(() => {
      result.current.updateFilters({ tags: ['heroic'] });
    });

    expect(result.current.filters).toEqual({
      memberCount: [4],
      tags: ['heroic'],
    });
  });

  it('should clear all filters and search', () => {
    const { result } = renderHook(() => usePartyFilters());

    // Set some initial values
    act(() => {
      result.current.updateSearchQuery('test');
      result.current.updateFilters({
        memberCount: [4],
        tags: ['heroic'],
      });
      result.current.updateSort('createdAt', 'desc');
    });

    // Clear filters
    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.filters).toEqual({
      memberCount: [],
      tags: [],
    });
    expect(result.current.sortBy).toBe('name');
    expect(result.current.sortOrder).toBe('asc');
  });
});