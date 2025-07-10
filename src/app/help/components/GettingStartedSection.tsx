import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Sword, Play } from 'lucide-react';

export default function GettingStartedSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Welcome to the D&D Encounter Tracker</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Get started with the most comprehensive D&D encounter management tool.
          Follow this quick start guide to begin tracking your adventures.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Quick Start Guide
          </CardTitle>
          <CardDescription>
            Follow these steps to get up and running in minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <Badge variant="outline" className="mt-1">1</Badge>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Create Your First Character</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Start by adding player characters or NPCs to your library. You can create detailed
                  character sheets with stats, abilities, and equipment.
                </p>
                <Link
                  href="/characters"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Character Creation Guide →
                </Link>
              </div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <Badge variant="outline" className="mt-1">2</Badge>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Set Up a Party</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Group your characters together to form adventuring parties. This makes it easy
                  to manage multiple characters for encounters.
                </p>
                <Link
                  href="/parties"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Party Management →
                </Link>
              </div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <Badge variant="outline" className="mt-1">3</Badge>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Build Your First Encounter</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Create encounters by adding creatures, setting difficulty, and configuring
                  environmental factors for your combat sessions.
                </p>
                <Link
                  href="/encounters"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Encounter Builder →
                </Link>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-50" />
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <Badge variant="outline" className="mt-1">4</Badge>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Start Combat</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Launch into combat mode to track initiative, manage HP/damage, and run
                  smooth combat encounters with automated turn management.
                </p>
                <Link
                  href="/combat"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Combat Tracking Guide →
                </Link>
              </div>
              <Sword className="h-8 w-8 text-primary opacity-50" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Features Overview</CardTitle>
          <CardDescription>
            Essential features to help you run better D&D sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Initiative Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Automated initiative rolling with dexterity tiebreakers and turn management.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">HP & Damage Management</h4>
              <p className="text-sm text-muted-foreground">
                Real-time HP tracking with damage, healing, and temporary HP support.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Character Library</h4>
              <p className="text-sm text-muted-foreground">
                Complete character sheets with multiclass support and equipment tracking.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Encounter Planning</h4>
              <p className="text-sm text-muted-foreground">
                CR calculation, difficulty balancing, and environmental factor management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What&apos;s Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm">
              Ready to dive deeper? Check out our comprehensive user guides for detailed
              tutorials on each feature.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Character Creation</Badge>
              <Badge variant="secondary">Combat Management</Badge>
              <Badge variant="secondary">Encounter Design</Badge>
              <Badge variant="secondary">Party Organization</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}