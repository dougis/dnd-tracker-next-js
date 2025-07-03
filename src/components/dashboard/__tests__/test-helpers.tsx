import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { SummaryCards } from '../SummaryCards';
import { QuickActions } from '../QuickActions';

export function renderDashboard() {
  return render(<Dashboard />);
}

export function renderSummaryCards(stats = {}) {
  return render(<SummaryCards stats={stats} />);
}

export function renderQuickActions(handlers: {
  onCreateCharacter: () => void;
  onCreateEncounter: () => void;
  onStartCombat: () => void;
}) {
  return render(<QuickActions {...handlers} />);
}

export function expectElementToBeInDocument(testId: string) {
  expect(screen.getByTestId(testId)).toBeInTheDocument();
}

export function expectTextToBeInDocument(text: string | RegExp) {
  expect(screen.getByText(text)).toBeInTheDocument();
}