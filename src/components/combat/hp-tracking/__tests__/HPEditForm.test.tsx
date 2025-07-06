import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HPEditForm } from '../HPEditForm';

describe('HPEditForm', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    initialValues: {
      currentHitPoints: 75,
      maxHitPoints: 100,
      temporaryHitPoints: 5,
    },
    onSave: mockOnSave,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with initial values', () => {
    render(<HPEditForm {...defaultProps} />);

    expect(screen.getByLabelText('Current HP')).toHaveValue(75);
    expect(screen.getByLabelText('Maximum HP')).toHaveValue(100);
    expect(screen.getByLabelText('Temporary HP')).toHaveValue(5);
  });

  it('displays HP status correctly', () => {
    render(<HPEditForm {...defaultProps} />);

    expect(screen.getByText('Status: 75/100 (+5) = 80 effective HP')).toBeInTheDocument();
  });

  it('updates HP status when values change', async () => {
    render(<HPEditForm {...defaultProps} />);

    const currentHPInput = screen.getByLabelText('Current HP');
    fireEvent.change(currentHPInput, { target: { value: '90' } });

    await waitFor(() => {
      expect(screen.getByText('Status: 90/100 (+5) = 95 effective HP')).toBeInTheDocument();
    });
  });

  it('handles damage application', async () => {
    render(<HPEditForm {...defaultProps} />);

    const damageInput = screen.getByLabelText('Damage Amount');
    const applyDamageButton = screen.getByText('Apply');

    fireEvent.change(damageInput, { target: { value: '10' } });
    fireEvent.click(applyDamageButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current HP')).toHaveValue(65);
      expect(screen.getByText('Status: 65/100 (+5) = 70 effective HP')).toBeInTheDocument();
    });
  });

  it('handles healing application', async () => {
    render(<HPEditForm {...defaultProps} />);

    const healingInput = screen.getByLabelText('Healing Amount');
    const applyHealingButton = screen.getByText('Apply');

    fireEvent.change(healingInput, { target: { value: '15' } });
    fireEvent.click(applyHealingButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current HP')).toHaveValue(90);
      expect(screen.getByText('Status: 90/100 (+5) = 95 effective HP')).toBeInTheDocument();
    });
  });

  it('handles temporary HP changes', async () => {
    render(<HPEditForm {...defaultProps} />);

    const tempHPInput = screen.getByLabelText('Temporary HP');
    fireEvent.change(tempHPInput, { target: { value: '10' } });

    await waitFor(() => {
      expect(screen.getByText('Status: 75/100 (+10) = 85 effective HP')).toBeInTheDocument();
    });
  });

  it('validates current HP input', async () => {
    render(<HPEditForm {...defaultProps} />);

    const currentHPInput = screen.getByLabelText('Current HP');
    const saveButton = screen.getByText('Save');

    fireEvent.change(currentHPInput, { target: { value: '-5' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Current HP must be at least 0')).toBeInTheDocument();
    });
  });

  it('validates maximum HP input', async () => {
    render(<HPEditForm {...defaultProps} />);

    const maxHPInput = screen.getByLabelText('Maximum HP');
    const saveButton = screen.getByText('Save');

    fireEvent.change(maxHPInput, { target: { value: '0' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Maximum HP must be at least 1')).toBeInTheDocument();
    });
  });

  it('validates temporary HP input', async () => {
    render(<HPEditForm {...defaultProps} />);

    const tempHPInput = screen.getByLabelText('Temporary HP');
    const saveButton = screen.getByText('Save');

    fireEvent.change(tempHPInput, { target: { value: '-3' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Temporary HP must be at least 0')).toBeInTheDocument();
    });
  });

  it('validates damage input', async () => {
    render(<HPEditForm {...defaultProps} />);

    const damageInput = screen.getByLabelText('Damage Amount');
    const applyDamageButton = screen.getByText('Apply');

    fireEvent.change(damageInput, { target: { value: '-5' } });
    fireEvent.click(applyDamageButton);

    await waitFor(() => {
      expect(screen.getByText('Damage must be at least 0')).toBeInTheDocument();
    });
  });

  it('validates healing input', async () => {
    render(<HPEditForm {...defaultProps} />);

    const healingInput = screen.getByLabelText('Healing Amount');
    const applyHealingButton = screen.getByText('Apply');

    fireEvent.change(healingInput, { target: { value: '-10' } });
    fireEvent.click(applyHealingButton);

    await waitFor(() => {
      expect(screen.getByText('Healing must be at least 0')).toBeInTheDocument();
    });
  });

  it('calls onSave with correct values', async () => {
    render(<HPEditForm {...defaultProps} />);

    const currentHPInput = screen.getByLabelText('Current HP');
    const saveButton = screen.getByText('Save');

    fireEvent.change(currentHPInput, { target: { value: '80' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        currentHitPoints: 80,
        maxHitPoints: 100,
        temporaryHitPoints: 5,
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<HPEditForm {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows HP threshold warning for critical HP', () => {
    const criticalProps = {
      ...defaultProps,
      initialValues: {
        currentHitPoints: 20,
        maxHitPoints: 100,
        temporaryHitPoints: 0,
      },
    };

    render(<HPEditForm {...criticalProps} />);

    expect(screen.getByText('⚠️ Critical HP Level')).toBeInTheDocument();
  });

  it('shows unconscious status for 0 HP', () => {
    const unconsciousProps = {
      ...defaultProps,
      initialValues: {
        currentHitPoints: 0,
        maxHitPoints: 100,
        temporaryHitPoints: 0,
      },
    };

    render(<HPEditForm {...unconsciousProps} />);

    expect(screen.getByText('💀 Unconscious')).toBeInTheDocument();
  });

  it('resets damage input after applying', async () => {
    render(<HPEditForm {...defaultProps} />);

    const damageInput = screen.getByLabelText('Damage Amount');
    const applyDamageButton = screen.getByText('Apply');

    fireEvent.change(damageInput, { target: { value: '10' } });
    fireEvent.click(applyDamageButton);

    await waitFor(() => {
      expect(damageInput).toHaveValue('');
    });
  });

  it('resets healing input after applying', async () => {
    render(<HPEditForm {...defaultProps} />);

    const healingInput = screen.getByLabelText('Healing Amount');
    const applyHealingButton = screen.getByText('Apply');

    fireEvent.change(healingInput, { target: { value: '15' } });
    fireEvent.click(applyHealingButton);

    await waitFor(() => {
      expect(healingInput).toHaveValue('');
    });
  });

  it('handles keyboard navigation correctly', () => {
    render(<HPEditForm {...defaultProps} />);

    const currentHPInput = screen.getByLabelText('Current HP');
    const maxHPInput = screen.getByLabelText('Maximum HP');

    currentHPInput.focus();
    fireEvent.keyDown(currentHPInput, { key: 'Tab' });

    expect(document.activeElement).toBe(maxHPInput);
  });
});