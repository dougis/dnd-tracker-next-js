import React from 'react';
import { render, screen } from '../test-utils';

// Simple variant testing utilities
export const testSizeVariants = (
  sizes: readonly string[],
  renderWithSize: (_size: string) => React.ReactElement
) => {
  sizes.forEach((size) => {
    const { rerender } = render(renderWithSize(size));
    const content = screen.getByTestId('dialog-content') || screen.getByTestId('modal');

    if (size === 'full') {
      expect(content.className).toContain('max-w-[95vw]');
    } else {
      expect(content.className).toContain(`max-w-${size}`);
    }

    rerender(React.createElement('div'));
  });
};

export const testTypeVariants = (
  types: readonly string[],
  renderWithType: (_type: string) => React.ReactElement
) => {
  types.forEach((type) => {
    const { rerender } = render(renderWithType(type));
    const content = screen.getByTestId('dialog-content') || screen.getByTestId('modal');

    if (type === 'info') {
      expect(content.className).toContain('border-blue-200');
    } else if (type === 'warning') {
      expect(content.className).toContain('border-yellow-200');
    } else if (type === 'error') {
      expect(content.className).toContain('border-red-200');
    } else if (type === 'success') {
      expect(content.className).toContain('border-green-200');
    }

    rerender(React.createElement('div'));
  });
};
