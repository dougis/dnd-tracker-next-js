import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function CharacterManagementCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Character Management
        </CardTitle>
        <CardDescription>
          Complete character creation and management system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Character Creation</h4>
            <p className="text-xs text-muted-foreground">
              Build detailed character sheets with all D&D 5e races, classes, and backgrounds.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Multiclass Support</h4>
            <p className="text-xs text-muted-foreground">
              Handle complex multiclass builds with automatic level calculations.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Equipment Tracking</h4>
            <p className="text-xs text-muted-foreground">
              Manage inventory, weapons, armor, and magical items.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Spell Management</h4>
            <p className="text-xs text-muted-foreground">
              Track spell slots, known spells, and prepared spells by class.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}