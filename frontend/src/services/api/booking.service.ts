/**
 * SIH 26006 Maritime Cargo Intelligence Platform
 * Module 19: Booking System API Service
 */

import { apiClient } from './client';
import type {
  BookingRecord,
  BookingListResponse,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
  BookingFilters,
} from '../../types/booking';

export const bookingService = {
  /**
   * Submits a formal booking request for a cargo consignment with an eligible vessel.
   */
  createBooking: async (payload: CreateBookingRequest): Promise<BookingRecord> => {
    return apiClient.post<BookingRecord>('/bookings', payload);
  },

  /**
   * Retrieves booking history with optional status, cargo, or vessel filters.
   */
  getBookings: async (filters?: BookingFilters): Promise<BookingListResponse> => {
    const params: Record<string, string | number> = {};
    if (filters?.status && filters.status !== 'all') {
      params.status = filters.status;
    }
    if (filters?.cargo_id) {
      params.cargo_id = filters.cargo_id;
    }
    if (filters?.vessel_id) {
      params.vessel_id = filters.vessel_id;
    }
    if (filters?.limit) {
      params.limit = filters.limit;
    }
    if (filters?.offset) {
      params.offset = filters.offset;
    }

    return apiClient.get<BookingListResponse>('/bookings', { params });
  },

  /**
   * Retrieves a single booking record by ID.
   */
  getBookingById: async (bookingId: number): Promise<BookingRecord> => {
    return apiClient.get<BookingRecord>(`/bookings/${bookingId}`);
  },

  /**
   * Retrieves a single booking record by unique reference string (e.g. MCB-B000004).
   */
  getBookingByReference: async (reference: string): Promise<BookingRecord> => {
    return apiClient.get<BookingRecord>(`/bookings/reference/${encodeURIComponent(reference)}`);
  },

  /**
   * Updates booking status following the controlled lifecycle state machine.
   */
  updateBookingStatus: async (
    bookingId: number,
    payload: UpdateBookingStatusRequest
  ): Promise<BookingRecord> => {
    return apiClient.patch<BookingRecord>(`/bookings/${bookingId}/status`, payload);
  },
};
