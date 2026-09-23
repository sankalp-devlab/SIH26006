/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 14: Freight Analytics & Market Intelligence Data Service
 */

import { vesselsService } from '../api/vessels.service';
import type { Vessel } from '../../types/vessel';
import type {
  FreightMarketSummary,
  VesselSupplyBreakdown,
  RegionalSupplyItem,
  SegmentSupplyItem,
  HistoricalSupplyPoint,
  FreightRateBenchmark,
  FFACurveItem,
  SpotFFASpread,
  MarketDriverFactor,
  FreightForecastPoint,
  FreightComparisonResult,
  FreightFilterState
} from '../../types/freight-analytics';
import { FreightAnalyticsEngine } from './freight-analytics-engine';

export class FreightAnalyticsService {
  /**
   * Deterministic benchmark freight corridors matching Baltic Exchange standards.
   */
  private static readonly BENCHMARK_ROUTES: FreightRateBenchmark[] = [
    {
      id: 'route-c5',
      route_code: 'C5',
      route_name: 'West Australia → Qingdao (Iron Ore)',
      commodity: 'Iron Ore (Bulk)',
      origin_port: 'Port Hedland, Australia',
      destination_port: 'Qingdao, China',
      distance_nm: 3580,
      vessel_class: 'Capesize',
      segment: 'dry_bulk',
      region: 'pacific',
      rate_value: 9.65,
      rate_basis: 'per_mt',
      rate_currency: 'USD',
      change_1d_pct: 2.12,
      change_30d_pct: 8.45,
      high_52w: 14.80,
      low_52w: 7.20,
      sparkline_30d: [8.85, 8.90, 8.75, 8.95, 9.10, 9.05, 9.20, 9.15, 9.35, 9.40, 9.30, 9.50, 9.45, 9.60, 9.65],
      historical_series: [
        { date: '2026-08-12', rate: 8.85, volume_kt: 4200, observed: true },
        { date: '2026-08-19', rate: 8.95, volume_kt: 4450, observed: true },
        { date: '2026-08-26', rate: 9.20, volume_kt: 4600, observed: true },
        { date: '2026-09-02', rate: 9.45, volume_kt: 4800, observed: true },
        { date: '2026-09-09', rate: 9.65, volume_kt: 5100, observed: true }
      ],
      last_fixture_date: '2026-09-10'
    },
    {
      id: 'route-c3',
      route_code: 'C3',
      route_name: 'Tubarao → Qingdao (Iron Ore)',
      commodity: 'Iron Ore (Bulk)',
      origin_port: 'Tubarao, Brazil',
      destination_port: 'Qingdao, China',
      distance_nm: 11200,
      vessel_class: 'Capesize',
      segment: 'dry_bulk',
      region: 'atlantic',
      rate_value: 24.80,
      rate_basis: 'per_mt',
      rate_currency: 'USD',
      change_1d_pct: -0.85,
      change_30d_pct: 4.20,
      high_52w: 31.50,
      low_52w: 18.60,
      sparkline_30d: [23.8, 23.9, 24.1, 24.0, 24.3, 24.5, 24.6, 24.4, 24.7, 24.9, 25.1, 25.0, 24.9, 24.85, 24.80],
      historical_series: [
        { date: '2026-08-12', rate: 23.80, volume_kt: 3100, observed: true },
        { date: '2026-08-19', rate: 24.10, volume_kt: 3250, observed: true },
        { date: '2026-08-26', rate: 24.50, volume_kt: 3400, observed: true },
        { date: '2026-09-02', rate: 25.00, volume_kt: 3300, observed: true },
        { date: '2026-09-09', rate: 24.80, volume_kt: 3500, observed: true }
      ],
      last_fixture_date: '2026-09-09'
    },
    {
      id: 'route-p1a',
      route_code: 'P1A',
      route_name: 'Transpacific Round Voyage (Grains/Coal)',
      commodity: 'Grains & Agri-bulk',
      origin_port: 'Vancouver, Canada',
      destination_port: 'Yokohama, Japan',
      distance_nm: 4250,
      vessel_class: 'Panamax',
      segment: 'dry_bulk',
      region: 'pacific',
      rate_value: 16400,
      rate_basis: 'per_day_tce',
      rate_currency: 'USD',
      change_1d_pct: 3.45,
      change_30d_pct: 12.80,
      high_52w: 22500,
      low_52w: 11200,
      sparkline_30d: [14500, 14700, 14900, 15100, 15000, 15300, 15600, 15800, 16000, 16150, 16300, 16400],
      historical_series: [
        { date: '2026-08-12', rate: 14500, volume_kt: 1800, observed: true },
        { date: '2026-08-19', rate: 14900, volume_kt: 1950, observed: true },
        { date: '2026-08-26', rate: 15300, volume_kt: 2050, observed: true },
        { date: '2026-09-02', rate: 16000, volume_kt: 2200, observed: true },
        { date: '2026-09-09', rate: 16400, volume_kt: 2300, observed: true }
      ],
      last_fixture_date: '2026-09-10'
    },
    {
      id: 'route-td3c',
      route_code: 'TD3C',
      route_name: 'Ras Tanura → Ningbo (Crude VLCC)',
      commodity: 'Arab Light Crude',
      origin_port: 'Ras Tanura, Saudi Arabia',
      destination_port: 'Ningbo, China',
      distance_nm: 6150,
      vessel_class: 'VLCC',
      segment: 'tanker',
      region: 'middle_east_gulf',
      rate_value: 49200,
      rate_basis: 'per_day_tce',
      rate_currency: 'USD',
      change_1d_pct: 1.65,
      change_30d_pct: 15.40,
      high_52w: 68000,
      low_52w: 26500,
      sparkline_30d: [42500, 43000, 44200, 45000, 46100, 45800, 47000, 48200, 48900, 49200],
      historical_series: [
        { date: '2026-08-12', rate: 42500, volume_kt: 6200, observed: true },
        { date: '2026-08-19', rate: 44200, volume_kt: 6400, observed: true },
        { date: '2026-08-26', rate: 46100, volume_kt: 6700, observed: true },
        { date: '2026-09-02', rate: 48200, volume_kt: 6900, observed: true },
        { date: '2026-09-09', rate: 49200, volume_kt: 7200, observed: true }
      ],
      last_fixture_date: '2026-09-11'
    },
    {
      id: 'route-td20',
      route_code: 'TD20',
      route_name: 'West Africa → Rotterdam (Suezmax Crude)',
      commodity: 'Bonny Light Crude',
      origin_port: 'Bonny Offshore, Nigeria',
      destination_port: 'Rotterdam, Netherlands',
      distance_nm: 4450,
      vessel_class: 'Suezmax',
      segment: 'tanker',
      region: 'atlantic',
      rate_value: 34800,
      rate_basis: 'per_day_tce',
      rate_currency: 'USD',
      change_1d_pct: -1.15,
      change_30d_pct: 6.80,
      high_52w: 48500,
      low_52w: 21000,
      sparkline_30d: [32500, 32900, 33400, 34100, 34500, 35200, 35000, 34800],
      historical_series: [
        { date: '2026-08-12', rate: 32500, volume_kt: 2400, observed: true },
        { date: '2026-08-19', rate: 33400, volume_kt: 2550, observed: true },
        { date: '2026-08-26', rate: 34500, volume_kt: 2650, observed: true },
        { date: '2026-09-02', rate: 35200, volume_kt: 2600, observed: true },
        { date: '2026-09-09', rate: 34800, volume_kt: 2700, observed: true }
      ],
      last_fixture_date: '2026-09-08'
    },
    {
      id: 'route-tc2',
      route_code: 'TC2',
      route_name: 'Rotterdam → New York (Clean Products)',
      commodity: 'Gasoline / Naphtha',
      origin_port: 'Rotterdam, Netherlands',
      destination_port: 'New York, USA',
      distance_nm: 3420,
      vessel_class: 'MR Tanker',
      segment: 'tanker',
      region: 'atlantic',
      rate_value: 23600,
      rate_basis: 'per_day_tce',
      rate_currency: 'USD',
      change_1d_pct: 0.90,
      change_30d_pct: -3.20,
      high_52w: 36000,
      low_52w: 16500,
      sparkline_30d: [24400, 24100, 23900, 23500, 23200, 23400, 23600],
      historical_series: [
        { date: '2026-08-12', rate: 24400, volume_kt: 1100, observed: true },
        { date: '2026-08-19', rate: 23900, volume_kt: 1150, observed: true },
        { date: '2026-08-26', rate: 23200, volume_kt: 1120, observed: true },
        { date: '2026-09-02', rate: 23400, volume_kt: 1180, observed: true },
        { date: '2026-09-09', rate: 23600, volume_kt: 1210, observed: true }
      ],
      last_fixture_date: '2026-09-10'
    },
    {
      id: 'route-fe-eu',
      route_code: 'FE-EU',
      route_name: 'Shanghai → Rotterdam (Container Loop)',
      commodity: 'Manufactured Freight & Goods',
      origin_port: 'Shanghai, China',
      destination_port: 'Rotterdam, Netherlands',
      distance_nm: 10520,
      vessel_class: 'Ultra Large Container',
      segment: 'container',
      region: 'pacific',
      rate_value: 4850,
      rate_basis: 'lumpsum',
      rate_currency: 'USD',
      change_1d_pct: 1.45,
      change_30d_pct: 21.30,
      high_52w: 6800,
      low_52w: 2400,
      sparkline_30d: [4000, 4120, 4250, 4400, 4580, 4700, 4800, 4850],
      historical_series: [
        { date: '2026-08-12', rate: 4000, volume_kt: 1450, observed: true },
        { date: '2026-08-19', rate: 4250, volume_kt: 1520, observed: true },
        { date: '2026-08-26', rate: 4580, volume_kt: 1600, observed: true },
        { date: '2026-09-02', rate: 4700, volume_kt: 1620, observed: true },
        { date: '2026-09-09', rate: 4850, volume_kt: 1680, observed: true }
      ],
      last_fixture_date: '2026-09-11'
    }
  ];

