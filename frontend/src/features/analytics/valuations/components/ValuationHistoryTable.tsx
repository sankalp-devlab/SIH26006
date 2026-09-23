import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Table as TableIcon,
  Filter
} from 'lucide-react';
import type { VesselValuationRecord, ValuationCurrency } from '../../../../types/valuations';

interface ValuationHistoryTableProps {
  vessel: VesselValuationRecord;
  currency: ValuationCurrency;
  currencySymbol: string;
  currencyRate: number;
  onExportCsv?: () => void;
}

export const ValuationHistoryTable: React.FC<ValuationHistoryTableProps> = ({
  vessel,
  currencyRate,
  currencySymbol,
  onExportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState<number>(12);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<'date' | 'marketValue' | 'scrapValue' | 'valDwt'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sorted & Filtered rows
  const filteredPoints = useMemo(() => {
    let rows = [...vessel.historicalPoints];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter((pt) => pt.date.toLowerCase().includes(q));
    }

    rows.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.timestamp - b.timestamp;
      } else if (sortField === 'marketValue') {
        comparison = a.marketValueUsdM - b.marketValueUsdM;
      } else if (sortField === 'scrapValue') {
        comparison = a.demolitionValueUsdM - b.demolitionValueUsdM;
      } else if (sortField === 'valDwt') {
        comparison = a.valuationPerDwtUsd - b.valuationPerDwtUsd;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return rows;
  }, [vessel.historicalPoints, searchTerm, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredPoints.length / pageSize) || 1;
  const paginatedPoints = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPoints.slice(start, start + pageSize);
  }, [filteredPoints, currentPage, pageSize]);

  const handleSort = (field: 'date' | 'marketValue' | 'scrapValue' | 'valDwt') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const formatCurrency = (valUsdM: number) => {
    const converted = valUsdM * currencyRate;
    return `${currencySymbol}${converted.toFixed(2)}M`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-md">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <TableIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Historical Valuation Ledger</h3>
            <p className="text-xs text-slate-400">
              Complete chronological appraisal audit trail for {vessel.name} (IMO {vessel.imoNumber})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by date (YYYY-MM)..."
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-52"
            />
          </div>

          {/* Rows per page */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400">
            <Filter className="w-3 h-3 text-slate-500" />
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={60}>All (60)</option>
            </select>
          </div>

          {/* CSV Export */}
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
              title="Download appraisal history CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="py-3 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Appraisal Date</span>
                  {sortField === 'date' && (
                    <span className="text-blue-400 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('marketValue')}
                className="py-3 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Fair Market Value</span>
                  {sortField === 'marketValue' && (
                    <span className="text-blue-400 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="py-3 px-4">Monthly MoM Delta</th>
              <th
                onClick={() => handleSort('scrapValue')}
                className="py-3 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Demolition Floor</span>
                  {sortField === 'scrapValue' && (
                    <span className="text-blue-400 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('valDwt')}
                className="py-3 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Valuation / DWT</span>
                  {sortField === 'valDwt' && (
                    <span className="text-blue-400 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="py-3 px-4">Segment Peer Avg</th>
              <th className="py-3 px-4">Market Benchmark</th>
              <th className="py-3 px-4">Premium to Bmk</th>
              <th className="py-3 px-4 text-center">S&P Activity Index</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {paginatedPoints.map((pt, idx) => {
              // Calculate MoM delta if not the very oldest in full dataset
              const originalIndex = vessel.historicalPoints.findIndex((p) => p.date === pt.date);
              const prevPoint = originalIndex > 0 ? vessel.historicalPoints[originalIndex - 1] : null;
              const momDeltaUsdM = prevPoint ? pt.marketValueUsdM - prevPoint.marketValueUsdM : 0;
              const momDeltaPct = prevPoint && prevPoint.marketValueUsdM > 0
                ? (momDeltaUsdM / prevPoint.marketValueUsdM) * 100
                : 0;

              const premiumToBmk = pt.marketBenchmarkUsdM > 0
                ? ((pt.marketValueUsdM - pt.marketBenchmarkUsdM) / pt.marketBenchmarkUsdM) * 100
                : 0;

              return (
                <tr
                  key={pt.date}
                  className={`hover:bg-slate-800/40 transition ${
                    idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-950/20'
                  }`}
                >
                  <td className="py-3 px-4 font-sans font-medium text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {pt.date}
                  </td>
                  <td className="py-3 px-4 text-blue-400 font-bold">
                    {formatCurrency(pt.marketValueUsdM)}
                  </td>
                  <td className="py-3 px-4">
                    {prevPoint ? (
                      <div
                        className={`flex items-center gap-1 ${
                          momDeltaUsdM > 0
                            ? 'text-emerald-400'
                            : momDeltaUsdM < 0
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {momDeltaUsdM > 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : momDeltaUsdM < 0 ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <Minus className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {momDeltaUsdM >= 0 ? '+' : ''}
                          {currencySymbol}
                          {(momDeltaUsdM * currencyRate).toFixed(2)}M ({momDeltaPct >= 0 ? '+' : ''}
                          {momDeltaPct.toFixed(1)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500">Base</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-amber-400">
                    {formatCurrency(pt.demolitionValueUsdM)}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    ${pt.valuationPerDwtUsd.toFixed(0)}/DWT
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {formatCurrency(pt.segmentAverageUsdM)}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {formatCurrency(pt.marketBenchmarkUsdM)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        premiumToBmk >= 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {premiumToBmk >= 0 ? '+' : ''}
                      {premiumToBmk.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800/80 border border-slate-700/60 rounded text-[11px] text-slate-300">
                      <span className="font-semibold text-white">{pt.spVolumeIndex ?? 100}</span>
                      <span className="text-slate-500 text-[10px]">pts</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-800 text-xs text-slate-400">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-200">
            {filteredPoints.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-200">
            {Math.min(currentPage * pageSize, filteredPoints.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-200">{filteredPoints.length}</span> historical appraisals
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-slate-700 text-slate-200 transition"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-slate-700 text-slate-200 transition"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
