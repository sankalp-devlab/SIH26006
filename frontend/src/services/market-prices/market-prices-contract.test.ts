/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices Service Contract Verification Tests
 * Run with: npx tsx src/services/market-prices/market-prices-contract.test.ts
 */

import { MarketPricesService } from './market-prices.service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log('--- Starting Module 23: Market Prices Contract Verification Tests ---');

// Contract Test 1: Synchronous Initial Data Guarantee
console.log('Contract Test 1: Synchronous Initial Data Guarantee');
const initial = MarketPricesService.getInitialData();
assert(initial !== null && initial !== undefined, 'Initial payload must never be null');
assert(Array.isArray(initial.routes) && initial.routes.length === 12, `Expected 12 canonical routes, got ${initial.routes.length}`);
assert(Array.isArray(initial.spotPrices) && initial.spotPrices.length === 12, `Expected 12 spot prices, got ${initial.spotPrices.length}`);
assert(Array.isArray(initial.ffaContracts) && initial.ffaContracts.length === 120, `Expected 120 FFA contracts (12 routes x 10 tenors), got ${initial.ffaContracts.length}`);
assert(initial.freshnessStatus === 'CANONICAL_BENCHMARK_ENGINE', 'Initial freshness must be CANONICAL_BENCHMARK_ENGINE');
console.log('  ✓ Synchronous initial data contract verified.');

// Contract Test 2: Spot Price Structure Integrity
console.log('Contract Test 2: Spot Price Structural Integrity');
initial.spotPrices.forEach((s) => {
  assert(s.routeCode.length >= 2, `Route code must be defined: ${s.routeCode}`);
  assert(s.rateTceUsdPerDay > 0, `Spot TCE rate must be positive: ${s.routeCode} has ${s.rateTceUsdPerDay}`);
  assert(s.high52wUsd >= s.low52wUsd, `52w high must be >= low: ${s.routeCode}`);
  assert(Array.isArray(s.sparkline7d) && s.sparkline7d.length === 7, `Sparkline must have 7 daily points: ${s.routeCode}`);
});
console.log('  ✓ Spot price structural integrity verified.');

// Contract Test 3: FFA Contract Structure Integrity
console.log('Contract Test 3: FFA Contract Structural Integrity');
initial.ffaContracts.forEach((c) => {
  assert(c.id.startsWith('ffa-'), `Contract ID must have prefix: ${c.id}`);
  assert(c.bidPriceUsdPerDay <= c.askPriceUsdPerDay, `Bid must be <= Ask: ${c.id}`);
  assert(c.midPriceUsdPerDay > 0, `Mid price must be positive: ${c.id}`);
  assert(c.volumeLots >= 0, `Volume lots must be non-negative: ${c.id}`);
  assert(c.openInterestLots >= 0, `Open interest must be non-negative: ${c.id}`);
});
console.log('  ✓ FFA contract structural integrity verified.');

// Contract Test 4: Metadata Extractors
console.log('Contract Test 4: Metadata Extractors');
const routeCodes = MarketPricesService.getAvailableRouteCodes(initial);
assert(routeCodes.length === 12, `Expected 12 unique route codes, got ${routeCodes.length}`);
assert(routeCodes.includes('TD3C') && routeCodes.includes('C5') && routeCodes.includes('TC2'), 'Must include key benchmark routes');

const vesselClasses = MarketPricesService.getAvailableVesselClasses(initial);
assert(vesselClasses.length >= 6, `Expected at least 6 vessel classes, got ${vesselClasses.length}`);
assert(vesselClasses.includes('VLCC') && vesselClasses.includes('Capesize') && vesselClasses.includes('MR'), 'Must include VLCC, Capesize, MR');

const segments = MarketPricesService.getAvailableSegments(initial);
assert(segments.includes('Crude Tanker') && segments.includes('Dry Bulk') && segments.includes('Clean Product'), 'Must include primary segments');
console.log('  ✓ Metadata extractors verified.');

console.log('--- ALL MODULE 23 MARKET PRICES CONTRACT TESTS PASSED ---');
