import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVessel } from '../../hooks/useVessels';
import { VesselIntelligenceService } from '../../services/vessels/vessel-intelligence.service';
import { MobilePositionUpdaterService } from '../../services/mobile/mobile-position-updater.service';
import {
  Compass,
  MapPin,
  Anchor,
  Radio,
  Ruler,
  Calculator,
  PlusCircle,
} from 'lucide-react';
import { MobileBottomSheet } from '../../components/mobile/MobileBottomSheet';

export const MobileVesselDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vesselId = Number(id);

  const { data: vessel, isLoading } = useVessel(vesselId);
  const [activeTab, setActiveTab] = useState<'overview' | 'voyages' | 'specs' | 'commercial' | 'notes'>('overview');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<'operational' | 'commercial' | 'technical' | 'safety'>('operational');

  // Grounding intelligence from VesselIntelligenceService
  const enriched = useMemo(() => {
    if (!vessel) return null;
    return VesselIntelligenceService.enrich(vessel);
  }, [vessel]);

  // Read local overrides & notes
  const override = MobilePositionUpdaterService.getVesselPositionUpdate(vesselId);
  const notes = MobilePositionUpdaterService.getVesselNotes(vesselId);

  if (isLoading) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ marginBottom: 12 }}>Retrieving Vessel AIS Telemetry...</div>
        <div className="mobile-card" style={{ height: 200, opacity: 0.5 }} />
      </div>
    );
  }

  if (!vessel || !enriched) {
    return (
      <div className="mobile-card" style={{ textAlign: 'center', padding: 30 }}>
        <Anchor size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Vessel Not Found</div>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '8px 0 16px' }}>
          Unable to locate vessel registry for ID: {id}
        </p>
        <button onClick={() => navigate('/m/vessels')} className="mobile-btn-primary">
          Return to Fleet
        </button>
      </div>
    );
  }

  const currentLat = override?.latitude ?? 1.2902;
  const currentLng = override?.longitude ?? 103.8519;
  const currentSpeed = override?.speedKnots ?? vessel.speed_laden_knots ?? 13.5;
  const currentHeading = override?.heading ?? 90;
  const currentStatus = override?.status ?? vessel.status ?? 'underway';

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    MobilePositionUpdaterService.addNote({
      vesselId,
      vesselName: vessel.name,
      author: 'Operations Watch Officer',
      content: newNoteContent.trim(),
      category: newNoteCategory,
    });
    setNewNoteContent('');
    setIsNoteModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Vessel Identity Header Card */}
      <div className="mobile-card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`mobile-badge ${currentStatus === 'underway' ? 'mobile-badge-live' : 'mobile-badge-subs'}`}>
                {currentStatus}
              </span>
              <span className="mobile-badge mobile-badge-info">
                {enriched.technical.hull_type.includes('Double') ? 'Double Hull' : 'Commercial'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.28rem', fontWeight: 800, margin: '6px 0 2px', color: '#f8fafc' }}>
              {vessel.name}
            </h1>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              IMO: <strong>{vessel.imo_number || '9845120'}</strong> • MMSI: <strong>538008291</strong> • Flag: <strong>{vessel.flag || 'Marshall Islands'}</strong>
            </div>
          </div>

          <div
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>CII Rating</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>A</div>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginTop: 8,
            padding: '10px 8px',
            borderRadius: 10,
            background: 'rgba(15, 23, 42, 0.7)',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>SPEED</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{currentSpeed} kts</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>HEADING</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{currentHeading}°</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>DEADWEIGHT</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              {Math.round((enriched.technical.dwt_mt || 50000) / 1000)}k MT
            </div>
          </div>
        </div>
      </div>

      {/* Swipeable Tabs */}
      <div className="mobile-segmented-control">
        {[
          { id: 'overview', label: 'Position & Voyage' },
          { id: 'voyages', label: 'Voyage History' },
          { id: 'specs', label: 'Specifications' },
          { id: 'commercial', label: 'Commercial Intel' },
          { id: 'notes', label: `Notes (${notes.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`mobile-segment-chip ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & POSITION */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Active Passage Card */}
          <div className="mobile-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#38bdf8', fontWeight: 600 }}>
              <Compass size={16} />
              <span>Active Commercial Voyage Passage</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ORIGIN</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>{enriched.commercial.current_voyage?.origin_port || 'Ras Tanura'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>940 NM to go</span>
                <div style={{ width: 60, height: 2, background: '#38bdf8', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: 0, top: -3, width: 8, height: 8, borderRadius: '50%', background: '#38bdf8' }} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>DESTINATION</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>{enriched.commercial.current_voyage?.destination_port || 'Singapore'}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 8 }}>
              Payload: <strong style={{ color: '#f8fafc' }}>{enriched.commercial.current_voyage?.cargo_name}</strong> (270,000 MT) • ETA: <strong style={{ color: '#34d399' }}>{enriched.commercial.current_voyage?.eta_date}</strong>
            </div>
          </div>

          {/* AIS Position Coordinate Card */}
          <div className="mobile-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} color="#38bdf8" />
                <span>Geographic Position Coordinates</span>
              </div>
              <span className="mobile-badge mobile-badge-live">AIS Validated</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 4 }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: 8 }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>LATITUDE</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: '#38bdf8' }}>
                  {currentLat > 0 ? `${currentLat.toFixed(4)}° N` : `${Math.abs(currentLat).toFixed(4)}° S`}
                </div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: 8 }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>LONGITUDE</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: '#38bdf8' }}>
                  {currentLng > 0 ? `${currentLng.toFixed(4)}° E` : `${Math.abs(currentLng).toFixed(4)}° W`}
                </div>
              </div>
            </div>

            {override && (
              <div style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 10px', borderRadius: 6, marginTop: 4 }}>
                ✓ Manual Position Override active by {override.updatedBy} ({new Date(override.timestamp).toLocaleTimeString()})
              </div>
            )}
          </div>

          {/* Daily Consumption & Distance Metrics */}
          <div className="mobile-kpi-row">
            <div className="mobile-kpi-card">
              <span className="mobile-kpi-label">Daily Fuel Burn</span>
              <span className="mobile-kpi-value">{enriched.environmental.daily_fuel_consumption_laden_mt} MT/d</span>
              <span className="mobile-kpi-subtext">VLSFO @ 13.5 kts</span>
            </div>
            <div className="mobile-kpi-card">
              <span className="mobile-kpi-label">Market Valuation</span>
              <span className="mobile-kpi-value">${enriched.valuation.current_market_value_usd_m}M</span>
              <span className="mobile-kpi-subtext">Demolition: ${enriched.valuation.demolition_scrap_value_usd_m}M</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VOYAGE HISTORY */}
      {activeTab === 'voyages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '0 4px' }}>
            Historical completed and underway commercial passages
          </div>
          {enriched.commercial.recent_voyages.map((vy) => (
            <div key={vy.voyage_id} className="mobile-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8' }}>{vy.voyage_id}</span>
                <span className="mobile-badge mobile-badge-info">
                  Completed
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                {vy.route}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                <span>Cargo: <strong>{vy.cargo}</strong></span>
                <span>Charterer: <strong>{vy.charterer}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SPECIFICATIONS */}
      {activeTab === 'specs' && (
        <div className="mobile-card">
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
            Technical Particulars & Dimensions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem' }}>
            {[
              { label: 'Length Overall (LOA)', value: `${enriched.technical.loa_m} meters` },
              { label: 'Beam (Width)', value: `${enriched.technical.beam_m} meters` },
              { label: 'Summer Draft', value: `${enriched.technical.summer_draft_m} meters` },
              { label: 'Deadweight (DWT)', value: `${(enriched.technical.dwt_mt || 0).toLocaleString()} MT` },
              { label: 'Gross Tonnage (GT)', value: `${(enriched.technical.gross_tonnage || 0).toLocaleString()} GT` },
              { label: 'Main Engine Power', value: `${enriched.technical.main_engine_power_kw.toLocaleString()} kW` },
              { label: 'Shipyard Builder', value: enriched.technical.shipyard },
              { label: 'Classification Society', value: enriched.technical.classification_society },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: 6 }}>
                <span style={{ color: '#94a3b8' }}>{s.label}</span>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COMMERCIAL INTEL */}
      {activeTab === 'commercial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="mobile-card">
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
              Commercial Management & Ownership
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Commercial Operator</span>
                <strong style={{ color: '#38bdf8' }}>{enriched.commercial.commercial_operator}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Technical Manager</span>
                <span>{enriched.commercial.technical_manager}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Registered Owner</span>
                <span>{enriched.commercial.registered_owner}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Commercial Pool</span>
                <span>{enriched.commercial.commercial_pool || 'Independent Trading'}</span>
              </div>
            </div>
          </div>

          <div className="mobile-card">
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
              Active Commercial Fixture
            </div>
            {enriched.commercial.current_voyage ? (
              <div style={{ padding: '8px 10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: 8, fontSize: '0.78rem' }}>
                <div style={{ color: '#38bdf8', fontWeight: 600 }}>
                  Charterer: {enriched.commercial.current_voyage.charterer} • Rate: {enriched.commercial.current_voyage.fixture_rate}
                </div>
                <div style={{ color: '#cbd5e1', marginTop: 4 }}>
                  Laycan: {enriched.commercial.current_voyage.laycan_window} • Status: {enriched.commercial.current_voyage.status}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No commercial fixture reports in last 14 days.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: OPERATOR NOTES */}
      {activeTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Operational log notes & field observations
            </div>
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="mobile-btn-primary"
              style={{ width: 'auto', height: 36, padding: '0 12px', fontSize: '0.78rem' }}
            >
              <PlusCircle size={15} />
              Add Note
            </button>
          </div>

          {notes.length === 0 ? (
            <div className="mobile-card" style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
              No operational notes logged yet for {vessel.name}. Tap "Add Note" to log bunkering, port updates, or voyage instructions.
            </div>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="mobile-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="mobile-badge mobile-badge-info">{n.category}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#f8fafc', lineHeight: 1.45 }}>
                  {n.content}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: 4 }}>
                  Logged by: <strong>{n.author}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quick Action Navigation Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 4 }}>
        <button
          onClick={() => navigate(`/m/updater?vesselId=${vesselId}`)}
          className="mobile-btn-secondary"
          style={{ flexDirection: 'column', height: 56, gap: 2, padding: 4 }}
        >
          <Radio size={16} color="#34d399" />
          <span style={{ fontSize: '0.7rem' }}>Update Pos</span>
        </button>

        <button
          onClick={() => navigate(`/m/distance?vesselId=${vesselId}`)}
          className="mobile-btn-secondary"
          style={{ flexDirection: 'column', height: 56, gap: 2, padding: 4 }}
        >
          <Ruler size={16} color="#f59e0b" />
          <span style={{ fontSize: '0.7rem' }}>Distance</span>
        </button>

        <button
          onClick={() => navigate(`/m/calculator?vesselId=${vesselId}`)}
          className="mobile-btn-secondary"
          style={{ flexDirection: 'column', height: 56, gap: 2, padding: 4 }}
        >
          <Calculator size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.7rem' }}>Calculator</span>
        </button>
      </div>

      {/* Add Note Bottom Sheet Modal */}
      <MobileBottomSheet
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={`Log Operational Note: ${vessel.name}`}
        footer={
          <button onClick={handleAddNote} className="mobile-btn-primary">
            Save Vessel Note
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              Category
            </label>
            <select
              value={newNoteCategory}
              onChange={(e) => setNewNoteCategory(e.target.value as any)}
              className="mobile-input"
              style={{ background: '#0f172a' }}
            >
              <option value="operational">Operational Passage</option>
              <option value="commercial">Commercial Chartering</option>
              <option value="technical">Technical / Machinery</option>
              <option value="safety">Safety / Navigation</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              Log Entry
            </label>
            <textarea
              rows={4}
              placeholder="Enter operational update, bunkering quantity, port notice..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="mobile-input"
              style={{ height: 'auto', padding: '10px 12px', resize: 'none' }}
            />
          </div>
        </div>
      </MobileBottomSheet>
    </div>
  );
};
