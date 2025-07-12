'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

/**
 * Encounter Creation Client Component
 *
 * This is a placeholder implementation for encounter creation.
 * In a full implementation, this would include:
 * - Form for encounter basic information
 * - Participant selection interface
 * - Settings configuration
 * - Save and validation logic
 */
export function EncounterCreationClient() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/encounters');
  };

  const handleSave = () => {
    // TODO: Implement encounter creation logic
    console.log('Save encounter');
    // For now, just navigate back
    router.push('/encounters');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Encounters
        </Button>

        <h1 className="text-3xl font-bold">Create New Encounter</h1>
        <p className="text-muted-foreground mt-2">
          Design and configure a new encounter for your campaign.
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Encounter Creation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This is a placeholder for the encounter creation form.
                In the full implementation, this would include:
              </p>

              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Basic encounter information (name, description, tags)</li>
                <li>Difficulty and target level settings</li>
                <li>Participant selection and configuration</li>
                <li>Environment and combat settings</li>
                <li>Lair actions and special rules</li>
                <li>Save and validation logic</li>
              </ul>

              <div className="flex gap-4 pt-6">
                <Button onClick={handleSave} className="w-32">
                  Save Encounter
                </Button>
                <Button variant="outline" onClick={handleBack} className="w-32">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}