import React from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Scale,
  Clock,
  Layers,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import type { ValuationAnalyticalInsight } from '../../../../types/valuations';

interface ValuationInsightsPanelProps {
  insights: ValuationAnalyticalInsight[];
  vesselName: string;
}

export const ValuationInsightsPanel: React.FC<ValuationInsightsPanelProps> = ({
  insights,
  vesselName,
}) => {
  const getCategoryIcon = (category: ValuationAnalyticalInsight['category'], urgency: ValuationAnalyticalInsight['urgency']) => {
    switch (category) {
      case 'valuation':
        return urgency === 'positive' ? (
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        ) : (
          <TrendingDown className="w-5 h-5 text-rose-400" />
        );
      case 'market_context':
        return <Scale className="w-5 h-5 text-blue-400" />;
      case 'demolition':
        return <ShieldCheck className="w-5 h-5 text-amber-400" />;
      case 'depreciation':
        return <Clock className="w-5 h-5 text-purple-400" />;
      case 'sp_activity':
        return <Layers className="w-5 h-5 text-cyan-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getUrgencyBadgeClasses = (urgency: ValuationAnalyticalInsight['urgency']) => {
    switch (urgency) {
      case 'positive':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'warning':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'info':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-md">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Valuation Intelligence & Market Synthesis
            </h3>
            <p className="text-xs text-slate-400">
              Data-backed narrative signals synthesized across asset metrics and market liquidity for {vesselName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {insights.length} SYNTHESIZED INSIGHTS
          </span>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="group relative bg-slate-950/60 hover:bg-slate-800/40 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-5 transition flex flex-col justify-between"
          >
            <div>
              {/* Badge & Category */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    {getCategoryIcon(ins.category, ins.urgency)}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getUrgencyBadgeClasses(
                      ins.urgency
                    )}`}
                  >
                    {ins.badge}
                  </span>
                </div>

                {ins.urgency === 'warning' && (
                  <div className="text-rose-400 flex items-center gap-1 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="font-semibold">Review Required</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition mb-2">
                {ins.title}
              </h4>

              {/* Narrative */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {ins.narrative}
              </p>
            </div>

            {/* Impact Metric Strip */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <span>{ins.impactMetric}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </span>
              <span
                className={`font-mono font-bold ${
                  ins.urgency === 'positive'
                    ? 'text-emerald-400'
                    : ins.urgency === 'warning'
                    ? 'text-rose-400'
                    : 'text-blue-400'
                }`}
              >
                {ins.impactValue}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
