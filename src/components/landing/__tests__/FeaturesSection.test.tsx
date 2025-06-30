import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeaturesSection } from '../FeaturesSection';

// Mock the FeatureIcon component
jest.mock('../FeatureIcon', () => ({
  FeatureIcon: ({ src, alt }: { src: string; alt: string }) => (
    <div data-testid="feature-icon">
      <div data-testid="feature-icon-icon">{src}</div>
      <div data-testid="feature-icon-title">{alt}</div>
      <div data-testid="feature-icon-description">{alt}</div>
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
    expect(screen.getAllByText(/initiative/i).length).toBeGreaterThan(0);

    // Should display character management feature
    expect(screen.getAllByText(/character/i).length).toBeGreaterThan(0);

    // Should display encounter building feature
    expect(screen.getAllByText(/encounter/i).length).toBeGreaterThan(0);
  });

  it('highlights unique competitive advantages', () => {
    render(<FeaturesSection />);

    // Should mention lair actions (unique feature)
    expect(screen.getAllByText(/lair.*action/i).length).toBeGreaterThan(0);

    // Should emphasize real-time collaboration
    expect(screen.getAllByText(/real.*time|collaboration/i).length).toBeGreaterThan(0);
  });

  it('uses feature icons for visual appeal and clarity', () => {
    render(<FeaturesSection />);

    const featureIcons = screen.getAllByTestId('feature-icon');
    expect(featureIcons.length).toBeGreaterThanOrEqual(3);
  });

  it('provides clear feature descriptions for user understanding', () => {
    render(<FeaturesSection />);

    // Check for feature descriptions in the actual CardDescription elements
    const descriptions = screen.getAllByText(/rolling|tracking|management|building|actions|responsive/i);
    expect(descriptions.length).toBeGreaterThan(3);
    
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

    // Feature titles should be smaller headings (h3)
    const featureTitles = screen.getAllByRole('heading', { level: 3 });
    expect(featureTitles.length).toBeGreaterThanOrEqual(3);
    featureTitles.forEach(title => {
      expect(title.textContent).toBeTruthy();
    });
  });

  it('demonstrates value for Dungeon Masters specifically', () => {
    render(<FeaturesSection />);

    // Should mention DM-specific benefits
    expect(screen.getAllByText(/dungeon.*master|dm/i).length).toBeGreaterThan(0);

    // Should highlight combat management benefits
    expect(screen.getAllByText(/combat|manage|track/i).length).toBeGreaterThan(0);
  });

  it('emphasizes mobile responsiveness for table use', () => {
    render(<FeaturesSection />);

    // Should mention mobile/tablet optimization
    expect(screen.getAllByText(/mobile|tablet|responsive/i).length).toBeGreaterThan(0);
  });

  it('has proper semantic structure for accessibility', () => {
    render(<FeaturesSection />);

    const section = screen.getByRole('heading', { level: 2 }).closest('section');
    expect(section).toBeInTheDocument();
    expect(section?.tagName.toLowerCase()).toBe('section');
  });
});
