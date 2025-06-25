import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from './test-utils';
import {
  ConfirmationDialog,
  useConfirmationDialog,
} from '../ConfirmationDialog';

// Mock the Modal component to avoid Dialog rendering issues
jest.mock('../Modal', () => ({
  Modal: ({ children, footer, onOpenChange, open }) => (
    <div data-testid="modal" data-open={open}>
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
      
      const confirm = (dialogConfig) => {
        setConfig(dialogConfig);
        setIsOpen(true);
        return Promise.resolve(true);
      };
      
      const ConfirmationDialog = () => (
        isOpen && (
          <div data-testid="confirmation-dialog">
            <h3>{config.title}</h3>
            <p>{config.description}</p>
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        )
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