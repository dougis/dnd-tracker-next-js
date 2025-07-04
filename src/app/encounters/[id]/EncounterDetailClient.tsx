'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EncounterService } from '@/lib/services/EncounterService';
import type { IEncounter } from '@/lib/models/encounter/interfaces';
import { EncounterOverview } from './components/EncounterOverview';
import { ParticipantOverview } from './components/ParticipantOverview';
import { EncounterSettings } from './components/EncounterSettings';
import { EncounterNotes } from './components/EncounterNotes';
import { PreparationTools } from './components/PreparationTools';
import { SharingSection } from './components/SharingSection';
import { CombatReadiness } from './components/CombatReadiness';
import { EncounterActions } from './components/EncounterActions';
import { ErrorDisplay } from './components/ErrorDisplay';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface EncounterDetailClientProps {
  encounterId: string;
}

/**
 * Client-side encounter detail component that manages state and data fetching
 */
export function EncounterDetailClient({ encounterId }: EncounterDetailClientProps) {
  const router = useRouter();
  const [encounter, setEncounter] = useState<IEncounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadEncounter();
  }, [encounterId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEncounter = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await EncounterService.getEncounterById(encounterId);

      if (result.success && result.data) {
        setEncounter(result.data);
      } else {
        setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to load encounter');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEncounter = () => {
    router.push(`/encounters/${encounterId}/edit` as any);
  };

  const handleStartCombat = () => {
    // This will be implemented when combat system is built
    console.log('Starting combat for encounter:', encounterId);
  };

  const handleCloneEncounter = () => {
    // This will be implemented when cloning system is built
    console.log('Cloning encounter:', encounterId);
  };

  const handleRetry = () => {
    loadEncounter();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-2">Loading encounter...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Error loading encounter"
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  if (!encounter) {
    return (
      <ErrorDisplay
        title="Encounter not found"
        message="The requested encounter could not be found."
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with title and main actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{encounter.name}</h1>
          <p className="text-muted-foreground mt-1">
            {encounter.description}
          </p>
        </div>
        <EncounterActions
          encounter={encounter}
          onEdit={handleEditEncounter}
          onStartCombat={handleStartCombat}
          onClone={handleCloneEncounter}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary content column */}
        <div className="lg:col-span-2 space-y-6">
          <EncounterOverview encounter={encounter} />
          <ParticipantOverview encounter={encounter} />
          <EncounterNotes
            encounter={encounter}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
          />
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          <CombatReadiness encounter={encounter} />
          <EncounterSettings encounter={encounter} />
          <PreparationTools encounter={encounter} />
          <SharingSection encounter={encounter} />
        </div>
      </div>
    </div>
  );
}