import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import '@testing-library/jest-dom';
import { FeaturesSection } from '../FeaturesSection';

describe('FeaturesSection Component', () => {
  describe('Feature Images', () => {
    it('should render all feature icons with correct paths', () => {
      render(<FeaturesSection />);

      const expectedFeatures = [
        { icon: '/features/initiative-tracker.svg', title: 'Initiative Tracking' },
        { icon: '/features/hp-management.svg', title: 'HP & AC Management' },
        { icon: '/features/character-management.svg', title: 'Character Management' },
        { icon: '/features/encounter-builder.svg', title: 'Encounter Builder' },
        { icon: '/features/lair-actions.svg', title: 'Lair Actions' },
        { icon: '/features/mobile-ready.svg', title: 'Mobile & Tablet Ready' }
      ];

      expectedFeatures.forEach(feature => {
        const image = screen.getByAltText(feature.title);
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', expect.stringContaining(feature.icon));
      });
    });

    it('should display feature images with proper dimensions', () => {
      render(<FeaturesSection />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(6);

      images.forEach(image => {
        expect(image).toHaveAttribute('width', '32');
        expect(image).toHaveAttribute('height', '32');
      });
    });

    it('should have meaningful alt text for all feature images', () => {
      render(<FeaturesSection />);

      const requiredAltTexts = [
        'Initiative Tracking',
        'HP & AC Management',
        'Character Management',
        'Encounter Builder',
        'Lair Actions',
        'Mobile & Tablet Ready'
      ];

      requiredAltTexts.forEach(altText => {
        expect(screen.getByAltText(altText)).toBeInTheDocument();
      });
    });
  });

  describe('Feature Content', () => {
    it('should display all feature titles and descriptions', () => {
      render(<FeaturesSection />);

      expect(screen.getByRole('heading', { name: /initiative tracking/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /hp & ac management/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /character management/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /encounter builder/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /lair actions/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /mobile & tablet ready/i })).toBeInTheDocument();
    });

    it('should display section heading', () => {
      render(<FeaturesSection />);

      expect(screen.getByRole('heading', { name: /everything you need for epic d&d encounters/i })).toBeInTheDocument();
    });
  });
});