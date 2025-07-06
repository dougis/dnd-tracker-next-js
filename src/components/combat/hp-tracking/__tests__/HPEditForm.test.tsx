import { screen, fireEvent, waitFor } from '@testing-library/react';
import {
  setupHPTrackingHooks,
  renderHPEditForm,
  testDamageApplication,
  testHealingApplication,
  testTemporaryHPChange,
  testFieldValidation,
  testInputValidation,
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
    await testDamageApplication(10, 65, 'Status: 65/100 (+5) = 70 effective HP');
  });

  it('handles healing application', async () => {
    renderHPEditForm();
    await testHealingApplication(15, 90, 'Status: 90/100 (+5) = 95 effective HP');
  });

  it('handles temporary HP changes', async () => {
    renderHPEditForm();
    await testTemporaryHPChange(10, 'Status: 75/100 (+10) = 85 effective HP');
  });

  it('validates current HP input', async () => {
    renderHPEditForm();
    await testFieldValidation('Current HP', '-5', 'Current HP must be at least 0');
  });

  it('validates maximum HP input', async () => {
    renderHPEditForm();
    await testFieldValidation('Maximum HP', '0', 'Maximum HP must be at least 1');
  });

  it('validates temporary HP input', async () => {
    renderHPEditForm();
    await testFieldValidation('Temporary HP', '-3', 'Temporary HP must be at least 0');
  });

  it('validates damage input', async () => {
    renderHPEditForm();
    await testInputValidation('Damage Amount', 'apply-damage-button', '-5', 'Damage must be at least 0');
  });

  it('validates healing input', async () => {
    renderHPEditForm();
    await testInputValidation('Healing Amount', 'apply-healing-button', '-10', 'Healing must be at least 0');
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
      expect(damageInput).toHaveValue('');
    });
  });

  it('resets healing input after applying', async () => {
    renderHPEditForm();

    const healingInput = screen.getByLabelText('Healing Amount');
    const applyHealingButton = screen.getByTestId('apply-healing-button');

    fireEvent.change(healingInput, { target: { value: '15' } });
    fireEvent.click(applyHealingButton);

    await waitFor(() => {
      expect(healingInput).toHaveValue('');
    });
  });

  it('handles keyboard navigation correctly', () => {
    renderHPEditForm();

    const currentHPInput = screen.getByLabelText('Current HP');
    const maxHPInput = screen.getByLabelText('Maximum HP');

    currentHPInput.focus();
    fireEvent.keyDown(currentHPInput, { key: 'Tab' });

    expect(document.activeElement).toBe(maxHPInput);
  });
});