import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      isLoading = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
    const variantClass = `btn-${variant}`;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
        {...props}
      >
        {isLoading ? (
          <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
        ) : (
          icon
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
