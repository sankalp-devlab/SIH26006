/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 12: Distance Calculator & Maritime Routing Engine Verification Suite
 */

import { DistanceEngine } from './distance-engine';
import { VoyageEngine } from '../voyage-calculator/voyage-engine';
import type { DistanceCalculationRecord } from '../../types/distance-calculator';
import type { Vessel } from '../../types/vessel';

declare const process: { exit: (code: number) => void };

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('----------------------------------------------------');
console.log('RUNNING MODULE 12 DISTANCE CALCULATOR TEST SUITE');
console.log('----------------------------------------------------');

// Test Vessel fixture
const mockVessel: Vessel = {
  id: 1,
  name: 'Starlight Carrier',
  imo_number: '9845012',
  vessel_type: 'Bulk Carrier',
  flag: 'Liberia',
  capacity_tons: 75000,
  length_m: 225,
  width_m: 32.2,
  draft_m: 14.2,
  year_built: 2021,
  status: 'active',
  speed_laden_knots: 13.5,
  speed_ballast_knots: 14.2,
  fuel_laden_mt_day: 28.5,
  fuel_ballast_mt_day: 24.0,
  cargo_types: 'Grain, Coal, Iron Ore',
  created_at: null,
};

// 1. Port -> Port distance calculation
const rasTanura = { name: 'Ras Tanura', lat: 26.65, lng: 50.16 };
const rotterdam = { name: 'Rotterdam', lat: 51.96, lng: 4.02 };
const p2pBaseRecord: DistanceCalculationRecord = {
  id: 'test-1',
  title: 'Ras Tanura to Rotterdam',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  mode: 'port_to_port',
  origin_port_id: 105,
  destination_port_id: 106,
  speed_knots: 14.0,
  weather_margin_pct: 5,
  departure_time: '2026-09-15T08:00:00Z',
  route_preference: 'shortest',
  avoid_piracy: false,
  allow_suez: true,
  allow_panama: false,
  allow_kiel: false,
  enforce_seca_routing: true,
  custom_waypoints: [],
  is_distance_manual: false,
};

const resultP2P = DistanceEngine.calculateRoute(p2pBaseRecord, rasTanura, rotterdam, mockVessel);
assert(resultP2P.total_distance_nm > 5500 && resultP2P.total_distance_nm < 7500, '1. Port -> Port distance calculation within expected Suez range');

// 2. Point -> Port coordinate routing
const offshorePoint = { name: 'Off Gibraltar OPL', lat: 36.1, lng: -5.3 };
const pointRecord: DistanceCalculationRecord = {
  ...p2pBaseRecord,
  mode: 'point_to_port',
};
const resultPoint = DistanceEngine.calculateRoute(pointRecord, offshorePoint, rotterdam, mockVessel);
assert(resultPoint.total_distance_nm > 1200 && resultPoint.total_distance_nm < 1700, '2. Point -> Port coordinate routing computes accurately');

// 3. Vessel -> Port position routing
const vesselPos = { name: 'Starlight Carrier Position (Arabian Sea)', lat: 14.85, lng: 70.12 };
const resultVessel = DistanceEngine.calculateRoute(p2pBaseRecord, vesselPos, rotterdam, mockVessel);
assert(resultVessel.total_distance_nm > 4500 && resultVessel.total_distance_nm < 6500, '3. Vessel -> Port routing computes accurately from AIS coordinates');

// 4. Great Circle baseline vs maritime corridor circuity factor
const directHaversine = DistanceEngine.calculateHaversineDistance(rasTanura.lat, rasTanura.lng, rotterdam.lat, rotterdam.lng);
const circuityDist = DistanceEngine.calculateDistance(rasTanura.lat, rasTanura.lng, rotterdam.lat, rotterdam.lng, 1.18);
assert(Math.round(directHaversine * 1.18) === circuityDist, '4. Great Circle baseline correctly scaled by 1.18x circuity factor');

// 5. Sea duration with weather margin
const timing = DistanceEngine.calculateDuration(3360, 14.0, 5);
// Base: 3360 / 14 = 240 hrs = 10.0 days. +5% margin = 252 hrs = 10.5 days.
assert(timing.baseDays === 10.0 && timing.adjustedDays === 10.5 && timing.adjustedHours === 252.0, '5. Sea duration with weather margin calculated accurately');

// 6. Departure time + duration = accurate arrival ETA
const depTime = '2026-09-15T08:00:00.000Z';
const eta = DistanceEngine.calculateETA(depTime, 252);
const expectedEta = new Date(new Date(depTime).getTime() + 252 * 3600 * 1000).toISOString();
assert(eta === expectedEta, '6. Departure time + duration yields exact arrival ETA timestamp');

// 7. Ordered routing points generation with cumulative distance
assert(resultP2P.points.length >= 4, '7. Routing points sequence generated with at least 4 waypoints');
const lastPoint = resultP2P.points[resultP2P.points.length - 1];
assert(lastPoint.cumulative_distance_nm === resultP2P.total_distance_nm, '7b. Last waypoint cumulative distance matches total route distance');

// 8. Multi-leg distance aggregation
const sumLegDistances = resultP2P.legs.reduce((sum, leg) => sum + leg.distance_nm, 0);
assert(sumLegDistances === resultP2P.total_distance_nm, '8. Multi-leg distance sums precisely to total route distance');

// 9. Speed variation impact on sea time
const slowTiming = DistanceEngine.calculateDuration(2800, 10.0, 0);
const fastTiming = DistanceEngine.calculateDuration(2800, 14.0, 0);
assert(slowTiming.adjustedDays > fastTiming.adjustedDays, '9. Slower speed results in longer voyage duration');

