import React from 'react';
import { Filter, RotateCcw, Calendar, Layers, Ship, Compass, Gauge } from 'lucide-react';
import type {
  ReportFilterState,
  ReportTimeHorizon,
  ReportMarketSegment,
  ReportVesselClass,
  ReportGeographicalBasin,
  ReportMetricFocus,
} from '../../../../types/reporting';

interface ReportingFilterBarProps {
  filter: ReportFilterState;
  onFilterChange: (key: keyof ReportFilterState, value: any) => void;
  onReset: () => void;
  isFiltered: boolean;
}

const TIME_HORIZONS: { id: ReportTimeHorizon; label: string }[] = [
  { id: 'YTD', label: 'YTD 2026' },
  { id: '1Y', label: '1 Year' },
  { id: '3Y', label: '3 Years' },
  { id: '5Y', label: '5 Years' },
  { id: 'ALL', label: 'Since 2014' },
];

const SEGMENTS: { id: ReportMarketSegment; label: string }[] = [
  { id: 'all', label: 'All Segments' },
  { id: 'Crude Tanker', label: 'Crude Tankers' },
  { id: 'Product Tanker', label: 'Clean Products' },
  { id: 'Dry Bulk', label: 'Dry Bulk' },
  { id: 'LNG', label: 'Liquefied Gas (LNG)' },
];

const VESSEL_CLASSES: { id: ReportVesselClass; label: string }[] = [
  { id: 'all', label: 'All Vessel Classes' },
  { id: 'VLCC', label: 'VLCC (200k-320k DWT)' },
  { id: 'Suezmax', label: 'Suezmax (120k-160k DWT)' },
  { id: 'Aframax', label: 'Aframax (80k-120k DWT)' },
  { id: 'Capesize', label: 'Capesize (120k-220k DWT)' },
  { id: 'Panamax', label: 'Panamax (60k-80k DWT)' },
  { id: 'MR', label: 'MR Tanker (45k-55k DWT)' },
  { id: 'LNG Carrier', label: 'LNG Carrier (140k-174k cbm)' },
];

const BASINS: { id: ReportGeographicalBasin; label: string }[] = [
  { id: 'all', label: 'Global Basins' },
  { id: 'Middle East', label: 'Middle East Gulf' },
  { id: 'Atlantic', label: 'Atlantic Basin' },
  { id: 'Pacific', label: 'Pacific / Far East' },
  { id: 'Europe', label: 'North West Europe / Med' },
  { id: 'US Gulf', label: 'US Gulf Coast' },
];

const METRIC_OPTIONS: { id: ReportMetricFocus; label: string }[] = [
  { id: 'tce_rate', label: 'Spot TCE Rate ($/day)' },
  { id: 'cargo_volume', label: 'Cargo Lifted (MT)' },
  { id: 'ton_miles', label: 'Ton-Mile Demand (Billion TM)' },
  { id: 'co2_emissions', label: 'Fleet CO2 Output (MT)' },
];

export const ReportingFilterBar: React.FC<ReportingFilterBarProps> = ({
  filter,
  onFilterChange,
  onReset,
  isFiltered,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5 mb-6 backdrop-blur-sm space-y-3">
      {/* Top Filter Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/60 pb-2.5">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Level 1 Macro Reporting Filters
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            (Applies across all visual charts, KPIs, and executive summaries)
          </span>
        </div>

        {isFiltered && (
          <button
            id="btn-reset-filters"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors self-start sm:self-auto"
          >
            <RotateCcw size={13} />
            Reset to Defaults
          </button>
        )}
      </div>

      {/* Filter selectors grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Time Horizon Selector */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-1">
            <Calendar size={12} className="text-cyan-400" />
            Time Horizon
          </label>
          <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 rounded-lg p-1">
            {TIME_HORIZONS.map((th) => (
              <button
                key={th.id}
                id={`btn-horizon-${th.id}`}
                onClick={() => onFilterChange('timeHorizon', th.id)}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors text-center ${
                  filter.timeHorizon === th.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {th.id}
              </button>
            ))}
          </div>
        </div>

        {/* Market Segment Selector */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-1">
            <Layers size={12} className="text-indigo-400" />
            Market Segment
          </label>
          <select
            id="select-market-segment"
            value={filter.segment}
            onChange={(e) => onFilterChange('segment', e.target.value as ReportMarketSegment)}
            aria-label="Filter by market segment"
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/50"
          >
            {SEGMENTS.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Vessel Class Selector */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-1">
            <Ship size={12} className="text-emerald-400" />
            Vessel Class
          </label>
          <select
            id="select-vessel-class"
            value={filter.vesselClass}
            onChange={(e) => onFilterChange('vesselClass', e.target.value as ReportVesselClass)}
            aria-label="Filter by vessel class"
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/50"
          >
            {VESSEL_CLASSES.map((vc) => (
              <option key={vc.id} value={vc.id} className="bg-slate-900 text-slate-200">
                {vc.label}
              </option>
            ))}
          </select>
        </div>

        {/* Geographical Basin Selector */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-1">
            <Compass size={12} className="text-amber-400" />
            Geographical Basin
          </label>
          <select
            id="select-geographical-basin"
            value={filter.basin}
            onChange={(e) => onFilterChange('basin', e.target.value as ReportGeographicalBasin)}
            aria-label="Filter by geographical basin"
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/50"
          >
            {BASINS.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Metric Focus */}
        <div>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-1">
            <Gauge size={12} className="text-purple-400" />
            Primary Metric Focus
          </label>
          <select
            id="select-metric-focus"
            value={filter.metricFocus}
            onChange={(e) => onFilterChange('metricFocus', e.target.value as ReportMetricFocus)}
            aria-label="Select primary metric focus"
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/50"
          >
            {METRIC_OPTIONS.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
