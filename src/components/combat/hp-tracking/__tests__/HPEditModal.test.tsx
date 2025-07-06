import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HPEditModal } from '../HPEditModal';
import { setupHPTrackingTest, createTestHPParticipant, createScenarioParticipant } from '../test-helpers';

describe('HPEditModal', () => {
  const { mocks } = setupHPTrackingTest();
  const mockParticipant = createTestHPParticipant();

  it('renders HP edit modal with correct initial values', () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mocks.onSave}
        onCancel={mocks.onCancel}
      />
    );

    expect(screen.getByText('Edit HP: Test Character')).toBeInTheDocument();
    expect(screen.getByLabelText('Current HP')).toHaveValue(75);
    expect(screen.getByLabelText('Maximum HP')).toHaveValue(100);
    expect(screen.getByLabelText('Temporary HP')).toHaveValue(5);
  });

  it('displays current HP status correctly', () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mocks.onSave}
        onCancel={mocks.onCancel}
      />
    );

    expect(screen.getByText('Status: 75/100 (+5) = 80 effective HP')).toBeInTheDocument();
  });

  it('handles damage input correctly', async () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mocks.onSave}
        onCancel={mocks.onCancel}
      />
    );

    const damageInput = screen.getByLabelText('Damage Amount');
    const applyDamageButton = screen.getByTestId('apply-damage-button');

    fireEvent.change(damageInput, { target: { value: '10' } });
    fireEvent.click(applyDamageButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current HP')).toHaveValue(70);
      expect(screen.getByText('Status: 70/100 = 70 effective HP')).toBeInTheDocument();
    });
  });

  it('handles healing input correctly', async () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mocks.onSave}
        onCancel={mocks.onCancel}
      />
    );

    const healingInput = screen.getByLabelText('Healing Amount');
    const applyHealingButton = screen.getByTestId('apply-healing-button');

    fireEvent.change(healingInput, { target: { value: '15' } });
    fireEvent.click(applyHealingButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current HP')).toHaveValue(90);
      expect(screen.getByText('Status: 90/100 (+5) = 95 effective HP')).toBeInTheDocument();
    });
  });

  it('handles temporary HP correctly', async () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mocks.onSave}
        onCancel={mocks.onCancel}
      />
    );

    const tempHPInput = screen.getByLabelText('Temporary HP');
    fireEvent.change(tempHPInput, { target: { value: '10' } });

    await waitFor(() => {
      expect(screen.getByText('Status: 75/100 (+10) = 85 effective HP')).toBeInTheDocument();
    });
  });

  it('prevents current HP from going below 0', async () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mocks.onSave}
        onCancel={mocks.onCancel}
      />
    );

    const damageInput = screen.getByLabelText('Damage Amount');
    const applyDamageButton = screen.getByTestId('apply-damage-button');

    fireEvent.change(damageInput, { target: { value: '200' } });
    fireEvent.click(applyDamageButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current HP')).toHaveValue(0);
      expect(screen.getByText('Status: 0/100 = 0 effective HP')).toBeInTheDocument();
    });
  });

  it('prevents healing above maximum HP', async () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mocks.onSave}
        onCancel={mocks.onCancel}
      />
    );

    const healingInput = screen.getByLabelText('Healing Amount');
    const applyHealingButton = screen.getByTestId('apply-healing-button');

    fireEvent.change(healingInput, { target: { value: '50' } });
    fireEvent.click(applyHealingButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current HP')).toHaveValue(100);
      expect(screen.getByText('Status: 100/100 (+5) = 105 effective HP')).toBeInTheDocument();
    });
  });

  it('handles save action correctly', async () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mocks.onSave}
        onCancel={mocks.onCancel}
      />
    );

    const currentHPInput = screen.getByLabelText('Current HP');
    const saveButton = screen.getByText('Save');

    fireEvent.change(currentHPInput, { target: { value: '50' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mocks.onSave).toHaveBeenCalledWith({
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
        onSave={mocks.onSave}
        onCancel={mocks.onCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mocks.onCancel).toHaveBeenCalled();
  });

  it('shows HP threshold warnings', () => {
    const criticalParticipant = createScenarioParticipant('critical', 'Critical Character');

    render(
      <HPEditModal
        participant={criticalParticipant}
        isOpen={true}
        onSave={mocks.onSave}
        onCancel={mocks.onCancel}
      />
    );

    expect(screen.getByText('⚠️ Critical HP Level')).toBeInTheDocument();
  });

  it('validates input fields correctly', async () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={true}
        onSave={mocks.onSave}
        onCancel={mocks.onCancel}
      />
    );

    const currentHPInput = screen.getByLabelText('Current HP');
    const saveButton = screen.getByText('Save');

    // When negative value is entered, it should be automatically converted to 0
    fireEvent.change(currentHPInput, { target: { value: '-5' } });

    expect(screen.getByLabelText('Current HP')).toHaveValue(0);

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mocks.onSave).toHaveBeenCalledWith({
        currentHitPoints: 0,
        maxHitPoints: 100,
        temporaryHitPoints: 5,
      });
    });
  });

  it('does not render when closed', () => {
    render(
      <HPEditModal
        participant={mockParticipant}
        isOpen={false}
        onSave={mocks.onSave}
        onCancel={mocks.onCancel}
      />
    );

    expect(screen.queryByText('Edit HP: Test Character')).not.toBeInTheDocument();
  });
});