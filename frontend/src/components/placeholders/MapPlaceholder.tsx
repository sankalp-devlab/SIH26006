import { MapPin, Compass } from 'lucide-react';

export interface MapPlaceholderProps {
  height?: string;
  title?: string;
  description?: string;
}

export function MapPlaceholder({
  height = '380px',
  title = 'Interactive Maritime Chart & AIS Route Plotter',
  description = 'Live vessel geolocation, port corridors, and dynamic nautical navigation charts will be enabled in Module 8.',
}: MapPlaceholderProps) {
  return (
    <div
      className="blueprint-placeholder"
      style={{
        height,
        backgroundImage:
          'radial-gradient(circle, rgba(0, 102, 204, 0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="blueprint-badge">MODULE 8 READY</div>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#eff6ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: 'var(--color-brand-accent)',
          border: '1px solid #bfdbfe',
        }}
      >
        <Compass size={28} />
      </div>
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          maxWidth: '480px',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          marginTop: '1.25rem',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <MapPin size={14} color="var(--color-brand-accent)" /> 3,700+ Global Seaports Ready
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Compass size={14} color="var(--color-status-success)" /> Great Circle Corridor Coordinates
        </span>
      </div>
    </div>
  );
}
