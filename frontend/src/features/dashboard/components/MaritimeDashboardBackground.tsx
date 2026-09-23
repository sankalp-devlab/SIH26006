import { memo } from 'react';
import maritimeBg from '../../../assets/maritime-dashboard-bg.webp';
import '../maritime-background.css';

interface MaritimeDashboardBackgroundProps {
  className?: string;
}

/**
 * MaritimeDashboardBackground
 * 
 * High-realism commercial container vessel background layer for the OceanLens Command Center.
 * Features:
 * - Photorealistic 16:9 ultra-wide commercial container vessel ("Oceanus Leviathan")
 * - Left-to-right dark readability gradient preserving crisp contrast for header & text
 * - Silky smooth vertical gradient dissolving seamlessly into lower command panels
 * - Subtle vignette and technical telemetry micro-grid
 * - Hardware-accelerated sub-pixel drift for organic maritime atmosphere
 * - 100% non-blocking (pointer-events: none)
 */
export const MaritimeDashboardBackground = memo(function MaritimeDashboardBackground({
  className = '',
}: MaritimeDashboardBackgroundProps) {
  return (
    <div
      className={`maritime-dashboard-bg ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      {/* 1. Ultra-Wide Photorealistic Commercial Vessel Layer */}
      <div
        className="maritime-dashboard-bg__photo"
        style={{
          backgroundImage: `url(${maritimeBg})`,
        }}
      />

      {/* 2. Left-to-Right Readability Gradient (Dark left for text, clear center-right for vessel) */}
      <div className="maritime-dashboard-bg__gradient-h" />

      {/* 3. Top-to-Bottom Smooth Dissolve into Dashboard Panels */}
      <div className="maritime-dashboard-bg__gradient-v" />

      {/* 4. Peripheral Cinematic Vignette */}
      <div className="maritime-dashboard-bg__vignette" />

      {/* 5. Subtle Technical Telemetry Grid Overlay */}
      <div className="maritime-dashboard-bg__grid" />
    </div>
  );
});
