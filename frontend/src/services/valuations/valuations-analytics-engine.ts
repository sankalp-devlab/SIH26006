/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 22: Pure Mathematical Valuation & Asset Economics Analytics Engine
 * 
 * Implements strict maritime financial formulations: Lightweight Displacement (LDT),
 * demolition scrap floors, non-linear age depreciation decay, peer percentiles,
 * driver attribution, and dynamic narrative intelligence.
 */

import type {
  VesselValuationRecord,
  MarketContextIntel,
  ComparableVesselSummary,
  VesselValuationComparisonResult,
  SegmentValuationBenchmark,
  ValuationFiltersState,
  ValuationAnalyticalInsight,
  ValuationCurrency,
} from '../../types/valuations';

/**
 * Derives Lightweight Tonnage (LDT) based on vessel type and Deadweight Tonnage
 */
export function calculateLightweightTonnage(dwt: number, vesselType: string = 'Dry Bulk Carrier'): number {
  const norm = vesselType.toLowerCase();
  let ratio = 0.170; // Standard Bulk Carrier LDT/DWT ratio

  if (norm.includes('crude') || norm.includes('tanker')) {
    ratio = 0.165;
  } else if (norm.includes('container') || norm.includes('cellular')) {
    ratio = 0.280;
  } else if (norm.includes('lng') || norm.includes('gas') || norm.includes('lpg')) {
    ratio = 0.320;
  } else if (norm.includes('general') || norm.includes('cargo') || norm.includes('multi')) {
    ratio = 0.200;
  }

  return Math.round(dwt * ratio);
}

/**
 * Calculates demolition/scrap value in Millions USD
 * LDT * ScrapRate (USD/LDT) / 1,000,000
 */
export function calculateDemolitionValue(ldt: number, scrapRatePerLdt: number = 525): number {
  if (ldt <= 0 || scrapRatePerLdt <= 0) return 0;
  return Math.round(((ldt * scrapRatePerLdt) / 1000000) * 10) / 10;
}

/**
 * Calculates Valuation per Deadweight Ton in USD/DWT
 * (Market Value * 1,000,000) / DWT
 */
export function calculateValuationPerDwt(marketValueUsdM: number, dwt: number): number {
  if (dwt <= 0) return 0;
  return Math.round(((marketValueUsdM * 1000000) / dwt) * 10) / 10;
}

/**
 * Calculates Scrap Floor Ratio: percentage of market value covered by scrap
 */
export function calculateScrapFloorRatio(demolitionValueUsdM: number, marketValueUsdM: number): number {
  if (marketValueUsdM <= 0) return 0;
  return Math.round((demolitionValueUsdM / marketValueUsdM) * 1000) / 10;
}

/**
 * Non-linear age depreciation curve based on classical shipping replacement economics:
 * V(t) = DemoFloor + (Newbuild - DemoFloor) * e^(-lambda * t)
 * where lambda represents the market obsolescence decay constant (~0.082)
 */
export function calculateTheoreticalAgeValue(
  newbuildParityUsdM: number,
  demolitionFloorUsdM: number,
  ageYears: number
): number {
  if (ageYears <= 0) return newbuildParityUsdM;
  const lambda = 0.082; // ~50% drop by year 8.5
  const value = demolitionFloorUsdM + (newbuildParityUsdM - demolitionFloorUsdM) * Math.exp(-lambda * ageYears);
  return Math.max(demolitionFloorUsdM, Math.round(value * 10) / 10);
}

/**
 * Generates theoretical depreciation curve points from Age 0 to 25
 */
export function generateDepreciationCurvePoints(
  newbuildParityUsdM: number,
  demolitionFloorUsdM: number
): { age: number; theoreticalValueUsdM: number }[] {
  const points = [];
  for (let age = 0; age <= 25; age++) {
    points.push({
      age,
      theoreticalValueUsdM: calculateTheoreticalAgeValue(newbuildParityUsdM, demolitionFloorUsdM, age),
    });
  }
  return points;
}

/**
 * Builds First-Class Market Context intelligence around the selected vessel
 */
