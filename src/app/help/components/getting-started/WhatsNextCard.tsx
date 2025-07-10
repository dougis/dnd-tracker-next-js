import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WhatsNextCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What&apos;s Next?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm">
            Ready to dive deeper? Check out our comprehensive user guides for detailed
            tutorials on each feature.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Character Creation</Badge>
            <Badge variant="secondary">Combat Management</Badge>
            <Badge variant="secondary">Encounter Design</Badge>
            <Badge variant="secondary">Party Organization</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}