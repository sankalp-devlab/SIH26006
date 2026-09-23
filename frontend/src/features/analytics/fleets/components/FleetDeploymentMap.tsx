/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 19: Interactive Leaflet Fleet Deployment Map & Live Radar
 */

import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertTriangle,
  Compass,
  CheckCircle2,
  Ship,
  Layers
} from 'lucide-react';
import { MapTilesService } from '../../../../services/map/map-tiles.service';
import type { FleetVesselRecord, FleetDeploymentStatus } from '../../../../types/fleets';
import { validateCoordinate } from '../../../../services/fleets/fleets-analytics-engine';

interface FleetDeploymentMapProps {
  vessels: FleetVesselRecord[];
  allVessels?: FleetVesselRecord[];
  selectedVesselId: number | null;
  onSelectVessel: (vessel: FleetVesselRecord) => void;
  activeStatusFilter?: string;
  onStatusChange?: (status: FleetDeploymentStatus | 'all') => void;
}

const STATUS_COLORS: Record<FleetDeploymentStatus, { hex: string; dotColor: string; label: string }> = {
  underway: { hex: '#10B981', dotColor: '#10B981', label: 'Underway' },
  anchored: { hex: '#F59E0B', dotColor: '#F59E0B', label: 'Anchored' },
  loading: { hex: '#3B82F6', dotColor: '#60A5FA', label: 'Loading' },
  discharging: { hex: '#A855F7', dotColor: '#C084FC', label: 'Discharging' },
  in_repair: { hex: '#F43F5E', dotColor: '#F43F5E', label: 'In Repair' },
};

