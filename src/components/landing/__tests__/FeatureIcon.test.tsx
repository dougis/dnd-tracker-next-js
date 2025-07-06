import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import '@testing-library/jest-dom';
import { FeatureIcon } from '../FeatureIcon';

describe('FeatureIcon Component', () => {
  describe('Image Rendering', () => {
    it('should render image with correct src and alt attributes', () => {
      render(<FeatureIcon src="/features/test-image.svg" alt="Test Feature" />);

      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', expect.stringContaining('/features/test-image.svg'));
      expect(image).toHaveAttribute('alt', 'Test Feature');
    });

    it('should have proper container styling', () => {
      render(<FeatureIcon src="/features/test-image.svg" alt="Test Feature" />);

      const container = screen.getByRole('img').closest('div');
      expect(container).toHaveClass('w-12', 'h-12', 'bg-primary/10', 'rounded-lg', 'flex', 'items-center', 'justify-center', 'mb-4');
    });

    it('should handle missing images gracefully', () => {
      render(<FeatureIcon src="/features/non-existent.svg" alt="Missing Image" />);

      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Missing Image');
    });
  });

  describe('Accessibility', () => {
    it('should provide meaningful alt text', () => {
      render(<FeatureIcon src="/features/initiative-tracker.svg" alt="Initiative Tracking Feature" />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Initiative Tracking Feature');
    });
  });

  describe('Visual Issues', () => {
    it('should have color styling to ensure SVG visibility', () => {
      render(<FeatureIcon src="/features/initiative-tracker.svg" alt="Initiative Tracking Feature" />);

      const image = screen.getByRole('img');
      // SVG icons use currentColor, so the image should have color context
      expect(image).toHaveClass('text-primary');
    });
  });
});