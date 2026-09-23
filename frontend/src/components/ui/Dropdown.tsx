import React, { useState, useRef, useEffect } from 'react';

export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
  header?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`dropdown-container ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ display: 'inline-flex', cursor: 'pointer' }}>
        {trigger}
      </div>

      {isOpen && (
        <div className="dropdown-menu" style={{ [align]: 0 }}>
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={`divider-${index}`} className="dropdown-divider" />;
            }
            if (item.header) {
              return (
                <div key={`header-${index}`} className="dropdown-header">
                  {item.label}
                </div>
              );
            }
            const renderItemIcon = () => {
              if (!item.icon) return null;
              if (React.isValidElement(item.icon)) return item.icon;
              if (typeof item.icon === 'function' || (typeof item.icon === 'object' && item.icon !== null && ('render' in item.icon || '$$typeof' in item.icon))) {
                const IconComp = item.icon as unknown as React.ComponentType<{ size?: number; className?: string }>;
                return <IconComp size={14} />;
              }
              return <span>{item.icon}</span>;
            };

            return (
              <button
                key={item.key}
                type="button"
                className={`dropdown-item ${item.danger ? 'danger' : ''}`}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick?.();
                }}
              >
                {item.icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{renderItemIcon()}</span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
