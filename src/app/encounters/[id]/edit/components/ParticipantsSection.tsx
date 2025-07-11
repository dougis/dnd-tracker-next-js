'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { UpdateEncounter } from '@/lib/validations/encounter';
// Note: We'll implement a simplified participant manager for the edit form
import {
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, AlertTriangle } from 'lucide-react';

interface ParticipantsSectionProps {
  form: UseFormReturn<UpdateEncounter>;
}

export function ParticipantsSection({ form }: ParticipantsSectionProps) {
  const { control, watch, formState: { errors } } = form;
  const participants = watch('participants') || [];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Manage encounter participants (characters, NPCs, monsters)</span>
      </div>

      {/* Validation Error */}
      {errors.participants && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errors.participants.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Simplified Participant Display for MVP */}
      <FormField
        control={control}
        name="participants"
        render={() => (
          <FormItem>
            <div className="rounded-lg border p-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Participant management for encounter editing is coming soon.
                </p>
                <p className="text-sm text-muted-foreground">
                  For now, you can view the current participants below, but editing 
                  participants should be done from the main encounter detail page.
                </p>
              </div>
              {participants.length > 0 && (
                <div className="mt-4 space-y-2">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">{participant.name}</span>
                      <div className="text-sm text-muted-foreground">
                        {participant.type.toUpperCase()} • HP: {participant.currentHitPoints}/{participant.maxHitPoints} • AC: {participant.armorClass}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Participants Summary */}
      {participants.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {participants.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Participants
            </div>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {participants.filter(p => p.isPlayer).length}
            </div>
            <div className="text-sm text-muted-foreground">
              Player Characters
            </div>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {participants.filter(p => p.type === 'npc').length}
            </div>
            <div className="text-sm text-muted-foreground">
              NPCs
            </div>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {participants.filter(p => p.type === 'monster').length}
            </div>
            <div className="text-sm text-muted-foreground">
              Monsters
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {participants.length === 0 && (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            No participants added yet. Use the &quot;Add Participant&quot; button above to add characters, NPCs, or monsters to this encounter.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}