/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Canonical Market Prices Dataset
 *
 * Provides benchmark Baltic Exchange & Signal Ocean aligned datasets:
 * - 12 Industry-standard freight corridors across Tankers (Dirty/Clean), Dry Bulk & Gas
 * - Comprehensive physical Spot TCE rate assessments
 * - FFA Forward Curves across Prompt, M+1..3, Q1..Q4, Cal+1..2 tenors
 * - 60-month historical price trajectories with real seasonal cycles
 * - Analytical market signals & anomalies
 */

import type {
  MaritimeRouteSpec,
  SpotPriceRecord,
  FfaContractRecord,
  HistoricalPricePoint,
  MarketPriceSignal,
} from '../../types/market-prices';

/**
 * 12 Industry Standard Freight Corridors
 */
export const CANONICAL_ROUTES: MaritimeRouteSpec[] = [
  {
    routeCode: 'TD3C',
    routeName: 'Ras Tanura to Ningbo (VLCC Crude)',
    originPort: 'Ras Tanura, Saudi Arabia',
    destinationPort: 'Ningbo, China',
    distanceNm: 6240,
    vesselClass: 'VLCC',
    marketSegment: 'Crude Tanker',
    description: 'Premier global crude benchmark. 270,000 MT Arabian Light cargo via Strait of Malacca.',
    typicalVoyageDays: 28,
    hasFfaContracts: true,
  },
  {
    routeCode: 'TD20',
    routeName: 'Bonny Offshore to Rotterdam (Suezmax Crude)',
    originPort: 'Bonny Offshore, Nigeria',
    destinationPort: 'Rotterdam, Netherlands',
    distanceNm: 4420,
    vesselClass: 'Suezmax',
    marketSegment: 'Crude Tanker',
    description: 'West Africa sweet crude pipeline to Northwest Europe. 130,000 MT parcel.',
    typicalVoyageDays: 19,
    hasFfaContracts: true,
  },
  {
    routeCode: 'TD25',
    routeName: 'Corpus Christi to Rotterdam (Aframax Crude)',
    originPort: 'Corpus Christi, USA',
    destinationPort: 'Rotterdam, Netherlands',
    distanceNm: 5080,
    vesselClass: 'Aframax',
    marketSegment: 'Crude Tanker',
    description: 'US Gulf WTI export corridor to European refining complex. 70,000 MT parcel.',
    typicalVoyageDays: 17,
    hasFfaContracts: true,
  },
  {
    routeCode: 'TD22',
    routeName: 'US Gulf to Ningbo (VLCC Long-Haul Crude)',
    originPort: 'LOOP / Corpus Christi, USA',
    destinationPort: 'Ningbo, China',
    distanceNm: 15400,
    vesselClass: 'VLCC',
    marketSegment: 'Crude Tanker',
    description: 'Ultra long-haul trans-Cape crude arbitrage corridor from Gulf of Mexico to East Asia.',
    typicalVoyageDays: 48,
    hasFfaContracts: true,
  },
  {
    routeCode: 'TC2',
    routeName: 'Rotterdam to New York (MR Clean Gasoline)',
    originPort: 'Rotterdam, Netherlands',
    destinationPort: 'New York, USA',
    distanceNm: 3450,
    vesselClass: 'MR',
    marketSegment: 'Clean Product',
    description: 'Transatlantic clean gasoline trade into US Atlantic Coast (PADD 1). 37,000 MT parcel.',
    typicalVoyageDays: 12,
    hasFfaContracts: true,
  },
  {
    routeCode: 'TC14',
    routeName: 'Houston to Amsterdam (MR Distillates)',
    originPort: 'Houston, USA',
    destinationPort: 'Amsterdam, Netherlands',
    distanceNm: 4950,
    vesselClass: 'MR',
    marketSegment: 'Clean Product',
    description: 'US Gulf diesel & ultra-low sulfur gasoil export to ARA trading hub. 38,000 MT.',
    typicalVoyageDays: 16,
    hasFfaContracts: true,
  },
  {
    routeCode: 'TC5',
    routeName: 'Ras Tanura to Yokohama (LR1 Naphtha)',
    originPort: 'Ras Tanura, Saudi Arabia',
    destinationPort: 'Yokohama, Japan',
    distanceNm: 6600,
    vesselClass: 'LR1',
    marketSegment: 'Clean Product',
    description: 'Middle East petrochemical feedstock supply into East Asian steam crackers. 55,000 MT.',
    typicalVoyageDays: 22,
    hasFfaContracts: true,
  },
  {
    routeCode: 'C5',
    routeName: 'Port Hedland to Qingdao (Capesize Iron Ore)',
    originPort: 'Port Hedland, Australia',
    destinationPort: 'Qingdao, China',
    distanceNm: 3580,
    vesselClass: 'Capesize',
    marketSegment: 'Dry Bulk',
    description: 'Primary global iron ore artery. 160,000 MT Pilbara ore directly to Chinese steel mills.',
    typicalVoyageDays: 13,
    hasFfaContracts: true,
  },
  {
    routeCode: 'C3',
    routeName: 'Tubarao to Qingdao (Capesize Iron Ore)',
    originPort: 'Tubarao, Brazil',
    destinationPort: 'Qingdao, China',
    distanceNm: 11200,
    vesselClass: 'Capesize',
    marketSegment: 'Dry Bulk',
    description: 'Long-haul high-grade Vale iron ore route from Brazil to China via Cape of Good Hope.',
    typicalVoyageDays: 36,
    hasFfaContracts: true,
  },
  {
    routeCode: 'P2A',
    routeName: 'Skaw-Pass Gibraltar to Far East (Panamax Trip)',
    originPort: 'Skaw, Denmark',
    destinationPort: 'Singapore / Far East',
    distanceNm: 9800,
    vesselClass: 'Panamax',
    marketSegment: 'Dry Bulk',
    description: 'Continent / Mediterranean delivery for trip out to East Asia with grain or coal.',
    typicalVoyageDays: 32,
    hasFfaContracts: true,
  },
  {
    routeCode: 'S10',
    routeName: 'South China / Indonesia Round Voyage (Supramax)',
    originPort: 'Guangzhou, China',
    destinationPort: 'Samarinda, Indonesia',
    distanceNm: 2200,
    vesselClass: 'Supramax',
    marketSegment: 'Dry Bulk',
    description: 'Regional coal shuttle from East Kalimantan to Southern Chinese power utilities.',
    typicalVoyageDays: 10,
    hasFfaContracts: true,
  },
  {
    routeCode: 'BLNG1g',
    routeName: 'Gladstone to Tokyo (LNG 160k cbm)',
    originPort: 'Gladstone, Australia',
    destinationPort: 'Tokyo, Japan',
    distanceNm: 3950,
    vesselClass: 'LNG Carrier',
    marketSegment: 'LNG',
    description: 'Pacific LNG basin trade between Curtis Island liquefaction trains and Tokyo Bay.',
    typicalVoyageDays: 11,
    hasFfaContracts: true,
  },
];

