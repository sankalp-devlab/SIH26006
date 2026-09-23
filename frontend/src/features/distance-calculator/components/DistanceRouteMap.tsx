/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 12: Interactive Maritime Route Map (Leaflet)
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapTilesService } from '../../../services/map/map-tiles.service';
import { SECA_BOUNDING_POLYGONS, PIRACY_ZONES } from '../../../services/distance-calculator/distance-engine';
import type { DistanceCalculationResult, RoutingMode } from '../../../types/distance-calculator';
import type { VesselPosition } from '../../../types/map';
import { Maximize2, Layers, Eye, EyeOff } from 'lucide-react';

interface DistanceRouteMapProps {
  result: DistanceCalculationResult;
  mode: RoutingMode;
  selectedVesselPosition?: VesselPosition | null;
}

export function DistanceRouteMap({
  result,
  mode,
  selectedVesselPosition,
}: DistanceRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups
  const routeLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const markersLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const secaLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const piracyLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  // Layer Visibility
  const [showSeca, setShowSeca] = useState(true);
  const [showPiracy, setShowPiracy] = useState(true);
  const [showWaypoints, setShowWaypoints] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const tileConfig = MapTilesService.getTileConfig('dark');
      const map = L.map(mapContainerRef.current, {
        center: [25, 45],
        zoom: 3,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true,
      });

      L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        maxZoom: tileConfig.maxZoom,
        subdomains: tileConfig.subdomains,
      }).addTo(map);

      routeLayerGroupRef.current.addTo(map);
      markersLayerGroupRef.current.addTo(map);
      secaLayerGroupRef.current.addTo(map);
      piracyLayerGroupRef.current.addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Route Geometry & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    routeLayerGroupRef.current.clearLayers();
    markersLayerGroupRef.current.clearLayers();

    // 1. Draw Leg Polylines with Color Coding
    const allBounds = L.latLngBounds([]);

    for (const leg of result.legs) {
      const coords: [number, number][] = [leg.from_coords, leg.to_coords];
      allBounds.extend(leg.from_coords);
      allBounds.extend(leg.to_coords);

      let strokeColor = '#06b6d4'; // Cyan default
      if (leg.is_seca) {
        strokeColor = '#c084fc'; // Purple for SECA
      } else if (leg.from_name.includes('Canal') || leg.to_name.includes('Canal')) {
        strokeColor = '#f59e0b'; // Amber for Canal
      }

      const poly = L.polyline(coords, {
        color: strokeColor,
        weight: 3.5,
        opacity: 0.9,
        dashArray: leg.is_distance_manual ? '6, 6' : undefined,
      });

      poly.bindTooltip(
        `<strong>Leg ${leg.leg_number}</strong>: ${leg.from_name} → ${leg.to_name}<br/>` +
          `Distance: ${leg.distance_nm} NM | ${leg.is_seca ? 'SECA (LSMGO)' : 'Open Sea (VLSFO)'}`,
        { sticky: true }
      );

      routeLayerGroupRef.current.addLayer(poly);
    }

    // 2. Draw Origin & Destination Markers
    const originPt = result.points[0];
    const destPt = result.points[result.points.length - 1];

    if (originPt) {
      const originIcon = L.divIcon({
        className: 'custom-map-marker-origin',
        html: `<div style="background:#10b981;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 10px #10b981;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const mOrigin = L.marker([originPt.latitude, originPt.longitude], { icon: originIcon }).bindPopup(
        `<strong>Origin: ${originPt.name}</strong><br/>Lat: ${originPt.latitude.toFixed(2)}°, Lng: ${originPt.longitude.toFixed(2)}°`
      );
      markersLayerGroupRef.current.addLayer(mOrigin);
    }

    if (destPt) {
      const destIcon = L.divIcon({
        className: 'custom-map-marker-dest',
        html: `<div style="background:#f43f5e;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 10px #f43f5e;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const mDest = L.marker([destPt.latitude, destPt.longitude], { icon: destIcon }).bindPopup(
        `<strong>Destination: ${destPt.name}</strong><br/>Lat: ${destPt.latitude.toFixed(2)}°, Lng: ${destPt.longitude.toFixed(2)}°`
      );
      markersLayerGroupRef.current.addLayer(mDest);
    }

    // 3. Draw Intermediate Waypoints
    if (showWaypoints) {
      for (let i = 1; i < result.points.length - 1; i++) {
        const pt = result.points[i];
        const wpIcon = L.divIcon({
          className: 'custom-map-marker-wp',
          html: `<div style="background:${pt.category === 'canal' ? '#f59e0b' : pt.is_seca ? '#c084fc' : '#38bdf8'};width:10px;height:10px;border-radius:50%;border:1.5px solid #0f172a;"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        const mWp = L.marker([pt.latitude, pt.longitude], { icon: wpIcon }).bindPopup(
          `<strong>${pt.name}</strong> (${pt.category})<br/>` +
            `Leg: ${pt.leg_distance_nm} NM | Cumulative: ${pt.cumulative_distance_nm} NM<br/>` +
            `Zone: ${pt.is_seca ? 'SECA (0.10% S)' : 'Non-SECA'}`
        );
        markersLayerGroupRef.current.addLayer(mWp);
      }
    }

    // 4. Vessel Marker if vessel mode
    if (mode === 'vessel_to_port' && selectedVesselPosition) {
      const vesselIcon = L.divIcon({
        className: 'custom-map-marker-vessel',
        html: `<div style="background:#0284c7;width:20px;height:20px;border-radius:50%;border:2px solid #38bdf8;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;box-shadow:0 0 12px #38bdf8;">🚢</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const mVessel = L.marker([selectedVesselPosition.latitude, selectedVesselPosition.longitude], {
        icon: vesselIcon,
      }).bindPopup(
        `<strong>${selectedVesselPosition.name}</strong><br/>` +
          `Status: ${selectedVesselPosition.status} | Speed: ${selectedVesselPosition.speed_knots} kn<br/>` +
          `Draft: ${selectedVesselPosition.draft_m}m`
      );
      markersLayerGroupRef.current.addLayer(mVessel);
    }

    // Fit map bounds to show complete voyage track
    if (allBounds.isValid()) {
      map.fitBounds(allBounds, { padding: [40, 40], maxZoom: 8 });
    }
  }, [result, showWaypoints, mode, selectedVesselPosition]);

  // Update SECA & Piracy Overlays
  useEffect(() => {
    secaLayerGroupRef.current.clearLayers();
    if (showSeca) {
      for (const zone of SECA_BOUNDING_POLYGONS) {
        const poly = L.polygon(zone.coordinates, {
          color: '#c084fc',
          weight: 1.5,
          dashArray: '4, 4',
          fillColor: '#c084fc',
          fillOpacity: 0.12,
        }).bindTooltip(`<strong>${zone.name}</strong><br/>Mandatory 0.10% S fuel (LSMGO)`);
        secaLayerGroupRef.current.addLayer(poly);
      }
    }
  }, [showSeca]);

  useEffect(() => {
    piracyLayerGroupRef.current.clearLayers();
    if (showPiracy) {
      for (const zone of PIRACY_ZONES) {
        const poly = L.polygon(zone.polygon, {
          color: zone.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
          weight: 1.5,
          dashArray: '3, 3',
          fillColor: zone.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
          fillOpacity: 0.15,
        }).bindTooltip(
          `<strong>${zone.name}</strong> (${zone.severity})<br/>${zone.recommendation}`
        );
        piracyLayerGroupRef.current.addLayer(poly);
      }
    }
  }, [showPiracy]);

  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const allBounds = L.latLngBounds([]);
    for (const leg of result.legs) {
      allBounds.extend(leg.from_coords);
      allBounds.extend(leg.to_coords);
    }
    if (allBounds.isValid()) {
      map.fitBounds(allBounds, { padding: [40, 40], maxZoom: 8 });
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        height: '460px',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%', background: '#0a192f' }} />

      {/* Floating Map Controls & Legends */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 1000,
          display: 'flex',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          padding: '6px 10px',
          borderRadius: '8px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        }}
      >
        <button
          type="button"
          onClick={() => setShowSeca(!showSeca)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: showSeca ? 'rgba(192, 132, 252, 0.2)' : 'transparent',
            border: 'none',
            color: showSeca ? '#c084fc' : '#94a3b8',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
          title="Toggle SECA Emission Zones Overlay"
        >
          {showSeca ? <Eye size={12} /> : <EyeOff size={12} />}
          SECA Zones
        </button>

        <button
          type="button"
          onClick={() => setShowPiracy(!showPiracy)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: showPiracy ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
            border: 'none',
            color: showPiracy ? '#ef4444' : '#94a3b8',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
          title="Toggle Piracy Risk Zones Overlay"
        >
          {showPiracy ? <Eye size={12} /> : <EyeOff size={12} />}
          Piracy Zones
        </button>

        <button
          type="button"
          onClick={() => setShowWaypoints(!showWaypoints)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: showWaypoints ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
            border: 'none',
            color: showWaypoints ? '#38bdf8' : '#94a3b8',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
          title="Toggle Waypoint Markers"
        >
          <Layers size={12} />
          Waypoints
        </button>

        <button
          type="button"
          onClick={handleFitBounds}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: 'none',
            color: '#f8fafc',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
          title="Fit Route to Screen"
        >
          <Maximize2 size={12} />
          Fit
        </button>
      </div>

      {/* Legend Strip */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          fontSize: '11px',
          color: '#cbd5e1',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '3px', background: '#06b6d4', display: 'inline-block' }}></span>
          Open Sea (VLSFO)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '3px', background: '#c084fc', display: 'inline-block' }}></span>
          SECA (LSMGO)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '3px', background: '#f59e0b', display: 'inline-block' }}></span>
          Canal Transit
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
          Piracy Risk Area
        </span>
      </div>
    </div>
  );
}
