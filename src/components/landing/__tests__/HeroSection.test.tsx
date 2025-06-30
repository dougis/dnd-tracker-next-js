import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '../HeroSection';
import { mockNextLink, mockButton, mockCTAButtons, getSection, expectSemanticStructure } from './test-utils';

mockNextLink();
mockButton();
mockCTAButtons();

describe('HeroSection Component', () => {
  it('renders compelling headline for D&D Encounter Tracker', () => {
    render(<HeroSection />);

    expect(screen.getByText('Master Your D&D Encounters')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Master Your D&D Encounters');
  });

  it('displays clear value proposition describing app benefits', () => {
    render(<HeroSection />);

    const valueProposition = screen.getByText(/The ultimate D&D Encounter Tracker for Dungeon Masters/);
    expect(valueProposition).toBeInTheDocument();
    expect(valueProposition).toHaveTextContent(
      'The ultimate D&D Encounter Tracker for Dungeon Masters. Streamline combat, manage characters, and create epic adventures with ease.'
    );
  });

  it('provides primary call-to-action button for registration', () => {
    render(<HeroSection />);

    const getStartedLink = screen.getByText('Get Started Free');
    expect(getStartedLink).toBeInTheDocument();
    expect(getStartedLink.closest('a')).toHaveAttribute('href', '/signup');
  });

  it('provides secondary call-to-action button for existing users', () => {
    render(<HeroSection />);

    const signInLink = screen.getByText('Sign In');
    expect(signInLink).toBeInTheDocument();
    expect(signInLink.closest('a')).toHaveAttribute('href', '/signin');
  });

  it('uses proper typography hierarchy for readability', () => {
    render(<HeroSection />);

    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toHaveClass('text-4xl', 'md:text-6xl', 'font-fantasy', 'font-bold');

    const valueProposition = screen.getByText(/The ultimate D&D Encounter Tracker/);
    expect(valueProposition).toHaveClass('text-xl', 'text-muted-foreground');
  });

  it('implements responsive design for mobile and desktop', () => {
    render(<HeroSection />);

    // Check container responsive classes
    const container = screen.getByRole('heading', { level: 1 }).closest('section');
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-16');

    // Check button container responsive layout - CTA buttons should be present
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('has proper semantic structure for accessibility and SEO', () => {
    render(<HeroSection />);

    const section = getSection(screen, 1);
    expectSemanticStructure(section);

    // Check heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('provides clear visual hierarchy with proper spacing', () => {
    render(<HeroSection />);

    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toHaveClass('mb-6');

    const valueProposition = screen.getByText(/The ultimate D&D Encounter Tracker/);
    expect(valueProposition).toHaveClass('mb-8');
  });

  it('centers content for optimal focus and conversion', () => {
    render(<HeroSection />);

    const section = screen.getByRole('heading', { level: 1 }).closest('section');
    expect(section).toHaveClass('text-center');

    const maxWidthContainer = section?.querySelector('.max-w-4xl');
    expect(maxWidthContainer).toHaveClass('mx-auto');
  });
});
