import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Encounter } from '@/lib/validations/encounter';

interface EncounterOverviewProps {
  encounter: Encounter;
}

/**
 * Display basic encounter information and metadata
 */
export function EncounterOverview({ encounter }: EncounterOverviewProps) {
  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Not specified';
    return `${minutes} minutes`;
  };

  const formatDifficulty = (difficulty?: string) => {
    if (!difficulty) return 'Unknown';
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encounter Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
            <p className="text-lg">{formatDifficulty(encounter.difficulty)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Duration</p>
            <p className="text-lg">{formatDuration(encounter.estimatedDuration)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Target Level</p>
            <p className="text-lg">Level {encounter.targetLevel || 'Any'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge variant={encounter.status === 'active' ? 'default' : 'secondary'}>
              {formatStatus(encounter.status)}
            </Badge>
          </div>
        </div>

        {/* Tags */}
        {encounter.tags && encounter.tags.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {encounter.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {encounter.description && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
            <p className="text-sm leading-relaxed">{encounter.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}