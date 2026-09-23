/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 13: Port Insights & Analytics Verification Test Suite
 */

import { PortAnalyticsEngine } from './port-analytics-engine';
import { PortInsightsService } from './port-insights.service';
import type { PortVesselActivity, PortHistoricalVisit } from '../../types/port-insights';
import type { Port } from '../../types/port';

declare const process: { exit: (code: number) => void };

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('----------------------------------------------------');
console.log('RUNNING MODULE 13 PORT INSIGHTS TEST SUITE');
console.log('----------------------------------------------------');

const mockVessels: PortVesselActivity[] = [
  {
    id: 'v1',
    vessel_id: 1,
    vessel_name: 'Vessel One',
    vessel_type: 'Bulker',
    dwt: 75000,
    flag: 'Liberia',
    status: 'waiting',
    terminal_name: 'Terminal A',
    berth: 'B1',
    cargo_type: 'Coal',
    cargo_quantity_mt: 60000,
    waiting_hours: 18.0,
    operation_type: 'discharging',
    origin_port: 'Port A',
    destination_port: 'Port B',
  },
  {
    id: 'v2',
    vessel_id: 2,
    vessel_name: 'Vessel Two',
    vessel_type: 'Tanker',
    dwt: 110000,
    flag: 'Panama',
    status: 'waiting',
    terminal_name: 'Terminal B',
    berth: 'B2',
    cargo_type: 'Crude',
    cargo_quantity_mt: 95000,
    waiting_hours: 32.0,
    operation_type: 'discharging',
    origin_port: 'Port C',
    destination_port: 'Port B',
  },
  {
    id: 'v3',
    vessel_id: 3,
    vessel_name: 'Vessel Three',
    vessel_type: 'Container',
    dwt: 55000,
    flag: 'Singapore',
    status: 'waiting',
    terminal_name: 'Terminal A',
    berth: 'B3',
    cargo_type: 'Boxes',
    cargo_quantity_mt: 40000,
    waiting_hours: 10.0,
    operation_type: 'discharging',
    origin_port: 'Port D',
    destination_port: 'Port B',
  },
  {
    id: 'v4',
    vessel_id: 4,
    vessel_name: 'Vessel Four',
    vessel_type: 'Bulker',
    dwt: 70000,
    flag: 'Malta',
    status: 'operating',
    terminal_name: 'Terminal A',
    berth: 'Berth 1',
    cargo_type: 'Grain',
    cargo_quantity_mt: 50000,
    waiting_hours: 0,
    operation_type: 'loading',
    origin_port: 'Port B',
    destination_port: 'Port E',
  },
];

// 1. Average Waiting Time
const avgWait = PortAnalyticsEngine.calculateAverageWaitingTime(mockVessels);
// (18 + 32 + 10) / 3 = 20.0
assert(avgWait === 20.0, '1. Average waiting time calculated accurately');
assert(PortAnalyticsEngine.calculateAverageWaitingTime([]) === 0, '1b. Empty vessel list returns 0 average wait');

// 2. Median Waiting Time (Odd count)
const medianWaitOdd = PortAnalyticsEngine.calculateMedianWaitingTime(mockVessels);
// sorted: [10, 18, 32] -> median is 18.0
assert(medianWaitOdd === 18.0, '2. Median waiting time with odd dataset');

// 2b. Median Waiting Time (Even count)
const evenVessels = [...mockVessels, { ...mockVessels[0], id: 'v5', waiting_hours: 24.0 }];
// sorted: [10, 18, 24, 32] -> median is (18 + 24) / 2 = 21.0
const medianWaitEven = PortAnalyticsEngine.calculateMedianWaitingTime(evenVessels);
assert(medianWaitEven === 21.0, '2b. Median waiting time with even dataset');

// 3. Maximum Waiting Time
const maxWait = PortAnalyticsEngine.calculateMaxWaitingTime(mockVessels);
assert(maxWait === 32.0, '3. Maximum waiting time identified correctly');

// 4. Congestion Index & Severity Levels
const lowCongestion = PortAnalyticsEngine.calculateCongestionIndex(1, 2, 10);
assert(lowCongestion.level === 'LOW', '4a. Congestion index categorized as LOW');

const modCongestion = PortAnalyticsEngine.calculateCongestionIndex(3, 4, 8);
assert(modCongestion.level === 'MODERATE' || modCongestion.level === 'HIGH', '4b. Congestion index categorized as MODERATE or HIGH');

const critCongestion = PortAnalyticsEngine.calculateCongestionIndex(15, 10, 8);
assert(critCongestion.level === 'CRITICAL', '4c. High queue-to-berth ratio triggers CRITICAL congestion');

// 5. Trend Percentage Deltas
const trendUp = PortAnalyticsEngine.calculateTrendPercentage(112, 100);
assert(trendUp.isUp === true && trendUp.pct === 12.0 && trendUp.formatted === '+12%', '5a. Positive trend delta calculated');

const trendDown = PortAnalyticsEngine.calculateTrendPercentage(95, 100);
assert(trendDown.isUp === false && trendDown.pct === 5.0 && trendDown.formatted === '-5%', '5b. Negative trend delta calculated');

const trendZero = PortAnalyticsEngine.calculateTrendPercentage(20, 0);
assert(trendZero.isUp === true && trendZero.pct === 100, '5c. Zero previous value handled without division by zero');

