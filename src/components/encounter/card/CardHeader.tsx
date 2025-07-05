'use client';

import { CardHeader as UICardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { EncounterActionButtons } from '../EncounterActionButtons';
import { getStatusVariant, getDifficultyVariant, getDifficultyColor } from './badgeUtils';
import type { EncounterListItem } from '../types';

interface CardHeaderProps {
  encounter: EncounterListItem;
  isSelected?: boolean;
  onSelect?: (_id: string) => void;
  onRefetch?: () => void;
}

export function CardHeader({
  encounter,
  isSelected = false,
  onSelect,
  onRefetch,
}: CardHeaderProps) {
  const handleCheckboxChange = (_checked: boolean) => {
    if (onSelect) {
      onSelect(encounter.id);
    }
  };

  return (
    <UICardHeader className="pb-3">
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
            {encounter.difficulty && (
              <Badge
                variant={getDifficultyVariant(encounter.difficulty)}
                className={getDifficultyColor(encounter.difficulty)}
              >
                {encounter.difficulty}
              </Badge>
            )}
          </div>
        </div>

        <div data-actions className="opacity-0 group-hover:opacity-100 transition-opacity">
          <EncounterActionButtons
            encounter={encounter}
            onRefetch={onRefetch}
          />
        </div>
      </div>
    </UICardHeader>
  );
}