import { useState, useEffect, useRef } from 'react';
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
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  TrendingUp,
  Anchor,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PreviewTab = 'video' | 'map' | 'routes' | 'telemetry' | 'commodity';

interface Chapter {
  id: number;
  title: string;
  startTime: number;
  endTime: number;
  badge: string;
  description: string;
  hudTitle: string;
  hudMetrics: { label: string; value: string; highlight?: boolean }[];
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: '01. Global AIS & Satellite Fusion',
    startTime: 0,
    endTime: 40,
    badge: 'AIS TELEMETRY',
    description: 'Fusing 54,290+ terrestrial and LEO satellite AIS transponders into sub-second situational awareness across critical shipping corridors.',
    hudTitle: 'ORBITAL AIS FUSION HUB',
    hudMetrics: [
      { label: 'Active Transponders', value: '54,298 Vessels' },
      { label: 'Ingestion Latency', value: '380 ms', highlight: true },
      { label: 'Satellite Constellation', value: 'Iridium NEXT + Spire' },
      { label: 'Corridor Focus', value: 'Strait of Malacca TSS' },
    ],
  },
  {
    id: 2,
    title: '02. ML Voyage & Least-Cost Route',
    startTime: 41,
    endTime: 80,
    badge: 'AI ROUTING',
    description: 'XGBoost intelligence engine dynamically recalculates least-cost bunker routing, hydrodynamic drag, and passage economics.',
    hudTitle: 'VOYAGE OPTIMIZATION ENGINE',
    hudMetrics: [
      { label: 'Route Corridor', value: 'Singapore → Rotterdam' },
      { label: 'Bunker Delta', value: '-14.2% Saved', highlight: true },
      { label: 'Voyage Cost', value: '$412,000 USD' },
      { label: 'ETA Confidence', value: '98.4% (22.4 Days)' },
    ],
  },
  {
    id: 3,
    title: '03. Commodity Flows & Arbitrage',
    startTime: 81,
    endTime: 120,
    badge: 'TRADE SPREADS',
    description: 'Tracking cargo payloads with global oil refinery runs, crack spreads, and crude spot differentials to identify arbitrage windows.',
    hudTitle: 'CARGO & SPOT ARBITRAGE',
    hudMetrics: [
      { label: 'VLCC TD3C Benchmark', value: 'WS 62.5 (+3.4%)' },
      { label: 'Brent-Dubai EFS', value: '+$1.85 / bbl', highlight: true },
      { label: 'Floating Storage', value: '4 VLCCs (Offshore)' },
      { label: 'Refinery Run Status', value: 'High Demand (Asia-Pac)' },
    ],
  },
  {
    id: 4,
    title: '04. Shipboard Telemetry & Port Clearance',
    startTime: 121,
    endTime: 160,
    badge: 'IOT SENSORS',
    description: 'Live sensor telemetry streaming directly from shipboard superstructure: engine RPM, fuel burn rate, and safe under-keel clearance.',
    hudTitle: 'ONBOARD SENSOR TELEMETRY',
    hudMetrics: [
      { label: 'VLSFO Fuel Burn', value: '38.4 MT/day', highlight: true },
      { label: 'Main Engine Shaft', value: '76.8 RPM' },
      { label: 'Draft (Fwd / Aft)', value: '14.8m / 15.2m' },
      { label: 'Port Clearance Status', value: 'Green (Safe UKC +2.4m)' },
    ],
  },
];

