/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 5: Market Insights Analytics & Signal Engine
 *
 * Pure calculation functions for maritime market analytics, supply-demand balance,
 * market signals, trend detection, and multi-entity comparisons.
 */

import type {
  MarketSupplyMetrics,
  MarketDemandMetrics,
  MarketCongestionMetrics,
  MarketVesselAvailabilityMetrics,
  RouteFreightDetails,
  MarketSignalItem,
  MarketSignalSummary,
  MarketBalanceState,
  SignalDirection,
  MarketComparisonResult,
  ComparisonMetricRow
} from '../../types/market-insights';

export class MarketAnalyticsEngine {
  /**
   * Safe percentage change calculation guarding against division by zero, null, undefined, and NaN.
   */
  public static calculatePercentChange(current: number, previous: number): number {
    if (!Number.isFinite(current) || !Number.isFinite(previous)) return 0;
    if (previous === 0) {
      return current === 0 ? 0 : 100;
    }
    const pct = ((current - previous) / Math.abs(previous)) * 100;
    return Math.round(pct * 100) / 100;
  }

  /**
   * Calculate fleet utilization percentage based on active commercial vs total fleet.
   */
  public static calculateFleetUtilization(activeCommercialDwt: number, totalFleetDwt: number): number {
    if (!Number.isFinite(activeCommercialDwt) || !Number.isFinite(totalFleetDwt) || totalFleetDwt <= 0) {
      return 0;
    }
    const ratio = (activeCommercialDwt / totalFleetDwt) * 100;
    return Math.max(0, Math.min(100, Math.round(ratio * 10) / 10));
  }

  /**
   * Pure supply-demand balance synthesis determining directional commercial pressure.
   */
  public static calculateSupplyDemandBalance(
    supplyGrowthPct: number,
    demandGrowthPct: number,
    fleetUtilizationPct: number
  ): {
    ratio: number;
    state: MarketBalanceState;
    narrative: string;
    confidence: number;
  } {
    const sGrowth = Number.isFinite(supplyGrowthPct) ? supplyGrowthPct : 0;
    const dGrowth = Number.isFinite(demandGrowthPct) ? demandGrowthPct : 0;
    const util = Number.isFinite(fleetUtilizationPct) ? fleetUtilizationPct : 80;

    // Relative growth ratio: Demand delta minus Supply delta
    const netPressure = Math.round((dGrowth - sGrowth) * 100) / 100;

    let state: MarketBalanceState = 'balanced';
    let narrative = 'Supply and demand fundamentals are currently in statistical equilibrium.';

    if (util > 92 || (netPressure > 4.5 && util > 85)) {
      state = 'supply_constrained';
      narrative = 'Fleet capacity is heavily constrained by high commercial utilization and port bottlenecks, driving rate premia.';
    } else if (netPressure > 1.5) {
      state = 'tightening';
      narrative = 'Demand growth is outpacing fleet supply expansion, creating upward directional pressure on freight benchmarks.';
    } else if (dGrowth < -2.0 && sGrowth >= 0) {
      state = 'demand_softening';
      narrative = 'Cargo demand volumes are softening while open tonnage replenishes, dampening chartering momentum.';
    } else if (netPressure < -1.5) {
      state = 'widening';
      narrative = 'Fleet supply additions exceed incremental cargo demand, widening tonnage availability across key corridors.';
    }

    // Ratio normalized around 1.0
    const ratio = Math.max(0.2, Math.min(2.5, Math.round((1 + (netPressure / 100)) * 100) / 100));
    const confidence = Math.min(95, Math.max(70, Math.round(78 + Math.abs(netPressure) * 1.8)));

    return {
      ratio,
      state,
      narrative,
      confidence
    };
  }

  /**
   * Calculate directional trend ('increasing' | 'stable' | 'decreasing') from a numeric series.
   */
  public static calculateMarketTrend(series: number[]): 'increasing' | 'stable' | 'decreasing' {
    if (!Array.isArray(series) || series.length < 2) return 'stable';
    const valid = series.filter(n => Number.isFinite(n));
    if (valid.length < 2) return 'stable';

    const first = valid[0];
    const last = valid[valid.length - 1];
    const pct = this.calculatePercentChange(last, first);

    if (pct > 2.0) return 'increasing';
    if (pct < -2.0) return 'decreasing';
    return 'stable';
  }

