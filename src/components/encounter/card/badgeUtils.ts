export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

// Configuration objects for mapping values
const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  active: 'default',
  completed: 'secondary',
  archived: 'outline',
} as const;

const DIFFICULTY_VARIANT_MAP: Record<string, BadgeVariant> = {
  trivial: 'secondary',
  easy: 'default',
  medium: 'secondary',
  hard: 'destructive',
  deadly: 'destructive',
} as const;

const DIFFICULTY_COLOR_MAP: Record<string, string> = {
  trivial: 'text-gray-500',
  easy: 'text-green-600',
  medium: 'text-yellow-600',
  hard: 'text-orange-600',
  deadly: 'text-red-600',
} as const;

// Generic mapping function
const getValueFromMap = <T>(map: Record<string, T>, key: string, defaultValue: T): T => {
  return map[key] ?? defaultValue;
};

export const getStatusVariant = (status: string): BadgeVariant => {
  return getValueFromMap(STATUS_VARIANT_MAP, status, 'secondary');
};

export const getDifficultyVariant = (difficulty: string): BadgeVariant => {
  return getValueFromMap(DIFFICULTY_VARIANT_MAP, difficulty, 'outline');
};

export const getDifficultyColor = (difficulty: string): string => {
  return getValueFromMap(DIFFICULTY_COLOR_MAP, difficulty, 'text-gray-500');
};