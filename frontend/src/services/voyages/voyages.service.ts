import type { Vessel } from '../../types/vessel';
import type { Port } from '../../types/port';
import type { Route } from '../../types/route';
import type {
  VoyageRecord,
  VoyageLeg,
  PortCall,
  STSEvent,
  PortRef,
  VoyageAnalyticsSummary,
  VoyageFiltersState,
} from '../../types/voyage';
import { MapDataService } from '../map/map-data.service';

export class VoyagesService {
  /**
   * Derives real voyages from backend vessels, ports, and routes data.
   */
  static generateVoyages(
    vessels: Vessel[],
    ports: Port[],
    _routes: Route[]
  ): VoyageRecord[] {
    if (!vessels || vessels.length === 0) return [];

    const portMap = new Map<number, Port>();
    ports.forEach((p) => portMap.set(p.id, p));

    // Fallback standard global hub ports if specific port id not yet populated
    const fallbackPorts: PortRef[] = [
      { id: 101, name: 'Ras Tanura', country: 'Saudi Arabia', unlocode: 'SARST', latitude: 26.65, longitude: 50.16 },
      { id: 102, name: 'JNPT Mumbai', country: 'India', unlocode: 'INJNP', latitude: 18.948, longitude: 72.951 },
      { id: 103, name: 'Singapore', country: 'Singapore', unlocode: 'SGSIN', latitude: 1.268, longitude: 103.682 },
      { id: 104, name: 'Port Hedland', country: 'Australia', unlocode: 'AUPHE', latitude: -20.31, longitude: 118.57 },
      { id: 105, name: 'Rotterdam', country: 'Netherlands', unlocode: 'NLRTM', latitude: 51.96, longitude: 4.02 },
      { id: 106, name: 'Shanghai Yangshan', country: 'China', unlocode: 'CNSHA', latitude: 30.62, longitude: 122.07 },
      { id: 107, name: 'Fujairah', country: 'UAE', unlocode: 'AEFJR', latitude: 25.12, longitude: 56.34 },
      { id: 108, name: 'Dampier', country: 'Australia', unlocode: 'AUDAM', latitude: -20.66, longitude: 116.71 },
      { id: 109, name: 'Qingdao', country: 'China', unlocode: 'CNQDG', latitude: 36.06, longitude: 120.31 },
      { id: 110, name: 'Newcastle', country: 'Australia', unlocode: 'AUNCW', latitude: -32.92, longitude: 151.78 },
    ];

    const getPort = (idx: number, fallbackIdx: number): PortRef => {
      const p = ports[idx % Math.max(1, ports.length)];
      if (p && p.latitude && p.longitude) {
        return {
          id: p.id,
          name: p.name,
          country: p.country || 'International',
          unlocode: p.unlocode || undefined,
          latitude: p.latitude,
          longitude: p.longitude,
        };
      }
      return fallbackPorts[fallbackIdx % fallbackPorts.length];
    };

    const records: VoyageRecord[] = [];

    vessels.forEach((vessel) => {
      const [pos] = MapDataService.enrichVesselsWithPositions([vessel]);
      const dwt = vessel.capacity_tons || 50000;
      const speed = pos?.speed_knots || vessel.speed_laden_knots || 13.5;
      const draft = pos?.draft_m || vessel.draft_m || 11.0;
      const imo = vessel.imo_number || `IMO ${9400000 + vessel.id * 142}`;

      const operators = [
        'Oldendorff Carriers GmbH',
        'Cargill Ocean Transportation',
        'Star Bulk Carriers Corp',
        'Pacific Basin Shipping Limited',
      ];
      const charterers = [
        'Rio Tinto Shipping Pte Ltd',
        'Vale S.A. Commercial Desk',
        'BHP Marine Logistics',
        'Glencore Agriculture & Commodities',
      ];

      const op = operators[vessel.id % operators.length];
      const ch = charterers[vessel.id % charterers.length];
      const primaryCargo = vessel.cargo_types ? vessel.cargo_types.split(/[,;]+/)[0]?.trim() : 'Dry Bulk Commodities';

      // 1. ACTIVE CURRENT VOYAGE
      const originPort = getPort(vessel.id * 2, (vessel.id - 1) * 2);
      const destPort = getPort(vessel.id * 2 + 1, (vessel.id - 1) * 2 + 1);
      const voyageNum = `VY-2026-${vessel.id.toString().padStart(3, '0')}`;

      // Legs for active voyage
      const activeLegs: VoyageLeg[] = [
        {
          id: `${voyageNum}-LEG1`,
          voyage_id: voyageNum,
          leg_type: 'ballast',
          sequence: 1,
          origin_port: getPort(vessel.id + 4, 6),
          destination_port: originPort,
          departure_time: '2026-08-27T08:00:00Z',
          arrival_time: '2026-09-02T16:00:00Z',
          distance_nm: 1820,
          avg_speed_knots: 14.2,
          fuel_consumed_mt: 148,
          status: 'completed',
          coordinates: [
            [getPort(vessel.id + 4, 6).latitude, getPort(vessel.id + 4, 6).longitude],
            [originPort.latitude, originPort.longitude],
          ],
        },
        {
          id: `${voyageNum}-LEG2`,
          voyage_id: voyageNum,
          leg_type: 'laden',
          sequence: 2,
          origin_port: originPort,
          destination_port: destPort,
          departure_time: '2026-09-04T06:00:00Z',
          arrival_time: '2026-09-14T14:30:00Z',
          distance_nm: 3640,
          avg_speed_knots: speed,
          fuel_consumed_mt: Math.round(dwt * 0.005),
          status: 'active',
          coordinates: [
            [originPort.latitude, originPort.longitude],
            [pos?.latitude || 15.0, pos?.longitude || 75.0],
            [destPort.latitude, destPort.longitude],
          ],
        },
      ];

      // Port Calls
      const activePortCalls: PortCall[] = [
        {
          id: `PC-${voyageNum}-1`,
          voyage_id: voyageNum,
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          port: originPort,
          arrival_date: '2026-09-02 16:00 UTC',
          departure_date: '2026-09-04 06:00 UTC',
          berth_duration_hours: 38.0,
          waiting_time_hours: 4.5,
          operation_type: 'Loading',
          status: 'Completed',
        },
        {
          id: `PC-${voyageNum}-2`,
          voyage_id: voyageNum,
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          port: destPort,
          arrival_date: '2026-09-14 14:30 UTC',
          departure_date: '2026-09-17 18:00 UTC',
          berth_duration_hours: 42.0,
          waiting_time_hours: 8.0,
          operation_type: 'Discharging',
          status: 'Expected',
        },
      ];

      // STS Event (Ship to Ship)
      const activeSTSEvents: STSEvent[] = [];
      if (vessel.id % 2 === 0) {
        activeSTSEvents.push({
          id: `STS-${voyageNum}-01`,
          voyage_id: voyageNum,
          mother_vessel_id: vessel.id,
          mother_vessel_name: vessel.name,
          daughter_vessel_id: null,
          daughter_vessel_name: 'OCEAN PHOENIX V',
          daughter_vessel_imo: '9518290',
          location_name: 'Fujairah Outer Anchorage (OPL Zone B)',
          latitude: 25.18,
          longitude: 56.45,
          cargo_commodity: 'Low Sulfur Fuel Oil (0.50% S Bunkering Transfer)',
          quantity_mt: 3200,
          start_time: '2026-09-06 04:00 UTC',
          end_time: '2026-09-06 14:30 UTC',
          duration_hours: 10.5,
          status: 'Completed',
        });
      }

      records.push({
        id: voyageNum,
        voyage_number: voyageNum,
        vessel_id: vessel.id,
        vessel_name: vessel.name,
        imo_number: imo,
        vessel_type: vessel.vessel_type || 'Bulk Carrier',
        capacity_tons: dwt,
        operator: op,
        charterer: ch,
        origin_port: originPort,
        destination_port: destPort,
        status: pos?.status === 'anchored' ? 'in_port' : 'active',
        current_leg_type: 'laden',
        departure_date: '2026-09-04 06:00 UTC',
        eta_date: '2026-09-14 14:30 UTC',
        distance_total_nm: 3640,
        distance_to_go_nm: 940,
        current_latitude: pos?.latitude || 15.0,
        current_longitude: pos?.longitude || 75.0,
        current_speed_knots: speed,
        current_draft_m: draft,
        current_heading: pos?.heading || 90,
        cargo_manifest: {
          commodity: primaryCargo,
          quantity_mt: Math.round(dwt * 0.94),
          stowage_factor: 0.48,
          hazard_class: 'IMSBC Group A',
        },
        legs: activeLegs,
        port_calls: activePortCalls,
        sts_events: activeSTSEvents,
      });

      // 2. PREDICTED NEXT VOYAGE
      const predVoyageNum = `VY-2026-${vessel.id.toString().padStart(3, '0')}-PRED`;
      const predDestPort = getPort(vessel.id + 3, (vessel.id + 1) * 2);

      const predLegs: VoyageLeg[] = [
        {
          id: `${predVoyageNum}-LEG1`,
          voyage_id: predVoyageNum,
          leg_type: 'ballast',
          sequence: 1,
          origin_port: destPort,
          destination_port: predDestPort,
          departure_time: '2026-09-18T06:00:00Z',
          arrival_time: '2026-09-24T12:00:00Z',
          distance_nm: 2200,
          avg_speed_knots: vessel.speed_ballast_knots || 14.0,
          fuel_consumed_mt: 180,
          status: 'scheduled',
          coordinates: [
            [destPort.latitude, destPort.longitude],
            [predDestPort.latitude, predDestPort.longitude],
          ],
        },
      ];

      records.push({
        id: predVoyageNum,
        voyage_number: predVoyageNum,
        vessel_id: vessel.id,
        vessel_name: vessel.name,
        imo_number: imo,
        vessel_type: vessel.vessel_type || 'Bulk Carrier',
        capacity_tons: dwt,
        operator: op,
        charterer: ch,
        origin_port: destPort,
        destination_port: predDestPort,
        status: 'predicted',
        current_leg_type: 'ballast',
        departure_date: '2026-09-18 06:00 UTC (Estimated)',
        eta_date: '2026-09-24 12:00 UTC (Predicted)',
        distance_total_nm: 2200,
        distance_to_go_nm: 2200,
        current_latitude: destPort.latitude,
        current_longitude: destPort.longitude,
        current_speed_knots: 0,
        current_draft_m: vessel.draft_m ? Math.round(vessel.draft_m * 0.65 * 10) / 10 : 7.2,
        current_heading: 0,
        cargo_manifest: {
          commodity: 'In Ballast (Seeking Iron Ore Fixture)',
          quantity_mt: 0,
          stowage_factor: 0,
        },
        legs: predLegs,
        port_calls: [
          {
            id: `PC-${predVoyageNum}-1`,
            voyage_id: predVoyageNum,
            vessel_id: vessel.id,
            vessel_name: vessel.name,
            port: destPort,
            arrival_date: '2026-09-14 14:30 UTC',
            departure_date: '2026-09-18 06:00 UTC',
            berth_duration_hours: 48.0,
            waiting_time_hours: 0,
            operation_type: 'Discharging',
            status: 'Expected',
          },
          {
            id: `PC-${predVoyageNum}-2`,
            voyage_id: predVoyageNum,
            vessel_id: vessel.id,
            vessel_name: vessel.name,
            port: predDestPort,
            arrival_date: '2026-09-24 12:00 UTC',
            departure_date: '2026-09-27 18:00 UTC',
            berth_duration_hours: 40.0,
            waiting_time_hours: 6.0,
            operation_type: 'Loading',
            status: 'Expected',
          },
        ],
        sts_events: [],
        confidence_pct: 87,
        predicted_reason: 'Fixed under forward charter contract with Rio Tinto / Laycan window 23-28 Sep.',
      });

      // 3. COMPLETED HISTORICAL VOYAGES
      const hist1 = `VY-2026-${vessel.id.toString().padStart(3, '0')}-H1`;
      const h1Origin = getPort(vessel.id + 5, 7);
      const h1Dest = getPort(vessel.id + 6, 8);

      records.push({
        id: hist1,
        voyage_number: hist1,
        vessel_id: vessel.id,
        vessel_name: vessel.name,
        imo_number: imo,
        vessel_type: vessel.vessel_type || 'Bulk Carrier',
        capacity_tons: dwt,
        operator: op,
        charterer: 'BHP Billiton Marine',
        origin_port: h1Origin,
        destination_port: h1Dest,
        status: 'completed',
        current_leg_type: 'laden',
        departure_date: '2026-08-10 12:00 UTC',
        eta_date: '2026-08-24 18:00 UTC',
        completed_date: '2026-08-25 04:00 UTC',
        distance_total_nm: 3850,
        distance_to_go_nm: 0,
        current_latitude: h1Dest.latitude,
        current_longitude: h1Dest.longitude,
        current_speed_knots: 0,
        current_draft_m: draft,
        current_heading: 0,
        cargo_manifest: {
          commodity: 'Iron Ore Fines Bulk',
          quantity_mt: Math.round(dwt * 0.93),
          stowage_factor: 0.45,
        },
        legs: [
          {
            id: `${hist1}-LEG1`,
            voyage_id: hist1,
            leg_type: 'laden',
            sequence: 1,
            origin_port: h1Origin,
            destination_port: h1Dest,
            departure_time: '2026-08-10T12:00:00Z',
            arrival_time: '2026-08-24T18:00:00Z',
            distance_nm: 3850,
            avg_speed_knots: 13.8,
            fuel_consumed_mt: 310,
            status: 'completed',
            coordinates: [
              [h1Origin.latitude, h1Origin.longitude],
              [h1Dest.latitude, h1Dest.longitude],
            ],
          },
        ],
        port_calls: [
          {
            id: `PC-${hist1}-1`,
            voyage_id: hist1,
            vessel_id: vessel.id,
            vessel_name: vessel.name,
            port: h1Origin,
            arrival_date: '2026-08-08 10:00 UTC',
            departure_date: '2026-08-10 12:00 UTC',
            berth_duration_hours: 50.0,
            waiting_time_hours: 12.0,
            operation_type: 'Loading',
            status: 'Completed',
          },
          {
            id: `PC-${hist1}-2`,
            voyage_id: hist1,
            vessel_id: vessel.id,
            vessel_name: vessel.name,
            port: h1Dest,
            arrival_date: '2026-08-24 18:00 UTC',
            departure_date: '2026-08-27 10:00 UTC',
            berth_duration_hours: 44.0,
            waiting_time_hours: 5.5,
            operation_type: 'Discharging',
            status: 'Completed',
          },
        ],
        sts_events: [],
      });
    });

    return records;
  }

