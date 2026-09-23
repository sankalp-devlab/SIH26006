/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Voyage Workbooks Management Modal
 */

import React from 'react';
import { BookOpen, ArrowRight, Check } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import type { VoyageWorkbook } from '../../../types/voyage-calculator';

interface VoyageWorkbooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  workbooks: VoyageWorkbook[];
  activeWorkbookId: string;
  onSwitchWorkbook: (workbookId: string) => void;
}

export const VoyageWorkbooksModal: React.FC<VoyageWorkbooksModalProps> = ({
  isOpen,
  onClose,
  workbooks,
  activeWorkbookId,
  onSwitchWorkbook,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Commercial Voyage Workbooks"
      maxWidth="640px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--voyage-text-secondary)' }}>
          Select an operational workbook to load saved voyage models or switch trading corridors:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {workbooks.map((wb) => {
            const isActive = wb.id === activeWorkbookId;
            return (
              <div
                key={wb.id}
                style={{
                  border: `1.5px solid ${isActive ? 'var(--voyage-cyan)' : 'var(--voyage-border)'}`,
                  backgroundColor: isActive ? 'rgba(0, 217, 255, 0.08)' : 'var(--voyage-surface-secondary)',
                  borderRadius: '10px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: isActive ? '0 0 16px rgba(0, 217, 255, 0.15)' : 'none',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <BookOpen size={16} style={{ color: isActive ? 'var(--voyage-cyan)' : 'var(--voyage-text-muted)' }} />
                    <span style={{ fontWeight: 700, fontSize: '14px', color: isActive ? 'var(--voyage-cyan)' : 'var(--voyage-text)' }}>
                      {wb.name}
                    </span>
                    {isActive && (
                      <span className="badge badge-info" style={{ fontSize: '10px' }}>
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--voyage-text-secondary)', lineHeight: 1.4 }}>
                    {wb.description}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--voyage-text-muted)', marginTop: '6px' }}>
                    {wb.voyages.length} saved voyage{wb.voyages.length > 1 ? 's' : ''} • Last updated: {new Date(wb.updated_at).toLocaleDateString()}
                  </div>
                </div>

                <button
                  type="button"
                  className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => {
                    onSwitchWorkbook(wb.id);
                    onClose();
                  }}
                  style={{ height: '34px', fontSize: '12px', padding: '0 14px', whiteSpace: 'nowrap', gap: '6px' }}
                >
                  {isActive ? <Check size={14} /> : <ArrowRight size={14} />}
                  <span>{isActive ? 'Current' : 'Load Workbook'}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--voyage-border)' }}>
          <button type="button" className="btn btn-secondary" style={{ height: '34px', fontSize: '12px', padding: '0 16px' }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
