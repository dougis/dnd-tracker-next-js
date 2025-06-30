import React from 'react';
import { render, screen } from '@testing-library/react';
import { PricingSection } from '../PricingSection';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, className }: any) => (
    <div
      className={`btn ${variant || ''} ${className || ''}`}
      data-testid="pricing-button"
    >
      {children}
    </div>
  ),
}));

describe('PricingSection Component', () => {
  it('renders section heading about subscription tiers', () => {
    render(<PricingSection />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toMatch(/pricing|plan|subscription/i);
  });

  it('displays all 5 freemium subscription tiers clearly', () => {
    render(<PricingSection />);

    // Free Adventurer tier
    expect(screen.getByText(/free.*adventurer/i)).toBeInTheDocument();
    expect(screen.getByText(/\$0/)).toBeInTheDocument();

    // Seasoned Adventurer tier
    expect(screen.getByText(/seasoned.*adventurer/i)).toBeInTheDocument();
    expect(screen.getByText(/\$4\.99/)).toBeInTheDocument();

    // Expert Dungeon Master tier
    expect(screen.getByText(/expert.*dungeon.*master/i)).toBeInTheDocument();
    expect(screen.getByText(/\$9\.99/)).toBeInTheDocument();

    // Master of Dungeons tier
    expect(screen.getByText(/master.*of.*dungeons/i)).toBeInTheDocument();
    expect(screen.getByText(/\$19\.99/)).toBeInTheDocument();

    // Guild Master tier
    expect(screen.getByText(/guild.*master/i)).toBeInTheDocument();
    expect(screen.getByText(/\$39\.99/)).toBeInTheDocument();
  });

  it('shows specific feature limits for each tier', () => {
    render(<PricingSection />);

    // Free tier limits
    expect(screen.getAllByText(/1.*part/i).length).toBeGreaterThanOrEqual(1); // 1 party
    expect(screen.getAllByText(/3.*encounter/i).length).toBeGreaterThanOrEqual(1); // 3 encounters
    expect(screen.getAllByText(/10.*creature/i).length).toBeGreaterThanOrEqual(1); // 10 creatures

    // Higher tier limits
    expect(screen.getAllByText(/unlimited/i).length).toBeGreaterThan(0); // Guild Master unlimited
  });

  it('highlights value proposition for each subscription tier', () => {
    render(<PricingSection />);

    // Should show features/benefits for each tier
    expect(screen.getAllByText(/parties|encounters|creatures/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/organization.*feature/i)).toBeInTheDocument(); // Guild Master features
  });

  it('includes call-to-action buttons for tier selection', () => {
    render(<PricingSection />);

    const ctaButtons = screen.getAllByTestId('pricing-button');
    expect(ctaButtons.length).toBeGreaterThanOrEqual(3); // At least some tiers should have CTA buttons

    // Free tier should have "Start Free" button
    expect(screen.getAllByText(/start.*free/i).length).toBeGreaterThan(0);
  });

  it('emphasizes free tier to lower barrier to entry', () => {
    render(<PricingSection />);

    const freeText = screen.getAllByText(/free/i);
    expect(freeText.length).toBeGreaterThan(0);

    // Free tier should be prominently displayed
    expect(screen.getByText(/\$0/)).toBeInTheDocument();
  });

  it('uses responsive grid layout for pricing cards', () => {
    render(<PricingSection />);

    const section = screen.getByRole('heading', { level: 2 }).closest('section');
    expect(section).toHaveClass('container', 'mx-auto', 'px-4', 'py-16');

    // Should have responsive grid for pricing cards
    const pricingGrid = section?.querySelector('.grid');
    expect(pricingGrid).toBeInTheDocument();
  });

  it('clearly displays monthly pricing information', () => {
    render(<PricingSection />);

    // Should show "/month" or "per month" indicators
    expect(screen.getAllByText(/month/i).length).toBeGreaterThan(0);

    // Should display all price points clearly
    expect(screen.getByText(/\$0/)).toBeInTheDocument();
    expect(screen.getByText(/\$4\.99/)).toBeInTheDocument();
    expect(screen.getByText(/\$9\.99/)).toBeInTheDocument();
  });

  it('makes the most popular tier visually prominent', () => {
    render(<PricingSection />);

    // Should highlight popular/recommended tier
    expect(screen.getByText(/popular|recommended|most.*popular/i)).toBeInTheDocument();
  });

  it('has proper semantic structure for accessibility', () => {
    render(<PricingSection />);

    const section = screen.getByRole('heading', { level: 2 }).closest('section');
    expect(section).toBeInTheDocument();
    expect(section?.tagName.toLowerCase()).toBe('section');
  });

  it('includes compelling pricing copy to drive conversions', () => {
    render(<PricingSection />);

    // Should have persuasive language about value
    expect(screen.getAllByText(/choose.*subscription|upgrade|perfect.*for|start.*free/i).length).toBeGreaterThan(0);
  });
});
