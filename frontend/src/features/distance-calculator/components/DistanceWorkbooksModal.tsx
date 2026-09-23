/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 12: Distance Calculator Saved Calculations Modal
 */

import {
  X,
  FolderOpen,
  Trash2,
  Copy,
} from 'lucide-react';
import type { DistanceCalculationWorkbook } from '../../../types/distance-calculator';

interface DistanceWorkbooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  workbook: DistanceCalculationWorkbook;
  onSelectCalculation: (id: string) => void;
  onDuplicateCalculation: () => void;
  onDeleteCalculation: (id: string) => void;
}

export function DistanceWorkbooksModal({
  isOpen,
  onClose,
  workbook,
  onSelectCalculation,
  onDuplicateCalculation,
  onDeleteCalculation,
}: DistanceWorkbooksModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#0f172a',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '650px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FolderOpen size={20} style={{ color: '#38bdf8' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
                Saved Distance & Routing Workbooks
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Switch between saved commercial routing evaluations and passage plans
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list */}
        <div
          style={{
            padding: '16px 20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {workbook.calculations.map((calc) => {
            const isActive = calc.id === workbook.active_id;

            return (
              <div
                key={calc.id}
                style={{
                  background: isActive ? 'rgba(2, 132, 199, 0.12)' : 'rgba(30, 41, 59, 0.5)',
                  border: `1.5px solid ${isActive ? '#0284c7' : 'rgba(148, 163, 184, 0.2)'}`,
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
                      {calc.title}
                    </h3>
                    {isActive && (
                      <span
                        style={{
                          background: '#0284c7',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '3px',
                          textTransform: 'uppercase',
                        }}
                      >
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'flex', gap: '12px' }}>
                    <span>Mode: <strong style={{ color: '#cbd5e1' }}>{calc.mode.replace(/_/g, ' ')}</strong></span>
                    <span>Speed: <strong style={{ color: '#cbd5e1' }}>{calc.speed_knots} kn</strong></span>
                    <span>Margin: <strong style={{ color: '#cbd5e1' }}>+{calc.weather_margin_pct}%</strong></span>
                    <span>Updated: {new Date(calc.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCalculation(calc.id);
                        onClose();
                      }}
                      style={{
                        padding: '6px 12px',
                        background: '#0284c7',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Open
                    </button>
                  )}

                  {workbook.calculations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteCalculation(calc.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '4px',
                        color: '#f87171',
                        cursor: 'pointer',
                        padding: '5px 8px',
                      }}
                      title="Delete Calculation"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(148, 163, 184, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => {
              onDuplicateCalculation();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '6px',
              color: '#cbd5e1',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <Copy size={13} />
            Duplicate Current Route
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 16px',
              background: '#334155',
              border: 'none',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
