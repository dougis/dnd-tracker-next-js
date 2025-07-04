'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { EncounterActionButtons } from './EncounterActionButtons';
import { Users, Clock, Target, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { EncounterCardProps } from './types';

export function EncounterCard({
  encounter,
  isSelected = false,
  onSelect,
  onRefetch,
}: EncounterCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'trivial':
        return 'secondary';
      case 'easy':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'hard':
        return 'destructive';
      case 'deadly':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'trivial':
        return 'text-gray-500';
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-orange-600';
      case 'deadly':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on checkbox or action buttons
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest('[data-checkbox]') || e.target.closest('[data-actions]'))
    ) {
      return;
    }
    // TODO: Navigate to encounter detail view
    console.log('View encounter:', encounter.id);
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (onSelect) {
      onSelect(encounter.id);
    }
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              {onSelect && (
                <div data-checkbox>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={handleCheckboxChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              <h3 className="font-semibold truncate" title={encounter.name}>
                {encounter.name}
              </h3>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant={getStatusVariant(encounter.status)}>
                {encounter.status}
              </Badge>
              <Badge 
                variant={getDifficultyVariant(encounter.difficulty)}
                className={getDifficultyColor(encounter.difficulty)}
              >
                {encounter.difficulty}
              </Badge>
            </div>
          </div>
          
          <div data-actions className="opacity-0 group-hover:opacity-100 transition-opacity">
            <EncounterActionButtons
              encounter={encounter}
              onRefetch={onRefetch}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {encounter.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {encounter.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>{encounter.participantCount} participants</span>
            {encounter.playerCount > 0 && (
              <span className="ml-2">({encounter.playerCount} players)</span>
            )}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Target className="h-4 w-4 mr-2" />
            <span>Level {encounter.targetLevel}</span>
          </div>

          {encounter.estimatedDuration && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span>{encounter.estimatedDuration} minutes</span>
            </div>
          )}

          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {formatDistanceToNow(new Date(encounter.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {encounter.tags && encounter.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {encounter.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {encounter.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{encounter.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}