/**
 * Physical Spot Freight Prices
 */
export const CANONICAL_SPOT_PRICES: SpotPriceRecord[] = [
  {
    routeCode: 'TD3C',
    routeName: 'Ras Tanura to Ningbo',
    originPort: 'Ras Tanura, Saudi Arabia',
    destinationPort: 'Ningbo, China',
    distanceNm: 6240,
    vesselClass: 'VLCC',
    marketSegment: 'Crude Tanker',
    region: 'Middle East',
    cargoType: 'Arabian Light Crude',
    rateTceUsdPerDay: 48500,
    rateWorldscaleOrPerMt: 64.5,
    rateUnit: '$/day',
    change1dUsd: +2150,
    change1dPct: +4.64,
    change7dPct: +8.90,
    change30dPct: +18.40,
    high52wUsd: 78200,
    low52wUsd: 22400,
    lastFixtureDate: '13 Sep 2026',
    marketStatus: 'Firm',
    sparkline7d: [44200, 44800, 45600, 46100, 47000, 47800, 48500],
  },
  {
    routeCode: 'TD20',
    routeName: 'Bonny Offshore to Rotterdam',
    originPort: 'Bonny Offshore, Nigeria',
    destinationPort: 'Rotterdam, Netherlands',
    distanceNm: 4420,
    vesselClass: 'Suezmax',
    marketSegment: 'Crude Tanker',
    region: 'Atlantic',
    cargoType: 'Bonny Light Crude',
    rateTceUsdPerDay: 39200,
    rateWorldscaleOrPerMt: 88.0,
    rateUnit: '$/day',
    change1dUsd: -450,
    change1dPct: -1.13,
    change7dPct: +3.20,
    change30dPct: +7.80,
    high52wUsd: 54000,
    low52wUsd: 19500,
    lastFixtureDate: '12 Sep 2026',
    marketStatus: 'Steady',
    sparkline7d: [38000, 38400, 38900, 39500, 39800, 39650, 39200],
  },
  {
    routeCode: 'TD25',
    routeName: 'Corpus Christi to Rotterdam',
    originPort: 'Corpus Christi, USA',
    destinationPort: 'Rotterdam, Netherlands',
    distanceNm: 5080,
    vesselClass: 'Aframax',
    marketSegment: 'Crude Tanker',
    region: 'Americas',
    cargoType: 'WTI Midland Crude',
    rateTceUsdPerDay: 43600,
    rateWorldscaleOrPerMt: 142.5,
    rateUnit: '$/day',
    change1dUsd: +1800,
    change1dPct: +4.31,
    change7dPct: +12.40,
    change30dPct: +24.10,
    high52wUsd: 62000,
    low52wUsd: 21000,
    lastFixtureDate: '13 Sep 2026',
    marketStatus: 'Firm',
    sparkline7d: [38800, 39500, 40700, 41200, 42100, 42900, 43600],
  },
  {
    routeCode: 'TD22',
    routeName: 'US Gulf to Ningbo',
    originPort: 'Corpus Christi, USA',
    destinationPort: 'Ningbo, China',
    distanceNm: 15400,
    vesselClass: 'VLCC',
    marketSegment: 'Crude Tanker',
    region: 'Americas',
    cargoType: 'WTI Midland Crude',
    rateTceUsdPerDay: 52400,
    rateWorldscaleOrPerMt: 8.85,
    rateUnit: '$/day',
    change1dUsd: +950,
    change1dPct: +1.85,
    change7dPct: +6.50,
    change30dPct: +15.30,
    high52wUsd: 84000,
    low52wUsd: 28000,
    lastFixtureDate: '11 Sep 2026',
    marketStatus: 'Firm',
    sparkline7d: [49200, 49800, 50600, 51100, 51800, 52100, 52400],
  },
  {
    routeCode: 'TC2',
    routeName: 'Rotterdam to New York',
    originPort: 'Rotterdam, Netherlands',
    destinationPort: 'New York, USA',
    distanceNm: 3450,
    vesselClass: 'MR',
    marketSegment: 'Clean Product',
    region: 'Atlantic',
    cargoType: 'Clean Gasoline',
    rateTceUsdPerDay: 26800,
    rateWorldscaleOrPerMt: 165.0,
    rateUnit: '$/day',
    change1dUsd: -300,
    change1dPct: -1.11,
    change7dPct: -2.40,
    change30dPct: +5.20,
    high52wUsd: 42000,
    low52wUsd: 14000,
    lastFixtureDate: '12 Sep 2026',
    marketStatus: 'Softening',
    sparkline7d: [27500, 27400, 27200, 27100, 26950, 26900, 26800],
  },
  {
    routeCode: 'TC14',
    routeName: 'Houston to Amsterdam',
    originPort: 'Houston, USA',
    destinationPort: 'Amsterdam, Netherlands',
    distanceNm: 4950,
    vesselClass: 'MR',
    marketSegment: 'Clean Product',
    region: 'Americas',
    cargoType: 'Ultra-Low Sulfur Diesel',
    rateTceUsdPerDay: 28400,
    rateWorldscaleOrPerMt: 152.0,
    rateUnit: '$/day',
    change1dUsd: +600,
    change1dPct: +2.16,
    change7dPct: +4.80,
    change30dPct: +9.40,
    high52wUsd: 45000,
    low52wUsd: 16500,
    lastFixtureDate: '13 Sep 2026',
    marketStatus: 'Steady',
    sparkline7d: [27100, 27350, 27600, 27800, 28100, 28250, 28400],
  },
  {
    routeCode: 'TC5',
    routeName: 'Ras Tanura to Yokohama',
    originPort: 'Ras Tanura, Saudi Arabia',
    destinationPort: 'Yokohama, Japan',
    distanceNm: 6600,
    vesselClass: 'LR1',
    marketSegment: 'Clean Product',
    region: 'Middle East',
    cargoType: 'Naphtha Feedstock',
    rateTceUsdPerDay: 33500,
    rateWorldscaleOrPerMt: 148.0,
    rateUnit: '$/day',
    change1dUsd: +850,
    change1dPct: +2.60,
    change7dPct: +5.30,
    change30dPct: +11.80,
    high52wUsd: 51000,
    low52wUsd: 18000,
    lastFixtureDate: '12 Sep 2026',
    marketStatus: 'Steady',
    sparkline7d: [31800, 32100, 32450, 32800, 33100, 33300, 33500],
  },
  {
    routeCode: 'C5',
    routeName: 'Port Hedland to Qingdao',
    originPort: 'Port Hedland, Australia',
    destinationPort: 'Qingdao, China',
    distanceNm: 3580,
    vesselClass: 'Capesize',
    marketSegment: 'Dry Bulk',
    region: 'Pacific',
    cargoType: 'Iron Ore Fines',
    rateTceUsdPerDay: 29800,
    rateWorldscaleOrPerMt: 10.45,
    rateUnit: '$/day',
    change1dUsd: +1200,
    change1dPct: +4.20,
    change7dPct: +14.20,
    change30dPct: +32.40,
    high52wUsd: 48000,
    low52wUsd: 11500,
    lastFixtureDate: '13 Sep 2026',
    marketStatus: 'Volatile',
    sparkline7d: [26100, 26800, 27500, 28200, 28900, 29400, 29800],
  },
  {
    routeCode: 'C3',
    routeName: 'Tubarao to Qingdao',
    originPort: 'Tubarao, Brazil',
    destinationPort: 'Qingdao, China',
    distanceNm: 11200,
    vesselClass: 'Capesize',
    marketSegment: 'Dry Bulk',
    region: 'Atlantic',
    cargoType: 'Carajas Iron Ore',
    rateTceUsdPerDay: 31500,
    rateWorldscaleOrPerMt: 25.80,
    rateUnit: '$/day',
    change1dUsd: +900,
    change1dPct: +2.94,
    change7dPct: +11.80,
    change30dPct: +28.50,
    high52wUsd: 52000,
    low52wUsd: 13000,
    lastFixtureDate: '12 Sep 2026',
    marketStatus: 'Firm',
    sparkline7d: [28200, 28900, 29500, 30100, 30800, 31200, 31500],
  },
  {
    routeCode: 'P2A',
    routeName: 'Skaw-Pass Gib to Far East',
    originPort: 'Skaw, Denmark',
    destinationPort: 'Far East',
    distanceNm: 9800,
    vesselClass: 'Panamax',
    marketSegment: 'Dry Bulk',
    region: 'Atlantic',
    cargoType: 'Grain / Agricultural',
    rateTceUsdPerDay: 19400,
    rateWorldscaleOrPerMt: 19400,
    rateUnit: '$/day',
    change1dUsd: -150,
    change1dPct: -0.77,
    change7dPct: +1.60,
    change30dPct: +6.40,
    high52wUsd: 31000,
    low52wUsd: 9500,
    lastFixtureDate: '11 Sep 2026',
    marketStatus: 'Steady',
    sparkline7d: [19100, 19250, 19400, 19550, 19600, 19500, 19400],
  },
  {
    routeCode: 'S10',
    routeName: 'South China / Indo Round Trip',
    originPort: 'Guangzhou, China',
    destinationPort: 'Samarinda, Indonesia',
    distanceNm: 2200,
    vesselClass: 'Supramax',
    marketSegment: 'Dry Bulk',
    region: 'Pacific',
    cargoType: 'Thermal Coal',
    rateTceUsdPerDay: 16800,
    rateWorldscaleOrPerMt: 16800,
    rateUnit: '$/day',
    change1dUsd: +350,
    change1dPct: +2.13,
    change7dPct: +4.20,
    change30dPct: +8.50,
    high52wUsd: 26500,
    low52wUsd: 8200,
    lastFixtureDate: '13 Sep 2026',
    marketStatus: 'Steady',
    sparkline7d: [16100, 16300, 16450, 16600, 16700, 16750, 16800],
  },
  {
    routeCode: 'BLNG1g',
    routeName: 'Gladstone to Tokyo',
    originPort: 'Gladstone, Australia',
    destinationPort: 'Tokyo, Japan',
    distanceNm: 3950,
    vesselClass: 'LNG Carrier',
    marketSegment: 'LNG',
    region: 'Pacific',
    cargoType: 'Liquefied Natural Gas',
    rateTceUsdPerDay: 78500,
    rateWorldscaleOrPerMt: 78500,
    rateUnit: '$/day',
    change1dUsd: +4500,
    change1dPct: +6.08,
    change7dPct: +16.80,
    change30dPct: +38.50,
    high52wUsd: 145000,
    low52wUsd: 38000,
    lastFixtureDate: '13 Sep 2026',
    marketStatus: 'Volatile',
    sparkline7d: [67200, 69500, 71800, 74200, 76100, 77500, 78500],
  },
];

