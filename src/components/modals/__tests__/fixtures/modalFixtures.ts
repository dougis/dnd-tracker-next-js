import React from 'react';

// Common modal test fixtures
export const createDefaultModalProps = (overrides: any = {}) => ({
  open: true,
  onOpenChange: jest.fn(),
  children: React.createElement('div', {}, 'Modal content'),
  ...overrides,
});

export const createDefaultConfirmationProps = (overrides: any = {}) => ({
  open: true,
  onOpenChange: jest.fn(),
  onConfirm: jest.fn(),
  config: {
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed?',
  },
  ...overrides,
});

export const createMinimalConfig = () => ({
  title: 'Minimal Config',
  description: 'Basic description',
});

export const createEmptyStringConfig = () => ({
  title: '',
  description: '',
  confirmText: '',
  cancelText: '',
});

export const createLoadingConfig = (loading = true) => ({
  title: 'Loading Test',
  description: 'Testing loading state',
  loading,
});

export const createVariantConfigs = () => {
  const variants = ['default', 'destructive', 'warning'] as const;
  return variants.map((variant) => ({
    title: `${variant} Variant`,
    description: `Testing ${variant} variant`,
    variant,
  }));
};
