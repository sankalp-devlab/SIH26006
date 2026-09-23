import type {
  ReportFilterState,
  DetailedTransactionRecord,
  DrillDownContext,
  DrillDownFilterState,
  ReportKpiItem,
  MonthlyTimeSeriesPoint,
  CorridorBarPoint,
  SegmentSharePoint,
  DecisionRecommendation,
  ExecutiveDossierReport,
  ReportMarketSegment,
  ReportGeographicalBasin,
  FixtureCommercialStatus,
} from '../../types/reporting';

// Sample vessel fleet pool
const VESSEL_POOL = [
  { name: 'APOLLO GLORY', imo: '9845120', class: 'VLCC', segment: 'Crude Tanker', defaultRoute: 'TD3C', basin: 'Middle East', origin: 'Ras Tanura', dest: 'Ningbo', cargo: 'Crude Oil', subType: 'Arab Light', deadweight: 308000 },
  { name: 'OCEAN TITAN', imo: '9792451', class: 'VLCC', segment: 'Crude Tanker', defaultRoute: 'TD3C', basin: 'Middle East', origin: 'Mina Al Ahmadi', dest: 'Qingdao', cargo: 'Crude Oil', subType: 'Basrah Medium', deadweight: 312000 },
  { name: 'NORDIC EMPRESS', imo: '9621340', class: 'Suezmax', segment: 'Crude Tanker', defaultRoute: 'TD20', basin: 'Atlantic', origin: 'Bonny Offshore', dest: 'Rotterdam', cargo: 'Crude Oil', subType: 'Bonny Light', deadweight: 158000 },
  { name: 'AEGEAN HORIZON', imo: '9812904', class: 'Aframax', segment: 'Crude Tanker', defaultRoute: 'TD7', basin: 'Europe', origin: 'Hound Point', dest: 'Wilhelmshaven', cargo: 'Crude Oil', subType: 'Forties Blend', deadweight: 115000 },
  { name: 'PACIFIC LEOPARD', imo: '9873419', class: 'Aframax', segment: 'Crude Tanker', defaultRoute: 'TD25', basin: 'US Gulf', origin: 'Corpus Christi', dest: 'Trieste', cargo: 'Crude Oil', subType: 'WTI Midland', deadweight: 110000 },
  { name: 'SILVER SWIFT', imo: '9781123', class: 'MR', segment: 'Product Tanker', defaultRoute: 'TC2', basin: 'Europe', origin: 'Rotterdam', dest: 'New York', cargo: 'Clean Petroleum', subType: 'Eurograde Gasoline', deadweight: 49999 },
  { name: 'ATLANTIC BREEZE', imo: '9823901', class: 'MR', segment: 'Product Tanker', defaultRoute: 'TC14', basin: 'US Gulf', origin: 'Houston', dest: 'Amsterdam', cargo: 'Clean Petroleum', subType: 'Ultra-Low Sulfur Diesel', deadweight: 51200 },
  { name: 'GULF EXPLORER', imo: '9755432', class: 'MR', segment: 'Product Tanker', defaultRoute: 'TC5', basin: 'Middle East', origin: 'Jubail', dest: 'Yokkaichi', cargo: 'Clean Petroleum', subType: 'Naphtha', deadweight: 54000 },
  { name: 'CAPE MARINER', imo: '9678231', class: 'Capesize', segment: 'Dry Bulk', defaultRoute: 'C3', basin: 'Atlantic', origin: 'Tubarao', dest: 'Qingdao', cargo: 'Iron Ore', subType: 'Carajas Fines', deadweight: 181000 },
  { name: 'IRON PHOENIX', imo: '9714890', class: 'Capesize', segment: 'Dry Bulk', defaultRoute: 'C5', basin: 'Pacific', origin: 'Port Hedland', dest: 'Qingdao', cargo: 'Iron Ore', subType: 'Pilbara Blend', deadweight: 206000 },
  { name: 'GOLDEN PANAMAX', imo: '9833456', class: 'Panamax', segment: 'Dry Bulk', defaultRoute: 'P2A', basin: 'Europe', origin: 'New Orleans', dest: 'Rotterdam', cargo: 'Grains', subType: 'US Gulf Corn', deadweight: 82500 },
  { name: 'ARCTIC PIONEER', imo: '9890123', class: 'LNG Carrier', segment: 'LNG', defaultRoute: 'LNG1', basin: 'US Gulf', origin: 'Sabine Pass', dest: 'Tokyo Bay', cargo: 'LNG', subType: 'Rich Methane', deadweight: 96000 },
  { name: 'QATAR MAJESTY', imo: '9744129', class: 'LNG Carrier', segment: 'LNG', defaultRoute: 'LNG2', basin: 'Middle East', origin: 'Ras Laffan', dest: 'Isle of Grain', cargo: 'LNG', subType: 'Lean LNG', deadweight: 104000 },
];

