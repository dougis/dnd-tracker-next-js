import { render, screen } from '@testing-library/react';
import { PrivacyPolicy } from '../PrivacyPolicy';

describe('PrivacyPolicy', () => {
  it('renders privacy policy heading', () => {
    render(<PrivacyPolicy />);
    expect(screen.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeInTheDocument();
  });

  it('renders effective date', () => {
    render(<PrivacyPolicy />);
    expect(screen.getByText('Effective Date:')).toBeInTheDocument();
  });

  it('renders information collection section', () => {
    render(<PrivacyPolicy />);
    expect(screen.getByRole('heading', { name: /information we collect/i })).toBeInTheDocument();
  });

  it('renders data usage section', () => {
    render(<PrivacyPolicy />);
    expect(screen.getByRole('heading', { name: /how we use your information/i })).toBeInTheDocument();
  });

  it('renders data sharing section', () => {
    render(<PrivacyPolicy />);
    expect(screen.getByRole('heading', { name: /information sharing/i })).toBeInTheDocument();
  });

  it('renders data security section', () => {
    render(<PrivacyPolicy />);
    expect(screen.getByRole('heading', { name: /data security/i })).toBeInTheDocument();
  });

  it('renders user rights section', () => {
    render(<PrivacyPolicy />);
    expect(screen.getByRole('heading', { name: /your rights/i })).toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(<PrivacyPolicy />);
    expect(screen.getByRole('heading', { name: /contact information/i })).toBeInTheDocument();
  });
});