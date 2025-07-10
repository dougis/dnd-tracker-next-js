import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Clock } from 'lucide-react';

export default function EmailSupportCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          Email Support
        </CardTitle>
        <CardDescription>
          Direct email support for technical issues and questions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm mb-2">
              <strong>General Support:</strong> support@dndtracker.com
            </p>
            <p className="text-sm mb-2">
              <strong>Technical Issues:</strong> tech@dndtracker.com
            </p>
            <p className="text-sm mb-4">
              <strong>Billing Questions:</strong> billing@dndtracker.com
            </p>
          </div>

          <div className="border rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Response Time
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Free tier: 24-48 hours</li>
              <li>• Paid subscribers: 12-24 hours</li>
              <li>• Premium support: 4-8 hours</li>
              <li>• Critical issues: 1-4 hours</li>
            </ul>
          </div>

          <Button className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}