/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 12: Centralized Routing & Operational Alerts Panel
 */

import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle,
  FileWarning,
} from 'lucide-react';
import type { DistanceCalculationResult } from '../../../types/distance-calculator';

interface DistanceAlertsPanelProps {
  result: DistanceCalculationResult;
}

export function DistanceAlertsPanel({ result }: DistanceAlertsPanelProps) {
  const hasPiracy = result.piracy_alerts.length > 0;
  const hasCanalAlerts = result.canal_alerts.some((c) => !c.is_available);
  const hasSeca = result.seca_distance_nm > 0;
  const hasWarnings = result.warnings.length > 0;

  if (!hasWarnings && !hasPiracy && !hasCanalAlerts) {
    return (
      <div
        style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#34d399',
          fontSize: '12px',
        }}
      >
        <CheckCircle size={16} />
        <span>
          <strong>CLEAN ROUTE CLEARANCE:</strong> No active piracy risk zones, canal restrictions, or draft exceedances detected for this passage.
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileWarning size={16} style={{ color: '#fbbf24' }} />
        <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase' }}>
          Operational Alerts & Navigation Directives ({result.warnings.length})
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Piracy Alerts */}
        {result.piracy_alerts.map((alert) => (
          <div
            key={alert.zone_id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: alert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${alert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              fontSize: '12px',
              color: alert.severity === 'CRITICAL' ? '#fca5a5' : '#fde68a',
            }}
          >
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px', color: alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b' }} />
            <div>
              <div style={{ fontWeight: 700 }}>
                {alert.severity}: {alert.zone_name}
              </div>
              <div style={{ fontSize: '11px', marginTop: '2px', color: '#cbd5e1' }}>
                {alert.recommendation}
              </div>
            </div>
          </div>
        ))}

        {/* Canal Restriction Alerts */}
        {result.canal_alerts
          .filter((c) => !c.is_available)
          .map((canal) => (
            <div
              key={canal.canal_name}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '12px',
                color: '#fca5a5',
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
              <div>
                <div style={{ fontWeight: 700 }}>CANAL PASSAGE RESTRICTED: {canal.canal_name}</div>
                <div style={{ fontSize: '11px', marginTop: '2px', color: '#cbd5e1' }}>
                  {canal.reason}
                </div>
              </div>
            </div>
          ))}

        {/* SECA Compliance Notice */}
        {hasSeca && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(192, 132, 252, 0.1)',
              border: '1px solid rgba(192, 132, 252, 0.25)',
              fontSize: '12px',
              color: '#e9d5ff',
            }}
          >
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#c084fc' }} />
            <div>
              <div style={{ fontWeight: 700 }}>MARPOL ANNEX VI SECA DIRECTIVE</div>
              <div style={{ fontSize: '11px', marginTop: '2px', color: '#cbd5e1' }}>
                Vessel must change over to compliant low-sulfur fuel (0.10% m/m LSMGO) prior to entering designated Emission Control Areas ({result.seca_distance_nm.toLocaleString()} NM total).
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
