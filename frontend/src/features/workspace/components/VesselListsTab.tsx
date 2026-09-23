/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION — Saved Vessel Lists / Fleets Tab
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ship,
  Plus,
  Trash2,
  Compass,
  ExternalLink,
  UserPlus,
  FileSpreadsheet,
} from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';
import { useVessels } from '../../../hooks/useVessels';
import { ExportButton } from '../../../components/export';
import { ExcelIntegrationService } from '../../../services/excel/excel-integration.service';
import type { ExportColumnDefinition } from '../../../types/export-sharing';
import type { Vessel } from '../../../types/vessel';

const FLEET_EXPORT_COLUMNS: ExportColumnDefinition<Vessel>[] = [
  { key: 'name', label: 'Vessel Name', defaultVisible: true },
  { key: 'imo_number', label: 'IMO Number', defaultVisible: true },
  { key: 'vessel_type', label: 'Vessel Type', defaultVisible: true },
  { key: 'flag', label: 'Flag', defaultVisible: true },
  { key: 'status', label: 'Status', formatter: 'status', defaultVisible: true },
  { key: 'capacity_tons', label: 'DWT (MT)', formatter: 'number', defaultVisible: true },
  { key: 'year_built', label: 'Year Built', defaultVisible: true },
  { key: 'speed_laden_knots', label: 'Speed Laden (kts)', formatter: 'number', defaultVisible: false },
  { key: 'current_latitude', label: 'Latitude', formatter: 'coordinate', defaultVisible: false },
  { key: 'current_longitude', label: 'Longitude', formatter: 'coordinate', defaultVisible: false },
];

interface VesselListsTabProps {
  onOpenCreateList: () => void;
}

