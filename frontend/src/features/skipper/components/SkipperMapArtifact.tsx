import React from 'react';
import { Compass, Navigation, Clock, Anchor, MapPin } from 'lucide-react';
import type { SkipperMapPayload } from '../../../types/skipper';

interface SkipperMapArtifactProps {
  payload: SkipperMapPayload;
}

export const SkipperMapArtifact: React.FC<SkipperMapArtifactProps> = ({ payload }) => {
  return (
    <div className="bg-[#061321] border border-[rgba(100,190,240,0.16)] rounded-xl overflow-hidden my-3 shadow-md">
      {/* Map Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#040E19] border-b border-[rgba(100,190,240,0.12)]">
        <div className="flex items-center gap-2">
          <Navigation size={14} className="text-cyan-400" />
          <span className="text-xs font-semibold text-[#F5F8FC]">{payload.title}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold">
          {payload.status}
        </span>
      </div>

      {/* Nautical Map Visual Canvas */}
      <div className="relative h-44 bg-slate-900/90 overflow-hidden flex items-center justify-center p-4">
        {/* Stylized background nautical grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Bathymetric depth circles */}
        <div className="absolute w-72 h-72 rounded-full border border-cyan-500/10" />
        <div className="absolute w-44 h-44 rounded-full border border-cyan-500/20" />

        {/* Voyage Route dashed line */}
        <div className="absolute w-4/5 h-0.5 border-b-2 border-dashed border-cyan-500/40 transform -rotate-12" />

        {/* Origin Port Pin */}
        <div className="absolute left-8 bottom-8 flex flex-col items-center">
          <div className="p-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shadow">
            <Anchor size={12} />
          </div>
          <span className="text-[10px] font-semibold text-slate-300 mt-1 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
            {payload.originPort}
          </span>
        </div>

        {/* Live Vessel Position Pin with Radar Pulse */}
        <div className="absolute z-10 flex flex-col items-center">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 animate-ping absolute inset-0" />
            <div
              className="w-8 h-8 rounded-full bg-cyan-500/30 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-lg"
              style={{ transform: `rotate(${payload.heading}deg)` }}
            >
              <Navigation size={14} className="fill-current" />
            </div>
          </div>
          <span className="text-[11px] font-bold text-white mt-1 bg-slate-950/90 px-2 py-0.5 rounded border border-cyan-500/40 shadow">
            {payload.vesselName} ({payload.speedKnots} kts)
          </span>
        </div>

        {/* Destination Port Pin */}
        <div className="absolute right-8 top-6 flex flex-col items-center">
          <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow">
            <MapPin size={12} />
          </div>
          <span className="text-[10px] font-semibold text-emerald-300 mt-1 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
            {payload.destinationPort}
          </span>
        </div>

        {/* Coordinate HUD */}
        <div className="absolute bottom-2 right-2 bg-slate-950/90 px-2 py-1 rounded text-[10px] font-mono text-cyan-400 border border-slate-800">
          {payload.coordinates.lat.toFixed(2)}°N, {payload.coordinates.lng.toFixed(2)}°E
        </div>
      </div>

      {/* Telemetry Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-[#040E19] border-t border-slate-800 text-[11px]">
        <div>
          <span className="text-[#7189A3] block text-[10px]">Vessel IMO</span>
          <span className="font-semibold text-white">{payload.imo}</span>
        </div>
        <div>
          <span className="text-[#7189A3] block text-[10px]">Heading & Speed</span>
          <span className="font-semibold text-white flex items-center gap-1">
            <Compass size={11} className="text-cyan-400" />
            {payload.heading}° • {payload.speedKnots} kts
          </span>
        </div>
        <div>
          <span className="text-[#7189A3] block text-[10px]">Destination</span>
          <span className="font-semibold text-emerald-300 truncate block">{payload.destinationPort}</span>
        </div>
        <div>
          <span className="text-[#7189A3] block text-[10px]">Estimated Arrival</span>
          <span className="font-semibold text-white flex items-center gap-1">
            <Clock size={11} className="text-cyan-400" />
            {payload.eta}
          </span>
        </div>
      </div>
    </div>
  );
};
