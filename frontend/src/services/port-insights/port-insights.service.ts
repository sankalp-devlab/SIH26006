/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 13: Port Insights Intelligence & Data Service
 */

import type { Port } from '../../types/port';
import type { Vessel } from '../../types/vessel';
import type {
  PortInsightPayload,
  PortVesselActivity,
  PortTerminalDetail,
  PortLineupItem,
  PortCostItem,
  PortBunkerPrice,
  PortWeatherData,
  PortCongestionAnalytics,
  PortHistoricalVisit,
} from '../../types/port-insights';
import { PortAnalyticsEngine } from './port-analytics-engine';

export class PortInsightsService {
  /**
   * Generates a complete, high-fidelity PortInsightPayload for a given port
   */
  public static getPortInsight(port: Port, fleetVessels: Vessel[] = []): PortInsightPayload {
    if (!port || typeof port.name !== 'string' || !port.name.trim()) {
      throw new TypeError('PortInsightsService.getPortInsight: A valid Port object with a non-empty name is required.');
    }

    // 1. Terminals
    const terminals = this.getTerminalsForPort(port);

    // 2. Vessel Activity & Lineups
    const { activities, lineups } = this.generateActivitiesAndLineups(port, terminals, fleetVessels);

    // 3. Port Costs
    const costs = this.getPortCosts(port);

    // 4. Bunker Prices
    const bunkers = this.getBunkerPrices(port);

    // 5. Weather
    const weather = this.getWeatherData(port);

    // 6. Congestion
    const waitingCount = activities.filter((a) => a.status === 'waiting').length;
    const operatingCount = activities.filter((a) => a.status === 'operating').length;
    const arrivingCount = activities.filter((a) => a.status === 'arriving').length;
    const totalBerths = terminals.reduce((sum, t) => sum + t.berths_total, 0);

    const congestionScore = PortAnalyticsEngine.calculateCongestionIndex(waitingCount, operatingCount, totalBerths);
    const avgWaitHours = PortAnalyticsEngine.calculateAverageWaitingTime(activities);
    const medianWaitHours = PortAnalyticsEngine.calculateMedianWaitingTime(activities);
    const maxWaitHours = PortAnalyticsEngine.calculateMaxWaitingTime(activities);

    const congestion: PortCongestionAnalytics = {
      current_level: congestionScore.level,
      congestion_index_pct: congestionScore.score,
      avg_waiting_hours: avgWaitHours,
      median_waiting_hours: medianWaitHours,
      max_waiting_hours: maxWaitHours,
      vessels_in_anchorage: waitingCount,
      vessels_at_berth: operatingCount,
      vessels_expected_48h: arrivingCount,
      historical_trend: this.generateHistoricalCongestionTrend(congestionScore.score, avgWaitHours),
    };

    // 7. Historical Visits
    const historicalVisits = this.generateHistoricalVisits(port, fleetVessels);

    return {
      port,
      activities,
      terminals,
      lineups,
      costs,
      bunkers,
      weather,
      congestion,
      historicalVisits,
    };
  }

