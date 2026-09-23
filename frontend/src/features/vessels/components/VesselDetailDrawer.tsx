import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  X,
  Ship,
  MapPin,
  Copy,
  Check,
  Star,
  Layers,
  Briefcase,
  Leaf,
  DollarSign,
  ShieldCheck,
  Radio,
  ExternalLink,
} from 'lucide-react';

import { StatusBadge } from '../../../components/data-display/StatusBadge';
import { useFavourites } from '../../../hooks/useFavourites';
import { VesselIntelligenceService } from '../../../services/vessels/vessel-intelligence.service';
import { provenanceService } from '../../../services/provenance/provenance.service';
import { DataSourceOrigin } from '../../../types/provenance';
import { ProvenanceBadge } from '../../../components/provenance';
import type { Vessel } from '../../../types/vessel';
import type { VesselDetailTab, EnrichedVesselDetail } from '../../../types/vessel-detail';

import { OverviewTab } from './tabs/OverviewTab';
import { CommercialTab } from './tabs/CommercialTab';
import { EnvironmentTab } from './tabs/EnvironmentTab';
import { ValuationTab } from './tabs/ValuationTab';
import { ComplianceTab } from './tabs/ComplianceTab';

interface VesselDetailDrawerProps {
  vessel: Vessel | null;
  onClose: () => void;
  initialTab?: VesselDetailTab;
}

