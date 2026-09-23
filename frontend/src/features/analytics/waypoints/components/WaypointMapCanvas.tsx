/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 18: Interactive Leaflet Waypoint & Chokepoint Map Canvas
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertTriangle,
  Layers,
  Navigation,
} from 'lucide-react';
import { MapTilesService } from '../../../../services/map/map-tiles.service';
import type {
  MaritimeWaypointRecord,
  WaypointLiveActivity,
} from '../../../../types/waypoints';
import { validateCoordinate } from '../../../../services/waypoints/waypoints-analytics-engine';

interface WaypointMapCanvasProps {
  waypoints: MaritimeWaypointRecord[];
  activities: Record<string, WaypointLiveActivity>;
  selectedWaypointId: string | null;
  onSelectWaypoint: (id: string) => void;
}

export function WaypointMapCanvas({
  waypoints,
  activities,
  selectedWaypointId,
  onSelectWaypoint,
}: WaypointMapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  const [hasMapError, setHasMapError] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  // 1. Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        const tileConfig = MapTilesService.getTileConfig('dark');
        const map = L.map(mapContainerRef.current, {
          center: [20, 25],
          zoom: 3,
          minZoom: 2,
          maxZoom: 18,
          worldCopyJump: true,
          zoomControl: false,
        });

        L.control.zoom({ position: 'topright' }).addTo(map);

        L.tileLayer(tileConfig.url, {
          attribution: tileConfig.attribution,
          maxZoom: tileConfig.maxZoom,
          subdomains: tileConfig.subdomains,
        }).addTo(map);

        markersLayerGroupRef.current.addTo(map);
        mapInstanceRef.current = map;
      }
    } catch (err) {
      console.error('[WaypointMapCanvas] Failed to initialize Leaflet map:', err);
      setHasMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore cleanup errors
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render Markers for all filtered Waypoints
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || hasMapError) return;

    markersLayerGroupRef.current.clearLayers();

    waypoints.forEach((wp) => {
      if (!validateCoordinate(wp.latitude, wp.longitude)) return;

      const act = activities[wp.id];
      const isSelected = wp.id === selectedWaypointId;

      // Determine color by congestion score
      let color = '#10b981'; // LOW
      if (act) {
        if (act.congestionScore >= 75) color = '#ef4444'; // CRITICAL
        else if (act.congestionScore >= 60) color = '#f97316'; // HIGH
        else if (act.congestionScore >= 35) color = '#eab308'; // MODERATE
      }

      // Base radius by transit volume
      const baseRadius = act ? Math.min(18, Math.max(8, Math.round(act.transits24h / 18))) : 8;
      const markerRadius = isSelected ? baseRadius + 4 : baseRadius;

      // Custom SVG Marker icon
      const customIcon = L.divIcon({
        className: 'custom-chokepoint-marker',
        html: `
          <div style="position: relative; width: ${markerRadius * 2}px; height: ${markerRadius * 2}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${
              isSelected
                ? `<div style="position: absolute; width: ${markerRadius * 2 + 14}px; height: ${markerRadius * 2 + 14}px; border-radius: 50%; border: 2px solid ${color}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>`
                : ''
            }
            <div style="width: ${markerRadius * 2}px; height: ${markerRadius * 2}px; border-radius: 50%; background: ${color}; border: 2px solid #ffffff; box-shadow: 0 0 10px ${color}; opacity: 0.9; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 9px; font-weight: 800; color: #0f172a;">${wp.type[0]}</span>
            </div>
            ${
              showLabels
                ? `<div style="position: absolute; top: ${markerRadius * 2 + 3}px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 10px; font-weight: 700; color: #f8fafc; background: rgba(15, 23, 42, 0.85); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15); pointer-events: none; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
                    ${wp.name}
                  </div>`
                : ''
            }
          </div>
        `,
        iconSize: [markerRadius * 2, markerRadius * 2],
        iconAnchor: [markerRadius, markerRadius],
      });

      const marker = L.marker([wp.latitude, wp.longitude], { icon: customIcon });

      // Click handler
      marker.on('click', () => {
        onSelectWaypoint(wp.id);
      });

      // Tooltip popup
      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 190px;">
          <div style="font-weight: 700; font-size: 13px; color: #0284c7; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
            <span>${wp.name}</span>
            <span style="font-size: 10px; padding: 1px 5px; background: #e0f2fe; border-radius: 4px; color: #0369a1;">${wp.type}</span>
          </div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${wp.region} &bull; ${wp.country}</div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 4px 0;" />
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>24h Transits:</span>
            <strong>${act ? act.transits24h : 'N/A'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>In-Zone Vessels:</span>
            <strong>${act ? act.activeVesselsInZone : 'N/A'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Waiting Queue:</span>
            <strong style="color: #d97706;">${act ? act.waitingVessels : 'N/A'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Congestion Score:</span>
            <strong style="color: ${color};">${act ? act.congestionScore : 'N/A'}/100</strong>
          </div>
          <div style="margin-top: 6px; font-size: 10px; text-align: center; color: #0284c7; font-weight: 600;">
            Click marker to inspect technical specs
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        autoClose: true,
      });

      markersLayerGroupRef.current.addLayer(marker);
    });
  }, [waypoints, activities, selectedWaypointId, showLabels, onSelectWaypoint, hasMapError]);

  // 3. Pan to selected waypoint if changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedWaypointId || hasMapError) return;

    const wp = waypoints.find((w) => w.id === selectedWaypointId);
    if (wp && validateCoordinate(wp.latitude, wp.longitude)) {
      map.flyTo([wp.latitude, wp.longitude], Math.max(map.getZoom(), 4), {
        duration: 1.2,
      });
    }
  }, [selectedWaypointId, waypoints, hasMapError]);

  // Fallback UI if Map fails
  if (hasMapError) {
    return (
      <div
        style={{
          background: 'var(--color-bg-surface, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '2.5rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '1rem' }}>
          <AlertTriangle size={32} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
          Interactive Map Visualizer Unavailable
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
          The WebGL or canvas container could not be initialized. All tabular telemetry, congestion matrices, and detailed analytical models remain fully functional below.
        </p>
        <button
          type="button"
          onClick={() => setHasMapError(false)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid #38bdf8',
            color: '#38bdf8',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Retry Map Initialization
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--color-bg-surface, #0f172a)',
        border: '1px solid var(--color-border-subtle, #1e293b)',
        borderRadius: 'var(--radius-lg, 12px)',
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}
    >
      {/* Map Control Floating Bar */}
      <div
        style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '0.4rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#f8fafc', fontWeight: 600 }}>
          <Navigation size={13} color="#38bdf8" />
          <span>Global AIS Chokepoints Canvas</span>
        </div>
        <div style={{ width: '1px', height: '14px', background: '#334155' }} />
        <button
          type="button"
          onClick={() => setShowLabels(!showLabels)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'transparent',
            border: 'none',
            color: showLabels ? '#38bdf8' : '#64748b',
            fontSize: '0.72rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Layers size={12} />
          <span>{showLabels ? 'Hide Labels' : 'Show Labels'}</span>
        </button>
      </div>

      {/* Map Legend Overlay at Bottom Right */}
      <div
        style={{
          position: 'absolute',
          bottom: '0.75rem',
          right: '0.75rem',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '0.5rem 0.8rem',
          fontSize: '0.72rem',
          color: '#cbd5e1',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '0.35rem' }}>Congestion Intensity:</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Critical
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} /> High
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} /> Moderate
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Nominal
          </span>
        </div>
      </div>

      {/* Leaflet Map DOM Element */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '420px',
          background: '#0a0f1d',
        }}
      />
    </div>
  );
}
