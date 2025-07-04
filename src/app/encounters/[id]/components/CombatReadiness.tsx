import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, AlertCircleIcon, XCircleIcon } from 'lucide-react';
import type { IEncounter } from '@/lib/models/encounter/interfaces';

interface CombatReadinessProps {
  encounter: IEncounter;
}

interface ReadinessCheck {
  category: string;
  status: 'ready' | 'warning' | 'error';
  message: string;
  details?: string;
}

/**
 * Display combat readiness indicators and status checks
 */
export function CombatReadiness({ encounter }: CombatReadinessProps) {
  const participants = encounter.participants || [];

  const getReadinessChecks = (): ReadinessCheck[] => {
    const checks: ReadinessCheck[] = [];

    // Participants check
    if (participants.length === 0) {
      checks.push({
        category: 'Participants',
        status: 'error',
        message: 'No participants added',
        details: 'Add at least one participant to start combat',
      });
    } else if (participants.length < 2) {
      checks.push({
        category: 'Participants',
        status: 'warning',
        message: 'Only one participant',
        details: 'Combat works better with multiple participants',
      });
    } else {
      checks.push({
        category: 'Participants',
        status: 'ready',
        message: `${participants.length} participants ready`,
      });
    }

    // Initiative check
    const participantsWithInitiative = participants.filter(p => p.initiative !== undefined);
    if (participants.length > 0 && participantsWithInitiative.length === 0) {
      checks.push({
        category: 'Initiative',
        status: 'warning',
        message: 'No initiative set',
        details: 'Initiative will be rolled automatically if not set',
      });
    } else if (participantsWithInitiative.length < participants.length) {
      checks.push({
        category: 'Initiative',
        status: 'warning',
        message: 'Partial initiative set',
        details: `${participantsWithInitiative.length}/${participants.length} participants have initiative`,
      });
    } else if (participants.length > 0) {
      checks.push({
        category: 'Initiative',
        status: 'ready',
        message: 'All initiative set',
      });
    }

    // Settings check
    const hasRequiredSettings = encounter.settings.autoRollInitiative !== undefined;
    if (hasRequiredSettings) {
      checks.push({
        category: 'Settings',
        status: 'ready',
        message: 'Configuration complete',
      });
    } else {
      checks.push({
        category: 'Settings',
        status: 'warning',
        message: 'Review settings',
        details: 'Check combat configuration options',
      });
    }

    return checks;
  };

  const readinessChecks = getReadinessChecks();
  const overallStatus = readinessChecks.some(check => check.status === 'error')
    ? 'error'
    : readinessChecks.some(check => check.status === 'warning')
    ? 'warning'
    : 'ready';

  const getStatusIcon = (status: ReadinessCheck['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircleIcon className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
    }
  };

  const getOverallBadge = () => {
    switch (overallStatus) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">Ready for Combat</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Review Required</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Not Ready</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Combat Readiness</CardTitle>
          {getOverallBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {readinessChecks.map((check, index) => (
          <div key={index} className="flex items-start space-x-3">
            {getStatusIcon(check.status)}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{check.category}</span>
              </div>
              <p className="text-xs text-muted-foreground">{check.message}</p>
              {check.details && (
                <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
              )}
            </div>
          </div>
        ))}

        {/* Combat Statistics */}
        {participants.length > 0 && (
          <div className="pt-3 border-t space-y-2">
            <p className="text-xs font-medium">Combat Statistics</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Total HP:</span>
                <span className="ml-1">
                  {participants.reduce((sum, p) => sum + p.maxHitPoints, 0)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg AC:</span>
                <span className="ml-1">
                  {Math.round(participants.reduce((sum, p) => sum + p.armorClass, 0) / participants.length)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Players:</span>
                <span className="ml-1">
                  {participants.filter(p => p.isPlayer).length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Enemies:</span>
                <span className="ml-1">
                  {participants.filter(p => !p.isPlayer).length}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}