export const VesselListsTab: React.FC<VesselListsTabProps> = ({ onOpenCreateList }) => {
  const navigate = useNavigate();
  const { vesselLists, deleteVesselList, addVesselToList, removeVesselFromList } = useWorkspace();
  const { data: vesselsData } = useVessels(50);
  const masterVessels = vesselsData?.vessels || [];

  const [selectedListId, setSelectedListId] = useState<string>(
    vesselLists[0]?.id || ''
  );
  const [newVesselIdInput, setNewVesselIdInput] = useState('');

  const activeList = vesselLists.find((l) => l.id === selectedListId) || vesselLists[0];

  const enrolledVessels = useMemo<Vessel[]>(() => {
    if (!activeList) return [];
    return activeList.vesselIds.map((id) => {
      const matched = masterVessels.find((v) => v.id === id);
      return (
        matched ||
        ({
          id,
          name: `VESSEL RECORD #${id}`,
          imo_number: `94${id}000`,
          vessel_type: 'Crude Oil Tanker',
          flag: 'Liberia',
          status: 'underway',
          capacity_tons: 150000,
          year_built: 2018,
        } as Vessel)
      );
    });
  }, [activeList, masterVessels]);

  const handleAddVessel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeList || !newVesselIdInput.trim()) return;
    const vid = parseInt(newVesselIdInput.trim(), 10);
    if (!isNaN(vid) && vid > 0) {
      addVesselToList(activeList.id, vid);
      setNewVesselIdInput('');
    }
  };

  const handleDeleteList = (id: string, name: string) => {
    if (window.confirm(`Delete vessel list "${name}"? Underlying vessel data will not be affected.`)) {
      deleteVesselList(id);
      if (selectedListId === id) {
        const remaining = vesselLists.filter((l) => l.id !== id);
        setSelectedListId(remaining[0]?.id || '');
      }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
      {/* Left Sidebar: Fleet Lists */}
      <div
        style={{
          background: 'var(--card-bg, #111827)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 10,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '0.92rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Ship size={16} color="#38bdf8" /> Custom Fleets ({vesselLists.length})
          </h3>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenCreateList}
            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Plus size={13} /> New Fleet
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {vesselLists.map((list) => {
            const isSelected = activeList?.id === list.id;
            return (
              <div
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected
                    ? '1px solid rgba(56, 189, 248, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  borderLeft: `4px solid ${list.color || '#38bdf8'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: '0.86rem',
                      color: isSelected ? '#38bdf8' : '#e2e8f0',
                    }}
                  >
                    {list.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '1px 6px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#94a3b8',
                    }}
                  >
                    {list.vesselCount}
                  </span>
                </div>
                {list.description && (
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: '0.75rem',
                      color: '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {list.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Selected Fleet Details & Vessel Roster */}
      <div
        style={{
          background: 'var(--card-bg, #111827)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 10,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {!activeList ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
            Select or create a vessel fleet pool to inspect vessels.
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                paddingBottom: 16,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: activeList.color || '#38bdf8',
                    }}
                  />
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>
                    {activeList.name}
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    ({activeList.vesselCount} vessels enrolled)
                  </span>
                </div>
                {activeList.description && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    {activeList.description}
                  </p>
                )}
                {activeList.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {activeList.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ExportButton
                  dataset={`Fleet Pool - ${activeList.name}`}
                  title={`Export ${activeList.name}`}
                  data={enrolledVessels}
                  columns={FLEET_EXPORT_COLUMNS}
                  label="Export Fleet"
                  size="sm"
                  variant="secondary"
                  disabled={enrolledVessels.length === 0}
                  metadata={{
                    source: 'Custom Workspace Fleet Pool',
                    totalRecordCount: enrolledVessels.length,
                    description: activeList.description,
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => ExcelIntegrationService.exportVesselListToExcel(activeList, enrolledVessels)}
                  disabled={enrolledVessels.length === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#38bdf8' }}
                  title="Export 5-sheet analytical fleet workbook to Microsoft Excel"
                >
                  <FileSpreadsheet size={14} color="#38bdf8" /> Analyze in Excel
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/map')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
                >
                  <Compass size={14} color="#38bdf8" /> Open in Live Map
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => handleDeleteList(activeList.id, activeList.name)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Trash2 size={14} /> Delete List
                </button>
              </div>
            </div>

            {/* Add Vessel Bar */}
            <form
              onSubmit={handleAddVessel}
              style={{
                display: 'flex',
                gap: 10,
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.05)',
                alignItems: 'center',
              }}
            >
              <UserPlus size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.82rem', color: '#e2e8f0', whiteSpace: 'nowrap' }}>
                Add Vessel to Pool:
              </span>
              <input
                type="number"
                className="input-field"
                placeholder="Enter Vessel ID (e.g. 1, 2, 3...)"
                value={newVesselIdInput}
                onChange={(e) => setNewVesselIdInput(e.target.value)}
                style={{ maxWidth: 220, fontSize: '0.82rem' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                disabled={!newVesselIdInput.trim()}
              >
                Enroll Vessel
              </button>
            </form>

            {/* Roster of Vessels */}
            {activeList.vesselIds.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '36px 0',
                  color: '#64748b',
                  fontSize: '0.85rem',
                }}
              >
                No vessels enrolled in this list. Enter a vessel ID above to add vessels.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeList.vesselIds.map((vesselId) => {
                  const matched = masterVessels.find((v) => v.id === vesselId);
                  const vesselName = matched?.name || `VESSEL RECORD #${vesselId}`;
                  const vesselType = matched?.vessel_type || 'Crude Oil Tanker';
                  const imo = matched?.imo_number || `94${vesselId}000`;
                  const flag = matched?.flag || 'Liberia';

                  return (
                    <div
                      key={vesselId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: 'rgba(56, 189, 248, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#38bdf8',
                          }}
                        >
                          <Ship size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f1f5f9' }}>
                            {vesselName}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            IMO: {imo} · Class: {vesselType} · Flag: {flag}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                          onClick={() => navigate(`/vessels/${vesselId}`)}
                        >
                          Dossier <ExternalLink size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVesselFromList(activeList.id, vesselId)}
                          title="Remove from this pool"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            padding: 4,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