  private static getTerminalsForPort(port: Port): PortTerminalDetail[] {
    const name = port.name.toLowerCase();

    if (name.includes('rotterdam')) {
      return [
        {
          id: 1,
          port_id: port.id,
          name: 'Maasvlakte II Deepwater Quay (APM & RWG)',
          terminal_type: 'Container',
          max_draft_m: 20.0,
          max_loa_m: 400,
          berths_total: 12,
          berths_occupied: 10,
          operating_vessels_count: 10,
          waiting_vessels_count: 4,
          utilization_pct: 83,
          handling_rate_mt_day: 35000,
          restrictions: 'Unrestricted 24/7 tidal access for Ultra-Large Container Vessels (ULCVs)',
        },
        {
          id: 2,
          port_id: port.id,
          name: 'Botlek & Europoort Liquid Energy Jetties',
          terminal_type: 'Crude Oil',
          max_draft_m: 22.5,
          max_loa_m: 380,
          berths_total: 10,
          berths_occupied: 7,
          operating_vessels_count: 7,
          waiting_vessels_count: 2,
          utilization_pct: 70,
          handling_rate_mt_day: 48000,
          restrictions: 'VLCC discharge allowed at 22.5m draught with pilotage clearance',
        },
        {
          id: 3,
          port_id: port.id,
          name: 'EMO Dry Bulk Iron Ore & Coal Terminal',
          terminal_type: 'Dry Bulk',
          max_draft_m: 23.0,
          max_loa_m: 360,
          berths_total: 6,
          berths_occupied: 5,
          operating_vessels_count: 5,
          waiting_vessels_count: 3,
          utilization_pct: 83,
          handling_rate_mt_day: 60000,
          restrictions: 'High-speed grab gantry cranes for Capesize dischargers',
        },
      ];
    }

    if (name.includes('singapore')) {
      return [
        {
          id: 4,
          port_id: port.id,
          name: 'Pasir Panjang & Tuas Mega Container Terminal',
          terminal_type: 'Container',
          max_draft_m: 18.5,
          max_loa_m: 400,
          berths_total: 18,
          berths_occupied: 16,
          operating_vessels_count: 16,
          waiting_vessels_count: 7,
          utilization_pct: 89,
          handling_rate_mt_day: 42000,
          restrictions: 'Automated electric rail-mounted gantry operations',
        },
        {
          id: 5,
          port_id: port.id,
          name: 'Jurong Island Liquid Chemical & Petroleum Pier',
          terminal_type: 'Crude Oil',
          max_draft_m: 17.5,
          max_loa_m: 330,
          berths_total: 14,
          berths_occupied: 11,
          operating_vessels_count: 11,
          waiting_vessels_count: 5,
          utilization_pct: 79,
          handling_rate_mt_day: 32000,
          restrictions: 'Strict vapor recovery compliance on all parcel loading',
        },
      ];
    }

    if (name.includes('ras tanura')) {
      return [
        {
          id: 6,
          port_id: port.id,
          name: 'Sea Island VLCC/ULCC Deepwater Berths',
          terminal_type: 'Crude Oil',
          max_draft_m: 22.0,
          max_loa_m: 420,
          berths_total: 8,
          berths_occupied: 6,
          operating_vessels_count: 6,
          waiting_vessels_count: 4,
          utilization_pct: 75,
          handling_rate_mt_day: 80000,
          restrictions: 'Dedicated Arabian Heavy/Light loading arms with loading rates up to 12k MT/hr',
        },
        {
          id: 7,
          port_id: port.id,
          name: 'North Pier Product & Gas Berths',
          terminal_type: 'Chemical',
          max_draft_m: 14.5,
          max_loa_m: 240,
          berths_total: 6,
          berths_occupied: 4,
          operating_vessels_count: 4,
          waiting_vessels_count: 1,
          utilization_pct: 67,
          handling_rate_mt_day: 20000,
        },
      ];
    }

    // Default generic terminals for any port
    return [
      {
        id: port.id * 10 + 1,
        port_id: port.id,
        name: `${port.name} Multi-Purpose Terminal 1`,
        terminal_type: 'Container',
        max_draft_m: 14.5,
        max_loa_m: 290,
        berths_total: 6,
        berths_occupied: 4,
        operating_vessels_count: 4,
        waiting_vessels_count: 2,
        utilization_pct: 67,
        handling_rate_mt_day: 18000,
      },
      {
        id: port.id * 10 + 2,
        port_id: port.id,
        name: `${port.name} Bulk & Energy Quay 2`,
        terminal_type: 'Dry Bulk',
        max_draft_m: 13.0,
        max_loa_m: 250,
        berths_total: 4,
        berths_occupied: 3,
        operating_vessels_count: 3,
        waiting_vessels_count: 1,
        utilization_pct: 75,
        handling_rate_mt_day: 14000,
      },
    ];
  }

