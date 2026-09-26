import { useState } from 'react';
import {
  Navigation,
  Plus,
  RefreshCw,
  Compass,
  ArrowRight,
  Play,
  RotateCcw,
  DollarSign,
  Clock,
  BrainCircuit,
  ShieldAlert,
} from 'lucide-react';
import { useRoutes, useCreateRoute } from '../../hooks/useRoutes';
import { usePorts } from '../../hooks/usePorts';
import { useVessels } from '../../hooks/useVessels';
import { useRouteCalculation } from '../../hooks/useRouteCalculation';
import { useCostCalculation } from '../../hooks/useCostCalculation';
import { useEtaCalculation } from '../../hooks/useEtaCalculation';
import { useMlEtaPrediction } from '../../hooks/useMlEtaPrediction';
import { useMlCostPrediction } from '../../hooks/useMlCostPrediction';
import { useRiskAssessment } from '../../hooks/useRiskAssessment';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { StatusBadge } from '../../components/data-display/StatusBadge';
import { ErrorState } from '../../components/feedback/ErrorState';
import { MaritimePageBackground } from '../../components/common/MaritimePageBackground';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { RouteMapViewer } from './components/RouteMapViewer';
import { RouteDetailsPanel } from './components/RouteDetailsPanel';
import { VoyageCostPanel } from '../cargo/components/VoyageCostPanel';
import { EtaResultPanel } from '../cargo/components/EtaResultPanel';
import { MlEtaPanel } from '../cargo/components/MlEtaPanel';
import { MlCostPanel } from '../cargo/components/MlCostPanel';
import { MaritimeRiskPanel } from '../cargo/components/MaritimeRiskPanel';
import type { Route } from '../../types/route';