/**
 * FFA Contract Matrix across 10 forward tenor periods for each route
 */
const TENOR_CONFIGS = [
  { tenor: 'PROMPT', label: 'Oct 2026', settlement: '2026-10-31', factor: 1.035 },
  { tenor: 'M+1', label: 'Nov 2026', settlement: '2026-11-30', factor: 1.072 },
  { tenor: 'M+2', label: 'Dec 2026', settlement: '2026-12-31', factor: 1.108 },
  { tenor: 'M+3', label: 'Jan 2027', settlement: '2027-01-31', factor: 1.085 },
  { tenor: 'Q1', label: 'Q1 2027', settlement: '2027-03-31', factor: 0.942 },
  { tenor: 'Q2', label: 'Q2 2027', settlement: '2027-06-30', factor: 0.895 },
  { tenor: 'Q3', label: 'Q3 2027', settlement: '2027-09-30', factor: 0.965 },
  { tenor: 'Q4', label: 'Q4 2027', settlement: '2027-12-31', factor: 1.120 },
  { tenor: 'CAL_NEXT', label: 'Cal 2027', settlement: '2027-12-31', factor: 0.985 },
  { tenor: 'CAL_NEXT2', label: 'Cal 2028', settlement: '2028-12-31', factor: 0.950 },
] as const;

