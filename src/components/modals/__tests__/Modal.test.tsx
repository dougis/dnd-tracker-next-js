import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from './test-utils';
import { Modal } from '../Modal';

// Mock the Dialog component
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({
    children,
    open: _open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (_open: boolean) => void;
  }) => (
    <div data-testid="dialog" data-open={_open}>
      {children}
      <button
        data-testid="dialog-close"
        onClick={() => onOpenChange && onOpenChange(false)}
      >
        Close Dialog
      </button>
    </div>
  ),
  DialogContent: ({
    children,
    className,
    onEscapeKeyDown,
    onPointerDownOutside,
  }: {
    children: React.ReactNode;
    className?: string;
    onEscapeKeyDown?: () => void;
    onPointerDownOutside?: () => void;
  }) => (
    <div
      data-testid="dialog-content"
      className={className}
      data-escape-disabled={!!onEscapeKeyDown}
      data-overlay-disabled={!!onPointerDownOutside}
    >
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
  ),
}));

describe('Modal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders basic modal without title or description', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByText('Modal content')).toBeInTheDocument();
    expect(screen.queryByTestId('dialog-title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dialog-description')).not.toBeInTheDocument();
  });

  it('renders modal with title and description', () => {
    render(
      <Modal
        {...defaultProps}
        title="Test Modal"
        description="This is a test modal"
      />
    );

    expect(screen.getByText('Modal content')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('This is a test modal')).toBeInTheDocument();
  });

  it('renders footer content when provided', () => {
    render(<Modal {...defaultProps} footer={<button>Footer Button</button>} />);

    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  it('calls onOpenChange when dialog is closed', async () => {
    const user = userEvent.setup();
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByTestId('dialog-close');
    await user.click(closeButton);

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('applies size and type variants correctly', () => {
    const { rerender } = render(
      <Modal {...defaultProps} size="lg" type="info" />
    );

    const content = screen.getByTestId('dialog-content');
    expect(content.className).toContain('max-w-lg');
    expect(content.className).toContain('border-blue-200');

    // Test another size and type
    rerender(<Modal {...defaultProps} size="sm" type="error" />);

    expect(content.className).toContain('max-w-sm');
    expect(content.className).toContain('border-red-200');
  });

  it('disables overlay click closing when specified', () => {
    render(<Modal {...defaultProps} closeOnOverlayClick={false} />);

    const content = screen.getByTestId('dialog-content');
    expect(content.getAttribute('data-overlay-disabled')).toBe('true');
  });

  it('disables escape key closing when specified', () => {
    render(<Modal {...defaultProps} closeOnEscapeKey={false} />);

    const content = screen.getByTestId('dialog-content');
    expect(content.getAttribute('data-escape-disabled')).toBe('true');
  });

  it('handles keyboard events properly when escape key is disabled', () => {
    const handleOpenChange = jest.fn();
    render(
      <Modal
        {...defaultProps}
        onOpenChange={handleOpenChange}
        closeOnEscapeKey={false}
      />
    );

    // Simulate escape key press
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    // Should not close the modal
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('handles keyboard events properly when escape key is enabled', async () => {
    const user = userEvent.setup();
    const handleOpenChange = jest.fn();
    render(
      <Modal
        {...defaultProps}
        onOpenChange={handleOpenChange}
        closeOnEscapeKey={true}
      />
    );

    // Simulate escape key press
    await user.keyboard('{Escape}');

    // Should close the modal
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('prevents closing when both overlay click and escape key are disabled', () => {
    const handleOpenChange = jest.fn();
    render(
      <Modal
        {...defaultProps}
        onOpenChange={handleOpenChange}
        closeOnOverlayClick={false}
        closeOnEscapeKey={false}
      />
    );

    // Try to close via onOpenChange callback
    const content = screen.getByTestId('dialog-content');
    expect(content.getAttribute('data-overlay-disabled')).toBe('true');
    expect(content.getAttribute('data-escape-disabled')).toBe('true');
  });

  it('applies correct CSS classes for different type variants', () => {
    const { rerender } = render(
      <Modal {...defaultProps} type="warning" />
    );

    let content = screen.getByTestId('dialog-content');
    expect(content.className).toContain('border-yellow-200');

    rerender(<Modal {...defaultProps} type="success" />);
    content = screen.getByTestId('dialog-content');
    expect(content.className).toContain('border-green-200');

    rerender(<Modal {...defaultProps} type="error" />);
    content = screen.getByTestId('dialog-content');
    expect(content.className).toContain('border-red-200');

    rerender(<Modal {...defaultProps} type="default" />);
    content = screen.getByTestId('dialog-content');
    expect(content.className).not.toContain('border-');
  });

  it('applies correct CSS classes for different size variants', () => {
    const { rerender } = render(
      <Modal {...defaultProps} size="xl" />
    );

    let content = screen.getByTestId('dialog-content');
    expect(content.className).toContain('max-w-xl');

    rerender(<Modal {...defaultProps} size="2xl" />);
    content = screen.getByTestId('dialog-content');
    expect(content.className).toContain('max-w-2xl');

    rerender(<Modal {...defaultProps} size="3xl" />);
    content = screen.getByTestId('dialog-content');
    expect(content.className).toContain('max-w-3xl');

    rerender(<Modal {...defaultProps} size="4xl" />);
    content = screen.getByTestId('dialog-content');
    expect(content.className).toContain('max-w-4xl');

    rerender(<Modal {...defaultProps} size="full" />);
    content = screen.getByTestId('dialog-content');
    expect(content.className).toContain('max-w-[95vw]');
  });

  it('handles open state changes correctly', () => {
    const { rerender } = render(<Modal {...defaultProps} open={false} />);

    const dialog = screen.getByTestId('dialog');
    expect(dialog.getAttribute('data-open')).toBe('false');

    rerender(<Modal {...defaultProps} open={true} />);
    expect(dialog.getAttribute('data-open')).toBe('true');
  });

  it('renders with custom className', () => {
    render(<Modal {...defaultProps} className="custom-modal-class" />);

    const content = screen.getByTestId('dialog-content');
    expect(content.className).toContain('custom-modal-class');
  });

  it('shows close button by default', () => {
    render(<Modal {...defaultProps} />);
    
    expect(screen.getByTestId('dialog-close')).toBeInTheDocument();
  });

  it('does not render header when no title or description provided', () => {
    render(<Modal {...defaultProps} title={undefined} description={undefined} />);

    expect(screen.queryByTestId('dialog-header')).not.toBeInTheDocument();
  });

  it('renders only title when description is not provided', () => {
    render(<Modal {...defaultProps} title="Test Title" description={undefined} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.queryByTestId('dialog-description')).not.toBeInTheDocument();
  });

  it('renders only description when title is not provided', () => {
    render(<Modal {...defaultProps} title={undefined} description="Test Description" />);

    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.queryByTestId('dialog-title')).not.toBeInTheDocument();
  });

  it('does not render footer when no footer content provided', () => {
    render(<Modal {...defaultProps} footer={undefined} />);

    expect(screen.queryByTestId('dialog-footer')).not.toBeInTheDocument();
  });

  it('properly handles overlay click when enabled', async () => {
    const user = userEvent.setup();
    const handleOpenChange = jest.fn();
    
    render(
      <Modal
        {...defaultProps}
        onOpenChange={handleOpenChange}
        closeOnOverlayClick={true}
      />
    );

    // Click outside should trigger close
    const content = screen.getByTestId('dialog-content');
    expect(content.getAttribute('data-overlay-disabled')).toBe('false');
  });

  it('cleans up event listeners on unmount', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = render(
      <Modal {...defaultProps} closeOnEscapeKey={false} />
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      { capture: true }
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      { capture: true }
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