  /**
   * Synthesize 5 Core Commercial Signals:
   * Supply, Demand, Freight, Congestion, and Vessel Availability.
   */
  public static synthesizeMarketSignals(
    supply: MarketSupplyMetrics,
    demand: MarketDemandMetrics,
    freight: RouteFreightDetails | null,
    congestion: MarketCongestionMetrics,
    availability: MarketVesselAvailabilityMetrics
  ): MarketSignalSummary {
    const signals: MarketSignalItem[] = [];

    // 1. Supply Signal
    const supplyDelta = supply.supply_change_pct;
    const supplyDir: SignalDirection = supplyDelta > 0.5 ? 'up' : supplyDelta < -0.5 ? 'down' : 'neutral';
    signals.push({
      key: 'supply',
      title: 'Supply Signal',
      current_value: supply.total_fleet_vessels,
      previous_value: Math.round(supply.total_fleet_vessels / (1 + (supplyDelta / 100))),
      delta: Math.round(supply.total_fleet_vessels * (supplyDelta / 100)),
      delta_pct: supplyDelta,
      direction: supplyDir,
      unit: 'vessels',
      status: supplyDelta > 2.0 ? 'easing' : supplyDelta < -1.0 ? 'tightening' : 'neutral',
      summary: supplyDelta > 1.0
        ? `Fleet supply expanded by ${supplyDelta}% over the period, with ${supply.open_next_10d} vessels opening in 10 days.`
        : `Fleet supply constrained with ${supply.fleet_utilization_pct}% commercial fleet utilization.`
    });

    // 2. Demand Signal
    const demandDelta = demand.demand_change_pct;
    const demandDir: SignalDirection = demandDelta > 0.5 ? 'up' : demandDelta < -0.5 ? 'down' : 'neutral';
    signals.push({
      key: 'demand',
      title: 'Demand Signal',
      current_value: demand.total_cargo_demand_mt,
      previous_value: Math.round(demand.total_cargo_demand_mt / (1 + (demandDelta / 100))),
      delta: Math.round(demand.total_cargo_demand_mt * (demandDelta / 100)),
      delta_pct: demandDelta,
      direction: demandDir,
      unit: 'MT',
      status: demandDelta > 2.0 ? 'tightening' : demandDelta < -2.0 ? 'subdued' : 'neutral',
      summary: demandDelta > 0
        ? `Cargo demand strengthened by +${demandDelta}%, driven by ${demand.reported_fixtures_count} fixtures and ${demand.ton_mile_demand_billion_nm}B ton-miles.`
        : `Cargo inquiries declined by ${demandDelta}%, softening spot fixing velocity.`
    });

    // 3. Freight Signal
    const freightRate = freight ? freight.current_rate : 24.8;
    const freightDelta = freight ? freight.change_1d_pct : 1.2;
    const freightDir: SignalDirection = freightDelta > 0.3 ? 'up' : freightDelta < -0.3 ? 'down' : 'neutral';
    signals.push({
      key: 'freight',
      title: 'Freight Signal',
      current_value: freightRate,
      previous_value: freight ? Math.round((freightRate / (1 + (freightDelta / 100))) * 100) / 100 : 24.5,
      delta: freight ? Math.round((freightRate - (freightRate / (1 + (freightDelta / 100)))) * 100) / 100 : 0.3,
      delta_pct: freightDelta,
      direction: freightDir,
      unit: freight ? freight.benchmark_unit : '$/MT',
      status: freightDelta > 2.0 ? 'elevated' : freightDelta < -2.0 ? 'subdued' : 'neutral',
      summary: freight
        ? `${freight.route_code} assessment at ${freight.benchmark_unit} ${freight.current_rate.toLocaleString()} (${freight.change_30d_pct >= 0 ? '+' : ''}${freight.change_30d_pct}% 30D).`
        : 'Benchmark corridor rates showing steady support across key dry and tanker lanes.'
    });

    // 4. Congestion Signal
    const congestionDelta = congestion.congestion_change_pct;
    const congestionDir: SignalDirection = congestionDelta > 1.0 ? 'up' : congestionDelta < -1.0 ? 'down' : 'neutral';
    signals.push({
      key: 'congestion',
      title: 'Congestion Signal',
      current_value: congestion.avg_waiting_time_hours,
      previous_value: Math.round(congestion.avg_waiting_time_hours - congestion.waiting_time_change_hours),
      delta: congestion.waiting_time_change_hours,
      delta_pct: congestionDelta,
      direction: congestionDir,
      unit: 'hours',
      status: congestion.avg_waiting_time_hours > 65 ? 'elevated' : congestionDelta < -5 ? 'easing' : 'neutral',
      summary: `Anchorage delays averaging ${congestion.avg_waiting_time_hours}h across major load/discharge clusters with ${congestion.waiting_vessels_count} vessels waiting.`
    });

    // 5. Vessel Availability Signal
    const availDelta = availability.availability_change_pct;
    const availDir: SignalDirection = availDelta > 1.0 ? 'up' : availDelta < -1.0 ? 'down' : 'neutral';
    signals.push({
      key: 'availability',
      title: 'Vessel Availability Signal',
      current_value: availability.open_prompt + availability.open_next_10d,
      previous_value: Math.round((availability.open_prompt + availability.open_next_10d) / (1 + (availDelta / 100))),
      delta: Math.round((availability.open_prompt + availability.open_next_10d) * (availDelta / 100)),
      delta_pct: availDelta,
      direction: availDir,
      unit: 'vessels',
      status: availDelta < -3.0 ? 'tightening' : availDelta > 3.0 ? 'easing' : 'neutral',
      summary: `${availability.open_prompt} vessels prompt-open; ${availability.open_next_10d} arriving within 10 days (${availDelta >= 0 ? '+' : ''}${availDelta}% availability change).`
    });

    // Synthesize directional balance narrative
    const balance = this.calculateSupplyDemandBalance(supply.supply_change_pct, demand.demand_change_pct, supply.fleet_utilization_pct);

    return {
      signals,
      supply_demand_ratio: balance.ratio,
      directional_pressure: balance.state,
      pressure_narrative: balance.narrative,
      confidence_score_pct: balance.confidence,
      last_calculated: new Date().toISOString()
    };
  }