export const CANONICAL_FFA_CONTRACTS: FfaContractRecord[] = CANONICAL_SPOT_PRICES.flatMap((spot) => {
  return TENOR_CONFIGS.map((t, idx) => {
    // Determine forward shape depending on market sector
    let customFactor: number = t.factor;
    // Capesize seasonality has extreme winter peak
    if (spot.marketSegment === 'Dry Bulk') {
      if (t.tenor === 'Q1') customFactor = 0.78; // Q1 dry bulk wet season dip
      else if (t.tenor === 'Q4') customFactor = 1.22;
    }
    // LNG has extreme winter heating premium
    if (spot.marketSegment === 'LNG') {
      if (t.tenor === 'M+2' || t.tenor === 'M+3') customFactor = 1.35;
      else if (t.tenor === 'Q2') customFactor = 0.65;
    }

    const mid = Math.round((spot.rateTceUsdPerDay * customFactor) / 50) * 50;
    const halfSpread = Math.max(150, Math.round(mid * 0.012));
    const bid = mid - halfSpread;
    const ask = mid + halfSpread;
    const changePct = Math.round((Math.sin(idx + spot.routeCode.length) * 3.5) * 10) / 10;
    const changeUsd = Math.round(mid * (changePct / 100));
    const volume = Math.max(10, Math.round(180 / (idx + 1) + (spot.rateTceUsdPerDay / 2000)));
    const openInterest = volume * Math.round(4 + idx * 1.5);

    // 5-point mini historical trend
    const historical = [
      { date: '01 Sep', mid: Math.round(mid * 0.96) },
      { date: '04 Sep', mid: Math.round(mid * 0.975) },
      { date: '07 Sep', mid: Math.round(mid * 0.988) },
      { date: '10 Sep', mid: Math.round(mid * 0.995) },
      { date: '13 Sep', mid: mid },
    ];

    return {
      id: `ffa-${spot.routeCode}-${t.tenor}`,
      routeCode: spot.routeCode,
      vesselClass: spot.vesselClass,
      tenor: t.tenor,
      tenorLabel: t.label,
      settlementDate: t.settlement,
      bidPriceUsdPerDay: bid,
      askPriceUsdPerDay: ask,
      midPriceUsdPerDay: mid,
      change1dUsd: changeUsd,
      change1dPct: changePct,
      volumeLots: volume,
      openInterestLots: openInterest,
      historicalMidPoints: historical,
    };
  });
});