  private static generateActivitiesAndLineups(
    port: Port,
    terminals: PortTerminalDetail[],
    fleetVessels: Vessel[]
  ): { activities: PortVesselActivity[]; lineups: PortLineupItem[] } {
    const activities: PortVesselActivity[] = [];
    const lineups: PortLineupItem[] = [];

    // Realistic vessel name samples
    const sampleNames = [
      'Starlight Carrier',
      'Nordic Aurora',
      'Pacific Voyager',
      'Aegean Glory',
      'Atlantic Pioneer',
      'Oriental Falcon',
      'Crested Mariner',
      'Horizon Trader',
      'Boreal Titan',
      'Solaris Highway',
      'Golden Prosperity',
      'Ever Fortune',
    ];

    // Build Arriving Vessels (Next 48h)
    for (let i = 0; i < 4; i++) {
      const v = fleetVessels[i % Math.max(1, fleetVessels.length)];
      const name = v?.name || sampleNames[i % sampleNames.length];
      const term = terminals[i % terminals.length];

      activities.push({
        id: `act-arr-${port.id}-${i}`,
        vessel_id: v?.id || i + 1,
        vessel_name: name,
        vessel_type: v?.vessel_type || (i % 2 === 0 ? 'Bulk Carrier' : 'Crude Oil Tanker'),
        dwt: v?.capacity_tons || 65000 + i * 15000,
        flag: v?.flag || 'Liberia',
        status: 'arriving',
        terminal_name: term.name,
        berth: `Berth ${i + 1}`,
        cargo_type: term.terminal_type === 'Container' ? 'TEU Containers' : term.terminal_type === 'Crude Oil' ? 'Crude Oil' : 'Grain / Bulk',
        cargo_quantity_mt: 45000 + i * 12000,
        eta: new Date(Date.now() + (i + 1) * 12 * 3600 * 1000).toISOString(),
        waiting_hours: 0,
        operation_type: i % 2 === 0 ? 'discharging' : 'loading',
        origin_port: 'Ras Tanura (SARST)',
        destination_port: port.name,
      });
    }

    // Build Waiting Vessels at Anchorage
    const waitHours = [18.5, 34.0, 12.0, 48.5, 22.0];
    for (let i = 0; i < 4; i++) {
      const v = fleetVessels[(i + 4) % Math.max(1, fleetVessels.length)];
      const name = sampleNames[(i + 4) % sampleNames.length];
      const term = terminals[i % terminals.length];

      activities.push({
        id: `act-wait-${port.id}-${i}`,
        vessel_id: v?.id || i + 10,
        vessel_name: name,
        vessel_type: i % 2 === 0 ? 'Capesize Bulker' : 'Suezmax Tanker',
        dwt: 85000 + i * 20000,
        flag: 'Marshall Islands',
        status: 'waiting',
        terminal_name: term.name,
        berth: `Awaiting Berth allocation`,
        cargo_type: term.terminal_type === 'Crude Oil' ? 'Arabian Light Crude' : 'Iron Ore Pellet',
        cargo_quantity_mt: 72000 + i * 15000,
        arrival_time: new Date(Date.now() - waitHours[i] * 3600 * 1000).toISOString(),
        waiting_hours: waitHours[i],
        operation_type: 'discharging',
        origin_port: 'Port Hedland (AUPHE)',
        destination_port: port.name,
        delay_reason: waitHours[i] > 30 ? 'Tidal draft window & berth congestion' : 'Customs inspection & documentation',
      });

      // Lineup entry
      lineups.push({
        queue_position: i + 1,
        vessel_id: v?.id || i + 10,
        vessel_name: name,
        vessel_type: i % 2 === 0 ? 'Capesize Bulker' : 'Suezmax Tanker',
        terminal_name: term.name,
        eta: new Date(Date.now() - (waitHours[i] - 4) * 3600 * 1000).toISOString(),
        cargo_desc: `${(72000 + i * 15000).toLocaleString()} MT ${term.terminal_type}`,
        operation: 'discharging',
        estimated_berthing: new Date(Date.now() + (i + 1) * 8 * 3600 * 1000).toISOString(),
        waiting_hours: waitHours[i],
        priority: i === 0 ? 'express' : waitHours[i] > 30 ? 'delayed' : 'normal',
      });
    }

    // Build Operating Vessels at Berth
    for (let i = 0; i < 4; i++) {
      const v = fleetVessels[(i + 8) % Math.max(1, fleetVessels.length)];
      const name = sampleNames[(i + 8) % sampleNames.length];
      const term = terminals[i % terminals.length];

      activities.push({
        id: `act-op-${port.id}-${i}`,
        vessel_id: v?.id || i + 20,
        vessel_name: name,
        vessel_type: term.terminal_type === 'Crude Oil' ? 'Aframax Tanker' : 'Post-Panamax Bulker',
        dwt: 60000 + i * 14000,
        flag: 'Panama',
        status: 'operating',
        terminal_name: term.name,
        berth: `Berth Quay ${i + 1}`,
        cargo_type: term.terminal_type === 'Crude Oil' ? 'Low Sulfur Fuel Oil' : 'Wheat Grain',
        cargo_quantity_mt: 54000 + i * 8000,
        operation_type: i % 2 === 0 ? 'loading' : 'discharging',
        operation_start: new Date(Date.now() - (14 + i * 6) * 3600 * 1000).toISOString(),
        estimated_completion: new Date(Date.now() + (10 + i * 5) * 3600 * 1000).toISOString(),
        waiting_hours: 8.5,
        origin_port: port.name,
        destination_port: 'Singapore (SGSIN)',
      });
    }

    return { activities, lineups };
  }