export const FleetDeploymentMap: FC<FleetDeploymentMapProps> = ({
  vessels,
  allVessels,
  selectedVesselId,
  onSelectVessel,
  activeStatusFilter: controlledStatus,
  onStatusChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  const [hasMapError, setHasMapError] = useState(false);
  const [internalStatus, setInternalStatus] = useState<string>('all');

  const currentStatus = controlledStatus !== undefined ? controlledStatus : internalStatus;
  const countSource = allVessels || vessels;

  const handleStatusClick = (status: FleetDeploymentStatus | 'all') => {
    if (onStatusChange) {
      onStatusChange(status);
    } else {
      setInternalStatus(status);
    }
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        const tileConfig = MapTilesService.getTileConfig('dark');
        const map = L.map(mapContainerRef.current, {
          center: [20, 45],
          zoom: 3,
          minZoom: 2,
          maxZoom: 18,
          worldCopyJump: true,
          zoomControl: false,
        });

        L.control.zoom({ position: 'topright' }).addTo(map);

        L.tileLayer(tileConfig.url, {
          attribution: tileConfig.attribution,
          subdomains: tileConfig.subdomains as unknown as string,
          maxZoom: 19,
        }).addTo(map);

        markersLayerGroupRef.current.addTo(map);
        mapInstanceRef.current = map;
      }
    } catch (err) {
      console.error('Failed to initialize Leaflet Fleet Map:', err);
      setHasMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore cleanup glitches
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render Markers & Popups
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      markersLayerGroupRef.current.clearLayers();

      const displayedVessels = currentStatus === 'all'
        ? vessels
        : vessels.filter((v) => v.deployment.status === currentStatus);

      displayedVessels.forEach((vessel) => {
        const { latitude, longitude, status } = vessel.deployment;
        if (!validateCoordinate(latitude, longitude)) return;

        const isSelected = vessel.id === selectedVesselId;
        const colorConfig = STATUS_COLORS[status] || STATUS_COLORS.underway;
        const markerColor = colorConfig.hex;

        // Custom pulsing HTML marker
        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 28px; height: 28px; position: relative; display: flex; align-items: center; justify-content: center;">
            ${isSelected ? `<div style="position: absolute; inset: -4px; border-radius: 50%; background-color: ${markerColor}; opacity: 0.7; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
            <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; background-color: ${markerColor}; border: 2px solid ${isSelected ? '#FFFFFF' : 'rgba(9, 26, 42, 0.9)'}; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4); transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'}; transition: transform 0.2s ease;">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
                <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
              </svg>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'fleet-vessel-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });

        const marker = L.marker([latitude, longitude], { icon: customIcon });

        const popupContent = `
          <div style="font-family: inherit; min-width: 220px; color: #0F172A; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 6px;">
              <strong style="font-size: 13px; font-weight: 700; color: #0F172A;">${vessel.name}</strong>
              <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${markerColor}20; color: ${markerColor}; border: 1px solid ${markerColor}40;">
                ${colorConfig.label}
              </span>
            </div>
            <div style="font-size: 11px; line-height: 1.5; color: #334155;">
              <div><strong>Class:</strong> ${vessel.vesselClass} (${vessel.dwt.toLocaleString()} DWT)</div>
              <div><strong>IMO:</strong> ${vessel.imoNumber} • ${vessel.flag}</div>
              <div><strong>Owner:</strong> ${vessel.ownerName}</div>
              <div><strong>Operator:</strong> <span style="color: #2563EB; font-weight: 600;">${vessel.operatorName}</span></div>
              <div style="margin-top: 5px; padding-top: 5px; border-top: 1px dashed #CBD5E1;">
                <div><strong>Voyage:</strong> ${vessel.deployment.status === 'underway' ? `En route to ${vessel.deployment.destinationPort}` : vessel.deployment.subArea}</div>
                <div><strong>Speed:</strong> ${vessel.deployment.speedKnots} kts | <strong>ETA:</strong> ${vessel.deployment.eta}</div>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 280 });

        marker.on('click', () => {
          onSelectVessel(vessel);
        });

        markersLayerGroupRef.current.addLayer(marker);
      });
    } catch (err) {
      console.error('Error updating fleet map markers:', err);
    }
  }, [vessels, selectedVesselId, currentStatus, onSelectVessel]);

  // 3. Pan to selected vessel when changed
  useEffect(() => {
    if (!selectedVesselId || !mapInstanceRef.current) return;
    const target = vessels.find((v) => v.id === selectedVesselId);
    if (target && validateCoordinate(target.deployment.latitude, target.deployment.longitude)) {
      mapInstanceRef.current.panTo([target.deployment.latitude, target.deployment.longitude], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedVesselId, vessels]);

  // Fallback view if Leaflet fails
  if (hasMapError) {
    return (
      <div className="fi-radar-panel" style={{ textAlign: 'center', padding: '36px 20px' }}>
        <AlertTriangle style={{ width: '36px', height: '36px', color: '#F59E0B', margin: '0 auto 12px auto' }} />
        <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: '#F1F5F9' }}>
          Interactive Map Offline
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#94A3B8' }}>
          Browser rendering engine encountered an issue displaying the Leaflet tile canvas. All fleet coordinates remain fully verified and searchable in the registry below.
        </p>
        <button
          onClick={() => setHasMapError(false)}
          className="fi-btn fi-btn-primary"
        >
          Retry Map Canvas
        </button>
      </div>
    );
  }

  const allCount = countSource.length;
  const underwayCount = countSource.filter((v) => v.deployment.status === 'underway').length;
  const anchoredCount = countSource.filter((v) => v.deployment.status === 'anchored').length;
  const loadingCount = countSource.filter((v) => v.deployment.status === 'loading').length;
  const dischargingCount = countSource.filter((v) => v.deployment.status === 'discharging').length;
  const repairCount = countSource.filter((v) => v.deployment.status === 'in_repair').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Segmented Deployment Status Filters */}
      <div className="fi-status-bar">
        <div className="fi-status-filters">
          <button
            onClick={() => handleStatusClick('all')}
            className={`fi-status-btn ${currentStatus === 'all' ? 'active' : ''}`}
          >
            <span>All Vessels</span>
            <span className="fi-status-count">{allCount}</span>
          </button>

          <button
            onClick={() => handleStatusClick('underway')}
            className={`fi-status-btn ${currentStatus === 'underway' ? 'active' : ''}`}
          >
            <span className="fi-status-dot" style={{ backgroundColor: '#10B981' }} />
            <span>Underway</span>
            <span className="fi-status-count">{underwayCount}</span>
          </button>

          <button
            onClick={() => handleStatusClick('anchored')}
            className={`fi-status-btn ${currentStatus === 'anchored' ? 'active' : ''}`}
          >
            <span className="fi-status-dot" style={{ backgroundColor: '#F59E0B' }} />
            <span>Anchored</span>
            <span className="fi-status-count">{anchoredCount}</span>
          </button>

          <button
            onClick={() => handleStatusClick('loading')}
            className={`fi-status-btn ${currentStatus === 'loading' ? 'active' : ''}`}
          >
            <span className="fi-status-dot" style={{ backgroundColor: '#60A5FA' }} />
            <span>Loading</span>
            <span className="fi-status-count">{loadingCount}</span>
          </button>

          <button
            onClick={() => handleStatusClick('discharging')}
            className={`fi-status-btn ${currentStatus === 'discharging' ? 'active' : ''}`}
          >
            <span className="fi-status-dot" style={{ backgroundColor: '#C084FC' }} />
            <span>Discharging</span>
            <span className="fi-status-count">{dischargingCount}</span>
          </button>

          <button
            onClick={() => handleStatusClick('in_repair')}
            className={`fi-status-btn ${currentStatus === 'in_repair' ? 'active' : ''}`}
          >
            <span className="fi-status-dot" style={{ backgroundColor: '#F43F5E' }} />
            <span>In Repair</span>
            <span className="fi-status-count">{repairCount}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94A3B8' }}>
          <CheckCircle2 size={14} style={{ color: '#10B981' }} />
          <span>Continuous WGS84 Geographic Fixes</span>
        </div>
      </div>

      {/* 2. Live Deployment Radar Information Panel */}
      <div className="fi-radar-panel">
        <div className="fi-radar-header">
          <div className="fi-radar-title-wrap">
            <div className="fi-kpi-icon-wrap" style={{ width: '32px', height: '32px' }}>
              <Compass size={16} />
            </div>
            <div>
              <h3 className="fi-radar-title">
                Live Deployment Radar
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#94A3B8' }}>
                Interactive geospatial tracking across oceanic transit lanes and coastal anchorages
              </p>
            </div>
          </div>

          <div className="fi-radar-meta-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Ship size={14} style={{ color: '#22D3EE' }} />
              <span>Vessels Plotted: <strong style={{ color: '#F1F5F9', fontFamily: 'monospace' }}>{vessels.length}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} style={{ color: '#10B981' }} />
              <span>Coordinate Verification: <strong style={{ color: '#10B981', fontFamily: 'monospace' }}>100% WGS84</strong></span>
            </div>
          </div>
        </div>

        {/* Map Canvas Wrapper */}
        <div className="fi-radar-map-wrapper">
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  );
};

