import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Radio, ShieldAlert } from 'lucide-react';
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
      let strokeColor = '#20C98A'; // LIVE (emerald)
      let fillColor = 'rgba(32, 201, 138, 0.45)';
      let badgeLabel = 'LIVE';
      let isLive = true;

      if (pos.freshness_status === 'RECENT') {
        strokeColor = '#2F8CFF'; // RECENT (blue)
        fillColor = 'rgba(47, 140, 255, 0.45)';
        badgeLabel = 'RECENT';
        isLive = false;
      } else if (pos.freshness_status === 'STALE') {
        strokeColor = '#FFB020'; // STALE (amber)
        fillColor = 'rgba(255, 176, 32, 0.45)';
        badgeLabel = 'STALE';
        isLive = false;
      }

      if (isSelected) {
        strokeColor = '#00D9FF';
        fillColor = 'rgba(0, 217, 255, 0.65)';
      }

      const headingDeg = pos.heading ?? 0;
      const markerSize = isSelected ? 34 : 26;

      const html = `
        <div style="
          width: ${markerSize}px;
          height: ${markerSize}px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${headingDeg}deg);
          transition: transform 0.25s ease-out;
          cursor: pointer;
          position: relative;
        ">
          ${
            isSelected
              ? `<div style="
                  position: absolute;
                  width: ${markerSize + 10}px;
                  height: ${markerSize + 10}px;
                  border-radius: 50%;
                  border: 1.5px solid rgba(0, 217, 255, 0.7);
                  box-shadow: 0 0 12px rgba(0, 217, 255, 0.5);
                  pointer-events: none;
                "></div>`
              : isLive
              ? `<div style="
                  position: absolute;
                  width: ${markerSize + 6}px;
                  height: ${markerSize + 6}px;
                  border-radius: 50%;
                  border: 1px solid rgba(32, 201, 138, 0.4);
                  pointer-events: none;
                "></div>`
              : ''
          }
          <svg width="${markerSize}" height="${markerSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L19 21L12 17L5 21L12 2Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isSelected ? 2.5 : 1.7}" stroke-linejoin="round"/>
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
        <div style="font-family: 'JetBrains Mono', monospace, -apple-system, sans-serif; color: #F5F8FC; font-size: 11px; min-width: 200px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; border-bottom: 1px solid rgba(100, 190, 240, 0.14); padding-bottom: 4px;">
            <strong style="font-size: 12px; color: #00D9FF; text-transform: uppercase;">${v.name}</strong>
            <span style="font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 3px; background: ${fillColor}; color: ${strokeColor}; border: 1px solid ${strokeColor};">
              ${badgeLabel}
            </span>
          </div>
          <div style="color: #7189A3; font-size: 10px; margin-bottom: 3px;">
            IMO: ${v.imo_number || 'N/A'} &middot; ${v.vessel_type}
          </div>
          <div style="color: #D3E0EA; font-size: 10px; margin-bottom: 3px;">
            Position: <strong style="color: #FFFFFF;">${pos.latitude.toFixed(4)}&deg;, ${pos.longitude.toFixed(4)}&deg;</strong>
          </div>
          <div style="color: #D3E0EA; font-size: 10px; margin-bottom: 3px;">
            Speed: <strong style="color: #00D9FF;">${pos.speed_knots != null ? pos.speed_knots.toFixed(1) + ' kts' : 'N/A'}</strong> &middot; Heading: <strong>${pos.heading != null ? pos.heading.toFixed(0) + '&deg;' : 'N/A'}</strong>
          </div>
          ${
            v.active_booking
              ? `<div style="margin-top: 6px; padding: 4px 6px; background: rgba(0, 217, 255, 0.08); border-radius: 4px; border: 1px solid rgba(0, 217, 255, 0.25); color: #00D9FF; font-size: 10px;">
                  Booking: <strong>${v.active_booking.booking_reference}</strong>
                 </div>`
              : ''
          }
          <div style="margin-top: 6px; font-size: 9px; color: #7189A3;">
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
        color: '#00D9FF',
        weight: 2.5,
        opacity: 0.85,
        lineJoin: 'round',
      });

      polyline.bindTooltip(
        '<div style="font-family: monospace; font-size: 10px; font-weight: 700; color: #00D9FF;">AUTHENTIC OBSERVED POSITION TRACK (HISTORICAL AIS)</div>',
        { sticky: true }
      );

      polyline.addTo(historyLayerRef.current);

      // Add small dots on historical points
      historicalPoints.forEach((p, idx) => {
        const circle = L.circleMarker([p.latitude, p.longitude], {
          radius: 2.5,
          color: '#00D9FF',
          fillColor: '#061321',
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
        color: '#FFB020',
        weight: 1.5,
        dashArray: '5, 7',
        opacity: 0.65,
      });

      plannedLine.bindTooltip(
        '<div style="font-family: monospace; font-size: 10px; font-weight: 700; color: #FFB020;">PLANNED ROUTE CORRIDOR (NOT OBSERVED TRACK)</div>',
        { sticky: true }
      );

      plannedLine.addTo(routeLayerRef.current);

      // Port icons
      const createPortIcon = (name: string, isOrigin: boolean) =>
        L.divIcon({
          className: 'port-marker',
          html: `<div class="tracking-port-label ${isOrigin ? 'origin' : 'dest'}">
            ${isOrigin ? 'ORIGIN: ' : 'DEST: '}${name}
          </div>`,
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
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* Floating Map Legend Overlay */}
      <div className="tracking-map-legend">
        <div className="tracking-legend-title">
          <Radio size={12} />
          <span>Telemetry Freshness</span>
        </div>
        <div className="tracking-legend-list">
          <div className="tracking-legend-item">
            <div className="tracking-legend-dot-label">
              <span className="tracking-legend-dot" style={{ backgroundColor: '#20C98A', boxShadow: '0 0 6px #20C98A' }} />
              <span>LIVE</span>
            </div>
            <span className="tracking-legend-time">&lt; 2h</span>
          </div>
          <div className="tracking-legend-item">
            <div className="tracking-legend-dot-label">
              <span className="tracking-legend-dot" style={{ backgroundColor: '#2F8CFF' }} />
              <span>RECENT</span>
            </div>
            <span className="tracking-legend-time">2h–24h</span>
          </div>
          <div className="tracking-legend-item">
            <div className="tracking-legend-dot-label">
              <span className="tracking-legend-dot" style={{ backgroundColor: '#FFB020' }} />
              <span>STALE</span>
            </div>
            <span className="tracking-legend-time">&gt; 24h</span>
          </div>
          <div className="tracking-legend-item">
            <div className="tracking-legend-dot-label">
              <span className="tracking-legend-dot" style={{ backgroundColor: '#7189A3' }} />
              <span>UNAVAILABLE</span>
            </div>
            <span className="tracking-legend-time">No fix</span>
          </div>
        </div>

        <div className="tracking-legend-footer">
          <span>Tracked:</span>
          <strong>{positionedCount} / {vessels.length} vessels</strong>
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
            backgroundColor: 'rgba(6, 19, 33, 0.94)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 176, 32, 0.45)',
            borderRadius: '10px',
            padding: '14px 20px',
            color: '#F5F8FC',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65)',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#FFB020', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
            <ShieldAlert size={16} /> Authentic Telemetry Unconfigured
          </div>
          <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#A5B8CC', lineHeight: 1.5, fontFamily: 'sans-serif' }}>
            Commercial AIS subscription is currently unconfigured. Per platform Rule 28 integrity guidelines,
            vessel coordinates are marked <code style={{ color: '#FFB020' }}>DATA_UNAVAILABLE</code> rather than synthesizing simulated vessel movement.
          </p>
          {onOpenIngestModal && (
            <button
              type="button"
              onClick={onOpenIngestModal}
              className="tracking-btn tracking-btn-primary"
              style={{ margin: '0 auto' }}
            >
              Ingest Test Telemetry Observation
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackingMap;
