import { CharacterDetailClient } from './CharacterDetailClient';

interface CharacterDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CharacterDetailPage({ params }: CharacterDetailPageProps) {
  const { id } = await params;

  return <CharacterDetailClient id={id} />;
}