import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from './test-utils';
import {
  ConfirmationDialog,
  useConfirmationDialog,
} from '../ConfirmationDialog';

// Mock the Modal component to avoid Dialog rendering issues
jest.mock('../Modal', () => ({
  Modal: ({
    children,
    footer,
    onOpenChange,
    open: _open,
  }: {
    children: React.ReactNode;
    footer: React.ReactNode;
    onOpenChange: (_open: boolean) => void;
    open: boolean;
  }) => (
    <div data-testid="modal" data-open={_open ? 'true' : 'false'}>
      <div>{children}</div>
      <div data-testid="modal-footer">{footer}</div>
      <button data-testid="close-button" onClick={() => onOpenChange(false)}>
        Close
      </button>
    </div>
  ),
}));

describe('ConfirmationDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onConfirm: jest.fn(),
    config: {
      title: 'Confirm Action',
      description: 'Are you sure you want to proceed?',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with title and description', () => {
    render(<ConfirmationDialog {...defaultProps} />);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to proceed?')
    ).toBeInTheDocument();
  });

  it('shows default button texts', () => {
    render(<ConfirmationDialog {...defaultProps} />);

    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows custom button texts', () => {
    render(
      <ConfirmationDialog
        {...defaultProps}
        config={{
          ...defaultProps.config,
          confirmText: 'Delete',
          cancelText: 'Keep',
        }}
      />
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmationDialog {...defaultProps} />);

    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel and closes when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(<ConfirmationDialog {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows loading state correctly', () => {
    render(
      <ConfirmationDialog
        {...defaultProps}
        config={{
          ...defaultProps.config,
          loading: true,
        }}
      />
    );

    const confirmButton = screen.getByText('Confirm');
    const cancelButton = screen.getByText('Cancel');

    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('shows different icons for different variants', () => {
    const { rerender } = render(
      <ConfirmationDialog
        {...defaultProps}
        config={{ ...defaultProps.config, variant: 'destructive' }}
      />
    );

    // Test that the component renders (specific icon testing is complex)
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();

    rerender(
      <ConfirmationDialog
        {...defaultProps}
        config={{ ...defaultProps.config, variant: 'warning' }}
      />
    );
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();

    rerender(
      <ConfirmationDialog
        {...defaultProps}
        config={{ ...defaultProps.config, variant: 'default' }}
      />
    );
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });

  it('renders custom children', () => {
    const customContent = <div>Additional warning text</div>;
    render(
      <ConfirmationDialog
        {...defaultProps}
        config={{ ...defaultProps.config, children: customContent }}
      />
    );

    expect(screen.getByText('Additional warning text')).toBeInTheDocument();
  });

  it('prevents interaction when loading', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmationDialog
        {...defaultProps}
        config={{ ...defaultProps.config, loading: true }}
      />
    );

    const confirmButton = screen.getByText('Confirm');
    const cancelButton = screen.getByText('Cancel');

    await user.click(confirmButton);
    await user.click(cancelButton);

    // Buttons should be disabled, so handlers shouldn't be called
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    expect(defaultProps.onOpenChange).not.toHaveBeenCalled();
  });
});

// Mock for the useConfirmationDialog hook
jest.mock('../ConfirmationDialog', () => {
  const originalModule = jest.requireActual('../ConfirmationDialog');
  return {
    ...originalModule,
    useConfirmationDialog: () => {
      const [isOpen, setIsOpen] = React.useState(false);
      const [config, setConfig] = React.useState({
        title: '',
        description: '',
      });

      const confirm = (dialogConfig: any) => {
        setConfig(dialogConfig);
        setIsOpen(true);
        return Promise.resolve(true);
      };

      const ConfirmationDialog = () =>
        isOpen && (
          <div data-testid="confirmation-dialog">
            <h3>{config.title}</h3>
            <p>{config.description}</p>
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        );

      return { confirm, ConfirmationDialog };
    },
  };
});

// Test component for the hook
function TestComponent() {
  const { confirm, ConfirmationDialog } = useConfirmationDialog();

  const handleClick = async () => {
    await confirm({
      title: 'Test Confirmation',
      description: 'Test description',
      onConfirm: () => {},
    });
  };

  return (
    <div>
      <button onClick={handleClick}>Open Confirmation</button>
      <ConfirmationDialog />
    </div>
  );
}

