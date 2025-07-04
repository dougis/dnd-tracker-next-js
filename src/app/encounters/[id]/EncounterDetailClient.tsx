'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEncounterData } from '@/lib/hooks/useEncounterData';
import { EncounterHeader } from './components/layout/EncounterHeader';
import { EncounterLayout } from './components/layout/EncounterLayout';
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
  const { encounter, loading, error, handleRetry } = useEncounterData(encounterId);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
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
      <EncounterHeader
        encounter={encounter}
        onEdit={handleEditEncounter}
        onStartCombat={handleStartCombat}
        onClone={handleCloneEncounter}
      />
      <EncounterLayout
        encounter={encounter}
        isEditing={isEditing}
        onToggleEdit={handleToggleEdit}
      />
    </div>
  );
}