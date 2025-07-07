import { screen, fireEvent, waitFor } from '@testing-library/react';
import {
  setupHPTrackingHooks,
  renderHPEditForm,
  testDamageApplication,
  testHealingApplication,
  testTemporaryHPChange,
  expectHPInputValues,
  expectHPStatus,
  expectHPSaveCall,
  TEST_SCENARIOS
} from '../test-helpers';

describe('HPEditForm', () => {
  const { mocks: _mocks } = setupHPTrackingHooks();

  it('renders form with initial values', () => {
    renderHPEditForm();
    expectHPInputValues(75, 100, 5);
  });

  it('displays HP status correctly', () => {
    renderHPEditForm();
    expectHPStatus(75, 100, 5);
  });

  it('updates HP status when values change', async () => {
    renderHPEditForm();

    const currentHPInput = screen.getByLabelText('Current HP');
    fireEvent.change(currentHPInput, { target: { value: '90' } });

    await waitFor(() => {
      expectHPStatus(90, 100, 5);
    });
  });

  it('handles damage application', async () => {
    renderHPEditForm();
    await testDamageApplication(10, 70, 'Status: 70/100 = 70 effective HP');
  });

  it('handles healing application', async () => {
    renderHPEditForm();
    await testHealingApplication(15, 90, 'Status: 90/100 (+5) = 95 effective HP');
  });

  it('handles temporary HP changes', async () => {
    renderHPEditForm();
    await testTemporaryHPChange(10, 'Status: 75/100 (+10) = 85 effective HP');
  });

  it('prevents current HP from going below 0', async () => {
    renderHPEditForm();

    const currentHPInput = screen.getByLabelText('Current HP');
    fireEvent.change(currentHPInput, { target: { value: '-5' } });

    await waitFor(() => {
      expect(currentHPInput).toHaveValue(0);
    });
  });

  it('prevents maximum HP from going below 1', async () => {
    renderHPEditForm();

    const maxHPInput = screen.getByLabelText('Maximum HP');
    fireEvent.change(maxHPInput, { target: { value: '0' } });

    await waitFor(() => {
      expect(maxHPInput).toHaveValue(1);
    });
  });

  it('prevents temporary HP from going below 0', async () => {
    renderHPEditForm();

    const tempHPInput = screen.getByLabelText('Temporary HP');
    fireEvent.change(tempHPInput, { target: { value: '-3' } });

    await waitFor(() => {
      expect(tempHPInput).toHaveValue(0);
    });
  });

  it('validates damage input', async () => {
    renderHPEditForm();

    const damageInput = screen.getByLabelText('Damage Amount');
    const applyButton = screen.getByTestId('apply-damage-button');
    const statusText = screen.getByText('Status: 75/100 (+5) = 80 effective HP');

    fireEvent.change(damageInput, { target: { value: '-5' } });
    fireEvent.click(applyButton);

    // When validation fails, HP should not change and input should retain value
    await waitFor(() => {
      expect(statusText).toBeInTheDocument(); // HP status unchanged
      expect(damageInput).toHaveValue(-5); // Input retains invalid value
    });
  });

  it('validates healing input', async () => {
    renderHPEditForm();

    const healingInput = screen.getByLabelText('Healing Amount');
    const applyButton = screen.getByTestId('apply-healing-button');
    const statusText = screen.getByText('Status: 75/100 (+5) = 80 effective HP');

    fireEvent.change(healingInput, { target: { value: '-10' } });
    fireEvent.click(applyButton);

    // When validation fails, HP should not change and input should retain value
    await waitFor(() => {
      expect(statusText).toBeInTheDocument(); // HP status unchanged
      expect(healingInput).toHaveValue(-10); // Input retains invalid value
    });
  });

  it('calls onSave with correct values', async () => {
    const { mocks } = renderHPEditForm();

    const currentHPInput = screen.getByLabelText('Current HP');
    const saveButton = screen.getByText('Save');

    fireEvent.change(currentHPInput, { target: { value: '80' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expectHPSaveCall(mocks.onSave, 80, 100, 5);
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const { mocks } = renderHPEditForm();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mocks.onCancel).toHaveBeenCalled();
  });

  it('shows HP threshold warning for critical HP', () => {
    renderHPEditForm({
      initialValues: TEST_SCENARIOS.critical
    });

    expect(screen.getByText('⚠️ Critical HP Level')).toBeInTheDocument();
  });

  it('shows unconscious status for 0 HP', () => {
    renderHPEditForm({
      initialValues: TEST_SCENARIOS.unconscious
    });

    expect(screen.getByText('💀 Unconscious')).toBeInTheDocument();
  });

  it('resets damage input after applying', async () => {
    renderHPEditForm();

    const damageInput = screen.getByLabelText('Damage Amount');
    const applyDamageButton = screen.getByTestId('apply-damage-button');

    fireEvent.change(damageInput, { target: { value: '10' } });
    fireEvent.click(applyDamageButton);

    await waitFor(() => {
      expect(damageInput).toHaveValue(null);
    });
  });

  it('resets healing input after applying', async () => {
    renderHPEditForm();

    const healingInput = screen.getByLabelText('Healing Amount');
    const applyHealingButton = screen.getByTestId('apply-healing-button');

    fireEvent.change(healingInput, { target: { value: '15' } });
    fireEvent.click(applyHealingButton);

    await waitFor(() => {
      expect(healingInput).toHaveValue(null);
    });
  });

  it('handles keyboard navigation correctly', () => {
    renderHPEditForm();

    const currentHPInput = screen.getByLabelText('Current HP');
    const maxHPInput = screen.getByLabelText('Maximum HP');

    // Test that inputs can receive focus
    currentHPInput.focus();
    expect(document.activeElement).toBe(currentHPInput);

    maxHPInput.focus();
    expect(document.activeElement).toBe(maxHPInput);
  });
});