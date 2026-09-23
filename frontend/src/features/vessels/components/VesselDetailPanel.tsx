import { Link } from 'react-router-dom';
import {
  X, Ship, Anchor, Fuel, Ruler, Calendar, Flag, Package,
  Gauge, Hash, ChevronRight, MapPin,
} from 'lucide-react';
import { StatusBadge } from '../../../components/data-display/StatusBadge';
import type { Vessel } from '../../../types/vessel';

interface VesselDetailPanelProps {
  vessel: Vessel | null;
  onClose: () => void;
}

function DetailRow({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="vdp-row">
      <span className="vdp-row-icon">{icon}</span>
      <span className="vdp-row-label">{label}</span>
      <span className="vdp-row-value">{value ?? <span className="vdp-nil">-</span>}</span>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <div className="vdp-section-header">{title}</div>;
}

export function VesselDetailPanel({ vessel, onClose }: VesselDetailPanelProps) {
  if (!vessel) return null;

  const dwt = vessel.capacity_tons
    ? vessel.capacity_tons.toLocaleString() + ' MT'
    : null;

  const dimensions =
    vessel.length_m || vessel.width_m || vessel.draft_m
      ? `${vessel.length_m ?? '-'}m x ${vessel.width_m ?? '-'}m x ${vessel.draft_m ?? '-'}m draft`
      : null;

  const speedInfo =
    vessel.speed_laden_knots || vessel.speed_ballast_knots
      ? `${vessel.speed_laden_knots ?? '-'} kt (laden)  /  ${vessel.speed_ballast_knots ?? '-'} kt (ballast)`
      : null;

  const fuelInfo =
    vessel.fuel_laden_mt_day || vessel.fuel_ballast_mt_day
      ? `${vessel.fuel_laden_mt_day ?? '-'} MT/d (laden)  /  ${vessel.fuel_ballast_mt_day ?? '-'} MT/d (ballast)`
      : null;

  return (
    <div className="vdp-overlay">
      <div className="vdp-panel" role="dialog" aria-label={`Vessel details: ${vessel.name}`}>
        <div className="vdp-header">
          <div className="vdp-header-left">
            <div className="vdp-vessel-icon"><Ship size={20} /></div>
            <div>
              <h2 className="vdp-title">{vessel.name}</h2>
              {vessel.imo_number && (
                <span className="vdp-imo">IMO {vessel.imo_number}</span>
              )}
            </div>
          </div>
          <div className="vdp-header-right">
            <StatusBadge status={vessel.status} />
            <button className="vdp-close-btn" onClick={onClose} aria-label="Close panel">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="vdp-body">
          <SectionHeader title="Identity & Registry" />
          <div className="vdp-section">
            <DetailRow icon={<Hash size={14} />} label="IMO Number" value={vessel.imo_number ? `IMO ${vessel.imo_number}` : null} />
            <DetailRow icon={<Ship size={14} />} label="Vessel Type" value={vessel.vessel_type} />
            <DetailRow icon={<Flag size={14} />} label="Flag State" value={vessel.flag} />
            <DetailRow icon={<Calendar size={14} />} label="Year Built" value={vessel.year_built} />
          </div>

          <SectionHeader title="Dimensions & Capacity" />
          <div className="vdp-section">
            <DetailRow icon={<Anchor size={14} />} label="Deadweight (DWT)" value={dwt} />
            <DetailRow icon={<Ruler size={14} />} label="Dimensions" value={dimensions} />
          </div>

          <SectionHeader title="Performance" />
          <div className="vdp-section">
            <DetailRow icon={<Gauge size={14} />} label="Speed" value={speedInfo} />
            <DetailRow icon={<Fuel size={14} />} label="Fuel Consumption" value={fuelInfo} />
          </div>

          <SectionHeader title="Cargo Compatibility" />
          <div className="vdp-section">
            <DetailRow icon={<Package size={14} />} label="Cargo Types" value={vessel.cargo_types} />
          </div>

          <div className="vdp-actions">
            <Link to={`/map?vessel=${vessel.id}`} className="vdp-action-btn primary" style={{ textDecoration: 'none', marginBottom: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} />
                Track on Live Map
              </span>
              <ChevronRight size={14} />
            </Link>
            <button className="vdp-action-btn" onClick={() => {}}>
              <span>Full Technical Specs</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
