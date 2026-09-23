/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 21: Interactive Leaflet Geospatial Emissions Intensity Map Canvas
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapTilesService } from '../../../../services/map/map-tiles.service';
import type {
  EmissionsVesselRecord,
  EmissionsVoyageRecord,
} from '../../../../types/emissions';
import { validateCoordinate } from '../../../../services/emissions/emissions-analytics-engine';

interface EmissionsMapCanvasProps {
  vessels: EmissionsVesselRecord[];
  voyages: EmissionsVoyageRecord[];
  selectedVesselId: number | null;
  onSelectVessel: (id: number) => void;
  onSelectVoyage: (id: string) => void;
}

export function EmissionsMapCanvas({
  vessels,
  voyages,
  selectedVesselId,
  onSelectVessel,
  onSelectVoyage,
}: EmissionsMapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const tracksLayerRef = useRef<L.LayerGroup>(L.layerGroup());

  const [hasMapError, setHasMapError] = useState(false);
  const [showTracks, setShowTracks] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        const tileConfig = MapTilesService.getTileConfig('dark');
        const map = L.map(mapContainerRef.current, {
          center: [20, 50],
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

        tracksLayerRef.current.addTo(map);
        markersLayerRef.current.addTo(map);
        mapInstanceRef.current = map;
      }
    } catch (err) {
      console.error('[EmissionsMapCanvas] Failed to initialize Leaflet map:', err);
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

  // Render Vessel Markers & Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || hasMapError) return;

    markersLayerRef.current.clearLayers();
    tracksLayerRef.current.clearLayers();

    // 1. Draw Simulated Voyage Tracks with emissions intensity colors
    if (showTracks) {
      const sampleTracks: { voyageId: string; coords: [number, number][]; color: string; label: string }[] = [
        {
          voyageId: 'VY-2026-101',
          coords: [
            [26.65, 50.16], // Ras Tanura
            [26.15, 56.45], // Hormuz
            [12.5, 65.0],   // Arabian Sea
            [5.82, 80.55],  // Sri Lanka
            [1.25, 103.95], // Singapore
            [15.0, 115.0],  // South China Sea
            [29.85, 122.25] // Ningbo
          ],
          color: '#10b981', // Efficient VLCC
          label: 'Ras Tanura → Ningbo (Oceania Star)',
        },
        {
          voyageId: 'VY-2026-106',
          coords: [
            [-20.35, 118.55], // Port Hedland
            [-8.5, 115.8],   // Lombok Strait
            [-2.0, 118.8],   // Makassar
            [5.0, 122.0],    // Celebes
            [22.0, 120.0],   // Taiwan Strait (Anomalous)
            [36.0, 120.3]    // Qingdao
          ],
          color: '#ef4444', // High CO2 Surge Leg
          label: 'Port Hedland → Qingdao (Star Polaris - High Burn)',
        },
        {
          voyageId: 'VY-2026-110',
          coords: [
            [51.95, 4.15],   // Rotterdam
            [54.0, 7.5],     // North Sea
            [54.3, 10.1],    // Kiel Canal
            [54.52, 11.22],  // Fehmarn Belt
            [54.38, 18.66]   // Gdańsk
          ],
          color: '#38bdf8', // Biofuel Blend
          label: 'Rotterdam → Gdańsk (Nord Energy - Biofuel)',
        },
      ];

      sampleTracks.forEach((track) => {
        const voyageMeta = voyages.find((vy) => vy.voyageId === track.voyageId);
        const label = voyageMeta
          ? `${voyageMeta.vesselName}: ${voyageMeta.originPort} → ${voyageMeta.destinationPort} (${voyageMeta.co2Mt.toFixed(0)} mt CO₂)`
          : track.label;

        const polyline = L.polyline(track.coords, {
          color: track.color,
          weight: 3,
          opacity: 0.8,
          dashArray: track.color === '#ef4444' ? '6, 6' : undefined,
        });

        polyline.bindTooltip(
          `<strong>${label}</strong><br/><span style="color:${track.color}">Click to inspect voyage</span>`,
          { sticky: true }
        );

        polyline.on('click', () => {
          onSelectVoyage(track.voyageId);
        });

        polyline.addTo(tracksLayerRef.current);
      });
    }

    // 2. Draw Vessel Markers with emissions-based color coding
    vessels.forEach((v) => {
      const lat = v.currentLocation?.latitude;
      const lng = v.currentLocation?.longitude;
      if (!validateCoordinate(lat, lng)) return;

      const isSelected = v.id === selectedVesselId;

      // Color based on CII Rating & emissions intensity
      let markerColor = '#10b981'; // Low / Grade A
      if (v.ciiRating === 'B') markerColor = '#34d399';
      else if (v.ciiRating === 'C') markerColor = '#f59e0b';
      else if (v.ciiRating === 'D') markerColor = '#f97316';
      else if (v.ciiRating === 'E') markerColor = '#ef4444';

      const customIcon = L.divIcon({
        className: 'custom-emissions-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            ${
              isSelected
                ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; border: 2px solid #38bdf8; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>`
                : ''
            }
            <div style="
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background-color: ${markerColor};
              border: 2px solid #0d1829;
              box-shadow: 0 0 10px ${markerColor};
              cursor: pointer;
            "></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.bindTooltip(
        `
        <div style="font-family: sans-serif; font-size: 12px; color: #f8fafc; background: #0f172a; padding: 6px 8px; border-radius: 4px; border: 1px solid #1e293b;">
          <strong>${v.name}</strong> (${v.vesselClass})<br/>
          <span style="color: ${markerColor}; font-weight: bold;">CII Grade ${v.ciiRating} &bull; ${v.ciiScore.toFixed(2)} g/dwt·nm</span><br/>
          CO₂: ${v.totalCo2Mt.toLocaleString()} mt &bull; Speed: ${v.currentLocation.speedKnots} kts<br/>
          <span style="color: #94a3b8; font-size: 10px;">Click to view emissions profile</span>
        </div>
        `,
        { direction: 'top', offset: [0, -10] }
      );

      marker.on('click', () => {
        onSelectVessel(v.id);
      });

      marker.addTo(markersLayerRef.current);
    });
  }, [vessels, selectedVesselId, hasMapError, showTracks, onSelectVessel, onSelectVoyage]);

  // Center on selected vessel if updated
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedVesselId) return;

    const vessel = vessels.find((v) => v.id === selectedVesselId);
    if (vessel && validateCoordinate(vessel.currentLocation.latitude, vessel.currentLocation.longitude)) {
      map.flyTo([vessel.currentLocation.latitude, vessel.currentLocation.longitude], 6, {
        duration: 1.2,
      });
    }
  }, [selectedVesselId, vessels]);

  return (
    <div
      style={{
        background: '#0d1829',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        position: 'relative',
      }}
    >
      {/* Top Map Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
            GEOSPATIAL EMISSIONS INTENSITY MAP
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Live fleet locations with carbon intensity color encoding &bull; Click any vessel or route to inspect details
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#94a3b8', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showTracks}
              onChange={(e) => setShowTracks(e.target.checked)}
              style={{ accentColor: '#0066cc' }}
            />
            Show Voyage Tracks
          </label>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '420px',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid #1e293b',
          backgroundColor: '#0a111c',
        }}
      />

      {/* Map Legend Floating Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '2.25rem',
          left: '2.25rem',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(4px)',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '0.6875rem',
          color: '#cbd5e1',
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        <span style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>CII Emission Intensity</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          <span>Grade A / Superior (&lt; 2.5 g/dwt·nm)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
          <span>Grade C / Baseline (3.0 - 4.0 g/dwt·nm)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          <span>Grade E / Inferior Surge (&gt; 4.5 g/dwt·nm)</span>
        </div>
      </div>
    </div>
  );
}
