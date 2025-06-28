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

});
