/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Interactive Leaflet Trade Flow Map Canvas
 * Curved oceanic flow arcs, volume-weighted stroke widths, pulsing port hubs, and robust fallback.
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { MapTilesService } from '../../../../services/map/map-tiles.service';
import type { FlowSegment } from '../../../../types/trade-flows';
import { FlowsAnalyticsEngine } from '../../../../services/flows/flows-analytics-engine';

interface FlowMapCanvasProps {
  segments: FlowSegment[];
  selectedFlowId: string | null;
  onSelectFlow: (id: string) => void;
}

function isValidLatLng(coords: unknown): coords is [number, number] {
  return (
    Array.isArray(coords) &&
    coords.length >= 2 &&
    Number.isFinite(coords[0]) &&
    Number.isFinite(coords[1])
  );
}

export function FlowMapCanvas({
  segments,
  selectedFlowId,
  onSelectFlow,
}: FlowMapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups
  const arcsLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const originMarkersLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const destMarkersLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  // Layer Toggles
  const [showArcs, setShowArcs] = useState(true);
  const [showOrigins, setShowOrigins] = useState(true);
  const [showDestinations, setShowDestinations] = useState(true);
  const [hasMapError, setHasMapError] = useState(false);

  // 1. Initialize Leaflet Map once
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

        // Add Leaflet zoom control at top-right
        L.control.zoom({ position: 'topright' }).addTo(map);

        L.tileLayer(tileConfig.url, {
          attribution: tileConfig.attribution,
          maxZoom: tileConfig.maxZoom,
          subdomains: tileConfig.subdomains,
        }).addTo(map);

        arcsLayerGroupRef.current.addTo(map);
        originMarkersLayerGroupRef.current.addTo(map);
        destMarkersLayerGroupRef.current.addTo(map);

        mapInstanceRef.current = map;
      }
    } catch (err) {
      console.error('FlowMapCanvas initialization error:', err);
      setHasMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render Curved Flow Arcs & Port Markers whenever segments change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || hasMapError) return;

    try {
      arcsLayerGroupRef.current.clearLayers();
      originMarkersLayerGroupRef.current.clearLayers();
      destMarkersLayerGroupRef.current.clearLayers();

      if (!segments || segments.length === 0) return;

      const allBounds = L.latLngBounds([]);
      const renderedOrigins = new Set<string>();
      const renderedDests = new Set<string>();

      for (const seg of segments) {
        const isSelected = seg.flow_id === selectedFlowId;
        const validOrigin = isValidLatLng(seg.origin_coords);
        const validDest = isValidLatLng(seg.destination_coords);

        // A. Add Flow Arc Polyline
        if (showArcs && seg.curve_points && seg.curve_points.length > 0) {
          const validPoints = seg.curve_points.filter(isValidLatLng);
          if (validPoints.length >= 2) {
            const polyline = L.polyline(validPoints, {
              color: isSelected ? '#ffffff' : seg.stroke_color,
              weight: isSelected ? seg.stroke_width + 2 : seg.stroke_width,
              opacity: isSelected ? 0.95 : 0.72,
              lineCap: 'round',
              lineJoin: 'round',
              dashArray: seg.mode === 'lng' ? '6, 6' : undefined,
            });

            // Interactive Popup / Tooltip
            const formattedVol = FlowsAnalyticsEngine.formatVolumeMT(seg.volume_mt);
            polyline.bindTooltip(
              `<div style="font-family: inherit; font-size: 12px; color: #f8fafc; padding: 4px;">
                <strong style="color: ${seg.stroke_color};">${seg.trade_lane_code}</strong>: ${seg.commodity}<br/>
                <span>${seg.origin_name} &rarr; ${seg.destination_name}</span><br/>
                <span style="color: #38bdf8; font-weight: 600;">Volume: ${formattedVol}</span> (${seg.active_vessels} vessels)
              </div>`,
              {
                sticky: true,
                className: 'vdb-flow-tooltip',
                direction: 'auto',
              }
            );

            polyline.on('click', () => {
              onSelectFlow(seg.flow_id);
            });

            arcsLayerGroupRef.current.addLayer(polyline);
          }
        }

        if (validOrigin) {
          allBounds.extend(seg.origin_coords);
        }
        if (validDest) {
          allBounds.extend(seg.destination_coords);
        }

        // B. Add Origin Port Marker
        if (showOrigins && validOrigin && !renderedOrigins.has(seg.origin_name)) {
          renderedOrigins.add(seg.origin_name);

          const originIcon = L.divIcon({
            className: 'vdb-flow-origin-icon',
            html: `
              <div style="
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #38bdf8;
                border: 2px solid #ffffff;
                box-shadow: 0 0 10px #38bdf8;
                cursor: pointer;
              "></div>
            `,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });

          const originMarker = L.marker(seg.origin_coords, { icon: originIcon });
          originMarker.bindTooltip(
            `<b>Origin: ${seg.origin_name}</b><br/>Trade Corridor Hub`,
            { className: 'vdb-flow-tooltip', direction: 'top' }
          );
          originMarker.on('click', () => onSelectFlow(seg.flow_id));
          originMarkersLayerGroupRef.current.addLayer(originMarker);
        }

        // C. Add Destination Port Marker
        if (showDestinations && validDest && !renderedDests.has(seg.destination_name)) {
          renderedDests.add(seg.destination_name);

          const destIcon = L.divIcon({
            className: 'vdb-flow-dest-icon',
            html: `
              <div style="
                width: 12px;
                height: 12px;
                background: #f59e0b;
                border: 2px solid #ffffff;
                transform: rotate(45deg);
                box-shadow: 0 0 10px #f59e0b;
                cursor: pointer;
              "></div>
            `,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });

          const destMarker = L.marker(seg.destination_coords, { icon: destIcon });
          destMarker.bindTooltip(
            `<b>Destination: ${seg.destination_name}</b><br/>Discharge Terminal Hub`,
            { className: 'vdb-flow-tooltip', direction: 'top' }
          );
          destMarker.on('click', () => onSelectFlow(seg.flow_id));
          destMarkersLayerGroupRef.current.addLayer(destMarker);
        }
      }

      // Auto-fit bounds if valid
      if (allBounds.isValid() && segments.length > 0) {
        map.fitBounds(allBounds, { padding: [40, 40], maxZoom: 6 });
      }
    } catch (err) {
      console.error('Error rendering flow map layers:', err);
    }
  }, [segments, selectedFlowId, showArcs, showOrigins, showDestinations, hasMapError, onSelectFlow]);

  // Fit All Bounds Handler
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map || segments.length === 0) return;
    const allBounds = L.latLngBounds([]);
    for (const seg of segments) {
      if (isValidLatLng(seg.origin_coords)) allBounds.extend(seg.origin_coords);
      if (isValidLatLng(seg.destination_coords)) allBounds.extend(seg.destination_coords);
    }
    if (allBounds.isValid()) {
      map.fitBounds(allBounds, { padding: [40, 40], maxZoom: 6 });
    }
  };

  if (hasMapError) {
    return (
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '3rem',
          textAlign: 'center',
          color: '#f8fafc',
          marginBottom: '1.5rem',
        }}
      >
        <AlertTriangle size={36} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Interactive Flow Map Unavailable</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: 460, margin: '0.5rem auto' }}>
          Map tile services could not be initialized. All trade-flow volume statistics, OD matrix heatmaps, and corridors data remain fully active and functional below.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        height: 520,
        borderRadius: 'var(--radius-lg, 12px)',
        overflow: 'hidden',
        border: '1px solid var(--color-border-subtle, #1e293b)',
        background: '#070d19',
        marginBottom: '1.5rem',
      }}
    >
      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Map Controls & Legends */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {/* Layer Visibility Pills */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            padding: '0.35rem 0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setShowArcs((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: showArcs ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: showArcs ? '#38bdf8' : '#94a3b8',
              border: 'none',
              borderRadius: 4,
              padding: '0.2rem 0.45rem',
              cursor: 'pointer',
            }}
          >
            {showArcs ? <Eye size={12} /> : <EyeOff size={12} />}
            Flow Arcs ({segments.length})
          </button>

          <button
            type="button"
            onClick={() => setShowOrigins((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: showOrigins ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: showOrigins ? '#10b981' : '#94a3b8',
              border: 'none',
              borderRadius: 4,
              padding: '0.2rem 0.45rem',
              cursor: 'pointer',
            }}
          >
            ● Origins
          </button>

          <button
            type="button"
            onClick={() => setShowDestinations((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: showDestinations ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: showDestinations ? '#f59e0b' : '#94a3b8',
              border: 'none',
              borderRadius: 4,
              padding: '0.2rem 0.45rem',
              cursor: 'pointer',
            }}
          >
            ◆ Destinations
          </button>

          <button
            type="button"
            onClick={handleFitAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'transparent',
              color: '#f8fafc',
              border: 'none',
              borderRadius: 4,
              padding: '0.2rem 0.45rem',
              cursor: 'pointer',
            }}
            title="Fit All Corridors into view"
          >
            <Maximize2 size={12} />
            Fit All
          </button>
        </div>
      </div>

      {/* Floating Bottom Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 8,
          padding: '0.4rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.72rem',
          color: '#cbd5e1',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 14, height: 3, background: '#38bdf8', borderRadius: 2 }}></span>
          <span>Dry Bulk</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 14, height: 3, background: '#f59e0b', borderRadius: 2 }}></span>
          <span>Tanker</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 14, height: 3, background: '#c084fc', borderRadius: 2 }}></span>
          <span>LNG</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 14, height: 3, background: '#10b981', borderRadius: 2 }}></span>
          <span>LPG</span>
        </div>
        <div style={{ borderLeft: '1px solid #334155', paddingLeft: '0.75rem', color: '#94a3b8' }}>
          Stroke width reflects volume weight (MT)
        </div>
      </div>
    </div>
  );
}