export function generateMarketContext(
  selectedVessel: VesselValuationRecord,
  allVessels: VesselValuationRecord[],
  benchmarks: SegmentValuationBenchmark[]
): MarketContextIntel {
  // Find comparable vessels belonging to same class or segment
  const peers = allVessels.filter(
    (v) => v.vesselClass === selectedVessel.vesselClass || v.marketSegment === selectedVessel.marketSegment
  );

  const benchmark = benchmarks.find((b) => b.vesselClass === selectedVessel.vesselClass) || benchmarks[0];

  const values = peers.map((p) => p.currentMarketValueUsdM).sort((a, b) => a - b);
  const totalCount = values.length;

  const minVal = values[0] || selectedVessel.currentMarketValueUsdM;
  const maxVal = values[values.length - 1] || selectedVessel.currentMarketValueUsdM;
  const medianVal = values[Math.floor(totalCount / 2)] || benchmark.medianMarketValueUsdM;
  const p25Val = values[Math.floor(totalCount * 0.25)] || benchmark.p25MarketValueUsdM;
  const p75Val = values[Math.floor(totalCount * 0.75)] || benchmark.p75MarketValueUsdM;

  const comparableAvg =
    peers.length > 0
      ? Math.round((peers.reduce((acc, p) => acc + p.currentMarketValueUsdM, 0) / peers.length) * 10) / 10
      : medianVal;

  const premiumPct =
    comparableAvg > 0
      ? Math.round((((selectedVessel.currentMarketValueUsdM - comparableAvg) / comparableAvg) * 100) * 10) / 10
      : 0;

  let marketPosition: 'Above Market' | 'At Market' | 'Below Market' = 'At Market';
  if (premiumPct >= 3.0) marketPosition = 'Above Market';
  else if (premiumPct <= -3.0) marketPosition = 'Below Market';

  const comparableSummaries: ComparableVesselSummary[] = peers.map((p) => ({
    id: p.id,
    name: p.name,
    imoNumber: p.imoNumber,
    vesselClass: p.vesselClass,
    dwt: p.dwt,
    yearBuilt: p.yearBuilt,
    ageYears: p.ageYears,
    currentMarketValueUsdM: p.currentMarketValueUsdM,
    valuationPerDwtUsd: p.valuationPerDwtUsd,
    demolitionScrapValueUsdM: p.demolitionScrapValueUsdM,
    change1yPct: p.change1yPct,
    marketPosition: p.marketPosition,
    owner: p.registeredOwner,
  }));

  return {
    segmentName: selectedVessel.marketSegment,
    vesselClass: selectedVessel.vesselClass,
    totalSegmentVessels: benchmark.vesselCount || peers.length,
    medianMarketValueUsdM: medianVal,
    p25MarketValueUsdM: p25Val,
    p75MarketValueUsdM: p75Val,
    minMarketValueUsdM: minVal,
    maxMarketValueUsdM: maxVal,
    segment1mChangePct: 1.8,
    segment3mChangePct: 4.6,
    segment12mChangePct: benchmark.annualAppreciationPct || 8.5,
    spTransactionVolumeL12M: Math.round(benchmark.vesselCount * 0.082),
    spLiquidityRating: selectedVessel.vesselClass === 'VLCC' || selectedVessel.vesselClass === 'Capesize' ? 'High' : 'Moderate',
    orderbookToFleetRatioPct: selectedVessel.vesselClass === 'VLCC' ? 5.4 : selectedVessel.vesselClass === 'Container Neo-Panamax' ? 24.2 : 9.8,
    averageFleetAgeYears: benchmark.averageAgeYears || 8.5,
    comparableAverageValueUsdM: comparableAvg,
    comparablePremiumPct: premiumPct,
    marketPosition,
    marketTrend: selectedVessel.marketTrend,
    comparableVessels: comparableSummaries,
  };
}

/**
 * Builds multi-vessel comparative evaluation matrix (up to 5 vessels)
 */
