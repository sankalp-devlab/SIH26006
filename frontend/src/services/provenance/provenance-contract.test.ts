/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 32: Data Sources / Data Provenance & Freshness Architecture
 * Verification & Contract Test Suite
 */

import type { DataSourceOrigin } from '../../types/provenance';
import { FreshnessEngine } from './freshness-engine';
import { ProvenanceService } from './provenance.service';
import { DataQueryService } from '../data-query/data-query.service';
import type { DataQueryConfig } from '../../types/data-query';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runModule32Tests() {
  console.log('--- MODULE 32: DATA SOURCES & PROVENANCE VERIFICATION SUITE ---');

  // =========================================================================
  // TEST 1: Source Taxonomy & Catalog Completeness
  // =========================================================================
  console.log('\n[Test 1] Origin Taxonomy & Catalog Completeness...');
  const catalog = ProvenanceService.ORIGIN_METADATA;
  const origins = Object.keys(catalog) as DataSourceOrigin[];
  assert(origins.length >= 14, `Expected at least 14 origin sources, got ${origins.length}`);

  for (const origin of origins) {
    const meta = catalog[origin];
    assert(!!meta, `Missing catalog entry for origin: ${origin}`);
    assert(typeof meta.label === 'string' && meta.label.length > 0, `Missing label for ${origin}`);
    assert(typeof meta.category === 'string', `Missing category for ${origin}`);
    assert(typeof meta.description === 'string' && meta.description.length > 0, `Missing description for ${origin}`);
  }
  console.log(`✓ All ${origins.length} data source origins verified in catalog with complete metadata.`);

  // Verify planned enterprise communication channels
  const plannedOrigins: DataSourceOrigin[] = [
    'whatsapp_connector',
    'slack_connector',
    'ms_teams_connector',
  ];
  for (const origin of plannedOrigins) {
    const meta = catalog[origin];
    assert(meta.category === 'Messaging', `Expected Messaging category for ${origin}`);
    assert(meta.label.includes('(Planned)'), `Expected (Planned) marker for ${origin}`);
  }
  console.log('✓ Enterprise messaging channels (WhatsApp, Slack, Teams) cataloged with (Planned) indicator.');

  // =========================================================================
  // TEST 2: Dynamic Freshness Engine Thresholds & Calculations
  // =========================================================================
  console.log('\n[Test 2] Dynamic Freshness Engine & Domain Windows...');
  const now = new Date();

  // Test AIS domain threshold (live window = 15m, recent = 2h, stale > 2h)
  const ais5MinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  const ais45MinAgo = new Date(now.getTime() - 45 * 60 * 1000).toISOString();
  const ais3HoursAgo = new Date(now.getTime() - 180 * 60 * 1000).toISOString();

  const freshAis = FreshnessEngine.calculateFreshness(ais5MinAgo, 'ais_terrestrial', 'live', now);
  assert(freshAis.level === 'LIVE', `Expected 5-min AIS to be LIVE, got ${freshAis.level}`);

  const recentAis = FreshnessEngine.calculateFreshness(ais45MinAgo, 'ais_terrestrial', 'live', now);
  assert(recentAis.level === 'RECENT', `Expected 45-min AIS to be RECENT, got ${recentAis.level}`);

  const staleAis = FreshnessEngine.calculateFreshness(ais3HoursAgo, 'ais_terrestrial', 'live', now);
  assert(staleAis.level === 'STALE', `Expected 3-hour AIS to be STALE, got ${staleAis.level}`);

  // Test Baltic Exchange market prices domain threshold (live = 6h, recent = 24h, stale > 24h)
  const baltic2HoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const baltic12HoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();
  const baltic48HoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

  assert(FreshnessEngine.calculateFreshness(baltic2HoursAgo, 'baltic_exchange', 'live', now).level === 'LIVE', '2-hour market index should be LIVE');
  assert(FreshnessEngine.calculateFreshness(baltic12HoursAgo, 'baltic_exchange', 'live', now).level === 'RECENT', '12-hour market index should be RECENT');
  assert(FreshnessEngine.calculateFreshness(baltic48HoursAgo, 'baltic_exchange', 'live', now).level === 'STALE', '48-hour market index should be STALE');

  // Test Historical temporal state override
  const historicalAis = FreshnessEngine.calculateFreshness(ais5MinAgo, 'ais_terrestrial', 'historical', now);
  assert(historicalAis.level === 'HISTORICAL', `Expected HISTORICAL level, got ${historicalAis.level}`);

  // Test Predicted temporal state override
  const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const predictedVoyage = FreshnessEngine.calculateFreshness(futureDate, 'fixture_reports', 'predicted', now);
  assert(predictedVoyage.level === 'PREDICTED', `Expected PREDICTED level, got ${predictedVoyage.level}`);

  console.log('✓ Freshness engine correctly respects domain windows and temporal states.');

  // =========================================================================
  // TEST 3: Age Humanization Logic
  // =========================================================================
  console.log('\n[Test 3] Relative Age Humanization...');
  assert(FreshnessEngine.humanizeAge(25) === 'Just now', 'Humanize <60s failed');
  assert(FreshnessEngine.humanizeAge(180) === '3m ago', 'Humanize minutes failed');
  assert(FreshnessEngine.humanizeAge(7200) === '2h ago', 'Humanize hours failed');
  assert(FreshnessEngine.humanizeAge(172800) === '2d ago', 'Humanize days failed');
  console.log('✓ Age humanization produces concise, clear maritime UI relative age strings.');

  // =========================================================================
  // TEST 4: Telemetry Provenance Factory
  // =========================================================================
  console.log('\n[Test 4] Telemetry Provenance Creation...');
  const aisProv = ProvenanceService.createTelemetryProvenance(ais5MinAgo, false);

  assert(aisProv.origin === 'ais_terrestrial', 'Origin mismatch in telemetry');
  assert(aisProv.state === 'live', 'Temporal state should be live');
  assert(aisProv.derivation === 'raw_sensor', 'Derivation should be raw_sensor');
  assert(aisProv.freshness === 'LIVE', 'Expected LIVE freshness for 5-minute AIS');
  assert(aisProv.confidenceScore === 0.98, 'Confidence score mismatch');
  console.log('✓ Telemetry provenance constructed with raw sensor derivation and live state.');

  // =========================================================================
  // TEST 5: Calculated Analytics & Lineage Inputs
  // =========================================================================
  console.log('\n[Test 5] Calculated Analytics & Lineage...');
  const calcProv = ProvenanceService.createCalculatedProvenance(
    'TCE (Time Charter Equivalent) Rate',
    'Standard TCE Formula',
    '(Gross Freight Revenue - Voyage Expenses [Bunker + Canal + Port]) / Sea Days',
    [
      { field: 'freight_revenue', label: 'Gross Freight Revenue', sourceOrigin: 'fixture_reports', contributingValue: '$1,850,000' },
      { field: 'bunker_cost', label: 'Total Bunker Fuel Cost', sourceOrigin: 'calculated_analytics', contributingValue: '$420,000' },
      { field: 'canal_toll', label: 'Suez Canal Transit Toll', sourceOrigin: 'port_lineup_authority', contributingValue: '$310,000' },
      { field: 'sea_days', label: 'Calculated Voyage Sea Days', sourceOrigin: 'calculated_analytics', contributingValue: '28.4' },
    ]
  );

  assert(calcProv.origin === 'calculated_analytics', 'Origin should be calculated_analytics');
  assert(calcProv.derivation === 'calculated_formula', 'Derivation should be calculated_formula');
  assert(!!calcProv.lineage, 'Lineage must be populated for calculated metrics');
  assert(calcProv.lineage?.inputs.length === 4, `Expected 4 contributing inputs, got ${calcProv.lineage?.inputs.length}`);
  assert(calcProv.lineage?.targetMetric === 'TCE (Time Charter Equivalent) Rate', 'Target metric mismatch');
  console.log('✓ Calculated metric provenance encapsulates formula, 4 distinct lineage inputs, and target metric.');

  // =========================================================================
  // TEST 6: Private Workspace Isolation & Zero Credentials Guarantee
  // =========================================================================
  console.log('\n[Test 6] Private Workspace Isolation & Credential Safety...');
  const privateProv = ProvenanceService.createPrivateWorkspaceProvenance(
    now.toISOString(),
    'Private internal tanker demand - strictly isolated to commercial chartering workspace.'
  );

  assert(privateProv.privacy === 'workspace_private', 'Privacy scope must be workspace_private');
  assert(privateProv.origin === 'user_workspace_private', 'Origin must be user_workspace_private');

  // Verify that secrets or sensitive headers are never leaked
  const provJson = JSON.stringify(privateProv);
  const sensitivePatterns = ['authorization', 'bearer', 'apikey', 'secret_key', 'password', 'private_key'];
  for (const pattern of sensitivePatterns) {
    assert(!provJson.toLowerCase().includes(pattern), `Potential credential leak detected in provenance JSON for '${pattern}'`);
  }
  console.log('✓ Private workspace isolation verified. Zero credential exposure verified.');

  // =========================================================================
  // TEST 7: Telemetry Conflict Detection
  // =========================================================================
  console.log('\n[Test 7] Conflict Detection & Handling...');
  const conflict = ProvenanceService.detectConflict(
    {
      origin: 'ais_satellite',
      value: '14.8 kts',
      observedAt: ais5MinAgo,
      label: 'Satellite AIS Telemetry',
    },
    {
      origin: 'user_manual_input',
      value: '12.0 kts',
      observedAt: ais45MinAgo,
      label: 'Manual Noon Report',
    },
    'primary_source_precedence'
  );

  assert(!!conflict, 'Conflict info must be returned');
  assert(conflict?.hasConflict === true, 'Conflict should be flagged');
  assert(conflict?.primaryValue === '14.8 kts', 'Primary value mismatch');
  assert(conflict?.resolutionStrategy === 'primary_source_precedence', 'Resolution strategy mismatch');
  assert(conflict?.conflictingSources.length === 2, 'Conflicting sources count mismatch');
  console.log('✓ Conflict identified between AIS telemetry and manual noon report with precedence resolution.');

  // =========================================================================
  // TEST 8: Data Query Service Integration (Module 24 Pipeline)
  // =========================================================================
  console.log('\n[Test 8] Data Query Service Provenance Integration...');
  const baseConfig = DataQueryService.getDefaultConfig();
  const emissionsConfig: DataQueryConfig = {
    ...baseConfig,
    entity: 'fleet_emissions',
  };

  const response = await DataQueryService.executeQuery(emissionsConfig);
  assert(!!response.queryProvenance, 'Query execution response must include queryProvenance');
  assert(response.queryProvenance?.origin === 'calculated_analytics', 'Dataset origin mismatch');
  assert(response.queryProvenance?.derivation === 'calculated_formula', 'Derivation type should be calculated_formula');
  assert(response.queryProvenance?.lineage?.inputs.length === 3, 'Lineage inputs length mismatch');
  assert(response.queryProvenance?.lineage?.formulaName === 'IMO GHG Fourth Study Formula: Fuel(MT) * 3.114', 'Formula name mismatch');

  // Test fleet_movements which maps to ais_satellite
  const aisQueryConfig: DataQueryConfig = {
    ...baseConfig,
    entity: 'fleet_movements',
  };
  const aisResponse = await DataQueryService.executeQuery(aisQueryConfig);
  assert(aisResponse.queryProvenance?.origin === 'ais_satellite', 'Expected ais_satellite origin for fleet movements');
  assert(aisResponse.queryProvenance?.state === 'historical', 'Expected historical state for canonical dataset');

  console.log('✓ Data Query Service successfully delivers queryProvenance with both calculated and AIS datasets.');

  console.log('\n===================================================================');
  console.log('🎉 ALL MODULE 32 PROVENANCE & FRESHNESS VERIFICATION TESTS PASSED!');
  console.log('===================================================================\n');
}

runModule32Tests().catch((err) => {
  console.error('❌ MODULE 32 TEST FAILED:', err);
  process.exit(1);
});
