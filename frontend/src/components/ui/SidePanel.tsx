import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = '460px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="side-panel-backdrop" onClick={onClose} />
      <div className={`side-panel ${isOpen ? 'open' : ''}`} style={{ width }} role="dialog">
        <div className="side-panel-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
            {subtitle && (
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</p>
            )}
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close panel">
            <X size={18} />
          </button>
        </div>
        <div className="side-panel-body">{children}</div>
      </div>
    </>
  );
};