  /**
   * Forward Freight Agreements (FFA) forward curve data.
   */
  private static readonly FFA_CURVES: FFACurveItem[] = [
    {
      id: 'ffa-c5-prompt',
      contract_period: 'Prompt (M0)',
      route_code: 'C5',
      vessel_class: 'Capesize',
      forward_rate_usd: 9.85,
      spot_equivalent_usd: 9.65,
      spread_usd: 0.20,
      spread_pct: 2.07,
      market_structure: 'contango',
      open_interest_lots: 12450,
      settlement_date: '2026-09-30',
      historical_curve: [
        { date: '2026-09-01', forward_rate: 9.50, spot_rate: 9.40 },
        { date: '2026-09-05', forward_rate: 9.70, spot_rate: 9.55 },
        { date: '2026-09-10', forward_rate: 9.85, spot_rate: 9.65 }
      ]
    },
    {
      id: 'ffa-c5-m1',
      contract_period: 'M+1',
      route_code: 'C5',
      vessel_class: 'Capesize',
      forward_rate_usd: 10.15,
      spot_equivalent_usd: 9.65,
      spread_usd: 0.50,
      spread_pct: 5.18,
      market_structure: 'contango',
      open_interest_lots: 18200,
      settlement_date: '2026-10-31',
      historical_curve: [
        { date: '2026-09-01', forward_rate: 9.80, spot_rate: 9.40 },
        { date: '2026-09-05', forward_rate: 9.95, spot_rate: 9.55 },
        { date: '2026-09-10', forward_rate: 10.15, spot_rate: 9.65 }
      ]
    },
    {
      id: 'ffa-c5-q1',
      contract_period: 'Q1',
      route_code: 'C5',
      vessel_class: 'Capesize',
      forward_rate_usd: 10.60,
      spot_equivalent_usd: 9.65,
      spread_usd: 0.95,
      spread_pct: 9.84,
      market_structure: 'contango',
      open_interest_lots: 24300,
      settlement_date: '2027-03-31',
      historical_curve: [
        { date: '2026-09-01', forward_rate: 10.20, spot_rate: 9.40 },
        { date: '2026-09-05', forward_rate: 10.40, spot_rate: 9.55 },
        { date: '2026-09-10', forward_rate: 10.60, spot_rate: 9.65 }
      ]
    },
    {
      id: 'ffa-td3c-prompt',
      contract_period: 'Prompt (M0)',
      route_code: 'TD3C',
      vessel_class: 'VLCC',
      forward_rate_usd: 51200,
      spot_equivalent_usd: 49200,
      spread_usd: 2000,
      spread_pct: 4.07,
      market_structure: 'contango',
      open_interest_lots: 8900,
      settlement_date: '2026-09-30',
      historical_curve: [
        { date: '2026-09-01', forward_rate: 48000, spot_rate: 46500 },
        { date: '2026-09-05', forward_rate: 49800, spot_rate: 48000 },
        { date: '2026-09-10', forward_rate: 51200, spot_rate: 49200 }
      ]
    },
    {
      id: 'ffa-td3c-m1',
      contract_period: 'M+1',
      route_code: 'TD3C',
      vessel_class: 'VLCC',
      forward_rate_usd: 53800,
      spot_equivalent_usd: 49200,
      spread_usd: 4600,
      spread_pct: 9.35,
      market_structure: 'contango',
      open_interest_lots: 14200,
      settlement_date: '2026-10-31',
      historical_curve: [
        { date: '2026-09-01', forward_rate: 50500, spot_rate: 46500 },
        { date: '2026-09-05', forward_rate: 52000, spot_rate: 48000 },
        { date: '2026-09-10', forward_rate: 53800, spot_rate: 49200 }
      ]
    },
    {
      id: 'ffa-p1a-prompt',
      contract_period: 'Prompt (M0)',
      route_code: 'P1A',
      vessel_class: 'Panamax',
      forward_rate_usd: 16100,
      spot_equivalent_usd: 16400,
      spread_usd: -300,
      spread_pct: -1.83,
      market_structure: 'backwardation',
      open_interest_lots: 9400,
      settlement_date: '2026-09-30',
      historical_curve: [
        { date: '2026-09-01', forward_rate: 15800, spot_rate: 15400 },
        { date: '2026-09-05', forward_rate: 16000, spot_rate: 16100 },
        { date: '2026-09-10', forward_rate: 16100, spot_rate: 16400 }
      ]
    },
    {
      id: 'ffa-c5-cal1',
      contract_period: 'Cal+1',
      route_code: 'C5',
      vessel_class: 'Capesize',
      forward_rate_usd: 10.90,
      spot_equivalent_usd: 9.65,
      spread_usd: 1.25,
      spread_pct: 12.95,
      market_structure: 'contango',
      open_interest_lots: 31000,
      settlement_date: '2027-12-31',
      historical_curve: [
        { date: '2026-09-01', forward_rate: 10.50, spot_rate: 9.40 },
        { date: '2026-09-05', forward_rate: 10.75, spot_rate: 9.55 },
        { date: '2026-09-10', forward_rate: 10.90, spot_rate: 9.65 }
      ]
    }
  ];

