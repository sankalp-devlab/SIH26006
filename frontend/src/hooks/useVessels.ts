import { useQuery } from '@tanstack/react-query';
import { vesselsService } from '../services/api/vessels.service';

export function useVessels(limit: number = 50) {
  return useQuery({
    queryKey: ['vessels', limit],
    queryFn: () => vesselsService.getVessels(limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useVesselSearch(name: string) {
  const trimmed = name.trim();
  return useQuery({
    queryKey: ['vessels', 'search', trimmed],
    queryFn: () => vesselsService.searchVessels(trimmed),
    enabled: trimmed.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}

export function useVessel(vesselId?: number) {
  return useQuery({
    queryKey: ['vessels', 'detail', vesselId],
    queryFn: () => vesselsService.getVesselById(vesselId!),
    enabled: typeof vesselId === 'number' && vesselId > 0,
  });
}
