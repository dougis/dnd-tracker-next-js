import React from 'react';
import { EncounterDetailClient } from './EncounterDetailClient';

interface EncounterDetailPageProps {
  params: Promise<{
    id: string;
  }>;
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
export default async function EncounterDetailPage({ params }: EncounterDetailPageProps) {
  const { id } = await params;
  return <EncounterDetailClient encounterId={id} />;
}

export { type EncounterDetailPageProps };