  /**
   * Geopolitical, canal, and port market driver factors.
   */
  private static readonly MARKET_DRIVERS: MarketDriverFactor[] = [
    {
      id: 'driver-suez-diversion',
      name: 'Bab-el-Mandeb & Red Sea Security Diversions',
      category: 'canal',
      location: 'Suez Canal / Cape of Good Hope',
      impact_level: 'CRITICAL',
      description: 'Over 82% of Asia-Europe container and tanker tonnage rerouted around Cape of Good Hope, adding 12–15 sailing days.',
      affected_routes: ['FE-EU', 'TC2', 'TD3C'],
      affected_vessel_classes: ['Ultra Large Container', 'Suezmax', 'Aframax', 'MR Tanker'],
      delay_impact_days: 14.2,
      freight_premium_pct: 32.5,
      ton_mile_expansion_pct: 28.4,
      last_status_update: 'Active alert renewed September 2026'
    },
    {
      id: 'driver-panama-draft',
      name: 'Panama Canal Freshwater Draft Restrictions',
      category: 'canal',
      location: 'Gatun Lake / Panama Canal',
      impact_level: 'HIGH',
      description: 'Neopanamax maximum allowable transit draft set at 44.0 feet due to reservoir recovery controls.',
      affected_routes: ['P1A', 'S4A'],
      affected_vessel_classes: ['Panamax', 'Supramax', 'Neopanamax'],
      delay_impact_days: 6.8,
      freight_premium_pct: 18.2,
      ton_mile_expansion_pct: 14.1,
      last_status_update: 'Scheduled auction slots active'
    },
    {
      id: 'driver-ningbo-congestion',
      name: 'Ningbo-Zhoushan & Qingdao Anchorage Density',
      category: 'port_congestion',
      location: 'East China Sea / Yellow Sea',
      impact_level: 'HIGH',
      description: 'Seasonal typhoons and intense iron ore discharge volumes cause 94 Capesizes waiting at anchor.',
      affected_routes: ['C5', 'C3', 'TD3C'],
      affected_vessel_classes: ['Capesize', 'VLCC', 'Panamax'],
      delay_impact_days: 4.8,
      freight_premium_pct: 12.0,
      ton_mile_expansion_pct: 6.5,
      last_status_update: 'Average wait currently 88.5 hours'
    },
    {
      id: 'driver-port-hedland-tidal',
      name: 'Port Hedland Tidal Outload Queue',
      category: 'port_congestion',
      location: 'Pilbara, Western Australia',
      impact_level: 'MODERATE',
      description: 'Tidal channel draft constraints synchronize loaded departures with high-water cycles.',
      affected_routes: ['C5'],
      affected_vessel_classes: ['Capesize'],
      delay_impact_days: 2.1,
      freight_premium_pct: 4.5,
      ton_mile_expansion_pct: 2.8,
      last_status_update: 'Harbour master tidal schedule in force'
    },
    {
      id: 'driver-rotterdam-bunkering',
      name: 'Rotterdam OPL Bunker Barge Traffic Density',
      category: 'port_congestion',
      location: 'Rotterdam Maasvlakte',
      impact_level: 'LOW',
      description: 'Minor waiting periods for VLSFO/Biofuel blend bunkering barges along Calandkanaal.',
      affected_routes: ['TC2', 'TD20', 'FE-EU'],
      affected_vessel_classes: ['MR Tanker', 'Suezmax', 'Ultra Large Container'],
      delay_impact_days: 0.8,
      freight_premium_pct: 1.2,
      ton_mile_expansion_pct: 0.5,
      last_status_update: 'Bunker replenishment smooth'
    }
  ];

