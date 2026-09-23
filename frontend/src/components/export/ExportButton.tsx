/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 30: EXPORT & SHARING — Reusable Export Trigger Button
 */

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import type {
  ExportColumnDefinition,
  ExportProvenanceMetadata,
  ExportResult,
} from '../../types/export-sharing';
import { ExportModal } from './ExportModal';

export interface ExportButtonProps<T = any> {
  data: T[];
  columns: ExportColumnDefinition<T>[];
  dataset: string;
  title?: string;
  metadata?: ExportProvenanceMetadata;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  onSuccess?: (result: ExportResult) => void;
  children?: React.ReactNode;
}

export const ExportButton = <T,>({
  data,
  columns,
  dataset,
  title,
  metadata,
  label = 'Export',
  variant = 'secondary',
  size = 'md',
  className = '',
  disabled = false,
  onSuccess,
  children,
}: ExportButtonProps<T>): React.ReactElement => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Variant styling matching design system
  const variantStyles = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-sm border border-blue-500/30',
    secondary:
      'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm',
    ghost:
      'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white',
    outline:
      'bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 rounded',
    md: 'px-3.5 py-1.5 text-xs font-medium gap-2 rounded-lg',
    lg: 'px-4 py-2 text-sm font-medium gap-2 rounded-lg',
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled || !data || data.length === 0}
        aria-label={label}
        className={`inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      >
        {children ? (
          children
        ) : (
          <>
            <Download className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4 text-slate-400 group-hover:text-white'} />
            <span>{label}</span>
          </>
        )}
      </button>

      {isModalOpen && (
        <ExportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={title || `Export ${dataset}`}
          dataset={dataset}
          data={data}
          columns={columns}
          metadata={metadata}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};
