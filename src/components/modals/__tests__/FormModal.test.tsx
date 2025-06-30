import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, act } from './test-utils';
import {
  FormModal,
  useFormModal,
  QuickAddModal,
  QuickEditModal,
} from '../FormModal';
import type { FormModalProps } from '../FormModal';

// Mock components
jest.mock('../Modal', () => ({
  Modal: ({ children, footer, onOpenChange, open: _open, title, description, size, className, closeOnOverlayClick, closeOnEscapeKey }: any) => (
    <div
      data-testid="modal"
      data-open={_open ? 'true' : 'false'}
      data-title={title}
      data-description={description}
      data-size={size}
      data-classname={className}
      data-close-on-overlay={closeOnOverlayClick ? 'true' : 'false'}
      data-close-on-escape={closeOnEscapeKey ? 'true' : 'false'}
    >
      <div data-testid="modal-content">{children}</div>
      <div data-testid="modal-footer">{footer}</div>
      <button data-testid="modal-close" onClick={() => onOpenChange(false)}>Close Modal</button>
    </div>
  ),
}));

jest.mock('@/components/forms/FormWrapper', () => ({
  FormWrapper: ({ children, onSubmit, isSubmitting, className, ...props }: any) => (
    <form
      data-testid="form-wrapper"
      data-submitting={isSubmitting ? 'true' : 'false'}
      data-classname={className}
      onSubmit={(e) => { e.preventDefault(); onSubmit?.({ test: 'data' }); }}
      {...props}
    >
      {children}
    </form>
  ),
}));

