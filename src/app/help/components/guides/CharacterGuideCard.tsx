import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export default function CharacterGuideCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Character Management
        </CardTitle>
        <CardDescription>
          Learn how to create, edit, and organize your characters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm">How to Create a Character</h4>
            <p className="text-xs text-muted-foreground">
              Step-by-step guide to building complete character sheets with stats, abilities, and equipment.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Managing Multiclass Characters</h4>
            <p className="text-xs text-muted-foreground">
              Handle complex multiclass builds with proper level distribution and ability tracking.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Character Import/Export</h4>
            <p className="text-xs text-muted-foreground">
              Import characters from D&D Beyond or export your characters for backup.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">Beginner Friendly</Badge>
        </div>
      </CardContent>
    </Card>
  );
}