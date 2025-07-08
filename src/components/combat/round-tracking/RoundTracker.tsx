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

function TrackerCard({
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
  estimatedRoundDuration,
  handleNextRound,
  handlePreviousRound,
  onExport,
  onTriggerAction,
}: Omit<TrackerMainProps, 'showHistory' | 'history' | 'isHistoryCollapsed' | 'setIsHistoryCollapsed' | 'announceRound'>) {
  return (
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
  );
}

function TrackerMain(props: TrackerMainProps) {
  const { showHistory, history, isHistoryCollapsed, setIsHistoryCollapsed, announceRound, onExport } = props;

  return (
    <div className="space-y-4">
      <TrackerCard {...props} />

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

function useTrackerProps(data: CombatData, settings: CombatSettings, handlers: CombatHandlers) {
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

  return {
    encounter,
    effects,
    triggers,
    history,
    sessionSummary,
    effectsError,
    maxRounds,
    estimatedRoundDuration,
    showHistory,
    onRoundChange,
    onEffectExpiry,
    onTriggerAction,
    onExport,
    isHistoryCollapsed,
    setIsHistoryCollapsed,
  };
}

function useRoundCalculations(encounter: IEncounter | null, effects: Effect[], triggers: Trigger[], onRoundChange: (_round: number) => void, onEffectExpiry?: (_expiredEffectIds: string[]) => void, maxRounds?: number, estimatedRoundDuration?: number) {
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

  return {
    currentRound,
    roundState,
    duration,
    effectsByParticipant,
    dueTriggers,
    upcomingTriggers,
    combatPhase,
    isInOvertime,
    announceRound,
    handleNextRound,
    handlePreviousRound,
  };
}

function useRoundTrackerData(data: CombatData, settings: CombatSettings, handlers: CombatHandlers) {
  const props = useTrackerProps(data, settings, handlers);
  const calculations = useRoundCalculations(
    props.encounter,
    props.effects,
    props.triggers,
    props.onRoundChange,
    props.onEffectExpiry,
    props.maxRounds,
    props.estimatedRoundDuration
  );

  return { ...props, ...calculations };
}

export function RoundTracker({
  data,
  settings = {},
  handlers,
}: RoundTrackerProps) {
  const trackerData = useRoundTrackerData(data, settings, handlers);

  // Handle null encounter after all hooks
  if (!trackerData.encounter) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No combat active</p>
        </CardContent>
      </Card>
    );
  }

  return <TrackerMain {...trackerData} encounter={trackerData.encounter!} />;
}