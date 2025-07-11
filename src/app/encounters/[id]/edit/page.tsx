import { Suspense } from 'react';
import { Metadata } from 'next';
import { EncounterEditClient } from './EncounterEditClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface EncounterEditPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Edit Encounter - D&D Tracker',
  description: 'Edit encounter details, participants, and settings for your D&D campaign.',
};

export default function EncounterEditPage({ params }: EncounterEditPageProps) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Encounter</h1>
        <p className="text-muted-foreground mt-2">
          Modify encounter details, manage participants, and configure combat settings.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-muted-foreground">Loading encounter...</span>
        </div>
      }>
        <EncounterEditClient encounterId={params.id} />
      </Suspense>
    </div>
  );
}