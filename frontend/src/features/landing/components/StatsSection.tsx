export function StatsSection() {
  const stats = [
    {
      number: '54,298',
      label: 'Active Vessels Tracked',
      sub: 'Class-A satellite & coastal terrestrial AIS feeds',
      metric: '99.8% Global Coverage',
    },
    {
      number: '200+',
      label: 'Coastal Nations & EEZs',
      sub: 'Monitored territorial waters & economic zones',
      metric: '3,000+ Verified Seaports',
    },
    {
      number: '<800ms',
      label: 'Telemetry Pipeline Latency',
      sub: 'Sub-second event stream from ship antenna to console',
      metric: 'Real-time WebSocket Push',
    },
    {
      number: '$2.4T',
      label: 'Tracked Maritime Trade Flow',
      sub: 'Crude, petroleum products, LNG, and bulk dry bulk',
      metric: 'Audited Trade Intelligence',
    },
  ];

  return (
    <section className="oceanlens-stats-section" aria-label="Platform Scale and Telemetry Metrics">
      <div className="section-container">
        <div className="stats-grid-container">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-item-block">
              <div className="stat-number-text font-mono">
                {stat.number}
              </div>
              <div className="stat-label-text">{stat.label}</div>
              <div className="stat-sub-text">{stat.sub}</div>
              <div className="stat-metric-pill">
                <span className="pill-indicator" aria-hidden="true" />
                <span>{stat.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
