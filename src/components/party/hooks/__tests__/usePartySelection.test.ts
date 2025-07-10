import { renderHook, act } from '@testing-library/react';
import { usePartySelection } from '../usePartySelection';

describe('usePartySelection', () => {
  const mockParties = [
    { id: 'party-1', name: 'Party 1' },
    { id: 'party-2', name: 'Party 2' },
    { id: 'party-3', name: 'Party 3' },
  ] as any[];

  it('should initialize with no selected parties', () => {
    const { result } = renderHook(() => usePartySelection(mockParties));

    expect(result.current.selectedParties).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.hasSelection).toBe(false);
  });

  it('should select a single party', () => {
    const { result } = renderHook(() => usePartySelection(mockParties));

    act(() => {
      result.current.selectParty('party-1');
    });

    expect(result.current.selectedParties).toEqual(['party-1']);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.hasSelection).toBe(true);
  });

  it('should deselect a selected party', () => {
    const { result } = renderHook(() => usePartySelection(mockParties));

    act(() => {
      result.current.selectParty('party-1');
      result.current.selectParty('party-1');
    });

    expect(result.current.selectedParties).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.hasSelection).toBe(false);
  });

  it('should select all parties', () => {
    const { result } = renderHook(() => usePartySelection(mockParties));

    act(() => {
      result.current.selectAll();
    });

    expect(result.current.selectedParties).toEqual(['party-1', 'party-2', 'party-3']);
    expect(result.current.isAllSelected).toBe(true);
    expect(result.current.hasSelection).toBe(true);
  });

  it('should clear all selections', () => {
    const { result } = renderHook(() => usePartySelection(mockParties));

    act(() => {
      result.current.selectAll();
      result.current.clearSelection();
    });

    expect(result.current.selectedParties).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.hasSelection).toBe(false);
  });

  it('should handle select all when some are selected', () => {
    const { result } = renderHook(() => usePartySelection(mockParties));

    act(() => {
      result.current.selectParty('party-1');
      result.current.selectAll();
    });

    expect(result.current.selectedParties).toEqual(['party-1', 'party-2', 'party-3']);
    expect(result.current.isAllSelected).toBe(true);
    expect(result.current.hasSelection).toBe(true);
  });

  it('should correctly calculate isAllSelected when all parties are selected individually', () => {
    const { result } = renderHook(() => usePartySelection(mockParties));

    act(() => {
      result.current.selectParty('party-1');
      result.current.selectParty('party-2');
      result.current.selectParty('party-3');
    });

    expect(result.current.selectedParties).toEqual(['party-1', 'party-2', 'party-3']);
    expect(result.current.isAllSelected).toBe(true);
    expect(result.current.hasSelection).toBe(true);
  });

  it('should handle empty parties list', () => {
    const { result } = renderHook(() => usePartySelection([]));

    expect(result.current.selectedParties).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.hasSelection).toBe(false);

    act(() => {
      result.current.selectAll();
    });

    expect(result.current.selectedParties).toEqual([]);
  });
});