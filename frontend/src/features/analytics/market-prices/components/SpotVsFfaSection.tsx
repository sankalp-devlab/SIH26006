/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 23: Market Prices — Spot vs FFA Forward Curve Analytics
 * Canonical Enterprise Design System Refactor
 */

import React, { useState } from 'react';
import {
  Scale,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import type { RouteForwardCurve, SpotPriceRecord } from '../../../../types/market-prices';
import { formatFreightRate } from '../../../../services/market-prices/market-prices-analytics-engine';

interface SpotVsFfaSectionProps {
  spot: SpotPriceRecord;
  curve: RouteForwardCurve;
}

export const SpotVsFfaSection: React.FC<SpotVsFfaSectionProps> = ({ spot, curve }) => {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const isContango = curve.curveStructure === 'Contango';
  const isBackwardation = curve.curveStructure === 'Backwardation';

  // SVG Forward Curve Geometry
  const width = 840;
  const height = 240;
  const margin = { top: 20, right: 35, bottom: 40, left: 65 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Compute rates range including Spot rate and all curve points
  const allRates = [spot.rateTceUsdPerDay, ...curve.points.map((p) => p.rateUsdPerDay)];
  const minRate = Math.min(...allRates) * 0.92;
  const maxRate = Math.max(...allRates) * 1.08;
  const rateSpan = maxRate - minRate || 1;

  // X Scale: 0 is Spot, 1..N are curve points
  const totalSteps = curve.points.length;
  const getX = (index: number) => margin.left + (index / totalSteps) * innerWidth;
  const getY = (val: number) => margin.top + innerHeight - ((val - minRate) / rateSpan) * innerHeight;

  // Spot baseline Y
  const spotY = getY(spot.rateTceUsdPerDay);

  // Forward Curve SVG Path
  const curvePath = [
    `M ${getX(0)} ${spotY}`,
    ...curve.points.map((p, idx) => `L ${getX(idx + 1)} ${getY(p.rateUsdPerDay)}`),
  ].join(' ');

  // Gradient area path
  const areaPath = [
    `M ${getX(0)} ${spotY}`,
    ...curve.points.map((p, idx) => `L ${getX(idx + 1)} ${getY(p.rateUsdPerDay)}`),
    `L ${getX(totalSteps)} ${margin.top + innerHeight}`,
    `L ${getX(0)} ${margin.top + innerHeight}`,
    'Z',
  ].join(' ');

  return (
    <div className="mp-card" style={{ padding: '20px', width: '100%' }}>
      {/* Header */}
      <div className="mp-card-header">
        <div className="mp-card-header-left">
          <div className="mp-card-icon-wrap mp-icon-purple">
            <Scale size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="mp-card-title">
                Spot vs FFA Forward Curve Analytics
              </h3>
              <span
                className={`mp-curve-badge ${
                  isContango ? 'mp-curve-contango' : isBackwardation ? 'mp-curve-backwardation' : 'mp-curve-flat'
                }`}
              >
                {curve.curveStructure.toUpperCase()}
              </span>
            </div>
            <p className="mp-card-subtitle">
              Physical spot rate benchmarked against forward derivative contract tenors for {spot.routeCode} ({spot.vesselClass})
            </p>
          </div>
        </div>

        {/* Spread Metric Pills */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontFamily: 'var(--font-mono, monospace)', fontSize: '11.5px' }}>
          <div style={{ padding: '4px 10px', background: 'var(--ol-surface-secondary, #0B1D2E)', border: '1px solid rgba(100, 190, 240, 0.14)', borderRadius: '6px' }}>
            <span style={{ color: 'var(--ol-text-muted, #64748B)', marginRight: '6px' }}>Spot:</span>
            <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)' }}>{formatFreightRate(spot.rateTceUsdPerDay)}</strong>
          </div>
          <div style={{ padding: '4px 10px', background: 'var(--ol-surface-secondary, #0B1D2E)', border: '1px solid rgba(100, 190, 240, 0.14)', borderRadius: '6px' }}>
            <span style={{ color: 'var(--ol-text-muted, #64748B)', marginRight: '6px' }}>Front FFA:</span>
            <strong style={{ color: 'var(--ol-cyan, #22D3EE)' }}>{formatFreightRate(curve.frontMonthFfaUsdPerDay)}</strong>
          </div>
          <div style={{ padding: '4px 10px', background: 'var(--ol-surface-secondary, #0B1D2E)', border: '1px solid rgba(100, 190, 240, 0.14)', borderRadius: '6px' }}>
            <span style={{ color: 'var(--ol-text-muted, #64748B)', marginRight: '6px' }}>Basis Spread:</span>
            <strong style={{ color: curve.spotVsFfaSpreadUsd >= 0 ? '#10B981' : '#F43F5E' }}>
              {curve.spotVsFfaSpreadUsd >= 0 ? '+' : ''}${Math.round(curve.spotVsFfaSpreadUsd).toLocaleString()} ({curve.spotVsFfaSpreadPct >= 0 ? '+' : ''}{curve.spotVsFfaSpreadPct}%)
            </strong>
          </div>
        </div>
      </div>

      {/* SVG Interactive Forward Curve */}
      <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#061423', borderRadius: '8px', border: '1px solid rgba(100, 190, 240, 0.1)', padding: '6px 0' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}>
          <defs>
            <linearGradient id="mpCurveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = margin.top + innerHeight * (1 - pct);
            const val = minRate + rateSpan * pct;
            return (
              <g key={pct}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="rgba(100, 190, 240, 0.1)"
                  strokeDasharray="3 3"
                />
                <text
                  x={margin.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="10.5"
                  fontFamily="monospace"
                >
                  ${Math.round(val / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Spot Horizontal Reference Line */}
          <line
            x1={margin.left}
            y1={spotY}
            x2={width - margin.right}
            y2={spotY}
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="5 4"
            opacity="0.8"
          />
          <text
            x={width - margin.right}
            y={spotY - 6}
            textAnchor="end"
            fill="#10B981"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            SPOT BASELINE: ${Math.round(spot.rateTceUsdPerDay).toLocaleString()}
          </text>

          {/* Shaded Area under Forward Curve */}
          <path d={areaPath} fill="url(#mpCurveGradient)" />

          {/* Forward Curve Line */}
          <path
            d={curvePath}
            fill="none"
            stroke="#A855F7"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Spot Anchor Point */}
          <circle
            cx={getX(0)}
            cy={spotY}
            r="5.5"
            fill="#10B981"
            stroke="#091A2A"
            strokeWidth="2"
          />
          <text
            x={getX(0)}
            y={margin.top + innerHeight + 18}
            textAnchor="middle"
            fill="#10B981"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            Spot
          </text>

          {/* Tenor Points */}
          {curve.points.map((pt, idx) => {
            const cx = getX(idx + 1);
            const cy = getY(pt.rateUsdPerDay);
            const isHovered = hoveredPointIndex === idx;

            return (
              <g
                key={pt.tenor}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPointIndex(idx)}
                onMouseLeave={() => setHoveredPointIndex(null)}
              >
                {/* Vertical tick */}
                <line
                  x1={cx}
                  y1={margin.top + innerHeight}
                  x2={cx}
                  y2={margin.top + innerHeight + 5}
                  stroke="rgba(100, 190, 240, 0.2)"
                />

                {/* X Axis Label */}
                <text
                  x={cx}
                  y={margin.top + innerHeight + 18}
                  textAnchor="middle"
                  fill={isHovered ? '#FFFFFF' : '#94A3B8'}
                  fontSize="10.5"
                  fontFamily="monospace"
                  fontWeight={pt.isPrompt ? 'bold' : 'normal'}
                >
                  {pt.tenorLabel}
                </text>

                {/* Point Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6.5 : 4.5}
                  fill={pt.isPrompt ? 'var(--ol-cyan, #22D3EE)' : '#A855F7'}
                  stroke="#091A2A"
                  strokeWidth="2"
                />

                {/* Hover Tooltip in SVG */}
                {isHovered && (
                  <g>
                    <rect
                      x={cx - 55}
                      y={cy - 46}
                      width="110"
                      height="38"
                      rx="6"
                      fill="#0B1D2E"
                      stroke="#A855F7"
                      strokeWidth="1.5"
                    />
                    <text
                      x={cx}
                      y={cy - 30}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ${Math.round(pt.rateUsdPerDay).toLocaleString()}
                    </text>
                    <text
                      x={cx}
                      y={cy - 16}
                      textAnchor="middle"
                      fill={pt.spreadToSpotUsd >= 0 ? '#10B981' : '#F43F5E'}
                      fontSize="9.5"
                      fontFamily="monospace"
                    >
                      {pt.spreadToSpotUsd >= 0 ? '+' : ''}${Math.round(pt.spreadToSpotUsd)} ({pt.spreadToSpotPct}%)
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Analytical Explanation Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '12px' }}>
        <div className="mp-context-card">
          <div className="mp-context-header">
            <Info size={14} style={{ color: 'var(--ol-cyan, #22D3EE)' }} />
            <span>Market Expectation</span>
          </div>
          <p className="mp-context-body">
            {isContango
              ? 'Derivative markets are pricing higher freight rates forward. Buyers of freight hedge winter capacity at a premium.'
              : isBackwardation
              ? 'Prompt physical rates trade above forward contracts. High spot cash flows accompany expected medium-term fleet easing.'
              : 'Balanced curve. Derivatives track prompt cash earnings without material forward contango or backwardation spread.'}
          </p>
        </div>

        <div className="mp-context-card">
          <div className="mp-context-header">
            <Calendar size={14} style={{ color: '#A855F7' }} />
            <span>Front-Month Basis</span>
          </div>
          <p className="mp-context-body">
            Prompt contract stands at{' '}
            <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)', fontFamily: 'var(--font-mono, monospace)' }}>
              {formatFreightRate(curve.frontMonthFfaUsdPerDay)}
            </strong>{' '}
            versus spot at{' '}
            <strong style={{ color: 'var(--ol-text-primary, #F1F5F9)', fontFamily: 'var(--font-mono, monospace)' }}>
              {formatFreightRate(spot.rateTceUsdPerDay)}
            </strong>
            . Net prompt basis is {curve.spotVsFfaSpreadUsd >= 0 ? '+' : ''}
            ${Math.round(curve.spotVsFfaSpreadUsd).toLocaleString()}/day.
          </p>
        </div>

        <div className="mp-context-card">
          <div className="mp-context-header">
            <Layers size={14} style={{ color: '#10B981' }} />
            <span>Annualized Curve Slope</span>
          </div>
          <p className="mp-context-body">
            Forward 12-month slope is{' '}
            <strong
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                color: curve.curveSlopeAnnualizedPct >= 0 ? '#10B981' : '#F43F5E',
              }}
            >
              {curve.curveSlopeAnnualizedPct >= 0 ? '+' : ''}
              {curve.curveSlopeAnnualizedPct}%
            </strong>
            . Reflects market consensus over annual carrier fleet additions versus ton-mile demand.
          </p>
        </div>
      </div>
    </div>
  );
};
