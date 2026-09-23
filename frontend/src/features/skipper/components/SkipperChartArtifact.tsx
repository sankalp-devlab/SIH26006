import React, { useState } from 'react';
import { LineChart, BarChart2 } from 'lucide-react';
import type { SkipperChartPayload } from '../../../types/skipper';

interface SkipperChartArtifactProps {
  payload: SkipperChartPayload;
}

export const SkipperChartArtifact: React.FC<SkipperChartArtifactProps> = ({ payload }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 640;
  const height = 200;
  const pad = { top: 25, right: 25, bottom: 35, left: 55 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const values = payload.dataPoints.map((d) => d.value);
  const minVal = values.length ? Math.min(...values) * 0.85 : 0;
  const maxVal = values.length ? Math.max(...values) * 1.15 : 100;
  const valRange = maxVal - minVal || 1;

  const isBar = payload.type === 'bar-comparison';

  // Coordinate mappers
  const getX = (idx: number) =>
    pad.left + (idx / Math.max(payload.dataPoints.length - 1, 1)) * plotW;
  const getY = (val: number) =>
    pad.top + plotH - ((val - minVal) / valRange) * plotH;

  // Path for curve/time-series
  const pointsCoords = payload.dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.value), d }));
  const linePathD = pointsCoords.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaPathD = pointsCoords.length
    ? `${linePathD} L ${pointsCoords[pointsCoords.length - 1].x} ${pad.top + plotH} L ${pointsCoords[0].x} ${pad.top + plotH} Z`
    : '';

  // Baseline line
  const baselineY = payload.baseline !== undefined ? getY(payload.baseline) : null;

  return (
    <div className="bg-[#061321] border border-[rgba(100,190,240,0.16)] rounded-xl p-3.5 my-3 shadow-md relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isBar ? (
            <BarChart2 size={15} className="text-emerald-400" />
          ) : (
            <LineChart size={15} className="text-cyan-400" />
          )}
          <span className="text-xs font-semibold text-[#F5F8FC]">{payload.title}</span>
        </div>
        <span className="text-[10px] text-[#7189A3] font-mono">
          Unit: {payload.unit}
        </span>
      </div>

      <div className="w-full overflow-x-auto scrollbar-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 select-none" style={{ minWidth: '460px' }}>
          <defs>
            <linearGradient id="skipperAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((r, i) => {
            const y = pad.top + plotH - r * plotH;
            const val = minVal + r * valRange;
            return (
              <g key={i}>
                <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#1e293b" strokeDasharray="2 2" />
                <text x={pad.left - 6} y={y + 3} textAnchor="end" fill="#64748b" fontSize="9">
                  {val >= 1000 ? `$${Math.round(val / 1000)}k` : val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Optional Baseline */}
          {baselineY !== null && (
            <g>
              <line
                x1={pad.left}
                y1={baselineY}
                x2={width - pad.right}
                y2={baselineY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <text x={width - pad.right} y={baselineY - 4} textAnchor="end" fill="#f59e0b" fontSize="9">
                Prompt Baseline
              </text>
            </g>
          )}

          {/* Bar Chart Mode */}
          {isBar ? (
            payload.dataPoints.map((d, i) => {
              const barWidth = Math.max(16, (plotW / payload.dataPoints.length) * 0.6);
              const barX = pad.left + (i / payload.dataPoints.length) * plotW + (plotW / payload.dataPoints.length - barWidth) / 2;
              const barY = getY(d.value);
              const barH = pad.top + plotH - barY;
              const isHovered = hoveredIdx === i;

              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barH}
                    rx="3"
                    fill={isHovered ? '#34d399' : '#059669'}
                    className="transition-all"
                  />
                  <text
                    x={barX + barWidth / 2}
                    y={height - 10}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })
          ) : (
            /* Time-Series / Curve Mode */
            <>
              {areaPathD && <path d={areaPathD} fill="url(#skipperAreaGrad)" />}
              {linePathD && (
                <path
                  d={linePathD}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {pointsCoords.map((pt, i) => {
                const isHovered = hoveredIdx === i;
                return (
                  <g
                    key={i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
                    {isHovered && (
                      <circle cx={pt.x} cy={pt.y} r="8" fill="#38bdf8" fillOpacity="0.2" className="animate-ping" />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? '5' : '3.5'}
                      fill={isHovered ? '#38bdf8' : '#0f172a'}
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                    <text
                      x={pt.x}
                      y={height - 10}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                    >
                      {pt.d.label}
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIdx !== null && payload.dataPoints[hoveredIdx] && (
          <div className="absolute top-3 right-4 bg-slate-900/95 border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-xs shadow-xl pointer-events-none">
            <span className="font-semibold text-white mr-1.5">
              {payload.dataPoints[hoveredIdx].label}:
            </span>
            <span className="font-bold text-cyan-300">
              {payload.dataPoints[hoveredIdx].value.toLocaleString()} {payload.unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
