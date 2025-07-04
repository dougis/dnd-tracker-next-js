export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export const getStatusVariant = (status: string): BadgeVariant => {
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

export const getDifficultyVariant = (difficulty: string): BadgeVariant => {
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

export const getDifficultyColor = (difficulty: string): string => {
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