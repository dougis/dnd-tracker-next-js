import { renderHook, act } from '@testing-library/react';
import { useEncounterSelection } from '../../hooks/useEncounterSelection';
import type { EncounterListItem } from '../../types';

export const createSelectionTestUtils = (encounters: EncounterListItem[]) => {
  const renderSelection = () => renderHook(() => useEncounterSelection(encounters));

  const expectInitialState = (result: any) => {
    expect(result.current.selectedEncounters).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.hasSelection).toBe(false);
  };

  const selectEncounter = (result: any, encounterId: string) => {
    act(() => {
      result.current.selectEncounter(encounterId);
    });
  };

  const selectAll = (result: any) => {
    act(() => {
      result.current.selectAll();
    });
  };

  const clearSelection = (result: any) => {
    act(() => {
      result.current.clearSelection();
    });
  };

  const expectSingleSelection = (result: any, encounterId: string) => {
    expect(result.current.selectedEncounters).toEqual([encounterId]);
    expect(result.current.hasSelection).toBe(true);
    expect(result.current.isAllSelected).toBe(false);
  };

  const expectAllSelected = (result: any) => {
    expect(result.current.selectedEncounters).toEqual(encounters.map(e => e.id));
    expect(result.current.hasSelection).toBe(true);
    expect(result.current.isAllSelected).toBe(true);
  };

  const expectNoSelection = (result: any) => {
    expect(result.current.selectedEncounters).toEqual([]);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.isAllSelected).toBe(false);
  };

  const expectMultipleSelection = (result: any, encounterIds: string[]) => {
    expect(result.current.selectedEncounters).toEqual(encounterIds);
    expect(result.current.hasSelection).toBe(true);
    expect(result.current.isAllSelected).toBe(false);
  };

  const selectMultiple = (result: any, encounterIds: string[]) => {
    encounterIds.forEach(id => selectEncounter(result, id));
  };

  return {
    renderSelection,
    expectInitialState,
    selectEncounter,
    selectAll,
    clearSelection,
    expectSingleSelection,
    expectAllSelected,
    expectNoSelection,
    expectMultipleSelection,
    selectMultiple,
  };
};