export function RoutesPage() {
  const { data, isLoading, isError, error, refetch } = useRoutes(50);
  const { data: portsData } = usePorts(250);
  const { data: vesselsData } = useVessels(100);
  const createRouteMutation = useCreateRoute();

  // Route Calculation Engine Hook (Module 11)
  const {
    calculate,
    route,
    status: calcStatus,
    error: calcError,
    isCalculating,
    reset: resetCalculation,
  } = useRouteCalculation();

  // Cost Calculation Engine Hook (Module 12)
  const {
    calculate: calculateCost,
    cost,
    isCalculating: isCalculatingCost,
    error: costError,
    reset: resetCost,
  } = useCostCalculation();
  const {
    calculate: calculateEta,
    eta,
    isCalculating: isCalculatingEta,
    error: etaError,
    reset: resetEta,
  } = useEtaCalculation();
  const {
    predict: predictMlEta,
    prediction: mlEta,
    isPredicting: isPredictingMlEta,
    error: mlEtaError,
    reset: resetMlEta,
  } = useMlEtaPrediction();
  const {
    predict: predictMlCost,
    prediction: mlCost,
    isPredicting: isPredictingMlCost,
    error: mlCostError,
    reset: resetMlCost,
  } = useMlCostPrediction();
  const {
    assess: assessRisk,
    assessment: riskAssessment,
    isAssessing: isAssessingRisk,
    error: riskError,
    reset: resetRisk,
  } = useRiskAssessment();

  const handleCalculateRouteCost = async (bunkerPrice?: number, dailyHire?: number) => {
    if (!calcOriginPortId || !calcDestPortId) return;
    const vesselId = calcVesselId ? Number(calcVesselId) : 1;
    await calculateCost({
      vessel_id: vesselId,
      origin_port_id: Number(calcOriginPortId),
      destination_port_id: Number(calcDestPortId),
      route_id: route?.db_route_id || route?.route_id,
      bunker_price_usd_per_mt: bunkerPrice,
      daily_hire_usd: dailyHire,
    });
  };

  const handleCalculateRouteEta = async (departureTimeOverride?: string) => {
    if (!calcOriginPortId || !calcDestPortId) return;
    const vesselId = calcVesselId ? Number(calcVesselId) : 1;
    await calculateEta({
      vessel_id: vesselId,
      origin_port_id: Number(calcOriginPortId),
      destination_port_id: Number(calcDestPortId),
      route_id: route?.db_route_id || route?.route_id,
      departure_time: departureTimeOverride,
    });
  };

  const handleCalculateRouteMlEta = async () => {
    if (!calcOriginPortId || !calcDestPortId) return;
    const vesselId = calcVesselId ? Number(calcVesselId) : 1;
    await predictMlEta({
      vessel_id: vesselId,
      origin_port_id: Number(calcOriginPortId),
      destination_port_id: Number(calcDestPortId),
      route_id: route?.db_route_id || route?.route_id,
    });
  };

  const handleCalculateRouteMlCost = async (bunkerPrice?: number, dailyHire?: number) => {
    if (!calcOriginPortId || !calcDestPortId) return;
    const vesselId = calcVesselId ? Number(calcVesselId) : 1;
    await predictMlCost({
      vessel_id: vesselId,
      origin_port_id: Number(calcOriginPortId),
      destination_port_id: Number(calcDestPortId),
      route_id: route?.db_route_id || route?.route_id,
      bunker_price_usd_per_mt: bunkerPrice,
      daily_hire_usd: dailyHire,
    });
  };

  const handleCalculateRouteRisk = async () => {
    if (!calcOriginPortId || !calcDestPortId) return;
    const vesselId = calcVesselId ? Number(calcVesselId) : 1;
    await assessRisk({
      vessel_id: vesselId,
      origin_port_id: Number(calcOriginPortId),
      destination_port_id: Number(calcDestPortId),
      route_id: route?.db_route_id || route?.route_id,
    });
  };

  // Calculation Form State
  const [calcOriginPortId, setCalcOriginPortId] = useState<string>('');
  const [calcDestPortId, setCalcDestPortId] = useState<string>('');
  const [calcVesselId, setCalcVesselId] = useState<string>('');

  // Manual Corridor Creation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originPortId, setOriginPortId] = useState('');
  const [destPortId, setDestPortId] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [estHours, setEstHours] = useState('');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const routes = data?.routes || [];

  // Helper map for port names
  const portNameMap = new Map<number, string>();
  portsData?.ports?.forEach((p) => {
    portNameMap.set(p.id, `${p.name} (${p.country || 'Intl'})`);
  });

  // Execute Route Calculation
  const handleCalculateRoute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!calcOriginPortId || !calcDestPortId || isCalculating) return;

    await calculate({
      origin_port_id: Number(calcOriginPortId),
      destination_port_id: Number(calcDestPortId),
      vessel_id: calcVesselId ? Number(calcVesselId) : undefined,
    });
  };

  // Quick Preset Selection
  const handleSelectPreset = async (originId: number, destId: number, vesselId?: number) => {
    setCalcOriginPortId(String(originId));
    setCalcDestPortId(String(destId));
    if (vesselId) setCalcVesselId(String(vesselId));

    await calculate({
      origin_port_id: originId,
      destination_port_id: destId,
      vessel_id: vesselId,
    });
  };

  // Inspect Route from database table
  const handleInspectDatabaseRoute = async (r: Route) => {
    setCalcOriginPortId(String(r.origin_port_id));
    setCalcDestPortId(String(r.destination_port_id));
    await calculate({
      origin_port_id: r.origin_port_id,
      destination_port_id: r.destination_port_id,
    });
    // Smooth scroll to engine workspace
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manual corridor create
  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originPortId || !destPortId) return;

    try {
      await createRouteMutation.mutateAsync({
        origin_port_id: Number(originPortId),
        destination_port_id: Number(destPortId),
        distance_km: distanceKm ? Number(distanceKm) : undefined,
        estimated_duration_hours: estHours ? Number(estHours) : undefined,
        route_status: 'active',
      });

      setSubmitMessage('Corridor route successfully established in database!');
      setDistanceKm('');
      setEstHours('');
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitMessage(null);
      }, 1200);
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : 'Failed to register route');
    }
  };

  const columns: Column<Route>[] = [
    {
      key: 'corridor',
      header: 'Maritime Corridor (Origin → Destination)',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={16} color="var(--color-brand-accent)" />
          <span style={{ fontWeight: 600 }}>
            {portNameMap.get(r.origin_port_id) || `Port #${r.origin_port_id}`}
          </span>
          <ArrowRight size={14} color="var(--color-text-muted)" />
          <span style={{ fontWeight: 600 }}>
            {portNameMap.get(r.destination_port_id) || `Port #${r.destination_port_id}`}
          </span>
        </div>
      ),
    },
    {
      key: 'distance_km',
      header: 'Nautical Distance',
      render: (r) => (
        <span>{r.distance_km ? `${r.distance_km.toLocaleString()} km` : 'Pending calculation'}</span>
      ),
    },
    {
      key: 'estimated_duration_hours',
      header: 'Transit Time',
      render: (r) => (
        <span>
          {r.estimated_duration_hours
            ? `${r.estimated_duration_hours} hrs (${(r.estimated_duration_hours / 24).toFixed(1)} days)`
            : 'Pending ETA model'}
        </span>
      ),
    },
    {
      key: 'route_status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.route_status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <Button
          size="sm"
          variant="secondary"
          icon={<Compass size={13} />}
          onClick={() => handleInspectDatabaseRoute(r)}
        >
          Inspect Route
        </Button>
      ),
    },
  ];

  return (
    <div className="oceanlens-operational-page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      <MaritimePageBackground variant="voyage" />
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 217, 255, 0.12)',
                color: '#00D9FF',
                border: '1px solid rgba(0, 217, 255, 0.3)',
              }}
            >
              MODULE 11
            </span>
            <h1 className="page-title" style={{ margin: 0 }}>
              Maritime Route Calculation Engine
            </h1>
          </div>
          <p className="page-description" style={{ marginTop: '4px' }}>
            Calculate feasible maritime routes between global commercial ports, evaluating chokepoints, canal draft restrictions, and multi-leg corridors.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={() => refetch()}>
            Refresh Database
          </Button>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setIsModalOpen(!isModalOpen)}>
            {isModalOpen ? 'Close Manual Form' : 'Manual Route Entry'}
          </Button>
        </div>
      </div>

      {/* Manual Route Creation Modal Form */}
      {isModalOpen && (
        <Card style={{ borderLeft: '4px solid var(--color-status-info)' }}>
          <CardHeader title="Manual Seaway Corridor Entry" />
          <CardBody>
            <form onSubmit={handleCreateRoute}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <Select
                  label="Origin Port *"
                  required
                  options={[
                    { value: '', label: 'Select origin port...' },
                    ...(portsData?.ports?.map((p) => ({
                      value: p.id,
                      label: `${p.name} (${p.country || 'Global'})`,
                    })) || []),
                  ]}
                  value={originPortId}
                  onChange={(e) => setOriginPortId(e.target.value)}
                />

                <Select
                  label="Destination Port *"
                  required
                  options={[
                    { value: '', label: 'Select destination port...' },
                    ...(portsData?.ports?.map((p) => ({
                      value: p.id,
                      label: `${p.name} (${p.country || 'Global'})`,
                    })) || []),
                  ]}
                  value={destPortId}
                  onChange={(e) => setDestPortId(e.target.value)}
                />

                <Input
                  label="Pre-calculated Distance (km)"
                  type="number"
                  placeholder="e.g. 5420"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                />

                <Input
                  label="Estimated Transit Duration (hours)"
                  type="number"
                  placeholder="e.g. 360"
                  value={estHours}
                  onChange={(e) => setEstHours(e.target.value)}
                />
              </div>

              {submitMessage && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: submitMessage.includes('successfully') ? '#065f46' : '#991b1b',
                    color: '#ffffff',
                    fontSize: '12px',
                    marginBottom: '1rem',
                  }}
                >
                  {submitMessage}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" icon={<Plus size={14} />}>
                  Save Corridor
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* ========================================================
          Module 11: Route Calculation Command Console
          ======================================================== */}
      <Card style={{ border: '1px solid rgba(0, 217, 255, 0.25)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)' }}>
        <CardHeader
          title={
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>Maritime Route Calculation Console</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Generate feasible nautical transit corridors without overland straight lines or synthetic coordinates.
              </div>
            </div>
          }
        />
        <CardBody>
          {/* Input Controls */}
          <form onSubmit={handleCalculateRoute}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                alignItems: 'flex-end',
                marginBottom: '1rem',
              }}
            >
              {/* Origin Port */}
              <Select
                label="1. Origin Port *"
                required
                options={[
                  { value: '', label: 'Choose departure port...' },
                  ...(portsData?.ports?.map((p) => ({
                    value: p.id,
                    label: `⚓ ${p.name} (${p.country || 'International'})`,
                  })) || []),
                ]}
                value={calcOriginPortId}
                onChange={(e) => setCalcOriginPortId(e.target.value)}
              />

              {/* Destination Port */}
              <Select
                label="2. Destination Port *"
                required
                options={[
                  { value: '', label: 'Choose destination port...' },
                  ...(portsData?.ports?.map((p) => ({
                    value: p.id,
                    label: `🏁 ${p.name} (${p.country || 'International'})`,
                  })) || []),
                ]}
                value={calcDestPortId}
                onChange={(e) => setCalcDestPortId(e.target.value)}
              />

              {/* Vessel Selection (Optional) */}
              <Select
                label="3. Eligible Fleet Vessel (Optional)"
                options={[
                  { value: '', label: 'Unspecified (Standard Maritime Limits)' },
                  ...(vesselsData?.vessels?.map((v) => ({
                    value: v.id,
                    label: `🚢 ${v.name} (${v.vessel_type || 'Fleet'}, Draft: ${v.draft_m || 12}m)`,
                  })) || []),
                ]}
                value={calcVesselId}
                onChange={(e) => setCalcVesselId(e.target.value)}
              />

              {/* Action Button */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<Play size={15} />}
                  disabled={!calcOriginPortId || !calcDestPortId || isCalculating}
                  style={{ flex: 1 }}
                >
                  {isCalculating ? 'Calculating Maritime Route...' : 'Calculate Maritime Route'}
                </Button>

                {(calcOriginPortId || calcDestPortId || route) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    icon={<RotateCcw size={14} />}
                    onClick={() => {
                      setCalcOriginPortId('');
                      setCalcDestPortId('');
                      setCalcVesselId('');
                      resetCalculation();
                      resetCost();
                      resetEta();
                      resetMlEta();
                      resetMlCost();
                      resetRisk();
                    }}
                    title="Reset Calculation"
                  />
                )}
              </div>
            </div>
          </form>

          {/* Preset Corridor Quick-Launch Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-bg-surface-alt)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              Verified Corridor Presets:
            </span>

            <button
              type="button"
              className="badge"
              style={{
                background: 'rgba(0, 217, 255, 0.1)',
                color: '#00D9FF',
                border: '1px solid rgba(0, 217, 255, 0.25)',
                cursor: 'pointer',
                fontSize: '11px',
                padding: '3px 8px',
              }}
              onClick={() => handleSelectPreset(57461, 7780, 1)}
            >
              Siam Seaport (TH) → Jersey City (US) [Transoceanic via Panama]
            </button>

            <button
              type="button"
              className="badge"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                cursor: 'pointer',
                fontSize: '11px',
                padding: '3px 8px',
              }}
              onClick={() => handleSelectPreset(42440, 47110)}
            >
              Stilis (GR) → Lamu (KE) [Direct Sea Passage]
            </button>
          </div>

          {/* Route Engine Results Workspace (Map + Details) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(320px, 1fr)',
              gap: '1.25rem',
              marginTop: '1.25rem',
            }}
          >
            {/* Interactive Leaflet Route Viewer */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                Nautical Map Geometry
              </div>
              <RouteMapViewer route={route} height="480px" />
            </div>

            {/* Route Details Panel */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                Corridor Intelligence & Constraints
              </div>
              <RouteDetailsPanel route={route} status={calcStatus} error={calcError} />
            </div>
          </div>

          {/* Module 12: Voyage Transit Cost Section */}
          {route && (
            <div style={{ marginTop: '1.25rem' }}>
              {!cost ? (
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--color-bg-surface-alt)',
                    border: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Evaluate Voyage Transit Economics (Module 12)
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Calculate authoritative fuel consumption, voyage transit duration, and cost breakdown for this corridor.
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<DollarSign size={14} />}
                    disabled={isCalculatingCost}
                    onClick={() => handleCalculateRouteCost()}
                  >
                    {isCalculatingCost ? 'Calculating voyage cost...' : 'Calculate Voyage Cost'}
                  </Button>
                </div>
              ) : (
                <VoyageCostPanel
                  cost={cost}
                  isLoading={isCalculatingCost}
                  onRecalculateWithScenario={(bunker, hire) => handleCalculateRouteCost(bunker, hire)}
                />
              )}

              {costError && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>
                  {costError}
                </div>
              )}

              {/* Module 16: XGBoost ML Cost Engine Panel */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--color-border-subtle)' }}>
                {!mlCost ? (
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-bg-surface-alt)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        XGBoost Machine Learning Cost Engine (Module 16)
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Predict voyage transit expenses with ML regression model and baseline comparative economic audit.
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<BrainCircuit size={14} />}
                      disabled={isPredictingMlCost}
                      onClick={() => handleCalculateRouteMlCost()}
                    >
                      {isPredictingMlCost ? 'Predicting ML Cost...' : 'Predict ML Cost'}
                    </Button>
                  </div>
                ) : (
                  <MlCostPanel
                    prediction={mlCost}
                    isLoading={isPredictingMlCost}
                    onPredict={() => handleCalculateRouteMlCost()}
                  />
                )}

                {mlCostError && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>
                    {mlCostError}
                  </div>
                )}
              </div>

              {/* Module 13: Voyage ETA Engine Panel */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--color-border-subtle)' }}>
                {!eta ? (
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-bg-surface-alt)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Evaluate Voyage Transit ETA (Module 13)
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Calculate authoritative baseline arrival date, transit duration, and operational speed for this corridor.
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={<Clock size={14} />}
                      disabled={isCalculatingEta}
                      onClick={() => handleCalculateRouteEta()}
                    >
                      {isCalculatingEta ? 'Calculating estimated arrival...' : 'Calculate Route ETA'}
                    </Button>
                  </div>
                ) : (
                  <EtaResultPanel
                    eta={eta}
                    isLoading={isCalculatingEta}
                    onRecalculateWithDeparture={(dep) => handleCalculateRouteEta(dep)}
                  />
                )}

                {etaError && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>
                    {etaError}
                  </div>
                )}
              </div>

              {/* Module 15: XGBoost ML ETA Engine Panel */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--color-border-subtle)' }}>
                {!mlEta ? (
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-bg-surface-alt)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        XGBoost Machine Learning ETA Engine (Module 15)
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Predict voyage transit arrival with ML model and baseline comparative performance audit.
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<BrainCircuit size={14} />}
                      disabled={isPredictingMlEta}
                      onClick={() => handleCalculateRouteMlEta()}
                    >
                      {isPredictingMlEta ? 'Predicting ML ETA...' : 'Predict ML ETA'}
                    </Button>
                  </div>
                ) : (
                  <MlEtaPanel
                    prediction={mlEta}
                    isLoading={isPredictingMlEta}
                    onPredict={() => handleCalculateRouteMlEta()}
                  />
                )}

                {mlEtaError && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>
                    {mlEtaError}
                  </div>
                )}
              </div>

              {/* Module 17: Maritime Risk Assessment Engine Panel */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--color-border-subtle)' }}>
                {!riskAssessment ? (
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-bg-surface-alt)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Maritime Risk Assessment Engine (Module 17)
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Physical canal draft clearance, chokepoint security, vessel maneuvering, and cargo deadweight safety audit.
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<ShieldAlert size={14} />}
                      disabled={isAssessingRisk}
                      onClick={() => handleCalculateRouteRisk()}
                      style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
                    >
                      {isAssessingRisk ? 'Assessing Risk...' : 'Assess Corridor Risk'}
                    </Button>
                  </div>
                ) : (
                  <MaritimeRiskPanel
                    assessment={riskAssessment}
                    isLoading={isAssessingRisk}
                    onAssess={() => handleCalculateRouteRisk()}
                  />
                )}

                {riskError && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>
                    {riskError}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ========================================================
          Database Persisted Routes Section
          ======================================================== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
            Persisted Maritime Corridor Registry ({routes.length})
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Stored in canonical database &middot; Shared across live fleet and tracking
          </span>
        </div>

        {isError ? (
          <ErrorState
            title="Failed to Load Maritime Corridors"
            message={error instanceof Error ? error.message : 'Unable to connect to FastAPI /routes endpoint.'}
            onRetry={refetch}
          />
        ) : routes.length === 0 && !isLoading ? (
          <EmptyState
            title="No Corridors Registered"
            description="Use the calculation console above to calculate and establish commercial maritime corridors in the database."
            icon={<Navigation className="feedback-icon" />}
            action={
              <Button size="sm" icon={<Plus size={14} />} onClick={() => setIsModalOpen(true)}>
                Define First Corridor
              </Button>
            }
          />
        ) : (
          <DataTable
            data={routes}
            columns={columns}
            keyExtractor={(r) => r.id}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