/**
 * 60-Month Historical Price Trajectory Generator for each Route (2021 - 2026)
 */
function buildHistoricalSeriesForRoute(route: SpotPriceRecord): HistoricalPricePoint[] {
  const points: HistoricalPricePoint[] = [];
  const startYear = 2021;
  const endYear = 2026;
  const currentMonth = 9; // Sep 2026

  for (let y = startYear; y <= endYear; y++) {
    const maxM = y === endYear ? currentMonth : 12;
    for (let m = 1; m <= maxM; m++) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateLabel = `${monthNames[m - 1]} ${y}`;
      const timestamp = new Date(y, m - 1, 1).getTime();

      // Cyclical macro waveform
      let macroFactor = 1.0;
      if (y === 2021) macroFactor = 0.72 + (m / 12) * 0.18;
      else if (y === 2022) macroFactor = 1.25 + Math.sin(m / 2) * 0.22; // Ukraine war disruption & freight spike
      else if (y === 2023) macroFactor = 0.88 + (m / 12) * 0.08;
      else if (y === 2024) macroFactor = 0.95 + (m / 12) * 0.12; // Red Sea rerouting around Cape
      else if (y === 2025) macroFactor = 1.08 + Math.sin(m) * 0.09;
      else if (y === 2026) macroFactor = 1.00 + (m / 9) * 0.10;

      // Seasonal wave (Q4 winter peak for tankers/gas, summer/autumn for bulkers)
      const seasonal = route.marketSegment === 'Dry Bulk'
        ? Math.sin(((m - 3) / 12) * 2 * Math.PI) * 0.18
        : Math.sin(((m - 8) / 12) * 2 * Math.PI) * 0.22;

      const spot = Math.round(route.rateTceUsdPerDay * macroFactor * (1 + seasonal) / 100) * 100;
      // Front month FFA tracks spot with typical forward basis divergence
      const ffaBasis = Math.sin(m + y) * 0.045 + (m >= 9 ? 0.05 : -0.03);
      const ffa = Math.round((spot * (1 + ffaBasis)) / 100) * 100;
      const spreadUsd = spot - ffa;
      const spreadPct = spot > 0 ? Math.round(((spot - ffa) / spot) * 1000) / 10 : 0;
      const volume = Math.round(400 + Math.abs(Math.sin(m)) * 600);

      points.push({
        date: dateLabel,
        timestamp,
        spotRateUsdPerDay: spot,
        ffaFrontMonthUsdPerDay: ffa,
        spreadUsdPerDay: spreadUsd,
        spreadPct,
        volumeLots: volume,
      });
    }
  }

  return points;
}

