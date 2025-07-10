import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SecuritySectionProps {
  onChangePasswordClick: () => void;
  onDeleteAccountClick: () => void;
}

export function SecuritySection({
  onChangePasswordClick,
  onDeleteAccountClick,
}: SecuritySectionProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Account Security</CardTitle>
        <CardDescription>Manage your account security and authentication</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onChangePasswordClick}>
            Change Password
          </Button>
          <Button variant="destructive" onClick={onDeleteAccountClick}>
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}