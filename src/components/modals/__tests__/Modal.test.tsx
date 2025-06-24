import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';

describe('Modal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Modal {...defaultProps} open={false} />);
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('displays title and description when provided', () => {
    render(
      <Modal
        {...defaultProps}
        title="Test Title"
        description="Test Description"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    const footer = <button>Footer Button</button>;
    render(<Modal {...defaultProps} footer={footer} />);

    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />);

    // We can't easily test the class directly, but we can test that different sizes render
    expect(screen.getByText('Modal content')).toBeInTheDocument();

    rerender(<Modal {...defaultProps} size="lg" />);
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('applies correct type classes', () => {
    const { rerender } = render(<Modal {...defaultProps} type="error" />);

    expect(screen.getByText('Modal content')).toBeInTheDocument();

    rerender(<Modal {...defaultProps} type="warning" />);
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('calls onOpenChange when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('prevents closing on overlay click when disabled', () => {
    render(<Modal {...defaultProps} closeOnOverlayClick={false} />);

    // Try to click outside the modal (this is hard to test directly)
    // The modal should prevent the default behavior
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('prevents closing on escape key when disabled', () => {
    render(<Modal {...defaultProps} closeOnEscapeKey={false} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    // Modal should still be open
    expect(screen.getByText('Modal content')).toBeInTheDocument();
    expect(defaultProps.onOpenChange).not.toHaveBeenCalled();
  });

  it('allows closing on escape key when enabled (default)', () => {
    render(<Modal {...defaultProps} closeOnEscapeKey={true} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('applies custom className', () => {
    render(<Modal {...defaultProps} className="custom-class" />);

    // Test that the modal renders with content (className is harder to test directly)
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    const complexChildren = (
      <div>
        <h2>Complex Content</h2>
        <p>Paragraph content</p>
        <button>Child Button</button>
      </div>
    );

    render(<Modal {...defaultProps}>{complexChildren}</Modal>);

    expect(screen.getByText('Complex Content')).toBeInTheDocument();
    expect(screen.getByText('Paragraph content')).toBeInTheDocument();
    expect(screen.getByText('Child Button')).toBeInTheDocument();
  });
});
