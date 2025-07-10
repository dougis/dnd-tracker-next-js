import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupportGuidelinesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Before Contacting Support</CardTitle>
        <CardDescription>
          Help us help you by providing the right information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Information to Include</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Detailed description of the issue</li>
              <li>• Steps to reproduce the problem</li>
              <li>• Your browser and operating system</li>
              <li>• Account email and subscription tier</li>
              <li>• Screenshots or error messages</li>
              <li>• Any recent changes or actions taken</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Response Expectations</h4>
            <p className="text-sm text-muted-foreground">
              We strive to provide helpful, timely responses to all support requests.
              Response times vary based on your subscription tier and the complexity of the issue.
              For urgent matters affecting paid subscribers, we offer expedited support channels.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}