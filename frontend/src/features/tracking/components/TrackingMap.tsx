import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Radio, ShieldAlert, Maximize2 } from 'lucide-react';
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

  // 1. Initialize Leaflet Map with authentic dark tile layer & custom zoom position
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const tileConfig = MapTilesService.getTileConfig('dark');

    const map = L.map(mapContainerRef.current, {
      center: [15.0, 80.0], // Centered over major maritime Indian Ocean & Malacca trade corridor
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

  // Fit all active fleet vessels in view
  const fitAllVessels = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const positioned = vessels.filter(
      (v) => v.latest_position && v.latest_position.latitude != null && v.latest_position.longitude != null
    );
    if (positioned.length === 0) {
      mapInstanceRef.current.setView([15.0, 80.0], 3, { animate: true });
      return;
    }
    const latLngs: [number, number][] = positioned.map((v) => [
      v.latest_position!.latitude,
      v.latest_position!.longitude,
    ]);
    if (latLngs.length === 1) {
      mapInstanceRef.current.setView(latLngs[0], 6, { animate: true });
    } else {
      mapInstanceRef.current.fitBounds(L.latLngBounds(latLngs), {
        padding: [60, 60],
        maxZoom: 8,
        animate: true,
      });
    }
  }, [vessels]);

  // 2. Render Directional Maritime Vessel Markers with Semantic Colors & Pulse
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    const positionedVessels = vessels.filter(
      (v) => v.latest_position && v.latest_position.latitude != null && v.latest_position.longitude != null
    );

    positionedVessels.forEach((v) => {
      const pos = v.latest_position!;
      const isSelected = v.vessel_id === selectedVesselId;

      // Semantic status colors matching enterprise maritime standards
      let strokeColor = '#10B981'; // LIVE (< 2h)
      let fillColor = 'rgba(16, 185, 129, 0.32)';
      let dropShadow = 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.65))';
      let badgeLabel = 'LIVE';
      let isLive = true;

      if (pos.freshness_status === 'RECENT') {
        strokeColor = '#00D9FF'; // RECENT (2h-24h)
        fillColor = 'rgba(0, 217, 255, 0.28)';
        dropShadow = 'drop-shadow(0 0 6px rgba(0, 217, 255, 0.5))';
        badgeLabel = 'RECENT';
        isLive = false;
      } else if (pos.freshness_status === 'STALE') {
        strokeColor = '#F59E0B'; // STALE (> 24h)
        fillColor = 'rgba(245, 158, 11, 0.28)';
        dropShadow = 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.45))';
        badgeLabel = 'STALE';
        isLive = false;
      }

      if (isSelected) {
        strokeColor = '#00D9FF';
        fillColor = 'rgba(0, 217, 255, 0.6)';
        dropShadow = 'drop-shadow(0 0 10px rgba(0, 217, 255, 0.85))';
      }

      // Real heading angle in degrees (North = 0°)
      const headingDeg = pos.heading ?? 0;
      const markerSize = isSelected ? 34 : 26;

      const html = `
        <div class="vessel-marker-wrapper" style="width: ${markerSize}px; height: ${markerSize}px;">
          ${
            isSelected
              ? `<div class="vessel-selected-reticle"></div>
                 <div class="vessel-selected-bracket"></div>`
              : isLive
              ? `<div class="vessel-live-pulse-ring"></div>`
              : ''
          }
          <div style="transform: rotate(${headingDeg}deg); transition: transform 0.25s ease-out; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
            <svg width="${markerSize}" height="${markerSize}" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: ${dropShadow};">
              <!-- Vessel Hull Precision Silhouette -->
              <path d="M14 2.5L23.5 24L14 19.5L4.5 24L14 2.5Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isSelected ? 2.4 : 1.7}" stroke-linejoin="round"/>
              <!-- Keel Centerline -->
              <line x1="14" y1="6" x2="14" y2="18.5" stroke="${strokeColor}" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
              <!-- Central Radar Transponder Dot -->
              <circle cx="14" cy="13.5" r="2.2" fill="${strokeColor}"/>
            </svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-vessel-marker',
        html,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      });

      const marker = L.marker([pos.latitude, pos.longitude], { icon: customIcon });

      // Interactive Hover Tooltip
      marker.bindTooltip(
        `<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; line-height: 1.35;">
          <div style="font-weight: 700; color: #00D9FF; text-transform: uppercase; font-size: 11px;">${v.name}</div>
          <div style="color: #8DA2B7; font-size: 9px; margin-bottom: 2px;">${v.vessel_type} &bull; ${v.capacity_tons.toLocaleString()} DWT</div>
          <div style="color: #D3E0EA; font-size: 10px;">
            <span style="color: #00D9FF; font-weight: 700;">${pos.speed_knots != null ? pos.speed_knots.toFixed(1) + ' kts' : '0.0 kts'}</span> &bull; HDG <span style="font-weight: 700;">${pos.heading != null ? pos.heading.toFixed(0) + '&deg;' : 'N/A'}</span>
          </div>
          <div style="margin-top: 3px; font-weight: 700; color: ${strokeColor}; font-size: 9px;">
            &bull; ${badgeLabel}
          </div>
        </div>`,
        {
          className: 'tracking-vessel-tooltip',
          direction: 'top',
          offset: [0, -14],
          opacity: 0.98,
        }
      );

      // Detailed Click Popup
      const popupContent = `
        <div style="font-family: 'JetBrains Mono', monospace, -apple-system, sans-serif; color: #F5F8FC; font-size: 11px; min-width: 220px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; border-bottom: 1px solid rgba(0, 217, 255, 0.2); padding-bottom: 6px;">
            <strong style="font-size: 12px; color: #00D9FF; text-transform: uppercase; letter-spacing: 0.02em;">${v.name}</strong>
            <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${fillColor}; color: ${strokeColor}; border: 1px solid ${strokeColor}; letter-spacing: 0.04em;">
              ${badgeLabel}
            </span>
          </div>
          <div style="color: #8DA2B7; font-size: 10px; margin-bottom: 6px;">
            IMO: <strong style="color: #D3E0EA;">${v.imo_number || 'N/A'}</strong> &middot; ${v.vessel_type} (${v.capacity_tons.toLocaleString()} DWT)
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: rgba(0, 217, 255, 0.05); border: 1px solid rgba(0, 217, 255, 0.15); border-radius: 6px; padding: 6px 8px; margin-bottom: 8px;">
            <div>
              <div style="font-size: 9px; color: #7189A3;">SPEED</div>
              <div style="font-size: 11px; font-weight: 700; color: #00D9FF;">${pos.speed_knots != null ? pos.speed_knots.toFixed(1) + ' kts' : 'N/A'}</div>
            </div>
            <div>
              <div style="font-size: 9px; color: #7189A3;">HEADING</div>
              <div style="font-size: 11px; font-weight: 700; color: #F5F8FC;">${pos.heading != null ? pos.heading.toFixed(0) + '&deg;' : 'N/A'}</div>
            </div>
            <div style="grid-column: span 2;">
              <div style="font-size: 9px; color: #7189A3;">COORDINATES</div>
              <div style="font-size: 10px; font-weight: 600; color: #FFFFFF;">${pos.latitude.toFixed(4)}&deg; N, ${pos.longitude.toFixed(4)}&deg; E</div>
            </div>
          </div>
          ${
            v.active_booking
              ? `<div style="margin-bottom: 6px; padding: 4px 6px; background: rgba(0, 217, 255, 0.08); border-radius: 4px; border: 1px solid rgba(0, 217, 255, 0.25); color: #00D9FF; font-size: 10px;">
                  Booking: <strong>${v.active_booking.booking_reference}</strong>
                 </div>`
              : ''
          }
          <div style="font-size: 9px; color: #7189A3; display: flex; justify-content: space-between; border-top: 1px solid rgba(100, 190, 240, 0.12); padding-top: 4px;">
            <span>Observed:</span>
            <span>${new Date(pos.recorded_at).toUTCString()}</span>
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
        weight: 2,
        opacity: 0.85,
        dashArray: '3, 4',
        lineJoin: 'round',
      });

      polyline.bindTooltip(
        '<div style="font-family: monospace; font-size: 10px; font-weight: 700; color: #00D9FF;">AUTHENTIC OBSERVED POSITION TRACK (HISTORICAL AIS)</div>',
        { sticky: true }
      );

      polyline.addTo(historyLayerRef.current);

      // Precision dots on historical points
      historicalPoints.forEach((p, idx) => {
        const circle = L.circleMarker([p.latitude, p.longitude], {
          radius: 2.5,
          color: '#00D9FF',
          fillColor: '#030A14',
          fillOpacity: 1,
          weight: 1.5,
        });
        circle.bindTooltip(`Point #${idx + 1}: ${new Date(p.recorded_at).toLocaleString()}`);
        circle.addTo(historyLayerRef.current!);
      });
    }

    // 3B. Planned Route Corridor with Animated Flow & Professional Port Callouts
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
        color: '#00D9FF',
        weight: 2,
        dashArray: '8, 12',
        opacity: 0.75,
        className: 'maritime-corridor-flow',
      });

      plannedLine.bindTooltip(
        '<div style="font-family: monospace; font-size: 10px; font-weight: 700; color: #00D9FF;">PLANNED ROUTE CORRIDOR (NAUTICAL WAYPOINT VOYAGE)</div>',
        { sticky: true }
      );

      plannedLine.addTo(routeLayerRef.current);

      // Professional Callout Markers with Vertical Stems anchored to exact coordinates
      const createPortIcon = (name: string, isOrigin: boolean) =>
        L.divIcon({
          className: 'maritime-port-div-icon',
          html: `
            <div class="maritime-port-callout">
              <div class="maritime-port-card ${isOrigin ? 'origin' : 'dest'}">
                <div class="port-badge-label">${isOrigin ? 'ORIGIN PORT' : 'DESTINATION PORT'}</div>
                <div class="port-title">${name}</div>
              </div>
              <div class="maritime-port-stem ${isOrigin ? 'origin' : 'dest'}"></div>
              <div class="maritime-port-anchor ${isOrigin ? 'origin' : 'dest'}"></div>
            </div>
          `,
          iconSize: [140, 48],
          iconAnchor: [70, 48],
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
  const selectedVessel = vessels.find((v) => v.vessel_id === selectedVesselId);
  const liveCount = vessels.filter((v) => v.latest_position?.freshness_status === 'LIVE').length;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* Top-Left Maritime HUD Overlay */}
      <div className="tracking-map-hud tracking-map-hud-tl">
        <div className="tracking-hud-title">
          <span className="tracking-hud-pulse-dot" style={{ background: liveCount > 0 ? '#10B981' : '#F59E0B' }} />
          <span>LIVE FLEET TRACKING</span>
        </div>
        <div className="tracking-hud-sub">
          {liveCount > 0 ? 'TELEMETRY ACTIVE' : 'TELEMETRY STANDBY'} &middot; AIS 156.025 MHZ
        </div>
      </div>

      {/* Bottom-Left Fleet Status HUD Overlay */}
      <div className="tracking-map-hud tracking-map-hud-bl">
        <div className="tracking-hud-stat">
          <span className="tracking-hud-label">FLEET IN VIEW:</span>
          <strong className="tracking-hud-val">{positionedCount} VESSELS</strong>
        </div>
        {selectedVessel && (
          <div className="tracking-hud-selected">
            <span>TARGET: </span>
            <strong>{selectedVessel.name}</strong>
          </div>
        )}
        <button
          type="button"
          className="tracking-map-fit-btn"
          onClick={fitAllVessels}
          title="Fit fleet in view"
        >
          <Maximize2 size={11} />
          <span>FIT FLEET</span>
        </button>
      </div>

      {/* Floating Map Legend Overlay (Top Right) */}
      <div className="tracking-map-legend">
        <div className="tracking-legend-title">
          <Radio size={12} />
          <span>Telemetry Freshness</span>
        </div>
        <div className="tracking-legend-list">
          <div className="tracking-legend-item">
            <div className="tracking-legend-dot-label">
              <span className="tracking-legend-dot" style={{ backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              <span>LIVE</span>
            </div>
            <span className="tracking-legend-time">&lt; 2h</span>
          </div>
          <div className="tracking-legend-item">
            <div className="tracking-legend-dot-label">
              <span className="tracking-legend-dot" style={{ backgroundColor: '#00D9FF' }} />
              <span>RECENT</span>
            </div>
            <span className="tracking-legend-time">2h–24h</span>
          </div>
          <div className="tracking-legend-item">
            <div className="tracking-legend-dot-label">
              <span className="tracking-legend-dot" style={{ backgroundColor: '#F59E0B' }} />
              <span>STALE</span>
            </div>
            <span className="tracking-legend-time">&gt; 24h</span>
          </div>
          <div className="tracking-legend-item">
            <div className="tracking-legend-dot-label">
              <span className="tracking-legend-dot" style={{ backgroundColor: '#64748B' }} />
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
            backgroundColor: 'rgba(4, 14, 25, 0.94)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            borderRadius: '10px',
            padding: '14px 20px',
            color: '#F5F8FC',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75)',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#F59E0B', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
            <ShieldAlert size={16} /> Authentic Telemetry Unconfigured
          </div>
          <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#A5B8CC', lineHeight: 1.5, fontFamily: 'sans-serif' }}>
            Commercial AIS subscription is currently unconfigured. Per platform Rule 28 integrity guidelines,
            vessel coordinates are marked <code style={{ color: '#F59E0B' }}>DATA_UNAVAILABLE</code> rather than synthesizing simulated vessel movement.
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
