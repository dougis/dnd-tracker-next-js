import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Choose Your Plan</CardTitle>
          <CardDescription>Upgrade to unlock more features</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Plan upgrade functionality coming soon!</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordModal({ isOpen, onClose }: PasswordModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Password change functionality coming soon!</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteModal({ isOpen, onClose, onConfirm }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
          <CardDescription>This action cannot be undone</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive mb-4">
            Are you sure you want to delete your account? All your data will be permanently removed.
          </p>
          <div className="flex gap-4">
            <Button variant="destructive" onClick={onConfirm}>Confirm Delete</Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}