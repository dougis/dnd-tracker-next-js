'use client';

import { CardContent as UICardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Target, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { EncounterListItem } from '../types';

interface CardContentProps {
  encounter: EncounterListItem;
}

interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function InfoItem({ icon: Icon, children }: InfoItemProps) {
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Icon className="h-4 w-4 mr-2" />
      {children}
    </div>
  );
}

function ParticipantInfo({ encounter }: { encounter: EncounterListItem }) {
  return (
    <InfoItem icon={Users}>
      <span>{encounter.participantCount} participants</span>
      {encounter.playerCount > 0 && (
        <span className="ml-2">({encounter.playerCount} players)</span>
      )}
    </InfoItem>
  );
}

function TargetLevelInfo({ targetLevel }: { targetLevel?: number }) {
  if (!targetLevel) return null;
  return (
    <InfoItem icon={Target}>
      <span>Level {targetLevel}</span>
    </InfoItem>
  );
}

function DurationInfo({ estimatedDuration }: { estimatedDuration?: number }) {
  if (!estimatedDuration) return null;
  return (
    <InfoItem icon={Clock}>
      <span>{estimatedDuration} minutes</span>
    </InfoItem>
  );
}

function UpdatedAtInfo({ updatedAt }: { updatedAt: Date }) {
  return (
    <InfoItem icon={Calendar}>
      <span>{formatDistanceToNow(updatedAt, { addSuffix: true })}</span>
    </InfoItem>
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