  /**
   * Fetch live vessels or utilize domain baseline to calculate fleet supply balance.
   */
  public static async getVesselSupply(_filter?: FreightFilterState): Promise<VesselSupplyBreakdown> {
    let fleet: Vessel[] = [];
    try {
      const resp = await vesselsService.getVessels(100);
      if (resp && Array.isArray(resp.vessels)) {
        fleet = resp.vessels;
      }
    } catch {
      // Graceful fallback to default fleet count
    }

    const totalVessels = fleet.length > 0 ? fleet.length : 12450;
    const baseDwt = fleet.length > 0
      ? fleet.reduce((acc, v) => acc + (v.capacity_tons || 65000), 0)
      : 842000000;

    // Segment classification
    const ladenCount = Math.round(totalVessels * 0.54);
    const ladenDwt = Math.round(baseDwt * 0.58);

    const ballastCount = Math.round(totalVessels * 0.28);
    const ballastDwt = Math.round(baseDwt * 0.26);

    const waitingCount = Math.round(totalVessels * 0.12);
    const waitingDwt = Math.round(baseDwt * 0.11);

    const inactiveCount = totalVessels - ladenCount - ballastCount - waitingCount;
    const inactiveDwt = baseDwt - ladenDwt - ballastDwt - waitingDwt;

    const utilization = FreightAnalyticsEngine.computeSupplyUtilization(
      ladenCount,
      ballastCount,
      waitingCount,
      inactiveCount
    );

    // Regional Supply distribution
    const regional: RegionalSupplyItem[] = [
      {
        region_id: 'pacific',
        region_name: 'Pacific Basin (China / Australia / Japan)',
        vessel_count: Math.round(totalVessels * 0.44),
        supply_dwt: Math.round(baseDwt * 0.46),
        share_pct: 46.0,
        ballast_count: Math.round(ballastCount * 0.48),
        laden_count: Math.round(ladenCount * 0.43),
        waiting_count: Math.round(waitingCount * 0.52),
        avg_congestion_pct: 64,
        trend_pct: 2.8,
        key_ports: ['Qingdao', 'Port Hedland', 'Shanghai', 'Ningbo', 'Newcastle'],
        primary_routes: ['C5', 'P1A', 'FE-EU']
      },
      {
        region_id: 'atlantic',
        region_name: 'Atlantic Basin (US Gulf / Brazil / North Sea)',
        vessel_count: Math.round(totalVessels * 0.26),
        supply_dwt: Math.round(baseDwt * 0.27),
        share_pct: 27.0,
        ballast_count: Math.round(ballastCount * 0.24),
        laden_count: Math.round(ladenCount * 0.27),
        waiting_count: Math.round(waitingCount * 0.22),
        avg_congestion_pct: 42,
        trend_pct: -1.2,
        key_ports: ['Tubarao', 'Houston', 'Rotterdam', 'New Orleans', 'Antwerp'],
        primary_routes: ['C3', 'TD20', 'TC2']
      },
      {
        region_id: 'middle_east_gulf',
        region_name: 'Middle East Gulf & Arabian Sea',
        vessel_count: Math.round(totalVessels * 0.16),
        supply_dwt: Math.round(baseDwt * 0.17),
        share_pct: 17.0,
        ballast_count: Math.round(ballastCount * 0.16),
        laden_count: Math.round(ladenCount * 0.18),
        waiting_count: Math.round(waitingCount * 0.14),
        avg_congestion_pct: 38,
        trend_pct: 4.1,
        key_ports: ['Ras Tanura', 'Fujairah', 'Jebel Ali', 'Mina Al Ahmadi'],
        primary_routes: ['TD3C']
      },
      {
        region_id: 'mediterranean',
        region_name: 'Mediterranean & Black Sea',
        vessel_count: Math.round(totalVessels * 0.09),
        supply_dwt: Math.round(baseDwt * 0.07),
        share_pct: 7.0,
        ballast_count: Math.round(ballastCount * 0.08),
        laden_count: Math.round(ladenCount * 0.08),
        waiting_count: Math.round(waitingCount * 0.08),
        avg_congestion_pct: 49,
        trend_pct: 0.5,
        key_ports: ['Piraeus', 'Genoa', 'Port Said', 'Novorossiysk'],
        primary_routes: ['P2A']
      },
      {
        region_id: 'indian_ocean',
        region_name: 'Indian Ocean & Southeast Asia',
        vessel_count: Math.round(totalVessels * 0.05),
        supply_dwt: Math.round(baseDwt * 0.03),
        share_pct: 3.0,
        ballast_count: Math.round(ballastCount * 0.04),
        laden_count: Math.round(ladenCount * 0.04),
        waiting_count: Math.round(waitingCount * 0.04),
        avg_congestion_pct: 34,
        trend_pct: 1.1,
        key_ports: ['Singapore', 'Port Klang', 'JNPT Mumbai', 'Colombo'],
        primary_routes: ['FE-EU', 'TC2']
      }
    ];

    // Segment Supply distribution
    const segment: SegmentSupplyItem[] = [
      {
        segment: 'Dry Bulk',
        vessel_class: 'Capesize',
        vessel_count: Math.round(totalVessels * 0.16),
        total_dwt: Math.round(baseDwt * 0.34),
        share_pct: 34.0,
        avg_daily_earnings_usd: 28400,
        open_next_10d: 48,
        trend_pct: 3.5
      },
      {
        segment: 'Dry Bulk',
        vessel_class: 'Panamax / Kamsarmax',
        vessel_count: Math.round(totalVessels * 0.24),
        total_dwt: Math.round(baseDwt * 0.22),
        share_pct: 22.0,
        avg_daily_earnings_usd: 16400,
        open_next_10d: 92,
        trend_pct: 4.8
      },
      {
        segment: 'Dry Bulk',
        vessel_class: 'Supramax / Ultramax',
        vessel_count: Math.round(totalVessels * 0.22),
        total_dwt: Math.round(baseDwt * 0.16),
        share_pct: 16.0,
        avg_daily_earnings_usd: 15200,
        open_next_10d: 84,
        trend_pct: 1.2
      },
      {
        segment: 'Tanker',
        vessel_class: 'VLCC',
        vessel_count: Math.round(totalVessels * 0.08),
        total_dwt: Math.round(baseDwt * 0.18),
        share_pct: 18.0,
        avg_daily_earnings_usd: 49200,
        open_next_10d: 22,
        trend_pct: 2.1
      },
      {
        segment: 'Tanker',
        vessel_class: 'Suezmax / Aframax',
        vessel_count: Math.round(totalVessels * 0.18),
        total_dwt: Math.round(baseDwt * 0.10),
        share_pct: 10.0,
        avg_daily_earnings_usd: 34800,
        open_next_10d: 54,
        trend_pct: -0.9
      }
    ];

    // Historical Supply Time Series (6 months)
    const historicalTrend: HistoricalSupplyPoint[] = [
      { date: '2026-04-01', total_supply_dwt: baseDwt * 0.94, active_supply_dwt: baseDwt * 0.76, ballast_supply_dwt: baseDwt * 0.24, waiting_supply_dwt: baseDwt * 0.08, vessel_count: Math.round(totalVessels * 0.94) },
      { date: '2026-05-01', total_supply_dwt: baseDwt * 0.96, active_supply_dwt: baseDwt * 0.78, ballast_supply_dwt: baseDwt * 0.25, waiting_supply_dwt: baseDwt * 0.09, vessel_count: Math.round(totalVessels * 0.96) },
      { date: '2026-06-01', total_supply_dwt: baseDwt * 0.97, active_supply_dwt: baseDwt * 0.79, ballast_supply_dwt: baseDwt * 0.25, waiting_supply_dwt: baseDwt * 0.10, vessel_count: Math.round(totalVessels * 0.97) },
      { date: '2026-07-01', total_supply_dwt: baseDwt * 0.98, active_supply_dwt: baseDwt * 0.81, ballast_supply_dwt: baseDwt * 0.26, waiting_supply_dwt: baseDwt * 0.11, vessel_count: Math.round(totalVessels * 0.98) },
      { date: '2026-08-01', total_supply_dwt: baseDwt * 0.99, active_supply_dwt: baseDwt * 0.82, ballast_supply_dwt: baseDwt * 0.26, waiting_supply_dwt: baseDwt * 0.11, vessel_count: Math.round(totalVessels * 0.99) },
      { date: '2026-09-01', total_supply_dwt: baseDwt, active_supply_dwt: baseDwt * 0.84, ballast_supply_dwt: baseDwt * 0.26, waiting_supply_dwt: baseDwt * 0.11, vessel_count: totalVessels }
    ];

    return {
      total_vessels: totalVessels,
      total_dwt_mt: baseDwt,
      laden_operating_count: ladenCount,
      laden_operating_dwt: ladenDwt,
      ballast_open_count: ballastCount,
      ballast_open_dwt: ballastDwt,
      waiting_anchorage_count: waitingCount,
      waiting_anchorage_dwt: waitingDwt,
      inactive_drydock_count: inactiveCount,
      inactive_drydock_dwt: inactiveDwt,
      supply_utilization_pct: utilization,
      regional_distribution: regional,
      segment_distribution: segment,
      historical_trend: historicalTrend
    };
  }

