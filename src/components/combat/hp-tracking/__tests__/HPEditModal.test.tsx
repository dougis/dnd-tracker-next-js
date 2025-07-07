import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HPEditModal } from '../HPEditModal';
import {
  setupHPTrackingHooks,
  createTestHPParticipant,
  createScenarioParticipant,
  renderHPEditModal,
  testDamageApplication,
  testHealingApplication,
  testTemporaryHPChange,
  expectHPInputValues,
  expectHPStatus,
  expectHPSaveCall,
} from '../test-helpers';

describe('HPEditModal', () => {
  const { mocks } = setupHPTrackingHooks();

  it('renders HP edit modal with correct initial values', () => {
    const { participant } = renderHPEditModal();

    expect(screen.getByText(`Edit HP: ${participant.name}`)).toBeInTheDocument();
    expectHPInputValues(75, 100, 5);
  });

  it('displays current HP status correctly', () => {
    renderHPEditModal();
    expectHPStatus(75, 100, 5);
  });

  it('handles damage input correctly', async () => {
    renderHPEditModal();
    await testDamageApplication(10, 70, 'Status: 70/100 = 70 effective HP');
  });

  it('handles healing input correctly', async () => {
    renderHPEditModal();
    await testHealingApplication(15, 90, 'Status: 90/100 (+5) = 95 effective HP');
  });

  it('handles temporary HP correctly', async () => {
    renderHPEditModal();
    await testTemporaryHPChange(10, 'Status: 75/100 (+10) = 85 effective HP');
  });

  it('prevents current HP from going below 0', async () => {
    renderHPEditModal();
    await testDamageApplication(200, 0, 'Status: 0/100 = 0 effective HP');
  });

  it('prevents healing above maximum HP', async () => {
    renderHPEditModal();
    await testHealingApplication(50, 100, 'Status: 100/100 (+5) = 105 effective HP');
  });

  it('handles save action correctly', async () => {
    const { mocks } = renderHPEditModal();

    const currentHPInput = screen.getByLabelText('Current HP');
    const saveButton = screen.getByText('Save');

    fireEvent.change(currentHPInput, { target: { value: '50' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expectHPSaveCall(mocks.onSave, 50, 100, 5);
    });
  });

  it('handles cancel action correctly', () => {
    const { mocks } = renderHPEditModal();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mocks.onCancel).toHaveBeenCalled();
  });

  it('shows HP threshold warnings', () => {
    const criticalParticipant = createScenarioParticipant('critical');
    renderHPEditModal({ participant: criticalParticipant });

    expect(screen.getByText('⚠️ Critical HP Level')).toBeInTheDocument();
  });

  it('validates input fields correctly', async () => {
    const { mocks } = renderHPEditModal();

    const currentHPInput = screen.getByLabelText('Current HP');
    const saveButton = screen.getByText('Save');

    // When negative value is entered, it should be automatically converted to 0
    fireEvent.change(currentHPInput, { target: { value: '-5' } });

    expect(screen.getByLabelText('Current HP')).toHaveValue(0);

    fireEvent.click(saveButton);

    await waitFor(() => {
      expectHPSaveCall(mocks.onSave, 0, 100, 5);
    });
  });

  it('does not render when closed', () => {
    render(
      <HPEditModal
        participant={createTestHPParticipant()}
        isOpen={false}
        onSave={mocks.onSave}
        onCancel={mocks.onCancel}
      />
    );

    expect(screen.queryByText('Edit HP: Test Character')).not.toBeInTheDocument();
  });
});