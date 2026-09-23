/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Voyage Calculator Pure Calculation Engine
 */

import type {
  VoyageCalculationRecord,
  VoyageCargoItem,
  VoyageEconomicsResult,
  CargoEconomicsResult,
  LegEconomicsResult,
  BunkerFuelPrices,
  EmissionsConfig,
  ScenarioOverrides,
  FuelType,
} from '../../types/voyage-calculator';
import { DistanceEngine } from '../distance-calculator/distance-engine';

export class VoyageEngine {
  /**
   * Great Circle Haversine distance in Nautical Miles with maritime routing circuity factor
   * Delegates to shared DistanceEngine
   */
  public static estimateNauticalDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    circuityFactor: number = 1.18
  ): number {
    return DistanceEngine.calculateDistance(lat1, lon1, lat2, lon2, circuityFactor);
  }

  /**
   * Calculates sea steaming hours and days with weather margin
   */
  public static calculateLegSeaTime(
    distanceNm: number,
    speedKnots: number,
    weatherMarginPct: number = 5
  ): { seaHours: number; seaDays: number } {
    if (speedKnots <= 0 || distanceNm <= 0) {
      return { seaHours: 0, seaDays: 0 };
    }

    const baseHours = distanceNm / speedKnots;
    const weatherFactor = 1 + Math.max(0, weatherMarginPct) / 100;
    const adjustedHours = baseHours * weatherFactor;
    const seaDays = adjustedHours / 24;

    return {
      seaHours: Number(adjustedHours.toFixed(1)),
      seaDays: Number(seaDays.toFixed(2)),
    };
  }

  /**
   * Calculates cargo parcel loading and discharging durations
   */
  public static calculateCargoPortDays(
    quantityMt: number,
    loadRateMtDay: number,
    dischargeRateMtDay: number,
    turnaroundBufferDays: number = 0.5
  ): { loadDays: number; dischargeDays: number; totalPortDays: number } {
    const loadDays = loadRateMtDay > 0 ? quantityMt / loadRateMtDay + turnaroundBufferDays : 1.5;
    const dischargeDays = dischargeRateMtDay > 0 ? quantityMt / dischargeRateMtDay + turnaroundBufferDays : 1.5;
    const totalPortDays = loadDays + dischargeDays;

    return {
      loadDays: Number(loadDays.toFixed(2)),
      dischargeDays: Number(dischargeDays.toFixed(2)),
      totalPortDays: Number(totalPortDays.toFixed(2)),
    };
  }

  /**
   * Resolves fuel price by fuel type
   */
  public static getFuelPrice(fuelType: FuelType, prices: BunkerFuelPrices, isSeca: boolean): number {
    if (isSeca) {
      // In Emission Control Areas (SECA), low-sulfur fuels are mandatory
      return prices.lsmgo_usd_mt || prices.mgo_usd_mt || 880;
    }

    switch (fuelType) {
      case 'VLSFO':
        return prices.vlsfo_usd_mt || 620;
      case 'MGO':
        return prices.mgo_usd_mt || 850;
      case 'LSMGO':
        return prices.lsmgo_usd_mt || 880;
      case 'HFO':
        return prices.hfo_usd_mt || 510;
      case 'LNG':
        return prices.lng_usd_mt || 740;
      default:
        return prices.vlsfo_usd_mt || 620;
    }
  }

  /**
   * Resolves CO2 emission factor by fuel type (IMO GHG Study defaults)
   */
  public static getCO2Factor(fuelType: FuelType, config: EmissionsConfig, isSeca: boolean): number {
    if (isSeca) {
      return config.co2_factor_lsmgo || 3.206;
    }

    switch (fuelType) {
      case 'VLSFO':
        return config.co2_factor_vlsfo || 3.114;
      case 'MGO':
        return config.co2_factor_mgo || 3.206;
      case 'LSMGO':
        return config.co2_factor_lsmgo || 3.206;
      case 'HFO':
        return config.co2_factor_hfo || 3.114;
      case 'LNG':
        return config.co2_factor_lng || 2.75;
      default:
        return config.co2_factor_vlsfo || 3.114;
    }
  }

  /**
   * Calculates gross freight, commissions, and net freight for each cargo parcel
   */
  public static calculateCargoRevenue(cargo: VoyageCargoItem): {
    grossRevenue: number;
    commissionAmount: number;
    netRevenue: number;
  } {
    let grossRevenue = 0;

    if (cargo.freight_rate_type === 'per_mt') {
      grossRevenue = cargo.quantity_mt * cargo.freight_rate;
    } else if (cargo.freight_rate_type === 'lumpsum') {
      grossRevenue = cargo.freight_rate;
    } else if (cargo.freight_rate_type === 'worldscale') {
      const flatRate = cargo.worldscale_flat_rate || 22.5;
      const wsPct = (cargo.worldscale_pct || cargo.freight_rate || 100) / 100;
      grossRevenue = cargo.quantity_mt * flatRate * wsPct;
    }

    const commissionAmount = grossRevenue * (Math.max(0, cargo.commission_pct) / 100);
    const netRevenue = grossRevenue - commissionAmount;

    return {
      grossRevenue: Math.round(grossRevenue),
      commissionAmount: Math.round(commissionAmount),
      netRevenue: Math.round(netRevenue),
    };
  }

  /**
   * Full Voyage Economic & Operational Calculation
   */
  public static calculateVoyage(voyage: VoyageCalculationRecord): VoyageEconomicsResult {
    // 1. Multi-Cargo Economics
    let totalGrossFreight = 0;
    let totalCommissions = 0;
    let totalNetFreight = 0;
    let totalAllocatedCargoMt = 0;
    const cargoResults: CargoEconomicsResult[] = [];

    let totalCargoPortDays = 0;

    voyage.cargoes.forEach((cargo) => {
      const rev = this.calculateCargoRevenue(cargo);
      totalGrossFreight += rev.grossRevenue;
      totalCommissions += rev.commissionAmount;
      totalNetFreight += rev.netRevenue;
      totalAllocatedCargoMt += cargo.quantity_mt;

      const portTimes = this.calculateCargoPortDays(
        cargo.quantity_mt,
        cargo.load_rate_mt_day,
        cargo.discharge_rate_mt_day
      );
      totalCargoPortDays += portTimes.totalPortDays;

      cargoResults.push({
        cargo_id: cargo.id,
        gross_revenue: rev.grossRevenue,
        commission_amount: rev.commissionAmount,
        net_revenue: rev.netRevenue,
        load_days: portTimes.loadDays,
        discharge_days: portTimes.dischargeDays,
        total_port_days: portTimes.totalPortDays,
      });
    });

    // Capacity checks
    const capacity = voyage.vessel_dwt || 1;
    const capacityUtilizationPct = Number(((totalAllocatedCargoMt / capacity) * 100).toFixed(1));
    const isOverloaded = totalAllocatedCargoMt > capacity;

    // 2. Multi-Leg Navigation & Sea Times
    let totalDistanceNm = 0;
    let totalSeaDays = 0;
    let totalSeaFuelConsumedMt = 0;
    let totalSeaFuelCost = 0;
    let totalCanalCosts = 0;
    let totalCO2Tons = 0;
    let totalETSCost = 0;
    const legResults: LegEconomicsResult[] = [];

    voyage.legs.forEach((leg) => {
      const dist = leg.is_distance_manual ? leg.distance_nm : leg.auto_distance_nm || leg.distance_nm;
      totalDistanceNm += dist;

      const weatherMargin = leg.weather_margin_pct ?? voyage.weather_margin_pct;
      const speed = leg.speed_knots || (leg.leg_type === 'laden' ? voyage.speed_laden_knots : voyage.speed_ballast_knots) || 12.5;

      const { seaHours, seaDays } = this.calculateLegSeaTime(dist, speed, weatherMargin);
      totalSeaDays += seaDays;

      // Fuel burn rate (MT/day)
      const baseDailyFuel =
        leg.leg_type === 'laden' ? voyage.fuel_laden_mt_day : voyage.fuel_ballast_mt_day;
      const legFuelConsumed = Number((seaDays * baseDailyFuel).toFixed(2));
      totalSeaFuelConsumedMt += legFuelConsumed;

      // Fuel price
      const pricePerMt = this.getFuelPrice(leg.fuel_type, voyage.fuel_prices, leg.is_seca);
      const legFuelCost = Math.round(legFuelConsumed * pricePerMt);
      totalSeaFuelCost += legFuelCost;

      // Canal Tolls
      const canalToll = leg.canal_cost || 0;
      totalCanalCosts += canalToll;

      // Emissions
      const co2Factor = this.getCO2Factor(leg.fuel_type, voyage.emissions_config, leg.is_seca);
      const legCO2 = Number((legFuelConsumed * co2Factor).toFixed(2));
      totalCO2Tons += legCO2;

      // EU ETS Liability
      let legETSCost = 0;
      if (voyage.emissions_config.eu_ets_enabled) {
        const scope = (voyage.emissions_config.eu_ets_scope_pct || 50) / 100;
        const taxableCO2 = legCO2 * scope;
        const etsPriceUsd =
          (voyage.emissions_config.eu_ets_price_eur_mt || 75) *
          (voyage.emissions_config.eur_usd_rate || 1.08);
        legETSCost = Math.round(taxableCO2 * etsPriceUsd);
        totalETSCost += legETSCost;
      }

      legResults.push({
        leg_id: leg.id,
        sequence: leg.sequence,
        sea_hours: seaHours,
        sea_days: seaDays,
        fuel_consumed_mt: legFuelConsumed,
        fuel_cost_usd: legFuelCost,
        canal_cost_usd: canalToll,
        co2_tons: legCO2,
        ets_cost_usd: legETSCost,
      });
    });

    // 3. Port Stays & Port Fuel
    // Aggregate port days: either sum of cargo operations or minimum 2 days if no cargoes
    const totalPortDays = Math.max(1.0, Number(totalCargoPortDays.toFixed(2)));
    const portDailyFuel = voyage.fuel_port_working_mt_day || 5.0;
    const portFuelConsumedMt = Number((totalPortDays * portDailyFuel).toFixed(2));
    const portFuelPrice = voyage.fuel_prices.mgo_usd_mt || voyage.fuel_prices.vlsfo_usd_mt || 800;
    const portFuelCost = Math.round(portFuelConsumedMt * portFuelPrice);

    const totalFuelConsumedMt = Number((totalSeaFuelConsumedMt + portFuelConsumedMt).toFixed(2));
    const totalFuelCost = totalSeaFuelCost + portFuelCost;

    // Port disbursements from port_costs dictionary
    let totalPortDisbursements = 0;
    Object.values(voyage.port_costs || {}).forEach((cost) => {
      totalPortDisbursements += Number(cost) || 0;
    });
    // Default baseline if none specified
    if (totalPortDisbursements === 0) {
      const portCount = Math.max(2, voyage.legs.length + 1);
      totalPortDisbursements = portCount * (voyage.mode === 'tanker' ? 35000 : 25000);
    }

    // Extra / Misc Costs
    let totalExtraCosts = 0;
    (voyage.extra_costs || []).forEach((c) => {
      totalExtraCosts += Number(c.amount) || 0;
    });

    // Total Voyage Duration
    const totalVoyageDays = Number((totalSeaDays + totalPortDays).toFixed(2));

    // 4. Charter Hire Cost (if chartered-in)
    const vesselHireCost = Math.round((voyage.daily_hire_usd || 0) * totalVoyageDays);

    // 5. Total Revenues & Costs
    const ballastBonus = voyage.ballast_bonus_usd || 0;
    const totalRevenue = totalGrossFreight + ballastBonus;

    // Voyage Costs excluding vessel hire (standard voyage disbursement base)
    const voyageCostsExHire =
      totalFuelCost +
      totalCanalCosts +
      totalPortDisbursements +
      totalETSCost +
      totalCommissions +
      totalExtraCosts;

    // Total Costs including vessel hire
    const totalVoyageCosts = voyageCostsExHire + vesselHireCost;

    // 6. Net P&L and Daily P&L
    const netPnl = Math.round(totalRevenue - totalVoyageCosts);
    const dailyPnl = totalVoyageDays > 0 ? Math.round(netPnl / totalVoyageDays) : 0;

    // 7. Time Charter Equivalent (TCE)
    // Standard Baltic Formula: TCE = (Net Freight Revenue + Ballast Bonus - Voyage Costs excluding Hire) / Total Days
    const netEarningsForTCE = totalNetFreight + ballastBonus - (totalFuelCost + totalCanalCosts + totalPortDisbursements + totalETSCost + totalExtraCosts);
    const tceUsdDay = totalVoyageDays > 0 ? Math.round(netEarningsForTCE / totalVoyageDays) : 0;

    // ETS Taxable emissions
    const etsTaxableCO2 = voyage.emissions_config.eu_ets_enabled
      ? Number((totalCO2Tons * ((voyage.emissions_config.eu_ets_scope_pct || 50) / 100)).toFixed(2))
      : 0;

    return {
      total_sea_days: Number(totalSeaDays.toFixed(2)),
      total_port_days: Number(totalPortDays.toFixed(2)),
      total_voyage_days: totalVoyageDays,
      total_distance_nm: totalDistanceNm,
      total_fuel_consumed_mt: totalFuelConsumedMt,
      sea_fuel_cost_usd: totalSeaFuelCost,
      port_fuel_cost_usd: portFuelCost,
      total_fuel_cost_usd: totalFuelCost,
      gross_freight_revenue: totalGrossFreight,
      total_commissions_usd: totalCommissions,
      net_freight_revenue: totalNetFreight,
      ballast_bonus_usd: ballastBonus,
      total_revenue_usd: totalRevenue,
      canal_costs_usd: totalCanalCosts,
      port_costs_usd: totalPortDisbursements,
      vessel_hire_cost_usd: vesselHireCost,
      extra_costs_usd: totalExtraCosts,
      co2_emissions_mt: Number(totalCO2Tons.toFixed(2)),
      ets_taxable_emissions_mt: etsTaxableCO2,
      eu_ets_cost_usd: totalETSCost,
      total_voyage_costs_usd: totalVoyageCosts,
      voyage_costs_ex_hire_usd: voyageCostsExHire,
      net_pnl_usd: netPnl,
      daily_pnl_usd: dailyPnl,
      tce_usd_day: tceUsdDay,
      cargo_results: cargoResults,
      leg_results: legResults,
      total_allocated_cargo_mt: totalAllocatedCargoMt,
      capacity_utilization_pct: capacityUtilizationPct,
      is_overloaded: isOverloaded,
    };
  }

  /**
   * Calculates Scenario Overrides (Optimistic, Pessimistic, Custom)
   */
  public static calculateScenario(
    baseVoyage: VoyageCalculationRecord,
    overrides: ScenarioOverrides
  ): VoyageEconomicsResult {
    // Deep clone base voyage to avoid state mutation
    const modifiedVoyage: VoyageCalculationRecord = JSON.parse(JSON.stringify(baseVoyage));

    // 1. Freight multiplier
    if (overrides.freight_rate_multiplier && overrides.freight_rate_multiplier !== 1) {
      modifiedVoyage.cargoes = modifiedVoyage.cargoes.map((c) => ({
        ...c,
        freight_rate: Number((c.freight_rate * (overrides.freight_rate_multiplier || 1)).toFixed(2)),
      }));
    }

    // 2. Speed delta
    if (overrides.speed_knots_delta) {
      modifiedVoyage.speed_laden_knots = Math.max(8, modifiedVoyage.speed_laden_knots + overrides.speed_knots_delta);
      modifiedVoyage.speed_ballast_knots = Math.max(8, modifiedVoyage.speed_ballast_knots + overrides.speed_knots_delta);
      modifiedVoyage.legs = modifiedVoyage.legs.map((l) => ({
        ...l,
        speed_knots: Math.max(8, l.speed_knots + (overrides.speed_knots_delta || 0)),
      }));
    }

    // 3. Fuel price multiplier
    if (overrides.fuel_price_multiplier && overrides.fuel_price_multiplier !== 1) {
      const mult = overrides.fuel_price_multiplier;
      modifiedVoyage.fuel_prices = {
        vlsfo_usd_mt: Math.round(modifiedVoyage.fuel_prices.vlsfo_usd_mt * mult),
        mgo_usd_mt: Math.round(modifiedVoyage.fuel_prices.mgo_usd_mt * mult),
        lsmgo_usd_mt: Math.round(modifiedVoyage.fuel_prices.lsmgo_usd_mt * mult),
        hfo_usd_mt: Math.round(modifiedVoyage.fuel_prices.hfo_usd_mt * mult),
        lng_usd_mt: Math.round(modifiedVoyage.fuel_prices.lng_usd_mt * mult),
      };
    }

    // 4. Weather margin delta
    if (overrides.weather_margin_delta) {
      modifiedVoyage.weather_margin_pct = Math.max(0, modifiedVoyage.weather_margin_pct + overrides.weather_margin_delta);
    }

    // 5. ETS Price delta
    if (overrides.ets_price_delta) {
      modifiedVoyage.emissions_config.eu_ets_price_eur_mt = Math.max(
        0,
        modifiedVoyage.emissions_config.eu_ets_price_eur_mt + overrides.ets_price_delta
      );
    }

    // Run calculation engine
    const baseResult = this.calculateVoyage(modifiedVoyage);

    // If port delay days specified, adjust final days and port costs
    if (overrides.port_delay_days) {
      const extraDays = overrides.port_delay_days;
      const newTotalDays = Number((baseResult.total_voyage_days + extraDays).toFixed(2));
      const extraPortFuelCost = Math.round(extraDays * (modifiedVoyage.fuel_port_idle_mt_day || 3.5) * modifiedVoyage.fuel_prices.vlsfo_usd_mt);
      const newTotalCosts = baseResult.total_voyage_costs_usd + extraPortFuelCost;
      const newNetPnl = baseResult.total_revenue_usd - newTotalCosts;
      const newDailyPnl = newTotalDays > 0 ? Math.round(newNetPnl / newTotalDays) : 0;
      const newTCE = newTotalDays > 0 ? Math.round((baseResult.net_freight_revenue + baseResult.ballast_bonus_usd - (baseResult.voyage_costs_ex_hire_usd + extraPortFuelCost)) / newTotalDays) : 0;

      return {
        ...baseResult,
        total_port_days: Number((baseResult.total_port_days + extraDays).toFixed(2)),
        total_voyage_days: newTotalDays,
        total_fuel_cost_usd: baseResult.total_fuel_cost_usd + extraPortFuelCost,
        total_voyage_costs_usd: newTotalCosts,
        net_pnl_usd: newNetPnl,
        daily_pnl_usd: newDailyPnl,
        tce_usd_day: newTCE,
      };
    }

    return baseResult;
  }
}
