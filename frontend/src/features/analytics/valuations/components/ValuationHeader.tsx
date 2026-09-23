/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Valuation Command Center Header & Vessel Selector
 */

import { useState, useRef, useEffect } from 'react';
import {
  DollarSign,
  Search,
  Download,
  RefreshCw,
  GitCompare,
  Star,
  Clock,
  ChevronDown,
  X,
  FileSpreadsheet,
  FileCode,
  Radio,
} from 'lucide-react';
import type {
  VesselValuationRecord,
  ValuationCurrency,
  DataFreshnessStatus,
} from '../../../../types/valuations';

interface ValuationHeaderProps {
  vessels: VesselValuationRecord[];
  selectedVessel: VesselValuationRecord;
  onSelectVessel: (id: number) => void;
  recentVesselIds: number[];
  favoriteVesselIds: number[];
  onToggleFavorite: (id: number) => void;
  currency: ValuationCurrency;
  onCurrencyChange: (c: ValuationCurrency) => void;
  freshnessStatus: DataFreshnessStatus;
  lastUpdated: string;
  isLive: boolean;
  onToggleLive: (live: boolean) => void;
  onRefresh: () => void;
  onOpenCompare: () => void;
  compareCount: number;
  onExportVesselCsv: () => void;
  onExportHistoryCsv: () => void;
  onExportComparablesCsv: () => void;
  onExportReportJson: () => void;
  isLoading?: boolean;
}

