import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

export function ThemeSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme & Display</CardTitle>
        <CardDescription>Customize your application appearance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label>Theme</label>
              <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}