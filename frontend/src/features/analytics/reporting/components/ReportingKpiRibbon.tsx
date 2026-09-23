import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReportKpiItem } from '../../../../types/reporting';

interface ReportingKpiRibbonProps {
  kpis: ReportKpiItem[];
}

export const ReportingKpiRibbon: React.FC<ReportingKpiRibbonProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 mb-6">
      {kpis.map((kpi) => {
        const isPositive = kpi.status === 'positive';
        const isNegative = kpi.status === 'negative';

        return (
          <div
            key={kpi.id}
            id={`card-${kpi.id}`}
            className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-medium text-slate-400 truncate group-hover:text-slate-300 transition-colors">
                  {kpi.label}
                </span>
                {kpi.changeYoY !== 0 && (
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isNegative
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {kpi.trend === 'up' ? (
                      <TrendingUp size={11} />
                    ) : kpi.trend === 'down' ? (
                      <TrendingDown size={11} />
                    ) : (
                      <Minus size={11} />
                    )}
                    {kpi.changeYoY > 0 ? `+${kpi.changeYoY}%` : `${kpi.changeYoY}%`}
                  </span>
                )}
              </div>

              <div className="text-xl font-bold text-white tracking-tight">
                {kpi.value}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate">{kpi.subtext}</span>
              <span className="font-medium text-slate-400 shrink-0 ml-1.5">{kpi.benchmark}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
