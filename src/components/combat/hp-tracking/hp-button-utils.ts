export const HP_BUTTON_STYLES = {
  damage: 'px-3 py-1 text-sm',
  healing: 'px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white',
  apply: 'px-4',
  applyDamage: 'px-4',
  applyHealing: 'px-4 bg-green-600 hover:bg-green-700 text-white',
} as const;

export const HP_BUTTON_SIZES = {
  small: 'px-2 py-1 text-xs',
  medium: 'px-3 py-1 text-sm',
  large: 'px-4 py-2 text-base',
} as const;

export const HP_BUTTON_SPACING = {
  tight: 'space-x-1',
  normal: 'space-x-2',
  loose: 'space-x-3',
} as const;

export const DEFAULT_DAMAGE_AMOUNTS = [1, 5, 10, 15, 20] as const;

export const DEFAULT_HEALING_AMOUNTS = [1, 5, 10, 15, 20] as const;

export function getButtonSize(compact: boolean = false): 'sm' | 'default' {
  return compact ? 'sm' : 'default';
}

export function getButtonSpacing(compact: boolean = false): string {
  return compact ? HP_BUTTON_SPACING.tight : HP_BUTTON_SPACING.normal;
}

export function getHPButtonA11yProps(action: 'damage' | 'healing' | 'edit', amount?: number) {
  if (action === 'edit') {
    return {
      'aria-label': 'Edit HP values',
      'data-testid': 'edit-hp-button',
    };
  }

  const baseProps = {
    'aria-label': amount
      ? `Apply ${amount} ${action}`
      : `Apply ${action}`,
    'data-testid': amount
      ? `${action}-${amount}-button`
      : `apply-${action}-button`,
  };

  return baseProps;
}