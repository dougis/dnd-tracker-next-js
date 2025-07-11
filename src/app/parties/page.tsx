import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PartyListView } from '@/components/party/PartyListView';

export const metadata: Metadata = {
  title: 'Parties - D&D Encounter Tracker',
  description: 'Manage and organize your D&D parties',
};

export default async function PartiesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/signin?callbackUrl=/parties');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Parties</h1>
        <p className="text-muted-foreground">
          Manage and organize your D&D parties
        </p>
      </div>
      <PartyListView userId={session.user.id} />
    </div>
  );
}