  private static getPortCosts(port: Port): PortCostItem[] {
    const isMajor = port.name.toLowerCase().includes('rotterdam') || port.name.toLowerCase().includes('singapore');

    return [
      {
        category: 'Port Dues',
        item_name: 'Harbor Master Navigation Dues',
        basis: 'per_gt',
        rate_usd: isMajor ? 12500 : 8200,
        currency: 'USD',
        notes: 'Calculated on gross registered tonnage (GRT) per 7-day stay',
        last_updated: '2026-09-01',
      },
      {
        category: 'Pilotage',
        item_name: 'Compulsory Inward/Outward Sea Pilotage',
        basis: 'per_call',
        rate_usd: isMajor ? 4800 : 3100,
        currency: 'USD',
        notes: 'Includes pilot boarding vessel at outer sea fairway station',
        last_updated: '2026-09-01',
      },
      {
        category: 'Towage / Tugboat',
        item_name: 'Harbor Tug Assist (2 Tugs In & Out)',
        basis: 'per_hour',
        rate_usd: isMajor ? 6200 : 4400,
        currency: 'USD',
        notes: 'ASD 70-ton bollard pull escort and berthing assistance',
        last_updated: '2026-09-01',
      },
      {
        category: 'Berth Hire',
        item_name: 'Quay Wall & Moorings Occupation Fee',
        basis: 'per_day',
        rate_usd: isMajor ? 3200 : 2100,
        currency: 'USD',
        notes: 'Standard laytime berth hire per calendar day or pro rata',
        last_updated: '2026-09-01',
      },
      {
        category: 'Agency Fees',
        item_name: 'Port Agency & Husbandry Representation',
        basis: 'flat',
        rate_usd: 2800,
        currency: 'USD',
        notes: 'FONASBA standard agency charter-party fee',
        last_updated: '2026-09-01',
      },
      {
        category: 'Waste Disposal / Security',
        item_name: 'ISPS Security & Marpol Sludge Reception',
        basis: 'per_call',
        rate_usd: 1450,
        currency: 'USD',
        notes: 'Compliant Annex I/V bilge reception and security compliance',
        last_updated: '2026-09-01',
      },
    ];
  }

  private static getBunkerPrices(port: Port): PortBunkerPrice[] {
    const isRotterdam = port.name.toLowerCase().includes('rotterdam');
    const isSingapore = port.name.toLowerCase().includes('singapore');

    const vlsfoBase = isSingapore ? 618 : isRotterdam ? 595 : 625;
    const lsmgoBase = isRotterdam ? 865 : isSingapore ? 890 : 880;

    return [
      {
        fuel_type: 'VLSFO',
        price_usd_mt: vlsfoBase,
        delta_usd: 4.5,
        source: 'Platts / Bunkerwire Benchmark',
        timestamp: '2026-09-11 14:00 UTC',
        is_live: true,
      },
      {
        fuel_type: 'LSMGO',
        price_usd_mt: lsmgoBase,
        delta_usd: -2.0,
        source: 'Argus Marine Fuels',
        timestamp: '2026-09-11 14:00 UTC',
        is_live: true,
      },
      {
        fuel_type: 'MGO',
        price_usd_mt: lsmgoBase - 25,
        delta_usd: 1.0,
        source: 'Argus Marine Fuels',
        timestamp: '2026-09-11 14:00 UTC',
        is_live: true,
      },
      {
        fuel_type: 'HFO',
        price_usd_mt: vlsfoBase - 110,
        delta_usd: -3.5,
        source: 'S&P Global Commodity Insights',
        timestamp: '2026-09-11 14:00 UTC',
        is_live: true,
      },
      {
        fuel_type: 'LNG',
        price_usd_mt: 740,
        delta_usd: 6.0,
        source: 'Bunker Holding Global Index',
        timestamp: '2026-09-11 14:00 UTC',
        is_live: false,
      },
    ];
  }

