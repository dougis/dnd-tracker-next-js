import { screen } from '@testing-library/react';
import { CallToActionSection } from '../CallToActionSection';
import {
  mockNextLink,
  mockButton,
  mockCTAButtons,
  renderComponent,
  expectResponsiveLayout,
  expectSemanticStructure,
} from './test-utils';

mockNextLink();
mockButton('cta-button');
mockCTAButtons('cta-button');

describe('CallToActionSection Component', () => {
  let section: Element | null;
  let sectionText: string;

  beforeEach(() => {
    renderComponent(CallToActionSection);
    section = screen.getByRole('heading', { level: 2 }).closest('section');
    sectionText = section?.textContent || '';
  });

  it('renders compelling final call-to-action heading', () => {
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toMatch(
      /ready|start|begin|join|get.*started|try.*free/i
    );
  });

  it('includes persuasive copy that summarizes key benefits', () => {
    expect(sectionText.toLowerCase()).toMatch(
      /encounter|combat|character|manage|track|streamline/
    );
  });

  it('provides primary registration call-to-action button', () => {
    const primaryCTA = screen.getByText(
      /get.*started|sign.*up|try.*free|start.*free/i
    );
    expect(primaryCTA).toBeInTheDocument();
    expect(primaryCTA.closest('a')).toHaveAttribute('href', '/auth/signup');
  });

  it('includes secondary call-to-action for existing users', () => {
    const secondaryCTA = screen.getByText(/sign.*in|log.*in/i);
    expect(secondaryCTA).toBeInTheDocument();
    expect(secondaryCTA.closest('a')).toHaveAttribute('href', '/auth/signin');
  });

  it('emphasizes free trial or free tier to reduce friction', () => {
    expect(screen.getByText(/free/i)).toBeInTheDocument();
  });

  it('uses urgency or scarcity language to encourage action', () => {
    expect(sectionText.toLowerCase()).toMatch(
      /today|now|start.*today|don't.*wait|join.*thousands/
    );
  });

  it('has prominent visual styling to draw attention', () => {
    expect(section).toHaveClass('py-16');
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('provides clear button hierarchy with primary and secondary actions', () => {
    const getStartedButton = screen.getByText('Get Started Free');
    const signInButton = screen.getByText('Sign In');

    expect(getStartedButton).toBeInTheDocument();
    expect(signInButton).toBeInTheDocument();
    expect(getStartedButton.closest('a')).toHaveAttribute('href', '/auth/signup');
    expect(signInButton.closest('a')).toHaveAttribute('href', '/auth/signin');
  });

  it('includes benefit-focused copy to reinforce value proposition', () => {
    expect(sectionText.toLowerCase()).toMatch(
      /save.*time|easier|streamline|perfect.*for.*dm|enhance.*game/
    );
  });

  it('uses centered layout for maximum impact', () => {
    expect(section).toHaveClass('text-center');
  });

  it('includes social proof elements to build trust', () => {
    expect(sectionText.toLowerCase()).toMatch(
      /thousands|join.*community|trusted.*by|users.*love/
    );
  });

  it('has proper semantic structure for accessibility', () => {
    expectSemanticStructure(section);
  });

  it('implements responsive design for mobile conversion optimization', () => {
    expectResponsiveLayout(section);
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});
