import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { portsService } from '../services/api/ports.service';
import { vesselsService } from '../services/api/vessels.service';
import { routesService } from '../services/api/routes.service';
import { trackingService } from '../services/api/tracking.service';
import type { Port } from '../types/port';
import type { Vessel } from '../types/vessel';
import type { Route } from '../types/route';
import type { VesselPosition } from '../types/map';

export interface PositionedPort extends Port {
  latitude: number;
  longitude: number;
}

export interface ResolvedRoute {
  id: number;
  origin_port_id: number;
  destination_port_id: number;
  originPort: Port | null;
  destinationPort: Port | null;
  distance_km: number | null;
  estimated_duration_hours: number | null;
  route_status: string;
  hasValidCoordinates: boolean;
}

export interface MapDataResult {
  // Raw and positioned ports
  ports: Port[];
  positionedPorts: PositionedPort[];
  portsById: Map<number, Port>;
  
  // Raw and positioned vessels
  vessels: Vessel[];
  positionedVessels: VesselPosition[];
  unpositionedVessels: Vessel[];

  // Routes
  routes: Route[];
  resolvedRoutes: ResolvedRoute[];

  // Derived real counts (no fake numbers)
  totalPortsCount: number;
  positionedPortsCount: number;
  totalVesselsCount: number;
  positionedVesselsCount: number;
  unpositionedVesselsCount: number;
  totalRoutesCount: number;
  renderableRoutesCount: number;

  // Status flags
  isLoading: boolean;
  isPortsLoading: boolean;
  isVesselsLoading: boolean;
  isRoutesLoading: boolean;
  isError: boolean;
  error: Error | null;
  dataUpdatedAt: number;
  refetchAll: () => void;
}

