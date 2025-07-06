import { FormSelectOption } from '@/components/forms';

export const TIMEZONE_OPTIONS: FormSelectOption[] = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'Europe/Paris', label: 'CET (Paris)' },
  { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
  { value: 'Australia/Sydney', label: 'AEST (Sydney)' },
];

export const EXPERIENCE_LEVEL_OPTIONS: FormSelectOption[] = [
  { value: 'new', label: 'New to D&D' },
  { value: 'beginner', label: 'Beginner (0-2 years)' },
  { value: 'intermediate', label: 'Intermediate (2-5 years)' },
  { value: 'experienced', label: 'Experienced (5+ years)' },
  { value: 'veteran', label: 'Veteran (10+ years)' },
];

export const PRIMARY_ROLE_OPTIONS: FormSelectOption[] = [
  { value: 'dm', label: 'Dungeon Master' },
  { value: 'player', label: 'Player' },
  { value: 'both', label: 'Both DM and Player' },
];

export const DEFAULT_FORM_VALUES = {
  timezone: 'UTC',
  dndEdition: '5th Edition',
  experienceLevel: '',
  primaryRole: '',
} as const;