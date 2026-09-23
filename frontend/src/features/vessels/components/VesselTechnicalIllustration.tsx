import type { Vessel } from '../../../types/vessel';

interface VesselTechnicalIllustrationProps {
  vessel: Vessel;
  loa?: number | null;
  beam?: number | null;
  draft?: number | null;
}

export function VesselTechnicalIllustration({
  vessel,
  loa,
  beam,
  draft,
}: VesselTechnicalIllustrationProps) {
  const norm = (vessel.vessel_type || '').toLowerCase();
  const displayName = vessel.name.replace(/^REFERENCE-/, '');

  const lengthDisplay = loa ?? vessel.length_m ?? (norm.includes('cape') ? 292 : norm.includes('panamax') ? 229 : 190);
  const beamDisplay = beam ?? vessel.width_m ?? (norm.includes('cape') ? 45 : norm.includes('panamax') ? 32.25 : 32.2);
  const draftDisplay = draft ?? vessel.draft_m ?? (norm.includes('cape') ? 18.2 : norm.includes('panamax') ? 14.4 : 12.8);

  const isContainer = norm.includes('container');
  const isTanker = norm.includes('tanker') || norm.includes('crude') || norm.includes('vlcc');
  const isLng = norm.includes('lng') || norm.includes('lpg') || norm.includes('gas');

  return (
    <div className="vtech-stage" aria-label={`Technical blueprint silhouette of ${displayName}`}>
      {/* Blueprint Grid Background */}
      <div className="vtech-grid-overlay" aria-hidden="true" />

      {/* Technical Linework Blueprint SVG */}
      <svg
        viewBox="0 0 820 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="vtech-svg"
      >
        <defs>
          <linearGradient id="vtechHullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#00d8ff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#082f49" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="vtechWaterline" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0" />
            <stop offset="25%" stopColor="#00d8ff" stopOpacity="0.7" />
            <stop offset="75%" stopColor="#00d8ff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </linearGradient>

          <filter id="vtechGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2.5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Technical Coordinate Scale Lines */}
        <g stroke="rgba(0, 216, 255, 0.12)" strokeWidth="1" strokeDasharray="3 3">
          <line x1="50" y1="20" x2="770" y2="20" />
          <line x1="50" y1="80" x2="770" y2="80" />
          <line x1="50" y1="145" x2="770" y2="145" />
          <line x1="120" y1="10" x2="120" y2="175" />
          <line x1="300" y1="10" x2="300" y2="175" />
          <line x1="500" y1="10" x2="500" y2="175" />
          <line x1="680" y1="10" x2="680" y2="175" />
        </g>

        {/* Datum Centerline & Waterline */}
        <line
          x1="40"
          y1="145"
          x2="780"
          y2="145"
          stroke="url(#vtechWaterline)"
          strokeWidth="2"
          filter="url(#vtechGlow)"
        />
        <text x="50" y="141" fill="#00d8ff" fontSize="9" fontFamily="monospace" opacity="0.8">
          DWL · DESIGN WATERLINE [{draftDisplay}m DRAFT]
        </text>

        {/* Dimension Line (LOA) */}
        <g stroke="#00d8ff" strokeWidth="1" opacity="0.6">
          <line x1="75" y1="178" x2="745" y2="178" />
          <line x1="75" y1="172" x2="75" y2="184" />
          <line x1="745" y1="172" x2="745" y2="184" />
          <text x="410" y="174" fill="#00d8ff" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            LOA {lengthDisplay}m  &middot;  BEAM {beamDisplay}m  &middot;  DESIGN DRAFT {draftDisplay}m
          </text>
        </g>

        {/* HULL SILHOUETTES BY MARITIME CATEGORY */}
        {isContainer ? (
          /* Container Ship Blueprint */
          <g id="container-vessel">
            {/* Main Hull */}
            <path
              d="M 75 145 L 125 90 L 650 90 L 735 145 L 745 145 L 720 152 L 120 152 Z"
              fill="url(#vtechHullGrad)"
              stroke="#00d8ff"
              strokeWidth="1.8"
            />
            {/* Bulbous Bow */}
            <path d="M 75 145 C 65 148 60 152 75 155 L 120 155" stroke="#00d8ff" strokeWidth="1.5" fill="none" />

            {/* Container Bays Stacks */}
            <rect x="145" y="45" width="70" height="45" fill="rgba(14, 116, 144, 0.4)" stroke="#38bdf8" strokeWidth="1" />
            <rect x="225" y="40" width="75" height="50" fill="rgba(14, 116, 144, 0.5)" stroke="#38bdf8" strokeWidth="1" />
            <rect x="310" y="38" width="75" height="52" fill="rgba(14, 116, 144, 0.55)" stroke="#38bdf8" strokeWidth="1" />
            <rect x="395" y="40" width="75" height="50" fill="rgba(14, 116, 144, 0.5)" stroke="#38bdf8" strokeWidth="1" />
            <rect x="480" y="45" width="75" height="45" fill="rgba(14, 116, 144, 0.45)" stroke="#38bdf8" strokeWidth="1" />
            <rect x="565" y="52" width="55" height="38" fill="rgba(14, 116, 144, 0.4)" stroke="#38bdf8" strokeWidth="1" />

            {/* Container stack vertical bay guides */}
            <line x1="180" y1="45" x2="180" y2="90" stroke="rgba(0, 216, 255, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="262" y1="40" x2="262" y2="90" stroke="rgba(0, 216, 255, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="347" y1="38" x2="347" y2="90" stroke="rgba(0, 216, 255, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="432" y1="40" x2="432" y2="90" stroke="rgba(0, 216, 255, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="517" y1="45" x2="517" y2="90" stroke="rgba(0, 216, 255, 0.4)" strokeWidth="1" strokeDasharray="2 2" />

            {/* Aft Superstructure / Bridge */}
            <path
              d="M 630 90 L 630 42 L 678 42 L 678 90 Z"
              fill="#082f49"
              stroke="#00d8ff"
              strokeWidth="1.8"
            />
            {/* Bridge Wings & Radar Mast */}
            <line x1="620" y1="52" x2="688" y2="52" stroke="#00d8ff" strokeWidth="1.5" />
            <line x1="665" y1="42" x2="665" y2="24" stroke="#00d8ff" strokeWidth="1.8" />
            <line x1="655" y1="28" x2="675" y2="28" stroke="#00d8ff" strokeWidth="1.5" />
            {/* Exhaust Funnel */}
            <rect x="670" y="48" width="14" height="28" fill="#0f172a" stroke="#00d8ff" strokeWidth="1.2" />
          </g>
        ) : isTanker ? (
          /* Crude / Product Tanker Blueprint */
          <g id="tanker-vessel">
            {/* Hull */}
            <path
              d="M 75 145 L 120 98 L 655 98 L 730 145 L 740 145 L 715 152 L 120 152 Z"
              fill="url(#vtechHullGrad)"
              stroke="#00d8ff"
              strokeWidth="1.8"
            />
            {/* Manifold deck piping */}
            <line x1="140" y1="92" x2="630" y2="92" stroke="#00d8ff" strokeWidth="2" />
            <circle cx="230" cy="92" r="4" fill="#0284c7" stroke="#00d8ff" strokeWidth="1.5" />
            <circle cx="340" cy="92" r="5" fill="#00d8ff" />
            <circle cx="450" cy="92" r="4" fill="#0284c7" stroke="#00d8ff" strokeWidth="1.5" />
            <circle cx="560" cy="92" r="4" fill="#0284c7" stroke="#00d8ff" strokeWidth="1.5" />

            {/* Hose handling cranes */}
            <line x1="385" y1="98" x2="385" y2="65" stroke="#00d8ff" strokeWidth="2" />
            <line x1="385" y1="65" x2="420" y2="78" stroke="#00d8ff" strokeWidth="1.8" />
            <line x1="390" y1="72" x2="415" y2="72" stroke="#38bdf8" strokeWidth="1" />

            {/* Accommodations Block */}
            <path
              d="M 632 98 L 632 45 L 682 45 L 682 98 Z"
              fill="#082f49"
              stroke="#00d8ff"
              strokeWidth="1.8"
            />
            <line x1="622" y1="56" x2="692" y2="56" stroke="#00d8ff" strokeWidth="1.5" />
            <line x1="662" y1="45" x2="662" y2="22" stroke="#00d8ff" strokeWidth="1.8" />
            <line x1="652" y1="28" x2="672" y2="28" stroke="#00d8ff" strokeWidth="1.5" />
          </g>
        ) : isLng ? (
          /* LNG Carrier with Membrane / Spherical Domes */
          <g id="lng-vessel">
            <path
              d="M 75 145 L 120 95 L 650 95 L 730 145 L 740 145 L 715 152 L 120 152 Z"
              fill="url(#vtechHullGrad)"
              stroke="#00d8ff"
              strokeWidth="1.8"
            />
            {/* LNG Spherical / Prismatic Tanks */}
            <path d="M 160 95 C 160 62 230 62 230 95 Z" fill="rgba(2, 132, 199, 0.4)" stroke="#00d8ff" strokeWidth="1.5" />
            <path d="M 255 95 C 255 60 335 60 335 95 Z" fill="rgba(2, 132, 199, 0.45)" stroke="#00d8ff" strokeWidth="1.5" />
            <path d="M 360 95 C 360 60 440 60 440 95 Z" fill="rgba(2, 132, 199, 0.45)" stroke="#00d8ff" strokeWidth="1.5" />
            <path d="M 465 95 C 465 60 545 60 545 95 Z" fill="rgba(2, 132, 199, 0.45)" stroke="#00d8ff" strokeWidth="1.5" />
            <path d="M 570 95 C 570 65 630 65 630 95 Z" fill="rgba(2, 132, 199, 0.4)" stroke="#00d8ff" strokeWidth="1.5" />

            {/* Aft Bridge */}
            <path d="M 640 95 L 640 45 L 685 45 L 685 95 Z" fill="#082f49" stroke="#00d8ff" strokeWidth="1.8" />
            <line x1="665" y1="45" x2="665" y2="24" stroke="#00d8ff" strokeWidth="1.8" />
          </g>
        ) : (
          /* Bulk Carrier / Capesize / Panamax / Supramax / Handysize */
          <g id="bulk-vessel">
            {/* Hull */}
            <path
              d="M 75 145 L 125 96 L 645 96 L 730 145 L 740 145 L 715 152 L 120 152 Z"
              fill="url(#vtechHullGrad)"
              stroke="#00d8ff"
              strokeWidth="1.8"
            />
            {/* Cargo Hatches (Holds 1 to 5 or 7) */}
            <rect x="150" y="85" width="60" height="11" fill="#0e7490" stroke="#00d8ff" strokeWidth="1.2" rx="1" />
            <rect x="235" y="85" width="65" height="11" fill="#0e7490" stroke="#00d8ff" strokeWidth="1.2" rx="1" />
            <rect x="325" y="85" width="65" height="11" fill="#0e7490" stroke="#00d8ff" strokeWidth="1.2" rx="1" />
            <rect x="415" y="85" width="65" height="11" fill="#0e7490" stroke="#00d8ff" strokeWidth="1.2" rx="1" />
            <rect x="505" y="85" width="65" height="11" fill="#0e7490" stroke="#00d8ff" strokeWidth="1.2" rx="1" />

            {/* Deck Cargo Cranes (Supramax/Handysize style gear) */}
            {norm.includes('supra') || norm.includes('handy') ? (
              <>
                <line x1="220" y1="96" x2="220" y2="68" stroke="#00d8ff" strokeWidth="2" />
                <line x1="220" y1="68" x2="255" y2="78" stroke="#00d8ff" strokeWidth="1.8" />
                <line x1="310" y1="96" x2="310" y2="68" stroke="#00d8ff" strokeWidth="2" />
                <line x1="310" y1="68" x2="345" y2="78" stroke="#00d8ff" strokeWidth="1.8" />
                <line x1="400" y1="96" x2="400" y2="68" stroke="#00d8ff" strokeWidth="2" />
                <line x1="400" y1="68" x2="435" y2="78" stroke="#00d8ff" strokeWidth="1.8" />
                <line x1="490" y1="96" x2="490" y2="68" stroke="#00d8ff" strokeWidth="2" />
                <line x1="490" y1="68" x2="525" y2="78" stroke="#00d8ff" strokeWidth="1.8" />
              </>
            ) : (
              /* Capesize / Panamax gearless holds division line */
              <>
                <line x1="140" y1="96" x2="140" y2="135" stroke="rgba(0, 216, 255, 0.3)" strokeDasharray="3 3" />
                <line x1="225" y1="96" x2="225" y2="135" stroke="rgba(0, 216, 255, 0.3)" strokeDasharray="3 3" />
                <line x1="315" y1="96" x2="315" y2="135" stroke="rgba(0, 216, 255, 0.3)" strokeDasharray="3 3" />
                <line x1="405" y1="96" x2="405" y2="135" stroke="rgba(0, 216, 255, 0.3)" strokeDasharray="3 3" />
                <line x1="495" y1="96" x2="495" y2="135" stroke="rgba(0, 216, 255, 0.3)" strokeDasharray="3 3" />
                <line x1="585" y1="96" x2="585" y2="135" stroke="rgba(0, 216, 255, 0.3)" strokeDasharray="3 3" />
              </>
            )}

            {/* Aft Accommodations & Bridge */}
            <path
              d="M 625 96 L 625 46 L 678 46 L 678 96 Z"
              fill="#082f49"
              stroke="#00d8ff"
              strokeWidth="1.8"
            />
            {/* Bridge Wings */}
            <line x1="616" y1="56" x2="686" y2="56" stroke="#00d8ff" strokeWidth="1.5" />
            {/* Mast and Comms */}
            <line x1="658" y1="46" x2="658" y2="24" stroke="#00d8ff" strokeWidth="1.8" />
            <line x1="648" y1="30" x2="668" y2="30" stroke="#00d8ff" strokeWidth="1.5" />
            {/* Funnel */}
            <path d="M 670 60 L 670 48 L 682 48 L 680 60 Z" fill="#0284c7" stroke="#00d8ff" strokeWidth="1" />
          </g>
        )}

        {/* Forward Forecastle & Anchor Pocket */}
        <line x1="120" y1="96" x2="105" y2="88" stroke="#00d8ff" strokeWidth="1.5" />
        <line x1="105" y1="88" x2="88" y2="88" stroke="#00d8ff" strokeWidth="1.5" />
        <circle cx="112" cy="115" r="3" fill="#00d8ff" />
        <text x="118" y="117" fill="rgba(0, 216, 255, 0.7)" fontSize="7" fontFamily="monospace">STBD HAWSE</text>
      </svg>

      {/* Blueprint Footnote Badges */}
      <div className="vtech-footer-meta">
        <div className="vtech-spec-tag">
          <span className="vtech-label">HULL TYPE:</span>
          <span className="vtech-val font-mono">{vessel.vessel_type || 'Bulk Carrier'}</span>
        </div>
        <div className="vtech-spec-tag">
          <span className="vtech-label">DEADWEIGHT:</span>
          <span className="vtech-val font-mono">
            {vessel.capacity_tons ? `${vessel.capacity_tons.toLocaleString()} MT` : 'Unavailable'}
          </span>
        </div>
        <div className="vtech-spec-tag">
          <span className="vtech-label">SERVICE SPEED:</span>
          <span className="vtech-val font-mono">
            {vessel.speed_laden_knots ? `${vessel.speed_laden_knots} kts` : '14.0 kts'}
          </span>
        </div>
        <div className="vtech-spec-tag">
          <span className="vtech-label">STATUS:</span>
          <span className="vtech-val font-mono highlight">{vessel.status ? vessel.status.toUpperCase() : 'ACTIVE'}</span>
        </div>
      </div>
    </div>
  );
}
