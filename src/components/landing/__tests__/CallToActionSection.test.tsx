import React from 'react';
import { render, screen } from '@testing-library/react';
import { CallToActionSection } from '../CallToActionSection';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, size, variant, className }: any) => (
    <div
      className={`btn ${size || ''} ${variant || ''} ${className || ''}`}
      data-testid="cta-button"
    >
      {children}
    </div>
  ),
}));

describe('CallToActionSection Component', () => {
  it('renders compelling final call-to-action heading', () => {
    render(<CallToActionSection />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toMatch(/ready|start|begin|join|get.*started|try.*free/i);
  });

  it('includes persuasive copy that summarizes key benefits', () => {
    render(<CallToActionSection />);

    // Should have descriptive text about the app benefits
    const sectionText = screen.getByRole('heading', { level: 2 }).closest('section')?.textContent || '';
    expect(sectionText.toLowerCase()).toMatch(/encounter|combat|character|manage|track|streamline/);
  });

  it('provides primary registration call-to-action button', () => {
    render(<CallToActionSection />);

    const primaryCTA = screen.getByText(/get.*started|sign.*up|try.*free|start.*free/i);
    expect(primaryCTA).toBeInTheDocument();
    expect(primaryCTA.closest('a')).toHaveAttribute('href', '/signup');
  });

  it('includes secondary call-to-action for existing users', () => {
    render(<CallToActionSection />);

    const secondaryCTA = screen.getByText(/sign.*in|log.*in/i);
    expect(secondaryCTA).toBeInTheDocument();
    expect(secondaryCTA.closest('a')).toHaveAttribute('href', '/signin');
  });

  it('emphasizes free trial or free tier to reduce friction', () => {
    render(<CallToActionSection />);

    expect(screen.getByText(/free/i)).toBeInTheDocument();
  });

  it('uses urgency or scarcity language to encourage action', () => {
    render(<CallToActionSection />);

    const sectionText = screen.getByRole('heading', { level: 2 }).closest('section')?.textContent || '';
    expect(sectionText.toLowerCase()).toMatch(/today|now|start.*today|don't.*wait|join.*thousands/);
  });

  it('has prominent visual styling to draw attention', () => {
    render(<CallToActionSection />);

    const section = screen.getByRole('heading', { level: 2 }).closest('section');
    expect(section).toHaveClass('py-16'); // Should have substantial padding

    // Buttons should be prominently sized
    const buttons = screen.getAllByTestId('cta-button');
    buttons.forEach(button => {
      expect(button).toHaveClass('btn');
    });
  });

  it('provides clear button hierarchy with primary and secondary actions', () => {
    render(<CallToActionSection />);

    const buttons = screen.getAllByTestId('cta-button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);

    // Should have different visual treatments for primary vs secondary
    const buttonClasses = buttons.map(btn => btn.className);
    expect(buttonClasses.some(cls => cls.includes('outline'))).toBe(true); // Secondary button
  });

  it('includes benefit-focused copy to reinforce value proposition', () => {
    render(<CallToActionSection />);

    const sectionText = screen.getByRole('heading', { level: 2 }).closest('section')?.textContent || '';
    expect(sectionText.toLowerCase()).toMatch(/save.*time|easier|streamline|perfect.*for.*dm|enhance.*game/);
  });

  it('uses centered layout for maximum impact', () => {
    render(<CallToActionSection />);

    const section = screen.getByRole('heading', { level: 2 }).closest('section');
    expect(section).toHaveClass('text-center');
  });

  it('includes social proof elements to build trust', () => {
    render(<CallToActionSection />);

    const sectionText = screen.getByRole('heading', { level: 2 }).closest('section')?.textContent || '';
    expect(sectionText.toLowerCase()).toMatch(/thousands|join.*community|trusted.*by|users.*love/);
  });

  it('has proper semantic structure for accessibility', () => {
    render(<CallToActionSection />);

    const section = screen.getByRole('heading', { level: 2 }).closest('section');
    expect(section).toBeInTheDocument();
    expect(section?.tagName.toLowerCase()).toBe('section');
  });

  it('implements responsive design for mobile conversion optimization', () => {
    render(<CallToActionSection />);

    const section = screen.getByRole('heading', { level: 2 }).closest('section');
    expect(section).toHaveClass('container', 'mx-auto', 'px-4');

    // Button container should be responsive - find the parent container div
    const buttonContainer = screen.getByText(/get.*started/i).closest('div')?.parentElement;
    expect(buttonContainer).toHaveClass('flex');
  });
});