export function VesselDetailDrawer({
  vessel,
  onClose,
  initialTab = 'overview',
}: VesselDetailDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isFavourite, toggle: toggleFavourite } = useFavourites();

  const [activeTab, setActiveTab] = useState<VesselDetailTab>(initialTab);
  const [copiedImo, setCopiedImo] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Sync initial tab if changed
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Keyboard Escape dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Compute rich intelligence
  const enriched: EnrichedVesselDetail | null = useMemo(() => {
    if (!vessel) return null;
    return VesselIntelligenceService.enrich(vessel);
  }, [vessel]);

  const vesselProvenance = useMemo(() => {
    if (!vessel) return undefined;
    return provenanceService.createTelemetryProvenance({
      origin: DataSourceOrigin.AIS_SATELLITE,
      sourceName: 'Spire / exactEarth Terrestrial & Satellite AIS Stream',
      timestamp: (vessel as any).updated_at || (vessel as any).last_position_update || new Date().toISOString(),
      entityId: `vessel-${vessel.imo_number || vessel.id}`,
      metadata: {
        imo: vessel.imo_number,
        mmsi: (vessel as any).mmsi,
        coordinates: (vessel as any).latitude && (vessel as any).longitude ? `${(vessel as any).latitude}, ${(vessel as any).longitude}` : undefined,
      },
    });
  }, [vessel]);

  if (!vessel || !enriched) return null;

  const handleCopyImo = () => {
    if (vessel.imo_number) {
      navigator.clipboard.writeText(vessel.imo_number);
      setCopiedImo(true);
      setTimeout(() => setCopiedImo(false), 2000);
    }
  };

  const handleTrackOnMap = () => {
    if (location.pathname === '/map') {
      // If already on map, update URL param or let parent handle
      navigate(`/map?vessel=${vessel.id}`, { replace: true });
    } else {
      navigate(`/map?vessel=${vessel.id}`);
    }
  };

  const vesselPath = `/vessels?vessel=${vessel.id}`;
  const isFav = isFavourite(vesselPath);

  const tabs: { id: VesselDetailTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Layers size={14} /> },
    { id: 'commercial', label: 'Commercial', icon: <Briefcase size={14} /> },
    { id: 'environment', label: 'Environmental', icon: <Leaf size={14} /> },
    { id: 'valuation', label: 'Valuation', icon: <DollarSign size={14} /> },
    { id: 'compliance', label: 'Compliance', icon: <ShieldCheck size={14} /> },
  ];

  return (
    <div className="vdd-overlay" onClick={onClose} role="presentation">
      <div
        className="vdd-drawer"
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Vessel Intelligence: ${vessel.name}`}
      >
        {/* DRAWER HEADER */}
        <div className="vdd-header">
          <div className="vdd-header-main">
            <div className="vdd-avatar">
              <Ship size={24} />
            </div>
            <div className="vdd-title-wrap">
              <div className="vdd-name-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 className="vdd-vessel-name">{vessel.name}</h2>
                <StatusBadge status={vessel.status} />
                {vesselProvenance && <ProvenanceBadge provenance={vesselProvenance} showInspector />}
              </div>
              <div className="vdd-meta-row">
                {vessel.imo_number && (
                  <span className="vdd-imo-tag">
                    IMO {vessel.imo_number}
                    <button
                      className="vdd-copy-btn"
                      onClick={handleCopyImo}
                      title="Copy IMO Number"
                      aria-label="Copy IMO"
                    >
                      {copiedImo ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                    </button>
                  </span>
                )}
                <span className="vdd-bullet">&middot;</span>
                <span className="vdd-type-tag">{vessel.vessel_type || 'Bulk Carrier'}</span>
                <span className="vdd-bullet">&middot;</span>
                <span className="vdd-flag-tag">{vessel.flag || 'Liberia'}</span>
                <span className="vdd-bullet">&middot;</span>
                <span className="vdd-dwt-tag">
                  {vessel.capacity_tons ? `${vessel.capacity_tons.toLocaleString()} MT DWT` : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="vdd-header-actions">
            {/* Track on Live Map */}
            <button
              className="vdd-action-pill highlight"
              onClick={handleTrackOnMap}
              title="Track on Live Geospatial Map"
            >
              <MapPin size={13} />
              <span>Track on Map</span>
            </button>

            {/* Open Full Dashboard */}
            <button
              className="vdd-action-pill"
              onClick={() => {
                onClose();
                navigate(`/vessels/${vessel.id}`);
              }}
              title="Open full dedicated Vessels Dashboard"
            >
              <ExternalLink size={13} />
              <span>Full Dashboard</span>
            </button>

            {/* Watchlist Favorite Toggle */}
            <button
              className={`vdd-action-icon-btn ${isFav ? 'favorited' : ''}`}
              onClick={() =>
                toggleFavourite({
                  id: `vessel-${vessel.id}`,
                  name: vessel.name,
                  path: vesselPath,
                  icon: 'Ship',
                })
              }
              title={isFav ? 'Remove from Watchlist' : 'Add to Watchlist'}
              aria-label="Toggle favorite"
            >
              <Star size={16} fill={isFav ? '#fbbf24' : 'none'} color={isFav ? '#fbbf24' : '#94a3b8'} />
            </button>

            {/* Close */}
            <button
              className="vdd-action-icon-btn close"
              onClick={onClose}
              title="Close Panel (Esc)"
              aria-label="Close panel"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* LIVE TELEMETRY TICKER */}
        <div className="vdd-telemetry-banner">
          <div className="live-pill">
            <Radio size={12} className="live-ping" />
            <span>LIVE AIS TELEMETRY</span>
          </div>
          <div className="telemetry-item">
            Speed: <strong>{vessel.speed_laden_knots ?? 13.4} kn</strong>
          </div>
          <div className="telemetry-item">
            Draft: <strong>{vessel.draft_m ?? 11.2} m</strong>
          </div>
          <div className="telemetry-item dest">
            Dest: <strong>{enriched.commercial.current_voyage.destination_port}</strong>
          </div>
          <div className="telemetry-item eta">
            ETA: <strong>{enriched.commercial.current_voyage.eta_date.split(' ')[0]}</strong>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="vdd-tabs-bar" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`vdd-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={isActive}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB BODY CONTENT */}
        <div className="vdd-body">
          {activeTab === 'overview' && <OverviewTab data={enriched} />}
          {activeTab === 'commercial' && <CommercialTab data={enriched} />}
          {activeTab === 'environment' && <EnvironmentTab data={enriched} />}
          {activeTab === 'valuation' && <ValuationTab data={enriched} />}
          {activeTab === 'compliance' && <ComplianceTab data={enriched} />}
        </div>
      </div>
    </div>
  );
}
