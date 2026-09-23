import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cargoService } from '../services/api/cargo.service';
import type { CreateCargoPayload } from '../types/cargo';

export function useCargo(limit: number = 50) {
  return useQuery({
    queryKey: ['cargo', limit],
    queryFn: () => cargoService.getCargo(limit),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateCargo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCargoPayload) => cargoService.createCargo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cargo'] });
    },
  });
}

export function useDeleteCargo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cargoId: number) => cargoService.deleteCargo(cargoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cargo'] });
    },
  });
}
