import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapTilesService } from '../../../services/map/map-tiles.service';
import type { RouteCalculationResponse } from '../../../types/route';

interface RouteMapViewerProps {
  route: RouteCalculationResponse | null;
  height?: string;
}

export function RouteMapViewer({ route, height = '460px' }: RouteMapViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const markersGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const tileConfig = MapTilesService.getTileConfig('dark');
    const map = L.map(containerRef.current, {
      center: [20, 60],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true,
      zoomControl: true,
    });

    L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      subdomains: tileConfig.subdomains,
    }).addTo(map);

    routeGroupRef.current.addTo(map);
    markersGroupRef.current.addTo(map);

    mapRef.current = map;

    // Handle container resize
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      try {
        map.remove();
      } catch {
        // cleanup
      }
      mapRef.current = null;
    };
  }, []);

  // 2. Render Route Geometry & Waypoints
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    routeGroupRef.current.clearLayers();
    markersGroupRef.current.clearLayers();

    if (!route || !route.geometry || route.geometry.length < 2) {
      return;
    }

    // A. Route Polyline
    const coords: [number, number][] = route.geometry.map(([lat, lng]) => [lat, lng]);

    // Outer glow polyline
    const glowLine = L.polyline(coords, {
      color: '#00D9FF',
      weight: 6,
      opacity: 0.25,
      lineCap: 'round',
      lineJoin: 'round',
    });
    routeGroupRef.current.addLayer(glowLine);

    // Main dashed nautical polyline
    const mainLine = L.polyline(coords, {
      color: '#00D9FF',
      weight: 3,
      opacity: 0.95,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round',
    });

    mainLine.bindTooltip(
      `
      <div style="font-family: system-ui, sans-serif; font-size: 11px; line-height: 1.4; color: #fff; background: #0b192c; padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(0, 217, 255, 0.4);">
        <strong style="color: #00D9FF;">${route.origin_port.name} → ${route.destination_port.name}</strong><br/>
        Corridor: ${route.route_type.replace(/_/g, ' ').toUpperCase()}<br/>
        Distance: <strong>${route.distance_nm.toLocaleString()} NM</strong> (${route.distance_km.toLocaleString()} km)<br/>
        Routing: <em>${route.distance_type.toUpperCase()}</em>
      </div>
      `,
      { sticky: true }
    );
    routeGroupRef.current.addLayer(mainLine);

    // B. Origin Marker
    const originIcon = L.divIcon({
      className: 'custom-route-marker',
      html: `
        <div style="
          width: 28px; height: 28px;
          background: #10b981;
          color: white;
          border: 2px solid #ffffff;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.7);
        ">⚓</div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const originMarker = L.marker([route.origin_port.latitude, route.origin_port.longitude], {
      icon: originIcon,
      zIndexOffset: 1000,
    });
    originMarker.bindPopup(
      `
      <div style="font-family: system-ui, sans-serif; padding: 4px; font-size: 12px;">
        <span style="font-size: 10px; font-weight: 700; color: #10b981; text-transform: uppercase;">Origin Port</span>
        <h4 style="margin: 2px 0; font-size: 14px;">${route.origin_port.name}</h4>
        <div style="color: #64748b; font-size: 11px;">${route.origin_port.country || 'International'} &middot; UN/LOCODE: ${route.origin_port.unlocode || 'N/A'}</div>
        <div style="margin-top: 4px; font-family: monospace; font-size: 10px; color: #94a3b8;">${route.origin_port.latitude.toFixed(4)}°, ${route.origin_port.longitude.toFixed(4)}°</div>
      </div>
      `
    );
    markersGroupRef.current.addLayer(originMarker);

    // C. Destination Marker
    const destIcon = L.divIcon({
      className: 'custom-route-marker',
      html: `
        <div style="
          width: 28px; height: 28px;
          background: #00D9FF;
          color: #0b192c;
          border: 2px solid #ffffff;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 13px;
          box-shadow: 0 0 12px rgba(0, 217, 255, 0.7);
        ">🏁</div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const destMarker = L.marker([route.destination_port.latitude, route.destination_port.longitude], {
      icon: destIcon,
      zIndexOffset: 1000,
    });
    destMarker.bindPopup(
      `
      <div style="font-family: system-ui, sans-serif; padding: 4px; font-size: 12px;">
        <span style="font-size: 10px; font-weight: 700; color: #00D9FF; text-transform: uppercase;">Destination Port</span>
        <h4 style="margin: 2px 0; font-size: 14px;">${route.destination_port.name}</h4>
        <div style="color: #64748b; font-size: 11px;">${route.destination_port.country || 'International'} &middot; UN/LOCODE: ${route.destination_port.unlocode || 'N/A'}</div>
        <div style="margin-top: 4px; font-family: monospace; font-size: 10px; color: #94a3b8;">${route.destination_port.latitude.toFixed(4)}°, ${route.destination_port.longitude.toFixed(4)}°</div>
      </div>
      `
    );
    markersGroupRef.current.addLayer(destMarker);

    // D. Intermediate Waypoint Markers
    route.waypoints.forEach((wp, index) => {
      const wpIcon = L.divIcon({
        className: 'custom-route-waypoint',
        html: `
          <div style="
            width: 22px; height: 22px;
            background: #f59e0b;
            color: #0b192c;
            border: 2px solid #ffffff;
            border-radius: 4px;
            display: flex; align-items: center; justify-content: center;
            font-weight: 800; font-size: 10px;
            box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
          ">${index + 1}</div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const wpMarker = L.marker([wp.lat, wp.lng], {
        icon: wpIcon,
        zIndexOffset: 800,
      });

      wpMarker.bindPopup(
        `
        <div style="font-family: system-ui, sans-serif; padding: 4px; font-size: 12px;">
          <span style="font-size: 10px; font-weight: 700; color: #f59e0b; text-transform: uppercase;">Waypoint #${index + 1} &middot; ${wp.category}</span>
          <h4 style="margin: 2px 0; font-size: 13px;">${wp.name}</h4>
          ${wp.description ? `<p style="margin: 4px 0 0; font-size: 11px; color: #64748b;">${wp.description}</p>` : ''}
          ${wp.max_draft_m ? `<div style="margin-top: 4px; font-size: 11px; color: #0284c7;"><strong>Max Draft:</strong> ${wp.max_draft_m}m</div>` : ''}
          <div style="margin-top: 4px; font-family: monospace; font-size: 10px; color: #94a3b8;">${wp.lat.toFixed(4)}°, ${wp.lng.toFixed(4)}°</div>
        </div>
        `
      );
      markersGroupRef.current.addLayer(wpMarker);
    });

    // Auto-fit map to route bounds
    try {
      const bounds = mainLine.getBounds();
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
    } catch {
      // ignore
    }
  }, [route]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid var(--color-border-subtle)',
        backgroundColor: '#07101c',
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {!route && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '8px',
            backgroundColor: 'rgba(7, 16, 28, 0.65)',
            backdropFilter: 'blur(2px)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            padding: '1rem',
            zIndex: 400,
          }}
        >
          <div style={{ fontSize: '1.75rem' }}>🌐</div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
            Nautical Route Geometry Display
          </div>
          <div style={{ fontSize: '0.75rem', maxWidth: '340px' }}>
            Select origin and destination ports to calculate feasible maritime routing through verified chokepoints.
          </div>
        </div>
      )}

      {route && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(11, 25, 44, 0.85)',
            backdropFilter: 'blur(6px)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(0, 217, 255, 0.25)',
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            Origin
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>&middot;</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#f59e0b' }} />
            Chokepoints ({route.waypoints.length})
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>&middot;</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00D9FF' }} />
            Destination
          </span>
        </div>
      )}
    </div>
  );
}