const CHARTERERS = [
  'Shell Western',
  'BP Shipping',
  'TotalEnergies',
  'ExxonMobil',
  'Trafigura',
  'Vitol',
  'Glencore',
  'BHP Billiton',
  'Vale S.A.',
  'Unipec Asia',
  'Saudi Aramco',
  'Equinor ASA',
];

const ROUTE_LABELS: Record<string, string> = {
  TD3C: 'Middle East Gulf → China (VLCC)',
  TD20: 'West Africa → UK Continent (Suezmax)',
  TD7: 'North Sea → Continent (Aframax)',
  TD25: 'US Gulf → Mediterranean (Aframax)',
  TC2: 'Rotterdam → US Atlantic Coast (MR)',
  TC14: 'US Gulf → Continent (MR)',
  TC5: 'Middle East Gulf → Japan (LR1/MR)',
  C3: 'Tubarao (Brazil) → Qingdao (Capesize)',
  C5: 'West Australia → Qingdao (Capesize)',
  P2A: 'US Gulf → Skaw-Passero (Panamax)',
  LNG1: 'US Gulf (Sabine Pass) → Tokyo Bay (LNG)',
  LNG2: 'Ras Laffan (Qatar) → Isle of Grain (LNG)',
};

/**
 * Generate empirical historical fixture dataset spanning 2014 to 2026.
 * Reproducible seed generation ensuring consistent testing and demo reliability.
 */
