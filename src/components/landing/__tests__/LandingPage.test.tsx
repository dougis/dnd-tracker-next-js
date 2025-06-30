import React from 'react';
import { render, screen } from '@testing-library/react';
import { LandingPage } from '../LandingPage';

// Mock the landing page components
jest.mock('../HeroSection', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
}));

jest.mock('../FeaturesSection', () => ({
  FeaturesSection: () => <div data-testid="features-section">Features Section</div>,
}));

jest.mock('../PricingSection', () => ({
  PricingSection: () => <div data-testid="pricing-section">Pricing Section</div>,
}));

jest.mock('../TestimonialsSection', () => ({
  TestimonialsSection: () => <div data-testid="testimonials-section">Testimonials Section</div>,
}));

jest.mock('../CallToActionSection', () => ({
  CallToActionSection: () => <div data-testid="cta-section">Call To Action Section</div>,
}));

describe('LandingPage Component', () => {
  it('renders all main sections in correct order', () => {
    render(<LandingPage />);

    // Verify all sections are present
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('features-section')).toBeInTheDocument();
    expect(screen.getByTestId('pricing-section')).toBeInTheDocument();
    expect(screen.getByTestId('testimonials-section')).toBeInTheDocument();
    expect(screen.getByTestId('cta-section')).toBeInTheDocument();
  });

  it('renders main container with proper styling', () => {
    const { container } = render(<LandingPage />);
    const mainElement = container.querySelector('main');

    expect(mainElement).toHaveClass('min-h-screen', 'bg-background');
  });

  it('renders sections in the correct order for optimal conversion flow', () => {
    render(<LandingPage />);

    const sections = [
      screen.getByTestId('hero-section'),
      screen.getByTestId('features-section'),
      screen.getByTestId('pricing-section'),
      screen.getByTestId('testimonials-section'),
      screen.getByTestId('cta-section'),
    ];

    // Verify sections appear in DOM order by comparing their positions
    for (let i = 0; i < sections.length - 1; i++) {
      expect(sections[i].compareDocumentPosition(sections[i + 1])).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    }
  });

  it('has proper semantic structure for accessibility', () => {
    render(<LandingPage />);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });
});
