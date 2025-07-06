import { render, screen } from '@testing-library/react';
import { LegalSection, ContactSection } from '../LegalComponents';

describe('LegalSection', () => {
  it('renders section title and children', () => {
    render(
      <LegalSection title="Test Section">
        <p>Test content</p>
      </LegalSection>
    );

    expect(screen.getByRole('heading', { name: /test section/i })).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(
      <LegalSection title="Test Section">
        <p>Test content</p>
      </LegalSection>
    );

    const section = screen.getByRole('heading', { name: /test section/i }).parentElement;
    expect(section).toHaveClass('mb-8');
  });
});

describe('ContactSection', () => {
  it('renders contact information heading', () => {
    render(<ContactSection email="test@example.com" />);

    expect(screen.getByRole('heading', { name: /contact information/i })).toBeInTheDocument();
  });

  it('renders with default description when not provided', () => {
    render(<ContactSection email="test@example.com" />);

    expect(screen.getByText(/if you have any questions, please contact us at/i)).toBeInTheDocument();
  });

  it('renders with custom description when provided', () => {
    render(
      <ContactSection
        email="custom@example.com"
        description="Custom description here"
      />
    );

    expect(screen.getByText('Custom description here')).toBeInTheDocument();
  });

  it('includes email and website text', () => {
    const { container } = render(<ContactSection email="format@test.com" website="https://format.test" />);

    expect(container.textContent).toContain('Email:');
    expect(container.textContent).toContain('format@test.com');
    expect(container.textContent).toContain('Website:');
    expect(container.textContent).toContain('https://format.test');
  });
});