  private static getWeatherData(port: Port): PortWeatherData {
    const isTropical = (port.latitude || 0) < 20 && (port.latitude || 0) > -20;

    const wind = isTropical ? 14 : 22;
    const wave = isTropical ? 1.2 : 2.1;
    const vis = 8.5;

    const impact = PortAnalyticsEngine.getOperationalWeatherImpact(wind, wave, vis);

    return {
      temperature_c: isTropical ? 29 : 17,
      condition: isTropical ? 'Partly Cloudy' : 'Clear',
      wind_speed_knots: wind,
      wind_direction: 'ENE (065°)',
      visibility_nm: vis,
      wave_height_m: wave,
      precipitation_mm: 0.0,
      potential_operational_impact: impact.message,
      impact_level: impact.impact_level,
      forecast: [
        { day: 'Today', temp_c: isTropical ? 29 : 17, condition: 'Partly Cloudy', wind_knots: wind },
        { day: 'Tomorrow', temp_c: isTropical ? 30 : 16, condition: 'Clear', wind_knots: wind - 3 },
        { day: '+2 Days', temp_c: isTropical ? 28 : 18, condition: 'Rain Shower', wind_knots: wind + 4 },
        { day: '+3 Days', temp_c: isTropical ? 29 : 15, condition: 'Clear', wind_knots: wind },
      ],
    };
  }

