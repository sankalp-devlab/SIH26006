/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Voyage Calculator Service & Persistence Layer
 */

import type {
  VoyageCalculationRecord,
  VoyageWorkbook,
  VoyageEconomicsResult,
} from '../../types/voyage-calculator';

const STORAGE_KEY = 'sih26006_voyage_workbooks_v1';

export class VoyageCalculatorService {
  /**
   * Generates realistic initial workbooks for tanker and dry bulk charters
   */
  private static getSeedWorkbooks(): VoyageWorkbook[] {
    const tankerVoyage: VoyageCalculationRecord = {
      id: 'vc-tanker-01',
      workbook_id: 'wb-01',
      name: 'West Africa to Europe Suezmax Crude Run',
      mode: 'tanker',
      vessel_id: 202,
      vessel_name: 'NORDIC TITAN',
      vessel_type: 'Suezmax Crude Tanker',
      vessel_dwt: 158000,
      speed_laden_knots: 13.0,
      speed_ballast_knots: 14.0,
      fuel_laden_mt_day: 42.0,
      fuel_ballast_mt_day: 36.0,
      fuel_port_idle_mt_day: 4.5,
      fuel_port_working_mt_day: 8.5,
      daily_hire_usd: 0, // Owned vessel
      ballast_bonus_usd: 75000,
      weather_margin_pct: 5.0,
      cargoes: [
        {
          id: 'cg-01',
          name: 'Parcel 1: Escravos Light Crude',
          commodity: 'Escravos Light Crude Oil',
          quantity_mt: 135000,
          freight_rate: 16.8,
          freight_rate_type: 'per_mt',
          currency: 'USD',
          commission_pct: 2.5,
          load_port_id: 110,
          load_port_name: 'Escravos Terminal',
          load_rate_mt_day: 65000,
          discharge_port_id: 101,
          discharge_port_name: 'Rotterdam Port',
          discharge_rate_mt_day: 55000,
        },
      ],
      legs: [
        {
          id: 'leg-01',
          sequence: 1,
          leg_type: 'ballast',
          origin_port_id: 103,
          origin_port_name: 'Gibraltar Anchorage',
          origin_country: 'Gibraltar',
          origin_lat: 36.14,
          origin_lng: -5.35,
          destination_port_id: 110,
          destination_port_name: 'Escravos Terminal',
          destination_country: 'Nigeria',
          destination_lat: 5.61,
          destination_lng: 5.16,
          distance_nm: 2980,
          is_distance_manual: false,
          auto_distance_nm: 2980,
          speed_knots: 14.0,
          is_seca: false,
          fuel_type: 'VLSFO',
          canal: 'none',
          canal_cost: 0,
          weather_margin_pct: 5.0,
        },
        {
          id: 'leg-02',
          sequence: 2,
          leg_type: 'laden',
          origin_port_id: 110,
          origin_port_name: 'Escravos Terminal',
          origin_country: 'Nigeria',
          origin_lat: 5.61,
          origin_lng: 5.16,
          destination_port_id: 112,
          destination_port_name: 'English Channel Waypoint',
          destination_country: 'United Kingdom',
          destination_lat: 49.9,
          destination_lng: -3.5,
          distance_nm: 3820,
          is_distance_manual: false,
          auto_distance_nm: 3820,
          speed_knots: 13.0,
          is_seca: false,
          fuel_type: 'VLSFO',
          canal: 'none',
          canal_cost: 0,
          weather_margin_pct: 5.0,
        },
        {
          id: 'leg-03',
          sequence: 3,
          leg_type: 'laden',
          origin_port_id: 112,
          origin_port_name: 'English Channel Waypoint',
          origin_country: 'United Kingdom',
          origin_lat: 49.9,
          destination_port_id: 101,
          origin_lng: -3.5,
          destination_port_name: 'Rotterdam Port',
          destination_country: 'Netherlands',
          destination_lat: 51.95,
          destination_lng: 4.13,
          distance_nm: 360,
          is_distance_manual: false,
          auto_distance_nm: 360,
          speed_knots: 12.0,
          is_seca: true, // SECA Area!
          fuel_type: 'LSMGO',
          canal: 'none',
          canal_cost: 0,
          weather_margin_pct: 5.0,
        },
      ],
      fuel_prices: {
        vlsfo_usd_mt: 620,
        mgo_usd_mt: 850,
        lsmgo_usd_mt: 880,
        hfo_usd_mt: 510,
        lng_usd_mt: 740,
      },
      port_costs: {
        110: 42000,
        101: 68000,
      },
      extra_costs: [
        { id: 'ec-1', name: 'West Africa Security Escort', amount: 35000 },
        { id: 'ec-2', name: 'Agency & Slop Disposal', amount: 14000 },
      ],
      emissions_config: {
        eu_ets_enabled: true,
        eu_ets_price_eur_mt: 75,
        eur_usd_rate: 1.08,
        eu_ets_scope_pct: 50, // 50% for voyages starting outside EU and arriving at EU
        co2_factor_vlsfo: 3.114,
        co2_factor_mgo: 3.206,
        co2_factor_lsmgo: 3.206,
        co2_factor_hfo: 3.114,
        co2_factor_lng: 2.75,
      },
      scenarios: [
        {
          id: 'sc-base',
          name: 'Base Case',
          type: 'base',
          description: 'Current market rates and weather conditions.',
          overrides: {},
        },
        {
          id: 'sc-opt',
          name: 'Optimistic (+10% Freight, +1kt)',
          type: 'optimistic',
          description: 'Favorable tailwinds and higher spot fixing freight.',
          overrides: {
            freight_rate_multiplier: 1.1,
            speed_knots_delta: 1.0,
            fuel_price_multiplier: 0.95,
          },
        },
        {
          id: 'sc-pess',
          name: 'Pessimistic (-10% Freight, Delay)',
          type: 'pessimistic',
          description: 'Winter weather margin, higher bunker prices, and 2-day port congestion.',
          overrides: {
            freight_rate_multiplier: 0.9,
            speed_knots_delta: -1.0,
            fuel_price_multiplier: 1.12,
            port_delay_days: 2.0,
          },
        },
      ],
      notes: 'Standard Escravos crude fixture for European refining. SECA fuel switch scheduled at Ushant entry.',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const dryBulkMultiCargoVoyage: VoyageCalculationRecord = {
      id: 'vc-dry-02',
      workbook_id: 'wb-02',
      name: 'US Gulf Multi-Cargo Agricultural Export to NW Europe',
      mode: 'dry',
      vessel_id: 205,
      vessel_name: 'ATLANTIC PIONEER',
      vessel_type: 'Kamsarmax Bulk Carrier',
      vessel_dwt: 82000,
      speed_laden_knots: 12.5,
      speed_ballast_knots: 13.5,
      fuel_laden_mt_day: 28.0,
      fuel_ballast_mt_day: 24.0,
      fuel_port_idle_mt_day: 2.8,
      fuel_port_working_mt_day: 4.5,
      daily_hire_usd: 14500, // Chartered-in tonnage
      ballast_bonus_usd: 40000,
      weather_margin_pct: 6.0,
      cargoes: [
        {
          id: 'cg-dry-01',
          name: 'Parcel A: US Yellow Soybeans',
          commodity: 'US #2 Yellow Soybeans',
          quantity_mt: 46000,
          freight_rate: 26.5,
          freight_rate_type: 'per_mt',
          currency: 'USD',
          commission_pct: 2.5,
          load_port_id: 104,
          load_port_name: 'New Orleans (South Louisiana)',
          load_rate_mt_day: 18000,
          discharge_port_id: 101,
          discharge_port_name: 'Rotterdam Port',
          discharge_rate_mt_day: 15000,
        },
        {
          id: 'cg-dry-02',
          name: 'Parcel B: Hard Red Winter Wheat',
          commodity: 'Hard Red Winter Wheat',
          quantity_mt: 31000,
          freight_rate: 28.2,
          freight_rate_type: 'per_mt',
          currency: 'USD',
          commission_pct: 3.0,
          load_port_id: 104,
          load_port_name: 'New Orleans (South Louisiana)',
          load_rate_mt_day: 16000,
          discharge_port_id: 105,
          discharge_port_name: 'Hamburg Port',
          discharge_rate_mt_day: 12000,
        },
      ],
      legs: [
        {
          id: 'leg-dry-01',
          sequence: 1,
          leg_type: 'ballast',
          origin_port_id: 106,
          origin_port_name: 'Kingston Hub',
          origin_country: 'Jamaica',
          origin_lat: 17.97,
          origin_lng: -76.79,
          destination_port_id: 104,
          destination_port_name: 'New Orleans',
          destination_country: 'United States',
          destination_lat: 29.95,
          destination_lng: -90.07,
          distance_nm: 1180,
          is_distance_manual: false,
          auto_distance_nm: 1180,
          speed_knots: 13.5,
          is_seca: false,
          fuel_type: 'VLSFO',
          canal: 'none',
          canal_cost: 0,
          weather_margin_pct: 6.0,
        },
        {
          id: 'leg-dry-02',
          sequence: 2,
          leg_type: 'laden',
          origin_port_id: 104,
          origin_port_name: 'New Orleans',
          origin_country: 'United States',
          origin_lat: 29.95,
          origin_lng: -90.07,
          destination_port_id: 101,
          destination_port_name: 'Rotterdam Port',
          destination_country: 'Netherlands',
          destination_lat: 51.95,
          destination_lng: 4.13,
          distance_nm: 4850,
          is_distance_manual: false,
          auto_distance_nm: 4850,
          speed_knots: 12.5,
          is_seca: true, // SECA approaching North Sea
          fuel_type: 'VLSFO',
          canal: 'none',
          canal_cost: 0,
          weather_margin_pct: 6.0,
        },
        {
          id: 'leg-dry-03',
          sequence: 3,
          leg_type: 'laden',
          origin_port_id: 101,
          origin_port_name: 'Rotterdam Port',
          origin_country: 'Netherlands',
          origin_lat: 51.95,
          origin_lng: 4.13,
          destination_port_id: 105,
          destination_port_name: 'Hamburg Port',
          destination_country: 'Germany',
          destination_lat: 53.55,
          destination_lng: 9.99,
          distance_nm: 310,
          is_distance_manual: false,
          auto_distance_nm: 310,
          speed_knots: 11.5,
          is_seca: true,
          fuel_type: 'LSMGO',
          canal: 'none',
          canal_cost: 0,
          weather_margin_pct: 5.0,
        },
      ],
      fuel_prices: {
        vlsfo_usd_mt: 615,
        mgo_usd_mt: 840,
        lsmgo_usd_mt: 875,
        hfo_usd_mt: 495,
        lng_usd_mt: 720,
      },
      port_costs: {
        104: 55000,
        101: 38000,
        105: 42000,
      },
      extra_costs: [
        { id: 'ec-d1', name: 'Grain Hold Cleaning & Survey', amount: 18500 },
        { id: 'ec-d2', name: 'Mississippi River Pilotage', amount: 22000 },
      ],
      emissions_config: {
        eu_ets_enabled: true,
        eu_ets_price_eur_mt: 75,
        eur_usd_rate: 1.08,
        eu_ets_scope_pct: 50,
        co2_factor_vlsfo: 3.114,
        co2_factor_mgo: 3.206,
        co2_factor_lsmgo: 3.206,
        co2_factor_hfo: 3.114,
        co2_factor_lng: 2.75,
      },
      scenarios: [
        {
          id: 'sc-dry-base',
          name: 'Base Case',
          type: 'base',
          description: 'Agreed charter rates with Mississippi draft restriction.',
          overrides: {},
        },
        {
          id: 'sc-dry-opt',
          name: 'Optimistic Case (+1.0 kt, Quick Discharge)',
          type: 'optimistic',
          description: 'Favorable transatlantic weather and expedited discharge.',
          overrides: {
            speed_knots_delta: 1.0,
            freight_rate_multiplier: 1.05,
          },
        },
        {
          id: 'sc-dry-pess',
          name: 'Pessimistic Case (North Atlantic Gals, High Bunker)',
          type: 'pessimistic',
          description: 'Rough sea weather, delayed river transit, and high bunker costs.',
          overrides: {
            weather_margin_delta: 4.0,
            fuel_price_multiplier: 1.15,
            port_delay_days: 3.0,
          },
        },
      ],
      notes: 'Multi-cargo grain combination. Parcel A discharged in Rotterdam, Parcel B carried forward to Hamburg.',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString(),
    };

    return [
      {
        id: 'wb-01',
        name: 'Atlantic Tanker Operations',
        description: 'Suezmax and Aframax crude oil and product tanker voyages.',
        voyages: [tankerVoyage],
        active_voyage_id: tankerVoyage.id,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'wb-02',
        name: 'Global Dry Bulk Charters',
        description: 'Capesize iron ore and Panamax agricultural trade calculations.',
        voyages: [dryBulkMultiCargoVoyage],
        active_voyage_id: dryBulkMultiCargoVoyage.id,
        created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  /**
   * Retrieves all workbooks from localStorage or defaults to seeds
   */
  public static getStoredWorkbooks(): VoyageWorkbook[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    const seeds = this.getSeedWorkbooks();
    this.saveAllWorkbooks(seeds);
    return seeds;
  }

  /**
   * Persists workbooks list
   */
  public static saveAllWorkbooks(workbooks: VoyageWorkbook[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workbooks));
    } catch (e) {
      console.warn('Failed to save workbooks to localStorage', e);
    }
  }

  /**
   * Retrieves single workbook
   */
  public static async getWorkbooks(): Promise<VoyageWorkbook[]> {
    return this.getStoredWorkbooks();
  }

  /**
   * Saves or updates a workbook
   */
  public static async saveWorkbook(workbook: VoyageWorkbook): Promise<VoyageWorkbook> {
    const all = this.getStoredWorkbooks();
    const idx = all.findIndex((w) => w.id === workbook.id);

    const updatedWorkbook = {
      ...workbook,
      updated_at: new Date().toISOString(),
    };

    if (idx >= 0) {
      all[idx] = updatedWorkbook;
    } else {
      all.unshift(updatedWorkbook);
    }

    this.saveAllWorkbooks(all);
    return updatedWorkbook;
  }

  /**
   * Duplicates a voyage calculation with a new ID and timestamp
   */
  public static duplicateVoyage(voyage: VoyageCalculationRecord): VoyageCalculationRecord {
    const id = `vc-${Date.now().toString().slice(-6)}`;
    return {
      ...JSON.parse(JSON.stringify(voyage)),
      id,
      name: `${voyage.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Exports full voyage calculation to CSV
   */
  public static exportToCSV(voyage: VoyageCalculationRecord, result: VoyageEconomicsResult): void {
    const lines = [
      `VOYAGE ESTIMATION RECAP - SIH 26006 MARITIME CARGO`,
      `Voyage Name,${voyage.name}`,
      `Vessel,${voyage.vessel_name} (${voyage.vessel_type})`,
      `Deadweight (MT),${voyage.vessel_dwt}`,
      `Mode,${voyage.mode.toUpperCase()}`,
      `Date,${new Date().toLocaleDateString()}`,
      ``,
      `--- FINANCIAL & COMMERCIAL SUMMARY ---`,
      `Time Charter Equivalent (TCE),${result.tce_usd_day} USD/day`,
      `Net Profit & Loss (P&L),${result.net_pnl_usd} USD`,
      `Daily P&L,${result.daily_pnl_usd} USD/day`,
      `Gross Freight Revenue,${result.gross_freight_revenue} USD`,
      `Total Commissions,${result.total_commissions_usd} USD`,
      `Net Freight Revenue,${result.net_freight_revenue} USD`,
      `Ballast Bonus,${result.ballast_bonus_usd} USD`,
      `Total Revenue,${result.total_revenue_usd} USD`,
      `Total Voyage Costs,${result.total_voyage_costs_usd} USD`,
      `Voyage Costs (ex Hire),${result.voyage_costs_ex_hire_usd} USD`,
      `Vessel Hire Cost,${result.vessel_hire_cost_usd} USD`,
      ``,
      `--- OPERATIONAL DURATION & FUEL ---`,
      `Total Voyage Days,${result.total_voyage_days} days`,
      `Sea Steaming Days,${result.total_sea_days} days`,
      `Port Operations Days,${result.total_port_days} days`,
      `Total Distance,${result.total_distance_nm} NM`,
      `Total Fuel Consumed,${result.total_fuel_consumed_mt} MT`,
      `Total Fuel Cost,${result.total_fuel_cost_usd} USD`,
      `Port Disbursements,${result.port_costs_usd} USD`,
      `Canal Tolls,${result.canal_costs_usd} USD`,
      `CO2 Emissions,${result.co2_emissions_mt} MT`,
      `EU ETS Carbon Cost,${result.eu_ets_cost_usd} USD`,
      ``,
      `--- CARGO PARCELS ALLOCATION (${voyage.cargoes.length}) ---`,
      `Parcel Name,Commodity,Quantity (MT),Freight Rate,Basis,Commission %,Gross Rev ($),Net Rev ($)`,
      ...voyage.cargoes.map((c, i) => {
        const r = result.cargo_results[i] || { gross_revenue: 0, net_revenue: 0 };
        return `"${c.name}","${c.commodity}",${c.quantity_mt},${c.freight_rate},"${c.freight_rate_type}",${c.commission_pct}%,${r.gross_revenue},${r.net_revenue}`;
      }),
      ``,
      `--- VOYAGE LEGS ROTATION (${voyage.legs.length}) ---`,
      `Seq,Origin,Destination,Distance (NM),Speed (kts),Leg Type,SECA,Canal,Sea Days,Fuel (MT),Fuel Cost ($)`,
      ...voyage.legs.map((l, i) => {
        const lr = result.leg_results[i] || { sea_days: 0, fuel_consumed_mt: 0, fuel_cost_usd: 0 };
        return `${l.sequence},"${l.origin_port_name}","${l.destination_port_name}",${l.distance_nm},${l.speed_knots},"${l.leg_type}",${l.is_seca ? 'YES' : 'NO'},"${l.canal}",${lr.sea_days},${lr.fuel_consumed_mt},${lr.fuel_cost_usd}`;
      }),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `voyage_recap_${voyage.name.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
