import { renderHook, act } from '@testing-library/react';
import { useHPTracking } from '../useHPTracking';
import { setupHPTrackingTest, createTestHPParticipant } from './test-helpers';

describe('useHPTracking', () => {
  const { mocks } = setupHPTrackingTest();
  const mockParticipant = createTestHPParticipant();

  it('initializes with correct HP values', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    expect(result.current.currentHP).toBe(75);
    expect(result.current.maxHP).toBe(100);
    expect(result.current.tempHP).toBe(5);
    expect(result.current.effectiveHP).toBe(80);
  });

  it('applies damage correctly', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.applyDamage(10);
    });

    expect(result.current.currentHP).toBe(70);
    expect(result.current.tempHP).toBe(0);
    expect(result.current.effectiveHP).toBe(70);
  });

  it('applies damage to temporary HP first', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.applyDamage(3);
    });

    expect(result.current.currentHP).toBe(75);
    expect(result.current.tempHP).toBe(2);
    expect(result.current.effectiveHP).toBe(77);
  });

  it('applies damage to current HP after temporary HP is depleted', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.applyDamage(10);
    });

    expect(result.current.currentHP).toBe(70);
    expect(result.current.tempHP).toBe(0);
    expect(result.current.effectiveHP).toBe(70);
  });

  it('prevents current HP from going below 0', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.applyDamage(200);
    });

    expect(result.current.currentHP).toBe(0);
    expect(result.current.tempHP).toBe(0);
    expect(result.current.effectiveHP).toBe(0);
  });

  it('applies healing correctly', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.applyHealing(15);
    });

    expect(result.current.currentHP).toBe(90);
    expect(result.current.tempHP).toBe(5);
    expect(result.current.effectiveHP).toBe(95);
  });

  it('prevents healing above maximum HP', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.applyHealing(50);
    });

    expect(result.current.currentHP).toBe(100);
    expect(result.current.tempHP).toBe(5);
    expect(result.current.effectiveHP).toBe(105);
  });

  it('sets temporary HP correctly', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.setTemporaryHP(15);
    });

    expect(result.current.tempHP).toBe(15);
    expect(result.current.effectiveHP).toBe(90);
  });

  it('replaces temporary HP with higher value', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.setTemporaryHP(10);
    });

    expect(result.current.tempHP).toBe(10);
  });

  it('keeps existing temporary HP when new value is lower', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.setTemporaryHP(3);
    });

    expect(result.current.tempHP).toBe(5);
  });

  it('sets maximum HP correctly', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.setMaxHP(120);
    });

    expect(result.current.maxHP).toBe(120);
  });

  it('adjusts current HP when max HP is reduced below current', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.setMaxHP(50);
    });

    expect(result.current.maxHP).toBe(50);
    expect(result.current.currentHP).toBe(50);
  });

  it('sets current HP directly', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.setCurrentHP(60);
    });

    expect(result.current.currentHP).toBe(60);
  });

  it('prevents setting current HP below 0', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.setCurrentHP(-10);
    });

    expect(result.current.currentHP).toBe(0);
  });

  it('prevents setting current HP above maximum', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.setCurrentHP(150);
    });

    expect(result.current.currentHP).toBe(100);
  });

  it('calculates HP status correctly', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    expect(result.current.hpStatus).toBe('injured');

    act(() => {
      result.current.setCurrentHP(100);
    });

    expect(result.current.hpStatus).toBe('healthy');

    act(() => {
      result.current.setCurrentHP(20);
    });

    expect(result.current.hpStatus).toBe('critical');

    act(() => {
      result.current.setCurrentHP(0);
    });

    expect(result.current.hpStatus).toBe('unconscious');
  });

  it('determines if character is alive correctly', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    expect(result.current.isAlive).toBe(true);

    act(() => {
      result.current.setCurrentHP(0);
    });

    expect(result.current.isAlive).toBe(false);
  });

  it('calls onUpdate when HP changes', () => {
    const { result } = renderHook(() =>
      useHPTracking(mockParticipant, mocks.onUpdate)
    );

    act(() => {
      result.current.applyDamage(10);
    });

    expect(mocks.onUpdate).toHaveBeenCalledWith({
      currentHitPoints: 70,
      maxHitPoints: 100,
      temporaryHitPoints: 0,
    });
  });

  it('resets HP values when participant changes', () => {
    const { result, rerender } = renderHook(
      ({ participant }) => useHPTracking(participant, mocks.onUpdate),
      { initialProps: { participant: mockParticipant } }
    );

    act(() => {
      result.current.applyDamage(10);
    });

    expect(result.current.currentHP).toBe(70);

    const newParticipant = createTestHPParticipant({
      name: 'New Character',
      maxHitPoints: 80,
      currentHitPoints: 60,
      temporaryHitPoints: 10,
    });

    rerender({ participant: newParticipant });

    expect(result.current.currentHP).toBe(60);
    expect(result.current.maxHP).toBe(80);
    expect(result.current.tempHP).toBe(10);
  });
});