import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="input-group">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <div className="input-wrapper">
          {icon && <span className="input-icon">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`form-input ${icon ? 'has-icon' : ''} ${className}`.trim()}
            {...props}
          />
        </div>
        {error && <span className="text-xs" style={{ color: 'var(--color-status-danger)' }}>{error}</span>}
        {helperText && !error && <span className="text-xs text-muted">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
