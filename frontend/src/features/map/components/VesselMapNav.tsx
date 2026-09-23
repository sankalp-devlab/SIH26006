import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Ship,
  Search,
  Bell,
  User,
  Anchor,
  Navigation,
  Compass,
  X,
} from 'lucide-react';
import type { VesselPosition, MaritimeWaypoint } from '../../../types/map';
import type { Port } from '../../../types/port';

interface VesselMapNavProps {
  vessels: VesselPosition[];
  ports: Port[];
  waypoints: MaritimeWaypoint[];
  onSelectVessel: (id: number) => void;
  onSelectPort?: (port: Port) => void;
  onSelectWaypoint?: (wp: MaritimeWaypoint) => void;
}

export function VesselMapNav({
  vessels,
  ports,
  waypoints,
  onSelectVessel,
  onSelectPort,
  onSelectWaypoint,
}: VesselMapNavProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { vessels: [], ports: [], waypoints: [] };

    const matchedVessels = (vessels as any[]).filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        (v.imo_number && String(v.imo_number).toLowerCase().includes(q)) ||
        (v.vessel_type && v.vessel_type.toLowerCase().includes(q)) ||
        (v.destination_port && String(v.destination_port).toLowerCase().includes(q))
    ).slice(0, 5);

    const matchedPorts = ports.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.unlocode && p.unlocode.toLowerCase().includes(q)) ||
        (p.country && p.country.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedWaypoints = waypoints.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q)
    ).slice(0, 3);

    return {
      vessels: matchedVessels,
      ports: matchedPorts,
      waypoints: matchedWaypoints,
    };
  }, [searchQuery, vessels, ports, waypoints]);

  const totalResults =
    searchResults.vessels.length +
    searchResults.ports.length +
    searchResults.waypoints.length;

  const handleSelectVesselResult = (vesselId: number) => {
    onSelectVessel(vesselId);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleSelectPortResult = (port: Port) => {
    if (onSelectPort) onSelectPort(port);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleSelectWaypointResult = (wp: MaritimeWaypoint) => {
    if (onSelectWaypoint) onSelectWaypoint(wp);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <header className="vmp-top-nav" role="banner">
      {/* LEFT: BRAND & OPERATIONS BADGE */}
      <div className="vmp-nav-left">
        <Link to="/dashboard" className="vmp-nav-brand" title="OceanLens Fleet Operations">
          <div className="vmp-brand-logo-hex">
            <Ship size={18} className="vmp-brand-icon" />
          </div>
          <div className="vmp-brand-text">
            <span className="vmp-brand-title">OceanLens</span>
            <span className="vmp-brand-tag">MARITIME INTEL</span>
          </div>
        </Link>
      </div>

      {/* CENTER: CORE PLATFORM NAVIGATION (Requirement 6) */}
      <nav className="vmp-nav-links" aria-label="Main Navigation">
        <NavLink
          to="/map"
          className={({ isActive }) =>
            `vmp-nav-link ${isActive ? 'is-active' : ''}`
          }
        >
          <Compass size={14} />
          <span>Live Map</span>
          <span className="vmp-nav-active-glow"></span>
        </NavLink>

        <NavLink
          to="/market-prices"
          className={({ isActive }) =>
            `vmp-nav-link ${isActive ? 'is-active' : ''}`
          }
        >
          <span>Market Data</span>
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `vmp-nav-link ${isActive ? 'is-active' : ''}`
          }
        >
          <span>Analytics</span>
        </NavLink>

        <NavLink
          to="/freight"
          className={({ isActive }) =>
            `vmp-nav-link ${isActive ? 'is-active' : ''}`
          }
        >
          <span>Freight</span>
        </NavLink>

        <NavLink
          to="/flows"
          className={({ isActive }) =>
            `vmp-nav-link ${isActive ? 'is-active' : ''}`
          }
        >
          <span>Trade Flows</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `vmp-nav-link ${isActive ? 'is-active' : ''}`
          }
        >
          <span>Reports</span>
        </NavLink>
      </nav>

      {/* RIGHT: GLOBAL SEARCH & USER PROFILE (Requirement 6 & 7) */}
      <div className="vmp-nav-right">
        {/* GLOBAL SEARCH INPUT */}
        <div className="vmp-global-search-container" ref={searchContainerRef}>
          <div className="vmp-search-bar">
            <Search size={14} className="vmp-search-bar-icon" />
            <input
              type="text"
              className="vmp-search-bar-input"
              placeholder="Search vessel, IMO, port, route..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
            {searchQuery && (
              <button
                className="vmp-search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* AUTOCOMPLETE RESULTS POPUP */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="vmp-search-dropdown-menu">
              {totalResults === 0 ? (
                <div className="vmp-search-empty">
                  No matching maritime entities found for "{searchQuery}"
                </div>
              ) : (
                <>
                  {/* Vessels Section */}
                  {searchResults.vessels.length > 0 && (
                    <div className="vmp-search-result-group">
                      <div className="vmp-search-group-header">
                        <Ship size={12} />
                        <span>VESSELS ({searchResults.vessels.length})</span>
                      </div>
                      {searchResults.vessels.map((v) => (
                        <button
                          key={v.id}
                          className="vmp-search-result-item"
                          onClick={() => handleSelectVesselResult(v.id)}
                        >
                          <div className="vmp-res-item-left">
                            <span className="vmp-res-name">
                              {v.name.replace(/^REFERENCE-/, '')}
                            </span>
                            <span className="vmp-res-sub">
                              {v.vessel_type} &middot; {v.imo_number ? `IMO ${v.imo_number}` : 'Reference'}
                            </span>
                          </div>
                          <div className="vmp-res-item-right">
                            <span className="vmp-res-tag highlight">
                              {typeof v.speed_knots === 'number'
                                ? `${v.speed_knots.toFixed(1)} kn`
                                : v.speed_laden_knots
                                ? `${v.speed_laden_knots} kn`
                                : 'Specs'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Ports Section */}
                  {searchResults.ports.length > 0 && (
                    <div className="vmp-search-result-group">
                      <div className="vmp-search-group-header">
                        <Anchor size={12} />
                        <span>PORTS ({searchResults.ports.length})</span>
                      </div>
                      {searchResults.ports.map((p) => (
                        <button
                          key={p.id}
                          className="vmp-search-result-item"
                          onClick={() => handleSelectPortResult(p)}
                        >
                          <div className="vmp-res-item-left">
                            <span className="vmp-res-name">⚓ {p.name}</span>
                            <span className="vmp-res-sub">
                              {p.country || 'International'} &middot; {p.unlocode || 'N/A'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Waypoints / Choke Points */}
                  {searchResults.waypoints.length > 0 && (
                    <div className="vmp-search-result-group">
                      <div className="vmp-search-group-header">
                        <Navigation size={12} />
                        <span>CORRIDORS &amp; CHOKEPOINTS ({searchResults.waypoints.length})</span>
                      </div>
                      {searchResults.waypoints.map((w) => (
                        <button
                          key={w.id}
                          className="vmp-search-result-item"
                          onClick={() => handleSelectWaypointResult(w)}
                        >
                          <div className="vmp-res-item-left">
                            <span className="vmp-res-name">{w.name}</span>
                            <span className="vmp-res-sub">{w.category}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* NOTIFICATIONS */}
        <Link
          to="/notifications"
          className="vmp-nav-icon-btn"
          title="Maritime Alerts & Operational Notifications"
        >
          <Bell size={16} />
          <span className="vmp-nav-badge-dot"></span>
        </Link>

        {/* USER PROFILE */}
        <div className="vmp-user-profile-btn" title="Operations Watch Officer">
          <div className="vmp-avatar-circle">
            <User size={15} />
          </div>
          <span className="vmp-officer-title">OPS-1</span>
        </div>
      </div>
    </header>
  );
}