export function useMapData(): MapDataResult {
  // 1. Fetch real ports from FastAPI backend (limit 500 for high geographic coverage)
  const portsQuery = useQuery({
    queryKey: ['map', 'ports', 500],
    queryFn: () => portsService.getPorts(500),
    staleTime: 1000 * 60 * 10,
  });

  // 2. Fetch real vessels from FastAPI backend
  const vesselsQuery = useQuery({
    queryKey: ['map', 'vessels', 100],
    queryFn: () => vesselsService.getVessels(100),
    staleTime: 1000 * 60 * 5,
  });

  // 3. Fetch real commercial routes from FastAPI backend
  const routesQuery = useQuery({
    queryKey: ['map', 'routes', 50],
    queryFn: () => routesService.getRoutes(50),
    staleTime: 1000 * 60 * 5,
  });

  // 4. Fetch real tracked vessel positions from tracking service (backed by public.vessel_positions)
  const trackingQuery = useQuery({
    queryKey: ['map', 'tracking'],
    queryFn: () => trackingService.getTrackedVessels(),
    staleTime: 1000 * 60 * 2,
  });

  const ports = useMemo(() => portsQuery.data?.ports ?? [], [portsQuery.data]);
  const vessels = useMemo(() => vesselsQuery.data?.vessels ?? [], [vesselsQuery.data]);
  const routes = useMemo(() => routesQuery.data?.routes ?? [], [routesQuery.data]);

  // Index ports by ID for O(1) route lookups
  const portsById = useMemo(() => {
    const map = new Map<number, Port>();
    ports.forEach((p) => map.set(p.id, p));
    return map;
  }, [ports]);

  // Filter valid ports strictly with real numerical coordinates
  const positionedPorts = useMemo<PositionedPort[]>(() => {
    return ports.filter(
      (p): p is PositionedPort =>
        typeof p.latitude === 'number' &&
        typeof p.longitude === 'number' &&
        !isNaN(p.latitude) &&
        !isNaN(p.longitude) &&
        p.latitude >= -90 &&
        p.latitude <= 90 &&
        p.longitude >= -180 &&
        p.longitude <= 180
    );
  }, [ports]);

  // Separate vessels with real coordinates from unpositioned vessels
  // Merges vessel specifications with latest authentic positions from public.vessel_positions
  // RULE: Never invent fake coordinates.
  const { positionedVessels, unpositionedVessels } = useMemo(() => {
    const positioned: VesselPosition[] = [];
    const unpositioned: Vessel[] = [];

    const trackingMap = new Map<number, NonNullable<typeof trackingQuery.data>['vessels'][0]>();
    (trackingQuery.data?.vessels || []).forEach((t) => {
      trackingMap.set(t.vessel_id, t);
    });

    vessels.forEach((v) => {
      // 1. Check if vessel has valid coordinates directly attached
      let lat = (v as any).latitude;
      let lng = (v as any).longitude;
      let heading = (v as any).heading ?? 0;
      let speed = (v as any).speed_knots ?? (v.speed_laden_knots || 0);
      let status = v.status || 'underway';
      let lastUpdated = 'Fleet Registry';

      // 2. Fall back to authentic stored telemetry from public.vessel_positions
      const tracked = trackingMap.get(v.id);
      if (tracked?.latest_position) {
        if (
          typeof tracked.latest_position.latitude === 'number' &&
          typeof tracked.latest_position.longitude === 'number'
        ) {
          lat = tracked.latest_position.latitude;
          lng = tracked.latest_position.longitude;
          heading = tracked.latest_position.heading ?? heading;
          speed = tracked.latest_position.speed_knots ?? speed;
          status = tracked.tracking_status === 'LIVE' ? 'underway' : tracked.tracking_status === 'RECENT' ? 'underway' : 'anchored';
          lastUpdated = tracked.latest_position.recorded_at
            ? new Date(tracked.latest_position.recorded_at).toLocaleDateString()
            : 'AIS Telemetry';
        }
      }

      if (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        positioned.push({
          id: v.id,
          name: v.name,
          imo_number: v.imo_number,
          vessel_type: v.vessel_type || 'Commercial Vessel',
          flag: v.flag,
          capacity_tons: v.capacity_tons,
          status,
          latitude: lat,
          longitude: lng,
          heading,
          speed_knots: speed,
          draft_m: v.draft_m,
          destination_port: (v as any).destination_port ?? 'Awaiting orders',
          origin_port: (v as any).origin_port ?? 'Not assigned',
          eta: (v as any).eta ?? 'TBD',
          last_updated: lastUpdated,
          cargo_type: v.cargo_types,
          fuel_consumption_mt_day: v.fuel_laden_mt_day ?? undefined,
        });
      } else {
        unpositioned.push(v);
      }
    });

    return { positionedVessels: positioned, unpositionedVessels: unpositioned };
  }, [vessels, trackingQuery.data]);

  // Resolve routes with their real origin and destination ports
  const resolvedRoutes = useMemo<ResolvedRoute[]>(() => {
    return routes.map((r) => {
      const originPort = portsById.get(r.origin_port_id) ?? null;
      const destinationPort = portsById.get(r.destination_port_id) ?? null;

      const hasValidCoordinates =
        originPort?.latitude != null &&
        originPort?.longitude != null &&
        destinationPort?.latitude != null &&
        destinationPort?.longitude != null;

      return {
        id: r.id,
        origin_port_id: r.origin_port_id,
        destination_port_id: r.destination_port_id,
        originPort,
        destinationPort,
        distance_km: r.distance_km,
        estimated_duration_hours: r.estimated_duration_hours,
        route_status: r.route_status || 'active',
        hasValidCoordinates: Boolean(hasValidCoordinates),
      };
    });
  }, [routes, portsById]);

  const renderableRoutesCount = useMemo(
    () => resolvedRoutes.filter((r) => r.hasValidCoordinates).length,
    [resolvedRoutes]
  );

  const isLoading = portsQuery.isLoading || vesselsQuery.isLoading || routesQuery.isLoading || trackingQuery.isLoading;
  const isError = portsQuery.isError || vesselsQuery.isError || routesQuery.isError || trackingQuery.isError;
  const error = (portsQuery.error || vesselsQuery.error || routesQuery.error || trackingQuery.error) as Error | null;
  const dataUpdatedAt = Math.max(
    portsQuery.dataUpdatedAt || 0,
    vesselsQuery.dataUpdatedAt || 0,
    routesQuery.dataUpdatedAt || 0,
    trackingQuery.dataUpdatedAt || 0
  );

  const refetchAll = () => {
    portsQuery.refetch();
    vesselsQuery.refetch();
    routesQuery.refetch();
    trackingQuery.refetch();
  };

  return {
    ports,
    positionedPorts,
    portsById,
    vessels,
    positionedVessels,
    unpositionedVessels,
    routes,
    resolvedRoutes,
    totalPortsCount: ports.length,
    positionedPortsCount: positionedPorts.length,
    totalVesselsCount: vessels.length,
    positionedVesselsCount: positionedVessels.length,
    unpositionedVesselsCount: unpositionedVessels.length,
    totalRoutesCount: routes.length,
    renderableRoutesCount,
    isLoading,
    isPortsLoading: portsQuery.isLoading,
    isVesselsLoading: vesselsQuery.isLoading,
    isRoutesLoading: routesQuery.isLoading,
    isError,
    error,
    dataUpdatedAt,
    refetchAll,
  };
}
