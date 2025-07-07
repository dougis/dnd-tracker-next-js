import { screen, fireEvent } from '@testing-library/react';
import { setupHPTrackingHooks, renderHPQuickButtons } from '../test-helpers';

describe('HPQuickButtons', () => {
  const { mocks } = setupHPTrackingHooks();

  const renderWithMocks = (props = {}) => {
    return renderHPQuickButtons({
      onDamage: mocks.onDamage,
      onHealing: mocks.onHealing,
      onEdit: mocks.onEdit,
      ...props,
    });
  };

  it('renders all quick action buttons', () => {
    renderWithMocks();

    expect(screen.getByText('1 Damage')).toBeInTheDocument();
    expect(screen.getByText('5 Damage')).toBeInTheDocument();
    expect(screen.getByText('10 Damage')).toBeInTheDocument();
    expect(screen.getByText('1 Heal')).toBeInTheDocument();
    expect(screen.getByText('5 Heal')).toBeInTheDocument();
    expect(screen.getByText('10 Heal')).toBeInTheDocument();
    expect(screen.getByText('Edit HP')).toBeInTheDocument();
  });

  it('handles damage button clicks correctly', () => {
    renderWithMocks();

    fireEvent.click(screen.getByText('1 Damage'));
    expect(mocks.onDamage).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText('5 Damage'));
    expect(mocks.onDamage).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByText('10 Damage'));
    expect(mocks.onDamage).toHaveBeenCalledWith(10);
  });

  it('handles healing button clicks correctly', () => {
    renderWithMocks();

    fireEvent.click(screen.getByText('1 Heal'));
    expect(mocks.onHealing).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText('5 Heal'));
    expect(mocks.onHealing).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByText('10 Heal'));
    expect(mocks.onHealing).toHaveBeenCalledWith(10);
  });

  it('handles edit button click correctly', () => {
    renderWithMocks();

    fireEvent.click(screen.getByText('Edit HP'));
    expect(mocks.onEdit).toHaveBeenCalled();
  });

  it('renders with custom damage amounts', () => {
    const customDamageAmounts = [2, 8, 15];
    renderWithMocks({ damageAmounts: customDamageAmounts });

    expect(screen.getByText('2 Damage')).toBeInTheDocument();
    expect(screen.getByText('8 Damage')).toBeInTheDocument();
    expect(screen.getByText('15 Damage')).toBeInTheDocument();
  });

  it('renders with custom healing amounts', () => {
    const customHealingAmounts = [3, 7, 12];
    renderWithMocks({ healingAmounts: customHealingAmounts });

    expect(screen.getByText('3 Heal')).toBeInTheDocument();
    expect(screen.getByText('7 Heal')).toBeInTheDocument();
    expect(screen.getByText('12 Heal')).toBeInTheDocument();
  });

  it('renders with compact layout', () => {
    renderWithMocks({ compact: true });

    const container = screen.getByTestId('hp-quick-buttons');
    expect(container).toHaveClass('gap-1', 'space-x-1');
  });

  it('renders with disabled state', () => {
    renderWithMocks({ disabled: true });

    const damageButton = screen.getByText('1 Damage');
    const healingButton = screen.getByText('1 Heal');
    const editButton = screen.getByText('Edit HP');

    expect(damageButton).toBeDisabled();
    expect(healingButton).toBeDisabled();
    expect(editButton).toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    renderWithMocks();

    const damageButton = screen.getByText('1 Damage');
    const healingButton = screen.getByText('1 Heal');
    const editButton = screen.getByText('Edit HP');

    expect(damageButton).toHaveAttribute('aria-label', 'Apply 1 damage');
    expect(healingButton).toHaveAttribute('aria-label', 'Apply 1 healing');
    expect(editButton).toHaveAttribute('aria-label', 'Edit HP values');
  });
});