import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routesService } from '../services/api/routes.service';
import type { CreateRoutePayload } from '../types/route';

export function useRoutes(limit: number = 50) {
  return useQuery({
    queryKey: ['routes', limit],
    queryFn: () => routesService.getRoutes(limit),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoutePayload) => routesService.createRoute(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: number) => routesService.deleteRoute(routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}