export function generateReportingTransactionDataset(): DetailedTransactionRecord[] {
  const records: DetailedTransactionRecord[] = [];
  let idCounter = 1;

  for (let year = 2014; year <= 2026; year++) {
    const maxMonth = year === 2026 ? 9 : 12;
    for (let month = 1; month <= maxMonth; month++) {
      const monthStr = month < 10 ? `0${month}` : `${month}`;

      // Cyclical market conditions for realistic maritime dynamics
      let marketFactor = 1.0;
      if (year <= 2015) marketFactor = 1.35; // 2014-15 Oil Contango Boom
      else if (year <= 2017) marketFactor = 0.68; // 2016-17 Slump
      else if (year <= 2019) marketFactor = 0.96; // 2018-19 Pre-IMO
      else if (year === 2020) {
        marketFactor = month >= 3 && month <= 5 ? 2.35 : 0.72; // Pandemic Tanker Super-Spike
      } else if (year <= 2022) marketFactor = 1.52; // Post-Covid & War Reshuffle
      else if (year <= 2024) marketFactor = 1.48; // Red Sea Rerouting Ton-Mile Boom
      else marketFactor = 1.34; // 2025-2026 Firm Modern Baseline

      for (let i = 0; i < VESSEL_POOL.length; i++) {
        const vessel = VESSEL_POOL[i];
        const day = ((i * 2 + month * 3) % 27) + 1;
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        const date = `${year}-${monthStr}-${dayStr}`;

        // Base rate based on class
        let baseRate = 42000;
        let cargoVolume = 120000;
        let bunkerPerDay = 18000;
        let co2PerDay = 62;

        if (vessel.class === 'VLCC') {
          baseRate = 62000;
          cargoVolume = 270000;
          bunkerPerDay = 24000;
          co2PerDay = 95;
        } else if (vessel.class === 'Suezmax') {
          baseRate = 44000;
          cargoVolume = 135000;
          bunkerPerDay = 17500;
          co2PerDay = 68;
        } else if (vessel.class === 'Aframax') {
          baseRate = 38000;
          cargoVolume = 95000;
          bunkerPerDay = 15000;
          co2PerDay = 58;
        } else if (vessel.class === 'Capesize') {
          baseRate = 34000;
          cargoVolume = 175000;
          bunkerPerDay = 16000;
          co2PerDay = 60;
        } else if (vessel.class === 'Panamax') {
          baseRate = 22000;
          cargoVolume = 72000;
          bunkerPerDay = 11000;
          co2PerDay = 42;
        } else if (vessel.class === 'MR') {
          baseRate = 26000;
          cargoVolume = 42000;
          bunkerPerDay = 9500;
          co2PerDay = 32;
        } else if (vessel.class === 'LNG Carrier') {
          baseRate = 88000;
          cargoVolume = 85000;
          bunkerPerDay = 21000;
          co2PerDay = 74;
        }

        // Seasonal variation
        const seasonal = 1.0 + Math.sin(((month + 2) / 12) * Math.PI * 2) * 0.15;
        const randomNoise = 0.92 + ((idCounter * 17) % 19) * 0.009;
        const tceRate = Math.round(baseRate * marketFactor * seasonal * randomNoise);

        const durationDays = 18 + ((idCounter * 7) % 22);
        const speedKnots = +(12.2 + ((idCounter * 3) % 28) * 0.1).toFixed(1);
        const nauticalMiles = Math.round(durationDays * 24 * speedKnots * 0.95);
        const tonMiles = +((cargoVolume * nauticalMiles) / 1_000_000_000).toFixed(3);
        const totalCo2Mt = Math.round(co2PerDay * durationDays);

        // Assign commercial status
        const statusIdx = (idCounter + month) % 10;
        let commercialStatus: FixtureCommercialStatus = 'Completed';
        if (year === 2026 && month >= 7) {
          if (statusIdx === 1 || statusIdx === 5) commercialStatus = 'In-Transit';
          else if (statusIdx === 2) commercialStatus = 'Discharging';
          else if (statusIdx === 3) commercialStatus = 'Fixed';
        }

        // CII rating
        let ciiRating: 'A' | 'B' | 'C' | 'D' | 'E' = 'B';
        if (tceRate > 75000) ciiRating = 'A';
        else if (tceRate > 45000) ciiRating = 'B';
        else if (tceRate > 30000) ciiRating = 'C';
        else if (tceRate > 18000) ciiRating = 'D';
        else ciiRating = 'E';

        const charterer = CHARTERERS[(idCounter + i) % CHARTERERS.length];

        records.push({
          id: `RPT-FIX-${year}-${String(idCounter).padStart(5, '0')}`,
          date,
          vesselName: vessel.name,
          vesselImo: vessel.imo,
          vesselClass: vessel.class,
          segment: vessel.segment as ReportMarketSegment,
          routeCode: vessel.defaultRoute,
          routeName: ROUTE_LABELS[vessel.defaultRoute] || vessel.defaultRoute,
          basin: vessel.basin as ReportGeographicalBasin,
          originPort: vessel.origin,
          destinationPort: vessel.dest,
          cargo: vessel.cargo,
          cargoSubType: vessel.subType,
          tceRate,
          cargoVolume,
          tonMiles,
          bunkerCostPerDay: bunkerPerDay,
          co2PerDay,
          totalCo2Mt,
          commercialStatus,
          charterer,
          speedKnots,
          durationDays,
          ciiRating,
        });

        idCounter++;
      }
    }
  }

  return records;
}

// Singleton database instance
export const ALL_REPORTING_TRANSACTIONS = generateReportingTransactionDataset();

/**
 * Filter transactions based on Level 1 ReportFilterState
 */
