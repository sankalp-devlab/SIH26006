/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 5: Market Watchlist Drawer
 */

import React from 'react';
import {
  X,
  Star,
  Trash2,
  ArrowRight
} from 'lucide-react';
import type { MarketWatchlistItem } from '../../../../types/market-insights';

interface MarketWatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: MarketWatchlistItem[];
  onSelectRoute: (code: string) => void;
  onRemoveItem: (code: string) => void;
}

export const MarketWatchlistDrawer: React.FC<MarketWatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlist,
  onSelectRoute,
  onRemoveItem
}) => {
  if (!isOpen) return null;

  return (
    <div className="mi-drawer-backdrop" onClick={onClose}>
      <div className="mi-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mi-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Star size={18} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F1F5F9' }}>
              Pinned Market Watchlist
            </h3>
          </div>
          <button
            onClick={onClose}
            className="mi-btn mi-btn-secondary"
            style={{ width: '30px', height: '30px', padding: 0, justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* List Body */}
        <div className="mi-drawer-body">
          {watchlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: '#7189A3', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Star size={28} style={{ color: '#7189A3', strokeWidth: 1.5 }} />
              <p style={{ fontSize: '13px', margin: 0 }}>No markets or corridors pinned yet.</p>
              <p style={{ fontSize: '11.5px', margin: 0, color: '#94A3B8' }}>
                Click the star icon next to any corridor to pin it to your quick-access drawer.
              </p>
            </div>
          ) : (
            watchlist.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectRoute(item.code);
                  onClose();
                }}
                className="mi-drawer-item"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="mi-badge mi-badge-cyan" style={{ fontFamily: 'monospace' }}>
                      {item.code}
                    </span>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', fontWeight: 600 }}>
                      {item.sector} {item.vessel_class ? `• ${item.vessel_class}` : ''}
                    </span>
                  </div>

                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </h4>

                  {item.benchmark_rate !== undefined && (
                    <div style={{ fontSize: '12.5px', fontFamily: 'monospace', fontWeight: 700, color: '#22D3EE' }}>
                      ${item.benchmark_rate.toLocaleString()} <span style={{ fontSize: '11px', color: '#94A3B8' }}>{item.rate_unit}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.code);
                    }}
                    className="mi-btn mi-btn-secondary"
                    style={{ width: '28px', height: '28px', padding: 0, justifyContent: 'center' }}
                    title="Remove from Watchlist"
                  >
                    <Trash2 size={13} style={{ color: '#F43F5E' }} />
                  </button>
                  <ArrowRight size={14} style={{ color: '#7189A3' }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mi-drawer-footer">
          {watchlist.length} Monitored Corridor{watchlist.length !== 1 ? 's' : ''} Saved
        </div>
      </div>
    </div>
  );
};