const DEMO_VESSELS = [
  {
    id: 'v1',
    name: 'EVEREST MARINER',
    type: 'VLCC Supertanker',
    flag: 'Panama (PA)',
    speed: 14.8,
    heading: 114,
    status: 'Underway',
    cargo: '2,040,000 bbls Crude',
    eta: 'Oct 04, 08:30 UTC',
    top: '38%',
    left: '46%',
    color: 'cyan' as const,
  },
  {
    id: 'v2',
    name: 'PACIFIC VOYAGER',
    type: 'Ultra-Large Container',
    flag: 'Liberia (LR)',
    speed: 18.2,
    heading: 298,
    status: 'Underway',
    cargo: '18,500 TEU Dry/Reefer',
    eta: 'Oct 02, 14:00 UTC',
    top: '64%',
    left: '68%',
    color: 'emerald' as const,
  },
  {
    id: 'v3',
    name: 'GASLOG GLADSTONE',
    type: 'LNG Carrier (Q-Flex)',
    flag: 'Bermuda (BM)',
    speed: 16.5,
    heading: 118,
    status: 'Underway',
    cargo: '174,000 m³ LNG',
    eta: 'Oct 06, 19:15 UTC',
    top: '25%',
    left: '28%',
    color: 'amber' as const,
  },
];

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('video');
  const [isExpanded, setIsExpanded] = useState(false);

  // Video playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(12);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isAudioActive, setIsAudioActive] = useState(true);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);

  // Filter in vessel map
  const [vesselFilter, setVesselFilter] = useState<'all' | 'tanker' | 'container' | 'lng'>('all');
  // Route comparison selector
  const [selectedRoute, setSelectedRoute] = useState<'suez' | 'cape'>('suez');

  const totalDuration = 160;
  const timerRef = useRef<number | null>(null);

  // Playback loop
  useEffect(() => {
    if (!isOpen || activeTab !== 'video') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, playbackSpeed, activeTab]);

  // Keyboard navigation & accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.code === 'Space' && activeTab === 'video') {
        // Spacebar plays/pauses
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, activeTab]);

  // Body scroll lock
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

  // Active chapter computation
  const activeChapter =
    CHAPTERS.find((ch) => currentTime >= ch.startTime && currentTime <= ch.endTime) || CHAPTERS[0];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentTime(Math.floor(ratio * totalDuration));
  };

  const selectedVessel = DEMO_VESSELS.find((v) => v.id === selectedVesselId);

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
      <div className={`demo-modal-window ${isExpanded ? 'expanded' : ''}`}>
        {/* Modal Header */}
        <div className="demo-modal-header">
          <div className="demo-modal-title-group">
            <div className="demo-modal-brand-badge" aria-hidden="true">
              <Compass size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h3 id="demo-modal-title" className="demo-modal-title">
                OceanLens Platform Interactive Demo
                <span className="demo-live-indicator-badge">
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 8px #10b981',
                    }}
                  />
                  Live AIS Stream
                </span>
              </h3>
            </div>
          </div>

          <div className="demo-header-actions">
            <button
              type="button"
              className="demo-modal-icon-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse demo window' : 'Expand demo window'}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              type="button"
              className="demo-modal-close-btn"
              onClick={onClose}
              aria-label="Close demo modal"
              title="Close modal (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="demo-modal-body">
          {/* Navigation Tabs */}
          <div className="demo-tabs-bar" role="tablist" aria-label="Demo views">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'video'}
              onClick={() => setActiveTab('video')}
              className={`demo-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
            >
              <Play size={14} fill={activeTab === 'video' ? 'currentColor' : 'none'} />
              <span>Watch Guided Demo</span>
              <span className="demo-tab-badge">4K SIMULATED</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'map'}
              onClick={() => setActiveTab('map')}
              className={`demo-tab-btn ${activeTab === 'map' ? 'active' : ''}`}
            >
              <Navigation size={14} />
              <span>Vessel Radar Map</span>
              <span className="demo-tab-badge green">54,290 ACTIVE</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'routes'}
              onClick={() => setActiveTab('routes')}
              className={`demo-tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
            >
              <Layers size={14} />
              <span>Route Intelligence</span>
              <span className="demo-tab-badge">-14.2% BUNKER</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'telemetry'}
              onClick={() => setActiveTab('telemetry')}
              className={`demo-tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
            >
              <Activity size={14} />
              <span>Real-Time Telemetry</span>
              <span className="demo-tab-badge">98.4% CONF</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'commodity'}
              onClick={() => setActiveTab('commodity')}
              className={`demo-tab-btn ${activeTab === 'commodity' ? 'active' : ''}`}
            >
              <TrendingUp size={14} />
              <span>Commodity Arbitrage</span>
            </button>
          </div>

          {/* TAB 1: WATCH GUIDED DEMO (VIDEO PLAYER) */}
          {activeTab === 'video' && (
            <div className="demo-video-wrapper">
              {/* Top Video HUD Strip */}
              <div className="demo-video-top-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Radio size={14} color="#38bdf8" />
                  <span style={{ fontWeight: 700, color: '#f8fafc', letterSpacing: '0.04em' }}>
                    {activeChapter.title.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.7rem',
                      background: 'rgba(56, 189, 248, 0.15)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      color: 'var(--ol-accent-light)',
                    }}
                  >
                    {activeChapter.badge}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.74rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', color: '#94a3b8' }}>
                    LAT: 01°16′38″N · LON: 103°50′44″E
                  </span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>● 60 FPS ULTRA-HD</span>
                </div>
              </div>

              {/* Main Simulated Video Viewport */}
              <div
                className="demo-video-viewport"
                onClick={() => setIsPlaying(!isPlaying)}
                title="Click to play/pause video"
              >
                {/* Nautical Background Grid & Concentric Radar Rings */}
                <div className="demo-video-grid-canvas" />
                <div className="demo-radar-circle-outer" />
                <div className="demo-radar-circle-inner" />
                <div className="demo-radar-circle-center" />

                {/* Rotating Radar Sweep Beam */}
                <div className="demo-radar-sweep-beam" />

                {/* Simulated Target Vessels */}
                {DEMO_VESSELS.map((v) => (
                  <div
                    key={v.id}
                    className="demo-video-vessel-marker"
                    style={{ top: v.top, left: v.left }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVesselId(v.id);
                    }}
                  >
                    <div className={`demo-vessel-dot ${v.color}`}>
                      <div className="demo-vessel-pulse-ring" />
                    </div>
                    <div className="demo-vessel-tag">
                      <span>{v.name}</span>
                      <span className="demo-vessel-speed">{v.speed} kn</span>
                    </div>
                  </div>
                ))}

                {/* Dynamic HUD Metric Card on Video */}
                <div className="demo-hud-card">
                  <div className="demo-hud-header">
                    <span>{activeChapter.hudTitle}</span>
                    <Sparkles size={12} />
                  </div>
                  {activeChapter.hudMetrics.map((m, idx) => (
                    <div key={idx} className="demo-hud-metric-row">
                      <span>{m.label}</span>
                      <span
                        className="demo-hud-metric-val"
                        style={{ color: m.highlight ? '#34d399' : '#ffffff' }}
                      >
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Selected Vessel Inspector Card (If user clicked a vessel) */}
                {selectedVessel && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '4.5rem',
                      left: '1.25rem',
                      background: 'rgba(5, 14, 28, 0.95)',
                      border: '1px solid #38bdf8',
                      borderRadius: '8px',
                      padding: '0.85rem 1.1rem',
                      zIndex: 30,
                      width: '260px',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                        {selectedVessel.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedVesselId(null)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '2px' }}>
                      {selectedVessel.type} · {selectedVessel.flag}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px' }}>
                      Cargo: <strong style={{ color: '#ffffff' }}>{selectedVessel.cargo}</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                      ETA: <strong style={{ color: '#34d399' }}>{selectedVessel.eta}</strong>
                    </div>
                    <Link
                      to="/vessels"
                      onClick={onClose}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        color: 'var(--ol-accent-light)',
                        marginTop: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      <span>Track in Vessels Workspace</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                )}

                {/* Big Center Play Overlay (Shown when paused) */}
                {!isPlaying && (
                  <div className="demo-video-play-overlay">
                    <button
                      type="button"
                      className="demo-big-play-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPlaying(true);
                      }}
                      aria-label="Resume demo playback"
                    >
                      <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />
                    </button>
                    <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
                      Click to Resume OceanLens Walkthrough
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Press [Spacebar] to Play / Pause · [Esc] to Close
                    </div>
                  </div>
                )}

                {/* Bottom Subtitles / Narration Banner */}
                <div className="demo-video-subtitles-bar" onClick={(e) => e.stopPropagation()}>
                  <div className="demo-subtitles-content">
                    <div className="demo-subtitles-bullet" />
                    <span>{activeChapter.description}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {isAudioActive && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          height: '14px',
                          color: '#34d399',
                        }}
                        title="Simulated Audio Waveform"
                      >
                        <span style={{ width: '2px', height: '60%', background: 'currentColor', borderRadius: '1px' }} />
                        <span style={{ width: '2px', height: '100%', background: 'currentColor', borderRadius: '1px' }} />
                        <span style={{ width: '2px', height: '40%', background: 'currentColor', borderRadius: '1px' }} />
                        <span style={{ width: '2px', height: '80%', background: 'currentColor', borderRadius: '1px' }} />
                      </div>
                    )}
                    <Link
                      to="/dashboard"
                      onClick={onClose}
                      style={{
                        background: 'rgba(56, 189, 248, 0.16)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        color: '#ffffff',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        padding: '0.3rem 0.75rem',
                        borderRadius: '5px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span>Try Live</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Video Controls Bar */}
              <div className="demo-video-controls-bar">
                {/* Scrubber Progress Bar */}
                <div className="demo-timeline-container">
                  <span className="demo-timecode">{formatTime(currentTime)}</span>
                  <div
                    className="demo-timeline-track"
                    onClick={handleSeek}
                    role="slider"
                    aria-label="Video seek progress"
                    aria-valuemin={0}
                    aria-valuemax={totalDuration}
                    aria-valuenow={currentTime}
                  >
                    <div
                      className="demo-timeline-progress"
                      style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                    >
                      <div className="demo-timeline-thumb" />
                    </div>
                  </div>
                  <span className="demo-timecode">{formatTime(totalDuration)}</span>
                </div>

                {/* Control Action Buttons & Chapters */}
                <div className="demo-controls-action-row">
                  <div className="demo-controls-left">
                    <button
                      type="button"
                      className="demo-ctrl-btn"
                      onClick={() => setIsPlaying(!isPlaying)}
                      aria-label={isPlaying ? 'Pause demo' : 'Play demo'}
                      title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                    >
                      {isPlaying ? (
                        <Pause size={14} />
                      ) : (
                        <Play size={14} fill="currentColor" style={{ marginLeft: '1px' }} />
                      )}
                    </button>

                    <button
                      type="button"
                      className="demo-ctrl-btn"
                      onClick={() => {
                        setCurrentTime(0);
                        setIsPlaying(true);
                      }}
                      aria-label="Restart demo"
                      title="Replay from start"
                    >
                      <RotateCcw size={13} />
                    </button>

                    <button
                      type="button"
                      className="demo-ctrl-btn"
                      onClick={() => setIsAudioActive(!isAudioActive)}
                      aria-label={isAudioActive ? 'Mute audio' : 'Unmute audio'}
                      title={isAudioActive ? 'Sound On' : 'Sound Muted'}
                    >
                      {isAudioActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    </button>

                    <button
                      type="button"
                      className="demo-speed-btn"
                      onClick={() => {
                        const speeds = [1, 1.5, 2];
                        const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                        setPlaybackSpeed(speeds[nextIdx]);
                      }}
                      title="Playback speed"
                    >
                      {playbackSpeed}x
                    </button>
                  </div>

                  {/* Chapter Navigation Quick Pills */}
                  <div className="demo-chapter-pills-group">
                    {CHAPTERS.map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          setCurrentTime(ch.startTime);
                          setIsPlaying(true);
                        }}
                        className={`demo-chapter-pill ${activeChapter.id === ch.id ? 'active' : ''}`}
                      >
                        {ch.title.split('.')[1].trim()}
                      </button>
                    ))}
                  </div>

                  <div className="demo-controls-right">
                    <button
                      type="button"
                      className="demo-ctrl-btn"
                      onClick={() => setIsExpanded(!isExpanded)}
                      title={isExpanded ? 'Collapse' : 'Fullscreen'}
                    >
                      {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE VESSEL RADAR MAP */}
          {activeTab === 'map' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Radio size={15} color="var(--ol-cyan-bright)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Global AIS Fleet Tracking & Corridor Density
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => setVesselFilter('all')}
                    style={{
                      background: vesselFilter === 'all' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: vesselFilter === 'all' ? '1px solid var(--ol-accent-light)' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: vesselFilter === 'all' ? '#ffffff' : '#94a3b8',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    All Vessels
                  </button>
                  <button
                    type="button"
                    onClick={() => setVesselFilter('tanker')}
                    style={{
                      background: vesselFilter === 'tanker' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: vesselFilter === 'tanker' ? '1px solid var(--ol-accent-light)' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: vesselFilter === 'tanker' ? '#ffffff' : '#94a3b8',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    VLCC Tankers
                  </button>
                  <button
                    type="button"
                    onClick={() => setVesselFilter('container')}
                    style={{
                      background: vesselFilter === 'container' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: vesselFilter === 'container' ? '1px solid var(--ol-accent-light)' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: vesselFilter === 'container' ? '#ffffff' : '#94a3b8',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Containers
                  </button>
                </div>
              </div>

              {/* Radar Stage Graphic */}
              <div
                style={{
                  position: 'relative',
                  minHeight: '260px',
                  background: 'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.15) 0%, rgba(4, 9, 18, 0.95) 75%)',
                  borderRadius: '10px',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <div className="demo-video-grid-canvas" />
                <div className="demo-radar-circle-outer" />
                <div className="demo-radar-circle-inner" />
                <div className="demo-radar-sweep-beam" />

                {DEMO_VESSELS.filter((v) => {
                  if (vesselFilter === 'tanker') return v.type.includes('VLCC');
                  if (vesselFilter === 'container') return v.type.includes('Container');
                  return true;
                }).map((v) => (
                  <div
                    key={v.id}
                    className="demo-video-vessel-marker"
                    style={{ top: v.top, left: v.left }}
                    onClick={() => setSelectedVesselId(v.id)}
                  >
                    <div className={`demo-vessel-dot ${v.color}`}>
                      <div className="demo-vessel-pulse-ring" />
                    </div>
                    <div className="demo-vessel-tag">
                      <span>{v.name}</span>
                      <span className="demo-vessel-speed">{v.speed} kn</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94a3b8' }}>
                <span>Target AIS: Strait of Malacca & Singapore Corridor</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>● Terrestrial + Satellite Sync</span>
              </div>
            </div>
          )}

          {/* TAB 3: ROUTE INTELLIGENCE */}
          {activeTab === 'routes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Compass size={15} color="var(--ol-cyan-bright)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Least-Cost Multi-Leg Corridor Navigation
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedRoute('suez')}
                    style={{
                      background: selectedRoute === 'suez' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: selectedRoute === 'suez' ? '1px solid var(--ol-accent-light)' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: selectedRoute === 'suez' ? '#ffffff' : '#94a3b8',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Via Suez Canal (Optimal)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRoute('cape')}
                    style={{
                      background: selectedRoute === 'cape' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: selectedRoute === 'cape' ? '1px solid var(--ol-accent-light)' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: selectedRoute === 'cape' ? '#ffffff' : '#94a3b8',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Via Cape of Good Hope
                  </button>
                </div>
              </div>

              {/* Corridor Route Visual Panel */}
              <div
                style={{
                  background: 'rgba(5, 14, 28, 0.8)',
                  borderRadius: '10px',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                      Singapore &rarr; Rotterdam
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      {selectedRoute === 'suez'
                        ? 'Route Option A: Via Suez Canal · 8,280 NM · Least-Cost Profile'
                        : 'Route Option B: Via Cape of Good Hope · 11,750 NM · Avoids Red Sea Chokepoint'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ol-cyan-bright)', fontFamily: 'var(--font-mono, monospace)' }}>
                      {selectedRoute === 'suez' ? '$412,000 USD' : '$546,000 USD'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: selectedRoute === 'suez' ? '#34d399' : '#f59e0b', fontWeight: 600 }}>
                      {selectedRoute === 'suez' ? 'ETA: 22.4 Days (-14.2% Bunker Saved)' : 'ETA: 31.8 Days (+9.4 Days)'}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: selectedRoute === 'suez' ? '68%' : '45%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #0284c7 0%, #00f2fe 100%)',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>ECA COMPLIANCE</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>100% Pass</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>CARBON (EU ETS)</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>$34,200 Tax Est.</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>WEATHER RISK</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>Low (Sea State 3)</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>CANAL QUEUE</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>Clear (0.4h Delay)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REAL-TIME TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Gauge size={15} color="var(--ol-cyan-bright)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Shipboard Sensor & Hull Telemetry Telemetry
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
                  98.4% Telemetry Confidence
                </span>
              </div>

              {/* Sensor Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(5, 15, 29, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Fuel Burn (VLSFO)
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono, monospace)', marginTop: '0.35rem' }}>
                    38.4 MT/d
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.25rem' }}>
                    -2.1% vs Speed Curve Benchmark
                  </div>
                </div>

                <div style={{ background: 'rgba(5, 15, 29, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Engine Output
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono, monospace)', marginTop: '0.35rem' }}>
                    76.8 RPM
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ol-cyan-accent)', marginTop: '0.25rem' }}>
                    Optimal Torque & Harmonic State
                  </div>
                </div>

                <div style={{ background: 'rgba(5, 15, 29, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Draft (Fwd / Aft)
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono, monospace)', marginTop: '0.35rem' }}>
                    14.8m / 15.2m
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '0.25rem' }}>
                    Safe Singapore Port Clearance
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COMMODITY ARBITRAGE */}
          {activeTab === 'commodity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={15} color="var(--ol-cyan-bright)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Real-Time Commodity Flows & Clean/Dirty Tanker Spreads
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.72rem',
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.1)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                  }}
                >
                  Live Singapore / Rotterdam Basis
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(5, 15, 29, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>BRENT CRUDE SPOT</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono, monospace)', marginTop: '0.2rem' }}>
                    $82.46/bbl
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#34d399' }}>+1.8% today</div>
                </div>

                <div style={{ background: 'rgba(5, 15, 29, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>BRENT-DUBAI EFS</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono, monospace)', marginTop: '0.2rem' }}>
                    +$1.85/bbl
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Arbitrage Open to Asia</div>
                </div>

                <div style={{ background: 'rgba(5, 15, 29, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>VLCC TD3C SPOT</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono, monospace)', marginTop: '0.2rem' }}>
                    WS 62.5
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#34d399' }}>+3.4 pts w-o-w</div>
                </div>

                <div style={{ background: 'rgba(5, 15, 29, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>VLSFO BUNKER (SGP)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono, monospace)', marginTop: '0.2rem' }}>
                    $624.50/MT
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#ef4444' }}>-$4.00 vs Mean</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="demo-modal-footer">
          <div className="demo-footer-trust">
            <ShieldCheck size={16} color="#34d399" />
            <span>Enterprise SOC 2 Type II Certified & High-Throughput AIS Stream</span>
          </div>

          <div className="demo-footer-actions">
            <Link
              to="/vessels"
              className="hero-secondary-cta"
              style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
              onClick={onClose}
            >
              <span>Live Vessels</span>
              <ExternalLink size={14} />
            </Link>

            <Link
              to="/dashboard"
              className="hero-primary-cta"
              style={{ padding: '0.55rem 1.35rem', fontSize: '0.85rem' }}
              onClick={onClose}
            >
              <span>Launch Operations</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
