import React from 'react';

/**
 * Handle share permission settings
 */
export function ShareSettingsSection() {
  return (
    <div className="pt-3 border-t">
      <p className="text-xs font-medium mb-2">Share Settings</p>
      <div className="space-y-1">
        <label className="flex items-center text-xs">
          <input type="checkbox" className="mr-2" />
          Allow editing
        </label>
        <label className="flex items-center text-xs">
          <input type="checkbox" className="mr-2" />
          Allow commenting
        </label>
        <label className="flex items-center text-xs">
          <input type="checkbox" className="mr-2" />
          Send notifications
        </label>
      </div>
    </div>
  );
}