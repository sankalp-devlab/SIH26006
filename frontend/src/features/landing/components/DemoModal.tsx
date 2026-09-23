import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Navigation,
  Compass,
  Activity,
  ArrowRight,
  Radio,
  ExternalLink,
  ShieldCheck,
  Gauge,
  Layers,
} from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PreviewTab = 'map' | 'routes' | 'telemetry';

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('map');

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="oceanlens-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <div className="oceanlens-modal-content">
        {/* Modal Header */}
        <div className="modal-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--ol-cyan-bright)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Compass size={16} />
            </div>
            <h3 id="demo-modal-title" className="modal-title-text">
              OceanLens Platform Interactive Preview
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close demo modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-area">
          {/* Feature Showcase Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1.25rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              style={{
                background: activeTab === 'map' ? 'rgba(56, 189, 248, 0.16)' : 'transparent',
                border: activeTab === 'map' ? '1px solid var(--ol-border-glow)' : '1px solid transparent',
                borderRadius: '8px',
                color: activeTab === 'map' ? '#ffffff' : '#94a3b8',
                padding: '0.5rem 1rem',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s ease',
              }}
            >
              <Navigation size={14} color={activeTab === 'map' ? 'var(--ol-cyan-bright)' : undefined} />
              <span>Vessel Map</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('routes')}
              style={{
                background: activeTab === 'routes' ? 'rgba(56, 189, 248, 0.16)' : 'transparent',
                border: activeTab === 'routes' ? '1px solid var(--ol-border-glow)' : '1px solid transparent',
                borderRadius: '8px',
                color: activeTab === 'routes' ? '#ffffff' : '#94a3b8',
                padding: '0.5rem 1rem',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s ease',
              }}
            >
              <Layers size={14} color={activeTab === 'routes' ? 'var(--ol-cyan-bright)' : undefined} />
              <span>Route Intelligence</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              style={{
                background: activeTab === 'telemetry' ? 'rgba(56, 189, 248, 0.16)' : 'transparent',
                border: activeTab === 'telemetry' ? '1px solid var(--ol-border-glow)' : '1px solid transparent',
                borderRadius: '8px',
                color: activeTab === 'telemetry' ? '#ffffff' : '#94a3b8',
                padding: '0.5rem 1rem',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s ease',
              }}
            >
              <Activity size={14} color={activeTab === 'telemetry' ? 'var(--ol-cyan-bright)' : undefined} />
              <span>Real-Time Telemetry</span>
            </button>
          </div>

          {/* Interactive Screen Preview Container */}
          <div className="modal-video-placeholder" style={{ minHeight: '280px', padding: '1.5rem' }}>
            {activeTab === 'map' && (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Radio size={14} className="hero-eyebrow-pulse" color="var(--ol-cyan-bright)" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Global AIS Fleet Tracking & Corridor Density
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.72rem',
                      color: 'var(--ol-cyan-accent)',
                      background: 'rgba(56, 189, 248, 0.1)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                    }}
                  >
                    54,290 Vessels Live
                  </span>
                </div>

                {/* Radar Grid Graphic */}
                <div
                  style={{
                    position: 'relative',
                    flex: 1,
                    minHeight: '160px',
                    background: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.12) 0%, rgba(5, 11, 20, 0.7) 70%)',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {/* Grid Lines */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px)',
                      backgroundSize: '30px 30px',
                    }}
                  />
                  
                  {/* Concentric Scan Rings */}
                  <div
                    style={{
                      width: '130px',
                      height: '130px',
                      borderRadius: '50%',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      position: 'absolute',
                    }}
                  />
                  <div
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      position: 'absolute',
                    }}
                  />

                  {/* Active Target Pins */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '35%',
                      left: '42%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f2fe', boxShadow: '0 0 10px #00f2fe' }} />
                    <span style={{ fontSize: '0.6875rem', color: '#ffffff', fontFamily: 'var(--font-mono, monospace)', background: 'rgba(5, 11, 20, 0.8)', padding: '1px 4px', borderRadius: '3px' }}>
                      EVEREST MARINER (14.2 kn)
                    </span>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      top: '60%',
                      left: '68%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }} />
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)' }}>
                      PACIFIC VOYAGER (11.8 kn)
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>Target AIS: Strait of Malacca & Singapore Corridor</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>● Terrestrial + Satellite Sync</span>
                </div>
              </div>
            )}

            {activeTab === 'routes' && (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Compass size={14} color="var(--ol-cyan-bright)" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Least-Cost Multi-Leg Corridor Navigation
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.72rem',
                      color: '#34d399',
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                    }}
                  >
                    -12.4% Bunker Saved
                  </span>
                </div>

                {/* Corridor Route Visual */}
                <div
                  style={{
                    flex: 1,
                    minHeight: '160px',
                    background: 'rgba(5, 15, 29, 0.7)',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>Singapore &rarr; Rotterdam</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Route Option A: Via Suez Canal · 8,280 NM</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ol-cyan-bright)', fontFamily: 'var(--font-mono, monospace)' }}>$412,000 Total Cost</div>
                      <div style={{ fontSize: '0.72rem', color: '#34d399' }}>ETA: 22.4 Days</div>
                    </div>
                  </div>

                  {/* Visual Route Progress bar */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, #0284c7 0%, #00f2fe 100%)', borderRadius: '999px' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>ECA Compliance: <strong>100% Pass</strong></span>
                    <span>Weather Routing: <strong>Fair Sea State</strong></span>
                    <span>Chokepoint Feasibility: <strong>Optimal</strong></span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'telemetry' && (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Gauge size={14} color="var(--ol-cyan-bright)" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Real-Time Sensor & Draft Telemetry
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.72rem',
                      color: 'var(--ol-cyan-accent)',
                      background: 'rgba(56, 189, 248, 0.1)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                    }}
                  >
                    98.4% Confidence
                  </span>
                </div>

                {/* Telemetry Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', flex: 1 }}>
                  <div style={{ background: 'rgba(5, 15, 29, 0.7)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase' }}>Fuel Rate (VLSFO)</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono, monospace)', marginTop: '0.25rem' }}>38.4 MT/d</div>
                    <div style={{ fontSize: '0.6875rem', color: '#34d399', marginTop: '0.2rem' }}>-2.1% vs Benchmark</div>
                  </div>
                  <div style={{ background: 'rgba(5, 15, 29, 0.7)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase' }}>Engine Output</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono, monospace)', marginTop: '0.25rem' }}>76.8 RPM</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--ol-cyan-accent)', marginTop: '0.2rem' }}>Optimal Power Curve</div>
                  </div>
                  <div style={{ background: 'rgba(5, 15, 29, 0.7)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase' }}>Draft (Fwd / Aft)</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono, monospace)', marginTop: '0.25rem' }}>14.8m / 15.2m</div>
                    <div style={{ fontSize: '0.6875rem', color: '#34d399', marginTop: '0.2rem' }}>Safe Port Clearance</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Access Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
              <ShieldCheck size={16} color="#34d399" />
              <span>Enterprise SOC 2 Type II Certified & High-Throughput AIS Stream</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link
                to="/vessels"
                className="hero-secondary-cta"
                style={{ padding: '0.55rem 1.1rem', fontSize: '0.875rem' }}
                onClick={onClose}
              >
                <span>Live Vessels</span>
                <ExternalLink size={14} />
              </Link>
              <Link
                to="/dashboard"
                className="hero-primary-cta"
                style={{ padding: '0.55rem 1.35rem', fontSize: '0.875rem' }}
                onClick={onClose}
              >
                <span>Launch Operations</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
