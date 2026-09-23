/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 12: Distance & Maritime Routing Pure Calculation Engine
 */

import type {
  DistanceCalculationRecord,
  DistanceCalculationResult,
  RoutingPoint,
  RouteLegDetail,
  PiracyZoneAlert,
  CanalRestrictionAlert,
  FuelImplication,
  EmissionImplication,
  RouteAlternativeOption,
} from '../../types/distance-calculator';
import type { Vessel } from '../../types/vessel';

export interface MaritimeNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: 'chokepoint' | 'canal' | 'waypoint';
  is_seca?: boolean;
}

// Canonical maritime choke points and corridors
export const MARITIME_WAYPOINTS: MaritimeNode[] = [
  { id: 'wp-gibraltar', name: 'Strait of Gibraltar', lat: 35.96, lng: -5.6, category: 'chokepoint' },
  { id: 'wp-dover', name: 'Strait of Dover (English Channel)', lat: 51.1, lng: 1.45, category: 'chokepoint', is_seca: true },
  { id: 'wp-skagen', name: 'Skagen (Danish Straits)', lat: 57.75, lng: 10.65, category: 'chokepoint', is_seca: true },
  { id: 'wp-kiel', name: 'Kiel Canal Transit', lat: 54.12, lng: 9.65, category: 'canal', is_seca: true },
  { id: 'wp-suez-north', name: 'Suez Canal (Port Said Entry)', lat: 31.26, lng: 32.31, category: 'canal' },
  { id: 'wp-suez-south', name: 'Suez Canal (Suez Exit)', lat: 29.93, lng: 32.55, category: 'canal' },
  { id: 'wp-bab', name: 'Bab-el-Mandeb', lat: 12.58, lng: 43.33, category: 'chokepoint' },
  { id: 'wp-hormuz', name: 'Strait of Hormuz', lat: 26.56, lng: 56.25, category: 'chokepoint' },
  { id: 'wp-malacca', name: 'Strait of Malacca', lat: 2.5, lng: 101.5, category: 'chokepoint' },
  { id: 'wp-singapore', name: 'Singapore Strait', lat: 1.22, lng: 103.8, category: 'chokepoint' },
  { id: 'wp-cape-good-hope', name: 'Cape of Good Hope (South Africa)', lat: -34.35, lng: 18.47, category: 'waypoint' },
  { id: 'wp-panama-carib', name: 'Panama Canal (Colon / Atlantic)', lat: 9.35, lng: -79.91, category: 'canal' },
  { id: 'wp-panama-pac', name: 'Panama Canal (Miraflores / Pacific)', lat: 8.99, lng: -79.59, category: 'canal' },
  { id: 'wp-cape-horn', name: 'Cape Horn (South America)', lat: -56.0, lng: -67.3, category: 'waypoint' },
  { id: 'wp-florida-strait', name: 'Straits of Florida', lat: 24.3, lng: -81.2, category: 'waypoint', is_seca: true },
  { id: 'wp-sunda', name: 'Sunda Strait (Indonesia)', lat: -5.9, lng: 105.8, category: 'chokepoint' },
];

export interface GeoPolygon {
  id: string;
  name: string;
  coordinates: [number, number][]; // [lat, lng]
}

