import { useState } from 'react';

/**
 * Custom hook for managing combat start dialog state
 */
export function useCombatStart(onStartCombat: () => void) {
  const [showStartCombatDialog, setShowStartCombatDialog] = useState(false);

  const handleStartCombat = () => {
    setShowStartCombatDialog(true);
  };

  const confirmStartCombat = () => {
    onStartCombat();
    setShowStartCombatDialog(false);
  };

  const cancelStartCombat = () => {
    setShowStartCombatDialog(false);
  };

  return {
    showStartCombatDialog,
    handleStartCombat,
    confirmStartCombat,
    cancelStartCombat,
  };
}