jest.mock('@/components/forms/FormSubmitButton', () => ({
  FormSubmitButton: ({ children, className }: any) => (
    <button type="submit" data-testid="form-submit-button" data-classname={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, className, type }: any) => (
    <button
      type={type}
      data-testid="button"
      data-variant={variant}
      data-classname={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

// Test utilities
const createDefaultProps = (overrides: Partial<FormModalProps> = {}): FormModalProps => ({
  open: true,
  onOpenChange: jest.fn(),
  children: <div>Form content</div>,
  onSubmit: jest.fn(),
  config: {
    title: 'Test Form Modal',
    description: 'Test description',
  },
  ...overrides,
});

const renderFormModal = (props: Partial<FormModalProps> = {}) => {
  const defaultProps = createDefaultProps(props);
  return render(<FormModal {...defaultProps} />);
};

describe('FormModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders with title, description and default config', () => {
      renderFormModal();

      expect(screen.getByTestId('modal')).toHaveAttribute('data-open', 'true');
      expect(screen.getByTestId('modal')).toHaveAttribute('data-title', 'Test Form Modal');
      expect(screen.getByTestId('modal')).toHaveAttribute('data-description', 'Test description');
      expect(screen.getByText('Form content')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('renders with custom config values', () => {
      renderFormModal({
        config: {
          title: 'Custom Title',
          submitText: 'Save',
          cancelText: 'Discard',
          size: 'lg',
          showCancelButton: false,
        },
      });

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
      expect(screen.getByTestId('modal')).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('Form Submission', () => {
    it('handles successful submission and closes modal', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const onOpenChange = jest.fn();
      renderFormModal({ onSubmit, onOpenChange });

      const form = screen.getByTestId('form-wrapper');
      await act(async () => {
        form.onsubmit?.({ preventDefault: jest.fn() } as any);
      });

      expect(onSubmit).toHaveBeenCalledWith({ test: 'data' });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('prevents close when preventCloseOnSubmit is true', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const onOpenChange = jest.fn();
      renderFormModal({
        onSubmit,
        onOpenChange,
        config: { title: 'Test', preventCloseOnSubmit: true },
      });

      const form = screen.getByTestId('form-wrapper');
      await act(async () => {
        form.onsubmit?.({ preventDefault: jest.fn() } as any);
      });

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });

    it('handles submission errors gracefully', async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'));
      const onOpenChange = jest.fn();
      renderFormModal({ onSubmit, onOpenChange });

      const form = screen.getByTestId('form-wrapper');
      await act(async () => {
        form.onsubmit?.({ preventDefault: jest.fn() } as any);
      });

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });
  });

  describe('User Interactions', () => {
    it('handles cancel button click', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onCancel = jest.fn();
      const onOpenChange = jest.fn();
      renderFormModal({ onCancel, onOpenChange });

      await user.click(screen.getByText('Cancel'));

      expect(onCancel).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('prevents actions when submitting', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onCancel = jest.fn();
      renderFormModal({ onCancel, isSubmitting: true });

      await user.click(screen.getByText('Cancel'));

      expect(onCancel).not.toHaveBeenCalled();
      expect(screen.getByTestId('modal')).toHaveAttribute('data-close-on-overlay', 'false');
      expect(screen.getByTestId('modal')).toHaveAttribute('data-close-on-escape', 'false');
    });
  });

  describe('Form Reset', () => {
    it('resets form when modal closes and resetOnClose is true', async () => {
      const reset = jest.fn();
      const { rerender } = render(
        <FormModal {...createDefaultProps({ reset, open: true })} />
      );

      rerender(<FormModal {...createDefaultProps({ reset, open: false })} />);

      act(() => { jest.advanceTimersByTime(200); });

      expect(reset).toHaveBeenCalled();
    });

    it('does not reset when resetOnClose is false', async () => {
      const reset = jest.fn();
      const { rerender } = render(
        <FormModal {...createDefaultProps({ reset, open: true, config: { title: 'Test', resetOnClose: false } })} />
      );

      rerender(<FormModal {...createDefaultProps({ reset, open: false, config: { title: 'Test', resetOnClose: false } })} />);

      act(() => { jest.advanceTimersByTime(200); });

      expect(reset).not.toHaveBeenCalled();
    });
  });
});

describe('useFormModal Hook', () => {
  function TestComponent() {
    const { isOpen, openModal, closeModal, FormModal: FormModalComponent } = useFormModal();

    return (
      <div>
        <button
          data-testid="open-button"
          onClick={() => openModal({
            children: <div>Hook content</div>,
            config: { title: 'Hook Modal' },
            onSubmit: jest.fn(),
          })}
        >
          Open
        </button>
        <button data-testid="close-button" onClick={closeModal}>Close</button>
        <div data-testid="is-open">{isOpen ? 'open' : 'closed'}</div>
        <FormModalComponent />
      </div>
    );
  }

  it('manages modal state correctly', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    expect(screen.getByTestId('is-open')).toHaveTextContent('closed');

    await user.click(screen.getByTestId('open-button'));
    expect(screen.getByTestId('is-open')).toHaveTextContent('open');
    expect(screen.getByText('Hook content')).toBeInTheDocument();

    await user.click(screen.getByTestId('close-button'));
    expect(screen.getByTestId('is-open')).toHaveTextContent('closed');
  });
});

describe('Quick Modal Variants', () => {
  const quickModalProps = {
    open: true,
    onOpenChange: jest.fn(),
    children: <div>Quick modal content</div>,
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('QuickAddModal', () => {
    it('renders with default add configuration', () => {
      render(<QuickAddModal {...quickModalProps} config={{ description: 'Add description' }} />);

      expect(screen.getByTestId('modal')).toHaveAttribute('data-title', 'Add New Item');
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    it('uses custom title and submit text', () => {
      render(
        <QuickAddModal
          {...quickModalProps}
          config={{ title: 'Add Character', submitText: 'Create' }}
        />
      );

      expect(screen.getByTestId('modal')).toHaveAttribute('data-title', 'Add Character');
      expect(screen.getByText('Create')).toBeInTheDocument();
    });
  });

  describe('QuickEditModal', () => {
    it('renders with default edit configuration', () => {
      render(<QuickEditModal {...quickModalProps} config={{ description: 'Edit description' }} />);

      expect(screen.getByTestId('modal')).toHaveAttribute('data-title', 'Edit Item');
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('uses custom title and submit text', () => {
      render(
        <QuickEditModal
          {...quickModalProps}
          config={{ title: 'Edit Character', submitText: 'Update' }}
        />
      );

      expect(screen.getByTestId('modal')).toHaveAttribute('data-title', 'Edit Character');
      expect(screen.getByText('Update')).toBeInTheDocument();
    });
  });
});
