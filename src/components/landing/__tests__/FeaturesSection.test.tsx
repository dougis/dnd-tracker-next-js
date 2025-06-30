import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeaturesSection } from '../FeaturesSection';

// Mock the FeatureIcon component
jest.mock('../FeatureIcon', () => ({
  FeatureIcon: ({ icon, title, description }: { icon: string; title: string; description: string }) => (
    <div data-testid="feature-icon">
      <div data-testid="feature-icon-icon">{icon}</div>
      <div data-testid="feature-icon-title">{title}</div>
      <div data-testid="feature-icon-description">{description}</div>
    </div>
  ),
}));

describe('FeaturesSection Component', () => {
  it('renders section heading that showcases key functionality', () => {
    render(<FeaturesSection />);

    // Should have a main heading about features/functionality
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);

    // Check for feature-related text
    const sectionText = screen.getByRole('heading', { level: 2 });
    expect(sectionText).toBeInTheDocument();
  });

  it('displays core D&D encounter management features', () => {
    render(<FeaturesSection />);

    // Should display initiative tracking feature
    expect(screen.getByText(/initiative/i)).toBeInTheDocument();

    // Should display character management feature
    expect(screen.getByText(/character/i)).toBeInTheDocument();

    // Should display encounter building feature
    expect(screen.getByText(/encounter/i)).toBeInTheDocument();
  });

  it('highlights unique competitive advantages', () => {
    render(<FeaturesSection />);

    // Should mention lair actions (unique feature)
    expect(screen.getByText(/lair.*action/i)).toBeInTheDocument();

    // Should emphasize real-time collaboration
    expect(screen.getByText(/real.*time|collaboration/i)).toBeInTheDocument();
  });

  it('uses feature icons for visual appeal and clarity', () => {
    render(<FeaturesSection />);

    const featureIcons = screen.getAllByTestId('feature-icon');
    expect(featureIcons.length).toBeGreaterThanOrEqual(3);
  });

  it('provides clear feature descriptions for user understanding', () => {
    render(<FeaturesSection />);

    const descriptions = screen.getAllByTestId('feature-icon-description');
    descriptions.forEach(description => {
      expect(description.textContent).toBeTruthy();
      expect(description.textContent!.length).toBeGreaterThan(10);
    });
  });

  it('implements responsive grid layout for different screen sizes', () => {
    render(<FeaturesSection />);

    const section = screen.getByRole('heading', { level: 2 }).closest('section');
    expect(section).toHaveClass('container', 'mx-auto', 'px-4', 'py-16');

    // Should have grid layout for features
    const featuresGrid = section?.querySelector('.grid');
    expect(featuresGrid).toBeInTheDocument();
    expect(featuresGrid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('follows proper content hierarchy for readability', () => {
    render(<FeaturesSection />);

    // Should have proper heading structure
    const mainHeading = screen.getByRole('heading', { level: 2 });
    expect(mainHeading).toBeInTheDocument();

    // Feature titles should be smaller headings
    const featureTitles = screen.getAllByTestId('feature-icon-title');
    featureTitles.forEach(title => {
      expect(title.textContent).toBeTruthy();
    });
  });

  it('demonstrates value for Dungeon Masters specifically', () => {
    render(<FeaturesSection />);

    // Should mention DM-specific benefits
    expect(screen.getByText(/dungeon.*master|dm/i)).toBeInTheDocument();

    // Should highlight combat management benefits
    expect(screen.getByText(/combat|manage|track/i)).toBeInTheDocument();
  });

  it('emphasizes mobile responsiveness for table use', () => {
    render(<FeaturesSection />);

    // Should mention mobile/tablet optimization
    expect(screen.getByText(/mobile|tablet|responsive/i)).toBeInTheDocument();
  });

  it('has proper semantic structure for accessibility', () => {
    render(<FeaturesSection />);

    const section = screen.getByRole('heading', { level: 2 }).closest('section');
    expect(section).toBeInTheDocument();
    expect(section?.tagName.toLowerCase()).toBe('section');
  });
});
