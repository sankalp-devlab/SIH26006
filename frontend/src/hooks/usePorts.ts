import { useQuery } from '@tanstack/react-query';
import { portsService } from '../services/api/ports.service';

export function usePorts(limit: number = 50) {
  return useQuery({
    queryKey: ['ports', limit],
    queryFn: () => portsService.getPorts(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function usePortSearch(name: string) {
  const trimmed = name.trim();
  return useQuery({
    queryKey: ['ports', 'search', trimmed],
    queryFn: () => portsService.searchPorts(trimmed),
    enabled: trimmed.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePort(portId?: number) {
  return useQuery({
    queryKey: ['ports', 'detail', portId],
    queryFn: () => portsService.getPortById(portId!),
    enabled: typeof portId === 'number' && portId > 0,
  });
}
