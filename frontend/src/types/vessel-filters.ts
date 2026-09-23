/**
 * Vessel List — Filter & View State Types
 */

export type VesselStatusFilter =
  | 'all'
  | 'active'
  | 'inactive'
  | 'scrapped'
  | 'orderbook'
  | 'underway'
  | 'anchored'
  | 'moored'
  | 'reference';

export type VesselSortField =
  | 'name'
  | 'imo_number'
  | 'vessel_type'
  | 'capacity_tons'
  | 'year_built'
  | 'flag'
  | 'speed_laden_knots'
  | 'fuel_laden_mt_day';
export type SortDirection = 'asc' | 'desc';
export type VesselViewMode = 'table' | 'split';

export interface VesselFilters {
  search: string;
  status: VesselStatusFilter;
  vesselTypes: string[];
  flags: string[];
  minDwt: number | null;
  maxDwt: number | null;
  minYearBuilt: number | null;
  maxYearBuilt: number | null;
  cargoTypes: string[];
}

export const DEFAULT_VESSEL_FILTERS: VesselFilters = {
  search: '',
  status: 'all',
  vesselTypes: [],
  flags: [],
  minDwt: null,
  maxDwt: null,
  minYearBuilt: null,
  maxYearBuilt: null,
  cargoTypes: [],
};

export interface VesselSortState {
  field: VesselSortField;
  direction: SortDirection;
}

export const DEFAULT_VESSEL_SORT: VesselSortState = {
  field: 'name',
  direction: 'asc',
};
