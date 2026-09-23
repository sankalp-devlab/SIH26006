import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  Gauge,
  Compass,
  Anchor,
  X,
} from 'lucide-react';
import type { HistoricalAisPoint } from '../../../types/map';

interface MapTimelineBarProps {
  points: HistoricalAisPoint[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onExitHistorical: () => void;
  vesselName: string;
}

export function MapTimelineBar({
  points,
  currentIndex,
  onIndexChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
  onExitHistorical,
  vesselName,
}: MapTimelineBarProps) {
  if (!points || points.length === 0) return null;

  const currentPoint = points[currentIndex] || points[0];
  const formattedTime = new Date(currentPoint.timestamp).toUTCString().replace('GMT', 'UTC');

  const speeds = [1, 2, 5];

  return (
    <div className="vmp-timeline-hud" role="region" aria-label="Historical AIS Playback">
      <div className="vmp-timeline-top">
        <div className="vmp-timeline-identity">
          <span className="vmp-historical-tag">HISTORICAL AIS REPLAY</span>
          <span className="vmp-timeline-vessel">{vesselName}</span>
          <span className="vmp-timeline-points-count">
            Step {currentIndex + 1} of {points.length} (2-hour intervals)
          </span>
        </div>

        {/* Telemetry pill values at this timestamp */}
        <div className="vmp-timeline-telemetry">
          <div className="vmp-telemetry-chip" title="Speed at this timestamp">
            <Gauge size={13} />
            <span>{currentPoint.speed_knots.toFixed(1)} kn</span>
          </div>
          <div className="vmp-telemetry-chip" title="Heading at this timestamp">
            <Compass size={13} />
            <span>{currentPoint.heading}°</span>
          </div>
          <div className="vmp-telemetry-chip" title="Draught at this timestamp">
            <Anchor size={13} />
            <span>{currentPoint.draft_m.toFixed(1)} m</span>
          </div>
          <div className="vmp-telemetry-chip time" title="UTC Timestamp">
            <Clock size={13} />
            <span>{formattedTime}</span>
          </div>
        </div>

        <button
          className="vmp-exit-timeline-btn"
          onClick={onExitHistorical}
          title="Return to Live Telemetry"
          aria-label="Exit historical mode"
        >
          <X size={15} />
          <span>Exit Replay</span>
        </button>
      </div>

      <div className="vmp-timeline-bottom">
        {/* Play / Step Buttons */}
        <div className="vmp-timeline-controls">
          <button
            className="vmp-t-btn"
            onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            title="Step Back (2 Hours)"
            aria-label="Step backward"
          >
            <SkipBack size={15} />
          </button>

          <button
            className="vmp-t-btn play"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause Playback' : 'Play Historical Route'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} />}
          </button>

          <button
            className="vmp-t-btn"
            onClick={() => onIndexChange(Math.min(points.length - 1, currentIndex + 1))}
            disabled={currentIndex === points.length - 1}
            title="Step Forward (2 Hours)"
            aria-label="Step forward"
          >
            <SkipForward size={15} />
          </button>
        </div>

        {/* Scrubber slider */}
        <div className="vmp-scrubber-wrapper">
          <input
            type="range"
            min={0}
            max={points.length - 1}
            value={currentIndex}
            onChange={(e) => onIndexChange(Number(e.target.value))}
            className="vmp-scrubber-slider"
            aria-label="Voyage historical timeline"
          />
          <div className="vmp-scrubber-ticks">
            <span>Departure</span>
            <span>Mid-Voyage Passage</span>
            <span>Current / Arrival</span>
          </div>
        </div>

        {/* Speed multiplier selector */}
        <div className="vmp-speed-multipliers">
          {speeds.map((s) => (
            <button
              key={s}
              className={`vmp-speed-chip ${playbackSpeed === s ? 'active' : ''}`}
              onClick={() => onChangeSpeed(s)}
              title={`${s}x Playback Speed`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
