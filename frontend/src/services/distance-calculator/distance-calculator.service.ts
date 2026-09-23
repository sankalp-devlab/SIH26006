/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 12: Distance Calculator Service & Workbook Persistence
 */

import type {
  DistanceCalculationRecord,
  DistanceCalculationWorkbook,
  DistanceCalculationResult,
} from '../../types/distance-calculator';
import type { VoyageCalculationRecord, VoyageLegItem } from '../../types/voyage-calculator';
import { VoyageCalculatorService } from '../voyage-calculator/voyage-calculator.service';
import type { Vessel } from '../../types/vessel';

const STORAGE_KEY = 'sih26006_distance_calculations_v1';

export const SEED_DISTANCE_CALCULATIONS: DistanceCalculationRecord[] = [
  {
    id: 'dist-calc-001',
    title: 'Ras Tanura to Rotterdam (Suez Canal Transit)',
    created_at: '2026-09-10T10:00:00Z',
    updated_at: '2026-09-11T12:00:00Z',
    mode: 'port_to_port',
    origin_port_id: 105, // Ras Tanura
    destination_port_id: 106, // Rotterdam
    speed_knots: 14.0,
    weather_margin_pct: 5,
    departure_time: '2026-09-15T08:00:00Z',
    route_preference: 'shortest',
    avoid_piracy: false,
    allow_suez: true,
    allow_panama: false,
    allow_kiel: false,
    enforce_seca_routing: true,
    custom_waypoints: [],
    is_distance_manual: false,
  },
  {
    id: 'dist-calc-002',
    title: 'Houston to Shanghai (Panama Canal Corridor)',
    created_at: '2026-09-10T14:30:00Z',
    updated_at: '2026-09-11T14:30:00Z',
    mode: 'port_to_port',
    origin_port_id: 104, // Houston / Mundra
    destination_port_id: 107, // Shanghai
    speed_knots: 13.5,
    weather_margin_pct: 7,
    departure_time: '2026-09-18T12:00:00Z',
    route_preference: 'shortest',
    avoid_piracy: false,
    allow_suez: false,
    allow_panama: true,
    allow_kiel: false,
    enforce_seca_routing: true,
    custom_waypoints: [],
    is_distance_manual: false,
  },
  {
    id: 'dist-calc-003',
    title: 'Singapore to Rotterdam via Cape of Good Hope',
    created_at: '2026-09-11T09:15:00Z',
    updated_at: '2026-09-11T16:00:00Z',
    mode: 'port_to_port',
    origin_port_id: 101, // Singapore
    destination_port_id: 106, // Rotterdam
    speed_knots: 14.5,
    weather_margin_pct: 8,
    departure_time: '2026-09-20T06:00:00Z',
    route_preference: 'avoid_piracy',
    avoid_piracy: true,
    allow_suez: false,
    allow_panama: false,
    allow_kiel: false,
    enforce_seca_routing: true,
    custom_waypoints: [],
    is_distance_manual: false,
  },
];

export class DistanceCalculatorService {
  /**
   * Retrieves the workbook from localStorage or initializes with seed calculations
   */
  public static getWorkbook(): DistanceCalculationWorkbook {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DistanceCalculationWorkbook;
        if (parsed && Array.isArray(parsed.calculations) && parsed.calculations.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore JSON parse errors and return fallback seed
    }

    const initialWorkbook: DistanceCalculationWorkbook = {
      active_id: SEED_DISTANCE_CALCULATIONS[0].id,
      calculations: SEED_DISTANCE_CALCULATIONS,
    };
    this.saveWorkbook(initialWorkbook);
    return initialWorkbook;
  }

