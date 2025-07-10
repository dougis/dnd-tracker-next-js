import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileSectionProps {
  profileData: {
    name: string;
    email: string;
  };
  setProfileData: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
  }>>;
  formErrors: {
    name?: string;
    email?: string;
  };
  isLoadingProfile: boolean;
  onSubmit: (_e: React.FormEvent) => void;
}

export function ProfileSection({
  profileData,
  setProfileData,
  formErrors,
  isLoadingProfile,
  onSubmit,
}: ProfileSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Update your personal information and account details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isLoadingProfile}
            />
            {formErrors.name && (
              <p className="text-sm text-destructive">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              disabled={isLoadingProfile}
            />
            {formErrors.email && (
              <p className="text-sm text-destructive">{formErrors.email}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoadingProfile}>
            {isLoadingProfile ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}