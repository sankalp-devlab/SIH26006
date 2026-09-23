import React, { useState } from 'react';
import {
  Code,
  Play,
  AlertCircle,
  Database,
  HelpCircle,
  Sparkles,
  X,
} from 'lucide-react';
import type { EntitySchema } from '../../../types/data-query';

interface CustomQueryEditorProps {
  isOpen: boolean;
  onClose: () => void;
  sqlText: string;
  onSqlChange: (sql: string) => void;
  onExecute: (sql: string) => void;
  error: string | null;
  schemas: Record<string, EntitySchema>;
}

export const CustomQueryEditor: React.FC<CustomQueryEditorProps> = ({
  isOpen,
  onClose,
  sqlText,
  onSqlChange,
  onExecute,
  error,
  schemas,
}) => {
  const [activeSchemaTab, setActiveSchemaTab] = useState<string>('freight_rates');

  if (!isOpen) return null;

  const sampleQueries = [
    {
      name: 'High VLCC Fixtures',
      sql: 'SELECT date, corridorOrRoute, vesselClass, rateTceUsdPerDay FROM freight_rates ORDER BY rateTceUsdPerDay DESC LIMIT 50',
    },
    {
      name: 'Ton-Mile Disruption 2024',
      sql: 'SELECT date, cargoCommodity, volumeMetricTons, tonMilesBillion FROM trade_flows ORDER BY tonMilesBillion DESC LIMIT 40',
    },
    {
      name: 'Port Waiting Queues',
      sql: 'SELECT date, originRegion, vesselClass, waitingDaysAtPort FROM port_congestion ORDER BY waitingDaysAtPort DESC LIMIT 50',
    },
    {
      name: 'Fleet Decarbonization Logs',
      sql: 'SELECT date, vesselClass, marketSegment, co2EmissionsMt FROM fleet_emissions ORDER BY co2EmissionsMt DESC LIMIT 30',
    },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--ol-surface-primary, #091B2E)',
        border: '1px solid rgba(0, 212, 255, 0.4)',
        borderRadius: 'var(--ol-radius-lg, 12px)',
        padding: '20px 24px',
        boxShadow: 'var(--ol-shadow-lg, 0 10px 25px rgba(0,0,0,0.3))',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--ol-border, #183A52)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: 'var(--ol-radius-sm, 6px)',
              backgroundColor: 'rgba(0, 212, 255, 0.12)',
              color: 'var(--ol-cyan, #00D4FF)',
              border: '1px solid rgba(0, 212, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Code size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                Declarative SQL Query Console
              </h3>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono, monospace)',
                  backgroundColor: 'rgba(0, 212, 255, 0.15)',
                  color: 'var(--ol-cyan, #00D4FF)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                LIVE ENGINE
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--ol-text-muted, #94A3B8)' }}>
              Query canonical tables directly using standard SQL declarative syntax (SELECT, WHERE, ORDER BY, LIMIT)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => onExecute(sqlText)}
            className="ol-btn ol-btn-primary"
            style={{ height: '36px', padding: '0 16px' }}
          >
            <Play size={14} style={{ fill: 'currentColor' }} />
            <span>Execute SQL</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ol-text-muted, #94A3B8)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--ol-radius-sm, 6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ol-text-primary, #F1F5F9)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ol-text-muted, #94A3B8)')}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* SQL Editor Area & Schema Reference Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Editor TextArea */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
          <textarea
            value={sqlText}
            onChange={(e) => onSqlChange(e.target.value)}
            rows={7}
            placeholder="SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT ..."
            style={{
              width: '100%',
              backgroundColor: 'var(--ol-bg-deep, #040E19)',
              border: '1px solid var(--ol-border, #183A52)',
              borderRadius: 'var(--ol-radius-md, 8px)',
              padding: '14px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--ol-cyan, #00D4FF)',
              outline: 'none',
              lineHeight: 1.7,
              resize: 'vertical',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--ol-cyan, #00D4FF)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--ol-border, #183A52)')}
          />

          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--ol-radius-md, 6px)',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '12px',
                color: '#f87171',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <AlertCircle size={15} style={{ color: 'var(--ol-red, #EF4444)', flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick SQL Templates */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', paddingTop: '2px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ol-text-muted, #94A3B8)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} style={{ color: 'var(--ol-amber, #F59E0B)' }} />
              Sample Queries:
            </span>
            {sampleQueries.map((q) => (
              <button
                key={q.name}
                type="button"
                onClick={() => {
                  onSqlChange(q.sql);
                  onExecute(q.sql);
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--ol-radius-sm, 6px)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: '1px solid var(--ol-border, #183A52)',
                  backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
                  color: 'var(--ol-text-secondary, #94A3B8)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--ol-cyan, #00D4FF)';
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--ol-text-secondary, #94A3B8)';
                  e.currentTarget.style.borderColor = 'var(--ol-border, #183A52)';
                }}
              >
                {q.name}
              </button>
            ))}
          </div>
        </div>

        {/* Schema Explorer */}
        <div
          style={{
            backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
            border: '1px solid var(--ol-border, #183A52)',
            borderRadius: 'var(--ol-radius-md, 8px)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ol-text-muted, #94A3B8)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={13} style={{ color: 'var(--ol-blue, #3B82F6)' }} /> Table Catalog Schemas
            </span>
            <HelpCircle size={13} style={{ color: 'var(--ol-text-muted, #94A3B8)' }} />
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              borderBottom: '1px solid var(--ol-border, #183A52)',
              paddingBottom: '8px',
            }}
          >
            {Object.keys(schemas).map((entKey) => (
              <button
                key={entKey}
                type="button"
                onClick={() => setActiveSchemaTab(entKey)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--ol-radius-sm, 4px)',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono, monospace)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  border: activeSchemaTab === entKey
                    ? '1px solid rgba(0, 212, 255, 0.45)'
                    : '1px solid transparent',
                  backgroundColor: activeSchemaTab === entKey
                    ? 'rgba(0, 212, 255, 0.12)'
                    : 'transparent',
                  color: activeSchemaTab === entKey
                    ? 'var(--ol-cyan, #00D4FF)'
                    : 'var(--ol-text-muted, #94A3B8)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {entKey}
              </button>
            ))}
          </div>

          <div
            style={{
              maxHeight: '180px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              paddingRight: '4px',
            }}
          >
            {schemas[activeSchemaTab]?.fields.map((f) => (
              <div
                key={f.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderRadius: 'var(--ol-radius-sm, 4px)',
                  transition: 'background-color 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ol-surface-elevated, #102B45)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ color: 'var(--ol-text-primary, #F1F5F9)', fontWeight: 600 }}>{f.name}</span>
                <span
                  style={{
                    fontSize: '10px',
                    color: f.type === 'number' ? 'var(--ol-cyan, #00D4FF)' : f.type === 'date' ? 'var(--ol-amber, #F59E0B)' : 'var(--ol-text-muted, #94A3B8)',
                  }}
                >
                  {f.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
