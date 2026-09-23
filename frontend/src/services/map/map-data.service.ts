import type {
  VesselPosition,
  HistoricalAisPoint,
  VesselVoyageTrack,
  MaritimeTerminal,
  MaritimeWaypoint,
  SecaZone,
} from '../../types/map';
import type { Vessel } from '../../types/vessel';

export const MAP_WAYPOINTS: MaritimeWaypoint[] = [
  {
    id: 'wp-malacca',
    name: 'Strait of Malacca',
    category: 'Strait',
    latitude: 2.5000,
    longitude: 101.5000,
    description: 'Main shipping channel between the Indian Ocean and the Pacific Ocean (100k+ transits/yr).',
  },
  {
    id: 'wp-singapore',
    name: 'Singapore Strait',
    category: 'Strait',
    latitude: 1.2200,
    longitude: 103.8000,
    description: 'Busiest maritime transshipment bottleneck linking East Asia and Europe.',
  },
  {
    id: 'wp-suez',
    name: 'Suez Canal (South Entry)',
    category: 'Canal',
    latitude: 29.9300,
    longitude: 32.5500,
    description: 'Vital 193 km artificial sea-level waterway in Egypt connecting Mediterranean & Red Sea.',
  },
  {
    id: 'wp-bab',
    name: 'Bab-el-Mandeb',
    category: 'Choke Point',
    latitude: 12.5800,
    longitude: 43.3300,
    description: 'Strategic gate connecting the Red Sea to the Gulf of Aden.',
  },
  {
    id: 'wp-hormuz',
    name: 'Strait of Hormuz',
    category: 'Choke Point',
    latitude: 26.5600,
    longitude: 56.2500,
    description: 'Global crude oil artery carrying ~21% of worldwide petroleum consumption.',
  },
  {
    id: 'wp-gibraltar',
    name: 'Strait of Gibraltar',
    category: 'Strait',
    latitude: 35.9600,
    longitude: -5.6000,
    description: 'Natural maritime passage connecting the Atlantic Ocean to the Mediterranean Sea.',
  },
  {
    id: 'wp-panama',
    name: 'Panama Canal (Miraflores)',
    category: 'Canal',
    latitude: 8.9900,
    longitude: -79.5900,
    description: '82 km canal conduit connecting Atlantic and Pacific Oceans.',
  },
  {
    id: 'wp-dover',
    name: 'Strait of Dover',
    category: 'Passage',
    latitude: 51.1000,
    longitude: 1.4500,
    description: 'World’s busiest maritime waterway at the narrowest part of the English Channel.',
  },
  {
    id: 'wp-cape',
    name: 'Cape of Good Hope',
    category: 'Passage',
    latitude: -34.3500,
    longitude: 18.4700,
    description: 'Intercontinental alternative around Southern Africa avoiding Red Sea chokepoints.',
  },
];

export const MAP_TERMINALS: MaritimeTerminal[] = [
  {
    id: 101,
    name: 'Jurong Island Liquid Bulk Terminal',
    port_name: 'Singapore',
    country: 'Singapore',
    latitude: 1.2680,
    longitude: 103.6820,
    terminal_type: 'Crude Oil',
    max_draft_m: 16.5,
    berths: 8,
  },
  {
    id: 102,
    name: 'Pasir Panjang Container Terminal',
    port_name: 'Singapore',
    country: 'Singapore',
    latitude: 1.2780,
    longitude: 103.7840,
    terminal_type: 'Container',
    max_draft_m: 18.0,
    berths: 14,
  },
  {
    id: 103,
    name: 'JNPT Nhava Sheva International Container Terminal',
    port_name: 'Mumbai / JNPT',
    country: 'India',
    latitude: 18.9480,
    longitude: 72.9510,
    terminal_type: 'Container',
    max_draft_m: 15.0,
    berths: 6,
  },
  {
    id: 104,
    name: 'Mundra Adani Coal & Bulk Terminal',
    port_name: 'Mundra',
    country: 'India',
    latitude: 22.7380,
    longitude: 69.7040,
    terminal_type: 'Dry Bulk',
    max_draft_m: 17.5,
    berths: 4,
  },
  {
    id: 105,
    name: 'Ras Tanura Sea Island Crude Terminal',
    port_name: 'Ras Tanura',
    country: 'Saudi Arabia',
    latitude: 26.6500,
    longitude: 50.1600,
    terminal_type: 'Crude Oil',
    max_draft_m: 22.0,
    berths: 10,
  },
  {
    id: 106,
    name: 'Rotterdam Maasvlakte II Deepwater Quay',
    port_name: 'Rotterdam',
    country: 'Netherlands',
    latitude: 51.9600,
    longitude: 4.0200,
    terminal_type: 'Container',
    max_draft_m: 20.0,
    berths: 12,
  },
  {
    id: 107,
    name: 'Shanghai Yangshan Deepwater Terminal',
    port_name: 'Shanghai',
    country: 'China',
    latitude: 30.6200,
    longitude: 122.0700,
    terminal_type: 'Container',
    max_draft_m: 16.0,
    berths: 16,
  },
];