  /**
   * Multi-Entity Commercial Comparison Engine
   */
  public static compareMarketEntities(
    type: 'market' | 'vessel_class' | 'route' | 'current_vs_historical',
    entityA: { label: string; metrics: Record<string, number> },
    entityB: { label: string; metrics: Record<string, number> }
  ): MarketComparisonResult {
    const metrics: ComparisonMetricRow[] = [];
    const keys = Array.from(new Set([...Object.keys(entityA.metrics), ...Object.keys(entityB.metrics)]));

    for (const key of keys) {
      const valA = Number.isFinite(entityA.metrics[key]) ? entityA.metrics[key] : 0;
      const valB = Number.isFinite(entityB.metrics[key]) ? entityB.metrics[key] : 0;
      const delta = Math.round((valA - valB) * 100) / 100;
      const deltaPct = this.calculatePercentChange(valA, valB);

      let unit = '';
      if (key.includes('rate') || key.includes('price') || key.includes('tce')) unit = 'USD';
      else if (key.includes('pct') || key.includes('share') || key.includes('utilization')) unit = '%';
      else if (key.includes('dwt') || key.includes('volume') || key.includes('demand')) unit = 'MT';
      else if (key.includes('vessels') || key.includes('count') || key.includes('fixtures')) unit = 'Units';
      else if (key.includes('hours') || key.includes('wait') || key.includes('days')) unit = 'Hours';
      else if (key.includes('distance')) unit = 'NM';

      let advantage: 'entity_a' | 'entity_b' | 'neutral' = 'neutral';
      if (key.includes('rate') || key.includes('tce') || key.includes('earnings')) {
        advantage = valA > valB ? 'entity_a' : valA < valB ? 'entity_b' : 'neutral';
      } else if (key.includes('wait') || key.includes('delay') || key.includes('congestion')) {
        // lower delay is commercially advantageous
        advantage = valA < valB ? 'entity_a' : valA > valB ? 'entity_b' : 'neutral';
      } else {
        advantage = valA > valB ? 'entity_a' : valA < valB ? 'entity_b' : 'neutral';
      }

      const formattedLabel = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      metrics.push({
        label: formattedLabel,
        unit,
        value_a: valA,
        value_b: valB,
        delta,
        delta_pct: deltaPct,
        advantage
      });
    }

    const commentary: string[] = [
      `${entityA.label} presents a delta of ${metrics[0]?.delta >= 0 ? '+' : ''}${metrics[0]?.delta ?? 0} ${metrics[0]?.unit ?? ''} (${metrics[0]?.delta_pct ?? 0}%) compared to ${entityB.label}.`,
      `Commercial supply-demand dynamics indicate ${Math.abs(metrics.find(m => m.label.includes('Supply') || m.label.includes('Vessels'))?.delta ?? 0)} variance across operating corridors.`,
      `Operational recommendation: Optimize fleet ballasting schedules based on comparative turnaround delay and ton-mile efficiency.`
    ];

    return {
      type,
      entity_a_label: entityA.label,
      entity_b_label: entityB.label,
      metrics,
      analytical_commentary: commentary
    };
  }
}