  /**
   * Fetch benchmark freight rates filtered by user query and segments.
   */
  public static async getFreightRates(filter?: FreightFilterState): Promise<FreightRateBenchmark[]> {
    let routes = [...this.BENCHMARK_ROUTES];

    if (!filter) return routes;

    if (filter.segment && filter.segment !== 'all') {
      routes = routes.filter(r => r.segment === filter.segment);
    }
    if (filter.region && filter.region !== 'all') {
      routes = routes.filter(r => r.region === filter.region);
    }
    if (filter.rateBasis && filter.rateBasis !== 'all') {
      routes = routes.filter(r => r.rate_basis === filter.rateBasis);
    }
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      routes = routes.filter(r => 
        r.route_code.toLowerCase().includes(q) ||
        r.route_name.toLowerCase().includes(q) ||
        r.commodity.toLowerCase().includes(q) ||
        r.origin_port.toLowerCase().includes(q) ||
        r.destination_port.toLowerCase().includes(q) ||
        r.vessel_class.toLowerCase().includes(q)
      );
    }

    return routes;
  }

  /**
   * Fetch FFA curves.
   */
  public static async getFFACurves(routeCode?: string): Promise<FFACurveItem[]> {
    if (!routeCode || routeCode === 'all') {
      return [...this.FFA_CURVES];
    }
    return this.FFA_CURVES.filter(c => c.route_code.toLowerCase() === routeCode.toLowerCase());
  }

  /**
   * Fetch Spot vs FFA spreads across benchmarks.
   */
  public static async getSpotFFASpreads(): Promise<SpotFFASpread[]> {
    const rates = this.BENCHMARK_ROUTES;
    const ffas = this.FFA_CURVES;
    return FreightAnalyticsEngine.computeSpotFFASpreads(rates, ffas);
  }

  /**
   * Fetch market drivers.
   */
  public static async getMarketDrivers(): Promise<MarketDriverFactor[]> {
    return [...this.MARKET_DRIVERS];
  }

  /**
   * Compute comprehensive market summary.
   */
  public static async getMarketSummary(filter?: FreightFilterState): Promise<FreightMarketSummary> {
    const supply = await this.getVesselSupply(filter);
    const rates = await this.getFreightRates(filter);
    const ffas = await this.getFFACurves();
    const drivers = await this.getMarketDrivers();

    return FreightAnalyticsEngine.calculateMarketSummary(supply, rates, ffas, drivers);
  }

  /**
   * Generate forecast projections for a route.
   */
  public static async getForecast(routeCode: string): Promise<FreightForecastPoint[]> {
    const benchmark = this.BENCHMARK_ROUTES.find(r => r.route_code.toLowerCase() === routeCode.toLowerCase()) || this.BENCHMARK_ROUTES[0];
    const drivers = this.MARKET_DRIVERS.filter(d => d.affected_routes.includes(benchmark.route_code));
    const chokepointDelay = drivers.reduce((acc, d) => acc + d.delay_impact_days, 0);

    return FreightAnalyticsEngine.generateForecastProjections(
      benchmark,
      benchmark.change_30d_pct,
      chokepointDelay
    );
  }

  /**
   * Multi-entity comparison.
   */
  public static async getComparison(
    type: 'route' | 'region' | 'vessel_class' | 'spot_vs_ffa',
    idA: string,
    idB: string
  ): Promise<FreightComparisonResult> {
    if (type === 'route') {
      const rA = this.BENCHMARK_ROUTES.find(r => r.route_code.toLowerCase() === idA.toLowerCase()) || this.BENCHMARK_ROUTES[0];
      const rB = this.BENCHMARK_ROUTES.find(r => r.route_code.toLowerCase() === idB.toLowerCase()) || this.BENCHMARK_ROUTES[1];

      return FreightAnalyticsEngine.compareEntities(
        'route',
        {
          label: `${rA.route_code} (${rA.origin_port.split(',')[0]} → ${rA.destination_port.split(',')[0]})`,
          metrics: {
            freight_rate: rA.rate_value,
            daily_change_pct: rA.change_1d_pct,
            monthly_change_pct: rA.change_30d_pct,
            distance_nm: rA.distance_nm,
            rate_spread_vs_52w_high: rA.high_52w - rA.rate_value
          }
        },
        {
          label: `${rB.route_code} (${rB.origin_port.split(',')[0]} → ${rB.destination_port.split(',')[0]})`,
          metrics: {
            freight_rate: rB.rate_value,
            daily_change_pct: rB.change_1d_pct,
            monthly_change_pct: rB.change_30d_pct,
            distance_nm: rB.distance_nm,
            rate_spread_vs_52w_high: rB.high_52w - rB.rate_value
          }
        }
      );
    }

    if (type === 'spot_vs_ffa') {
      const route = this.BENCHMARK_ROUTES.find(r => r.route_code.toLowerCase() === idA.toLowerCase()) || this.BENCHMARK_ROUTES[0];
      const ffa = this.FFA_CURVES.find(f => f.route_code.toLowerCase() === route.route_code.toLowerCase()) || this.FFA_CURVES[0];

      return FreightAnalyticsEngine.compareEntities(
        'spot_vs_ffa',
        {
          label: `${route.route_code} Physical Spot`,
          metrics: {
            rate_value: route.rate_value,
            change_30d_pct: route.change_30d_pct,
            liquidity_lots: 18500
          }
        },
        {
          label: `${ffa.route_code} ${ffa.contract_period} FFA Derivative`,
          metrics: {
            rate_value: ffa.forward_rate_usd,
            change_30d_pct: ffa.spread_pct,
            liquidity_lots: ffa.open_interest_lots
          }
        }
      );
    }

    // Fallback region comparison
    const supply = await this.getVesselSupply();
    const regA = supply.regional_distribution.find(r => r.region_id === idA) || supply.regional_distribution[0];
    const regB = supply.regional_distribution.find(r => r.region_id === idB) || supply.regional_distribution[1];

    return FreightAnalyticsEngine.compareEntities(
      'region',
      {
        label: regA.region_name,
        metrics: {
          vessel_count: regA.vessel_count,
          supply_dwt: regA.supply_dwt,
          ballast_count: regA.ballast_count,
          waiting_count: regA.waiting_count,
          avg_congestion_pct: regA.avg_congestion_pct
        }
      },
      {
        label: regB.region_name,
        metrics: {
          vessel_count: regB.vessel_count,
          supply_dwt: regB.supply_dwt,
          ballast_count: regB.ballast_count,
          waiting_count: regB.waiting_count,
          avg_congestion_pct: regB.avg_congestion_pct
        }
      }
    );
  }
}
