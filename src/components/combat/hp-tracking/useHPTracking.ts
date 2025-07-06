import { useState, useEffect, useCallback } from 'react';
import { IParticipantReference } from '@/lib/models/encounter/interfaces';
import { HPValues } from './hp-validation-utils';

export type HPStatus = 'healthy' | 'injured' | 'critical' | 'unconscious';

export interface UseHPTrackingReturn {
  currentHP: number;
  maxHP: number;
  tempHP: number;
  effectiveHP: number;
  hpStatus: HPStatus;
  isAlive: boolean;
  applyDamage: (_damage: number) => void;
  applyHealing: (_healing: number) => void;
  setTemporaryHP: (_tempHP: number) => void;
  setCurrentHP: (_currentHP: number) => void;
  setMaxHP: (_maxHP: number) => void;
}

export function useHPTracking(
  participant: IParticipantReference,
  onUpdate: (_values: HPValues) => void
): UseHPTrackingReturn {
  const [currentHP, setCurrentHPState] = useState(participant.currentHitPoints);
  const [maxHP, setMaxHPState] = useState(participant.maxHitPoints);
  const [tempHP, setTempHPState] = useState(participant.temporaryHitPoints);

  // Reset state when participant changes
  useEffect(() => {
    setCurrentHPState(participant.currentHitPoints);
    setMaxHPState(participant.maxHitPoints);
    setTempHPState(participant.temporaryHitPoints);
  }, [participant.characterId, participant.currentHitPoints, participant.maxHitPoints, participant.temporaryHitPoints]);

  // Calculate effective HP (current + temporary)
  const effectiveHP = currentHP + tempHP;

  // Calculate HP status
  const hpStatus: HPStatus = (() => {
    if (currentHP <= 0) return 'unconscious';
    const percentage = (currentHP / maxHP) * 100;
    if (percentage <= 25) return 'critical';
    if (percentage < 100) return 'injured';
    return 'healthy';
  })();

  // Check if character is alive
  const isAlive = currentHP > 0;

  // Notify parent of changes
  const notifyUpdate = useCallback((newCurrentHP: number, newMaxHP: number, newTempHP: number) => {
    onUpdate({
      currentHitPoints: newCurrentHP,
      maxHitPoints: newMaxHP,
      temporaryHitPoints: newTempHP,
    });
  }, [onUpdate]);

  const applyDamage = useCallback((damage: number) => {
    if (damage < 0) return;

    let remainingDamage = damage;
    let newTempHP = tempHP;
    let newCurrentHP = currentHP;

    // Apply damage to temporary HP first
    if (newTempHP > 0) {
      const tempDamage = Math.min(remainingDamage, newTempHP);
      newTempHP -= tempDamage;
      remainingDamage -= tempDamage;
    }

    // Apply remaining damage to current HP
    if (remainingDamage > 0) {
      newCurrentHP = Math.max(0, newCurrentHP - remainingDamage);
    }

    setCurrentHPState(newCurrentHP);
    setTempHPState(newTempHP);
    notifyUpdate(newCurrentHP, maxHP, newTempHP);
  }, [currentHP, tempHP, maxHP, notifyUpdate]);

  const applyHealing = useCallback((healing: number) => {
    if (healing < 0) return;

    const newCurrentHP = Math.min(maxHP, currentHP + healing);
    setCurrentHPState(newCurrentHP);
    notifyUpdate(newCurrentHP, maxHP, tempHP);
  }, [currentHP, maxHP, tempHP, notifyUpdate]);

  const setTemporaryHP = useCallback((newTempHP: number) => {
    if (newTempHP < 0) return;

    // Temporary HP doesn't stack - take the higher value
    const finalTempHP = Math.max(tempHP, newTempHP);
    setTempHPState(finalTempHP);
    notifyUpdate(currentHP, maxHP, finalTempHP);
  }, [currentHP, maxHP, tempHP, notifyUpdate]);

  const setCurrentHP = useCallback((newCurrentHP: number) => {
    const clampedHP = Math.max(0, Math.min(maxHP, newCurrentHP));
    setCurrentHPState(clampedHP);
    notifyUpdate(clampedHP, maxHP, tempHP);
  }, [maxHP, tempHP, notifyUpdate]);

  const setMaxHP = useCallback((newMaxHP: number) => {
    if (newMaxHP < 1) return;

    const adjustedCurrentHP = Math.min(currentHP, newMaxHP);
    setMaxHPState(newMaxHP);
    setCurrentHPState(adjustedCurrentHP);
    notifyUpdate(adjustedCurrentHP, newMaxHP, tempHP);
  }, [currentHP, tempHP, notifyUpdate]);

  return {
    currentHP,
    maxHP,
    tempHP,
    effectiveHP,
    hpStatus,
    isAlive,
    applyDamage,
    applyHealing,
    setTemporaryHP,
    setCurrentHP,
    setMaxHP,
  };
}