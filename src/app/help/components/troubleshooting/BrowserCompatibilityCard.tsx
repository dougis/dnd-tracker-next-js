import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

export default function BrowserCompatibilityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          Browser Compatibility
        </CardTitle>
        <CardDescription>
          Supported browsers and technical requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Recommended Browsers</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Chrome 90+ (Recommended)</li>
              <li>• Firefox 88+</li>
              <li>• Safari 14+</li>
              <li>• Edge 90+</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">System Requirements</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Stable internet connection</li>
              <li>• 4GB RAM minimum (8GB recommended)</li>
              <li>• JavaScript enabled</li>
              <li>• Cookies enabled</li>
              <li>• Local storage enabled</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Mobile Support</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• iOS Safari 14+</li>
              <li>• Chrome for Android 90+</li>
              <li>• Responsive design for tablets</li>
              <li>• Touch-optimized interface</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}