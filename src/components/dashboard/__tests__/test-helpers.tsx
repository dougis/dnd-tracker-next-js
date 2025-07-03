import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { SummaryCards } from '../SummaryCards';
import { QuickActions } from '../QuickActions';

export interface MockHandlers {
  onCreateCharacter: jest.Mock;
  onCreateEncounter: jest.Mock;
  onStartCombat: jest.Mock;
}

export function createMockHandlers(): MockHandlers {
  return {
    onCreateCharacter: jest.fn(),
    onCreateEncounter: jest.fn(),
    onStartCombat: jest.fn(),
  };
}

export function renderDashboard() {
  return render(<Dashboard />);
}

export function renderSummaryCards(stats = {}) {
  return render(<SummaryCards stats={stats} />);
}

export function renderQuickActions(handlers: MockHandlers) {
  return render(<QuickActions {...handlers} />);
}

export function expectElementToBeInDocument(testId: string) {
  expect(screen.getByTestId(testId)).toBeInTheDocument();
}

export function expectTextToBeInDocument(text: string | RegExp) {
  expect(screen.getByText(text)).toBeInTheDocument();
}

export function expectButtonToBeInDocument(name: string | RegExp) {
  expect(screen.getByRole('button', { name })).toBeInTheDocument();
}