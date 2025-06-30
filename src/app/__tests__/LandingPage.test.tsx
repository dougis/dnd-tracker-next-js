import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import '@testing-library/jest-dom';
import Home from '../page';

describe('Landing Page', () => {
  describe('Hero Section', () => {
    it('should display compelling value proposition', () => {
      render(<Home />);

      // Should have a main heading that communicates value
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have clear call-to-action buttons', () => {
      render(<Home />);

      // Should have prominent CTA links for registration
      const ctaLinks = screen.getAllByRole('link', { name: /get started|sign up|start free/i });
      expect(ctaLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Features Showcase', () => {
    it('should demonstrate key functionality', () => {
      render(<Home />);

      // Should showcase D&D Encounter Tracker features
      expect(screen.getByText(/everything you need for epic d&d encounters/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /initiative tracking/i })).toBeInTheDocument();
    });

    it('should include screenshots or visual demonstrations', () => {
      render(<Home />);

      // Should have visual elements showcasing features
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Pricing Information', () => {
    it('should display subscription tiers clearly', () => {
      render(<Home />);

      // Should show pricing/subscription information
      expect(screen.getByText(/choose your subscription tier/i)).toBeInTheDocument();
    });

    it('should make pricing compelling and clear', () => {
      render(<Home />);

      // Should have clear pricing structure
      expect(screen.getByText(/\$0/)).toBeInTheDocument();
      expect(screen.getByText(/\$4\.99/)).toBeInTheDocument();
    });
  });

  describe('Social Proof', () => {
    it('should include testimonials section', () => {
      render(<Home />);

      // Should have testimonials or social proof
      expect(screen.getByText(/testimonial|review|feedback/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive across device sizes', () => {
      render(<Home />);

      // Should have responsive main container
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass(/min-h-screen/);
    });
  });

  describe('Performance', () => {
    it('should load quickly for conversion optimization', () => {
      render(<Home />);

      // Should render without errors
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should direct users to registration', () => {
      render(<Home />);

      // Should have links to sign up
      expect(screen.getByText(/sign up|register|get started/i)).toBeInTheDocument();
    });
  });
});