// 6. Terminal Utilization
const util = PortAnalyticsEngine.calculateTerminalUtilization(10, 12);
assert(util === 83, '6. Terminal berth occupancy percentage calculated');
assert(PortAnalyticsEngine.calculateTerminalUtilization(5, 0) === 0, '6b. Zero total berths handled safely');

// 7. Weather Operational Impact
const calmWeather = PortAnalyticsEngine.getOperationalWeatherImpact(12, 0.8, 10.0);
assert(calmWeather.impact_level === 'NONE', '7a. Calm weather has NONE impact');

const galeWeather = PortAnalyticsEngine.getOperationalWeatherImpact(38, 4.0, 0.8);
assert(galeWeather.impact_level === 'HIGH' && galeWeather.message.includes('suspended'), '7b. Storm weather triggers HIGH impact and pilotage advisory');

// 8. Historical Visits Date Filtering
const now = new Date('2026-09-11T21:00:00Z').getTime();
const visits: PortHistoricalVisit[] = [
  {
    id: 'h1',
    vessel_id: 1,
    vessel_name: 'Ship A',
    vessel_type: 'Bulker',
    arrival_date: new Date(now - 2 * 24 * 3600 * 1000).toISOString(), // 2 days ago
    departure_date: new Date().toISOString(),
    terminal_name: 'Main',
    cargo_handled: 'Grain',
    quantity_mt: 50000,
    turnaround_days: 2,
    waiting_hours: 12,
    status: 'completed',
  },
  {
    id: 'h2',
    vessel_id: 2,
    vessel_name: 'Ship B',
    vessel_type: 'Tanker',
    arrival_date: new Date(now - 20 * 24 * 3600 * 1000).toISOString(), // 20 days ago
    departure_date: new Date().toISOString(),
    terminal_name: 'Main',
    cargo_handled: 'Oil',
    quantity_mt: 80000,
    turnaround_days: 3,
    waiting_hours: 15,
    status: 'completed',
  },
  {
    id: 'h3',
    vessel_id: 3,
    vessel_name: 'Ship C',
    vessel_type: 'Bulker',
    arrival_date: new Date(now - 75 * 24 * 3600 * 1000).toISOString(), // 75 days ago
    departure_date: new Date().toISOString(),
    terminal_name: 'Main',
    cargo_handled: 'Ore',
    quantity_mt: 120000,
    turnaround_days: 4,
    waiting_hours: 24,
    status: 'completed',
  },
];

const visits7d = PortAnalyticsEngine.filterHistoricalVisits(visits, '7d');
assert(visits7d.length === 1 && visits7d[0].id === 'h1', '8a. 7-day filter captures recent visits only');

const visits30d = PortAnalyticsEngine.filterHistoricalVisits(visits, '30d');
assert(visits30d.length === 2, '8b. 30-day filter captures records within 30 days');

const visits90d = PortAnalyticsEngine.filterHistoricalVisits(visits, '90d');
assert(visits90d.length === 3, '8c. 90-day filter includes all quarterly calls');

// 9. Port Insights Service Payload Generation
const rotterdamPort: Port = {
  id: 106,
  name: 'Rotterdam',
  country: 'Netherlands',
  unlocode: 'NLRTM',
  city: 'Rotterdam',
  latitude: 51.96,
  longitude: 4.02,
  port_type: 'Seaport',
  facilities: ['Container', 'Crude Oil', 'Dry Bulk', 'LNG'],
  created_at: null,
};

const payload = PortInsightsService.getPortInsight(rotterdamPort);
assert(payload.port.name === 'Rotterdam', '9a. Port payload initialized for Rotterdam');
assert(payload.terminals.length >= 3, '9b. Generates specialized deepwater terminals');
assert(payload.activities.length >= 10, '9c. Generates arriving, waiting, and operating vessel activities');
assert(payload.lineups.length > 0, '9d. Prioritized lineup queue generated');
assert(payload.costs.length >= 4, '9e. Port dues, pilotage, and towage tariffs populated');
assert(payload.bunkers.length >= 4, '9f. Multi-fuel bunker pricing benchmarks populated');
assert(payload.congestion.historical_trend.length === 7, '9g. 7-day historical congestion trend generated');

// 10. Port Comparison
const singaporePort: Port = {
  id: 101,
  name: 'Singapore',
  country: 'Singapore',
  unlocode: 'SGSIN',
  city: 'Singapore',
  latitude: 1.26,
  longitude: 103.8,
  port_type: 'Seaport',
  facilities: ['Container', 'Transshipment', 'Bunkering'],
  created_at: null,
};

const payloadB = PortInsightsService.getPortInsight(singaporePort);
const comparison = PortAnalyticsEngine.comparePorts(payload, payloadB);
assert(comparison.port_a.name === 'Rotterdam' && comparison.port_b.name === 'Singapore', '10a. Comparison evaluates Port A vs Port B');
assert(comparison.advantages.lower_bunker_cost.length > 0, '10b. Generates normalized comparative advantages');

console.log('----------------------------------------------------');
console.log('ALL 10/10 PORT INSIGHTS TESTS PASSED SUCCESSFULLY');
console.log('----------------------------------------------------');
