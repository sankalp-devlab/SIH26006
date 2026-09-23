/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 13: Port Analytics Pure Engine
 */

import type {
  PortVesselActivity,
  PortHistoricalVisit,
  PortInsightPayload,
  PortComparisonResult,
  PortDateRange,
} from '../../types/port-insights';

export class PortAnalyticsEngine {
  /**
   * Calculates mean waiting time in hours for waiting vessels
   */
  public static calculateAverageWaitingTime(vessels: PortVesselActivity[]): number {
    const waiting = vessels.filter((v) => v.status === 'waiting' && v.waiting_hours > 0);
    if (waiting.length === 0) return 0;
    const total = waiting.reduce((sum, v) => sum + v.waiting_hours, 0);
    return Number((total / waiting.length).toFixed(1));
  }

  /**
   * Calculates median waiting time in hours
   */
  public static calculateMedianWaitingTime(vessels: PortVesselActivity[]): number {
    const waiting = vessels
      .filter((v) => v.status === 'waiting' && v.waiting_hours > 0)
      .map((v) => v.waiting_hours)
      .sort((a, b) => a - b);

    if (waiting.length === 0) return 0;
    const mid = Math.floor(waiting.length / 2);

    if (waiting.length % 2 !== 0) {
      return Number(waiting[mid].toFixed(1));
    }
    return Number(((waiting[mid - 1] + waiting[mid]) / 2).toFixed(1));
  }

  /**
   * Calculates maximum waiting time in hours
   */
  public static calculateMaxWaitingTime(vessels: PortVesselActivity[]): number {
    const waiting = vessels.filter((v) => v.status === 'waiting');
    if (waiting.length === 0) return 0;
    return Math.max(...waiting.map((v) => v.waiting_hours));
  }

  /**
   * Calculates the Port Congestion Index (0-100%) and categorizes severity
   */
  public static calculateCongestionIndex(
    waitingCount: number,
    operatingCount: number,
    totalBerths: number
  ): {
    level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    score: number;
  } {
    const safeBerths = Math.max(1, totalBerths);
    const pressureRatio = (waitingCount * 1.5 + operatingCount) / safeBerths;
    const score = Math.min(100, Math.max(5, Math.round(pressureRatio * 35)));

    let level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (score >= 80) {
      level = 'CRITICAL';
    } else if (score >= 60) {
      level = 'HIGH';
    } else if (score >= 35) {
      level = 'MODERATE';
    }

    return { level, score };
  }

  /**
   * Calculates period-over-period percentage delta with direction
   */
  public static calculateTrendPercentage(
    current: number,
    previous: number
  ): { pct: number; isUp: boolean; formatted: string } {
    if (previous === 0) {
      if (current === 0) return { pct: 0, isUp: false, formatted: '0%' };
      return { pct: 100, isUp: true, formatted: '+100%' };
    }

    const delta = ((current - previous) / previous) * 100;
    const pct = Math.abs(Number(delta.toFixed(1)));
    const isUp = delta > 0;
    const formatted = `${isUp ? '+' : delta < 0 ? '-' : ''}${pct}%`;

    return { pct, isUp, formatted };
  }

  /**
   * Calculates terminal berth utilization percentage
   */
  public static calculateTerminalUtilization(occupied: number, total: number): number {
    if (total <= 0) return 0;
    return Math.min(100, Math.round((occupied / total) * 100));
  }

  /**
   * Evaluates operational weather impact on port operations
   */
  public static getOperationalWeatherImpact(
    windKnots: number,
    waveHeightM: number,
    visibilityNm: number
  ): {
    impact_level: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';
    message: string;
  } {
    if (windKnots >= 34 || waveHeightM >= 3.5 || visibilityNm < 1.0) {
      return {
        impact_level: 'HIGH',
        message: 'Severe marine conditions. Pilotage operations suspended; crane operations halted due to high winds.',
      };
    }

    if (windKnots >= 24 || waveHeightM >= 2.0 || visibilityNm < 2.5) {
      return {
        impact_level: 'MODERATE',
        message: 'Elevated sea state and wind gusts. Potential tugboat assist requirements and container handling slowdowns.',
      };
    }

    if (windKnots >= 16 || visibilityNm < 5.0) {
      return {
        impact_level: 'LOW',
        message: 'Minor swell and breeze. Standard port operational throughput with active lookout.',
      };
    }

    return {
      impact_level: 'NONE',
      message: 'Optimal weather conditions. All maritime approaches, pilots, and berths operating at maximum productivity.',
    };
  }

