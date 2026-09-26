import { memo } from 'react';
import vesselImg from '../../assets/maritime-dashboard-bg.webp';
import portImg from '../../assets/maritime-port-bg.jpg';
import voyageImg from '../../assets/maritime-voyage-bg.jpg';
import cargoImg from '../../assets/maritime-cargo-bg.jpg';
import operationsImg from '../../assets/maritime-operations-bg.jpg';
import tradeImg from '../../assets/maritime-trade-bg.jpg';
import '../../styles/maritime-page-background.css';

export type MaritimeBgVariant =
  | 'vessel'
  | 'port'
  | 'voyage'
  | 'cargo'
  | 'operations'
  | 'alert'
  | 'market'
  | 'commercial';

export interface MaritimePageBackgroundProps {
  /** Visual context variant for the specific operational page */
  variant?: MaritimeBgVariant;
  /** Optional custom image override URL or import */
  customImage?: string;
  /** Subtle background prominence (default: 0.15 = 15%) */
  opacity?: number;
  /** Optional custom background positioning */
  position?: string;
  /** Additional custom class names */
  className?: string;
  /**
   * Explicit dashboard exclusion guard:
   * When true or when showMaritimeBackground is false, renders nothing.
   */
  disabled?: boolean;
}

const VARIANT_IMAGE_MAP: Record<MaritimeBgVariant, string> = {
  vessel: vesselImg,
  port: portImg,
  voyage: voyageImg,
  cargo: cargoImg,
  operations: operationsImg,
  alert: operationsImg,
  market: tradeImg,
  commercial: tradeImg,
};

/**
 * MaritimePageBackground
 * 
 * Reusable contextual maritime environmental background component for OceanLens
 * operational and intelligence pages.
 * 
 * Features:
 * - Contextual photography (vessel, port, voyage, cargo, operations, market)
 * - Multi-layer dark navy readability overlays and peripheral vignettes
 * - 10-20% subtle visual prominence that preserves 100% text/table readability
 * - Non-blocking pointer events (never interferes with buttons, inputs, maps)
 * - Explicitly excluded from Dashboard / Global Control Center
 */
export const MaritimePageBackground = memo(function MaritimePageBackground({
  variant = 'vessel',
  customImage,
  opacity,
  position,
  className = '',
  disabled = false,
}: MaritimePageBackgroundProps) {
  if (disabled) {
    return null;
  }

  const bgImage = customImage || VARIANT_IMAGE_MAP[variant] || vesselImg;

  const styleOverrides: React.CSSProperties = {
    ...(opacity !== undefined ? { ['--maritime-bg-opacity' as any]: opacity } : {}),
    ...(position ? { ['--maritime-bg-position' as any]: position } : {}),
  };

  return (
    <div
      className={`maritime-page-bg maritime-page-bg--${variant} ${className}`}
      style={styleOverrides}
      aria-hidden="true"
      role="presentation"
    >
      {/* 1. Contextual Desaturated Maritime Image Layer */}
      <div
        className="maritime-page-bg__photo"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      />

      {/* 2. Deep Navy Readability Overlay */}
      <div className="maritime-page-bg__overlay" />

      {/* 3. Horizontal Margin Contrast Gradient */}
      <div className="maritime-page-bg__gradient-h" />

      {/* 4. Peripheral Cinematic Vignette */}
      <div className="maritime-page-bg__vignette" />

      {/* 5. Micro Telemetry Mesh Overlay */}
      <div className="maritime-page-bg__grid" />
    </div>
  );
});
