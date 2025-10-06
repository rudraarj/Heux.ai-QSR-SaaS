import React from 'react';
import { Badge } from './Badge';
import { cn } from '../../utils/cn';

interface StatusBadgeProps {
  status: 'passed' | 'failed' | 'attention' | 'process';
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    passed: {
      variant: 'success' as const,
      label: 'Passed',
    },
    attention: {
      variant: 'warning' as const,
      label: 'Needs Attention',
    },
    failed: {
      variant: 'danger' as const,
      label: 'Failed',
    },
    process: {
      variant: 'process' as const,
      label: 'Process',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn('capitalize', className)}>
      {config.label}
    </Badge>
  );
};