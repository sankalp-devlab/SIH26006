/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 12: Distance Calculator Header
 */

import React, { useState } from 'react';
import {
  Ruler,
  Compass,
  MapPin,
  Ship,
  FolderOpen,
  Copy,
  Download,
  ArrowRight,
  Calculator,
  Edit2,
  Check,
} from 'lucide-react';
import type { RoutingMode, DistanceCalculationRecord } from '../../../types/distance-calculator';

interface DistanceCalculatorHeaderProps {
  record: DistanceCalculationRecord;
  onModeChange: (mode: RoutingMode) => void;
  onRename: (title: string) => void;
  onOpenWorkbooks: () => void;
  onDuplicate: () => void;
  onExportCsv: () => void;
  onExportToVoyageCalculator: () => void;
}

export function DistanceCalculatorHeader({
  record,
  onModeChange,
  onRename,
  onOpenWorkbooks,
  onDuplicate,
  onExportCsv,
  onExportToVoyageCalculator,
}: DistanceCalculatorHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(record.title);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedTitle.trim()) {
      onRename(editedTitle.trim());
      setIsEditingTitle(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '16px 20px',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 25, 47, 0.95) 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.4)',
        marginBottom: '20px',
      }}
    >
      {/* Left: Module Title & Editable Record Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
          }}
        >
          <Ruler size={22} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.15)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              MODULE 12 • OPERATIONAL WORKSPACE
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Maritime Routing & Distance Engine
            </span>
          </div>

          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                autoFocus
                style={{
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #38bdf8',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Check size={14} />
              </button>
            </form>
          ) : (
            <div
              onClick={() => {
                setEditedTitle(record.title);
                setIsEditingTitle(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                marginTop: '4px',
              }}
              title="Click to rename route calculation"
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#f8fafc',
                }}
              >
                {record.title}
              </h1>
              <Edit2 size={13} style={{ color: '#64748b' }} />
            </div>
          )}
        </div>
      </div>

      {/* Center: Routing Mode Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid rgba(148, 163, 184, 0.15)',
        }}
      >
        <button
          type="button"
          onClick={() => onModeChange('port_to_port')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: record.mode === 'port_to_port' ? '#0284c7' : 'transparent',
            color: record.mode === 'port_to_port' ? '#ffffff' : '#94a3b8',
          }}
        >
          <Compass size={14} />
          Port → Port
        </button>

        <button
          type="button"
          onClick={() => onModeChange('point_to_port')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: record.mode === 'point_to_port' ? '#0284c7' : 'transparent',
            color: record.mode === 'point_to_port' ? '#ffffff' : '#94a3b8',
          }}
        >
          <MapPin size={14} />
          Point → Port
        </button>

        <button
          type="button"
          onClick={() => onModeChange('vessel_to_port')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: record.mode === 'vessel_to_port' ? '#0284c7' : 'transparent',
            color: record.mode === 'vessel_to_port' ? '#ffffff' : '#94a3b8',
          }}
        >
          <Ship size={14} />
          Vessel → Port
        </button>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onOpenWorkbooks}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '6px',
            color: '#cbd5e1',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <FolderOpen size={14} style={{ color: '#38bdf8' }} />
          Saved Routes
        </button>

        <button
          type="button"
          onClick={onDuplicate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '6px',
            color: '#cbd5e1',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
          title="Duplicate Route Calculation"
        >
          <Copy size={14} />
          Duplicate
        </button>

        <button
          type="button"
          onClick={onExportCsv}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '6px',
            color: '#cbd5e1',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
          title="Export CSV Voyage Recap"
        >
          <Download size={14} />
          Export CSV
        </button>

        <button
          type="button"
          onClick={onExportToVoyageCalculator}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
          }}
          title="Pre-populate calculated legs into Module 11 Voyage Calculator"
        >
          <Calculator size={14} />
          Use in Voyage Calculator
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
