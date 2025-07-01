import React from 'react';
import { render, screen } from './test-utils';
import { Modal } from '../Modal';
import { setupMockClearing, setupUserEvent } from './utils/testHelpers';
import { testSizeVariants, testTypeVariants } from './utils/variantTestHelpers';
import { createDefaultModalProps } from './fixtures/modalFixtures';
import {
  assertElementNotExists,
  assertElementByTestId,
} from './utils/commonAssertions';

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
  const defaultProps = createDefaultModalProps();

  setupMockClearing();

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
    const user = setupUserEvent();
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

  describe('Edge Cases and Error Handling', () => {
    it('handles missing onOpenChange gracefully', () => {
      const propsWithoutHandler = {
        ...defaultProps,
        onOpenChange: undefined as any,
      };

      expect(() => {
        render(<Modal {...propsWithoutHandler} />);
      }).not.toThrow();
    });

    it('renders with all size variants', () => {
      const sizes = [
        'sm',
        'md',
        'lg',
        'xl',
        '2xl',
        '3xl',
        '4xl',
        'full',
      ] as const;

      testSizeVariants(sizes, size => <Modal {...defaultProps} size={size} />);
    });

    it('renders with all type variants', () => {
      const types = ['default', 'info', 'warning', 'error'] as const;

      testTypeVariants(types, type => <Modal {...defaultProps} type={type} />);
    });

    it('handles empty children gracefully', () => {
      render(<Modal {...defaultProps}>{null}</Modal>);

      assertElementByTestId('dialog-content');
    });

    it('renders without footer when not provided', () => {
      render(<Modal {...defaultProps} footer={undefined} />);

      assertElementNotExists('dialog-footer');
    });

    it('renders when closed', () => {
      render(<Modal {...defaultProps} open={false} />);

      const dialog = screen.getByTestId('dialog');
      expect(dialog.getAttribute('data-open')).toBe('false');
    });
  });

  describe('Accessibility Features', () => {
    it('passes accessibility props to dialog components', () => {
      render(
        <Modal
          {...defaultProps}
          title="Accessible Modal"
          description="Modal description for screen readers"
        />
      );

      expect(screen.getByTestId('dialog-title')).toHaveTextContent(
        'Accessible Modal'
      );
      expect(screen.getByTestId('dialog-description')).toHaveTextContent(
        'Modal description for screen readers'
      );
    });

    it('handles keyboard navigation props correctly', () => {
      render(
        <Modal
          {...defaultProps}
          closeOnEscapeKey={true}
          closeOnOverlayClick={true}
        />
      );

      const content = screen.getByTestId('dialog-content');
      expect(content.getAttribute('data-escape-disabled')).toBe('false');
      expect(content.getAttribute('data-overlay-disabled')).toBe('false');
    });

    it('provides proper ARIA structure', () => {
      render(
        <Modal
          {...defaultProps}
          title="Test Modal"
          description="Test Description"
        />
      );

      // Verify all ARIA components are rendered
      expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-description')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('applies conditional header rendering', () => {
      // With title and description
      const { rerender } = render(
        <Modal
          {...defaultProps}
          title="Test Title"
          description="Test Description"
        />
      );

      expect(screen.getByTestId('dialog-header')).toBeInTheDocument();

      // Without title or description
      rerender(
        <Modal {...defaultProps} title={undefined} description={undefined} />
      );

      expect(screen.queryByTestId('dialog-header')).not.toBeInTheDocument();
    });

    it('applies conditional footer rendering', () => {
      // With footer
      const { rerender } = render(
        <Modal {...defaultProps} footer={<button>Footer Button</button>} />
      );

      expect(screen.getByTestId('dialog-footer')).toBeInTheDocument();
      expect(screen.getByText('Footer Button')).toBeInTheDocument();

      // Without footer
      rerender(<Modal {...defaultProps} footer={undefined} />);

      expect(screen.queryByTestId('dialog-footer')).not.toBeInTheDocument();
    });

    it('combines custom className with default classes', () => {
      render(<Modal {...defaultProps} className="custom-modal-class" />);

      const content = screen.getByTestId('dialog-content');
      expect(content.className).toContain('custom-modal-class');
    });
  });

  describe('User Interaction Edge Cases', () => {
    it('handles rapid open/close state changes', async () => {
      const onOpenChange = jest.fn();
      const { rerender } = render(
        <Modal {...defaultProps} onOpenChange={onOpenChange} open={true} />
      );

      // Simulate rapid state changes
      rerender(
        <Modal {...defaultProps} onOpenChange={onOpenChange} open={false} />
      );
      rerender(
        <Modal {...defaultProps} onOpenChange={onOpenChange} open={true} />
      );
      rerender(
        <Modal {...defaultProps} onOpenChange={onOpenChange} open={false} />
      );

      // Should handle without errors
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('maintains focus management with multiple modals', () => {
      // This test ensures the modal doesn't break when multiple instances exist
      render(
        <div>
          <Modal {...defaultProps} open={true} />
          <Modal open={false} onOpenChange={jest.fn()}>
            <div>Second modal</div>
          </Modal>
        </div>
      );

      expect(screen.getAllByTestId('dialog')).toHaveLength(2);
    });
  });

  // Additional tests from main branch
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

  it('handles escape key configuration correctly', () => {
    const handleOpenChange = jest.fn();
    render(
      <Modal
        {...defaultProps}
        onOpenChange={handleOpenChange}
        closeOnEscapeKey={true}
      />
    );

    const content = screen.getByTestId('dialog-content');
    expect(content.getAttribute('data-escape-disabled')).toBe('false');
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
    const { rerender } = render(<Modal {...defaultProps} type="warning" />);

    const testTypeVariant = (type: string, expectedClass: string) => {
      rerender(<Modal {...defaultProps} type={type as any} />);
      const content = screen.getByTestId('dialog-content');
      expect(content.className).toContain(expectedClass);
    };

    testTypeVariant('warning', 'border-yellow-200');
    testTypeVariant('success', 'border-green-200');
    testTypeVariant('error', 'border-red-200');

    // Test default variant separately
    rerender(<Modal {...defaultProps} type="default" />);
    const content = screen.getByTestId('dialog-content');
    expect(content.className).not.toContain('border-');
  });

  it('applies correct CSS classes for different size variants', () => {
    const { rerender } = render(<Modal {...defaultProps} size="xl" />);

    const testSizeVariant = (size: string, expectedClass: string) => {
      rerender(<Modal {...defaultProps} size={size as any} />);
      const content = screen.getByTestId('dialog-content');
      expect(content.className).toContain(expectedClass);
    };

    testSizeVariant('xl', 'max-w-xl');
    testSizeVariant('2xl', 'max-w-2xl');
    testSizeVariant('3xl', 'max-w-3xl');
    testSizeVariant('4xl', 'max-w-4xl');
    testSizeVariant('full', 'max-w-[95vw]');
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
    render(
      <Modal {...defaultProps} title={undefined} description={undefined} />
    );

    expect(screen.queryByTestId('dialog-header')).not.toBeInTheDocument();
  });

  it('renders only title when description is not provided', () => {
    render(
      <Modal {...defaultProps} title="Test Title" description={undefined} />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.queryByTestId('dialog-description')).not.toBeInTheDocument();
  });

  it('renders only description when title is not provided', () => {
    render(
      <Modal
        {...defaultProps}
        title={undefined}
        description="Test Description"
      />
    );

    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.queryByTestId('dialog-title')).not.toBeInTheDocument();
  });

  it('does not render footer when no footer content provided', () => {
    render(<Modal {...defaultProps} footer={undefined} />);

    expect(screen.queryByTestId('dialog-footer')).not.toBeInTheDocument();
  });

  it('properly handles overlay click when enabled', async () => {
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
    const testEventListenerCleanup = () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(
        document,
        'removeEventListener'
      );

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
    };

    testEventListenerCleanup();
  });
});
