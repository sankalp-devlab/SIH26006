/**
 * SIH 26006 Maritime Cargo Intelligence Platform
 * Module 20: Live Vessel Tracking API Service
 */

import { apiClient } from './client';
import type {
  TrackingSystemStatus,
  TrackedVesselSummary,
  VesselTrackingDetail,
  BookingTrackingDetail,
  PositionObservation,
  PositionIngestPayload,
  PositionIngestResponse,
} from '../../types/tracking';

export interface TrackedVesselsListResponse {
  count: number;
  limit: number;
  offset: number;
  provider_info: {
    provider_type: string;
    is_configured: boolean;
    provider_url?: string | null;
    status_message: string;
  };
  vessels: TrackedVesselSummary[];
}

export interface VesselHistoryResponse {
  vessel_id: number;
  vessel_name: string;
  count: number;
  history: PositionObservation[];
  data_source: string;
  disclosure: string;
}

export const trackingService = {
  /**
   * Retrieves global tracking subsystem telemetry status and provider metadata.
   */
  getTrackingStatus: async (): Promise<TrackingSystemStatus> => {
    return apiClient.get<TrackingSystemStatus>('/tracking/status');
  },

  /**
   * Retrieves fleet vessels with latest authentic position, active bookings, and freshness.
   */
  getTrackedVessels: async (
    statusOrOptions?: string | { status?: string; limit?: number; offset?: number },
    limit: number = 100,
    offset: number = 0
  ): Promise<TrackedVesselsListResponse> => {
    let finalStatus: string | undefined;
    let finalLimit = limit;
    let finalOffset = offset;

    if (typeof statusOrOptions === 'object' && statusOrOptions !== null) {
      finalStatus = statusOrOptions.status;
      if (typeof statusOrOptions.limit === 'number') finalLimit = statusOrOptions.limit;
      if (typeof statusOrOptions.offset === 'number') finalOffset = statusOrOptions.offset;
    } else if (typeof statusOrOptions === 'string') {
      finalStatus = statusOrOptions;
    }

    const params: Record<string, string | number> = { limit: finalLimit, offset: finalOffset };
    if (finalStatus && finalStatus !== 'all') {
      params.status = finalStatus;
    }
    return apiClient.get<TrackedVesselsListResponse>('/tracking/vessels', { params });
  },

  /**
   * Retrieves full tracking state, position history, and corridor details for a specific vessel.
   */
  getVesselTrackingDetail: async (vesselId: number): Promise<VesselTrackingDetail> => {
    return apiClient.get<VesselTrackingDetail>(`/tracking/vessels/${vesselId}`);
  },

  /**
   * Retrieves tracking details associated with a commercial booking and assigned vessel.
   */
  getBookingTracking: async (bookingId: number): Promise<BookingTrackingDetail> => {
    return apiClient.get<BookingTrackingDetail>(`/tracking/bookings/${bookingId}`);
  },

  /**
   * Retrieves authentic stored position history for a vessel from public.vessel_positions.
   */
  getVesselHistory: async (
    vesselId: number,
    limit: number = 100
  ): Promise<VesselHistoryResponse> => {
    return apiClient.get<VesselHistoryResponse>(`/tracking/vessels/${vesselId}/history`, {
      params: { limit },
    });
  },

  /**
   * Triggers a telemetry refresh for a specific vessel.
   */
  refreshVesselTracking: async (vesselId: number): Promise<any> => {
    return apiClient.post<any>(`/tracking/refresh/${vesselId}`);
  },

  /**
   * Ingestion endpoint for authentic AIS and GPS telemetry observations.
   */
  ingestPosition: async (payload: PositionIngestPayload): Promise<PositionIngestResponse> => {
    return apiClient.post<PositionIngestResponse>('/tracking/ingest', payload);
  },
};
