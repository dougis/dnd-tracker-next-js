import { screen } from '@testing-library/react';
import { renderDashboard, expectElementToBeInDocument, expectTextToBeInDocument, expectButtonToBeInDocument } from './test-helpers';

describe('Dashboard', () => {
  describe('Component Rendering', () => {
    test('renders without errors', () => {
      renderDashboard();
      expectElementToBeInDocument('dashboard');
    });

    test('renders dashboard title', () => {
      renderDashboard();
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });

    test('applies correct layout classes', () => {
      renderDashboard();
      const dashboard = screen.getByTestId('dashboard');
      expect(dashboard).toHaveClass('p-6', 'space-y-6');
    });
  });

  describe('Summary Cards', () => {
    test('renders summary cards component', () => {
      renderDashboard();
      expectElementToBeInDocument('summary-cards');
    });

    test('summary cards display correct titles', () => {
      renderDashboard();
      expectTextToBeInDocument('Characters');
      expectTextToBeInDocument('Encounters');
      expectTextToBeInDocument('Active Sessions');
    });

    test('summary cards display placeholder statistics', () => {
      renderDashboard();
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
      renderDashboard();
      expectElementToBeInDocument('quick-actions');
    });

    test('displays all quick action buttons', () => {
      renderDashboard();
      expectButtonToBeInDocument(/create character/i);
      expectButtonToBeInDocument(/create encounter/i);
      expectButtonToBeInDocument(/start combat/i);
    });
  });

  describe('Dashboard Widgets', () => {
    test('renders widget grid container', () => {
      renderDashboard();
      expectElementToBeInDocument('dashboard-widgets');
    });

    test('widget grid has correct responsive classes', () => {
      renderDashboard();
      const widgetGrid = screen.getByTestId('dashboard-widgets');
      expect(widgetGrid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-6');
    });
  });

  describe('Recent Activity Feed', () => {
    test('renders activity feed section', () => {
      renderDashboard();
      expectElementToBeInDocument('activity-feed');
    });

    test('displays empty state when no activity', () => {
      renderDashboard();
      expectTextToBeInDocument(/no recent activity/i);
    });
  });

  describe('Customization Features', () => {
    test('renders customization button', () => {
      renderDashboard();
      expectButtonToBeInDocument(/customize dashboard/i);
    });
  });
});