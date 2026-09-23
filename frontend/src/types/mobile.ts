/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 27: Mobile Frontend Domain Types
 */

export type MobileTab = 'tracking' | 'voyages' | 'market' | 'ports' | 'more';

export interface MobileVesselPositionUpdate {
  vesselId: number;
  vesselName: string;
  status: 'underway' | 'anchored' | 'loading' | 'discharging' | 'in_repair';
  latitude: number;
  longitude: number;
  speedKnots: number;
  heading: number;
  destinationPort?: string;
  eta?: string;
  timestamp: string;
  updatedBy: string;
}

export interface MobileVesselNote {
  id: string;
  vesselId: number;
  vesselName: string;
  author: string;
  content: string;
  category: 'operational' | 'commercial' | 'technical' | 'safety';
  createdAt: string;
}

export interface MobileCustomWatchlist {
  id: string;
  name: string;
  vesselIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface MobileDistanceCalculationState {
  mode: 'port_to_port' | 'vessel_to_port';
  originPortId?: number;
  destinationPortId?: number;
  vesselId?: number;
  speedKnots: number;
  allowSuez: boolean;
  allowPanama: boolean;
  allowKiel: boolean;
  enforceSeca: boolean;
  weatherMarginPct: number;
}

export interface MobileQuickMetric {
  id: string;
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  routeOrVessel?: string;
}
