/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 16: Trade Flows Pure Analytics & Aggregation Engine
 * Pure mathematical functions with zero DOM/JSX dependency and complete NaN/Infinity protection.
 */

import type {
  TradeFlowRecord,
  FlowFiltersState,
  FlowSummaryMetrics,
  FlowVolumeBreakdownItem,
  ODMatrixData,
  ODMatrixCell,
  FlowSegment,
  CommodityMovementNode,
} from '../../types/trade-flows';

export class FlowsAnalyticsEngine {
  /**
   * Safe percentage calculation with zero-division safeguard
   */
  public static calculateSafePercent(numerator: number, denominator: number): number {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return 0;
    }
    const val = (numerator / denominator) * 100;
    return Number.isFinite(val) ? Math.round(val * 10) / 10 : 0;
  }

  /**
   * Format Metric Tonnes volume with human-readable suffix (kMT, MMT)
   */
  public static formatVolumeMT(volumeMt: number): string {
    if (!Number.isFinite(volumeMt) || volumeMt <= 0) return '0 MT';

    if (volumeMt >= 1000000) {
      const mmt = volumeMt / 1000000;
      return `${mmt.toFixed(mmt >= 10 ? 1 : 2)}M MT`;
    }
    if (volumeMt >= 1000) {
      const kmt = volumeMt / 1000;
      return `${Math.round(kmt).toLocaleString()}k MT`;
    }
    return `${Math.round(volumeMt).toLocaleString()} MT`;
  }

  /**
   * Format volume in native trade unit (bbl, m3, MT)
   */
  public static formatNativeVolume(volume: number, unit: string): string {
    if (!Number.isFinite(volume) || volume <= 0) return `0 ${unit}`;

    if (volume >= 1000000) {
      const millions = volume / 1000000;
      return `${millions.toFixed(millions >= 10 ? 1 : 2)}M ${unit}`;
    }
    if (volume >= 1000) {
      const thousands = volume / 1000;
      return `${Math.round(thousands).toLocaleString()}k ${unit}`;
    }
    return `${Math.round(volume).toLocaleString()} ${unit}`;
  }

  /**
   * Aggregate gross volume in Metric Tonnes across flow records
   */
  public static aggregateFlowVolume(flows: TradeFlowRecord[]): number {
    if (!Array.isArray(flows) || flows.length === 0) return 0;
    return flows.reduce((sum, f) => {
      const vol = Number(f.current_volume_mt);
      return sum + (Number.isFinite(vol) ? vol : 0);
    }, 0);
  }

  /**
   * Filter flow records by active filter parameters
   */
  public static filterFlows(flows: TradeFlowRecord[], filters: FlowFiltersState): TradeFlowRecord[] {
    if (!Array.isArray(flows)) return [];

    return flows.filter((flow) => {
      if (!flow) return false;

      // 1. Mode
      if (filters.mode && flow.mode !== filters.mode) return false;

      // 2. Direction
      if (filters.direction && filters.direction !== 'all') {
        if (flow.direction !== filters.direction) return false;
      }

      // 3. Commodity
      if (filters.commodity && filters.commodity !== 'all') {
        if (flow.commodity !== filters.commodity) return false;
      }

      // 4. Vessel Class
      if (filters.vesselClass && filters.vesselClass !== 'all') {
        const matchesClass =
          flow.primary_vessel_class === filters.vesselClass ||
          (Array.isArray(flow.vessel_classes) && flow.vessel_classes.includes(filters.vesselClass));
        if (!matchesClass) return false;
      }

      // 5. Origin Country
      if (filters.originCountry && filters.originCountry !== 'all') {
        if (flow.origin?.country !== filters.originCountry) return false;
      }

      // 6. Destination Country
      if (filters.destinationCountry && filters.destinationCountry !== 'all') {
        if (flow.destination?.country !== filters.destinationCountry) return false;
      }

      // 7. Origin Port ID
      if (filters.originPortId && filters.originPortId !== 'all') {
        if (flow.origin?.id !== filters.originPortId) return false;
      }

      // 8. Destination Port ID
      if (filters.destinationPortId && filters.destinationPortId !== 'all') {
        if (flow.destination?.id !== filters.destinationPortId) return false;
      }

      // 9. Region (matches origin or destination region)
      if (filters.region && filters.region !== 'all') {
        const originReg = flow.origin?.region || '';
        const destReg = flow.destination?.region || '';
        if (originReg !== filters.region && destReg !== filters.region) return false;
      }

      // 10. Search Query
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const originName = (flow.origin?.name || '').toLowerCase();
        const destName = (flow.destination?.name || '').toLowerCase();
        const originCountry = (flow.origin?.country || '').toLowerCase();
        const destCountry = (flow.destination?.country || '').toLowerCase();
        const commodity = (flow.commodity || '').toLowerCase();
        const laneCode = (flow.trade_lane_code || '').toLowerCase();

        const matches =
          originName.includes(q) ||
          destName.includes(q) ||
          originCountry.includes(q) ||
          destCountry.includes(q) ||
          commodity.includes(q) ||
          laneCode.includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }

  /**
   * Synthesize 6 core KPI summary metrics from filtered flow records
   */
  public static synthesizeFlowSummary(flows: TradeFlowRecord[]): FlowSummaryMetrics {
    if (!Array.isArray(flows) || flows.length === 0) {
      return {
        total_volume_mt: 0,
        total_volume_formatted: '0 MT',
        active_flows_count: 0,
        origin_ports_count: 0,
        destination_ports_count: 0,
        top_commodity: 'None',
        top_commodity_volume_mt: 0,
        top_route: 'None',
        top_route_volume_mt: 0,
        import_volume_mt: 0,
        export_volume_mt: 0,
        avg_transit_days: 0,
        active_vessels_sum: 0,
      };
    }

    const totalVolumeMt = this.aggregateFlowVolume(flows);

    // Unique ports
    const originPortIds = new Set<string>();
    const destPortIds = new Set<string>();
    const commodityVolumes: Record<string, number> = {};
    let topRoute = 'None';
    let topRouteVolume = 0;
    let exportVolumeMt = 0;
    let importVolumeMt = 0;
    let totalTransitDays = 0;
    let totalVessels = 0;

    for (const f of flows) {
      const vol = Number(f.current_volume_mt) || 0;

      if (f.origin?.name) originPortIds.add(f.origin.name);
      if (f.destination?.name) destPortIds.add(f.destination.name);

      commodityVolumes[f.commodity] = (commodityVolumes[f.commodity] || 0) + vol;

      if (vol > topRouteVolume) {
        topRouteVolume = vol;
        topRoute = `${f.origin?.name || 'Origin'} → ${f.destination?.name || 'Destination'}`;
      }

      if (f.direction === 'import') {
        importVolumeMt += vol;
      } else {
        exportVolumeMt += vol;
      }

      totalTransitDays += f.typical_transit_days || 0;
      totalVessels += f.active_vessel_count || 0;
    }

    // Top commodity
    let topCommodity = 'None';
    let topCommodityVolume = 0;
    for (const [comm, vol] of Object.entries(commodityVolumes)) {
      if (vol > topCommodityVolume) {
        topCommodityVolume = vol;
        topCommodity = comm;
      }
    }

    const avgTransitDays = flows.length > 0 ? Math.round(totalTransitDays / flows.length) : 0;

    return {
      total_volume_mt: totalVolumeMt,
      total_volume_formatted: this.formatVolumeMT(totalVolumeMt),
      active_flows_count: flows.length,
      origin_ports_count: originPortIds.size,
      destination_ports_count: destPortIds.size,
      top_commodity: topCommodity,
      top_commodity_volume_mt: topCommodityVolume,
      top_route: topRoute,
      top_route_volume_mt: topRouteVolume,
      import_volume_mt: importVolumeMt,
      export_volume_mt: exportVolumeMt,
      avg_transit_days: avgTransitDays,
      active_vessels_sum: totalVessels,
    };
  }

  /**
   * Aggregate flow volume by commodity
   */
  public static aggregateByCommodity(flows: TradeFlowRecord[]): FlowVolumeBreakdownItem[] {
    if (!Array.isArray(flows) || flows.length === 0) return [];
    const totalVolume = this.aggregateFlowVolume(flows);
    const map: Record<string, { volume: number; count: number }> = {};

    for (const f of flows) {
      const vol = Number(f.current_volume_mt) || 0;
      if (!map[f.commodity]) {
        map[f.commodity] = { volume: 0, count: 0 };
      }
      map[f.commodity].volume += vol;
      map[f.commodity].count += 1;
    }

    return Object.entries(map)
      .map(([key, data]) => ({
        key,
        label: key,
        volume_mt: data.volume,
        percentage: this.calculateSafePercent(data.volume, totalVolume),
        unit: 'MT',
        count: data.count,
      }))
      .sort((a, b) => b.volume_mt - a.volume_mt);
  }

  /**
   * Aggregate flow volume by Origin port or country
   */
  public static aggregateByOrigin(
    flows: TradeFlowRecord[],
    groupBy: 'port' | 'country' = 'port'
  ): FlowVolumeBreakdownItem[] {
    if (!Array.isArray(flows) || flows.length === 0) return [];
    const totalVolume = this.aggregateFlowVolume(flows);
    const map: Record<string, { volume: number; count: number; country?: string }> = {};

    for (const f of flows) {
      const key = groupBy === 'port' ? f.origin?.name || 'Unknown' : f.origin?.country || 'Unknown';
      const vol = Number(f.current_volume_mt) || 0;

      if (!map[key]) {
        map[key] = { volume: 0, count: 0, country: f.origin?.country };
      }
      map[key].volume += vol;
      map[key].count += 1;
    }

    return Object.entries(map)
      .map(([key, data]) => ({
        key,
        label: groupBy === 'port' && data.country ? `${key} (${data.country})` : key,
        volume_mt: data.volume,
        percentage: this.calculateSafePercent(data.volume, totalVolume),
        unit: 'MT',
        count: data.count,
      }))
      .sort((a, b) => b.volume_mt - a.volume_mt);
  }

  /**
   * Aggregate flow volume by Destination port or country
   */
  public static aggregateByDestination(
    flows: TradeFlowRecord[],
    groupBy: 'port' | 'country' = 'port'
  ): FlowVolumeBreakdownItem[] {
    if (!Array.isArray(flows) || flows.length === 0) return [];
    const totalVolume = this.aggregateFlowVolume(flows);
    const map: Record<string, { volume: number; count: number; country?: string }> = {};

    for (const f of flows) {
      const key = groupBy === 'port' ? f.destination?.name || 'Unknown' : f.destination?.country || 'Unknown';
      const vol = Number(f.current_volume_mt) || 0;

      if (!map[key]) {
        map[key] = { volume: 0, count: 0, country: f.destination?.country };
      }
      map[key].volume += vol;
      map[key].count += 1;
    }

    return Object.entries(map)
      .map(([key, data]) => ({
        key,
        label: groupBy === 'port' && data.country ? `${key} (${data.country})` : key,
        volume_mt: data.volume,
        percentage: this.calculateSafePercent(data.volume, totalVolume),
        unit: 'MT',
        count: data.count,
      }))
      .sort((a, b) => b.volume_mt - a.volume_mt);
  }

  /**
   * Aggregate flow volume by Global Region
   */
  public static aggregateByRegion(flows: TradeFlowRecord[]): FlowVolumeBreakdownItem[] {
    if (!Array.isArray(flows) || flows.length === 0) return [];
    const totalVolume = this.aggregateFlowVolume(flows);
    const map: Record<string, { volume: number; count: number }> = {};

    for (const f of flows) {
      const reg = f.origin?.region || f.destination?.region || 'Global';
      const vol = Number(f.current_volume_mt) || 0;

      if (!map[reg]) {
        map[reg] = { volume: 0, count: 0 };
      }
      map[reg].volume += vol;
      map[reg].count += 1;
    }

    return Object.entries(map)
      .map(([key, data]) => ({
        key,
        label: key,
        volume_mt: data.volume,
        percentage: this.calculateSafePercent(data.volume, totalVolume),
        unit: 'MT',
        count: data.count,
      }))
      .sort((a, b) => b.volume_mt - a.volume_mt);
  }

  /**
   * Aggregate flow volume by Vessel Class
   */
  public static aggregateByVesselClass(flows: TradeFlowRecord[]): FlowVolumeBreakdownItem[] {
    if (!Array.isArray(flows) || flows.length === 0) return [];
    const totalVolume = this.aggregateFlowVolume(flows);
    const map: Record<string, { volume: number; count: number }> = {};

    for (const f of flows) {
      const vc = f.primary_vessel_class || 'Standard';
      const vol = Number(f.current_volume_mt) || 0;

      if (!map[vc]) {
        map[vc] = { volume: 0, count: 0 };
      }
      map[vc].volume += vol;
      map[vc].count += 1;
    }

    return Object.entries(map)
      .map(([key, data]) => ({
        key,
        label: key,
        volume_mt: data.volume,
        percentage: this.calculateSafePercent(data.volume, totalVolume),
        unit: 'MT',
        count: data.count,
      }))
      .sort((a, b) => b.volume_mt - a.volume_mt);
  }

  /**
   * Build Origin-Destination (OD) Matrix Heatmap Data
   */
  public static buildODMatrix(
    flows: TradeFlowRecord[],
    groupBy: 'port' | 'country' = 'port'
  ): ODMatrixData {
    if (!Array.isArray(flows) || flows.length === 0) {
      return {
        origins: [],
        destinations: [],
        cells: {},
        max_volume_mt: 0,
        total_matrix_volume_mt: 0,
      };
    }

    const originsSet = new Set<string>();
    const destinationsSet = new Set<string>();
    const cells: Record<string, ODMatrixCell> = {};
    let maxVolume = 0;
    let totalMatrixVolume = 0;

    for (const f of flows) {
      const orig = groupBy === 'port' ? f.origin?.name || 'Origin' : f.origin?.country || 'Origin Country';
      const dest =
        groupBy === 'port' ? f.destination?.name || 'Destination' : f.destination?.country || 'Dest Country';

      originsSet.add(orig);
      destinationsSet.add(dest);

      const cellKey = `${orig}:::${dest}`;
      const vol = Number(f.current_volume_mt) || 0;

      if (!cells[cellKey]) {
        cells[cellKey] = {
          origin_key: orig,
          destination_key: dest,
          volume_mt: 0,
          volume_formatted: '0 MT',
          active_flows_count: 0,
          voyages_count: 0,
          dominant_commodity: f.commodity,
          primary_vessel_class: f.primary_vessel_class,
          flow_ids: [],
          heat_intensity: 0,
        };
      }

      cells[cellKey].volume_mt += vol;
      cells[cellKey].active_flows_count += 1;
      cells[cellKey].voyages_count += f.active_vessel_count || 0;
      cells[cellKey].flow_ids.push(f.id);

      totalMatrixVolume += vol;
      if (cells[cellKey].volume_mt > maxVolume) {
        maxVolume = cells[cellKey].volume_mt;
      }
    }

    // Format and calculate heat intensity
    for (const key of Object.keys(cells)) {
      const cell = cells[key];
      cell.volume_formatted = this.formatVolumeMT(cell.volume_mt);
      cell.heat_intensity = maxVolume > 0 ? Math.min(1.0, Math.max(0.1, cell.volume_mt / maxVolume)) : 0;
    }

    const sortedOrigins = Array.from(originsSet).sort((a, b) => a.localeCompare(b));
    const sortedDestinations = Array.from(destinationsSet).sort((a, b) => a.localeCompare(b));

    return {
      origins: sortedOrigins,
      destinations: sortedDestinations,
      cells,
      max_volume_mt: maxVolume,
      total_matrix_volume_mt: totalMatrixVolume,
    };
  }

  /**
   * Build Historical Trend aggregated series
   */
  public static buildHistoricalTrend(
    flows: TradeFlowRecord[]
  ): { date: string; volume_mt: number; voyages_count: number; import_mt: number; export_mt: number }[] {
    if (!Array.isArray(flows) || flows.length === 0) return [];

    const monthMap: Record<
      string,
      { volume_mt: number; voyages_count: number; import_mt: number; export_mt: number }
    > = {};

    for (const f of flows) {
      if (!Array.isArray(f.historical_series)) continue;

      for (const pt of f.historical_series) {
        if (!pt.date) continue;
        if (!monthMap[pt.date]) {
          monthMap[pt.date] = { volume_mt: 0, voyages_count: 0, import_mt: 0, export_mt: 0 };
        }

        const vol = Number(pt.volume_mt) || 0;
        monthMap[pt.date].volume_mt += vol;
        monthMap[pt.date].voyages_count += pt.voyages_count || 0;

        if (f.direction === 'import') {
          monthMap[pt.date].import_mt += vol;
        } else {
          monthMap[pt.date].export_mt += vol;
        }
      }
    }

    return Object.entries(monthMap)
      .map(([date, data]) => ({
        date,
        volume_mt: data.volume_mt,
        voyages_count: data.voyages_count,
        import_mt: data.import_mt,
        export_mt: data.export_mt,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Build Map Flow Segments with realistic oceanic quadratic bezier curvature
   */
  public static buildMapFlowSegments(flows: TradeFlowRecord[]): FlowSegment[] {
    if (!Array.isArray(flows)) return [];

    const segments: FlowSegment[] = [];

    for (const flow of flows) {
      if (!flow.origin || !flow.destination) continue;
      const oLat = Number(flow.origin.latitude);
      const oLng = Number(flow.origin.longitude);
      const dLat = Number(flow.destination.latitude);
      const dLng = Number(flow.destination.longitude);

      if (!Number.isFinite(oLat) || !Number.isFinite(oLng) || !Number.isFinite(dLat) || !Number.isFinite(dLng)) {
        continue;
      }

      // Calculate midpoint and normal deflection to simulate maritime oceanic arc
      const midLat = (oLat + dLat) / 2;
      const midLng = (oLng + dLng) / 2;

      // Deflect perpendicular to line based on distance
      const dX = dLng - oLng;
      const dY = dLat - oLat;
      const length = Math.sqrt(dX * dX + dY * dY);
      const curvatureFactor = Math.min(Math.max(length * 0.18, 4), 18);

      // Perpendicular vector (-dY, dX)
      const normX = length > 0 ? -dY / length : 0;
      const normY = length > 0 ? dX / length : 0;

      const curveLat = midLat + normY * curvatureFactor;
      const curveLng = midLng + normX * curvatureFactor;

      // Interpolate quadratic bezier curve points (12 steps)
      const curvePoints: [number, number][] = [];
      const steps = 16;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
        const pLat = (1 - t) * (1 - t) * oLat + 2 * (1 - t) * t * curveLat + t * t * dLat;
        const pLng = (1 - t) * (1 - t) * oLng + 2 * (1 - t) * t * curveLng + t * t * dLng;
        curvePoints.push([pLat, pLng]);
      }

      // Volume-weighted stroke width: 2.5px to 10px
      const vol = Number(flow.current_volume_mt) || 0;
      const strokeWidth = Math.min(Math.max(2.5, Math.sqrt(vol / 250000) * 1.5), 9.5);

      // Mode-based color palette
      let strokeColor = '#38bdf8'; // Dry Bulk: Cyan
      if (flow.mode === 'tanker') {
        strokeColor = '#f59e0b'; // Tanker: Amber
      } else if (flow.mode === 'lng') {
        strokeColor = '#c084fc'; // LNG: Purple
      } else if (flow.mode === 'lpg') {
        strokeColor = '#10b981'; // LPG: Emerald
      }

      segments.push({
        flow_id: flow.id,
        trade_lane_code: flow.trade_lane_code,
        mode: flow.mode,
        commodity: flow.commodity,
        origin_name: flow.origin.name,
        destination_name: flow.destination.name,
        origin_coords: [oLat, oLng],
        destination_coords: [dLat, dLng],
        mid_curve_coords: [curveLat, curveLng],
        curve_points: curvePoints,
        volume_mt: vol,
        stroke_width: Math.round(strokeWidth * 10) / 10,
        stroke_color: strokeColor,
        active_vessels: flow.active_vessel_count || 0,
      });
    }

    return segments;
  }

  /**
   * Build Commodity Movement Node for focused single-commodity analysis
   */
  public static buildCommodityMovement(
    flows: TradeFlowRecord[],
    commodityName: string
  ): CommodityMovementNode | null {
    if (!Array.isArray(flows) || flows.length === 0 || !commodityName) return null;
    const matching = flows.filter((f) => f.commodity.toLowerCase() === commodityName.toLowerCase());
    if (matching.length === 0) return null;

    const totalVolume = this.aggregateFlowVolume(matching);
    const origins = this.aggregateByOrigin(matching, 'port').slice(0, 5);
    const destinations = this.aggregateByDestination(matching, 'port').slice(0, 5);
    const vesselDist = this.aggregateByVesselClass(matching);
    const trend = this.buildHistoricalTrend(matching).map((t) => ({ date: t.date, volume_mt: t.volume_mt }));

    let exportVol = 0;
    let importVol = 0;
    for (const f of matching) {
      if (f.direction === 'import') importVol += f.current_volume_mt;
      else exportVol += f.current_volume_mt;
    }

    return {
      commodity: commodityName,
      mode: matching[0].mode,
      total_volume_mt: totalVolume,
      export_share_pct: this.calculateSafePercent(exportVol, totalVolume),
      import_share_pct: this.calculateSafePercent(importVol, totalVolume),
      top_origins: origins.map((o) => ({ name: o.label, volume_mt: o.volume_mt, pct: o.percentage })),
      top_destinations: destinations.map((d) => ({ name: d.label, volume_mt: d.volume_mt, pct: d.percentage })),
      vessel_distribution: vesselDist.map((v) => ({ vessel_class: v.label, volume_mt: v.volume_mt, pct: v.percentage })),
      historical_trend: trend,
    };
  }
}
