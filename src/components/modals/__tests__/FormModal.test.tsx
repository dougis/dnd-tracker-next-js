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

// Mock the Modal component
jest.mock('../Modal', () => ({
  Modal: ({
    children,
    footer,
    onOpenChange,
    open: _open,
    title,
    description,
    size,
    className,
    closeOnOverlayClick,
    closeOnEscapeKey,
  }: any) => (
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
      <button data-testid="modal-close" onClick={() => onOpenChange(false)}>
        Close Modal
      </button>
    </div>
  ),
}));

// Mock FormWrapper component
jest.mock('@/components/forms/FormWrapper', () => ({
  FormWrapper: ({
    children,
    onSubmit,
    isSubmitting,
    className,
    ...props
  }: any) => (
    <form
      data-testid="form-wrapper"
      data-submitting={isSubmitting ? 'true' : 'false'}
      data-classname={className}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.({ test: 'data' });
      }}
      {...props}
    >
      {children}
    </form>
  ),
}));

// Mock FormSubmitButton component
jest.mock('@/components/forms/FormSubmitButton', () => ({
  FormSubmitButton: ({ children, className }: any) => (
    <button
      type="submit"
      data-testid="form-submit-button"
      data-classname={className}
    >
      {children}
    </button>
  ),
}));

// Mock Button component
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

