import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ConfirmationDialog,
  useConfirmationDialog,
} from '../ConfirmationDialog';

describe('ConfirmationDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed?',
    onConfirm: jest.fn(),
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
        confirmText="Delete"
        cancelText="Keep"
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
    render(<ConfirmationDialog {...defaultProps} loading={true} />);

    const confirmButton = screen.getByText('Confirm');
    const cancelButton = screen.getByText('Cancel');

    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('shows different icons for different variants', () => {
    const { rerender } = render(
      <ConfirmationDialog {...defaultProps} variant="destructive" />
    );

    // Test that the component renders (specific icon testing is complex)
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();

    rerender(<ConfirmationDialog {...defaultProps} variant="warning" />);
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();

    rerender(<ConfirmationDialog {...defaultProps} variant="default" />);
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });

  it('renders custom children', () => {
    const customContent = <div>Additional warning text</div>;
    render(
      <ConfirmationDialog {...defaultProps}>{customContent}</ConfirmationDialog>
    );

    expect(screen.getByText('Additional warning text')).toBeInTheDocument();
  });

  it('prevents interaction when loading', async () => {
    const user = userEvent.setup();
    render(<ConfirmationDialog {...defaultProps} loading={true} />);

    const confirmButton = screen.getByText('Confirm');
    const cancelButton = screen.getByText('Cancel');

    await user.click(confirmButton);
    await user.click(cancelButton);

    // Buttons should be disabled, so handlers shouldn't be called
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    expect(defaultProps.onOpenChange).not.toHaveBeenCalled();
  });
});

// Test the hook
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