  /**
   * Filters historical calls by selected date range
   */
  public static filterHistoricalVisits(
    visits: PortHistoricalVisit[],
    range: PortDateRange
  ): PortHistoricalVisit[] {
    const now = new Date('2026-09-11T21:00:00Z').getTime();
    let daysCutoff = 30;

    switch (range) {
      case 'today':
        daysCutoff = 1;
        break;
      case '7d':
        daysCutoff = 7;
        break;
      case '30d':
        daysCutoff = 30;
        break;
      case '90d':
        daysCutoff = 90;
        break;
      default:
        daysCutoff = 30;
    }

    const cutoffMs = now - daysCutoff * 24 * 3600 * 1000;
    return visits.filter((v) => new Date(v.arrival_date).getTime() >= cutoffMs);
  }

  /**
   * Generates a comparative analysis between two ports
   */
  public static comparePorts(
    dataA: PortInsightPayload,
    dataB: PortInsightPayload
  ): PortComparisonResult {
    const vlsfoA = dataA.bunkers.find((b) => b.fuel_type === 'VLSFO')?.price_usd_mt || 620;
    const vlsfoB = dataB.bunkers.find((b) => b.fuel_type === 'VLSFO')?.price_usd_mt || 620;

    const lsmgoA = dataA.bunkers.find((b) => b.fuel_type === 'LSMGO')?.price_usd_mt || 880;
    const lsmgoB = dataB.bunkers.find((b) => b.fuel_type === 'LSMGO')?.price_usd_mt || 880;

    const duesA = dataA.costs.reduce((sum, c) => sum + c.rate_usd, 0);
    const duesB = dataB.costs.reduce((sum, c) => sum + c.rate_usd, 0);

    const waitA = dataA.congestion.avg_waiting_hours;
    const waitB = dataB.congestion.avg_waiting_hours;

    const waitingCountA = dataA.activities.filter((v) => v.status === 'waiting').length;
    const waitingCountB = dataB.activities.filter((v) => v.status === 'waiting').length;

    const operatingCountA = dataA.activities.filter((v) => v.status === 'operating').length;
    const operatingCountB = dataB.activities.filter((v) => v.status === 'operating').length;

    const arrivingCountA = dataA.activities.filter((v) => v.status === 'arriving').length;
    const arrivingCountB = dataB.activities.filter((v) => v.status === 'arriving').length;

    const totalBerthsA = dataA.terminals.reduce((s, t) => s + t.berths_total, 0);
    const occupiedBerthsA = dataA.terminals.reduce((s, t) => s + t.berths_occupied, 0);
    const occPctA = totalBerthsA > 0 ? (occupiedBerthsA / totalBerthsA) * 100 : 0;

    const totalBerthsB = dataB.terminals.reduce((s, t) => s + t.berths_total, 0);
    const occupiedBerthsB = dataB.terminals.reduce((s, t) => s + t.berths_occupied, 0);
    const occPctB = totalBerthsB > 0 ? (occupiedBerthsB / totalBerthsB) * 100 : 0;

    const congestionDelta = dataA.congestion.congestion_index_pct - dataB.congestion.congestion_index_pct;
    const waitDelta = waitA - waitB;
    const bunkerDelta = vlsfoA - vlsfoB;
    const duesDelta = duesA - duesB;
    const occDelta = occPctA - occPctB;

    let scoreA = 0;
    let scoreB = 0;
    if (waitA < waitB) scoreA++; else if (waitB < waitA) scoreB++;
    if (congestionDelta < 0) scoreA++; else if (congestionDelta > 0) scoreB++;
    if (bunkerDelta < 0) scoreA++; else if (bunkerDelta > 0) scoreB++;
    if (duesDelta < 0) scoreA++; else if (duesDelta > 0) scoreB++;

    const winner: 'PORT_A' | 'PORT_B' | 'TIED' =
      scoreA > scoreB ? 'PORT_A' : scoreB > scoreA ? 'PORT_B' : 'TIED';

    const comparisonNotes: string[] = [];
    if (Math.abs(waitDelta) > 0.5) {
      comparisonNotes.push(
        waitA < waitB
          ? `${dataA.port.name} saves ~${Math.abs(waitDelta).toFixed(1)} hrs in anchorage waiting time.`
          : `${dataB.port.name} saves ~${Math.abs(waitDelta).toFixed(1)} hrs in anchorage waiting time.`
      );
    }
    if (Math.abs(bunkerDelta) > 5) {
      comparisonNotes.push(
        bunkerDelta < 0
          ? `${dataA.port.name} bunker VLSFO is $${Math.abs(bunkerDelta).toFixed(0)}/MT cheaper.`
          : `${dataB.port.name} bunker VLSFO is $${Math.abs(bunkerDelta).toFixed(0)}/MT cheaper.`
      );
    }
    if (comparisonNotes.length === 0) {
      comparisonNotes.push('Both maritime hubs exhibit comparable turnarounds and operational efficiency.');
    }

    return {
      delta: {
        congestionScore: congestionDelta,
        meanWaitHours: waitDelta,
        berthOccupancyPct: occDelta,
        bunkerPriceDeltaUsd: bunkerDelta,
        daCostDeltaUsd: duesDelta,
      },
      winner,
      comparisonNotes,
      port_a: {
        id: dataA.port.id,
        name: dataA.port.name,
        country: dataA.port.country || 'International',
        avg_waiting_hours: waitA,
        congestion_level: dataA.congestion.current_level,
        congestion_pct: dataA.congestion.congestion_index_pct,
        waiting_count: waitingCountA,
        operating_count: operatingCountA,
        arriving_count: arrivingCountA,
        vlsfo_price_usd: vlsfoA,
        lsmgo_price_usd: lsmgoA,
        est_port_dues_usd: duesA,
        weather_impact: dataA.weather.potential_operational_impact,
      },
      port_b: {
        id: dataB.port.id,
        name: dataB.port.name,
        country: dataB.port.country || 'International',
        avg_waiting_hours: waitB,
        congestion_level: dataB.congestion.current_level,
        congestion_pct: dataB.congestion.congestion_index_pct,
        waiting_count: waitingCountB,
        operating_count: operatingCountB,
        arriving_count: arrivingCountB,
        vlsfo_price_usd: vlsfoB,
        lsmgo_price_usd: lsmgoB,
        est_port_dues_usd: duesB,
        weather_impact: dataB.weather.potential_operational_impact,
      },
      advantages: {
        faster_turnaround:
          waitA < waitB
            ? `${dataA.port.name} averages ${(waitB - waitA).toFixed(1)} hrs less waiting time.`
            : `${dataB.port.name} averages ${(waitA - waitB).toFixed(1)} hrs less waiting time.`,
        lower_bunker_cost:
          vlsfoA < vlsfoB
            ? `${dataA.port.name} VLSFO is $${(vlsfoB - vlsfoA).toFixed(0)}/MT cheaper.`
            : `${dataB.port.name} VLSFO is $${(vlsfoA - vlsfoB).toFixed(0)}/MT cheaper.`,
        lower_port_dues:
          duesA < duesB
            ? `${dataA.port.name} total port tariff is lower by $${(duesB - duesA).toLocaleString()}.`
            : `${dataB.port.name} total port tariff is lower by $${(duesA - duesB).toLocaleString()}.`,
        lower_congestion:
          dataA.congestion.congestion_index_pct < dataB.congestion.congestion_index_pct
            ? `${dataA.port.name} has lower berth congestion index (${dataA.congestion.congestion_index_pct}% vs ${dataB.congestion.congestion_index_pct}%).`
            : `${dataB.port.name} has lower berth congestion index (${dataB.congestion.congestion_index_pct}% vs ${dataA.congestion.congestion_index_pct}%).`,
      },
    };
  }
}