// 10. Weather margin percentage calculation
const zeroMargin = DistanceEngine.calculateDuration(1000, 10, 0);
const tenMargin = DistanceEngine.calculateDuration(1000, 10, 10);
assert(Math.abs(tenMargin.adjustedHours - zeroMargin.adjustedHours * 1.1) < 0.1, '10. Weather margin percentage scales duration correctly');

// 11. SECA zone segment detection
const rotterdamLat = 51.96;
const rotterdamLng = 4.02;
assert(DistanceEngine.isPointInSeca(rotterdamLat, rotterdamLng), '11. Rotterdam correctly detected inside North Sea SECA zone');

// 12. Non-SECA segment identification
assert(!DistanceEngine.isPointInSeca(26.65, 50.16), '12. Arabian Sea/Ras Tanura correctly identified as Non-SECA');
assert(resultP2P.non_seca_distance_nm > 0 && resultP2P.seca_distance_nm > 0, '12b. Route cleanly separates SECA and Non-SECA mileage');

// 13. Piracy zone warning detection
const babAlert = DistanceEngine.checkPiracyRisk(12.58, 43.33);
assert(babAlert !== null && babAlert.zone_id === 'piracy-red-sea' && babAlert.severity === 'CRITICAL', '13. Bab-el-Mandeb triggers CRITICAL piracy warning');

// 14. Piracy avoidance route (Cape of Good Hope detour)
const piracyAvoidRecord: DistanceCalculationRecord = {
  ...p2pBaseRecord,
  route_preference: 'avoid_piracy',
  avoid_piracy: true,
  allow_suez: false,
};
const resultCape = DistanceEngine.calculateRoute(piracyAvoidRecord, rasTanura, rotterdam, mockVessel);
assert(resultCape.total_distance_nm > resultP2P.total_distance_nm + 3500, '14. Piracy avoidance detours via Cape of Good Hope adding > 3,500 NM');
assert(!resultCape.points.some((p) => p.name.includes('Suez')), '14b. Cape route completely avoids Suez Canal');

// 15. Canal draft restriction checking
const deepDraftVessel: Vessel = { ...mockVessel, draft_m: 21.5 };
const suezCheck = DistanceEngine.checkCanalRestrictions('Suez', deepDraftVessel.draft_m ?? undefined);
assert(!suezCheck.is_available && suezCheck.reason!.includes('exceeds'), '15. Suez correctly restricted for 21.5m draft exceeding 20.1m limit');

const panamaCheck = DistanceEngine.checkCanalRestrictions('Panama', 16.0);
assert(!panamaCheck.is_available, '15b. Panama correctly restricted for 16.0m draft exceeding Neo-Panamax 15.24m limit');

// 16. Manual route override honoring custom distance
const manualRecord: DistanceCalculationRecord = {
  ...p2pBaseRecord,
  is_distance_manual: true,
  manual_distance_override_nm: 7500,
};
const resultManual = DistanceEngine.calculateRoute(manualRecord, rasTanura, rotterdam, mockVessel);
assert(resultManual.total_distance_nm === 7500 && resultManual.is_manually_modified, '16. Manual route override preserves exact custom distance');

// 17. Fuel consumption estimation per leg
assert(resultP2P.fuel_implications.total_fuel_mt > 0, '17. Total fuel consumption computed');
assert(resultP2P.fuel_implications.lsmgo_sea_mt > 0 && resultP2P.fuel_implications.vlsfo_sea_mt > 0, '17b. Distinguishes LSMGO for SECA and VLSFO for Non-SECA');

// 18. IMO CO2 emissions estimation per fuel type
const expectedCo2 = Number((resultP2P.fuel_implications.vlsfo_sea_mt * 3.114 + resultP2P.fuel_implications.lsmgo_sea_mt * 3.206).toFixed(1));
assert(Math.abs(resultP2P.emission_implications.co2_total_mt - expectedCo2) < 0.5, '18. IMO CO2 emissions calculated using official IMO fuel factors');

// 19. Point in polygon boundaries check
assert(DistanceEngine.isPointInPolygon([52.0, 3.0], [[50, 1], [50, 5], [55, 5], [55, 1], [50, 1]]), '19. Point in polygon test functions correctly');

// 20. Zero/negative speed validation
const zeroSpeedTiming = DistanceEngine.calculateDuration(1000, 0, 5);
assert(zeroSpeedTiming.baseDays === 0 && zeroSpeedTiming.adjustedHours === 0, '20. Zero speed handled safely returning 0 duration');

// 21. Identical origin and destination handling (0 NM)
const zeroDist = DistanceEngine.calculateDistance(51.96, 4.02, 51.96, 4.02);
assert(zeroDist === 0, '21. Identical coordinates return exactly 0 NM');

// 22. Delegation verification: VoyageEngine delegates to DistanceEngine
const voyageEngineDist = VoyageEngine.estimateNauticalDistance(26.65, 50.16, 51.96, 4.02, 1.18);
const distanceEngineDist = DistanceEngine.calculateDistance(26.65, 50.16, 51.96, 4.02, 1.18);
assert(voyageEngineDist === distanceEngineDist, '22. VoyageEngine delegates to DistanceEngine with 100% mathematical parity');

console.log('----------------------------------------------------');
console.log('ALL 22/22 DISTANCE ENGINE TESTS PASSED SUCCESSFULLY');
console.log('----------------------------------------------------');
