import React from 'react';
import { EncounterDetailClient } from './EncounterDetailClient';

interface EncounterDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * Encounter Detail Page - Server Component
 *
 * Displays comprehensive encounter information including:
 * - Encounter overview and settings
 * - Participant management
 * - Preparation tools and checklists
 * - Combat readiness indicators
 * - Sharing and collaboration features
 */
export default function EncounterDetailPage({ params }: EncounterDetailPageProps) {
  return <EncounterDetailClient encounterId={params.id} />;
}

export { type EncounterDetailPageProps };