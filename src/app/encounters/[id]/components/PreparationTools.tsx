import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import type { Encounter } from '@/lib/validations/encounter';

interface PreparationToolsProps {
  encounter: Encounter;
}

interface PreparationItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

/**
 * Encounter preparation checklist and tools to help DMs ready encounters for play
 */
export function PreparationTools({ encounter: _encounter }: PreparationToolsProps) {
  const [checklist, setChecklist] = useState<PreparationItem[]>([
    {
      id: 'participants',
      label: 'Verify participant stats',
      completed: false,
      required: true,
    },
    {
      id: 'initiative',
      label: 'Set initiative order',
      completed: false,
      required: false,
    },
    {
      id: 'notes',
      label: 'Review encounter notes',
      completed: false,
      required: false,
    },
    {
      id: 'environment',
      label: 'Prepare environment and terrain',
      completed: false,
      required: false,
    },
    {
      id: 'objectives',
      label: 'Define victory conditions',
      completed: false,
      required: false,
    },
  ]);

  const completedItems = checklist.filter(item => item.completed).length;
  const totalItems = checklist.length;
  const progressPercentage = (completedItems / totalItems) * 100;

  const toggleItem = (itemId: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  };

  const getReadinessStatus = () => {
    const requiredCompleted = checklist
      .filter(item => item.required)
      .every(item => item.completed);

    if (requiredCompleted && completedItems === totalItems) return 'Fully Prepared';
    if (requiredCompleted) return 'Ready to Start';
    return 'Needs Preparation';
  };

  const getStatusColor = () => {
    const status = getReadinessStatus();
    if (status === 'Fully Prepared') return 'text-green-600';
    if (status === 'Ready to Start') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preparation Checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Preparation Progress</span>
            <span className={getStatusColor()}>{getReadinessStatus()}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {completedItems}/{totalItems} Complete
          </p>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          {checklist.map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <Checkbox
                id={item.id}
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
              />
              <label
                htmlFor={item.id}
                className={`text-sm cursor-pointer flex-1 ${
                  item.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {item.label}
                {item.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
          <div className="space-y-1">
            <button className="text-xs text-blue-600 hover:underline block">
              Roll initiative for all
            </button>
            <button className="text-xs text-blue-600 hover:underline block">
              Reset all HP to max
            </button>
            <button className="text-xs text-blue-600 hover:underline block">
              Clear all conditions
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="pt-3 border-t">
          <p className="text-xs font-medium mb-1">Preparation Tips</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Have backup plans for different scenarios</li>
            <li>• Review monster abilities and special rules</li>
            <li>• Prepare descriptions for key moments</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}