import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Sword, Play } from 'lucide-react';
import QuickStartStep from './steps/QuickStartStep';

export default function QuickStartCard() {
  return (
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
          <QuickStartStep
            stepNumber={1}
            title="Create Your First Character"
            description="Start by adding player characters or NPCs to your library. You can create detailed character sheets with stats, abilities, and equipment."
            linkHref="/characters"
            linkText="Character Creation Guide"
            icon={Users}
          />
          <QuickStartStep
            stepNumber={2}
            title="Set Up a Party"
            description="Group your characters together to form adventuring parties. This makes it easy to manage multiple characters for encounters."
            linkHref="/characters"
            linkText="Party Management"
            icon={Users}
          />
          <QuickStartStep
            stepNumber={3}
            title="Build Your First Encounter"
            description="Create encounters by adding creatures, setting difficulty, and configuring environmental factors for your combat sessions."
            linkHref="/encounters"
            linkText="Encounter Builder"
            icon={FileText}
          />
          <QuickStartStep
            stepNumber={4}
            title="Start Combat"
            description="Launch into combat mode to track initiative, manage HP/damage, and run smooth combat encounters with automated turn management."
            linkHref="/combat"
            linkText="Combat Tracking Guide"
            icon={Sword}
          />
        </div>
      </CardContent>
    </Card>
  );
}