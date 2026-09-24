import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Settings, Bell, Key, Server, Save } from 'lucide-react';
import { API_CONFIG } from '../../config/api';
import { useApiStatus } from '../api-status/ApiStatusContext';

export default function SettingsPage() {
  const { isOnline, isOffline } = useApiStatus();
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'notifications'>('general');
  const [apiBaseUrl, setApiBaseUrl] = useState(API_CONFIG.BASE_URL);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-description">
            Manage system configurations, API credentials, fleet notification thresholds, and security parameters.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem' }}>
        {/* Navigation / Tabs */}
        <div>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <button
                type="button"
                className={`nav-item ${activeTab === 'general' ? 'active' : ''}`}
                style={{ color: activeTab === 'general' ? 'white' : 'var(--color-text-primary)' }}
                onClick={() => setActiveTab('general')}
              >
                <Settings size={16} />
                <span>General Config</span>
              </button>
              <button
                type="button"
                className={`nav-item ${activeTab === 'api' ? 'active' : ''}`}
                style={{ color: activeTab === 'api' ? 'white' : 'var(--color-text-primary)' }}
                onClick={() => setActiveTab('api')}
              >
                <Server size={16} />
                <span>Backend & APIs</span>
              </button>
              <button
                type="button"
                className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                style={{ color: activeTab === 'notifications' ? 'white' : 'var(--color-text-primary)' }}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={16} />
                <span>Alert Thresholds</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'general' && (
            <Card title="General Maritime Workspace Settings">
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Default Distance Unit</label>
                  <select className="form-select" defaultValue="nm">
                    <option value="nm">Nautical Miles (NM)</option>
                    <option value="km">Kilometers (KM)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Default Fuel Currency</label>
                  <select className="form-select" defaultValue="usd">
                    <option value="usd">USD ($ / MT)</option>
                    <option value="inr">INR (₹ / MT)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">System Timezone</label>
                  <select className="form-select" defaultValue="utc">
                    <option value="utc">UTC (Coordinated Universal Time)</option>
                    <option value="ist">IST (Indian Standard Time, UTC+5:30)</option>
                    <option value="sgt">SGT (Singapore Time, UTC+8:00)</option>
                  </select>
                </div>

                <div>
                  <Button type="submit" variant="primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Save size={14} />
                    <span>Save General Settings</span>
                  </Button>
                  {saved && <span style={{ marginLeft: 12, color: '#10b981', fontSize: 13, fontWeight: 500 }}>Settings saved!</span>}
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card title="FastAPI & Supabase Service Endpoints">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>FastAPI Microservice (Uvicorn)</span>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Primary calculation and query routing server</p>
                  </div>
                  <Badge variant={isOnline ? 'success' : isOffline ? 'danger' : 'warning'}>
                    {isOnline ? 'Online · Live Microservice' : isOffline ? 'Offline · Disconnected' : 'Checking Status'}
                  </Badge>
                </div>

                <div className="form-group">
                  <label className="form-label">API Gateway Base URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                  />
                  <span className="text-xs text-muted" style={{ marginTop: 4, display: 'block' }}>
                    Active maritime intelligence microservice base URL
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>PostgreSQL Database Connection</span>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Connected via Supabase async psycopg client</p>
                  </div>
                  <Badge variant="success">Connected</Badge>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="outline" onClick={() => window.open(`${apiBaseUrl.replace(/\/+$/, '')}/docs`, '_blank')}>
                    <Key size={14} style={{ marginRight: 6 }} />
                    Open Swagger Docs
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card title="Maritime Operational Alert Triggers">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <div>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>Port Congestion Warning</span>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Alert when port anchor queue exceeds 10 vessels</p>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <div>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>Chokepoint Advisory</span>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Notify immediately when Malacca or Suez transit delays occur</p>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <div>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>Vessel ETA Variance</span>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Flag voyages where actual progress diverges &gt; 12 hours from schedule</p>
                  </div>
                </label>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