  private static generateHistoricalCongestionTrend(
    currentScore: number,
    currentWaitHours: number
  ): { date: string; waiting_hours: number; vessels_waiting: number; congestion_pct: number }[] {
    const trend = [];
    const days = 7;
    const now = new Date('2026-09-11T21:00:00Z').getTime();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * 24 * 3600 * 1000);
      const dayLabel = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const variance = (i * 1.5 - 4);
      trend.push({
        date: dayLabel,
        waiting_hours: Number(Math.max(4, currentWaitHours + variance).toFixed(1)),
        vessels_waiting: Math.max(1, Math.round(5 + variance * 0.4)),
        congestion_pct: Math.min(100, Math.max(15, Math.round(currentScore + variance * 2))),
      });
    }

    return trend;
  }

  private static generateHistoricalVisits(port: Port, _fleetVessels: Vessel[]): PortHistoricalVisit[] {
    const visits: PortHistoricalVisit[] = [];
    const now = new Date('2026-09-11T21:00:00Z').getTime();

    const sampleVisits = [
      { name: 'Baltic Osprey', type: 'Handysize Bulker', cargo: 'Fertilizer in Bulk', qty: 32000, daysAgo: 3, turnaround: 2.8, wait: 14.2 },
      { name: 'Starlight Carrier', type: 'Panamax Bulker', cargo: 'Thermal Coal', qty: 74000, daysAgo: 6, turnaround: 3.5, wait: 22.0 },
      { name: 'Nordic Aurora', type: 'Aframax Tanker', cargo: 'Crude Oil', qty: 98000, daysAgo: 10, turnaround: 2.1, wait: 11.5 },
      { name: 'Crested Mariner', type: 'Container Vessel', cargo: '4,200 TEU Consignment', qty: 52000, daysAgo: 14, turnaround: 1.4, wait: 8.0 },
      { name: 'Pacific Voyager', type: 'Suezmax Tanker', cargo: 'Light Sweet Crude', qty: 135000, daysAgo: 21, turnaround: 2.5, wait: 18.0 },
      { name: 'Aegean Glory', type: 'Capesize Bulker', cargo: 'Iron Ore Fines', qty: 172000, daysAgo: 28, turnaround: 4.2, wait: 36.5 },
      { name: 'Boreal Titan', type: 'LNG Carrier', cargo: 'Liquefied Methane', qty: 68000, daysAgo: 42, turnaround: 1.8, wait: 6.5 },
      { name: 'Horizon Trader', type: 'General Cargo', cargo: 'Steel Billets & Coils', qty: 28000, daysAgo: 65, turnaround: 3.0, wait: 16.0 },
    ];

    sampleVisits.forEach((v, idx) => {
      const arr = new Date(now - v.daysAgo * 24 * 3600 * 1000);
      const dep = new Date(arr.getTime() + v.turnaround * 24 * 3600 * 1000);

      visits.push({
        id: `hist-visit-${port.id}-${idx}`,
        vessel_id: idx + 101,
        vessel_name: v.name,
        vessel_type: v.type,
        arrival_date: arr.toISOString(),
        departure_date: dep.toISOString(),
        terminal_name: `${port.name} Main Terminal`,
        cargo_handled: v.cargo,
        quantity_mt: v.qty,
        turnaround_days: v.turnaround,
        waiting_hours: v.wait,
        status: 'completed',
      });
    });

    return visits;
  }

  /**
   * Generates and triggers download of a comprehensive CSV port intelligence recap
   */
  public static exportPortToCsv(payload: PortInsightPayload): void {
    const lines: string[] = [];
    const p = payload.port;

    lines.push(`SIH 26006 PORT INTELLIGENCE DOSSIER`);
    lines.push(`Port Name,${p.name}`);
    lines.push(`Country,${p.country || 'International'}`);
    lines.push(`UN/LOCODE,${p.unlocode || 'N/A'}`);
    lines.push(`Coordinates,${p.latitude || 'N/A'} N ${p.longitude || 'N/A'} E`);
    lines.push(`Port Type,${p.port_type || 'Seaport'}`);
    lines.push(`Congestion Level,${payload.congestion.current_level} (${payload.congestion.congestion_index_pct}%)`);
    lines.push(`Average Waiting Time,${payload.congestion.avg_waiting_hours} Hours`);
    lines.push(`Vessels at Berth,${payload.congestion.vessels_at_berth}`);
    lines.push(`Vessels at Anchorage,${payload.congestion.vessels_in_anchorage}`);
    lines.push(``);

    lines.push(`TERMINALS OCCUPANCY`);
    lines.push(`Terminal Name,Type,Max Draft (m),Total Berths,Occupied,Utilization %`);
    payload.terminals.forEach((t) => {
      lines.push(`"${t.name}",${t.terminal_type},${t.max_draft_m},${t.berths_total},${t.berths_occupied},${t.utilization_pct}%`);
    });
    lines.push(``);

    lines.push(`ACTIVE VESSEL LINEUP QUEUE`);
    lines.push(`Pos,Vessel,Type,Terminal,ETA,Cargo,Waiting Time (hrs),Priority`);
    payload.lineups.forEach((l) => {
      lines.push(`${l.queue_position},"${l.vessel_name}",${l.vessel_type},"${l.terminal_name}",${l.eta},"${l.cargo_desc}",${l.waiting_hours},${l.priority}`);
    });
    lines.push(``);

    lines.push(`PORT TARIFF & DUES ESTIMATE`);
    lines.push(`Category,Item,Basis,Rate (USD),Notes`);
    payload.costs.forEach((c) => {
      lines.push(`${c.category},"${c.item_name}",${c.basis},$${c.rate_usd},"${c.notes}"`);
    });
    lines.push(``);

    lines.push(`BUNKER FUEL BENCHMARKS`);
    lines.push(`Fuel Type,Price ($/MT),Source,Timestamp`);
    payload.bunkers.forEach((b) => {
      lines.push(`${b.fuel_type},$${b.price_usd_mt},"${b.source}",${b.timestamp}`);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.map((e) => e).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `port_insights_${p.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
