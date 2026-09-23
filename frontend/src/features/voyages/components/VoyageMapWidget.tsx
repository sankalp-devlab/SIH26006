import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { VoyageRecord } from '../../../types/voyage';
import { MapTilesService } from '../../../services/map/map-tiles.service';

interface VoyageMapWidgetProps {
  selectedVoyage?: VoyageRecord | null;
  allVoyages?: VoyageRecord[];
  height?: number | string;
  focusCoord?: { lat: number; lng: number; label: string } | null;
}

export function VoyageMapWidget({
  selectedVoyage,
  allVoyages = [],
  height = 380,
  focusCoord,
}: VoyageMapWidgetProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultLat = selectedVoyage?.current_latitude || 18.0;
    const defaultLng = selectedVoyage?.current_longitude || 72.0;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark Matter tile layer via centralized MapTilesService
    const tileConfig = MapTilesService.getTileConfig('dark');
    L.tileLayer(tileConfig.url, {
      maxZoom: tileConfig.maxZoom,
      subdomains: tileConfig.subdomains,
      attribution: tileConfig.attribution,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update layers whenever selectedVoyage, allVoyages, or focusCoord change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const voyagesToRender = selectedVoyage ? [selectedVoyage] : allVoyages;
    const allBoundsCoords: [number, number][] = [];

    voyagesToRender.forEach((v) => {
      const isSelected = selectedVoyage?.id === v.id;
      const isPredicted = v.status === 'predicted';
      const isLaden = v.current_leg_type === 'laden';

      // 1. Origin & Destination Port Markers
      const originIcon = L.divIcon({
        className: 'vdb-port-marker-origin',
        html: `
          <div style="width: 22px; height: 22px; border-radius: 50%; background: #10b981; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.6);">
            <span style="font-size: 11px; font-weight: 700; color: #ffffff;">O</span>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const destIcon = L.divIcon({
        className: 'vdb-port-marker-dest',
        html: `
          <div style="width: 22px; height: 22px; border-radius: 50%; background: #38bdf8; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.6);">
            <span style="font-size: 11px; font-weight: 700; color: #ffffff;">D</span>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const originMarker = L.marker([v.origin_port.latitude, v.origin_port.longitude], { icon: originIcon });
      originMarker.bindPopup(`
        <div style="color: #0f172a; padding: 4px; font-family: sans-serif;">
          <div style="font-weight: 700; font-size: 13px;">${v.origin_port.name}</div>
          <div style="font-size: 11px; color: #64748b;">${v.origin_port.country} &middot; Origin / Loading</div>
          <div style="font-size: 11px; margin-top: 4px;">Dep: ${v.departure_date}</div>
        </div>
      `);
      layerGroup.addLayer(originMarker);
      allBoundsCoords.push([v.origin_port.latitude, v.origin_port.longitude]);

      const destMarker = L.marker([v.destination_port.latitude, v.destination_port.longitude], { icon: destIcon });
      destMarker.bindPopup(`
        <div style="color: #0f172a; padding: 4px; font-family: sans-serif;">
          <div style="font-weight: 700; font-size: 13px;">${v.destination_port.name}</div>
          <div style="font-size: 11px; color: #64748b;">${v.destination_port.country} &middot; Destination / Discharge</div>
          <div style="font-size: 11px; margin-top: 4px;">ETA: ${v.eta_date}</div>
        </div>
      `);
      layerGroup.addLayer(destMarker);
      allBoundsCoords.push([v.destination_port.latitude, v.destination_port.longitude]);

      // 2. Seaway Corridor Polyline
      const polylineCoords: [number, number][] = [
        [v.origin_port.latitude, v.origin_port.longitude],
      ];

      // If active underway, inject vessel current pos into path
      if (v.status !== 'completed' && v.current_latitude && v.current_longitude) {
        polylineCoords.push([v.current_latitude, v.current_longitude]);
        allBoundsCoords.push([v.current_latitude, v.current_longitude]);
      }
      polylineCoords.push([v.destination_port.latitude, v.destination_port.longitude]);

      const routeColor = isPredicted ? '#a855f7' : isLaden ? '#10b981' : '#38bdf8';
      const polyline = L.polyline(polylineCoords, {
        color: routeColor,
        weight: isSelected ? 4 : 2,
        opacity: isSelected ? 0.95 : 0.6,
        dashArray: isPredicted ? '6, 8' : undefined,
      });

      polyline.bindTooltip(`
        <strong>${v.voyage_number}</strong>: ${v.origin_port.name} → ${v.destination_port.name}
        <br/><span style="color: ${routeColor}; font-weight: 600;">${isPredicted ? 'Predicted Voyage' : isLaden ? 'Laden Leg' : 'Ballast Leg'}</span>
      `);
      layerGroup.addLayer(polyline);

      // 3. Vessel Current Position Marker
      if (v.current_latitude && v.current_longitude && v.status !== 'completed') {
        const heading = v.current_heading || 0;
        const vesselMarkerColor = isLaden ? '#10b981' : '#38bdf8';

        const vesselIcon = L.divIcon({
          className: 'vdb-voyage-vessel-marker',
          html: `
            <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
              <div style="
                position: absolute;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: ${vesselMarkerColor}33;
                border: 1px solid ${vesselMarkerColor}88;
                animation: pulse-ring 2.2s infinite;
              "></div>
              <div style="transform: rotate(${heading}deg); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <path d="M12 2L4 20L12 17L20 20L12 2Z" fill="${vesselMarkerColor}" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const vMarker = L.marker([v.current_latitude, v.current_longitude], { icon: vesselIcon });
        vMarker.bindPopup(`
          <div style="color: #0f172a; padding: 4px; font-family: sans-serif;">
            <div style="font-weight: 700; font-size: 13px;">${v.vessel_name}</div>
            <div style="font-size: 11px; color: #64748b;">${v.voyage_number} &middot; ${v.vessel_type}</div>
            <div style="margin-top: 4px; font-size: 11px;">Speed: <strong>${v.current_speed_knots.toFixed(1)} kn</strong> &middot; Heading: <strong>${v.current_heading}°</strong></div>
            <div style="font-size: 11px;">Draft: <strong>${v.current_draft_m} m</strong> &middot; Cargo: <strong>${v.cargo_manifest.commodity}</strong></div>
          </div>
        `);
        layerGroup.addLayer(vMarker);
      }

      // 4. STS Events Markers
      v.sts_events.forEach((sts) => {
        const stsIcon = L.divIcon({
          className: 'vdb-sts-marker',
          html: `
            <div style="width: 24px; height: 24px; border-radius: 4px; background: #ec4899; border: 2px solid #ffffff; transform: rotate(45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.6);">
              <span style="font-size: 9px; font-weight: 800; color: #ffffff; transform: rotate(-45deg);">STS</span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const stsMarker = L.marker([sts.latitude, sts.longitude], { icon: stsIcon });
        stsMarker.bindPopup(`
          <div style="color: #0f172a; padding: 4px; font-family: sans-serif;">
            <div style="font-weight: 700; font-size: 13px; color: #ec4899;">STS Transfer Event</div>
            <div style="font-size: 11px; font-weight: 600;">${sts.location_name}</div>
            <div style="font-size: 11px; margin-top: 4px;">Mother: <strong>${sts.mother_vessel_name}</strong></div>
            <div style="font-size: 11px;">Daughter: <strong>${sts.daughter_vessel_name}</strong></div>
            <div style="font-size: 11px;">Cargo: <strong>${sts.cargo_commodity} (${sts.quantity_mt} MT)</strong></div>
          </div>
        `);
        layerGroup.addLayer(stsMarker);
        allBoundsCoords.push([sts.latitude, sts.longitude]);
      });
    });

    // If specific focus coordinate requested (e.g. from timeline)
    if (focusCoord) {
      map.setView([focusCoord.lat, focusCoord.lng], 7, { animate: true });
    } else if (allBoundsCoords.length > 0) {
      const bounds = L.latLngBounds(allBoundsCoords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
    }
  }, [selectedVoyage, allVoyages, focusCoord]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => {
    if (selectedVoyage) {
      const b = L.latLngBounds([
        [selectedVoyage.origin_port.latitude, selectedVoyage.origin_port.longitude],
        [selectedVoyage.destination_port.latitude, selectedVoyage.destination_port.longitude],
      ]);
      mapInstanceRef.current?.fitBounds(b, { padding: [40, 40] });
    } else {
      mapInstanceRef.current?.setView([18.0, 72.0], 4);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        height,
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid var(--color-border-subtle)',
        background: '#090d16',
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Map Controls */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <button
          type="button"
          onClick={handleZoomIn}
          className="btn btn-secondary btn-sm"
          style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
          title="Zoom in"
        >
          <ZoomIn size={15} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="btn btn-secondary btn-sm"
          style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
          title="Zoom out"
        >
          <ZoomOut size={15} />
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="btn btn-secondary btn-sm"
          style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
          title="Reset bounds"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Floating Route Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.90)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '8px',
          padding: showLegend ? '8px 12px 10px 12px' : '4px 8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.2s ease',
        }}
        aria-label="Map route indicators legend"
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: showLegend ? '8px' : 0 }}>
          <button
            type="button"
            onClick={() => setShowLegend(!showLegend)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 4px',
              borderRadius: '4px',
              lineHeight: 1,
            }}
            title={showLegend ? 'Hide Legend' : 'Show Legend'}
          >
            {showLegend ? 'Hide' : 'Show'}
          </button>
        </div>

        {showLegend && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              minWidth: '42px',
            }}
          >
            {/* Laden Leg Indicator */}
            <div
              title="Laden Leg"
              style={{
                width: '38px',
                height: '3px',
                background: '#10b981',
                borderRadius: '2px',
                boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)',
              }}
            />
            {/* Ballast Leg Indicator */}
            <div
              title="Ballast Leg"
              style={{
                width: '38px',
                height: '3px',
                background: '#38bdf8',
                borderRadius: '2px',
                boxShadow: '0 0 6px rgba(56, 189, 248, 0.4)',
              }}
            />
            {/* Predicted Voyage Indicator */}
            <div
              title="Predicted Voyage"
              style={{
                width: '38px',
                height: '0px',
                borderTop: '2.5px dashed #a855f7',
                boxShadow: '0 0 6px rgba(168, 85, 247, 0.4)',
              }}
            />
            {/* STS Event Indicator */}
            <div
              title="Ship-to-Ship (STS) Event"
              style={{
                width: '38px',
                height: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '1.5px',
                  background: '#ec4899',
                  transform: 'rotate(45deg)',
                  boxShadow: '0 0 6px rgba(236, 72, 153, 0.4)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
