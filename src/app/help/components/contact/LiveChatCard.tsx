import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';

export default function LiveChatCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-500" />
          Live Chat
        </CardTitle>
        <CardDescription>
          Real-time chat support for immediate assistance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Chat with our support team for quick answers to common questions and urgent issues.
            </p>
          </div>

          <div className="border rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-2">Availability</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Monday - Friday: 9 AM - 6 PM EST</li>
              <li>• Saturday: 10 AM - 4 PM EST</li>
              <li>• Sunday: Closed</li>
              <li>• Premium: Extended hours available</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Live Chat
            </Button>
            <Badge variant="secondary" className="text-center">
              Available for paid subscribers
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}