/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 13 Failure Cases & Edge Condition Test Suite
 */

import { PortInsightsService } from './port-insights.service';
import { PortAnalyticsEngine } from './port-analytics-engine';
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
console.log('RUNNING MODULE 13 FAILURE CASES & EDGE TEST SUITE');
console.log('----------------------------------------------------');

// ================================================================
// CASE 1: Service Contract Rejects Undefined / Invalid Port Inputs
// ================================================================
try {
  PortInsightsService.getPortInsight(undefined as unknown as Port);
  assert(false, 'Should have thrown error on undefined port input');
} catch (err) {
  assert(
    err instanceof TypeError && err.message.includes('Port object with a non-empty name'),
    'CASE 1: Service rejects undefined port with descriptive TypeError'
  );
}

try {
  PortInsightsService.getPortInsight(null as unknown as Port);
  assert(false, 'Should have thrown error on null port input');
} catch (err) {
  assert(
    err instanceof TypeError && err.message.includes('Port object with a non-empty name'),
    'CASE 1b: Service rejects null port with descriptive TypeError'
  );
}

try {
  PortInsightsService.getPortInsight({ id: 1 } as unknown as Port);
  assert(false, 'Should have thrown error on port without name');
} catch (err) {
  assert(
    err instanceof TypeError && err.message.includes('Port object with a non-empty name'),
    'CASE 1c: Service rejects object missing name property'
  );
}

// ================================================================
// CASE 2: Port with Missing Optional Fields (Nulls everywhere)
// ================================================================
const sparsePort: Port = {
  id: 9999,
  name: 'Minimal Test Port',
  unlocode: null,
  country: null,
  city: null,
  latitude: null,
  longitude: null,
  port_type: null,
  facilities: null,
  created_at: null,
};

const sparsePayload = PortInsightsService.getPortInsight(sparsePort);
assert(sparsePayload !== null, 'CASE 2a: Generates valid payload for sparse port with null fields');
assert(sparsePayload.port.name === 'Minimal Test Port', 'CASE 2b: Retains port name');
assert(sparsePayload.terminals.length >= 2, 'CASE 2c: Falls back to generic terminals gracefully');
assert(sparsePayload.weather.temperature_c > 0, 'CASE 2d: Generates baseline weather without coordinates');
assert(sparsePayload.costs.length > 0, 'CASE 2e: Generates baseline tariffs for unindexed port');
assert(sparsePayload.bunkers.length > 0, 'CASE 2f: Generates default bunker rates');

// ================================================================
// CASE 3: Port with Empty Name or Whitespace Only
// ================================================================
try {
  const blankPort: Port = { ...sparsePort, name: '   ' };
  PortInsightsService.getPortInsight(blankPort);
  assert(false, 'Should have rejected whitespace-only port name');
} catch (err) {
  assert(
    err instanceof TypeError,
    'CASE 3: Service rejects whitespace-only port name'
  );
}

// ================================================================
// CASE 4: Port Comparison with Unequal or Identical Ports
// ================================================================
const portA: Port = {
  id: 1,
  name: 'Rotterdam',
  unlocode: 'NLRTM',
  country: 'Netherlands',
  city: 'Rotterdam',
  latitude: 51.96,
  longitude: 4.02,
  port_type: 'seaport',
  facilities: ['Container'],
  created_at: null,
};

const portB: Port = {
  id: 2,
  name: 'Singapore',
  unlocode: 'SGSIN',
  country: 'Singapore',
  city: 'Singapore',
  latitude: 1.29,
  longitude: 103.85,
  port_type: 'seaport',
  facilities: ['Container', 'Bunkering'],
  created_at: null,
};

const payloadA = PortInsightsService.getPortInsight(portA);
const payloadB = PortInsightsService.getPortInsight(portB);
const comp = PortAnalyticsEngine.comparePorts(payloadA, payloadB);

assert(comp !== null, 'CASE 4a: Generates valid comparison result');
assert(typeof comp.delta.congestionScore === 'number', 'CASE 4b: Computes numerical congestion delta');
assert(typeof comp.winner === 'string', 'CASE 4c: Resolves operational winner without crashing');

// Comparison with self
const selfComp = PortAnalyticsEngine.comparePorts(payloadA, payloadA);
assert(selfComp.delta.congestionScore === 0, 'CASE 4d: Identical ports result in zero delta');
assert(selfComp.winner === 'TIED', 'CASE 4e: Identical ports result in TIED verdict');

// ================================================================
// CASE 5: Port Analytics Engine with Empty Lists
// ================================================================
assert(PortAnalyticsEngine.calculateAverageWaitingTime([]) === 0, 'CASE 5a: Average wait of empty list is 0');
assert(PortAnalyticsEngine.calculateMedianWaitingTime([]) === 0, 'CASE 5b: Median wait of empty list is 0');
assert(PortAnalyticsEngine.calculateMaxWaitingTime([]) === 0, 'CASE 5c: Max wait of empty list is 0');
const zeroCongestion = PortAnalyticsEngine.calculateCongestionIndex(0, 0, 0);
assert(zeroCongestion.score === 5 && zeroCongestion.level === 'LOW', 'CASE 5d: Zero vessels/berths returns LOW score');

// ================================================================
// CASE 6: Historical Visits Date-Range Filtering with Boundary Dates
// ================================================================
const visits = PortAnalyticsEngine.filterHistoricalVisits(payloadA.historicalVisits, '7d');
assert(Array.isArray(visits), 'CASE 6a: Returns array of filtered historical visits');
const visits30d = PortAnalyticsEngine.filterHistoricalVisits(payloadA.historicalVisits, '30d');
assert(visits30d.length >= visits.length, 'CASE 6b: 30d filter includes at least as many visits as 7d');

console.log('----------------------------------------------------');
console.log('ALL 16/16 FAILURE CASES TESTED AND PASSED CLEANLY');
console.log('----------------------------------------------------');
