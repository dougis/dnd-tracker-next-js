import { render, screen } from '@testing-library/react';
import { TermsOfService } from '../TermsOfService';

describe('TermsOfService', () => {
  it('renders terms of service heading', () => {
    render(<TermsOfService />);
    expect(screen.getByRole('heading', { name: /terms of service/i })).toBeInTheDocument();
  });

  it('renders effective date', () => {
    render(<TermsOfService />);
    expect(screen.getByText('Effective Date:')).toBeInTheDocument();
  });

  it('renders acceptance section', () => {
    render(<TermsOfService />);
    expect(screen.getByRole('heading', { name: /acceptance of terms/i })).toBeInTheDocument();
  });

  it('renders service description', () => {
    render(<TermsOfService />);
    expect(screen.getByRole('heading', { name: /service description/i })).toBeInTheDocument();
  });

  it('renders user accounts section', () => {
    render(<TermsOfService />);
    expect(screen.getByRole('heading', { name: /user accounts/i })).toBeInTheDocument();
  });

  it('renders privacy policy reference', () => {
    render(<TermsOfService />);
    expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeInTheDocument();
  });

  it('renders termination section', () => {
    render(<TermsOfService />);
    expect(screen.getByRole('heading', { name: /termination/i })).toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(<TermsOfService />);
    expect(screen.getByRole('heading', { name: /contact information/i })).toBeInTheDocument();
  });

  it('renders Privacy Policy as a clickable link', () => {
    render(<TermsOfService />);
    const privacyPolicyLink = screen.getByRole('link', { name: /privacy policy/i });
    expect(privacyPolicyLink).toBeInTheDocument();
    expect(privacyPolicyLink).toHaveAttribute('href', '/privacy');
  });
});