import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Github, Shield } from 'lucide-react';

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
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-5 w-5 text-indigo-500" />
                <h4 className="font-semibold">Discord Server</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Join our community Discord for real-time discussions, tips, and peer support.
              </p>
              <Link href="https://discord.gg/dndtracker" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  Join Discord Server
                </Button>
              </Link>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Github className="h-5 w-5 text-gray-700" />
                <h4 className="font-semibold">GitHub Discussions</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Participate in feature discussions, report bugs, and contribute to development.
              </p>
              <Link href="https://github.com/dndtracker/discussions" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  GitHub Discussions
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-orange-500" />
                <h4 className="font-semibold">Community Forums</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Browse existing discussions, ask questions, and share your experiences.
              </p>
              <Link href="https://community.dndtracker.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  Visit Forums
                </Button>
              </Link>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold">Knowledge Base</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Search our comprehensive knowledge base for detailed guides and solutions.
              </p>
              <Link href="https://kb.dndtracker.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  Browse Knowledge Base
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}