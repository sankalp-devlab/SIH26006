import { useMemo } from 'react';
import { useVessels } from './useVessels';
import { usePorts } from './usePorts';
import { useRoutes } from './useRoutes';
import { VoyagesService } from '../services/voyages/voyages.service';
import type { VoyageRecord, VoyageFiltersState, VoyageAnalyticsSummary } from '../types/voyage';

export function useVoyages(filters?: VoyageFiltersState) {
  const {
    data: vesselsData,
    isLoading: isLoadingVessels,
    isError: isErrorVessels,
    error: errorVessels,
    refetch: refetchVessels,
  } = useVessels(100);

  const {
    data: portsData,
    isLoading: isLoadingPorts,
    isError: isErrorPorts,
    error: errorPorts,
    refetch: refetchPorts,
  } = usePorts(250);

  const {
    data: routesData,
    isLoading: isLoadingRoutes,
    isError: isErrorRoutes,
    error: errorRoutes,
    refetch: refetchRoutes,
  } = useRoutes(50);

  const vessels = vesselsData?.vessels || [];
  const ports = portsData?.ports || [];
  const routes = routesData?.routes || [];

  const allVoyages: VoyageRecord[] = useMemo(() => {
    return VoyagesService.generateVoyages(vessels, ports, routes);
  }, [vessels, ports, routes]);

  const filteredVoyages: VoyageRecord[] = useMemo(() => {
    if (!filters) return allVoyages;
    return VoyagesService.filterVoyages(allVoyages, filters);
  }, [allVoyages, filters]);

  const analytics: VoyageAnalyticsSummary = useMemo(() => {
    return VoyagesService.computeAnalytics(filteredVoyages.length > 0 ? filteredVoyages : allVoyages);
  }, [allVoyages, filteredVoyages]);

  const isLoading = isLoadingVessels || isLoadingPorts || isLoadingRoutes;
  const isError = isErrorVessels || isErrorPorts || isErrorRoutes;
  const error = errorVessels || errorPorts || errorRoutes;

  const refetchAll = () => {
    refetchVessels();
    refetchPorts();
    refetchRoutes();
  };

  return {
    voyages: filteredVoyages,
    allVoyages,
    analytics,
    vessels,
    ports,
    routes,
    isLoading,
    isError,
    error,
    refetch: refetchAll,
  };
}