export function generateValuationComparison(
  selectedVessels: VesselValuationRecord[],
  benchmark?: SegmentValuationBenchmark
): VesselValuationComparisonResult {
  const metricConfigs = [
    { key: 'currentMarketValueUsdM', label: 'Current Valuation', unit: '$M', higherIsBetter: true },
    { key: 'valuationPerDwtUsd', label: 'Valuation / DWT', unit: '$/DWT', higherIsBetter: true },
    { key: 'ageYears', label: 'Vessel Age', unit: 'yrs', higherIsBetter: false },
    { key: 'demolitionScrapValueUsdM', label: 'Demolition Scrap Floor', unit: '$M', higherIsBetter: true },
    { key: 'change1yPct', label: '12M Appreciation', unit: '%', higherIsBetter: true },
    { key: 'scrapFloorPct', label: 'Scrap Floor Cushion', unit: '%', higherIsBetter: true },
  ];

  const metrics = metricConfigs.map((cfg) => {
    const values: Record<number, number | string> = {};
    let bestVesselId: number | undefined;
    let worstVesselId: number | undefined;
    let bestVal: number | undefined;
    let worstVal: number | undefined;

    selectedVessels.forEach((v) => {
      const rawVal = (v as unknown as Record<string, unknown>)[cfg.key];
      if (typeof rawVal === 'number') {
        values[v.id] = rawVal;
        if (bestVal === undefined || (cfg.higherIsBetter ? rawVal > bestVal : rawVal < bestVal)) {
          bestVal = rawVal;
          bestVesselId = v.id;
        }
        if (worstVal === undefined || (cfg.higherIsBetter ? rawVal < worstVal : rawVal > worstVal)) {
          worstVal = rawVal;
          worstVesselId = v.id;
        }
      } else {
        values[v.id] = String(rawVal ?? 'N/A');
      }
    });

    let bmkVal: string | number = 'N/A';
    if (benchmark) {
      if (cfg.key === 'currentMarketValueUsdM') bmkVal = `$${benchmark.medianMarketValueUsdM}M`;
      else if (cfg.key === 'valuationPerDwtUsd') bmkVal = `$${benchmark.averageValuationPerDwtUsd}`;
      else if (cfg.key === 'ageYears') bmkVal = `${benchmark.averageAgeYears} yrs`;
      else if (cfg.key === 'demolitionScrapValueUsdM') bmkVal = `$${benchmark.averageDemolitionValueUsdM}M`;
      else if (cfg.key === 'change1yPct') bmkVal = `+${benchmark.annualAppreciationPct}%`;
    }

    return {
      key: cfg.key,
      label: cfg.label,
      unit: cfg.unit,
      values,
      bestVesselId,
      worstVesselId,
      benchmarkValue: bmkVal,
    };
  });

  return {
    vessels: selectedVessels,
    metrics,
  };
}

/**
 * Generates dynamic, data-driven narrative intelligence insights from active vessel & context
 */
export function generateValuationInsights(
  vessel: VesselValuationRecord,
  context: MarketContextIntel
): ValuationAnalyticalInsight[] {
  const insights: ValuationAnalyticalInsight[] = [];

  // 1. Premium / Discount to Peers
  const prem = context.comparablePremiumPct;
  insights.push({
    id: 'ins-01',
    category: 'market_context',
    badge: prem >= 0 ? 'VALUATION PREMIUM' : 'VALUATION DISCOUNT',
    title: `${vessel.name} Trading ${Math.abs(prem)}% ${prem >= 0 ? 'Above' : 'Below'} ${context.vesselClass} Average`,
    narrative: `Current appraisal of $${vessel.currentMarketValueUsdM.toFixed(1)}M contrasts with the peer average of $${context.comparableAverageValueUsdM.toFixed(1)}M, reflecting its ${vessel.ageYears.toFixed(1)}-year age profile and technical specifications.`,
    impactMetric: 'Comparable Delta',
    impactValue: `${prem >= 0 ? '+' : ''}${prem}% vs Peers`,
    urgency: prem >= 0 ? 'positive' : 'warning',
  });

  // 2. 12M Trajectory Velocity
  const yoy = vessel.change1yPct;
  insights.push({
    id: 'ins-02',
    category: 'valuation',
    badge: 'ANNUAL TRAJECTORY',
    title: `Valuation has ${yoy >= 0 ? 'Appreciated' : 'Depreciated'} ${Math.abs(yoy)}% Over the Last 12 Months`,
    narrative: `Asset value moved from $${(vessel.currentMarketValueUsdM - vessel.change1yUsdM).toFixed(1)}M to $${vessel.currentMarketValueUsdM.toFixed(1)}M (+${vessel.change1yUsdM.toFixed(1)}M USD), supported by firm second-hand S&P transaction liquidity.`,
    impactMetric: '12M Capital Gain',
    impactValue: `${yoy >= 0 ? '+' : ''}$${vessel.change1yUsdM.toFixed(1)}M`,
    urgency: yoy >= 0 ? 'positive' : 'warning',
  });

  // 3. Demolition Salvage Floor
  const scrapFloor = vessel.scrapFloorPct;
  insights.push({
    id: 'ins-03',
    category: 'demolition',
    badge: 'SCRAP FLOOR RESIDUAL',
    title: `Demolition Value Represents ${scrapFloor.toFixed(1)}% of Current Market Valuation`,
    narrative: `At current subcontinent rates ($${vessel.scrapRatePerLdtUsd}/LDT), the vessel's ${vessel.lightweightTons.toLocaleString()} LDT generates a guaranteed salvage floor of $${vessel.demolitionScrapValueUsdM.toFixed(1)}M, limiting downside collateral risk.`,
    impactMetric: 'Net Premium to Scrap',
    impactValue: `$${vessel.valuationPremiumOverScrapUsdM.toFixed(1)}M`,
    urgency: 'info',
  });

  // 4. Age Lifecycle Positioning
  let ageNarrative = '';
  let ageBadge = 'VINTAGE ANALYSIS';
  let ageUrgency: 'info' | 'positive' | 'warning' = 'info';

  if (vessel.ageYears < 5) {
    ageBadge = 'PRIME MODERN TONNAGE';
    ageNarrative = `Under 5 years of age. Vessel enjoys maximum charterer vetting eligibility, minimal drydock capex risk, and premium earnings power.`;
    ageUrgency = 'positive';
  } else if (vessel.ageYears < 12) {
    ageBadge = 'MID-LIFE STABILITY';
    ageNarrative = `Operating in the 5-12 year mid-life plateau. Depreciation curves flatten as robust operating cash flows offset age decay.`;
    ageUrgency = 'info';
  } else {
    ageBadge = 'MATURE ASSET CYCLE';
    ageNarrative = `Over 12 years of age. Approaching major special survey window with potential tier-1 commercial trading restrictions.`;
    ageUrgency = 'warning';
  }

  insights.push({
    id: 'ins-04',
    category: 'depreciation',
    badge: ageBadge,
    title: `${vessel.ageYears.toFixed(1)} Years Old • ${vessel.yearBuilt} Built Vintage`,
    narrative: ageNarrative,
    impactMetric: 'Replacement Parity',
    impactValue: `$${vessel.newbuildingParityUsdM.toFixed(1)}M Newbuild`,
    urgency: ageUrgency,
  });

  return insights;
}

