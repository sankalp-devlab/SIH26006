/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 26: Skipper AI Assistant Comprehensive Validation Test Suite
 */

import { SkipperService } from './skipper.service';
import { SkipperIntentEngine } from './skipper-intent-engine';
import { SkipperDataRouter } from './skipper-data-router';
import type { SkipperSession } from '../../types/skipper';

declare const process: { exit: (code: number) => void };

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runValidation() {
  console.log('====================================================');
  console.log('STARTING MODULE 26 SKIPPER VALIDATION SUITE');
  console.log('====================================================');

  // ---------------------------------------------------------------
  // 1. CORE AI WORKFLOW TESTS (7 MARITIME DOMAINS)
  // ---------------------------------------------------------------
  console.log('\n--- 1. Testing Core Maritime Question Workflows ---');

  // 1.1 Vessel Position Question
  const vesselQuery = 'Where is vessel APOLLO GLORY?';
  const vesselIntent = SkipperIntentEngine.parseQuery(vesselQuery);
  assert(vesselIntent.category === 'VESSEL_INTELLIGENCE', '1.1a Vessel intent category detected');
  assert(vesselIntent.entities.vesselName?.toUpperCase() === 'APOLLO GLORY', '1.1b Vessel entity extracted');
  const vesselResult = await SkipperDataRouter.executeQuery(vesselIntent);
  assert(vesselResult.map !== undefined, '1.1c Vessel map artifact generated');
  assert(vesselResult.map?.vesselName === 'APOLLO GLORY', '1.1d Map artifact has correct vessel name');
  assert(typeof vesselResult.map?.coordinates.lat === 'number', '1.1e Map has valid numeric latitude');
  assert(typeof vesselResult.map?.coordinates.lng === 'number', '1.1f Map has valid numeric longitude');
  assert(vesselResult.grounding.status === 'VERIFIED_LIVE_DATA', '1.1g Grounding status is VERIFIED_LIVE_DATA');

  // 1.2 Freight Rate Question
  const freightQuery = 'What is the spot freight rate for TD3C?';
  const freightIntent = SkipperIntentEngine.parseQuery(freightQuery);
  assert(freightIntent.category === 'FREIGHT_MARKET', '1.2a Freight intent category detected');
  assert(freightIntent.entities.routeCode === 'TD3C', '1.2b Route entity TD3C extracted');
  const freightResult = await SkipperDataRouter.executeQuery(freightIntent);
  assert(freightResult.chart !== undefined, '1.2c Freight chart artifact generated');
  assert(freightResult.table !== undefined, '1.2d Freight table artifact generated');
  assert(freightResult.keyMetrics.length >= 3, '1.2e Freight key metrics populated');
  assert(freightResult.grounding.status === 'VERIFIED_LIVE_DATA', '1.2f Freight grounding verified');

  // 1.3 Historical Freight Question
  const histQuery = 'Show historical freight trend for TD3C';
  const histIntent = SkipperIntentEngine.parseQuery(histQuery);
  const histResult = await SkipperDataRouter.executeQuery(histIntent);
  assert(histResult.chart?.type === 'time-series', '1.3a Historical time-series chart generated');
  assert(Boolean(histResult.chart && histResult.chart.dataPoints.length > 0), '1.3b Chart contains time-series data points');
  assert(histResult.chart?.unit === '$/day', '1.3c Chart has proper TCE unit');

  // 1.4 Port Congestion Question
  const portQuery = 'What is the port congestion at Singapore?';
  const portIntent = SkipperIntentEngine.parseQuery(portQuery);
  assert(portIntent.category === 'PORT_CONGESTION', '1.4a Port congestion intent detected');
  assert(portIntent.entities.portName?.toLowerCase() === 'singapore', '1.4b Port Singapore extracted');
  const portResult = await SkipperDataRouter.executeQuery(portIntent);
  assert(portResult.chart?.type === 'bar-comparison', '1.4c Port comparison bar chart returned');
  assert(portResult.table?.rows.length! >= 5, '1.4d Port congestion ledger contains global ports');
  assert(portResult.grounding.status === 'VERIFIED_LIVE_DATA', '1.4e Port grounding status verified');

  // 1.5 Fleet Question
  const fleetQuery = 'Show global commercial fleet operators';
  const fleetIntent = SkipperIntentEngine.parseQuery(fleetQuery);
  assert(fleetIntent.category === 'FLEET_OPERATIONS', '1.5a Fleet operations intent detected');
  const fleetResult = await SkipperDataRouter.executeQuery(fleetIntent);
  assert(fleetResult.table !== undefined, '1.5b Fleet registry table returned');
  assert(fleetResult.chart?.type === 'bar-comparison', '1.5c Fleet capacity chart returned');
  assert(fleetResult.grounding.status === 'HISTORICAL_DATA', '1.5d Fleet grounding status verified');

  // 1.6 Emissions / Decarbonization Question
  const ciiQuery = 'Show CII decarbonization profile for VLCC';
  const ciiIntent = SkipperIntentEngine.parseQuery(ciiQuery);
  assert(ciiIntent.category === 'DECARBONIZATION', '1.6a Decarbonization intent detected');
  const ciiResult = await SkipperDataRouter.executeQuery(ciiIntent);
  assert(Boolean(ciiResult.table?.columns.some((c) => c.key === 'ciiRating')), '1.6b CII ratings column present');
  assert(Boolean(ciiResult.keyMetrics.some((m) => m.label.includes('CO2'))), '1.6c CO2 metric present');

  // 1.7 Multi-Year Historical Question
  const multiYearQuery = 'Show freight supercycle from 2014 to 2026';
  const multiYearIntent = SkipperIntentEngine.parseQuery(multiYearQuery);
  assert(multiYearIntent.category === 'MULTI_YEAR_EXPLORATION', '1.7a Multi-year exploration intent detected');
  const multiYearResult = await SkipperDataRouter.executeQuery(multiYearIntent);
  assert(Boolean(multiYearResult.table?.rows && multiYearResult.table.rows.length >= 10), '1.7b Multi-year table contains 10+ years');
  assert(multiYearResult.grounding.status === 'HISTORICAL_DATA', '1.7c Historical grounding verified');

  // ---------------------------------------------------------------
  // 2. MULTI-TURN CONTEXT RESOLUTION TESTS
  // ---------------------------------------------------------------
  console.log('\n--- 2. Testing Multi-Turn Context Resolution ---');

  const turn1Session = SkipperService.createNewSession();
  const sessionAfterTurn1 = await SkipperService.sendMessage(turn1Session, 'What is the rate for TD3C?');
  const turn1AssistantMsg = sessionAfterTurn1.messages[sessionAfterTurn1.messages.length - 1];
  assert(turn1AssistantMsg.role === 'assistant', '2.1a First turn received assistant response');
  assert(sessionAfterTurn1.contextEntities?.routeCode === 'TD3C', '2.1b Session context captured routeCode TD3C');

  // Turn 2: Anaphoric query
  const sessionAfterTurn2 = await SkipperService.sendMessage(sessionAfterTurn1, 'How does that compare with last month?');
  const turn2AssistantMsg = sessionAfterTurn2.messages[sessionAfterTurn2.messages.length - 1];
  assert(turn2AssistantMsg.parsedIntent?.entities.routeCode === 'TD3C', '2.2a Turn 2 preserved TD3C route context');
  assert(turn2AssistantMsg.content.includes('TD3C'), '2.2b Turn 2 answer references TD3C');

  // Follow-up suggestion chip click test
  assert(Boolean(turn2AssistantMsg.suggestedFollowUps && turn2AssistantMsg.suggestedFollowUps.length > 0), '2.3a Follow-up suggestions exist');
  const followUpToClick = turn2AssistantMsg.suggestedFollowUps![0];
  const sessionAfterFollowUp = await SkipperService.sendMessage(sessionAfterTurn2, followUpToClick);
  const followUpAssistantMsg = sessionAfterFollowUp.messages[sessionAfterFollowUp.messages.length - 1];
  assert(followUpAssistantMsg.role === 'assistant', '2.3b Follow-up execution produced new response');
  assert(followUpAssistantMsg.grounding?.status !== 'DATA_UNAVAILABLE', '2.3c Follow-up produced grounded response');

  // ---------------------------------------------------------------
  // 3. GROUNDING & ANTI-HALLUCINATION TEST (UNSUPPORTED/UNKNOWN QUERY)
  // ---------------------------------------------------------------
  console.log('\n--- 3. Testing Grounding & Anti-Hallucination ---');

  const unknownQuery = 'What is the weather in Paris right now?';
  const unknownIntent = SkipperIntentEngine.parseQuery(unknownQuery);
  assert(unknownIntent.category === 'UNKNOWN_OR_AMBIGUOUS', '3.1a Unrelated query detected as UNKNOWN_OR_AMBIGUOUS');
  const unknownResult = await SkipperDataRouter.executeQuery(unknownIntent);
  assert(unknownResult.grounding.status === 'DATA_UNAVAILABLE', '3.1b Grounding status is DATA_UNAVAILABLE');
  assert(unknownResult.grounding.recordCount === 0, '3.1c Zero records retrieved');
  assert(unknownResult.map === undefined, '3.1d No map fabricated');
  assert(unknownResult.chart === undefined, '3.1e No chart fabricated');
  assert(unknownResult.naturalAnswer.includes('could not identify'), '3.1f Polite clarification given without hallucination');

  // ---------------------------------------------------------------
  // 4. VISUAL ARTIFACTS DATA INTEGRITY
  // ---------------------------------------------------------------
  console.log('\n--- 4. Testing Visual Artifacts Data Integrity ---');

  // Table artifact integrity
  assert(Array.isArray(freightResult.table?.columns), '4.1a Table columns is array');
  assert(Array.isArray(freightResult.table?.rows), '4.1b Table rows is array');
  assert(Boolean(freightResult.table?.downloadFilename?.endsWith('.csv')), '4.1c CSV filename is valid');

  // Chart artifact integrity
  assert(Array.isArray(freightResult.chart?.dataPoints), '4.2a Chart dataPoints is array');
  assert(typeof freightResult.chart?.dataPoints[0].value === 'number', '4.2b Chart values are numeric');
  assert(!isNaN(freightResult.chart?.dataPoints[0].value!), '4.2c Chart values are not NaN');

  // Map artifact integrity
  assert(vesselResult.map?.coordinates.lat! >= -90 && vesselResult.map?.coordinates.lat! <= 90, '4.3a Latitude in valid range');
  assert(vesselResult.map?.coordinates.lng! >= -180 && vesselResult.map?.coordinates.lng! <= 180, '4.3b Longitude in valid range');
  assert(vesselResult.map?.heading! >= 0 && vesselResult.map?.heading! <= 360, '4.3c Heading in 0-360 range');

  // ---------------------------------------------------------------
  // 5. SESSION & STATE PERSISTENCE
  // ---------------------------------------------------------------
  console.log('\n--- 5. Testing Session & State Persistence ---');

  const newSession: SkipperSession = SkipperService.createNewSession('Custom Consultation');
  assert(newSession.id.startsWith('session-'), '5.1a Session ID generated with prefix');
  assert(newSession.title === 'Custom Consultation', '5.1b Session title set');
  assert(newSession.messages.length === 0, '5.1c Session initialized with clean empty message state');

  // JSON serializability check (localStorage simulation)
  const serialized = JSON.stringify(sessionAfterFollowUp);
  const deserialized = JSON.parse(serialized) as SkipperSession;
  assert(deserialized.id === sessionAfterFollowUp.id, '5.2a Serialized session retains id');
  assert(deserialized.messages.length === sessionAfterFollowUp.messages.length, '5.2b Serialized messages preserved');

  console.log('\n====================================================');
  console.log('ALL MODULE 26 VALIDATION SUITE TESTS PASSED 100%');
  console.log('====================================================');
}

runValidation().catch((err) => {
  console.error('Validation error:', err);
  process.exit(1);
});
