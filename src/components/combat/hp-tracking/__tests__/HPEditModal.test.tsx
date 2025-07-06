import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HPEditModal } from '../HPEditModal';
import { createTestParticipant } from '@/lib/models/encounter/__tests__/test-helpers';
import { IParticipantReference } from '@/lib/models/encounter/interfaces';

describe('HPEditModal', () => {
  const mockParticipant: IParticipantReference = createTestParticipant({
    name: 'Test Character',
    maxHitPoints: 100,
    currentHitPoints: 75,
    temporaryHitPoints: 5,
  });

  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders HP edit modal with correct initial values', () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Edit HP: Test Character')).toBeInTheDocument();
    expect(screen.getByLabelText('Current HP')).toHaveValue('75');
    expect(screen.getByLabelText('Maximum HP')).toHaveValue('100');
    expect(screen.getByLabelText('Temporary HP')).toHaveValue('5');
  });

  it('displays current HP status correctly', () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Current Status: 75/100 (+5)')).toBeInTheDocument();
    expect(screen.getByText('Effective HP: 80')).toBeInTheDocument();
  });

  it('handles damage input correctly', async () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const damageInput = screen.getByLabelText('Damage Amount');
    const applyDamageButton = screen.getByText('Apply Damage');

    fireEvent.change(damageInput, { target: { value: '10' } });
    fireEvent.click(applyDamageButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current HP')).toHaveValue('65');
      expect(screen.getByText('Current Status: 65/100 (+5)')).toBeInTheDocument();
    });
  });

  it('handles healing input correctly', async () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const healingInput = screen.getByLabelText('Healing Amount');
    const applyHealingButton = screen.getByText('Apply Healing');

    fireEvent.change(healingInput, { target: { value: '15' } });
    fireEvent.click(applyHealingButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current HP')).toHaveValue('90');
      expect(screen.getByText('Current Status: 90/100 (+5)')).toBeInTheDocument();
    });
  });

  it('handles temporary HP correctly', async () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const tempHPInput = screen.getByLabelText('Temporary HP');
    fireEvent.change(tempHPInput, { target: { value: '10' } });

    await waitFor(() => {
      expect(screen.getByText('Current Status: 75/100 (+10)')).toBeInTheDocument();
      expect(screen.getByText('Effective HP: 85')).toBeInTheDocument();
    });
  });

  it('prevents current HP from going below 0', async () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const damageInput = screen.getByLabelText('Damage Amount');
    const applyDamageButton = screen.getByText('Apply Damage');

    fireEvent.change(damageInput, { target: { value: '200' } });
    fireEvent.click(applyDamageButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current HP')).toHaveValue('0');
      expect(screen.getByText('Current Status: 0/100 (+5)')).toBeInTheDocument();
    });
  });

  it('prevents healing above maximum HP', async () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const healingInput = screen.getByLabelText('Healing Amount');
    const applyHealingButton = screen.getByText('Apply Healing');

    fireEvent.change(healingInput, { target: { value: '50' } });
    fireEvent.click(applyHealingButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current HP')).toHaveValue('100');
      expect(screen.getByText('Current Status: 100/100 (+5)')).toBeInTheDocument();
    });
  });

  it('handles save action correctly', async () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const currentHPInput = screen.getByLabelText('Current HP');
    const saveButton = screen.getByText('Save Changes');

    fireEvent.change(currentHPInput, { target: { value: '50' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        currentHitPoints: 50,
        maxHitPoints: 100,
        temporaryHitPoints: 5,
      });
    });
  });

  it('handles cancel action correctly', () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows HP threshold warnings', () => {
    const criticalParticipant = createTestParticipant({
      name: 'Critical Character',
      maxHitPoints: 100,
      currentHitPoints: 20,
      temporaryHitPoints: 0,
    });

    render(
      <HPEditModal
        participant={criticalParticipant}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('⚠️ Critical HP Level')).toBeInTheDocument();
  });

  it('validates input fields correctly', async () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const currentHPInput = screen.getByLabelText('Current HP');
    const saveButton = screen.getByText('Save Changes');

    fireEvent.change(currentHPInput, { target: { value: '-5' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Current HP must be at least 0')).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('does not render when closed', () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={false}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByText('Edit HP: Test Character')).not.toBeInTheDocument();
  });
});