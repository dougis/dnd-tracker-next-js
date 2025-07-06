import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Footer', () => {
  it('renders copyright notice', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2025 D&D Encounter Tracker/i)).toBeInTheDocument();
  });

  it('renders terms of service link', () => {
    render(<Footer />);
    const termsLink = screen.getByRole('link', { name: /terms of service/i });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/terms');
  });

  it('renders privacy policy link', () => {
    render(<Footer />);
    const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });
});