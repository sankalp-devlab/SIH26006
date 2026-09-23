import { ChevronDown } from 'lucide-react';

export function HeroBottomBar() {
  const handleScrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="hero-bottom-bar">
      {/* Left: Progress pagination indicators (01 active bar, 02, 03) */}
      <div
        className="hero-pagination-capsules"
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--ol-cyan-accent)', fontWeight: 700 }}>
          <span>01</span>
          <span className="pagination-capsule active" style={{ width: '38px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
          <span>02</span>
          <span className="pagination-capsule" style={{ width: '20px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
          <span>03</span>
          <span className="pagination-capsule" style={{ width: '20px' }} />
        </div>
      </div>

      {/* Center: "SCROLL TO EXPLORE" with gentle bouncing downward chevron */}
      <button
        type="button"
        className="hero-scroll-hint"
        onClick={handleScrollToFeatures}
        aria-label="Scroll to explore features"
      >
        <span>SCROLL TO EXPLORE</span>
        <ChevronDown size={14} className="hero-scroll-chevron" />
      </button>

      {/* Right: Minimal brand statement: "INSIGHTS TODAY. A STRONGER TOMORROW." */}
      <div className="hero-bottom-statement">
        INSIGHTS TODAY. A STRONGER TOMORROW.
      </div>
    </div>
  );
}