  /**
   * Saves the entire workbook to localStorage
   */
  public static saveWorkbook(workbook: DistanceCalculationWorkbook): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workbook));
    } catch (e) {
      console.error('Failed to save distance workbook to localStorage', e);
    }
  }

  /**
   * Retrieves the currently active calculation record
   */
  public static getActiveCalculation(): DistanceCalculationRecord {
    const wb = this.getWorkbook();
    const active = wb.calculations.find((c) => c.id === wb.active_id);
    return active || wb.calculations[0];
  }

  /**
   * Saves or updates a calculation record in the workbook
   */
  public static saveCalculation(calc: DistanceCalculationRecord): void {
    const wb = this.getWorkbook();
    const index = wb.calculations.findIndex((c) => c.id === calc.id);
    const updated = { ...calc, updated_at: new Date().toISOString() };

    if (index >= 0) {
      wb.calculations[index] = updated;
    } else {
      wb.calculations.push(updated);
    }
    wb.active_id = updated.id;
    this.saveWorkbook(wb);
  }

  /**
   * Duplicates an existing calculation
   */
  public static duplicateCalculation(id: string): DistanceCalculationRecord {
    const wb = this.getWorkbook();
    const target = wb.calculations.find((c) => c.id === id) || wb.calculations[0];

    const newRecord: DistanceCalculationRecord = {
      ...JSON.parse(JSON.stringify(target)),
      id: `dist-calc-${Date.now()}`,
      title: `${target.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    wb.calculations.unshift(newRecord);
    wb.active_id = newRecord.id;
    this.saveWorkbook(wb);
    return newRecord;
  }

  /**
   * Deletes a calculation from the workbook
   */
  public static deleteCalculation(id: string): void {
    const wb = this.getWorkbook();
    wb.calculations = wb.calculations.filter((c) => c.id !== id);
    if (wb.calculations.length === 0) {
      wb.calculations = SEED_DISTANCE_CALCULATIONS;
    }
    if (wb.active_id === id) {
      wb.active_id = wb.calculations[0].id;
    }
    this.saveWorkbook(wb);
  }

  /**
   * Converts a Distance Calculator result into a Module 11 Voyage Calculator record
   * and saves it to Module 11's workbook storage so the user can transition seamlessly!
   */
  public static exportToVoyageCalculation(
    result: DistanceCalculationResult,
    record: DistanceCalculationRecord,
    vessel?: Vessel | null
  ): string {
    // Convert route legs into Module 11 VoyageLegItem[]
    const voyageLegs: VoyageLegItem[] = result.legs.map((leg, idx) => ({
      id: `leg-from-dist-${idx + 1}`,
      sequence: idx + 1,
      leg_type: idx === 0 ? 'ballast' : 'laden',
      origin_port_id: parseInt(result.points[idx]?.id.replace(/\D/g, '') || '0', 10) || idx + 1,
      origin_port_name: leg.from_name,
      origin_country: leg.from_name.includes(',') ? leg.from_name.split(',')[1]?.trim() || 'Unknown' : 'Unknown',
      origin_lat: 0,
      origin_lng: 0,
      destination_port_id: parseInt(result.points[idx + 1]?.id.replace(/\D/g, '') || '0', 10) || idx + 2,
      destination_port_name: leg.to_name,
      destination_country: leg.to_name.includes(',') ? leg.to_name.split(',')[1]?.trim() || 'Unknown' : 'Unknown',
      destination_lat: 0,
      destination_lng: 0,
      distance_nm: leg.distance_nm,
      is_distance_manual: leg.is_distance_manual,
      auto_distance_nm: leg.auto_distance_nm,
      speed_knots: record.speed_knots,
      is_seca: leg.is_seca,
      fuel_type: 'VLSFO',
      canal: leg.from_name.includes('Suez') || leg.to_name.includes('Suez')
        ? 'suez'
        : leg.from_name.includes('Panama') || leg.to_name.includes('Panama')
        ? 'panama'
        : 'none',
      canal_cost: leg.from_name.includes('Suez') ? 320000 : leg.from_name.includes('Panama') ? 260000 : 0,
      weather_margin_pct: record.weather_margin_pct,
    }));

    const newVoyageId = `voy-calc-${Date.now()}`;
    const newVoyageCalc: VoyageCalculationRecord = {
      id: newVoyageId,
      workbook_id: 'wb-02',
      name: `Voyage from ${record.title}`,
      mode: 'dry',
      vessel_id: vessel?.id || record.vessel_id || 1,
      vessel_name: vessel?.name || 'Starlight Carrier',
      vessel_type: vessel?.vessel_type || 'Bulk Carrier',
      vessel_dwt: vessel?.capacity_tons || 75000,
      speed_laden_knots: record.speed_knots,
      speed_ballast_knots: record.speed_knots,
      fuel_laden_mt_day: vessel?.fuel_laden_mt_day || 28.5,
      fuel_ballast_mt_day: vessel?.fuel_ballast_mt_day || 24.0,
      fuel_port_idle_mt_day: 3.5,
      fuel_port_working_mt_day: 5.0,
      daily_hire_usd: 18500,
      ballast_bonus_usd: 0,
      weather_margin_pct: record.weather_margin_pct,
      cargoes: [
        {
          id: 'cargo-1',
          name: 'Aggregated Industrial Cargo',
          commodity: 'Iron Ore',
          quantity_mt: Math.round((vessel?.capacity_tons || 75000) * 0.9),
          freight_rate: 28.5,
          freight_rate_type: 'per_mt',
          currency: 'USD',
          commission_pct: 3.75,
          load_port_id: parseInt(result.points[0]?.id.replace(/\D/g, '') || '1', 10) || 1,
          load_port_name: result.points[0]?.name || 'Origin Port',
          load_rate_mt_day: 15000,
          discharge_port_id: parseInt(result.points[result.points.length - 1]?.id.replace(/\D/g, '') || '2', 10) || 2,
          discharge_port_name: result.points[result.points.length - 1]?.name || 'Destination Port',
          discharge_rate_mt_day: 12000,
        },
      ],
      legs: voyageLegs,
      fuel_prices: {
        vlsfo_usd_mt: 620,
        mgo_usd_mt: 850,
        lsmgo_usd_mt: 880,
        hfo_usd_mt: 510,
        lng_usd_mt: 740,
      },
      port_costs: {},
      extra_costs: [{ id: 'misc-1', name: 'Other Expenses', amount: 45000 }],
      emissions_config: {
        eu_ets_enabled: true,
        eu_ets_price_eur_mt: 75,
        eur_usd_rate: 1.08,
        eu_ets_scope_pct: 100,
        co2_factor_vlsfo: 3.114,
        co2_factor_mgo: 3.206,
        co2_factor_lsmgo: 3.206,
        co2_factor_hfo: 3.114,
        co2_factor_lng: 2.75,
      },
      scenarios: [
        {
          id: 'sc-opt',
          name: 'Optimistic',
          type: 'optimistic',
          description: 'High freight (+10%), lower bunkers (-5%), faster speed (+1 knot)',
          overrides: { freight_rate_multiplier: 1.1, fuel_price_multiplier: 0.95, speed_knots_delta: 1 },
        },
        {
          id: 'sc-pess',
          name: 'Pessimistic',
          type: 'pessimistic',
          description: 'Lower freight (-10%), higher bunkers (+15%), port delays (+2 days)',
          overrides: { freight_rate_multiplier: 0.9, fuel_price_multiplier: 1.15, speed_knots_delta: -1, port_delay_days: 2 },
        },
      ],
      notes: `Generated from Distance Calculator analysis ${record.id}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store in Module 11's workbook
    try {
      const storedWorkbooks = VoyageCalculatorService.getStoredWorkbooks();
      if (storedWorkbooks.length > 0) {
        newVoyageCalc.workbook_id = storedWorkbooks[0].id;
        storedWorkbooks[0].voyages.unshift(newVoyageCalc);
        storedWorkbooks[0].active_voyage_id = newVoyageId;
        VoyageCalculatorService.saveAllWorkbooks(storedWorkbooks);
      }
    } catch (e) {
      console.error('Failed to export to Voyage Calculator', e);
    }

    return newVoyageId;
  }

  /**
   * Generates and downloads a CSV export of the distance calculation recap
   */
  public static exportToCsv(
    result: DistanceCalculationResult,
    record: DistanceCalculationRecord
  ): void {
    const lines: string[] = [];

    lines.push(`SIH 26006 MARITIME DISTANCE CALCULATOR - ROUTE RECAP`);
    lines.push(`Title,${record.title}`);
    lines.push(`Routing Mode,${record.mode}`);
    lines.push(`Speed (Knots),${record.speed_knots}`);
    lines.push(`Weather Margin,${record.weather_margin_pct}%`);
    lines.push(`Departure Time,${record.departure_time}`);
    lines.push(`Estimated Arrival (ETA),${result.estimated_arrival_time}`);
    lines.push(`Total Distance (NM),${result.total_distance_nm}`);
    lines.push(`SECA Distance (NM),${result.seca_distance_nm}`);
    lines.push(`Non-SECA Distance (NM),${result.non_seca_distance_nm}`);
    lines.push(`Adjusted Sea Days,${result.adjusted_sea_days}`);
    lines.push(`Total Fuel Burn (MT),${result.fuel_implications.total_fuel_mt}`);
    lines.push(`Total Fuel Cost (USD),$${result.fuel_implications.total_fuel_cost_usd}`);
    lines.push(`Total CO2 (MT),${result.emission_implications.co2_total_mt}`);
    lines.push(``);
    lines.push(`ORDERED ROUTING POINTS`);
    lines.push(`Seq,Name,Category,Latitude,Longitude,Leg Distance (NM),Cumulative Distance (NM),SECA`);

    result.points.forEach((pt, idx) => {
      lines.push(
        `${idx + 1},"${pt.name}",${pt.category},${pt.latitude.toFixed(4)},${pt.longitude.toFixed(
          4
        )},${pt.leg_distance_nm},${pt.cumulative_distance_nm},${pt.is_seca ? 'YES' : 'NO'}`
      );
    });

    lines.push(``);
    lines.push(`ROUTE LEGS SUMMARY`);
    lines.push(`Leg,From,To,Distance (NM),SECA,Fuel Type,Sea Days,Fuel Burn (MT),CO2 (MT)`);
    result.legs.forEach((leg) => {
      lines.push(
        `${leg.leg_number},"${leg.from_name}","${leg.to_name}",${leg.distance_nm},${
          leg.is_seca ? 'YES' : 'NO'
        },${leg.fuel_type},${leg.sea_days},${leg.fuel_burn_mt},${leg.co2_emissions_mt}`
      );
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.map((e) => e).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `route_recap_${record.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
