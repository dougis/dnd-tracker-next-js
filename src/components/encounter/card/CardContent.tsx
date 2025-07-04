'use client';

import { CardContent as UICardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Target, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { EncounterSummary } from '../types';

interface CardContentProps {
  encounter: EncounterSummary;
}

function ParticipantInfo({ encounter }: { encounter: EncounterSummary }) {
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Users className="h-4 w-4 mr-2" />
      <span>{encounter.participantCount} participants</span>
      {encounter.playerCount > 0 && (
        <span className="ml-2">({encounter.playerCount} players)</span>
      )}
    </div>
  );
}

function TargetLevelInfo({ targetLevel }: { targetLevel: number }) {
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Target className="h-4 w-4 mr-2" />
      <span>Level {targetLevel}</span>
    </div>
  );
}

function DurationInfo({ estimatedDuration }: { estimatedDuration?: number }) {
  if (!estimatedDuration) return null;
  
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Clock className="h-4 w-4 mr-2" />
      <span>{estimatedDuration} minutes</span>
    </div>
  );
}

function UpdatedAtInfo({ updatedAt }: { updatedAt: string }) {
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Calendar className="h-4 w-4 mr-2" />
      <span>
        {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
      </span>
    </div>
  );
}

function TagsInfo({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag: string) => (
        <Badge key={tag} variant="outline" className="text-xs">
          {tag}
        </Badge>
      ))}
      {tags.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{tags.length - 3}
        </Badge>
      )}
    </div>
  );
}

export function CardContent({ encounter }: CardContentProps) {
  return (
    <UICardContent className="pt-0">
      {encounter.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {encounter.description}
        </p>
      )}

      <div className="space-y-2">
        <ParticipantInfo encounter={encounter} />
        <TargetLevelInfo targetLevel={encounter.targetLevel} />
        <DurationInfo estimatedDuration={encounter.estimatedDuration} />
        <UpdatedAtInfo updatedAt={encounter.updatedAt} />
      </div>

      <TagsInfo tags={encounter.tags} />
    </UICardContent>
  );
}