import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Wifi, HardDrive, RefreshCw, Bug, Globe } from 'lucide-react';

export default function TroubleshootingSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Troubleshooting Guides</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Solutions to common issues and technical problems you might encounter.
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Quick Fix Checklist</AlertTitle>
        <AlertDescription>
          Before diving into specific issues, try these common solutions:
          <br />
          1. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
          <br />
          2. Clear your browser cache and cookies
          <br />
          3. Check your internet connection
          <br />
          4. Try using an incognito/private browsing window
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-orange-500" />
              Common Issues
            </CardTitle>
            <CardDescription>
              Frequently reported problems and their solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2">Character Not Saving</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  If character changes aren&apos;t being saved properly:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Check your internet connection</li>
                  <li>• Ensure you&apos;re logged in to your account</li>
                  <li>• Try saving again after a few seconds</li>
                  <li>• Refresh the page and check if changes persisted</li>
                </ul>
                <Badge variant="outline" className="mt-2 text-xs">Common</Badge>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2">Encounter Loading Slowly</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Large encounters may take time to load:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Reduce the number of creatures in the encounter</li>
                  <li>• Close other browser tabs to free up memory</li>
                  <li>• Check for browser extensions that might interfere</li>
                  <li>• Try using a different browser</li>
                </ul>
                <Badge variant="outline" className="mt-2 text-xs">Performance</Badge>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2">Initiative Not Rolling</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  When automatic initiative rolls fail:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Verify all characters have dexterity values</li>
                  <li>• Check that initiative hasn&apos;t already been rolled</li>
                  <li>• Try manually entering initiative values</li>
                  <li>• Restart the encounter if necessary</li>
                </ul>
                <Badge variant="outline" className="mt-2 text-xs">Combat</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-500" />
              Connection Issues
            </CardTitle>
            <CardDescription>
              Resolving network and connectivity problems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-2">Sync Problems</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  When data isn&apos;t syncing across devices:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Ensure you&apos;re logged into the same account</li>
                  <li>• Force refresh the page (Ctrl+F5)</li>
                  <li>• Log out and log back in</li>
                  <li>• Check for multiple browser windows</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Offline Mode</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Limited functionality when offline:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Active combat sessions continue to work</li>
                  <li>• New characters/encounters cannot be created</li>
                  <li>• Changes sync when connection resumes</li>
                  <li>• Consider downloading PDFs for offline reference</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-purple-500" />
              Cache & Storage
            </CardTitle>
            <CardDescription>
              Managing browser data and storage issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-2">Clearing Cache and Cookies</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  For Chrome/Edge:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)</li>
                  <li>• Select &quot;Cookies and other site data&quot;</li>
                  <li>• Select &quot;Cached images and files&quot;</li>
                  <li>• Click &quot;Clear data&quot;</li>
                </ul>

                <p className="text-xs text-muted-foreground mt-3 mb-2">
                  For Firefox:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)</li>
                  <li>• Select &quot;Cookies&quot; and &quot;Cache&quot;</li>
                  <li>• Click &quot;Clear Now&quot;</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Storage Full</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  If you receive storage errors:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Clear browser cache and storage</li>
                  <li>• Close unused browser tabs</li>
                  <li>• Export/backup important data first</li>
                  <li>• Consider upgrading to a paid plan for more storage</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-red-500" />
            Reporting Bugs
          </CardTitle>
          <CardDescription>
            How to report technical issues and bugs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Before Reporting</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Try the quick fix checklist above</li>
                <li>• Check if the issue is reproducible</li>
                <li>• Note your browser and operating system</li>
                <li>• Gather any error messages or screenshots</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">What to Include</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Steps to reproduce the issue</li>
                <li>• Expected vs. actual behavior</li>
                <li>• Browser and version information</li>
                <li>• Screenshots or screen recordings if applicable</li>
                <li>• Account information (subscription tier, etc.)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">How to Report</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Email: support@dndtracker.com</li>
                <li>• Use the &quot;Contact Support&quot; form in app</li>
                <li>• GitHub Issues for technical users</li>
                <li>• Discord server for community help</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}