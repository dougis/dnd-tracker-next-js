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

interface RoundData {
  currentRound: number;
  roundState: any;
  duration: any;
  combatPhase: string;
  isInOvertime: boolean;
  estimatedRoundDuration?: number;
}

interface EffectData {
  effects: Effect[];
  effectsError?: string;
  effectsByParticipant: any;
}

interface TriggerData {
  triggers: Trigger[];
  dueTriggers: any[];
  upcomingTriggers: any[];
}

interface HistoryData {
  showHistory: boolean;
  history: { round: number; events: string[] }[];
  isHistoryCollapsed: boolean;
  setIsHistoryCollapsed: (_collapsed: boolean) => void;
}

interface TrackerHandlers {
  handleNextRound: () => void;
  handlePreviousRound: () => void;
  onExport?: () => void;
  onTriggerAction?: (_triggerId: string) => void;
}

interface TrackerMainProps {
  roundData: RoundData;
  effectData: EffectData;
  triggerData: TriggerData;
  historyData: HistoryData;
  handlers: TrackerHandlers;
  encounter: IEncounter;
  sessionSummary?: SessionSummaryType;
  announceRound: number | null;
}

interface TrackerCardProps {
  roundData: RoundData;
  effectData: EffectData;
  triggerData: TriggerData;
  handlers: TrackerHandlers;
  encounter: IEncounter;
  sessionSummary?: SessionSummaryType;
}

function TrackerCard({ roundData, effectData, triggerData, handlers, encounter, sessionSummary }: TrackerCardProps) {
  return (
    <Card>
      <RoundHeader
        currentRound={roundData.currentRound}
        editState={{
          isEditingRound: roundData.roundState.isEditingRound,
          editRoundValue: roundData.roundState.editRoundValue,
          editError: roundData.roundState.editError,
        }}
        editHandlers={{
          onEditRound: roundData.roundState.handleEditRound,
          onSaveRound: roundData.roundState.handleSaveRound,
          onCancelEdit: roundData.roundState.handleCancelEdit,
          onEditValueChange: roundData.roundState.setEditRoundValue,
        }}
        combatPhase={roundData.combatPhase}
        isInOvertime={roundData.isInOvertime}
        onExport={handlers.onExport}
      />

      <CardContent className="space-y-4">
        <RoundControls
          currentRound={roundData.currentRound}
          onNextRound={handlers.handleNextRound}
          onPreviousRound={handlers.handlePreviousRound}
        />

        <DurationDisplay
          duration={roundData.duration}
          estimatedRoundDuration={roundData.estimatedRoundDuration}
        />

        <div className="border-t my-4" />

        <EffectsSection
          effects={effectData.effects}
          effectsError={effectData.effectsError}
          encounter={encounter}
          currentRound={roundData.currentRound}
          effectsByParticipant={effectData.effectsByParticipant}
        />

        <TriggersSection
          dueTriggers={triggerData.dueTriggers}
          upcomingTriggers={triggerData.upcomingTriggers}
          triggers={triggerData.triggers}
          currentRound={roundData.currentRound}
          duration={roundData.duration}
          onTriggerAction={handlers.onTriggerAction}
        />

        {sessionSummary && <SessionSummary summary={sessionSummary} />}
      </CardContent>
    </Card>
  );
}

function TrackerMain(props: TrackerMainProps) {
  const { roundData, effectData, triggerData, historyData, handlers, encounter, sessionSummary, announceRound } = props;

  const trackerCardProps = {
    roundData,
    effectData,
    triggerData,
    handlers,
    encounter,
    sessionSummary,
  };

  return (
    <div className="space-y-4">
      <TrackerCard {...trackerCardProps} />

      {historyData.showHistory && (
        <RoundHistory
          history={historyData.history}
          isCollapsed={historyData.isHistoryCollapsed}
          onToggle={historyData.setIsHistoryCollapsed}
          searchable={true}
          exportable={!!handlers.onExport}
          onExport={handlers.onExport ? () => handlers.onExport!() : undefined}
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

  const trackerMainProps: TrackerMainProps = {
    roundData: {
      currentRound: trackerData.currentRound,
      roundState: trackerData.roundState,
      duration: trackerData.duration,
      combatPhase: trackerData.combatPhase,
      isInOvertime: trackerData.isInOvertime,
      estimatedRoundDuration: trackerData.estimatedRoundDuration,
    },
    effectData: {
      effects: trackerData.effects,
      effectsError: trackerData.effectsError,
      effectsByParticipant: trackerData.effectsByParticipant,
    },
    triggerData: {
      triggers: trackerData.triggers,
      dueTriggers: trackerData.dueTriggers,
      upcomingTriggers: trackerData.upcomingTriggers,
    },
    historyData: {
      showHistory: trackerData.showHistory,
      history: trackerData.history,
      isHistoryCollapsed: trackerData.isHistoryCollapsed,
      setIsHistoryCollapsed: trackerData.setIsHistoryCollapsed,
    },
    handlers: {
      handleNextRound: trackerData.handleNextRound,
      handlePreviousRound: trackerData.handlePreviousRound,
      onExport: trackerData.onExport,
      onTriggerAction: trackerData.onTriggerAction,
    },
    encounter: trackerData.encounter!,
    sessionSummary: trackerData.sessionSummary,
    announceRound: trackerData.announceRound,
  };

  return <TrackerMain {...trackerMainProps} />;
}