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

/**
 * Normalizes any raw bookings payload into a safe BookingRecord[] array.
 */
export function normalizeBookings(raw: unknown): BookingRecord[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as BookingRecord[];
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.bookings)) return obj.bookings as BookingRecord[];
    if (Array.isArray(obj.data)) return obj.data as BookingRecord[];
    if (Array.isArray(obj.items)) return obj.items as BookingRecord[];
    if (Array.isArray(obj.results)) return obj.results as BookingRecord[];
  }
  return [];
}

/**
 * Normalizes any raw API response into a valid BookingListResponse object.
 */
export function normalizeBookingsResponse(raw: unknown): BookingListResponse {
  const bookings = normalizeBookings(raw);
  let count = bookings.length;
  let limit = 100;
  let offset = 0;
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.count === 'number') count = obj.count;
    if (typeof obj.limit === 'number') limit = obj.limit;
    if (typeof obj.offset === 'number') offset = obj.offset;
  }
  return {
    count,
    limit,
    offset,
    bookings,
  };
}

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

    const raw = await apiClient.get<unknown>('/bookings', { params });
    return normalizeBookingsResponse(raw);
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

  /**
   * Cancels a booking, transitioning it to the terminal cancelled lifecycle state.
   */
  cancelBooking: async (
    bookingId: number,
    notes?: string
  ): Promise<BookingRecord> => {
    return apiClient.patch<BookingRecord>(`/bookings/${bookingId}/status`, {
      status: 'cancelled',
      notes,
    });
  },
};