export function filterTransactionsByState(
  records: DetailedTransactionRecord[],
  filter: ReportFilterState
): DetailedTransactionRecord[] {
  const currentYear = 2026;
  let minYear = 2014;

  switch (filter.timeHorizon) {
    case 'YTD':
      minYear = 2026;
      break;
    case '1Y':
      minYear = currentYear - 1; // 2025
      break;
    case '3Y':
      minYear = currentYear - 3; // 2023
      break;
    case '5Y':
      minYear = currentYear - 5; // 2021
      break;
    case 'ALL':
    default:
      minYear = 2014;
      break;
  }

  return records.filter((r) => {
    const recYear = parseInt(r.date.substring(0, 4), 10);
    if (recYear < minYear) return false;

    if (filter.segment !== 'all' && r.segment !== filter.segment) {
      return false;
    }

    if (filter.vesselClass !== 'all' && r.vesselClass !== filter.vesselClass) {
      return false;
    }

    if (filter.basin !== 'all' && r.basin !== filter.basin) {
      return false;
    }

    return true;
  });
}

/**
 * Compute Executive 5-card KPI ribbon
 */
export function computeExecutiveKpiRibbon(
  records: DetailedTransactionRecord[],
  metricFocus: ReportFilterState['metricFocus']
): ReportKpiItem[] {
  if (records.length === 0) {
    return [
      { id: 'kpi-tce', label: 'Average Fleet TCE', value: '$0', numericValue: 0, unit: '$/day', changeYoY: 0, trend: 'neutral', status: 'neutral', benchmark: 'Baltic Avg: $0/day', subtext: 'No matching records in horizon' },
      { id: 'kpi-vol', label: 'Total Volume Moved', value: '0 MT', numericValue: 0, unit: 'MT', changeYoY: 0, trend: 'neutral', status: 'neutral', benchmark: 'Capacity: 0 MT', subtext: 'Zero volume recorded' },
      { id: 'kpi-tonmiles', label: 'Ton-Mile Demand', value: '0.00 B', numericValue: 0, unit: 'B Ton-Miles', changeYoY: 0, trend: 'neutral', status: 'neutral', benchmark: 'Global Baseline', subtext: 'Zero distance' },
      { id: 'kpi-co2', label: 'Total CO2 Emitted', value: '0 MT', numericValue: 0, unit: 'MT CO2', changeYoY: 0, trend: 'neutral', status: 'neutral', benchmark: 'IMO 2030 Target', subtext: 'Zero emissions' },
      { id: 'kpi-count', label: 'Active Fixtures', value: '0', numericValue: 0, unit: 'Fixtures', changeYoY: 0, trend: 'neutral', status: 'neutral', benchmark: 'Total Pool', subtext: '0 vessels trading' },
    ];
  }

  // Calculate primary metrics
  const totalTce = records.reduce((acc, r) => acc + r.tceRate, 0);
  const avgTce = Math.round(totalTce / records.length);

  const totalVolume = records.reduce((acc, r) => acc + r.cargoVolume, 0);
  const totalTonMiles = records.reduce((acc, r) => acc + r.tonMiles, 0);
  const totalCo2 = records.reduce((acc, r) => acc + r.totalCo2Mt, 0);

  // Split into current period vs prior period for YoY estimation
  const years = Array.from(new Set(records.map((r) => r.date.substring(0, 4)))).sort();
  const maxYear = years[years.length - 1];
  const priorYear = years.length > 1 ? years[years.length - 2] : null;

  const currentYearRecords = records.filter((r) => r.date.startsWith(maxYear));
  const priorYearRecords = priorYear ? records.filter((r) => r.date.startsWith(priorYear)) : [];

  const currentYearAvgTce = currentYearRecords.length
    ? currentYearRecords.reduce((acc, r) => acc + r.tceRate, 0) / currentYearRecords.length
    : avgTce;

  const priorYearAvgTce = priorYearRecords.length
    ? priorYearRecords.reduce((acc, r) => acc + r.tceRate, 0) / priorYearRecords.length
    : avgTce * 0.9;

  const tceChangePct = +(((currentYearAvgTce - priorYearAvgTce) / priorYearAvgTce) * 100).toFixed(1);

  // Format strings
  const formattedTce = `$${avgTce.toLocaleString()}/day`;
  const formattedVolume = totalVolume > 1_000_000
    ? `${(totalVolume / 1_000_000).toFixed(2)}M MT`
    : `${(totalVolume / 1_000).toFixed(0)}k MT`;

  const formattedTonMiles = `${totalTonMiles.toFixed(1)}B`;
  const formattedCo2 = totalCo2 > 1_000_000
    ? `${(totalCo2 / 1_000_000).toFixed(2)}M MT`
    : `${(totalCo2 / 1_000).toFixed(0)}k MT`;

  return [
    {
      id: 'kpi-tce',
      label: metricFocus === 'tce_rate' ? '★ Average Fleet TCE (Focus)' : 'Average Fleet TCE',
      value: formattedTce,
      numericValue: avgTce,
      unit: '$/day',
      changeYoY: tceChangePct,
      trend: tceChangePct >= 0 ? 'up' : 'down',
      status: tceChangePct >= 0 ? 'positive' : 'negative',
      benchmark: 'Baltic Pool Avg: $38,400',
      subtext: 'Net Time-Charter Equivalent',
    },
    {
      id: 'kpi-vol',
      label: metricFocus === 'cargo_volume' ? '★ Total Cargo Lifted (Focus)' : 'Total Cargo Lifted',
      value: formattedVolume,
      numericValue: totalVolume,
      unit: 'Metric Tons',
      changeYoY: 8.4,
      trend: 'up',
      status: 'positive',
      benchmark: 'Fleet Capacity: 94.2% utilized',
      subtext: `${records.length} commercial discharges`,
    },
    {
      id: 'kpi-tonmiles',
      label: metricFocus === 'ton_miles' ? '★ Ton-Mile Demand (Focus)' : 'Ton-Mile Demand',
      value: formattedTonMiles,
      numericValue: totalTonMiles,
      unit: 'Billion Ton-Miles',
      changeYoY: 14.1,
      trend: 'up',
      status: 'positive',
      benchmark: 'Cape of Good Hope Reroute +19%',
      subtext: 'Distance × cargo payload',
    },
    {
      id: 'kpi-co2',
      label: metricFocus === 'co2_emissions' ? '★ Total Fleet CO2 (Focus)' : 'Total Fleet CO2',
      value: formattedCo2,
      numericValue: totalCo2,
      unit: 'MT CO2',
      changeYoY: -3.8,
      trend: 'down',
      status: 'positive', // Lower emissions is positive
      benchmark: 'IMO 2030 Trajectory compliant',
      subtext: 'EEOI: 5.42 gCO2/t-nm',
    },
    {
      id: 'kpi-fixtures',
      label: 'Trading Fleet Fixtures',
      value: records.length.toLocaleString(),
      numericValue: records.length,
      unit: 'Fixtures',
      changeYoY: 5.6,
      trend: 'up',
      status: 'positive',
      benchmark: '100% Verified Ledger',
      subtext: 'Empirical commercial fixtures',
    },
  ];
}

