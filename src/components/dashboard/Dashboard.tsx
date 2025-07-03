'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SummaryCards } from './SummaryCards';
import { QuickActions } from './QuickActions';

export function Dashboard() {
  // Placeholder data - will be replaced with real data later
  const mockStats = {
    characters: 0,
    encounters: 0,
    activeSessions: 0,
  };

  const handleCreateCharacter = () => {
    // Placeholder - will implement navigation later
    console.log('Create character clicked');
  };

  const handleCreateEncounter = () => {
    // Placeholder - will implement navigation later
    console.log('Create encounter clicked');
  };

  const handleStartCombat = () => {
    // Placeholder - will implement navigation later
    console.log('Start combat clicked');
  };

  const handleCustomizeDashboard = () => {
    // Placeholder - will implement customization later
    console.log('Customize dashboard clicked');
  };

  return (
    <div data-testid="dashboard" className="p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={handleCustomizeDashboard} variant="outline">
          Customize Dashboard
        </Button>
      </div>

      {/* Summary Cards */}
      <SummaryCards stats={mockStats} />

      {/* Dashboard Grid */}
      <div data-testid="dashboard-widgets" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <QuickActions
          onCreateCharacter={handleCreateCharacter}
          onCreateEncounter={handleCreateEncounter}
          onStartCombat={handleStartCombat}
        />

        {/* Recent Activity */}
        <Card data-testid="recent-activity-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="activity-feed" className="text-center text-muted-foreground py-8">
              No recent activity to display
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-4">
              <p className="text-sm">No new notifications</p>
            </div>
          </CardContent>
        </Card>

        {/* Tips Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Tips & Tricks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-4">
              <p className="text-sm">Coming Soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-4">
              <p className="text-sm">Coming Soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}