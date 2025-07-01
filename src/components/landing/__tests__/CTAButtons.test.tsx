import { render, screen } from '@testing-library/react';
import { CTAButtons } from '../CTAButtons';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock Button component
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

describe('CTAButtons Component', () => {
  beforeEach(() => {
    render(<CTAButtons />);
  });

  it('renders both call-to-action buttons', () => {
    const getStartedButton = screen.getByText('Get Started Free');
    const signInButton = screen.getByText('Sign In');

    expect(getStartedButton).toBeInTheDocument();
    expect(signInButton).toBeInTheDocument();
  });

  it('has correct href attributes for navigation links', () => {
    const getStartedLink = screen.getByText('Get Started Free').closest('a');
    const signInLink = screen.getByText('Sign In').closest('a');

    expect(getStartedLink).toHaveAttribute('href', '/signup');
    expect(signInLink).toHaveAttribute('href', '/signin');
  });

  it('applies correct styling classes for responsive layout', () => {
    const container = screen.getByText('Get Started Free').closest('div')?.parentElement;
    expect(container).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'gap-4', 'justify-center');
  });

  it('distinguishes primary and secondary buttons', () => {
    const getStartedButton = screen.getByText('Get Started Free');
    const signInButton = screen.getByText('Sign In');

    // Primary button (Get Started Free) should not have outline variant
    expect(getStartedButton.closest('div')).toHaveClass('btn');
    expect(getStartedButton.closest('div')).not.toHaveClass('outline');

    // Secondary button (Sign In) should have outline variant
    expect(signInButton.closest('div')).toHaveClass('btn', 'outline');
  });

  it('has consistent button sizing', () => {
    const getStartedButton = screen.getByText('Get Started Free');
    const signInButton = screen.getByText('Sign In');

    expect(getStartedButton.closest('div')).toHaveClass('lg');
    expect(signInButton.closest('div')).toHaveClass('lg');
  });

  it('maintains button hierarchy with proper text content', () => {
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});