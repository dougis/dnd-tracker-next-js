'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEncounterData } from '@/lib/hooks/useEncounterData';
import { EncounterService } from '@/lib/services/EncounterService';
import { UpdateEncounter } from '@/lib/validations/encounter';
import { EncounterEditForm } from './components/EncounterEditForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EncounterEditClientProps {
  encounterId: string;
}

export function EncounterEditClient({ encounterId }: EncounterEditClientProps) {
  const router = useRouter();
  const { encounter, loading, error, handleRetry } = useEncounterData(encounterId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  const handleSubmit = useCallback(async (formData: UpdateEncounter) => {
    if (!encounter) return;

    setIsSubmitting(true);
    try {
      const result = await EncounterService.updateEncounter(encounterId, formData);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Encounter updated successfully',
        });
        setHasUnsavedChanges(false);
        router.push(`/encounters/${encounterId}`);
      } else {
        toast({
          title: 'Error',
          description: typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to update encounter',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating encounter:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [encounterId, encounter, router, toast]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        router.push(`/encounters/${encounterId}`);
      }
    } else {
      router.push(`/encounters/${encounterId}`);
    }
  }, [encounterId, hasUnsavedChanges, router]);

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all changes?')) {
      setHasUnsavedChanges(false);
      // The form will reset itself by re-rendering with original encounter data
      handleRetry();
    }
  }, [handleRetry]);

  const handleFormChange = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-muted-foreground">Loading encounter...</span>
      </div>
    );
  }

  // Handle error state
  if (error || !encounter) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-destructive mb-4">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Error loading encounter</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            {error || 'Encounter not found'}
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleRetry()}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/encounters')}
            >
              Back to Encounters
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Editing: {encounter.name}</h2>
          <p className="text-muted-foreground">
            Make changes to encounter details and settings
          </p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center space-x-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Unsaved changes</span>
          </div>
        )}
      </div>

      {/* Edit Form */}
      <EncounterEditForm
        encounter={{
          name: encounter.name,
          description: encounter.description,
          tags: encounter.tags,
          difficulty: encounter.difficulty,
          estimatedDuration: encounter.estimatedDuration,
          targetLevel: encounter.targetLevel,
          participants: encounter.participants.map(p => ({
            ...p,
            characterId: p.characterId.toString(),
          })),
          settings: encounter.settings,
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onReset={handleReset}
        onChange={handleFormChange}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}