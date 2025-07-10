import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Github, Shield } from 'lucide-react';
import CommunityResourceItem from './community/CommunityResourceItem';

export default function CommunityResourcesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" />
          Community Resources
        </CardTitle>
        <CardDescription>
          Connect with other D&D Encounter Tracker users and get community support
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <CommunityResourceItem
              icon={MessageSquare}
              iconColor="text-indigo-500"
              title="Discord Server"
              description="Join our community Discord for real-time discussions, tips, and peer support."
              href="https://discord.gg/dndtracker"
              buttonText="Join Discord Server"
            />
            <CommunityResourceItem
              icon={Github}
              iconColor="text-gray-700"
              title="GitHub Discussions"
              description="Participate in feature discussions, report bugs, and contribute to development."
              href="https://github.com/dndtracker/discussions"
              buttonText="GitHub Discussions"
            />
          </div>
          <div className="space-y-4">
            <CommunityResourceItem
              icon={Users}
              iconColor="text-orange-500"
              title="Community Forums"
              description="Browse existing discussions, ask questions, and share your experiences."
              href="https://community.dndtracker.com"
              buttonText="Visit Forums"
            />
            <CommunityResourceItem
              icon={Shield}
              iconColor="text-blue-500"
              title="Knowledge Base"
              description="Search our comprehensive knowledge base for detailed guides and solutions."
              href="https://kb.dndtracker.com"
              buttonText="Browse Knowledge Base"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}