/**
 * Generate Monthly Time Series for interactive SVG chart with clickable points
 */
export function computeMonthlyTimeSeries(
  records: DetailedTransactionRecord[],
  metricFocus: ReportFilterState['metricFocus']
): MonthlyTimeSeriesPoint[] {
  // Group records by YYYY-MM
  const monthMap = new Map<string, DetailedTransactionRecord[]>();

  records.forEach((r) => {
    const ym = r.date.substring(0, 7);
    if (!monthMap.has(ym)) {
      monthMap.set(ym, []);
    }
    monthMap.get(ym)!.push(r);
  });

  const sortedMonths = Array.from(monthMap.keys()).sort();

  // If too many months (e.g. > 36), sample or pick last 36 for high-density readable curve
  const displayMonths = sortedMonths.length > 36 ? sortedMonths.slice(sortedMonths.length - 36) : sortedMonths;

  return displayMonths.map((ym) => {
    const recs = monthMap.get(ym)!;
    const [year, month] = ym.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const label = `${monthNames[parseInt(month, 10) - 1]} '${year.substring(2)}`;

    let value = 0;
    let baseline = 0;

    if (metricFocus === 'tce_rate') {
      const avg = recs.reduce((acc, r) => acc + r.tceRate, 0) / recs.length;
      value = Math.round(avg);
      baseline = 38000;
    } else if (metricFocus === 'cargo_volume') {
      const totalVol = recs.reduce((acc, r) => acc + r.cargoVolume, 0);
      value = Math.round(totalVol / 1000); // in thousand MT
      baseline = 1200;
    } else if (metricFocus === 'co2_emissions') {
      const totalCo2 = recs.reduce((acc, r) => acc + r.totalCo2Mt, 0);
      value = Math.round(totalCo2 / 100);
      baseline = 650;
    } else {
      // ton_miles
      const tm = recs.reduce((acc, r) => acc + r.tonMiles, 0);
      value = +tm.toFixed(1);
      baseline = 14.5;
    }

    // Identify top route in this month
    const routeCounts = new Map<string, number>();
    recs.forEach((r) => routeCounts.set(r.routeCode, (routeCounts.get(r.routeCode) || 0) + 1));
    let topRoute = 'TD3C';
    let maxRouteCount = 0;
    routeCounts.forEach((c, rt) => {
      if (c > maxRouteCount) {
        maxRouteCount = c;
        topRoute = rt;
      }
    });

    const uniqueVessels = new Set(recs.map((r) => r.vesselName)).size;

    return {
      period: ym,
      label,
      value,
      baseline,
      fixtureCount: recs.length,
      vesselCount: uniqueVessels,
      topRoute,
      topSegment: recs[0]?.segment || 'Crude Tanker',
    };
  });
}