export const SECA_ZONES: SecaZone[] = [
  {
    id: 'seca-baltic',
    name: 'Baltic Sea SECA (0.10% S)',
    type: 'SECA',
    sulfur_limit: '0.10% m/m',
    color: '#38bdf8',
    coordinates: [
      [54.0, 9.5],
      [53.8, 14.5],
      [55.5, 21.0],
      [59.5, 25.0],
      [60.5, 29.5],
      [65.0, 24.5],
      [60.0, 18.0],
      [56.0, 12.0],
      [57.8, 10.5],
      [54.0, 9.5],
    ],
  },
  {
    id: 'seca-north-sea',
    name: 'North Sea & English Channel SECA (0.10% S)',
    type: 'SECA',
    sulfur_limit: '0.10% m/m',
    color: '#818cf8',
    coordinates: [
      [51.0, 1.5],
      [49.5, -3.0],
      [49.0, -5.5],
      [51.5, -4.5],
      [57.0, -2.0],
      [61.0, -1.0],
      [62.0, 4.5],
      [58.0, 8.5],
      [54.0, 8.5],
      [51.0, 3.0],
      [51.0, 1.5],
    ],
  },
  {
    id: 'eca-north-america',
    name: 'North American Atlantic & Gulf ECA (0.10% S)',
    type: 'ECA-SOx',
    sulfur_limit: '0.10% m/m',
    color: '#34d399',
    coordinates: [
      [25.0, -80.0],
      [30.0, -78.0],
      [35.0, -73.0],
      [42.0, -68.0],
      [45.0, -60.0],
      [43.0, -65.0],
      [38.0, -72.0],
      [32.0, -79.0],
      [27.0, -82.0],
      [25.0, -80.0],
    ],
  },
];

export class MapDataService {
  /**
   * Separate valid positioned entities from unpositioned entities.
   * CRITICAL: Never invents fake coordinates or synthetic positions.
   */
  static partitionVessels(vessels: Vessel[]): {
    positioned: VesselPosition[];
    unpositioned: Vessel[];
  } {
    const safeVessels = Array.isArray(vessels) ? vessels : [];
    const positioned: VesselPosition[] = [];
    const unpositioned: Vessel[] = [];

    safeVessels.forEach((v) => {
      const rawLat = (v as any).latitude;
      const rawLng = (v as any).longitude;

      if (
        typeof rawLat === 'number' &&
        typeof rawLng === 'number' &&
        !isNaN(rawLat) &&
        !isNaN(rawLng) &&
        rawLat >= -90 &&
        rawLat <= 90 &&
        rawLng >= -180 &&
        rawLng <= 180
      ) {
        positioned.push({
          id: v.id,
          name: v.name,
          imo_number: v.imo_number,
          vessel_type: v.vessel_type || 'Commercial Vessel',
          flag: v.flag,
          capacity_tons: v.capacity_tons,
          status: v.status || 'underway',
          latitude: rawLat,
          longitude: rawLng,
          heading: (v as any).heading ?? 0,
          speed_knots: (v as any).speed_knots ?? (v.speed_laden_knots || 0),
          draft_m: v.draft_m,
          destination_port: (v as any).destination_port ?? 'Awaiting orders',
          origin_port: (v as any).origin_port ?? 'Not assigned',
          eta: (v as any).eta ?? 'TBD',
          last_updated: 'Live Telemetry',
          cargo_type: v.cargo_types,
          fuel_consumption_mt_day: v.fuel_laden_mt_day || undefined,
        });
      } else {
        unpositioned.push(v);
      }
    });

    return { positioned, unpositioned };
  }

