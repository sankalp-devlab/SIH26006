import React, { useState, useMemo } from 'react';
import { Download, Table as TableIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SkipperTablePayload } from '../../../types/skipper';

interface SkipperTableArtifactProps {
  payload: SkipperTablePayload;
}

export const SkipperTableArtifact: React.FC<SkipperTableArtifactProps> = ({ payload }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);
  const pageSize = 8;

  const handleSort = (colKey: string) => {
    if (sortCol === colKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colKey);
      setSortAsc(false);
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortCol) return payload.rows;
    return [...payload.rows].sort((a, b) => {
      const aVal = a[sortCol];
      const bVal = b[sortCol];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [payload.rows, sortCol, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleDownloadCsv = () => {
    if (payload.rows.length === 0) return;
    const headers = payload.columns.map((c) => `"${c.label}"`).join(',');
    const rows = payload.rows.map((r) =>
      payload.columns.map((c) => `"${r[c.key] ?? ''}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');

    if (typeof window !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = payload.downloadFilename || 'skipper-data-ledger.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-[#061321] border border-[rgba(100,190,240,0.16)] rounded-xl overflow-hidden my-3 shadow-md">
      {/* Table Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#040E19] border-b border-[rgba(100,190,240,0.12)]">
        <div className="flex items-center gap-2">
          <TableIcon size={14} className="text-cyan-400" />
          <span className="text-xs font-semibold text-[#F5F8FC]">{payload.title}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#091A2A] text-[#7189A3] border border-slate-800">
            {payload.totalCount} records
          </span>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#091A2A] hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium transition-colors border border-slate-800"
          title="Export Table to CSV"
        >
          <Download size={12} className="text-cyan-400" />
          Export CSV
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#030B14] text-[#7189A3] border-b border-slate-800 font-semibold">
              {payload.columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-2 cursor-pointer hover:text-white transition-colors select-none ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.label} {sortCol === col.key && (sortAsc ? '↑' : '↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-[#A5B8CC] font-normal">
            {paginatedRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-[rgba(0,217,255,0.04)] transition-colors">
                {payload.columns.map((col) => {
                  const val = row[col.key];
                  let formatted = val;

                  if (col.format === 'currency' && typeof val === 'number') {
                    formatted = `$${val.toLocaleString()}`;
                  } else if (col.format === 'number' && typeof val === 'number') {
                    formatted = val.toLocaleString();
                  } else if (col.format === 'badge') {
                    return (
                      <td key={col.key} className="px-3 py-2 text-center whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {val}
                        </span>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={col.key}
                      className={`px-3 py-2 whitespace-nowrap ${
                        col.align === 'right'
                          ? 'text-right font-mono text-[#F5F8FC]'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {formatted ?? '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-[#040E19] border-t border-slate-800 text-[11px] text-[#7189A3]">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#091A2A] hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors border border-slate-800"
          >
            <ChevronLeft size={12} /> Prev
          </button>
          <span>
            Page <strong className="text-white font-semibold">{currentPage}</strong> of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#091A2A] hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors border border-slate-800"
          >
            Next <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};
