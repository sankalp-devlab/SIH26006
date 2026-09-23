import React from 'react';

interface VesselTrackingIndicatorProps {
  style?: React.CSSProperties;
  className?: string;
}

export function VesselTrackingIndicator({ style, className = '' }: VesselTrackingIndicatorProps) {
  return (
    <div className={`vessel-tracking-indicator ${className}`} style={style}>
      {/* Animated Glowing Radar Target Node */}
      <div className="radar-target-node" title="Target: Superstructure Live AIS Telemetry">
        <div className="radar-ring" />
        <div className="radar-ring ring-delay" />
        <div className="radar-center-dot" />
      </div>

      {/* Connecting HUD Line with animated traveling signal packet */}
      <div className="radar-connecting-line">
        <div className="radar-signal-packet" />
      </div>

      {/* Restrained Enterprise HUD Label */}
      <div className="radar-hud-label">
        <div className="radar-hud-status">
          <span className="live-dot-pulse">●</span>
          <span>LIVE AIS FEED</span>
        </div>
        <div className="radar-hud-title">
          Real-time<br />Vessel Tracking
        </div>
        <div className="radar-hud-sub">
          98.4% Telemetry Confidence
        </div>
      </div>
    </div>
  );
}