/**
 * Currency Conversion Helper
 */
export function convertCurrency(
  amountUsd: number,
  currency: ValuationCurrency,
  rates: Record<ValuationCurrency, number> = { USD: 1.0, EUR: 0.92, GBP: 0.78 }
): number {
  const rate = rates[currency] || 1.0;
  return amountUsd * rate;
}

/**
 * Formats a currency value with symbol and unit
 */
export function formatValuation(
  amountUsdM: number,
  currency: ValuationCurrency = 'USD',
  rates: Record<ValuationCurrency, number> = { USD: 1.0, EUR: 0.92, GBP: 0.78 },
  includeUnit: boolean = true
): string {
  const converted = convertCurrency(amountUsdM, currency, rates);
  const symbolMap: Record<ValuationCurrency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  const sym = symbolMap[currency] || '$';
  return `${sym}${converted.toFixed(1)}${includeUnit ? 'M' : ''}`;
}

/**
 * Filter vessel valuation records
 */
export function filterValuationVessels(
  vessels: VesselValuationRecord[],
  filters: ValuationFiltersState
): VesselValuationRecord[] {
  return vessels.filter((v) => {
    // 1. Text Search (Name or IMO)
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = v.name.toLowerCase().includes(q);
      const matchImo = v.imoNumber.toLowerCase().includes(q);
      const matchOwner = v.registeredOwner.toLowerCase().includes(q);
      const matchClass = v.vesselClass.toLowerCase().includes(q);
      if (!matchName && !matchImo && !matchOwner && !matchClass) return false;
    }

    // 2. Vessel Class
    if (filters.vesselClass !== 'ALL' && v.vesselClass !== filters.vesselClass) {
      return false;
    }

    // 3. Market Segment
    if (filters.marketSegment !== 'ALL' && v.marketSegment !== filters.marketSegment) {
      return false;
    }

    // 4. Age Bracket
    if (filters.ageBracket !== 'ALL') {
      if (filters.ageBracket === '0-5' && v.ageYears >= 5) return false;
      if (filters.ageBracket === '5-10' && (v.ageYears < 5 || v.ageYears >= 10)) return false;
      if (filters.ageBracket === '10-15' && (v.ageYears < 10 || v.ageYears >= 15)) return false;
      if (filters.ageBracket === '15+' && v.ageYears < 15) return false;
    }

    // 5. Owner
    if (filters.owner !== 'ALL' && v.registeredOwner !== filters.owner) {
      return false;
    }

    return true;
  });
}
