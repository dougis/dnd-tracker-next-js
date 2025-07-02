import React from 'react';
import { Button } from '@/components/ui/button';
import type { ICharacter } from '@/lib/models/Character';

interface CharacterActionButtonsProps {
  character: ICharacter;
  onEdit?: (_character: ICharacter) => void;
  onDuplicate?: (_character: ICharacter) => void;
  onDelete?: (_character: ICharacter) => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

export function CharacterActionButtons({
  character,
  onEdit,
  onDuplicate,
  onDelete,
  size = 'sm',
  variant = 'ghost',
}: CharacterActionButtonsProps) {
  const handleAction = (action: () => void, event: React.MouseEvent) => {
    event.stopPropagation();
    action();
  };

  return (
    <div className="flex items-center space-x-1">
      {onEdit && (
        <Button
          variant={variant}
          size={size}
          onClick={(e) => handleAction(() => onEdit(character), e)}
        >
          Edit
        </Button>
      )}
      {onDuplicate && (
        <Button
          variant={variant}
          size={size}
          onClick={(e) => handleAction(() => onDuplicate(character), e)}
        >
          Duplicate
        </Button>
      )}
      {onDelete && (
        <Button
          variant={variant}
          size={size}
          onClick={(e) => handleAction(() => onDelete(character), e)}
        >
          Delete
        </Button>
      )}
    </div>
  );
}