export const CANONICAL_HISTORICAL_SERIES: Record<string, HistoricalPricePoint[]> = Object.fromEntries(
  CANONICAL_SPOT_PRICES.map((spot) => [spot.routeCode, buildHistoricalSeriesForRoute(spot)])
);

/**
 * Analytical Market Signals & Trading Alerts
 */
export const CANONICAL_MARKET_SIGNALS: MarketPriceSignal[] = [
  {
    id: 'sig-01',
    routeCode: 'TD3C',
    vesselClass: 'VLCC',
    title: 'TD3C Winter Forward Curve Contango Widens (+11.8%)',
    severity: 'HIGH',
    category: 'ffa_divergence',
    description: 'Q4 2026 FFA contracts trading at $54,200/day, representing an $5,700/day premium over physical spot. Traders pricing heavy November Middle East chartering volumes.',
    timestamp: '13 Sep 2026 16:45 UTC',
  },
  {
    id: 'sig-02',
    routeCode: 'C5',
    vesselClass: 'Capesize',
    title: 'Capesize West Australia Spot Breakout (+14.2% 7D)',
    severity: 'HIGH',
    category: 'spot_breakout',
    description: 'C5 freight rates jumped past $10.45/MT ($29,800/day) as Rio Tinto and BHP absorbed 14 prompt vessels in a single 48-hour fixture window.',
    timestamp: '13 Sep 2026 14:20 UTC',
  },
  {
    id: 'sig-03',
    routeCode: 'TD25',
    vesselClass: 'Aframax',
    title: 'US Gulf Aframax Rates Hit 6-Month High ($43,600/day)',
    severity: 'MEDIUM',
    category: 'historical_extremum',
    description: 'Weather delays in the Sabine Pass channel combined with firm transatlantic export demand compressed prompt tonnage availability in the US Gulf.',
    timestamp: '13 Sep 2026 11:30 UTC',
  },
  {
    id: 'sig-04',
    routeCode: 'TC2',
    vesselClass: 'MR',
    title: 'Transatlantic Clean Backwardation Warning (-2.4% 7D)',
    severity: 'LOW',
    category: 'ffa_divergence',
    description: 'TC2 spot rates softening to $26,800/day with M+1 forward contracts discounted by $1,400/day as European refinery turnaround season begins.',
    timestamp: '12 Sep 2026 17:15 UTC',
  },
  {
    id: 'sig-05',
    routeCode: 'BLNG1g',
    vesselClass: 'LNG Carrier',
    title: 'Pacific LNG Volatility Spike (30D Volatility: 42.6%)',
    severity: 'HIGH',
    category: 'volatility_spike',
    description: 'BLNG1g rates surged to $78,500/day (+38.5% over 30 days) amid early North Asian winter storage procurement programs.',
    timestamp: '12 Sep 2026 09:00 UTC',
  },
];