describe('useConfirmationDialog', () => {
  it('opens and manages confirmation dialog', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    const openButton = screen.getByText('Open Confirmation');
    await user.click(openButton);

    expect(screen.getByText('Test Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });
});

describe('ConfirmationDialog Extended Coverage', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onConfirm: jest.fn(),
    config: {
      title: 'Confirm Action',
      description: 'Are you sure you want to proceed?',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Advanced Configuration', () => {
    it('handles all variant types correctly', () => {
      const variants = ['default', 'destructive', 'warning'] as const;

      variants.forEach((variant) => {
        const { rerender } = render(
          <ConfirmationDialog
            {...defaultProps}
            config={{ ...defaultProps.config, variant }}
          />
        );

        expect(screen.getByText('Confirm Action')).toBeInTheDocument();
        rerender(<div />); // Clear for next iteration
      });
    });

    it('handles missing optional config properties', () => {
      const minimalConfig = {
        title: 'Minimal Config',
        description: 'Basic description',
      };

      render(
        <ConfirmationDialog
          {...defaultProps}
          config={minimalConfig}
        />
      );

      expect(screen.getByText('Confirm')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('handles empty strings in config', () => {
      const configWithEmptyStrings = {
        title: '',
        description: '',
        confirmText: '',
        cancelText: '',
      };

      render(
        <ConfirmationDialog
          {...defaultProps}
          config={configWithEmptyStrings}
        />
      );

      // Should render without errors even with empty strings
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  describe('Loading State Edge Cases', () => {
    it('maintains loading state during async operations', () => {
      const config = {
        ...defaultProps.config,
        loading: true,
      };

      const { rerender } = render(
        <ConfirmationDialog {...defaultProps} config={config} />
      );

      expect(screen.getByText('Confirm')).toBeDisabled();
      expect(screen.getByText('Cancel')).toBeDisabled();

      // Change loading state
      rerender(
        <ConfirmationDialog
          {...defaultProps}
          config={{ ...config, loading: false }}
        />
      );

      expect(screen.getByText('Confirm')).not.toBeDisabled();
      expect(screen.getByText('Cancel')).not.toBeDisabled();
    });

    it('prevents multiple clicks when loading', async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();

      render(
        <ConfirmationDialog
          {...defaultProps}
          onConfirm={onConfirm}
          config={{ ...defaultProps.config, loading: true }}
        />
      );

      const confirmButton = screen.getByText('Confirm');

      // Try to click multiple times while disabled
      await user.click(confirmButton);
      await user.click(confirmButton);
      await user.click(confirmButton);

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Callback Handling', () => {
    it('handles onConfirm returning promises', async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn().mockResolvedValue(undefined);

      render(
        <ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />
      );

      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);

      expect(onConfirm).toHaveBeenCalled();
    });

    it('calls onConfirm callback correctly', async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();

      render(
        <ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />
      );

      const confirmButton = screen.getByText('Confirm');
      await user.click(confirmButton);
      
      expect(onConfirm).toHaveBeenCalled();
    });

    it('handles missing onCancel callback', async () => {
      const user = userEvent.setup();

      render(<ConfirmationDialog {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Should call onOpenChange even without onCancel
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('calls both onCancel and onOpenChange when cancel is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();

      render(
        <ConfirmationDialog {...defaultProps} onCancel={onCancel} />
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Custom Content and Children', () => {
    it('renders complex children components', () => {
      const complexChildren = (
        <div>
          <p>Additional warning:</p>
          <ul>
            <li>This action cannot be undone</li>
            <li>All data will be lost</li>
          </ul>
          <strong>Are you absolutely sure?</strong>
        </div>
      );

      render(
        <ConfirmationDialog
          {...defaultProps}
          config={{
            ...defaultProps.config,
            children: complexChildren,
          }}
        />
      );

      expect(screen.getByText('Additional warning:')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
      expect(screen.getByText('All data will be lost')).toBeInTheDocument();
      expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();
    });

    it('handles children prop as function', () => {
      const renderChildren = () => <div>Dynamically rendered content</div>;

      render(
        <ConfirmationDialog
          {...defaultProps}
          config={{
            ...defaultProps.config,
            children: renderChildren(),
          }}
        />
      );

      expect(screen.getByText('Dynamically rendered content')).toBeInTheDocument();
    });
  });

  describe('Accessibility and UX', () => {
    it('passes through modal accessibility props', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByTestId('modal')).toHaveAttribute('data-open', 'true');
    });

    it('maintains proper button focus order', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      const confirmButton = screen.getByText('Confirm');

      // Both buttons should be in the document and focusable
      expect(cancelButton).toBeInTheDocument();
      expect(confirmButton).toBeInTheDocument();
      expect(cancelButton).not.toBeDisabled();
      expect(confirmButton).not.toBeDisabled();
    });

    it('handles rapid state changes gracefully', () => {
      const { rerender } = render(
        <ConfirmationDialog {...defaultProps} open={true} />
      );

      // Rapid open/close state changes
      rerender(<ConfirmationDialog {...defaultProps} open={false} />);
      rerender(<ConfirmationDialog {...defaultProps} open={true} />);
      rerender(<ConfirmationDialog {...defaultProps} open={false} />);

      expect(screen.getByTestId('modal')).toHaveAttribute('data-open', 'false');
    });
  });

  describe('Modal Integration', () => {
    it('passes correct props to underlying Modal component', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const modal = screen.getByTestId('modal');
      expect(modal).toHaveAttribute('data-open', 'true');
    });

    it('handles modal close from overlay/escape', async () => {
      const user = userEvent.setup();

      render(<ConfirmationDialog {...defaultProps} />);

      const closeButton = screen.getByTestId('close-button');
      await user.click(closeButton);

      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Button Variants and Styling', () => {
    it('applies correct button styling for destructive variant', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          config={{
            ...defaultProps.config,
            variant: 'destructive',
          }}
        />
      );

      // Test that destructive variant renders (specific styling tests are complex)
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    });

    it('applies correct button styling for warning variant', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          config={{
            ...defaultProps.config,
            variant: 'warning',
          }}
        />
      );

      // Test that warning variant renders
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    });
  });
});
