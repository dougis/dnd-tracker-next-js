'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Save,
  X,
  TrendingUp,
  AlertTriangle,
  Download,
  Zap,
} from 'lucide-react';
import { IEncounter } from '@/lib/models/encounter/interfaces';
import { RoundHistory } from './RoundHistory';
import {
  Effect,
  Trigger,
  SessionSummary,
  formatDuration,
  groupEffectsByParticipant,
  getExpiringEffects,
  getDueTriggers,
  getUpcomingTriggers,
  isOvertime,
  getCombatPhase,
  formatTimeUntilTrigger,
  formatRoundSummary,
} from './round-utils';

interface RoundTrackerProps {
  encounter: IEncounter | null;
  effects?: Effect[];
  triggers?: Trigger[];
  history?: { round: number; events: string[] }[];
  sessionSummary?: SessionSummary;
  maxRounds?: number;
  estimatedRoundDuration?: number;
  showHistory?: boolean;
  effectsError?: string;
  onRoundChange: (_newRound: number) => void;
  onEffectExpiry?: (_expiredEffectIds: string[]) => void;
  onTriggerAction?: (_triggerId: string) => void;
  onExport?: () => void;
}

export function RoundTracker({
  encounter,
  effects = [],
  triggers = [],
  history = [],
  sessionSummary,
  maxRounds,
  estimatedRoundDuration,
  showHistory = false,
  effectsError,
  onRoundChange,
  onEffectExpiry,
  onTriggerAction,
  onExport,
}: RoundTrackerProps) {
  const [isEditingRound, setIsEditingRound] = useState(false);
  const [editRoundValue, setEditRoundValue] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);

  const currentRound = Math.max(1, encounter?.combatState?.currentRound || 1);

  // All hooks must be called before any early returns
  // Duration calculations
  const duration = useMemo(() => {
    if (!encounter?.combatState?.startedAt) {
      return {
        total: 0,
        average: 0,
        remaining: null,
        formatted: '0s',
      };
    }

    const startedAt = encounter.combatState.startedAt;
    const totalSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    const averageSeconds = totalSeconds / currentRound;
    const remainingSeconds = maxRounds && estimatedRoundDuration
      ? (maxRounds - currentRound) * (estimatedRoundDuration || averageSeconds)
      : null;

    return {
      total: totalSeconds,
      average: averageSeconds,
      remaining: remainingSeconds,
      formatted: formatDuration(totalSeconds),
    };
  }, [encounter?.combatState?.startedAt, currentRound, maxRounds, estimatedRoundDuration]);

  // Effect processing
  const effectsByParticipant = useMemo(() => {
    return groupEffectsByParticipant(effects);
  }, [effects]);

  const expiringEffects = useMemo(() => {
    return getExpiringEffects(effects, currentRound);
  }, [effects, currentRound]);

  // Trigger processing
  const dueTriggers = useMemo(() => {
    return getDueTriggers(triggers, currentRound);
  }, [triggers, currentRound]);

  const upcomingTriggers = useMemo(() => {
    return getUpcomingTriggers(triggers, currentRound);
  }, [triggers, currentRound]);

  // Combat phase
  const combatPhase = useMemo(() => {
    return getCombatPhase(currentRound, maxRounds);
  }, [currentRound, maxRounds]);

  const isInOvertime = useMemo(() => {
    return isOvertime(currentRound, maxRounds);
  }, [currentRound, maxRounds]);

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

  // Round control handlers
  const handleNextRound = () => {
    if (expiringEffects.length > 0 && onEffectExpiry) {
      onEffectExpiry(expiringEffects.map(e => e.id));
    }
    onRoundChange(currentRound + 1);
  };

  const handlePreviousRound = () => {
    if (currentRound > 1) {
      onRoundChange(currentRound - 1);
    }
  };

  const handleEditRound = () => {
    setEditRoundValue(currentRound.toString());
    setEditError(null);
    setIsEditingRound(true);
  };

  const handleSaveRound = () => {
    const newRound = parseInt(editRoundValue, 10);

    if (isNaN(newRound) || newRound < 1) {
      setEditError('Round must be at least 1');
      return;
    }

    onRoundChange(newRound);
    setIsEditingRound(false);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setIsEditingRound(false);
    setEditError(null);
  };

  const handleTriggerActivation = (triggerId: string) => {
    if (onTriggerAction) {
      onTriggerAction(triggerId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Round Tracker Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isEditingRound ? (
                <>
                  <h2 role="heading" aria-level={2}>
                    <CardTitle className="text-xl">Round {currentRound}</CardTitle>
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditRound}
                    aria-label="Edit round"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={editRoundValue}
                    onChange={(e) => setEditRoundValue(e.target.value)}
                    className="w-20"
                    aria-label="Current round"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveRound}
                    aria-label="Save"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    aria-label="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Combat phase badge */}
              <Badge
                variant={isInOvertime ? "destructive" : "secondary"}
                className="text-xs"
              >
                {isInOvertime ? 'Overtime' : combatPhase}
              </Badge>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {onExport && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExport}
                  aria-label="Export round data"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Edit error */}
          {editError && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{editError}</AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Round controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousRound}
              disabled={currentRound <= 1}
              aria-label="Previous round"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Round
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleNextRound}
              className="px-6"
              aria-label="Next round"
            >
              <ChevronRight className="h-4 w-4 mr-1" />
              Next Round
            </Button>
          </div>

          {/* Duration information */}
          {duration.total > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium">Total</div>
                <div className="text-muted-foreground">{duration.formatted}</div>
              </div>

              {estimatedRoundDuration && (
                <div className="text-center">
                  <div className="font-medium">Per Round</div>
                  <div className="text-muted-foreground">
                    ~{formatDuration(estimatedRoundDuration)}
                  </div>
                </div>
              )}

              {duration.remaining !== null && (
                <div className="text-center">
                  <div className="font-medium">Estimated</div>
                  <div className="text-muted-foreground">
                    {formatDuration(duration.remaining)} remaining
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="font-medium">Average</div>
                <div className="text-muted-foreground">
                  {formatDuration(duration.average)}/round
                </div>
              </div>
            </div>
          )}

          <div className="border-t my-4" />

          {/* Effects section */}
          {(effects.length > 0 || effectsError) && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Active Effects
                {effects.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {effects.length}
                  </Badge>
                )}
              </h3>

              {effectsError && (
                <Alert variant="destructive">
                  <AlertDescription>{effectsError}</AlertDescription>
                </Alert>
              )}

              {Object.entries(effectsByParticipant).map(([participantId, participantEffects]) => {
                // Find participant name
                const participant = encounter?.participants?.find(
                  p => p.characterId.toString() === participantId
                );
                const participantName = participant?.name || `Participant ${participantId}`;

                return (
                  <div key={participantId} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {participantName}
                    </h4>

                    <div className="grid gap-2">
                      {participantEffects.map((effect) => {
                        const remaining = Math.max(0, effect.duration - (currentRound - effect.startRound));
                        const isExpiring = remaining === 1;

                        return (
                          <div
                            key={effect.id}
                            className={`flex items-center justify-between p-2 rounded border ${
                              isExpiring ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/20' : 'border-border'
                            }`}
                            data-expiring={isExpiring || undefined}
                            aria-label={`${effect.name} effect on ${participantName}`}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">{effect.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {effect.description}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {remaining} rounds
                              </div>
                              {isExpiring && (
                                <div className="text-xs text-orange-600 dark:text-orange-400">
                                  Expiring soon
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Triggers section */}
          {(dueTriggers.length > 0 || upcomingTriggers.length > 0) && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Triggers & Reminders
              </h3>

              {/* Due triggers */}
              {dueTriggers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    Due This Round
                  </h4>

                  {dueTriggers.map((trigger) => (
                    <div
                      key={trigger.id}
                      className="flex items-center justify-between p-3 rounded border border-orange-300 bg-orange-50 dark:bg-orange-950/20"
                      data-due="true"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{trigger.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {trigger.description}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTriggerActivation(trigger.id)}
                        aria-label={`Activate ${trigger.name}`}
                      >
                        Activate
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upcoming triggers */}
              {upcomingTriggers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Upcoming
                  </h4>

                  {upcomingTriggers.slice(0, 3).map((trigger) => (
                    <div
                      key={trigger.id}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{trigger.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {trigger.description}
                        </div>
                      </div>

                      <div className="text-right text-sm">
                        <div className="font-medium">Round {trigger.triggerRound}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeUntilTrigger(trigger, currentRound, duration.average)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {upcomingTriggers.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{upcomingTriggers.length - 3} more triggers
                    </div>
                  )}
                </div>
              )}

              {/* Completed triggers */}
              {triggers.some(t => !t.isActive) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Completed
                  </h4>

                  {triggers
                    .filter(t => !t.isActive)
                    .slice(-2)
                    .map((trigger) => (
                      <div
                        key={trigger.id}
                        className="flex items-center justify-between p-2 rounded border bg-muted/20"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm text-muted-foreground">
                            {trigger.name}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Triggered in Round {trigger.triggeredRound}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Session summary */}
          {sessionSummary && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Session Summary
              </h3>

              <div className="text-sm text-muted-foreground">
                {formatRoundSummary(sessionSummary)}
              </div>
            </div>
          )}
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
      <div className="sr-only" aria-live="polite">
        <span>Round changed to {currentRound}</span>
      </div>
    </div>
  );
}