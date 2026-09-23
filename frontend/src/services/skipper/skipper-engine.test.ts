import assert from 'node:assert';
import { SkipperIntentEngine } from './skipper-intent-engine';
import { SkipperDataRouter } from './skipper-data-router';
import { SkipperService } from './skipper.service';

console.log('--- RUNNING MODULE 26 SKIPPER ENGINE TESTS ---');

// Test 1: Spot Freight Intent
const intentFreight = SkipperIntentEngine.parse('What is the spot rate for TD3C?');
assert.strictEqual(intentFreight.category, 'FREIGHT_MARKET');
assert.strictEqual(intentFreight.entities.routeCode, 'TD3C');
console.log('✓ Test 1 Passed: Spot freight intent correctly parsed:', intentFreight.entities.routeCode);

// Test 2: FFA Derivatives Intent
const intentFfa = SkipperIntentEngine.parse('Show the forward FFA curve for TD3C and tell me if it is in contango');
assert.strictEqual(intentFfa.category, 'FFA_DERIVATIVES');
assert.strictEqual(intentFfa.entities.routeCode, 'TD3C');
console.log('✓ Test 2 Passed: FFA derivatives intent correctly parsed');

// Test 3: Vessel Tracking Intent
const intentVessel = SkipperIntentEngine.parse('Where is vessel APOLLO GLORY and what is her speed?');
assert.strictEqual(intentVessel.category, 'VESSEL_INTELLIGENCE');
assert.strictEqual(intentVessel.entities.vesselName, 'APOLLO GLORY');
console.log('✓ Test 3 Passed: Vessel tracking intent correctly parsed:', intentVessel.entities.vesselName);

// Test 4: Port Congestion Intent
const intentPort = SkipperIntentEngine.parse('What is the average vessel wait time in Singapore port?');
assert.strictEqual(intentPort.category, 'PORT_CONGESTION');
assert.strictEqual(intentPort.entities.portName, 'Singapore');
console.log('✓ Test 4 Passed: Port congestion intent correctly parsed:', intentPort.entities.portName);

// Test 5: Decarbonization Intent
const intentDecarbon = SkipperIntentEngine.parse('Show CII emissions and speed reduction savings for Capesize');
assert.strictEqual(intentDecarbon.category, 'DECARBONIZATION');
assert.strictEqual(intentDecarbon.entities.vesselClass, 'Capesize');
console.log('✓ Test 5 Passed: Decarbonization intent correctly parsed');

// Test 6: Multi-Year Exploration Intent
const intent12Y = SkipperIntentEngine.parse('Show the 12 year shipping supercycle from 2014 to 2026');
assert.strictEqual(intent12Y.category, 'MULTI_YEAR_EXPLORATION');
console.log('✓ Test 6 Passed: Multi-year exploration intent correctly parsed');

// Test 7: Multi-Turn Context Resolution
// Turn 1 context has { routeCode: 'TD3C', lastCategory: 'FREIGHT_MARKET' }
const turn2Prompt = 'How does that compare with last month?';
const intentTurn2 = SkipperIntentEngine.parse(turn2Prompt, { routeCode: 'TD3C', lastCategory: 'FREIGHT_MARKET' });
assert.strictEqual(intentTurn2.category, 'FREIGHT_MARKET');
assert.strictEqual(intentTurn2.entities.routeCode, 'TD3C');
console.log('✓ Test 7 Passed: Multi-turn anaphoric resolution preserved routeCode TD3C');

// Test 8: Data Router Execution - Freight Market
async function testDataRouter() {
  const freightResult = await SkipperDataRouter.executeQuery(intentFreight);
  assert(freightResult.naturalAnswer.length > 20, 'Natural answer must be populated');
  assert(freightResult.keyMetrics.length > 0, 'Key metrics must be populated');
  assert(freightResult.grounding.status === 'VERIFIED_LIVE_DATA', 'Grounding status must be verified');
  assert(freightResult.chart !== undefined, 'Freight result must include chart artifact');
  assert(freightResult.followUps.length > 0, 'Must include follow-up suggestions');
  console.log('✓ Test 8 Passed: Data router freight execution verified with chart & grounding');

  // Test 9: Data Router Execution - Vessel with Map Artifact
  const vesselResult = await SkipperDataRouter.executeQuery(intentVessel);
  assert(vesselResult.map !== undefined, 'Vessel query must include map artifact');
  assert(vesselResult.map?.vesselName === 'APOLLO GLORY', 'Map vessel name must match');
  assert(vesselResult.map?.coordinates.lat !== 0, 'Coordinates must be valid');
  console.log('✓ Test 9 Passed: Vessel query successfully returned live map coordinates and status');

  // Test 10: Complete Pipeline Execution via SkipperService
  let stageCount = 0;
  const { assistantMessage, updatedContext } = await SkipperService.processQuestion(
    'What is the spot rate for TD3C?',
    {},
    (stage) => {
      stageCount++;
      assert(stage.length > 0, 'Stage label must not be empty');
    }
  );

  assert.strictEqual(assistantMessage.role, 'assistant');
  assert(stageCount >= 4, `Pipeline should trigger at least 4 stages, got ${stageCount}`);
  assert.strictEqual(updatedContext.routeCode, 'TD3C');
  assert(assistantMessage.visualArtifact !== undefined, 'Visual artifact must be present');
  console.log('✓ Test 10 Passed: Complete 5-stage pipeline executed with updated conversation context');

  console.log('====================================================');
  console.log('ALL 10 SKIPPER ENGINE & ADAPTER TESTS PASSED 100%');
  console.log('====================================================');
}

testDataRouter().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
