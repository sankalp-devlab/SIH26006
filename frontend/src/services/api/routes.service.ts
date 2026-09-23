import { apiClient } from './client';
import type { RoutesResponse } from '../../types/api';
import type {
  Route,
  CreateRoutePayload,
  RouteCalculationRequest,
  RouteCalculationResponse,
} from '../../types/route';

export const routesService = {
  getRoutes: async (limit: number = 50): Promise<RoutesResponse> => {
    return apiClient.get<RoutesResponse>('/routes', {
      params: { limit },
    });
  },

  getRouteById: async (routeId: number): Promise<Route> => {
    return apiClient.get<Route>(`/routes/${routeId}`);
  },

  createRoute: async (route: CreateRoutePayload): Promise<{ message: string; route: Route }> => {
    return apiClient.post<{ message: string; route: Route }>('/routes', route);
  },

  calculateRoute: async (
    payload: RouteCalculationRequest
  ): Promise<RouteCalculationResponse> => {
    return apiClient.post<RouteCalculationResponse>('/routes/calculate', payload);
  },

  updateRoute: async (
    routeId: number,
    route: Partial<CreateRoutePayload>
  ): Promise<{ message: string; route: Route }> => {
    return apiClient.put<{ message: string; route: Route }>(`/routes/${routeId}`, route);
  },

  deleteRoute: async (routeId: number): Promise<{ message: string; route: Route }> => {
    return apiClient.delete<{ message: string; route: Route }>(`/routes/${routeId}`);
  },
};