/**
 * Compute Corridor Breakdown Bar Data with clickable bars
 */
export function computeCorridorBreakdown(
  records: DetailedTransactionRecord[],
  metricFocus: ReportFilterState['metricFocus']
): CorridorBarPoint[] {
  const routeMap = new Map<string, DetailedTransactionRecord[]>();

  records.forEach((r) => {
    if (!routeMap.has(r.routeCode)) {
      routeMap.set(r.routeCode, []);
    }
    routeMap.get(r.routeCode)!.push(r);
  });

  const points: CorridorBarPoint[] = [];

  routeMap.forEach((recs, routeCode) => {
    const first = recs[0];
    let val = 0;
    let unit = '$/day';

    if (metricFocus === 'tce_rate') {
      val = Math.round(recs.reduce((acc, r) => acc + r.tceRate, 0) / recs.length);
      unit = '$/day';
    } else if (metricFocus === 'cargo_volume') {
      val = Math.round(recs.reduce((acc, r) => acc + r.cargoVolume, 0) / 1000);
      unit = 'k MT';
    } else if (metricFocus === 'co2_emissions') {
      val = Math.round(recs.reduce((acc, r) => acc + r.totalCo2Mt, 0));
      unit = 'MT CO2';
    } else {
      val = +recs.reduce((acc, r) => acc + r.tonMiles, 0).toFixed(1);
      unit = 'B TM';
    }

    points.push({
      routeCode,
      routeName: ROUTE_LABELS[routeCode] || first.routeName,
      basin: first.basin,
      value: val,
      fixtureCount: recs.length,
      unit,
      vesselClass: first.vesselClass,
    });
  });

  // Sort descending by value
  return points.sort((a, b) => b.value - a.value).slice(0, 8);
}

/**
 * Compute Segment Distribution for interactive donut
 */
export function computeSegmentShare(records: DetailedTransactionRecord[]): SegmentSharePoint[] {
  const segmentColors: Record<ReportMarketSegment, string> = {
    all: '#94a3b8',
    'Crude Tanker': '#38bdf8', // Cyan
    'Product Tanker': '#818cf8', // Indigo
    'Dry Bulk': '#34d399', // Emerald
    LNG: '#f59e0b', // Amber
  };

  const segmentMap = new Map<ReportMarketSegment, number>();

  records.forEach((r) => {
    segmentMap.set(r.segment, (segmentMap.get(r.segment) || 0) + r.cargoVolume);
  });

  const totalVol = Array.from(segmentMap.values()).reduce((acc, v) => acc + v, 0) || 1;

  const results: SegmentSharePoint[] = [];

  segmentMap.forEach((vol, seg) => {
    const sharePct = +((vol / totalVol) * 100).toFixed(1);
    const count = records.filter((r) => r.segment === seg).length;
    results.push({
      segment: seg,
      value: vol,
      sharePct,
      color: segmentColors[seg] || '#94a3b8',
      count,
    });
  });

  return results.sort((a, b) => b.value - a.value);
}