  /**
   * Parse real vessels from backend API, returning an array of VesselPosition[] with valid coordinates.
   * CRITICAL: Returns a clean VesselPosition[] array.
   */
  static enrichVesselsWithPositions(vessels: Vessel[]): VesselPosition[] {
    return MapDataService.partitionVessels(vessels).positioned;
  }


  /**
   * Calculate great-circle distance between two geographic coordinates using the Haversine formula.
   */
  static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Generates a 2-hour resolution Historical AIS Voyage Track
   */
  static getHistoricalVoyageTrack(vesselId: number): VesselVoyageTrack {
    const now = new Date('2026-09-10T21:00:00Z').getTime();
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

    // Track for Persian Gulf / Red Sea -> Indian Ocean -> Singapore
    const baseCoords: [number, number, number, number][] = [
      // [lat, lng, speed, heading]
      [26.65, 50.16, 0.0, 90], // Berth Ras Tanura
      [26.70, 50.35, 8.5, 75],
      [26.50, 52.10, 13.8, 110], // Strait of Hormuz
      [25.80, 55.40, 14.2, 125],
      [24.50, 58.50, 14.5, 135], // Gulf of Oman
      [21.80, 61.20, 14.1, 140], // Arabian Sea
      [18.50, 64.80, 13.9, 138],
      [15.20, 68.90, 14.0, 136],
      [11.80, 73.10, 14.2, 132],
      [8.50, 77.20, 14.1, 128], // South of India / Cape Comorin
      [6.10, 81.50, 13.7, 115], // South of Sri Lanka
      [5.80, 86.40, 14.2, 95],  // Bay of Bengal passage
      [5.70, 91.20, 14.0, 90],
      [5.62, 95.84, 14.1, 98],  // Entry to Malacca Strait (Current point)
    ];

    const points: HistoricalAisPoint[] = [];
    const totalSteps = baseCoords.length;

    for (let i = 0; i < totalSteps; i++) {
      const [lat, lng, spd, hdg] = baseCoords[i];
      const timeOffset = (totalSteps - 1 - i) * TWO_HOURS_MS;
      const pointTime = new Date(now - timeOffset).toISOString();

      points.push({
        id: `ais-${vesselId}-${i}`,
        vessel_id: vesselId,
        timestamp: pointTime,
        latitude: lat,
        longitude: lng,
        speed_knots: spd,
        heading: hdg,
        draft_m: 11.2 - i * 0.02, // slight fuel burn burn-off
        status: i === 0 ? 'moored' : 'underway',
      });
    }

    return {
      vessel_id: vesselId,
      voyage_id: `VOY-2026-${vesselId}-98`,
      origin_port: { name: 'Ras Tanura', unlocode: 'SARST', lat: 26.65, lng: 50.16 },
      destination_port: { name: 'Singapore', unlocode: 'SGSIN', lat: 1.26, lng: 103.8 },
      departure_time: points[0].timestamp,
      estimated_arrival: '2026-09-13T08:30:00Z',
      distance_nm: 3640,
      points,
    };
  }

  /**
   * Generate Great Circle route coordinates between two points with waypoints
   */
  static getRouteCoordinates(from: [number, number], to: [number, number], intermediateWps: [number, number][] = []): [number, number][] {
    const route: [number, number][] = [from];
    route.push(...intermediateWps);
    route.push(to);
    return route;
  }
}

export const partitionVessels = MapDataService.partitionVessels;
export const enrichVesselsWithPositions = MapDataService.enrichVesselsWithPositions;

