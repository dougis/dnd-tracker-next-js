import { render, screen } from '@testing-library/react';
import { Footer, COPYRIGHT_TEXT } from '../Footer';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Footer', () => {
  beforeEach(() => {
    // Reset Date mock before each test
    jest.resetAllMocks();
  });

  it('renders copyright notice with dynamic year', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);
    expect(screen.getByText(`© ${currentYear} D&D Encounter Tracker. All rights reserved.`)).toBeInTheDocument();
  });

  it('uses copyright constant', () => {
    render(<Footer />);
    expect(screen.getByText(COPYRIGHT_TEXT)).toBeInTheDocument();
  });

  it('copyright text uses current year', () => {
    // Since COPYRIGHT_TEXT is created at module level, we test that it contains the current year
    const currentYear = new Date().getFullYear();
    expect(COPYRIGHT_TEXT).toBe(`© ${currentYear} D&D Encounter Tracker. All rights reserved.`);
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