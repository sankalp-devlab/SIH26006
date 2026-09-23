/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 32: DATA SOURCES, PROVENANCE & FRESHNESS ARCHITECTURE
 * Compact Freshness Indicator Dot & Tooltip
 */

import React from 'react';
import type { DataFreshnessLevel } from '../../types/provenance';

interface FreshnessIndicatorProps {
  level: DataFreshnessLevel;
  humanizedAge?: string;
  showText?: boolean;
  pulse?: boolean;
  className?: string;
}

export const FreshnessIndicator: React.FC<FreshnessIndicatorProps> = ({
  level,
  humanizedAge,
  showText = true,
  pulse = true,
  className = '',
}) => {
  const getColor = () => {
    switch (level) {
      case 'LIVE':
        return '#10b981';
      case 'RECENT':
        return '#38bdf8';
      case 'STALE':
        return '#f59e0b';
      case 'HISTORICAL':
        return '#818cf8';
      case 'PREDICTED':
        return '#c084fc';
      default:
        return '#64748b';
    }
  };

  const color = getColor();
  const shouldPulse = pulse && level === 'LIVE';

  return (
    <span
      className={`freshness-indicator ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: '0.72rem',
        fontWeight: 600,
        color: '#94a3b8',
      }}
      title={`Data Freshness: ${level}${humanizedAge ? ` (${humanizedAge})` : ''}`}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
          boxShadow: shouldPulse ? `0 0 6px ${color}` : 'none',
          flexShrink: 0,
        }}
      />
      {showText && (
        <span style={{ color }}>
          {level}
          {humanizedAge && <span style={{ color: '#64748b', fontWeight: 400, marginLeft: 3 }}>({humanizedAge})</span>}
        </span>
      )}
    </span>
  );
};