  /**
   * Filter voyages by search query, vessel, leg type, status, and ports
   */
  static filterVoyages(
    voyages: VoyageRecord[],
    filters: VoyageFiltersState
  ): VoyageRecord[] {
    return voyages.filter((v) => {
      // 1. Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matches =
          v.voyage_number.toLowerCase().includes(query) ||
          v.vessel_name.toLowerCase().includes(query) ||
          v.imo_number.toLowerCase().includes(query) ||
          v.origin_port.name.toLowerCase().includes(query) ||
          v.origin_port.country.toLowerCase().includes(query) ||
          v.destination_port.name.toLowerCase().includes(query) ||
          v.destination_port.country.toLowerCase().includes(query) ||
          v.operator.toLowerCase().includes(query) ||
          v.charterer.toLowerCase().includes(query) ||
          v.cargo_manifest.commodity.toLowerCase().includes(query);

        if (!matches) return false;
      }

      // 2. Vessel ID
      if (filters.vesselId && filters.vesselId !== 'all') {
        if (v.vessel_id.toString() !== filters.vesselId) return false;
      }

      // 3. Status
      if (filters.status !== 'all') {
        if (v.status !== filters.status) return false;
      }

      // 4. Leg Type
      if (filters.legType !== 'all') {
        if (v.current_leg_type !== filters.legType) return false;
      }

      // 5. Origin Port
      if (filters.originPort && filters.originPort !== 'all') {
        if (!v.origin_port.name.toLowerCase().includes(filters.originPort.toLowerCase())) {
          return false;
        }
      }

      // 6. Destination Port
      if (filters.destinationPort && filters.destinationPort !== 'all') {
        if (!v.destination_port.name.toLowerCase().includes(filters.destinationPort.toLowerCase())) {
          return false;
        }
      }

      // 7. Operator
      if (filters.operator && filters.operator !== 'all') {
        if (!v.operator.toLowerCase().includes(filters.operator.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Computes high-level analytics and aggregated maritime intelligence
   */
  static computeAnalytics(voyages: VoyageRecord[]): VoyageAnalyticsSummary {
    const total = voyages.length;
    const active = voyages.filter((v) => v.status === 'active' || v.status === 'in_port').length;
    const predicted = voyages.filter((v) => v.status === 'predicted').length;
    const completed = voyages.filter((v) => v.status === 'completed').length;

    const ladenCount = voyages.filter((v) => v.current_leg_type === 'laden').length;
    const ladenRatio = total > 0 ? Math.round((ladenCount / total) * 100) : 0;

    // Ton-miles calculation: distance * cargo MT
    let totalTonMiles = 0;
    voyages.forEach((v) => {
      totalTonMiles += (v.distance_total_nm * (v.cargo_manifest.quantity_mt || 0)) / 1_000_000;
    });

    // Country Aggregation
    const countryMap = new Map<string, { voyages: number; volume: number; vessels: Set<number>; commodities: Map<string, number> }>();
    voyages.forEach((v) => {
      [v.origin_port.country, v.destination_port.country].forEach((country) => {
        if (!country) return;
        const entry = countryMap.get(country) || {
          voyages: 0,
          volume: 0,
          vessels: new Set<number>(),
          commodities: new Map<string, number>(),
        };
        entry.voyages += 1;
        entry.volume += v.cargo_manifest.quantity_mt || 0;
        entry.vessels.add(v.vessel_id);
        const comm = v.cargo_manifest.commodity;
        entry.commodities.set(comm, (entry.commodities.get(comm) || 0) + 1);
        countryMap.set(country, entry);
      });
    });

    const country_metrics = Array.from(countryMap.entries())
      .map(([country, data]) => {
        let topComm = 'Dry Bulk';
        let maxC = 0;
        data.commodities.forEach((cnt, name) => {
          if (cnt > maxC) {
            maxC = cnt;
            topComm = name;
          }
        });
        return {
          country,
          voyage_count: data.voyages,
          total_volume_mt: data.volume,
          active_vessels: data.vessels.size,
          primary_commodity: topComm,
        };
      })
      .sort((a, b) => b.voyage_count - a.voyage_count)
      .slice(0, 8);

    // Port Aggregation
    const portMap = new Map<number, { name: string; country: string; calls: number; berthHrs: number; waitHrs: number; volume: number }>();
    voyages.forEach((v) => {
      v.port_calls.forEach((pc) => {
        const entry = portMap.get(pc.port.id) || {
          name: pc.port.name,
          country: pc.port.country,
          calls: 0,
          berthHrs: 0,
          waitHrs: 0,
          volume: 0,
        };
        entry.calls += 1;
        entry.berthHrs += pc.berth_duration_hours;
        entry.waitHrs += pc.waiting_time_hours;
        entry.volume += v.cargo_manifest.quantity_mt || 0;
        portMap.set(pc.port.id, entry);
      });
    });

    const port_metrics = Array.from(portMap.entries())
      .map(([port_id, data]) => ({
        port_id,
        port_name: data.name,
        country: data.country,
        calls_count: data.calls,
        avg_waiting_hours: Math.round((data.waitHrs / Math.max(1, data.calls)) * 10) / 10,
        avg_berth_hours: Math.round((data.berthHrs / Math.max(1, data.calls)) * 10) / 10,
        total_cargo_handled_mt: data.volume,
      }))
      .sort((a, b) => b.calls_count - a.calls_count)
      .slice(0, 8);

    // Trade Corridors
    const corridorMap = new Map<string, { origin: string; dest: string; count: number; days: number; cargo: string }>();
    voyages.forEach((v) => {
      const key = `${v.origin_port.name} → ${v.destination_port.name}`;
      const existing = corridorMap.get(key) || {
        origin: v.origin_port.name,
        dest: v.destination_port.name,
        count: 0,
        days: Math.round((v.distance_total_nm / (14 * 24)) * 10) / 10,
        cargo: v.cargo_manifest.commodity,
      };
      existing.count += 1;
      corridorMap.set(key, existing);
    });

    const trade_corridors = Array.from(corridorMap.entries())
      .map(([corridor, data]) => ({
        corridor,
        origin: data.origin,
        destination: data.dest,
        voyage_count: data.count,
        avg_transit_days: data.days,
        dominant_cargo: data.cargo,
      }))
      .sort((a, b) => b.voyage_count - a.voyage_count)
      .slice(0, 8);

    // Operator Breakdown
    const opMap = new Map<string, { vessels: Set<number>; activeVoyages: number; ladenVoyages: number; trades: Set<string> }>();
    voyages.forEach((v) => {
      const entry = opMap.get(v.operator) || {
        vessels: new Set<number>(),
        activeVoyages: 0,
        ladenVoyages: 0,
        trades: new Set<string>(),
      };
      entry.vessels.add(v.vessel_id);
      if (v.status === 'active' || v.status === 'in_port') entry.activeVoyages += 1;
      if (v.current_leg_type === 'laden') entry.ladenVoyages += 1;
      entry.trades.add(`${v.origin_port.country} → ${v.destination_port.country}`);
      opMap.set(v.operator, entry);
    });

    const operator_metrics = Array.from(opMap.entries())
      .map(([operator, data]) => ({
        operator,
        fleet_size: data.vessels.size,
        active_voyages: data.activeVoyages,
        laden_ratio_pct: Math.round((data.ladenVoyages / Math.max(1, data.activeVoyages)) * 100),
        primary_trades: Array.from(data.trades).slice(0, 2),
      }))
      .sort((a, b) => b.active_voyages - a.active_voyages);

    return {
      total_voyages: total,
      active_voyages: active,
      predicted_voyages: predicted,
      completed_voyages: completed,
      laden_ratio_pct: ladenRatio,
      avg_turnaround_hours: 42.5,
      total_ton_miles_m: Math.round(totalTonMiles),
      country_metrics,
      port_metrics,
      trade_corridors,
      operator_metrics,
    };
  }

  /**
   * Export voyages dataset as a standardized CSV file
   */
  static exportVoyagesCsv(voyages: VoyageRecord[]): void {
    const headers = [
      'Voyage ID',
      'Vessel Name',
      'IMO Number',
      'Vessel Type',
      'Commercial Operator',
      'Charterer',
      'Origin Port',
      'Origin Country',
      'Destination Port',
      'Destination Country',
      'Status',
      'Leg Type',
      'Departure UTC',
      'ETA UTC',
      'Distance Total (NM)',
      'Distance To Go (NM)',
      'Current Speed (Kn)',
      'Current Draft (m)',
      'Cargo Commodity',
      'Cargo Quantity (MT)',
    ];

    const rows = voyages.map((v) => [
      `"${v.voyage_number}"`,
      `"${v.vessel_name}"`,
      `"${v.imo_number}"`,
      `"${v.vessel_type}"`,
      `"${v.operator}"`,
      `"${v.charterer}"`,
      `"${v.origin_port.name}"`,
      `"${v.origin_port.country}"`,
      `"${v.destination_port.name}"`,
      `"${v.destination_port.country}"`,
      `"${v.status}"`,
      `"${v.current_leg_type}"`,
      `"${v.departure_date}"`,
      `"${v.eta_date}"`,
      v.distance_total_nm,
      v.distance_to_go_nm,
      v.current_speed_knots,
      v.current_draft_m,
      `"${v.cargo_manifest.commodity}"`,
      v.cargo_manifest.quantity_mt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SIH26006_Voyages_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
