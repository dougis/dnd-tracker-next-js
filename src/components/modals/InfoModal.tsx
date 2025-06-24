'use client';

import * as React from 'react';
import { Info, FileText, User, Sword } from 'lucide-react';
import { Modal } from './Modal';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type InfoModalType = 'character' | 'encounter' | 'generic' | 'combat';

export interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  type?: InfoModalType;
  data?: Record<string, any>;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
}

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function InfoSection({ title, children, className }: InfoSectionProps) {
  return (
    <div className={cn('mb-4', className)}>
      <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value: string | number | React.ReactNode;
  className?: string;
}

function InfoField({ label, value, className }: InfoFieldProps) {
  return (
    <div className={cn('flex justify-between items-center py-1', className)}>
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function InfoModal({
  open: _open,
  onOpenChange,
  title,
  subtitle,
  type = 'generic',
  data,
  children,
  actions,
  className,
  size = 'lg',
}: InfoModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'character':
        return <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'encounter':
        return (
          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
        );
      case 'combat':
        return <Sword className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'character':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'encounter':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'combat':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Modal
      open={_open}
      onOpenChange={onOpenChange}
      size={size}
      type="info"
      className={cn('', className)}
      footer={
        actions && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            {actions}
          </div>
        )
      }
    >
      <div className="space-y-4">
        {/* Header with icon and type */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold truncate">{title}</h2>
              <Badge variant="secondary" className={cn(getTypeColor())}>
                {type}
              </Badge>
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Data display if provided */}
        {data && Object.keys(data).length > 0 && (
          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data).map(([key, value]) => (
                <InfoField
                  key={key}
                  label={
                    key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, ' $1')
                  }
                  value={
                    typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Custom content */}
        {children && <div className="space-y-4">{children}</div>}
      </div>
    </Modal>
  );
}

// Convenience components for specific types
export function CharacterInfoModal(props: Omit<InfoModalProps, 'type'>) {
  return <InfoModal {...props} type="character" />;
}

export function EncounterInfoModal(props: Omit<InfoModalProps, 'type'>) {
  return <InfoModal {...props} type="encounter" />;
}

export function CombatInfoModal(props: Omit<InfoModalProps, 'type'>) {
  return <InfoModal {...props} type="combat" />;
}

// Export the utility components
export { InfoSection, InfoField };
