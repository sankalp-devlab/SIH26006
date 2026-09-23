import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ShieldAlert, Compass, Navigation, Radio } from 'lucide-react';
import { MapTilesService } from '../../../services/map/map-tiles.service';
import type { TrackedVesselSummary, PositionObservation, TrackedPortInfo } from '../../../types/tracking';

interface TrackingMapProps {
  vessels: TrackedVesselSummary[];
  selectedVesselId: number | null;
  onSelectVessel: (vesselId: number) => void;
  historicalPoints?: PositionObservation[];
  originPort?: TrackedPortInfo | null;
  destinationPort?: TrackedPortInfo | null;
  onOpenIngestModal?: () => void;
}

export const TrackingMap: React.FC<TrackingMapProps> = ({
  vessels,
  selectedVesselId,
  onSelectVessel,
  historicalPoints = [],
  originPort,
  destinationPort,
  onOpenIngestModal,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const historyLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const tileConfig = MapTilesService.getTileConfig('dark');

    const map = L.map(mapContainerRef.current, {
      center: [15.0, 80.0], // Centered over major maritime trade crossway
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
    });

    L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      subdomains: tileConfig.subdomains,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    historyLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render Vessel Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    const positionedVessels = vessels.filter(
      (v) => v.latest_position && v.latest_position.latitude != null && v.latest_position.longitude != null
    );

    positionedVessels.forEach((v) => {
      const pos = v.latest_position!;
      const isSelected = v.vessel_id === selectedVesselId;

      // Determine color by freshness
      let strokeColor = '#10b981'; // LIVE (emerald)
      let fillColor = 'rgba(16, 185, 129, 0.4)';
      let badgeLabel = 'LIVE';

      if (pos.freshness_status === 'RECENT') {
        strokeColor = '#3b82f6'; // RECENT (blue)
        fillColor = 'rgba(59, 130, 246, 0.4)';
        badgeLabel = 'RECENT';
      } else if (pos.freshness_status === 'STALE') {
        strokeColor = '#f59e0b'; // STALE (amber)
        fillColor = 'rgba(245, 158, 11, 0.4)';
        badgeLabel = 'STALE';
      }

      if (isSelected) {
        strokeColor = '#00f0ff';
        fillColor = 'rgba(0, 240, 255, 0.6)';
      }

      const headingDeg = pos.heading ?? 0;
      const markerSize = isSelected ? 36 : 28;

      const html = `
        <div style="
          width: ${markerSize}px;
          height: ${markerSize}px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${headingDeg}deg);
          transition: transform 0.3s;
          cursor: pointer;
        ">
          <svg width="${markerSize}" height="${markerSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L19 21L12 17L5 21L12 2Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isSelected ? 2.5 : 1.5}" stroke-linejoin="round"/>
          </svg>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-vessel-marker',
        html,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      });

      const marker = L.marker([pos.latitude, pos.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: var(--font-sans, system-ui); color: #f8fafc; font-size: 12px; min-width: 180px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <strong style="font-size: 13px; color: #38bdf8;">${v.name}</strong>
            <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${fillColor}; color: ${strokeColor}; border: 1px solid ${strokeColor};">
              ${badgeLabel}
            </span>
          </div>
          <div style="color: #94a3b8; font-size: 11px; margin-bottom: 2px;">IMO: ${v.imo_number || 'N/A'} &middot; ${v.vessel_type}</div>
          <div style="color: #cbd5e1; font-size: 11px; margin-bottom: 2px;">
            Position: <strong>${pos.latitude.toFixed(4)}&deg;, ${pos.longitude.toFixed(4)}&deg;</strong>
          </div>
          <div style="color: #cbd5e1; font-size: 11px; margin-bottom: 2px;">
            Speed: <strong>${pos.speed_knots != null ? pos.speed_knots.toFixed(1) + ' kts' : 'N/A'}</strong> &middot; Heading: <strong>${pos.heading != null ? pos.heading.toFixed(0) + '&deg;' : 'N/A'}</strong>
          </div>
          ${
            v.active_booking
              ? `<div style="margin-top: 6px; padding: 4px 6px; background: rgba(56, 189, 248, 0.1); border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.25); color: #38bdf8;">
                  Active Booking: <strong>${v.active_booking.booking_reference}</strong>
                 </div>`
              : ''
          }
          <div style="margin-top: 6px; font-size: 9px; color: #64748b;">
            Observed: ${new Date(pos.recorded_at).toUTCString()}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onSelectVessel(v.vessel_id);
      });

      marker.addTo(markersLayerRef.current!);
    });

    // If a vessel is selected and positioned, pan to it smoothly
    if (selectedVesselId) {
      const selV = positionedVessels.find((v) => v.vessel_id === selectedVesselId);
      if (selV && selV.latest_position) {
        mapInstanceRef.current.panTo([selV.latest_position.latitude, selV.latest_position.longitude], {
          animate: true,
          duration: 0.8,
        });
      }
    }
  }, [vessels, selectedVesselId, onSelectVessel]);

  // 3. Render Historical Track & Planned Corridor
  useEffect(() => {
    if (!mapInstanceRef.current || !historyLayerRef.current || !routeLayerRef.current) return;
    historyLayerRef.current.clearLayers();
    routeLayerRef.current.clearLayers();

    // 3A. Historical Track (Observed AIS positions)
    if (historicalPoints.length > 1) {
      const latlngs: [number, number][] = historicalPoints.map((p) => [p.latitude, p.longitude]);

      const polyline = L.polyline(latlngs, {
        color: '#00f0ff',
        weight: 3,
        opacity: 0.85,
        lineJoin: 'round',
      });

      polyline.bindTooltip(
        '<div style="font-size: 11px; font-weight: 700; color: #00f0ff;">AUTHENTIC OBSERVED POSITION TRACK (HISTORICAL AIS)</div>',
        { sticky: true }
      );

      polyline.addTo(historyLayerRef.current);

      // Add small dots on historical points
      historicalPoints.forEach((p, idx) => {
        const circle = L.circleMarker([p.latitude, p.longitude], {
          radius: 3,
          color: '#00f0ff',
          fillColor: '#050c1c',
          fillOpacity: 1,
          weight: 1.5,
        });
        circle.bindTooltip(`Point #${idx + 1}: ${new Date(p.recorded_at).toLocaleString()}`);
        circle.addTo(historyLayerRef.current!);
      });
    }

    // 3B. Planned Route Corridor (Origin Port -> Destination Port)
    if (
      originPort &&
      destinationPort &&
      originPort.latitude != null &&
      originPort.longitude != null &&
      destinationPort.latitude != null &&
      destinationPort.longitude != null
    ) {
      const corridorPoints: [number, number][] = [
        [originPort.latitude, originPort.longitude],
        [destinationPort.latitude, destinationPort.longitude],
      ];

      const plannedLine = L.polyline(corridorPoints, {
        color: '#f59e0b',
        weight: 2,
        dashArray: '6, 8',
        opacity: 0.7,
      });

      plannedLine.bindTooltip(
        '<div style="font-size: 11px; font-weight: 700; color: #f59e0b;">PLANNED ROUTE CORRIDOR (NOT OBSERVED TRACK)</div>',
        { sticky: true }
      );

      plannedLine.addTo(routeLayerRef.current);

      // Port icons
      const createPortIcon = (name: string, isOrigin: boolean) =>
        L.divIcon({
          className: 'port-marker',
          html: `<div style="
            background: #0f172a;
            border: 1.5px solid ${isOrigin ? '#10b981' : '#f43f5e'};
            color: #f8fafc;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          ">${isOrigin ? 'Origin: ' : 'Dest: '}${name}</div>`,
          iconAnchor: [30, 10],
        });

      L.marker([originPort.latitude, originPort.longitude], {
        icon: createPortIcon(originPort.name, true),
      }).addTo(routeLayerRef.current);

      L.marker([destinationPort.latitude, destinationPort.longitude], {
        icon: createPortIcon(destinationPort.name, false),
      }).addTo(routeLayerRef.current);
    }
  }, [historicalPoints, originPort, destinationPort]);

  const positionedCount = vessels.filter((v) => v.latest_position != null).length;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px', overflow: 'hidden' }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '520px', zIndex: 1 }} />

      {/* Floating Map Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          backgroundColor: 'rgba(5, 12, 28, 0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '8px',
          padding: '10px 14px',
          color: '#f8fafc',
          fontSize: '0.75rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          maxWidth: '280px',
        }}
      >
        <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Radio size={13} /> Live Telemetry Freshness
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>LIVE (&lt; 2h observed)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
            <span>RECENT (2h &ndash; 24h)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span>STALE (&gt; 24h delay)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748b' }} />
            <span>DATA_UNAVAILABLE (Unpositioned)</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', paddingTop: '6px', fontSize: '0.675rem', color: '#94a3b8' }}>
          Tracked fleet: <strong>{positionedCount}</strong> / {vessels.length} vessels
        </div>
      </div>

      {/* Empty State Overlay when no authentic positions exist */}
      {positionedCount === 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 15,
            backgroundColor: 'rgba(5, 12, 28, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '10px',
            padding: '14px 20px',
            color: '#f8fafc',
            maxWidth: '520px',
            textAlign: 'center',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '0.875rem', marginBottom: '4px' }}>
            <ShieldAlert size={16} /> Authentic Telemetry Unconfigured
          </div>
          <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
            Commercial AIS subscription is currently unconfigured. Per platform Rule 28 integrity guidelines,
            vessel coordinates are marked <code>DATA_UNAVAILABLE</code> rather than synthesizing simulated vessel movement.
          </p>
          {onOpenIngestModal && (
            <button
              type="button"
              onClick={onOpenIngestModal}
              style={{
                backgroundColor: '#0284c7',
                color: 'white',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Ingest Test Telemetry Observation
            </button>
          )}
        </div>
      )}
    </div>
  );
};