export function ValuationHeader({
  vessels,
  selectedVessel,
  onSelectVessel,
  recentVesselIds,
  favoriteVesselIds,
  onToggleFavorite,
  currency,
  onCurrencyChange,
  freshnessStatus,
  lastUpdated,
  isLive,
  onToggleLive,
  onRefresh,
  onOpenCompare,
  compareCount,
  onExportVesselCsv,
  onExportHistoryCsv,
  onExportComparablesCsv,
  onExportReportJson,
  isLoading = false,
}: ValuationHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = vessels.filter((v) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return false;
    return (
      v.name.toLowerCase().includes(q) ||
      v.imoNumber.toLowerCase().includes(q) ||
      v.vesselClass.toLowerCase().includes(q) ||
      v.registeredOwner.toLowerCase().includes(q)
    );
  });

  const recentVessels = vessels.filter((v) => recentVesselIds.includes(v.id));
  const isFavorite = favoriteVesselIds.includes(selectedVessel.id);

  return (
    <div
      style={{
        background: '#0d1829',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.25rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Top Title & Command Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        {/* Title & Freshness Tag */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #0066cc 0%, #003366 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(0, 102, 204, 0.4)',
              }}
            >
              <DollarSign size={18} />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  letterSpacing: '0.02em',
                }}
              >
                VESSEL VALUATION INTELLIGENCE
              </h1>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                Market-based vessel valuation, historical pricing, and asset intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Data Freshness Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '6px',
              background: freshnessStatus === 'LIVE_SIGNAL_API' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(56, 189, 248, 0.12)',
              border: freshnessStatus === 'LIVE_SIGNAL_API' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: freshnessStatus === 'LIVE_SIGNAL_API' ? '#10b981' : '#38bdf8',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: freshnessStatus === 'LIVE_SIGNAL_API' ? '#10b981' : '#38bdf8',
                boxShadow: freshnessStatus === 'LIVE_SIGNAL_API' ? '0 0 8px #10b981' : '0 0 8px #38bdf8',
              }}
            />
            <span>{freshnessStatus === 'LIVE_SIGNAL_API' ? '● LIVE SIGNAL API' : '● SIMULATED BENCHMARK'}</span>
            <span style={{ color: '#64748b', marginLeft: '4px' }}>| {lastUpdated}</span>
          </div>

          {/* Currency Switcher */}
          <div
            style={{
              display: 'flex',
              background: '#0a111c',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '2px',
            }}
          >
            {(['USD', 'EUR', 'GBP'] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => onCurrencyChange(curr)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: currency === curr ? '#0066cc' : 'transparent',
                  color: currency === curr ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.15s ease',
                }}
              >
                {curr === 'USD' ? '$ USD' : curr === 'EUR' ? '€ EUR' : '£ GBP'}
              </button>
            ))}
          </div>

          {/* Live / Simulated Toggle */}
          <button
            type="button"
            onClick={() => onToggleLive(!isLive)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              background: isLive ? 'rgba(16, 185, 129, 0.15)' : '#0a111c',
              border: isLive ? '1px solid #10b981' : '1px solid #1e293b',
              color: isLive ? '#10b981' : '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Radio size={12} />
            <span>{isLive ? 'Live Mode' : 'Benchmark Mode'}</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh valuation data"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: '#0a111c',
              border: '1px solid #1e293b',
              color: '#94a3b8',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {/* Compare Vessels Modal Trigger */}
          <button
            type="button"
            onClick={onOpenCompare}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '6px',
              background: compareCount > 0 ? 'rgba(0, 102, 204, 0.2)' : '#0a111c',
              border: compareCount > 0 ? '1px solid #0066cc' : '1px solid #1e293b',
              color: compareCount > 0 ? '#38bdf8' : '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <GitCompare size={14} />
            <span>Compare ({compareCount})</span>
          </button>

          {/* Export Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '6px',
                background: '#0066cc',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 102, 204, 0.4)',
              }}
            >
              <Download size={13} />
              <span>Export</span>
              <ChevronDown size={12} />
            </button>

            {isExportMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  width: '210px',
                  background: '#0a111c',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  zIndex: 500,
                  padding: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onExportVesselCsv();
                    setIsExportMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#f8fafc',
                    fontSize: '0.75rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <FileSpreadsheet size={14} style={{ color: '#10b981' }} />
                  <span>Vessel Dossier (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExportHistoryCsv();
                    setIsExportMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#f8fafc',
                    fontSize: '0.75rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <FileSpreadsheet size={14} style={{ color: '#38bdf8' }} />
                  <span>5-Year History (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExportComparablesCsv();
                    setIsExportMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#f8fafc',
                    fontSize: '0.75rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <FileSpreadsheet size={14} style={{ color: '#f59e0b' }} />
                  <span>Comparable Peers (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExportReportJson();
                    setIsExportMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#f8fafc',
                    fontSize: '0.75rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <FileCode size={14} style={{ color: '#ec4899' }} />
                  <span>Full Dossier (JSON)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vessel Selector & Quick Recents Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          paddingTop: '0.75rem',
          borderTop: '1px solid #1e293b',
        }}
      >
        {/* Search & Autocomplete Input Container */}
        <div ref={searchDropdownRef} style={{ position: 'relative', width: '320px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#0a111c',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '6px 10px',
            }}
          >
            <Search size={14} style={{ color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search vessel by name, IMO, class..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: '0.75rem',
                width: '100%',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setIsSearchOpen(false);
                }}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '100%',
                maxHeight: '260px',
                overflowY: 'auto',
                background: '#0a111c',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                zIndex: 600,
                marginTop: '4px',
                padding: '4px',
              }}
            >
              {searchResults.length > 0 ? (
                searchResults.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      onSelectVessel(v.id);
                      setIsSearchOpen(false);
                      setSearchTerm('');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      background: v.id === selectedVessel.id ? 'rgba(0, 102, 204, 0.2)' : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = v.id === selectedVessel.id ? 'rgba(0, 102, 204, 0.2)' : 'transparent')
                    }
                  >
                    <div>
                      <div style={{ color: '#f8fafc', fontSize: '0.8125rem', fontWeight: 600 }}>{v.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.6875rem' }}>
                        {v.imoNumber} &bull; {v.vesselClass} &bull; {v.dwt.toLocaleString()} DWT
                      </div>
                    </div>
                    <span
                      style={{
                        color: '#38bdf8',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      ${v.currentMarketValueUsdM.toFixed(1)}M
                    </span>
                  </button>
                ))
              ) : searchTerm ? (
                <div style={{ padding: '8px', color: '#64748b', fontSize: '0.75rem', textAlign: 'center' }}>
                  No matching vessels found
                </div>
              ) : (
                <div style={{ padding: '4px' }}>
                  <div style={{ padding: '4px 8px', fontSize: '0.6875rem', color: '#64748b', fontWeight: 700 }}>
                    ALL COMMERCIAL ASSETS ({vessels.length})
                  </div>
                  {vessels.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        onSelectVessel(v.id);
                        setIsSearchOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        background: v.id === selectedVessel.id ? 'rgba(0, 102, 204, 0.2)' : 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = v.id === selectedVessel.id ? 'rgba(0, 102, 204, 0.2)' : 'transparent')
                      }
                    >
                      <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>{v.name} ({v.vesselClass})</span>
                      <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontFamily: 'var(--font-mono, monospace)' }}>
                        ${v.currentMarketValueUsdM.toFixed(1)}M
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Favorite Toggle Button for active vessel */}
        <button
          type="button"
          onClick={() => onToggleFavorite(selectedVessel.id)}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            borderRadius: '6px',
            background: isFavorite ? 'rgba(245, 158, 11, 0.15)' : '#0a111c',
            border: isFavorite ? '1px solid #f59e0b' : '1px solid #1e293b',
            color: isFavorite ? '#f59e0b' : '#64748b',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <Star size={13} fill={isFavorite ? '#f59e0b' : 'none'} />
          <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
        </button>

        {/* Recent Vessels Quick Selection Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.6875rem' }}>
            <Clock size={12} />
            <span>Recents:</span>
          </div>
          {recentVessels.map((rv) => (
            <button
              key={rv.id}
              type="button"
              onClick={() => onSelectVessel(rv.id)}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                border: rv.id === selectedVessel.id ? '1px solid #0066cc' : '1px solid #1e293b',
                background: rv.id === selectedVessel.id ? 'rgba(0, 102, 204, 0.2)' : '#0a111c',
                color: rv.id === selectedVessel.id ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {rv.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