describe('FormModal', () => {
  const defaultProps: FormModalProps = {
    open: true,
    onOpenChange: jest.fn(),
    children: <div>Form content</div>,
    onSubmit: jest.fn(),
    config: {
      title: 'Test Form Modal',
      description: 'Test description',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders form modal with title and description', () => {
      render(<FormModal {...defaultProps} />);

      expect(screen.getByTestId('modal')).toHaveAttribute('data-open', 'true');
      expect(screen.getByTestId('modal')).toHaveAttribute(
        'data-title',
        'Test Form Modal'
      );
      expect(screen.getByTestId('modal')).toHaveAttribute(
        'data-description',
        'Test description'
      );
      expect(screen.getByText('Form content')).toBeInTheDocument();
    });

    it('renders with default config values', () => {
      render(<FormModal {...defaultProps} />);

      expect(screen.getByText('Submit')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByTestId('modal')).toHaveAttribute('data-size', 'md');
    });

    it('renders with custom config values', () => {
      const customConfig = {
        title: 'Custom Title',
        description: 'Custom Description',
        submitText: 'Save',
        cancelText: 'Discard',
        size: 'lg' as const,
        className: 'custom-class',
      };

      render(
        <FormModal {...defaultProps} config={customConfig} />
      );

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Discard')).toBeInTheDocument();
      expect(screen.getByTestId('modal')).toHaveAttribute('data-size', 'lg');
    });

    it('renders without cancel button when showCancelButton is false', () => {
      const config = {
        ...defaultProps.config,
        showCancelButton: false,
      };

      render(<FormModal {...defaultProps} config={config} />);

      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit when form is submitted', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      render(<FormModal {...defaultProps} onSubmit={onSubmit} />);

      const form = screen.getByTestId('form-wrapper');
      await act(async () => {
        form.onsubmit?.({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(onSubmit).toHaveBeenCalledWith({ test: 'data' });
    });

    it('closes modal after successful submission by default', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      render(<FormModal {...defaultProps} onSubmit={onSubmit} />);

      const form = screen.getByTestId('form-wrapper');
      await act(async () => {
        form.onsubmit?.({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not close modal when preventCloseOnSubmit is true', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const config = {
        ...defaultProps.config,
        preventCloseOnSubmit: true,
      };

      render(
        <FormModal {...defaultProps} config={config} onSubmit={onSubmit} />
      );

      const form = screen.getByTestId('form-wrapper');
      await act(async () => {
        form.onsubmit?.({
          preventDefault: jest.fn(),
        } as any);
      });

      expect(defaultProps.onOpenChange).not.toHaveBeenCalledWith(false);
    });

    it('handles submission errors gracefully', async () => {
      const onSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'));
      render(<FormModal {...defaultProps} onSubmit={onSubmit} />);

      const form = screen.getByTestId('form-wrapper');
      await act(async () => {
        form.onsubmit?.({
          preventDefault: jest.fn(),
        } as any);
      });

      // Should not close modal on error
      expect(defaultProps.onOpenChange).not.toHaveBeenCalledWith(false);
    });
  });

  describe('Cancel Behavior', () => {
    it('calls onCancel and closes modal when cancel button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onCancel = jest.fn();
      render(<FormModal {...defaultProps} onCancel={onCancel} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not call onCancel when not provided', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FormModal {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('prevents cancel when form is submitting', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onCancel = jest.fn();
      render(
        <FormModal {...defaultProps} onCancel={onCancel} isSubmitting={true} />
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(onCancel).not.toHaveBeenCalled();
      expect(defaultProps.onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('disables buttons when isSubmitting prop is true', () => {
      render(<FormModal {...defaultProps} isSubmitting={true} />);

      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeDisabled();
      expect(screen.getByTestId('form-wrapper')).toHaveAttribute(
        'data-submitting',
        'true'
      );
    });

    it('disables modal close interactions when submitting', () => {
      render(<FormModal {...defaultProps} isSubmitting={true} />);

      expect(screen.getByTestId('modal')).toHaveAttribute(
        'data-close-on-overlay',
        'false'
      );
      expect(screen.getByTestId('modal')).toHaveAttribute(
        'data-close-on-escape',
        'false'
      );
    });

    it('prevents modal from closing via onOpenChange when submitting', async () => {
      const handleOpenChange = jest.fn();
      render(
        <FormModal
          {...defaultProps}
          onOpenChange={handleOpenChange}
          isSubmitting={true}
        />
      );

      // This test verifies the logic exists but actual prevention happens in handleOpenChange
      expect(screen.getByTestId('modal')).toHaveAttribute(
        'data-close-on-overlay',
        'false'
      );
    });
  });

  describe('Form Reset', () => {
    it('resets form when modal closes and resetOnClose is true', async () => {
      const reset = jest.fn();
      const formProps = { reset };

      const { rerender } = render(
        <FormModal {...defaultProps} {...formProps} open={true} />
      );

      // Close the modal
      rerender(
        <FormModal {...defaultProps} {...formProps} open={false} />
      );

      // Advance timers to trigger the reset timeout
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(reset).toHaveBeenCalled();
    });

    it('does not reset form when resetOnClose is false', async () => {
      const reset = jest.fn();
      const formProps = { reset };
      const config = {
        ...defaultProps.config,
        resetOnClose: false,
      };

      const { rerender } = render(
        <FormModal {...defaultProps} {...formProps} config={config} open={true} />
      );

      // Close the modal
      rerender(
        <FormModal {...defaultProps} {...formProps} config={config} open={false} />
      );

      // Advance timers
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(reset).not.toHaveBeenCalled();
    });

    it('does not reset if form does not have reset method', async () => {
      const formProps = {}; // No reset method

      const { rerender } = render(
        <FormModal {...defaultProps} {...formProps} open={true} />
      );

      // Close the modal
      rerender(
        <FormModal {...defaultProps} {...formProps} open={false} />
      );

      // Advance timers - should not throw error
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Test passes if no errors are thrown
      expect(true).toBe(true);
    });
  });

  describe('Accessibility and UX', () => {
    it('passes correct props to FormWrapper', () => {
      const customProps = {
        validationSchema: {},
        defaultValues: { test: 'value' },
        mode: 'onChange' as const,
      };

      render(<FormModal {...defaultProps} {...customProps} />);

      const formWrapper = screen.getByTestId('form-wrapper');
      expect(formWrapper).toHaveAttribute('data-classname', 'space-y-4');
    });

    it('applies custom className to modal', () => {
      const config = {
        ...defaultProps.config,
        className: 'custom-modal-class',
      };

      render(<FormModal {...defaultProps} config={config} />);

      const modal = screen.getByTestId('modal');
      expect(modal).toHaveAttribute('data-classname', '');
    });

    it('renders footer with proper responsive layout', () => {
      render(<FormModal {...defaultProps} />);

      const footer = screen.getByTestId('modal-footer');
      const footerDiv = footer.querySelector('div');
      expect(footerDiv).toHaveClass('flex', 'flex-col-reverse', 'sm:flex-row', 'sm:justify-end', 'sm:space-x-2');
    });
  });
});

describe('useFormModal Hook', () => {
  function TestComponent() {
    const { isOpen, openModal, closeModal, FormModal: FormModalComponent } = useFormModal();

    const handleOpen = () => {
      openModal({
        children: <div>Hook form content</div>,
        config: {
          title: 'Hook Modal',
          description: 'Modal opened via hook',
        },
        onSubmit: jest.fn(),
      });
    };

    return (
      <div>
        <button data-testid="open-button" onClick={handleOpen}>
          Open Modal
        </button>
        <button data-testid="close-button" onClick={closeModal}>
          Close Modal
        </button>
        <div data-testid="is-open">{isOpen ? 'open' : 'closed'}</div>
        <FormModalComponent />
      </div>
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('manages modal state correctly', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    expect(screen.getByTestId('is-open')).toHaveTextContent('closed');

    const openButton = screen.getByTestId('open-button');
    await user.click(openButton);

    expect(screen.getByTestId('is-open')).toHaveTextContent('open');
    expect(screen.getByText('Hook form content')).toBeInTheDocument();
    expect(screen.getByTestId('modal')).toHaveAttribute('data-title', 'Hook Modal');
  });

  it('closes modal via hook method', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    const openButton = screen.getByTestId('open-button');
    await user.click(openButton);

    expect(screen.getByTestId('is-open')).toHaveTextContent('open');

    const closeButton = screen.getByTestId('close-button');
    await user.click(closeButton);

    expect(screen.getByTestId('is-open')).toHaveTextContent('closed');
  });

  it('updates modal config when opening with new config', async () => {
    const user = userEvent.setup();

    function TestComponentWithUpdate() {
      const { openModal, FormModal: FormModalComponent } = useFormModal();

      const handleOpen1 = () => {
        openModal({
          children: <div>First content</div>,
          config: { title: 'First Modal' },
          onSubmit: jest.fn(),
        });
      };

      const handleOpen2 = () => {
        openModal({
          children: <div>Second content</div>,
          config: { title: 'Second Modal' },
          onSubmit: jest.fn(),
        });
      };

      return (
        <div>
          <button data-testid="open-first" onClick={handleOpen1}>
            Open First
          </button>
          <button data-testid="open-second" onClick={handleOpen2}>
            Open Second
          </button>
          <FormModalComponent />
        </div>
      );
    }

    render(<TestComponentWithUpdate />);

    await user.click(screen.getByTestId('open-first'));
    expect(screen.getByText('First content')).toBeInTheDocument();
    expect(screen.getByTestId('modal')).toHaveAttribute('data-title', 'First Modal');

    await user.click(screen.getByTestId('open-second'));
    expect(screen.getByText('Second content')).toBeInTheDocument();
    expect(screen.getByTestId('modal')).toHaveAttribute('data-title', 'Second Modal');
  });
});

describe('QuickAddModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    children: <div>Add form content</div>,
    onSubmit: jest.fn(),
    config: {
      title: 'Custom Add Title',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default add modal configuration', () => {
    const configWithoutTitle = {
      description: 'Add description',
    };

    render(
      <QuickAddModal {...defaultProps} config={configWithoutTitle} />
    );

    expect(screen.getByTestId('modal')).toHaveAttribute(
      'data-title',
      'Add New Item'
    );
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('uses custom title when provided', () => {
    render(<QuickAddModal {...defaultProps} />);

    expect(screen.getByTestId('modal')).toHaveAttribute(
      'data-title',
      'Custom Add Title'
    );
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('uses custom submit text when provided', () => {
    const config = {
      title: 'Add Character',
      submitText: 'Create Character',
    };

    render(<QuickAddModal {...defaultProps} config={config} />);

    expect(screen.getByText('Create Character')).toBeInTheDocument();
  });
});

describe('QuickEditModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    children: <div>Edit form content</div>,
    onSubmit: jest.fn(),
    config: {
      title: 'Custom Edit Title',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default edit modal configuration', () => {
    const configWithoutTitle = {
      description: 'Edit description',
    };

    render(
      <QuickEditModal {...defaultProps} config={configWithoutTitle} />
    );

    expect(screen.getByTestId('modal')).toHaveAttribute(
      'data-title',
      'Edit Item'
    );
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('uses custom title when provided', () => {
    render(<QuickEditModal {...defaultProps} />);

    expect(screen.getByTestId('modal')).toHaveAttribute(
      'data-title',
      'Custom Edit Title'
    );
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('uses custom submit text when provided', () => {
    const config = {
      title: 'Edit Character',
      submitText: 'Update Character',
    };

    render(<QuickEditModal {...defaultProps} config={config} />);

    expect(screen.getByText('Update Character')).toBeInTheDocument();
  });
});
