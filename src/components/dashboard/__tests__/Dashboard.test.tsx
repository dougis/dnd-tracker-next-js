import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';

describe('Dashboard', () => {
  describe('Component Rendering', () => {
    test('renders without errors', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    test('renders dashboard title', () => {
      render(<Dashboard />);

      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });

    test('applies correct layout classes', () => {
      render(<Dashboard />);

      const dashboard = screen.getByTestId('dashboard');
      expect(dashboard).toHaveClass('p-6', 'space-y-6');
    });
  });

  describe('Summary Cards', () => {
    test('renders summary cards component', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('summary-cards')).toBeInTheDocument();
    });

    test('summary cards display correct titles', () => {
      render(<Dashboard />);

      expect(screen.getByText('Characters')).toBeInTheDocument();
      expect(screen.getByText('Encounters')).toBeInTheDocument();
      expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    });

    test('summary cards display placeholder statistics', () => {
      render(<Dashboard />);

      const characterValue = screen.getByTestId('characters-value');
      const encounterValue = screen.getByTestId('encounters-value');
      const sessionsValue = screen.getByTestId('active-sessions-value');

      expect(characterValue).toHaveTextContent('0');
      expect(encounterValue).toHaveTextContent('0');
      expect(sessionsValue).toHaveTextContent('0');
    });
  });

  describe('Quick Actions', () => {
    test('renders quick action toolbar', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });

    test('displays all quick action buttons', () => {
      render(<Dashboard />);

      expect(screen.getByRole('button', { name: /create character/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create encounter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start combat/i })).toBeInTheDocument();
    });
  });

  describe('Dashboard Widgets', () => {
    test('renders widget grid container', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('dashboard-widgets')).toBeInTheDocument();
    });

    test('widget grid has correct responsive classes', () => {
      render(<Dashboard />);

      const widgetGrid = screen.getByTestId('dashboard-widgets');
      expect(widgetGrid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-6');
    });
  });

  describe('Recent Activity Feed', () => {
    test('renders activity feed section', () => {
      render(<Dashboard />);

      expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
    });

    test('displays empty state when no activity', () => {
      render(<Dashboard />);

      expect(screen.getByText(/no recent activity/i)).toBeInTheDocument();
    });
  });

  describe('Customization Features', () => {
    test('renders customization button', () => {
      render(<Dashboard />);

      expect(screen.getByRole('button', { name: /customize dashboard/i })).toBeInTheDocument();
    });
  });
});