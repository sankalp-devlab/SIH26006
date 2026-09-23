/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Compact Professional Vessel Identity Header Card
 */

import {
  Ship,
  Calendar,
  Building2,
  Navigation,
  MapPin,
  Flag,
} from 'lucide-react';
import type { VesselValuationRecord } from '../../../../types/valuations';

interface VesselIdentityCardProps {
  vessel: VesselValuationRecord;
}

export function VesselIdentityCard({ vessel }: VesselIdentityCardProps) {
  const statusColors = {
    'In Transit': { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
    'At Anchorage': { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
    'Moored': { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' },
    'Drydock': { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
  };

  const statusStyle = statusColors[vessel.status] || statusColors['In Transit'];

  return (
    <div
      style={{
        background: '#0d1829',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.25rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Left: Vessel Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '8px',
              background: 'rgba(0, 102, 204, 0.15)',
              border: '1px solid rgba(0, 102, 204, 0.3)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Ship size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                {vessel.name}
              </h2>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                {vessel.imoNumber}
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  background: statusStyle.bg,
                  color: statusStyle.text,
                  border: `1px solid ${statusStyle.border}`,
                }}
              >
                {vessel.status}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '0.35rem',
                fontSize: '0.75rem',
                color: '#94a3b8',
                flexWrap: 'wrap',
              }}
            >
              <span>{vessel.vesselClass} ({vessel.marketSegment})</span>
              <span>&bull;</span>
              <span>{vessel.dwt.toLocaleString()} DWT ({vessel.grossTonnage.toLocaleString()} GT)</span>
              <span>&bull;</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flag size={12} style={{ color: '#cbd5e1' }} />
                <span>{vessel.flag}</span>
              </span>
              {vessel.currentPort && (
                <>
                  <span>&bull;</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#cbd5e1' }}>
                    <MapPin size={12} style={{ color: '#38bdf8' }} />
                    <span>{vessel.currentPort}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Key Specification Badges */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: '#0a111c',
              border: '1px solid #1e293b',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.6875rem' }}>
              <Calendar size={12} />
              <span>AGE / VINTAGE</span>
            </div>
            <div style={{ color: '#f8fafc', fontSize: '0.9375rem', fontWeight: 700, marginTop: '2px' }}>
              {vessel.ageYears.toFixed(1)} yrs <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 400 }}>({vessel.yearBuilt})</span>
            </div>
          </div>

          <div
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: '#0a111c',
              border: '1px solid #1e293b',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.6875rem' }}>
              <Building2 size={12} />
              <span>REGISTERED OWNER</span>
            </div>
            <div style={{ color: '#f8fafc', fontSize: '0.8125rem', fontWeight: 600, marginTop: '2px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {vessel.registeredOwner}
            </div>
          </div>

          <div
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: '#0a111c',
              border: '1px solid #1e293b',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.6875rem' }}>
              <Navigation size={12} />
              <span>OPERATOR / POOL</span>
            </div>
            <div style={{ color: '#38bdf8', fontSize: '0.8125rem', fontWeight: 600, marginTop: '2px', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {vessel.commercialOperator}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