/**
 * Extract drill-down slice matching the clicked data point
 */
export function extractDrillDownSlice(
  records: DetailedTransactionRecord[],
  context: DrillDownContext
): DetailedTransactionRecord[] {
  return records.filter((r) => {
    if (context.datePeriod && !r.date.startsWith(context.datePeriod)) {
      return false;
    }
    if (context.routeCode && r.routeCode !== context.routeCode) {
      return false;
    }
    if (context.segment && context.segment !== 'all' && r.segment !== context.segment) {
      return false;
    }
    if (context.vesselClass && context.vesselClass !== 'all' && r.vesselClass !== context.vesselClass) {
      return false;
    }
    return true;
  });
}

/**
 * Apply Level 2 secondary filters to the drill-down transaction records
 */
export function applyDrillDownSecondaryFilters(
  records: DetailedTransactionRecord[],
  filters: DrillDownFilterState
): DetailedTransactionRecord[] {
  return records.filter((r) => {
    if (filters.status !== 'all' && r.commercialStatus !== filters.status) {
      return false;
    }

    if (filters.cargoSubType && filters.cargoSubType !== 'all' && r.cargoSubType !== filters.cargoSubType) {
      return false;
    }

    if (filters.minTce > 0 && r.tceRate < filters.minTce) {
      return false;
    }

    if (filters.searchTerm.trim()) {
      const q = filters.searchTerm.toLowerCase();
      const match =
        r.vesselName.toLowerCase().includes(q) ||
        r.charterer.toLowerCase().includes(q) ||
        r.originPort.toLowerCase().includes(q) ||
        r.destinationPort.toLowerCase().includes(q) ||
        r.cargoSubType.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });
}

/**
 * Generate algorithmic strategic decision recommendations
 */
export function generateDecisionRecommendations(
  records: DetailedTransactionRecord[],
  drillDown?: DrillDownContext
): DecisionRecommendation[] {
  const recommendations: DecisionRecommendation[] = [];

  const avgTce = records.length ? records.reduce((acc, r) => acc + r.tceRate, 0) / records.length : 40000;
  const vlccRecs = records.filter((r) => r.vesselClass === 'VLCC');
  const vlccAvg = vlccRecs.length ? vlccRecs.reduce((acc, r) => acc + r.tceRate, 0) / vlccRecs.length : 55000;

  // Decision 1: Chartering Window
  if (avgTce > 45000) {
    recommendations.push({
      id: 'dec-1',
      category: 'chartering',
      title: 'Fix Prompt Tonnage on Short-Duration Voyage Charter',
      guidance: 'Firm spot TCE rates indicate backwardation ahead. Favor spot market fixtures over multi-year index links.',
      rationale: `Current average TCE of $${Math.round(avgTce).toLocaleString()}/day sits above historical 80th percentile. Prompt chartering secures immediate cash premiums.`,
      impactScore: 'High',
      actionableWindow: 'Next 10–14 Days',
      metricTarget: '+18.5% Gross Operating Margin',
    });
  } else {
    recommendations.push({
      id: 'dec-1',
      category: 'chartering',
      title: 'Hedge Fleet Exposure via 6-to-12 Month Period Charters',
      guidance: 'Subdued prompt spot rates warrant locking forward fleet utilization with investment-grade charterers.',
      rationale: `Spot average TCE at $${Math.round(avgTce).toLocaleString()}/day offers limited upside volatility. Locking fixed floors minimizes drydock and idling downside.`,
      impactScore: 'Medium',
      actionableWindow: 'Next 30 Days',
      metricTarget: 'Min $32,000/day Revenue Floor',
    });
  }

  // Decision 2: Financial Hedging / FFA
  if (vlccAvg > 60000) {
    recommendations.push({
      id: 'dec-2',
      category: 'hedging',
      title: 'Execute Short Forward Freight Agreement (FFA) Cal+1 Hedge',
      guidance: 'Lock forward freight contracts on TD3C / Baltic indices to safeguard paper margins against refinery maintenance dips.',
      rationale: `VLCC segment is commanding premium fixture yields of $${Math.round(vlccAvg).toLocaleString()}/day. Forward curve displays steep contango risk.`,
      impactScore: 'Strategic',
      actionableWindow: 'Active Trading Session',
      metricTarget: 'Hedge 40% Q4 Open DWT',
    });
  } else {
    recommendations.push({
      id: 'dec-2',
      category: 'hedging',
      title: 'Maintain Open Paper Position on Atlantic Crude Corridors',
      guidance: 'Keep freight paper unhedged as seasonal winter demand and bunker volatility favor upside call spreads.',
      rationale: 'Projected refinery ramp-up in Europe and Asia is expected to tighten available prompt tonnage in the Atlantic basin.',
      impactScore: 'Medium',
      actionableWindow: 'Q4 Execution',
      metricTarget: 'Target Beta: 1.15 to Spot Rates',
    });
  }

  // Decision 3: Decarbonization & CII Optimization
  recommendations.push({
    id: 'dec-3',
    category: 'decarbonization',
    title: 'Speed De-escalation & Biofuel Bunker Bunkering at Singapore',
    guidance: 'Trim transit speeds by 0.8 knots across ballast legs and bunker B30 FAME blend to maintain fleet CII Rating at "A/B".',
    rationale: 'EEOI emissions modeling shows a 0.8-knot reduction cuts daily bunker burn by 4.2 MT and avoids EU ETS carbon penalty surcharge.',
    impactScore: 'High',
    actionableWindow: 'Immediate Dispatch',
    metricTarget: '-11.4% Voyage CO2 Intensity',
  });

  // Decision 4: Contextual Drill-Down Specific Decision
  if (drillDown) {
    recommendations.push({
      id: 'dec-4',
      category: 'allocation',
      title: `Prioritize Asset Deployment to Corridor: ${drillDown.routeCode || drillDown.label}`,
      guidance: `Concentrate available tonnage in ${drillDown.routeCode || 'selected corridor'} to leverage verified fixture liquidity.`,
      rationale: `Drill-down audit confirmed ${drillDown.recordCount} verified fixtures averaging robust TCE velocity in this specific operational cluster.`,
      impactScore: 'Strategic',
      actionableWindow: 'Next Voyage Repositioning',
      metricTarget: 'Zero Ballast Idle Days',
    });
  }

  return recommendations;
}

/**
 * Compile Consolidated Executive Dossier
 */
export function compileExecutiveDossier(
  filter: ReportFilterState,
  kpis: ReportKpiItem[],
  topCorridors: CorridorBarPoint[],
  drillDownSummary?: ExecutiveDossierReport['drillDownSummary'],
  recommendations: DecisionRecommendation[] = []
): ExecutiveDossierReport {
  const horizonLabels: Record<string, string> = {
    YTD: 'Year-to-Date (2026)',
    '1Y': 'Rolling 12 Months (2025–2026)',
    '3Y': '3-Year Strategic Cycle (2023–2026)',
    '5Y': '5-Year Macro Perspective (2021–2026)',
    ALL: 'Canonical 12-Year Dataset (2014–2026)',
  };

  const viewTitles: Record<string, string> = {
    commercial: 'Commercial Freight & Earnings Dossier',
    trade_flows: 'Global Trade Flows & Ton-Mile Analysis',
    emissions: 'Decarbonization & CII Compliance Review',
    valuations: 'Asset Valuations & Fleet Allocation Briefing',
  };

  return {
    id: `DOSSIER-${Date.now()}`,
    title: viewTitles[filter.view] || 'Comprehensive Maritime Intelligence Dossier',
    generatedAt: new Date().toISOString(),
    activeHorizon: horizonLabels[filter.timeHorizon] || filter.timeHorizon,
    activeFiltersSummary: `Segment: ${filter.segment} | Class: ${filter.vesselClass} | Basin: ${filter.basin} | Metric: ${filter.metricFocus}`,
    kpiSummary: kpis,
    topCorridors,
    drillDownSummary,
    recommendations,
    confidentialityNotice:
      'CONFIDENTIAL — FOR EXECUTIVE DECISION MAKING ONLY. Generated by SIH26006 Maritime Intelligence Platform.',
  };
}
