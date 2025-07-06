import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HPQuickButtons } from '../HPQuickButtons';
import { setupHPTrackingTest } from './test-helpers';

describe('HPQuickButtons', () => {
  const { mocks } = setupHPTrackingTest();

  it('renders all quick action buttons', () => {
    render(
      <HPQuickButtons
        onDamage={mocks.onDamage}
        onHealing={mocks.onHealing}
        onEdit={mocks.onEdit}
      />
    );

    expect(screen.getByText('1 Damage')).toBeInTheDocument();
    expect(screen.getByText('5 Damage')).toBeInTheDocument();
    expect(screen.getByText('10 Damage')).toBeInTheDocument();
    expect(screen.getByText('1 Heal')).toBeInTheDocument();
    expect(screen.getByText('5 Heal')).toBeInTheDocument();
    expect(screen.getByText('10 Heal')).toBeInTheDocument();
    expect(screen.getByText('Edit HP')).toBeInTheDocument();
  });

  it('handles damage button clicks correctly', () => {
    render(
      <HPQuickButtons
        onDamage={mocks.onDamage}
        onHealing={mocks.onHealing}
        onEdit={mocks.onEdit}
      />
    );

    fireEvent.click(screen.getByText('1 Damage'));
    expect(mocks.onDamage).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText('5 Damage'));
    expect(mocks.onDamage).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByText('10 Damage'));
    expect(mocks.onDamage).toHaveBeenCalledWith(10);
  });

  it('handles healing button clicks correctly', () => {
    render(
      <HPQuickButtons
        onDamage={mocks.onDamage}
        onHealing={mocks.onHealing}
        onEdit={mocks.onEdit}
      />
    );

    fireEvent.click(screen.getByText('1 Heal'));
    expect(mocks.onHealing).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText('5 Heal'));
    expect(mocks.onHealing).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByText('10 Heal'));
    expect(mocks.onHealing).toHaveBeenCalledWith(10);
  });

  it('handles edit button click correctly', () => {
    render(
      <HPQuickButtons
        onDamage={mocks.onDamage}
        onHealing={mocks.onHealing}
        onEdit={mocks.onEdit}
      />
    );

    fireEvent.click(screen.getByText('Edit HP'));
    expect(mocks.onEdit).toHaveBeenCalled();
  });

  it('renders with custom damage amounts', () => {
    const customDamageAmounts = [2, 8, 15];

    render(
      <HPQuickButtons
        onDamage={mocks.onDamage}
        onHealing={mocks.onHealing}
        onEdit={mocks.onEdit}
        damageAmounts={customDamageAmounts}
      />
    );

    expect(screen.getByText('2 Damage')).toBeInTheDocument();
    expect(screen.getByText('8 Damage')).toBeInTheDocument();
    expect(screen.getByText('15 Damage')).toBeInTheDocument();
  });

  it('renders with custom healing amounts', () => {
    const customHealingAmounts = [3, 7, 12];

    render(
      <HPQuickButtons
        onDamage={mocks.onDamage}
        onHealing={mocks.onHealing}
        onEdit={mocks.onEdit}
        healingAmounts={customHealingAmounts}
      />
    );

    expect(screen.getByText('3 Heal')).toBeInTheDocument();
    expect(screen.getByText('7 Heal')).toBeInTheDocument();
    expect(screen.getByText('12 Heal')).toBeInTheDocument();
  });

  it('renders with compact layout', () => {
    render(
      <HPQuickButtons
        onDamage={mocks.onDamage}
        onHealing={mocks.onHealing}
        onEdit={mocks.onEdit}
        compact={true}
      />
    );

    const container = screen.getByTestId('hp-quick-buttons');
    expect(container).toHaveClass('gap-1', 'space-x-1');
  });

  it('renders with disabled state', () => {
    render(
      <HPQuickButtons
        onDamage={mocks.onDamage}
        onHealing={mocks.onHealing}
        onEdit={mocks.onEdit}
        disabled={true}
      />
    );

    const damageButton = screen.getByText('1 Damage');
    const healingButton = screen.getByText('1 Heal');
    const editButton = screen.getByText('Edit HP');

    expect(damageButton).toBeDisabled();
    expect(healingButton).toBeDisabled();
    expect(editButton).toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    render(
      <HPQuickButtons
        onDamage={mocks.onDamage}
        onHealing={mocks.onHealing}
        onEdit={mocks.onEdit}
      />
    );

    const damageButton = screen.getByText('1 Damage');
    const healingButton = screen.getByText('1 Heal');
    const editButton = screen.getByText('Edit HP');

    expect(damageButton).toHaveAttribute('aria-label', 'Apply 1 damage');
    expect(healingButton).toHaveAttribute('aria-label', 'Apply 1 healing');
    expect(editButton).toHaveAttribute('aria-label', 'Edit HP values');
  });
});