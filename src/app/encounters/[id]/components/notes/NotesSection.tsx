import React from 'react';

/**
 * Additional notes section for DM reference
 */
export function NotesSection() {
  return (
    <div className="pt-4 border-t">
      <h4 className="text-sm font-medium mb-2">Notes</h4>
      <div className="text-sm text-muted-foreground">
        <p>Additional notes and reminders can be added here for the DM&apos;s reference during the encounter.</p>
      </div>
    </div>
  );
}