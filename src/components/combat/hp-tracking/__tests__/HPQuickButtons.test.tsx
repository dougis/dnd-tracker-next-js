import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HPQuickButtons } from '../HPQuickButtons';

describe('HPQuickButtons', () => {
  const mockOnDamage = jest.fn();
  const mockOnHealing = jest.fn();
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all quick action buttons', () => {
    render(
      <HPQuickButtons
        onDamage={mockOnDamage}
        onHealing={mockOnHealing}
        onEdit={mockOnEdit}
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
        onDamage={mockOnDamage}
        onHealing={mockOnHealing}
        onEdit={mockOnEdit}
      />
    );

    fireEvent.click(screen.getByText('1 Damage'));
    expect(mockOnDamage).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText('5 Damage'));
    expect(mockOnDamage).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByText('10 Damage'));
    expect(mockOnDamage).toHaveBeenCalledWith(10);
  });

  it('handles healing button clicks correctly', () => {
    render(
      <HPQuickButtons
        onDamage={mockOnDamage}
        onHealing={mockOnHealing}
        onEdit={mockOnEdit}
      />
    );

    fireEvent.click(screen.getByText('1 Heal'));
    expect(mockOnHealing).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText('5 Heal'));
    expect(mockOnHealing).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByText('10 Heal'));
    expect(mockOnHealing).toHaveBeenCalledWith(10);
  });

  it('handles edit button click correctly', () => {
    render(
      <HPQuickButtons
        onDamage={mockOnDamage}
        onHealing={mockOnHealing}
        onEdit={mockOnEdit}
      />
    );

    fireEvent.click(screen.getByText('Edit HP'));
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('renders with custom damage amounts', () => {
    const customDamageAmounts = [2, 8, 15];

    render(
      <HPQuickButtons
        onDamage={mockOnDamage}
        onHealing={mockOnHealing}
        onEdit={mockOnEdit}
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
        onDamage={mockOnDamage}
        onHealing={mockOnHealing}
        onEdit={mockOnEdit}
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
        onDamage={mockOnDamage}
        onHealing={mockOnHealing}
        onEdit={mockOnEdit}
        compact={true}
      />
    );

    const container = screen.getByTestId('hp-quick-buttons');
    expect(container).toHaveClass('space-x-1');
  });

  it('renders with disabled state', () => {
    render(
      <HPQuickButtons
        onDamage={mockOnDamage}
        onHealing={mockOnHealing}
        onEdit={mockOnEdit}
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
        onDamage={mockOnDamage}
        onHealing={mockOnHealing}
        onEdit={mockOnEdit}
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