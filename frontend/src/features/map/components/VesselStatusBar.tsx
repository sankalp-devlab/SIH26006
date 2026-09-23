import { RotateCcw, AlertTriangle } from 'lucide-react';

interface VesselStatusBarProps {
  isConnected: boolean;
  lastUpdateSeconds: number;
  visibleVesselsCount: number;
  totalVesselsCount: number;
  positionedVesselsCount?: number;
  portsCount?: number;
  routesCount?: number;
  zoom: number;
  cursorCoords: { lat: number; lng: number } | null;
  onRetryConnection?: () => void;
  onResetView?: () => void;
  activeLayerCount?: number;
}

export function VesselStatusBar({
  isConnected,
  lastUpdateSeconds,
  visibleVesselsCount: _visibleVesselsCount,
  totalVesselsCount,
  positionedVesselsCount = 0,
  portsCount = 0,
  routesCount = 0,
  zoom,
  cursorCoords,
  onRetryConnection,
  onResetView,
  activeLayerCount: _activeLayerCount = 6,
}: VesselStatusBarProps) {
  // Format cursor coordinates nicely into N/S and E/W
  const formattedCoords = cursorCoords
    ? `${Math.abs(cursorCoords.lat).toFixed(4)}° ${cursorCoords.lat >= 0 ? 'N' : 'S'} / ${Math.abs(
        cursorCoords.lng
      ).toFixed(4)}° ${cursorCoords.lng >= 0 ? 'E' : 'W'}`
    : '00.0000° N / 00.0000° E';

  return (
    <footer className="vmp-status-bar" role="status" aria-label="AIS Telemetry Status Bar">
      {/* LEFT SECTION: REAL MARITIME ENTITY COUNTS */}
      <div className="vmp-status-bar-left">
        {isConnected ? (
          <div className="vmp-ais-connected-pill">
            <span className="vmp-live-pulse-dot"></span>
            <span className="vmp-live-label">LIVE AIS FEED</span>
            <span className="vmp-live-divider">&middot;</span>
            <span className="vmp-live-status">CONNECTED</span>
          </div>
        ) : (
          <div className="vmp-ais-offline-pill">
            <AlertTriangle size={12} className="vmp-warn-icon" />
            <span className="vmp-live-label">AIS FEED OFFLINE</span>
            {onRetryConnection && (
              <button
                className="vmp-status-retry-btn"
                onClick={onRetryConnection}
                title="Attempt to reconnect to AIS API"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* PORTS COUNT */}
        <div className="vmp-status-metric-pill">
          <span className="vmp-status-dim">PORTS</span>
          <strong className="vmp-status-bright">{portsCount.toLocaleString()}</strong>
        </div>

        {/* VESSELS COUNT */}
        <div className="vmp-status-metric-pill">
          <span className="vmp-status-dim">VESSELS</span>
          <strong className="vmp-status-bright">
            {totalVesselsCount.toLocaleString()}
            {positionedVesselsCount > 0 ? ` (${positionedVesselsCount} pos)` : ''}
          </strong>
        </div>

        {/* ROUTES COUNT */}
        <div className="vmp-status-metric-pill">
          <span className="vmp-status-dim">ROUTES</span>
          <strong className="vmp-status-bright">{routesCount.toLocaleString()}</strong>
        </div>

        {isConnected && (
          <div className="vmp-status-update-timer">
            Updated: <strong>{lastUpdateSeconds}s ago</strong>
          </div>
        )}
      </div>

      {/* RIGHT SECTION: GEO TELEMETRY & VIEWPORT */}
      <div className="vmp-status-bar-right">
        <div className="vmp-status-metric">
          <span className="vmp-status-dim">Zoom:</span>
          <span className="vmp-status-bright">{zoom.toFixed(1)}</span>
        </div>

        <div className="vmp-status-metric vmp-geo-track">
          <span className="vmp-status-dim">Coordinates:</span>
          <span className="vmp-status-bright">{formattedCoords}</span>
        </div>

        {onResetView && (
          <button
            className="vmp-status-reset-link"
            onClick={onResetView}
            title="Reset to global maritime overview"
          >
            <RotateCcw size={11} />
            <span>Reset View</span>
          </button>
        )}
      </div>
    </footer>
  );
}