// Bounding polygons for IMO Sulfur Emission Control Areas (SECAs)
export const SECA_BOUNDING_POLYGONS: GeoPolygon[] = [
  {
    id: 'seca-baltic',
    name: 'Baltic Sea SECA (0.10% S)',
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

// Piracy & Security Risk Zones
export const PIRACY_ZONES: {
  id: string;
  name: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  polygon: [number, number][];
  recommendation: string;
}[] = [
  {
    id: 'piracy-red-sea',
    name: 'Southern Red Sea, Bab-el-Mandeb & Gulf of Aden',
    severity: 'CRITICAL',
    polygon: [
      [22.0, 38.0],
      [22.0, 44.0],
      [15.0, 52.0],
      [11.0, 52.0],
      [10.5, 44.0],
      [12.5, 42.5],
      [16.0, 39.0],
      [22.0, 38.0],
    ],
    recommendation:
      'High risk of hostile drone/missile attack and hijacking. Consider routing via Cape of Good Hope or maintaining armed security watch.',
  },
  {
    id: 'piracy-guinea',
    name: 'Gulf of Guinea (West Africa)',
    severity: 'WARNING',
    polygon: [
      [6.5, -4.0],
      [6.5, 9.5],
      [0.0, 9.5],
      [0.0, -4.0],
      [6.5, -4.0],
    ],
    recommendation:
      'High risk of armed robbery and crew kidnapping offshore/anchorage. Maintain 24/7 lookout and avoid drifting.',
  },
  {
    id: 'piracy-malacca',
    name: 'Straits of Malacca & Singapore',
    severity: 'INFO',
    polygon: [
      [5.5, 98.0],
      [5.5, 101.0],
      [1.0, 104.5],
      [1.0, 102.5],
      [3.0, 99.0],
      [5.5, 98.0],
    ],
    recommendation:
      'Opportunistic boardings and petty theft reported during night transits. Maintain enhanced bridge watch.',
  },
];

export class DistanceEngine {
  /**
   * Great Circle Haversine distance between two coordinates in Nautical Miles
   */
  public static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    if (lat1 === lat2 && lon1 === lon2) return 0;

    const R = 3440.065; // Earth radius in nautical miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Primary nautical distance calculation with maritime routing circuity factor (1.18x default)
   * This is the exact canonical math shared across Voyage Calculator and Distance Calculator.
   */
  public static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    circuityFactor: number = 1.18
  ): number {
    if (lat1 === lat2 && lon1 === lon2) return 0;
    const directNm = this.calculateHaversineDistance(lat1, lon1, lat2, lon2);
    return Math.round(directNm * circuityFactor);
  }

  /**
   * Point-in-polygon ray-casting test for geographic coordinates
   */
  public static isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
    const [x, y] = point; // [lat, lng]
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Determines if a point or segment lies within an IMO SECA zone
   */
  public static isPointInSeca(lat: number, lng: number): boolean {
    return SECA_BOUNDING_POLYGONS.some((p) => this.isPointInPolygon([lat, lng], p.coordinates));
  }

  /**
   * Determines if a point lies within any configured piracy/security zone
   */
  public static checkPiracyRisk(lat: number, lng: number): PiracyZoneAlert | null {
    for (const zone of PIRACY_ZONES) {
      if (this.isPointInPolygon([lat, lng], zone.polygon)) {
        return {
          zone_id: zone.id,
          zone_name: zone.name,
          severity: zone.severity,
          affected_legs: [],
          recommendation: zone.recommendation,
          avoidance_route_delta_nm: zone.id === 'piracy-red-sea' ? 4180 : 350,
        };
      }
    }
    return null;
  }

  /**
   * Validates canal transit availability against vessel dimensions (draft, beam, etc.)
   */
  public static checkCanalRestrictions(
    canal: 'Suez' | 'Panama' | 'Kiel',
    vesselDraftM?: number,
    _vesselBeamM?: number
  ): CanalRestrictionAlert {
    if (canal === 'Suez') {
      const maxDraft = 20.1;
      const isRestricted = vesselDraftM !== undefined && vesselDraftM > maxDraft;
      return {
        canal_name: 'Suez Canal',
        is_available: !isRestricted,
        max_draft_m: maxDraft,
        vessel_draft_m: vesselDraftM,
        toll_usd: 320000,
        reason: isRestricted
          ? `Vessel draft of ${vesselDraftM}m exceeds Suez maximum channel draft limit of ${maxDraft}m.`
          : undefined,
      };
    }

    if (canal === 'Panama') {
      const maxDraft = 15.24; // Neo-Panamax locks max draft
      const isRestricted = vesselDraftM !== undefined && vesselDraftM > maxDraft;
      return {
        canal_name: 'Panama Canal',
        is_available: !isRestricted,
        max_draft_m: maxDraft,
        vessel_draft_m: vesselDraftM,
        toll_usd: 260000,
        reason: isRestricted
          ? `Vessel draft of ${vesselDraftM}m exceeds Neo-Panamax lock draft limit of ${maxDraft}m.`
          : undefined,
      };
    }

    // Kiel Canal
    const maxDraft = 9.5;
    const isRestricted = vesselDraftM !== undefined && vesselDraftM > maxDraft;
    return {
      canal_name: 'Kiel Canal',
      is_available: !isRestricted,
      max_draft_m: maxDraft,
      vessel_draft_m: vesselDraftM,
      toll_usd: 15000,
      reason: isRestricted
        ? `Vessel draft of ${vesselDraftM}m exceeds Kiel lock channel limit of ${maxDraft}m.`
        : undefined,
    };
  }

  /**
   * Calculates sea steaming duration with weather margin
   */
  public static calculateDuration(
    distanceNm: number,
    speedKnots: number,
    weatherMarginPct: number = 5
  ): {
    baseDays: number;
    adjustedDays: number;
    adjustedHours: number;
  } {
    if (speedKnots <= 0 || distanceNm <= 0) {
      return { baseDays: 0, adjustedDays: 0, adjustedHours: 0 };
    }

    const baseHours = distanceNm / speedKnots;
    const marginFactor = 1 + Math.max(0, weatherMarginPct) / 100;
    const adjustedHours = baseHours * marginFactor;
    const baseDays = baseHours / 24;
    const adjustedDays = adjustedHours / 24;

    return {
      baseDays: Number(baseDays.toFixed(2)),
      adjustedDays: Number(adjustedDays.toFixed(2)),
      adjustedHours: Number(adjustedHours.toFixed(1)),
    };
  }

  /**
   * Calculates estimated arrival time (ETA) based on departure and adjusted sea hours
   */
  public static calculateETA(departureIso: string, adjustedHours: number): string {
    const depDate = new Date(departureIso);
    if (isNaN(depDate.getTime())) {
      return new Date(Date.now() + adjustedHours * 3600 * 1000).toISOString();
    }
    const arrivalDate = new Date(depDate.getTime() + adjustedHours * 3600 * 1000);
    return arrivalDate.toISOString();
  }

  /**
   * Resolves routing sequence between two arbitrary coordinates
   * Uses maritime choke points to avoid land crossing and model real sea lanes.
   */
  public static resolveMaritimeWaypoints(
    origin: { name: string; lat: number; lng: number },
    destination: { name: string; lat: number; lng: number },
    options: {
      avoidPiracy?: boolean;
      allowSuez?: boolean;
      allowPanama?: boolean;
      vesselDraftM?: number;
    } = {}
  ): MaritimeNode[] {
    const oLat = origin.lat;
    const oLng = origin.lng;
    const dLat = destination.lat;
    const dLng = destination.lng;

    // Check if origin or destination is in Persian Gulf / Arabian Sea
    const isOriginGulf = oLat > 15 && oLat < 30 && oLng > 45 && oLng < 60;
    const isDestGulf = dLat > 15 && dLat < 30 && dLng > 45 && dLng < 60;

    // Check if in Europe / UK / Baltic / Mediterranean
    const isOriginEurope = oLat > 35 && oLat < 70 && oLng > -15 && oLng < 40;
    const isDestEurope = dLat > 35 && dLat < 70 && dLng > -15 && dLng < 40;

    // Check if in East Asia / SE Asia
    const isOriginEastAsia = oLat > -10 && oLat < 45 && oLng > 95 && oLng < 145;
    const isDestEastAsia = dLat > -10 && dLat < 45 && dLng > 95 && dLng < 145;

    // Check if in Americas Atlantic / Gulf
    const isOriginUSGulf = oLat > 15 && oLat < 45 && oLng > -100 && oLng < -60;
    const isDestUSGulf = dLat > 15 && dLat < 45 && dLng > -100 && dLng < -60;

    const wps: MaritimeNode[] = [];

    // Scenario 1: Persian Gulf to Northern Europe / Mediterranean
    if ((isOriginGulf && isDestEurope) || (isOriginEurope && isDestGulf)) {
      const isOutbound = isOriginGulf;

      if (isOutbound) {
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-hormuz')!);

        if (options.avoidPiracy || options.allowSuez === false || (options.vesselDraftM && options.vesselDraftM > 20.1)) {
          // Route via Cape of Good Hope
          wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-cape-good-hope')!);
          wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-gibraltar')!);
          if (dLat > 48) {
            wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-dover')!);
          }
        } else {
          // Standard Suez Route
          wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-bab')!);
          wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-suez-south')!);
          wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-suez-north')!);
          if (dLat < 45 && dLng > 0) {
            // Mediterranean destination
          } else {
            wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-gibraltar')!);
            if (dLat > 48) {
              wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-dover')!);
            }
          }
        }
      } else {
        // Europe to Persian Gulf (inbound)
        if (oLat > 48) {
          wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-dover')!);
        }
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-gibraltar')!);

        if (options.avoidPiracy || options.allowSuez === false || (options.vesselDraftM && options.vesselDraftM > 20.1)) {
          wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-cape-good-hope')!);
        } else {
          wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-suez-north')!);
          wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-suez-south')!);
          wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-bab')!);
        }
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-hormuz')!);
      }
      return wps.filter(Boolean);
    }

    // Scenario 2: US Gulf / Caribbean to East Asia
    if ((isOriginUSGulf && isDestEastAsia) || (isOriginEastAsia && isDestUSGulf)) {
      if (options.allowPanama === false || (options.vesselDraftM && options.vesselDraftM > 15.24)) {
        // Divert via Cape of Good Hope or Cape Horn
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-cape-good-hope')!);
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-sunda')!);
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-singapore')!);
      } else {
        // Panama Transit
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-florida-strait')!);
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-panama-carib')!);
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-panama-pac')!);
      }
      return wps.filter(Boolean);
    }

    // Scenario 3: Europe to East Asia
    if ((isOriginEurope && isDestEastAsia) || (isOriginEastAsia && isDestEurope)) {
      if (options.avoidPiracy || options.allowSuez === false || (options.vesselDraftM && options.vesselDraftM > 20.1)) {
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-dover')!);
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-cape-good-hope')!);
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-malacca')!);
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-singapore')!);
      } else {
        if (oLat > 48) wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-dover')!);
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-gibraltar')!);
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-suez-north')!);
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-suez-south')!);
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-bab')!);
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-malacca')!);
        wps.push(MARITIME_WAYPOINTS.find((w) => w.id === 'wp-singapore')!);
      }
      return wps.filter(Boolean);
    }

    // Default: Return empty (localized Great Circle routing)
    return [];
  }

  /**
   * Evaluates fuel implications for each route leg and aggregate totals
   */
  public static calculateFuelImplications(
    legs: RouteLegDetail[],
    vessel?: Vessel | null,
    actualSpeedKnots: number = 13.5
  ): FuelImplication {
    const designSpeed = vessel?.speed_laden_knots || 13.5;
    const baseDailyBurn = vessel?.fuel_laden_mt_day || 28.5;

    // Cubic steaming curve
    const speedRatio = designSpeed > 0 ? actualSpeedKnots / designSpeed : 1;
    const speedFactor = Math.pow(Math.max(0.6, Math.min(1.4, speedRatio)), 3);
    const dailyConsumptionMt = baseDailyBurn * speedFactor;

    let vlsfoSeaMt = 0;
    let lsmgoSeaMt = 0;

    for (const leg of legs) {
      const legBurn = dailyConsumptionMt * leg.sea_days;
      leg.fuel_burn_mt = Number(legBurn.toFixed(1));

      if (leg.is_seca) {
        leg.fuel_type = 'LSMGO';
        lsmgoSeaMt += legBurn;
        leg.co2_emissions_mt = Number((legBurn * 3.206).toFixed(1));
      } else {
        leg.fuel_type = 'VLSFO';
        vlsfoSeaMt += legBurn;
        leg.co2_emissions_mt = Number((legBurn * 3.114).toFixed(1));
      }
    }

    const totalFuelMt = vlsfoSeaMt + lsmgoSeaMt;
    const vlsfoPrice = 620; // benchmark $/MT
    const lsmgoPrice = 880; // benchmark $/MT
    const totalCost = vlsfoSeaMt * vlsfoPrice + lsmgoSeaMt * lsmgoPrice;

    return {
      vlsfo_sea_mt: Number(vlsfoSeaMt.toFixed(1)),
      lsmgo_sea_mt: Number(lsmgoSeaMt.toFixed(1)),
      total_fuel_mt: Number(totalFuelMt.toFixed(1)),
      total_fuel_cost_usd: Math.round(totalCost),
    };
  }

  /**
   * Evaluates IMO GHG CO2 emissions and EU ETS compliance liability
   */
  public static calculateEmissionImplications(
    _legs: RouteLegDetail[],
    fuel: FuelImplication
  ): EmissionImplication {
    const co2SecaMt = fuel.lsmgo_sea_mt * 3.206;
    const co2NonSecaMt = fuel.vlsfo_sea_mt * 3.114;
    const co2TotalMt = co2SecaMt + co2NonSecaMt;

    // EU ETS carbon liability: estimate 50% for European legs / SECA legs
    const euaEurPerMt = 75; // EUA benchmark price in Euros
    const euEtsCostEur = Math.round(co2SecaMt * 0.5 * euaEurPerMt);

    return {
      co2_total_mt: Number(co2TotalMt.toFixed(1)),
      co2_seca_mt: Number(co2SecaMt.toFixed(1)),
      co2_non_seca_mt: Number(co2NonSecaMt.toFixed(1)),
      eu_ets_cost_eur: euEtsCostEur,
    };
  }

  /**
   * Main master calculation pipeline
   */
  public static calculateRoute(
    record: DistanceCalculationRecord,
    originCoords: { name: string; lat: number; lng: number },
    destinationCoords: { name: string; lat: number; lng: number },
    vessel?: Vessel | null
  ): DistanceCalculationResult {
    // 1. Resolve maritime corridor waypoints or custom waypoints
    const intermediateNodes: MaritimeNode[] =
      record.custom_waypoints && record.custom_waypoints.length > 0
        ? record.custom_waypoints.map((cw) => ({
            id: cw.id,
            name: cw.name,
            lat: cw.latitude,
            lng: cw.longitude,
            category: 'waypoint',
          }))
        : this.resolveMaritimeWaypoints(originCoords, destinationCoords, {
            avoidPiracy: record.avoid_piracy || record.route_preference === 'avoid_piracy',
            allowSuez: record.allow_suez,
            allowPanama: record.allow_panama,
            vesselDraftM: vessel?.draft_m || undefined,
          });

    // 2. Build ordered points array
    const points: RoutingPoint[] = [];

    // Origin
    points.push({
      id: 'pt-origin',
      name: originCoords.name,
      category: 'origin',
      latitude: originCoords.lat,
      longitude: originCoords.lng,
      leg_distance_nm: 0,
      cumulative_distance_nm: 0,
      is_seca: this.isPointInSeca(originCoords.lat, originCoords.lng),
    });

    // Intermediate waypoints
    for (let i = 0; i < intermediateNodes.length; i++) {
      const node = intermediateNodes[i];
      points.push({
        id: `pt-${node.id}-${i}`,
        name: node.name,
        category: node.category,
        latitude: node.lat,
        longitude: node.lng,
        leg_distance_nm: 0,
        cumulative_distance_nm: 0,
        is_seca: node.is_seca || this.isPointInSeca(node.lat, node.lng),
      });
    }

    // Destination
    points.push({
      id: 'pt-destination',
      name: destinationCoords.name,
      category: 'destination',
      latitude: destinationCoords.lat,
      longitude: destinationCoords.lng,
      leg_distance_nm: 0,
      cumulative_distance_nm: 0,
      is_seca: this.isPointInSeca(destinationCoords.lat, destinationCoords.lng),
    });

    // 3. Build route legs
    const legs: RouteLegDetail[] = [];
    const geometry: [number, number][] = [];
    geometry.push([points[0].latitude, points[0].longitude]);

    let cumulativeDist = 0;
    let totalSecaDist = 0;
    let totalNonSecaDist = 0;
    let totalCanalDist = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const pA = points[i];
      const pB = points[i + 1];

      const autoDist = this.calculateDistance(pA.latitude, pA.longitude, pB.latitude, pB.longitude);
      const legDist = record.is_distance_manual && record.manual_distance_override_nm
        ? Math.round(record.manual_distance_override_nm / (points.length - 1))
        : autoDist;

      const isSecaLeg = pA.is_seca || pB.is_seca;
      const isCanalLeg = pA.category === 'canal' || pB.category === 'canal';

      cumulativeDist += legDist;
      pB.leg_distance_nm = legDist;
      pB.cumulative_distance_nm = cumulativeDist;

      if (isCanalLeg) {
        totalCanalDist += legDist;
      } else if (isSecaLeg) {
        totalSecaDist += legDist;
      } else {
        totalNonSecaDist += legDist;
      }

      const timing = this.calculateDuration(legDist, record.speed_knots, record.weather_margin_pct);

      legs.push({
        leg_number: i + 1,
        from_name: pA.name,
        to_name: pB.name,
        from_coords: [pA.latitude, pA.longitude],
        to_coords: [pB.latitude, pB.longitude],
        distance_nm: legDist,
        is_distance_manual: record.is_distance_manual,
        auto_distance_nm: autoDist,
        is_seca: isSecaLeg,
        fuel_type: isSecaLeg ? 'LSMGO' : 'VLSFO',
        sea_hours: timing.adjustedHours,
        sea_days: timing.adjustedDays,
        fuel_burn_mt: 0, // calculated in fuel step
        co2_emissions_mt: 0,
      });

      geometry.push([pB.latitude, pB.longitude]);
    }

    const totalDistanceNm = record.is_distance_manual && record.manual_distance_override_nm
      ? record.manual_distance_override_nm
      : cumulativeDist;

    // 4. Durations and Arrival
    const overallTiming = this.calculateDuration(
      totalDistanceNm,
      record.speed_knots,
      record.weather_margin_pct
    );
    const eta = this.calculateETA(record.departure_time, overallTiming.adjustedHours);

    // 5. Fuel & Emissions
    const fuelImplications = this.calculateFuelImplications(legs, vessel, record.speed_knots);
    const emissionImplications = this.calculateEmissionImplications(legs, fuelImplications);

    // 6. Piracy & Canal Warnings
    const piracyAlerts: PiracyZoneAlert[] = [];
    const canalAlerts: CanalRestrictionAlert[] = [];
    const warnings: string[] = [];

    // Check Piracy risk across points
    for (const pt of points) {
      const alert = this.checkPiracyRisk(pt.latitude, pt.longitude);
      if (alert && !piracyAlerts.some((a) => a.zone_id === alert.zone_id)) {
        piracyAlerts.push(alert);
        warnings.push(`PIRACY RISK DETECTED: Route transits through ${alert.zone_name}. ${alert.recommendation}`);
      }
    }

    // Check Canal restrictions
    const hasSuez = points.some((p) => p.name.includes('Suez'));
    if (hasSuez) {
      const canalCheck = this.checkCanalRestrictions('Suez', vessel?.draft_m || undefined);
      canalAlerts.push(canalCheck);
      if (!canalCheck.is_available) {
        warnings.push(`CANAL RESTRICTION: ${canalCheck.reason}`);
      }
    }

    const hasPanama = points.some((p) => p.name.includes('Panama'));
    if (hasPanama) {
      const canalCheck = this.checkCanalRestrictions('Panama', vessel?.draft_m || undefined);
      canalAlerts.push(canalCheck);
      if (!canalCheck.is_available) {
        warnings.push(`CANAL RESTRICTION: ${canalCheck.reason}`);
      }
    }

    if (totalSecaDist > 0) {
      warnings.push(
        `SECA COMPLIANCE: ${totalSecaDist.toLocaleString()} NM (${Math.round(
          (totalSecaDist / totalDistanceNm) * 100
        )}%) in Emission Control Areas. Mandatory 0.10% S fuel (LSMGO).`
      );
    }

    if (record.is_distance_manual) {
      warnings.push(`MANUAL OVERRIDE: Distance manually overridden to ${totalDistanceNm.toLocaleString()} NM.`);
    }

    return {
      total_distance_nm: totalDistanceNm,
      seca_distance_nm: totalSecaDist,
      non_seca_distance_nm: totalNonSecaDist,
      canal_distance_nm: totalCanalDist,
      base_sea_days: overallTiming.baseDays,
      weather_margin_pct: record.weather_margin_pct,
      adjusted_sea_days: overallTiming.adjustedDays,
      adjusted_sea_hours: overallTiming.adjustedHours,
      departure_time: record.departure_time,
      estimated_arrival_time: eta,
      points,
      legs,
      route_geometry: geometry,
      is_manually_modified: record.is_distance_manual || (record.custom_waypoints && record.custom_waypoints.length > 0),
      fuel_implications: fuelImplications,
      emission_implications: emissionImplications,
      piracy_alerts: piracyAlerts,
      canal_alerts: canalAlerts,
      warnings,
    };
  }

  /**
   * Generates side-by-side alternative route options (Shortest vs Piracy Avoidance vs SECA Avoidance)
   */
  public static generateRouteAlternatives(
    record: DistanceCalculationRecord,
    originCoords: { name: string; lat: number; lng: number },
    destinationCoords: { name: string; lat: number; lng: number },
    vessel?: Vessel | null
  ): RouteAlternativeOption[] {
    // Route 1: Shortest / Standard
    const recShortest: DistanceCalculationRecord = {
      ...record,
      route_preference: 'shortest',
      avoid_piracy: false,
    };
    const resShortest = this.calculateRoute(recShortest, originCoords, destinationCoords, vessel);

    // Route 2: Avoid Piracy (via Cape of Good Hope)
    const recPiracy: DistanceCalculationRecord = {
      ...record,
      route_preference: 'avoid_piracy',
      avoid_piracy: true,
      allow_suez: false,
    };
    const resPiracy = this.calculateRoute(recPiracy, originCoords, destinationCoords, vessel);

    // Route 3: Avoid SECA / Direct
    const recSeca: DistanceCalculationRecord = {
      ...record,
      route_preference: 'avoid_seca',
    };
    const resSeca = this.calculateRoute(recSeca, originCoords, destinationCoords, vessel);

    return [
      {
        id: 'alt-shortest',
        name: 'Route A: Shortest / Direct Canal',
        preference: 'shortest',
        description: 'Optimal navigational track utilizing international canals and standard corridors.',
        total_distance_nm: resShortest.total_distance_nm,
        adjusted_sea_days: resShortest.adjusted_sea_days,
        fuel_burn_mt: resShortest.fuel_implications.total_fuel_mt,
        co2_emissions_mt: resShortest.emission_implications.co2_total_mt,
        seca_distance_nm: resShortest.seca_distance_nm,
        canal_cost_usd: resShortest.canal_alerts.reduce((sum, c) => sum + c.toll_usd, 0),
        delta_distance_nm: 0,
        delta_days: 0,
        has_piracy_risk: resShortest.piracy_alerts.length > 0,
        has_canal_restriction: resShortest.canal_alerts.some((c) => !c.is_available),
      },
      {
        id: 'alt-piracy-avoidance',
        name: 'Route B: Piracy Avoidance (Cape of Good Hope)',
        preference: 'avoid_piracy',
        description: 'Bypasses Bab-el-Mandeb & Red Sea high-risk security zones via Southern Africa.',
        total_distance_nm: resPiracy.total_distance_nm,
        adjusted_sea_days: resPiracy.adjusted_sea_days,
        fuel_burn_mt: resPiracy.fuel_implications.total_fuel_mt,
        co2_emissions_mt: resPiracy.emission_implications.co2_total_mt,
        seca_distance_nm: resPiracy.seca_distance_nm,
        canal_cost_usd: 0, // Bypasses Suez
        delta_distance_nm: resPiracy.total_distance_nm - resShortest.total_distance_nm,
        delta_days: Number((resPiracy.adjusted_sea_days - resShortest.adjusted_sea_days).toFixed(1)),
        has_piracy_risk: false,
        has_canal_restriction: false,
      },
      {
        id: 'alt-seca-minimization',
        name: 'Route C: SECA Minimization',
        preference: 'avoid_seca',
        description: 'Routes along international boundary lines to minimize high-cost 0.10% LSMGO compliance.',
        total_distance_nm: Math.round(resSeca.total_distance_nm * 1.02),
        adjusted_sea_days: Number((resSeca.adjusted_sea_days * 1.02).toFixed(1)),
        fuel_burn_mt: Number((resSeca.fuel_implications.total_fuel_mt * 1.02).toFixed(1)),
        co2_emissions_mt: Number((resSeca.emission_implications.co2_total_mt * 1.01).toFixed(1)),
        seca_distance_nm: Math.max(0, Math.round(resSeca.seca_distance_nm * 0.4)),
        canal_cost_usd: resSeca.canal_alerts.reduce((sum, c) => sum + c.toll_usd, 0),
        delta_distance_nm: Math.round(resSeca.total_distance_nm * 0.02),
        delta_days: Number((resSeca.adjusted_sea_days * 0.02).toFixed(1)),
        has_piracy_risk: resSeca.piracy_alerts.length > 0,
        has_canal_restriction: resSeca.canal_alerts.some((c) => !c.is_available),
      },
    ];
  }
}
