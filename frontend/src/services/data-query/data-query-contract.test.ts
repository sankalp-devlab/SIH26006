/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 24: DATA QUERY WORKBENCH — Contract & Historical Depth Verification Tests
 */

import { DataQueryService } from './data-query.service';
import { MARITIME_ENTITY_SCHEMAS, CANONICAL_MARITIME_DATASET, QUERY_PRESETS } from './data-query.data';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
}

console.log('--- Starting Module 24: Data Query Contract Tests ---');

// Contract Test 1: Historical Depth to 2014
console.log('Contract Test 1: Historical Coverage to 2014');
const earliestDate = CANONICAL_MARITIME_DATASET[0].date;
assert(earliestDate.startsWith('2014-01'), `Dataset begins in 2014-01, got ${earliestDate}`);
const latestDate = CANONICAL_MARITIME_DATASET[CANONICAL_MARITIME_DATASET.length - 1].date;
assert(latestDate.startsWith('2026-09'), `Dataset extends to 2026-09, got ${latestDate}`);
console.log(`  ✓ Historical depth verified: ${earliestDate} to ${latestDate} (12+ Years).`);

// Contract Test 2: Synchronous Initial Data Guarantee
console.log('Contract Test 2: Synchronous Initial Data Guarantee');
const initial = DataQueryService.getInitialExecution();
assert(initial !== undefined && initial !== null, 'Initial response defined');
assert(initial.timeSeriesResult !== undefined, 'Initial time series present');
assert(Boolean(initial.timeSeriesResult && initial.timeSeriesResult.points.length > 0), 'Points populated');
console.log('  ✓ Synchronous initial execution verified.');

// Contract Test 3: Entity Schemas Integrity
console.log('Contract Test 3: Entity Schemas Integrity');
const entities = ['freight_rates', 'trade_flows', 'fleet_movements', 'port_congestion', 'fleet_emissions'];
entities.forEach((ent) => {
  const schema = MARITIME_ENTITY_SCHEMAS[ent];
  assert(schema !== undefined, `Schema defined for ${ent}`);
  assert(schema.fields.length >= 5, `Schema has at least 5 fields for ${ent}`);
  assert(schema.historicalStart === '2014-01-01', `Historical start is 2014 for ${ent}`);
});
console.log('  ✓ All 5 maritime entity schemas verified.');

// Contract Test 4: URL Serialization & Deserialization
console.log('Contract Test 4: URL State Bidirectional Serialization');
const defConfig = DataQueryService.getDefaultConfig();
const url = DataQueryService.serializeQueryToUrl(defConfig);
assert(url.includes('mode=time_series'), 'Serialized mode');
assert(url.includes('entity=freight_rates'), 'Serialized entity');

const parsedUrl = new URL(url);
const deserialized = DataQueryService.deserializeQueryFromUrl(parsedUrl.searchParams);
assert(deserialized.mode === 'time_series', 'Deserialized mode');
assert(deserialized.entity === 'freight_rates', 'Deserialized entity');
console.log('  ✓ URL serialization/deserialization verified.');

// Contract Test 5: Query Presets Validity
console.log('Contract Test 5: Query Templates & Presets');
assert(QUERY_PRESETS.length >= 6, `At least 6 query presets, got ${QUERY_PRESETS.length}`);
QUERY_PRESETS.forEach((preset) => {
  assert(preset.id.length > 0, 'Preset ID present');
  assert(preset.config.mode !== undefined, `Preset ${preset.id} has mode`);
});
console.log('  ✓ Query presets verified.');

console.log('--- ALL MODULE 24 DATA QUERY CONTRACT TESTS PASSED ---');
