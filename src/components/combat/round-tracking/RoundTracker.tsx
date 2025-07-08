'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { RoundHistory } from './RoundHistory';
import {
  RoundHeader,
  RoundControls,
  DurationDisplay,
  EffectsSection,
  TriggersSection,
  SessionSummary,
} from './TrackerComponents';
import {
  useRoundState,
  useDurationCalculations,
  useEffectProcessing,
  useTriggerProcessing,
  useScreenReaderAnnouncements,
  useRoundNavigation,
} from './tracker-hooks';
import { Effect, Trigger, SessionSummary as SessionSummaryType } from './round-utils';

interface TrackerMainProps {
  currentRound: number;
  roundState: any;
  duration: any;
  effectsByParticipant: any;
  dueTriggers: any[];
  upcomingTriggers: any[];
  combatPhase: string;
  isInOvertime: boolean;
  effects: Effect[];
  effectsError?: string;
  encounter: IEncounter;
  triggers: Trigger[];
  sessionSummary?: SessionSummaryType;
  showHistory: boolean;
  history: { round: number; events: string[] }[];
  isHistoryCollapsed: boolean;
  setIsHistoryCollapsed: (_collapsed: boolean) => void;
  announceRound: number | null;
  estimatedRoundDuration?: number;
  handleNextRound: () => void;
  handlePreviousRound: () => void;
  onExport?: () => void;
  onTriggerAction?: (_triggerId: string) => void;
}

function TrackerMain({
  currentRound,
  roundState,
  duration,
  effectsByParticipant,
  dueTriggers,
  upcomingTriggers,
  combatPhase,
  isInOvertime,
  effects,
  effectsError,
  encounter,
  triggers,
  sessionSummary,
  showHistory,
  history,
  isHistoryCollapsed,
  setIsHistoryCollapsed,
  announceRound,
  estimatedRoundDuration,
  handleNextRound,
  handlePreviousRound,
  onExport,
  onTriggerAction,
}: TrackerMainProps) {
  return (
    <div className="space-y-4">
      {/* Main Round Tracker Card */}
      <Card>
        <RoundHeader
          currentRound={currentRound}
          isEditingRound={roundState.isEditingRound}
          editRoundValue={roundState.editRoundValue}
          editError={roundState.editError}
          combatPhase={combatPhase}
          isInOvertime={isInOvertime}
          onEditRound={roundState.handleEditRound}
          onSaveRound={roundState.handleSaveRound}
          onCancelEdit={roundState.handleCancelEdit}
          onEditValueChange={roundState.setEditRoundValue}
          onExport={onExport}
        />

        <CardContent className="space-y-4">
          <RoundControls
            currentRound={currentRound}
            onNextRound={handleNextRound}
            onPreviousRound={handlePreviousRound}
          />

          <DurationDisplay
            duration={duration}
            estimatedRoundDuration={estimatedRoundDuration}
          />

          <div className="border-t my-4" />

          <EffectsSection
            effects={effects}
            effectsError={effectsError}
            encounter={encounter}
            currentRound={currentRound}
            effectsByParticipant={effectsByParticipant}
          />

          <TriggersSection
            dueTriggers={dueTriggers}
            upcomingTriggers={upcomingTriggers}
            triggers={triggers}
            currentRound={currentRound}
            duration={duration}
            onTriggerAction={onTriggerAction}
          />

          {sessionSummary && <SessionSummary summary={sessionSummary} />}
        </CardContent>
      </Card>

      {/* Round History */}
      {showHistory && (
        <RoundHistory
          history={history}
          isCollapsed={isHistoryCollapsed}
          onToggle={setIsHistoryCollapsed}
          searchable={true}
          exportable={!!onExport}
          onExport={onExport ? () => onExport() : undefined}
        />
      )}

      {/* Screen reader announcements */}
      {announceRound && (
        <div className="sr-only" aria-live="polite">
          <span>Round changed to {announceRound}</span>
        </div>
      )}
    </div>
  );
}

interface CombatData {
  encounter: IEncounter | null;
  effects?: Effect[];
  triggers?: Trigger[];
  history?: { round: number; events: string[] }[];
  sessionSummary?: SessionSummaryType;
  effectsError?: string;
}

interface CombatSettings {
  maxRounds?: number;
  estimatedRoundDuration?: number;
  showHistory?: boolean;
}

interface CombatHandlers {
  onRoundChange: (_newRound: number) => void;
  onEffectExpiry?: (_expiredEffectIds: string[]) => void;
  onTriggerAction?: (_triggerId: string) => void;
  onExport?: () => void;
}

interface RoundTrackerProps {
  data: CombatData;
  settings?: CombatSettings;
  handlers: CombatHandlers;
}

export function RoundTracker({
  data,
  settings = {},
  handlers,
}: RoundTrackerProps) {
  // Destructure data
  const {
    encounter,
    effects = [],
    triggers = [],
    history = [],
    sessionSummary,
    effectsError,
  } = data;

  // Destructure settings
  const {
    maxRounds,
    estimatedRoundDuration,
    showHistory = false,
  } = settings;

  // Destructure handlers
  const {
    onRoundChange,
    onEffectExpiry,
    onTriggerAction,
    onExport,
  } = handlers;
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);

  // Calculate current round with safety check
  const currentRound = Math.max(1, encounter?.combatState?.currentRound || 1);

  // Custom hooks for state management
  const roundState = useRoundState(currentRound, onRoundChange);
  const duration = useDurationCalculations(encounter, currentRound, maxRounds, estimatedRoundDuration);
  const { effectsByParticipant } = useEffectProcessing(effects, currentRound);
  const { dueTriggers, upcomingTriggers, combatPhase, isInOvertime } = useTriggerProcessing(
    triggers,
    currentRound,
    maxRounds
  );

  // Screen reader announcements and navigation
  const announceRound = useScreenReaderAnnouncements(currentRound);
  const { handleNextRound, handlePreviousRound } = useRoundNavigation(
    currentRound,
    effects,
    onRoundChange,
    onEffectExpiry
  );

  // Handle null encounter after all hooks
  if (!encounter) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No combat active</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TrackerMain
      currentRound={currentRound}
      roundState={roundState}
      duration={duration}
      effectsByParticipant={effectsByParticipant}
      dueTriggers={dueTriggers}
      upcomingTriggers={upcomingTriggers}
      combatPhase={combatPhase}
      isInOvertime={isInOvertime}
      effects={effects}
      effectsError={effectsError}
      encounter={encounter}
      triggers={triggers}
      sessionSummary={sessionSummary}
      showHistory={showHistory}
      history={history}
      isHistoryCollapsed={isHistoryCollapsed}
      setIsHistoryCollapsed={setIsHistoryCollapsed}
      announceRound={announceRound}
      estimatedRoundDuration={estimatedRoundDuration}
      handleNextRound={handleNextRound}
      handlePreviousRound={handlePreviousRound}
      onExport={onExport}
      onTriggerAction={onTriggerAction}
    />
  );
}