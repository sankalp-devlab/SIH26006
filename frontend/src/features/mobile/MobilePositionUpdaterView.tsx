/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 27: Mobile Position & Status Field Updater View
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Save,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Navigation,
  Ship,
  FileText,
  Clock,
  ArrowLeft,
  Crosshair,
} from 'lucide-react';
import { useVessels } from '../../hooks/useVessels';
import { MobilePositionUpdaterService } from '../../services/mobile/mobile-position-updater.service';
import type { MobileVesselPositionUpdate } from '../../types/mobile';

export const MobilePositionUpdaterView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedVesselId = searchParams.get('vesselId');

  const { data: vesselsData, isLoading: loading } = useVessels(100);
  const vessels = useMemo(() => vesselsData?.vessels || [], [vesselsData]);

  const [selectedVesselId, setSelectedVesselId] = useState<number | null>(
    preselectedVesselId ? Number(preselectedVesselId) : null
  );

  // Auto-select first vessel once loaded
  useEffect(() => {
    if (!selectedVesselId && vessels.length > 0) {
      setSelectedVesselId(vessels[0].id);
    }
  }, [selectedVesselId, vessels]);

  // Form fields
  const [status, setStatus] = useState<MobileVesselPositionUpdate['status']>('underway');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [speedKnots, setSpeedKnots] = useState<string>('14.2');
  const [heading, setHeading] = useState<string>('085');
  const [destinationPort, setDestinationPort] = useState<string>('');
  const [eta, setEta] = useState<string>('');
  const [updatedBy, setUpdatedBy] = useState<string>('Duty Marine Officer');
  const [operationalNote, setOperationalNote] = useState<string>('');

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);

  // When selected vessel changes, prefill from existing state or override
  const selectedVessel = useMemo(() => {
    return vessels.find((v) => v.id === selectedVesselId) || null;
  }, [vessels, selectedVesselId]);

  useEffect(() => {
    if (!selectedVessel) return;

    const existingUpdate = MobilePositionUpdaterService.getVesselPositionUpdate(selectedVessel.id);
    if (existingUpdate) {
      setStatus(existingUpdate.status);
      setLatitude(existingUpdate.latitude.toString());
      setLongitude(existingUpdate.longitude.toString());
      setSpeedKnots(existingUpdate.speedKnots.toString());
      setHeading(existingUpdate.heading.toString());
      setDestinationPort(existingUpdate.destinationPort || (selectedVessel.id % 2 === 0 ? 'Rotterdam, NL' : 'Singapore, SG'));
      setEta(existingUpdate.eta || '2026-09-18');
      setUpdatedBy(existingUpdate.updatedBy);
    } else {
      setStatus(
        (selectedVessel.status as MobileVesselPositionUpdate['status']) || 'underway'
      );
      setLatitude('1.2902');
      setLongitude('103.8519');
      setSpeedKnots(selectedVessel.speed_laden_knots ? selectedVessel.speed_laden_knots.toString() : '13.5');
      setHeading('090');
      setDestinationPort(selectedVessel.id % 2 === 0 ? 'Rotterdam, NL' : 'Singapore, SG');
      setEta('2026-09-18');
    }
  }, [selectedVessel]);

  // Coordinate validation
  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);
  const isLatValid = !isNaN(latNum) && latNum >= -90 && latNum <= 90;
  const isLngValid = !isNaN(lngNum) && lngNum >= -180 && lngNum <= 180;
  const isCoordValid = isLatValid && isLngValid;

  // Use Device GPS
  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      setFeedbackMsg({ type: 'error', text: 'Geolocation is not supported by your browser' });
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(4));
        setLongitude(pos.coords.longitude.toFixed(4));
        if (pos.coords.speed !== null && !isNaN(pos.coords.speed)) {
          // m/s to knots
          setSpeedKnots((pos.coords.speed * 1.94384).toFixed(1));
        }
        if (pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
          setHeading(Math.round(pos.coords.heading).toString());
        }
        setGeoLocating(false);
        setFeedbackMsg({ type: 'success', text: 'GPS coordinates captured from device sensors' });
      },
      (err) => {
        setGeoLocating(false);
        setFeedbackMsg({ type: 'error', text: `GPS error: ${err.message}` });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Submit update
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVessel) {
      setFeedbackMsg({ type: 'error', text: 'Please select a vessel' });
      return;
    }
    if (!isCoordValid) {
      setFeedbackMsg({
        type: 'error',
        text: 'Invalid GPS coordinates. Latitude must be -90 to +90, Longitude -180 to +180.',
      });
      return;
    }

    const headNum = parseInt(heading, 10);
    if (isNaN(headNum) || headNum < 0 || headNum > 360) {
      setFeedbackMsg({ type: 'error', text: 'Heading must be between 0° and 360°.' });
      return;
    }

    const spdNum = parseFloat(speedKnots);
    if (isNaN(spdNum) || spdNum < 0) {
      setFeedbackMsg({ type: 'error', text: 'Speed must be a positive number.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const updateData: MobileVesselPositionUpdate = {
        vesselId: selectedVessel.id,
        vesselName: selectedVessel.name,
        status,
        latitude: parseFloat(latNum.toFixed(4)),
        longitude: parseFloat(lngNum.toFixed(4)),
        speedKnots: parseFloat(spdNum.toFixed(1)),
        heading: headNum,
        destinationPort: destinationPort.trim() || undefined,
        eta: eta.trim() || undefined,
        timestamp: new Date().toISOString(),
        updatedBy: updatedBy.trim() || 'Duty Officer',
      };

      MobilePositionUpdaterService.savePositionUpdate(updateData);

      // If operational note was provided, save note as well
      if (operationalNote.trim()) {
        MobilePositionUpdaterService.addNote({
          vesselId: selectedVessel.id,
          vesselName: selectedVessel.name,
          author: updatedBy.trim() || 'Field Officer',
          content: operationalNote.trim(),
          category: 'operational',
        });
        setOperationalNote('');
      }

      setFeedbackMsg({
        type: 'success',
        text: `Position & status verified for ${selectedVessel.name}. Dispatched to fleet telemetry.`,
      });
    } catch (err: unknown) {
      setFeedbackMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save position update',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recent updates history
  const recentUpdates = useMemo(() => {
    const all = MobilePositionUpdaterService.getPositionUpdates();
    return Object.values(all).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [feedbackMsg]);

  if (loading) {
    return (
      <div className="mobile-loading">
        <div className="mobile-spinner" />
        <p>Loading fleet vessels...</p>
      </div>
    );
  }

  return (
    <div className="mobile-page-container">
      {/* Header bar */}
      <div className="mobile-view-header">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mobile-icon-btn p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-white leading-none">Field Position Updater</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Manual AIS/GPS position and status override</p>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2.5 border animate-fadeIn ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vessel Selector Card */}
        <div className="mobile-card">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Target Vessel
          </label>
          <div className="relative">
            <select
              value={selectedVesselId || ''}
              onChange={(e) => setSelectedVesselId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-cyan-500"
            >
              {vessels.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.vessel_type || 'Commercial'} • IMO: {v.imo_number || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          {selectedVessel && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5 text-cyan-400" />
                DWT: {selectedVessel.capacity_tons ? selectedVessel.capacity_tons.toLocaleString() : 'N/A'} MT
              </span>
              <span className="text-slate-500">Flag: {selectedVessel.flag || 'LIB'}</span>
            </div>
          )}
        </div>

        {/* Status Mode */}
        <div className="mobile-card">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navigational Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'underway', label: 'Underway' },
              { id: 'anchored', label: 'At Anchor' },
              { id: 'loading', label: 'Loading' },
              { id: 'discharging', label: 'Discharging' },
              { id: 'in_repair', label: 'In Drydock / Repair' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatus(st.id as MobileVesselPositionUpdate['status'])}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-all ${
                  status === st.id
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* GPS Coordinates Card */}
        <div className="mobile-card">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              GPS Coordinates
            </label>
            <button
              type="button"
              onClick={handleUseDeviceLocation}
              disabled={geoLocating}
              className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/30"
            >
              <Crosshair className={`w-3 h-3 ${geoLocating ? 'animate-spin' : ''}`} />
              {geoLocating ? 'Acquiring...' : 'Device GPS'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[10px] text-slate-500 mb-1">Latitude (-90° to +90°)</span>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 1.2902"
                className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none ${
                  latitude && !isLatValid ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-500'
                }`}
              />
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 mb-1">Longitude (-180° to +180°)</span>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 103.8519"
                className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none ${
                  longitude && !isLngValid ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-500'
                }`}
              />
            </div>
          </div>

          {latitude && longitude && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
              {isCoordValid ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Valid WGS-84 Decimal Coordinates
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Out of GPS Bounds
                </span>
              )}
            </div>
          )}
        </div>

        {/* Speed & Course */}
        <div className="mobile-card">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                Speed (knots)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="40"
                value={speedKnots}
                onChange={(e) => setSpeedKnots(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Heading (0-360°)
              </label>
              <input
                type="number"
                min="0"
                max="360"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Passage Info */}
        <div className="mobile-card">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Next Port
              </label>
              <input
                type="text"
                value={destinationPort}
                onChange={(e) => setDestinationPort(e.target.value)}
                placeholder="e.g. Qingdao, CN"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Estimated ETA
              </label>
              <input
                type="text"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                placeholder="YYYY-MM-DD or 5d 12h"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Reporting Officer
            </label>
            <input
              type="text"
              value={updatedBy}
              onChange={(e) => setUpdatedBy(e.target.value)}
              placeholder="Officer Name / Role"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Operational Note */}
        <div className="mobile-card">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            Append Operational Note (Optional)
          </label>
          <textarea
            value={operationalNote}
            onChange={(e) => setOperationalNote(e.target.value)}
            rows={2}
            placeholder="Field remarks, weather, bunker levels, cargo operations..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isCoordValid}
          className="mobile-btn-primary w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Verifying & Saving...' : 'Save & Publish Telemetry'}
        </button>
      </form>

      {/* Recent Field Updates Section */}
      {recentUpdates.length > 0 && (
        <div className="mt-6 mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Recent Field Overrides ({recentUpdates.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('sih26006_mobile_positions_v1');
                window.location.reload();
              }}
              className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="space-y-2">
            {recentUpdates.slice(0, 4).map((up) => (
              <div
                key={up.vesselId}
                onClick={() => navigate(`/m/vessels/${up.vesselId}`)}
                className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between active:bg-slate-800 transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{up.vesselName}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {up.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    {up.latitude.toFixed(3)}°, {up.longitude.toFixed(3)}° • {up.speedKnots} kts • {up.heading}°
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Updated by {up.updatedBy} • {new Date(up.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="text-right">
                  {up.destinationPort && (
                    <div className="text-xs text-cyan-300 font-medium">{up.destinationPort}</div>
                  )}
                  {up.eta && <div className="text-[10px] text-slate-400">ETA: {up.eta}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
