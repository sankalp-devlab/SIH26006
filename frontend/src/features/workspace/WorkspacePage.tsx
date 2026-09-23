/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 29: PERSONALIZATION / USER WORKSPACE — Desktop Page Shell
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Star,
  Ship,
  Tag,
  Database,
  FileSpreadsheet,
  Package,
  Download,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { OverviewTab } from './components/OverviewTab';
import { FavouritesTab } from './components/FavouritesTab';
import { VesselListsTab } from './components/VesselListsTab';
import { TagsTab } from './components/TagsTab';
import { SavedQueriesTab } from './components/SavedQueriesTab';
import { TemplatesTab } from './components/TemplatesTab';
import { PrivateCargoTab } from './components/PrivateCargoTab';
import { AddPrivateCargoModal } from './components/AddPrivateCargoModal';
import { CreateVesselListModal } from './components/CreateVesselListModal';
import { WorkspaceExportImportModal } from './components/WorkspaceExportImportModal';

type WorkspaceTab =
  | 'overview'
  | 'favourites'
  | 'vessel_lists'
  | 'tags'
  | 'saved_queries'
  | 'templates'
  | 'private_cargo';

export const WorkspacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [isAddCargoOpen, setIsAddCargoOpen] = useState(false);
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  const { stats, createPrivateCargo, createVesselList } = useWorkspace();

  const TABS: { id: WorkspaceTab; label: string; icon: React.ComponentType<{ size?: number; color?: string }>; count?: number }[] = [
    { id: 'overview', label: 'Workspace Overview', icon: LayoutDashboard },
    { id: 'favourites', label: 'Favourites', icon: Star, count: stats.favouritesCount },
    { id: 'vessel_lists', label: 'Fleet Pools', icon: Ship, count: stats.vesselListsCount },
    { id: 'tags', label: 'Tags', icon: Tag, count: stats.tagsCount },
    { id: 'saved_queries', label: 'Saved Queries', icon: Database, count: stats.savedQueriesCount },
    { id: 'templates', label: 'Templates', icon: FileSpreadsheet, count: stats.templatesCount },
    { id: 'private_cargo', label: 'Private Cargo', icon: Package, count: stats.privateCargoCount },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
              Personal Workspace
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: 12,
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <ShieldCheck size={12} /> User-Private
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#94a3b8' }}>
            Persistent operational workspace for custom fleet pools, pinned intelligence, saved workbench queries, and private cargo tracking.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsExportImportOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
          >
            <Download size={14} /> Data Management / Backup
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsCreateListOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
          >
            <Plus size={14} /> New Fleet Pool
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddCargoOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
          >
            <Plus size={14} /> Track Cargo
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <div
          onClick={() => setActiveTab('favourites')}
          style={{
            background: 'var(--card-bg, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: '14px 16px',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f59e0b' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Favourites
            </span>
            <Star size={16} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
            {stats.favouritesCount}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('vessel_lists')}
          style={{
            background: 'var(--card-bg, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: '14px 16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#38bdf8' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Fleet Pools
            </span>
            <Ship size={16} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
            {stats.vesselListsCount}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('saved_queries')}
          style={{
            background: 'var(--card-bg, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: '14px 16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#818cf8' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Saved Queries
            </span>
            <Database size={16} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
            {stats.savedQueriesCount}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('templates')}
          style={{
            background: 'var(--card-bg, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: '14px 16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f59e0b' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Templates
            </span>
            <FileSpreadsheet size={16} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
            {stats.templatesCount}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('private_cargo')}
          style={{
            background: 'var(--card-bg, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: '14px 16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#34d399' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Private Cargo
            </span>
            <Package size={16} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
            {stats.privateCargoCount}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('tags')}
          style={{
            background: 'var(--card-bg, #111827)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 10,
            padding: '14px 16px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ec4899' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tags
            </span>
            <Tag size={16} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
            {stats.tagsCount}
          </div>
        </div>
      </div>

      {/* Tab Navigation Navigation Bar */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto',
          paddingBottom: 2,
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '1px 6px',
                    borderRadius: 10,
                    background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#38bdf8' : '#94a3b8',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab
            onSelectTab={(t) => setActiveTab(t as WorkspaceTab)}
            onOpenAddCargo={() => setIsAddCargoOpen(true)}
            onOpenCreateList={() => setIsCreateListOpen(true)}
          />
        )}
        {activeTab === 'favourites' && <FavouritesTab />}
        {activeTab === 'vessel_lists' && (
          <VesselListsTab onOpenCreateList={() => setIsCreateListOpen(true)} />
        )}
        {activeTab === 'tags' && <TagsTab />}
        {activeTab === 'saved_queries' && <SavedQueriesTab />}
        {activeTab === 'templates' && <TemplatesTab />}
        {activeTab === 'private_cargo' && (
          <PrivateCargoTab onOpenAddCargo={() => setIsAddCargoOpen(true)} />
        )}
      </div>

      {/* Modals */}
      <AddPrivateCargoModal
        isOpen={isAddCargoOpen}
        onClose={() => setIsAddCargoOpen(false)}
        onSave={createPrivateCargo}
      />

      <CreateVesselListModal
        isOpen={isCreateListOpen}
        onClose={() => setIsCreateListOpen(false)}
        onCreate={createVesselList}
      />

      <WorkspaceExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
      />
    </div>
  );
};

export default WorkspacePage;
