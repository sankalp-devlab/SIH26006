import React from 'react';

interface SkipperMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Format inline tokens like **bold**, *italic*, `code`, and links
 */
function renderInline(text: string): React.ReactNode[] {
  // Regex to split by bold (**text**), inline code (`code`), and italics (*text*)
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-[#030B14] border border-cyan-500/20 font-mono text-cyan-300 text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export const SkipperMarkdown: React.FC<SkipperMarkdownProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code Block ```
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={`code-${i}`} className="my-2 overflow-hidden rounded-lg border border-slate-800 bg-[#030B14]">
          <pre className="p-3 overflow-x-auto font-mono text-xs text-cyan-300 scrollbar-thin">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // 2. Markdown Table Detection (| col1 | col2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerCells = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        
        // Skip separator row (tableLines[1])
        const rowLines = tableLines.slice(2);
        const dataRows = rowLines.map((r) =>
          r
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim())
        );

        elements.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-lg border border-slate-800 bg-[#040E19] scrollbar-thin">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#051322] font-semibold text-cyan-400">
                  {headerCells.map((h, hIdx) => (
                    <th key={hIdx} className="px-3 py-2 whitespace-nowrap">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-cyan-500/5 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 3. Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-bold text-white tracking-wide mt-3 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
          <span>{renderInline(trimmed.slice(4))}</span>
        </h4>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-bold text-white tracking-wide mt-3.5 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
          <span>{renderInline(trimmed.slice(3))}</span>
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg font-bold text-white tracking-wide mt-4 mb-2">
          {renderInline(trimmed.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    // 4. Bullet list (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1.5 my-2 pl-2">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-200 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 mt-1.5 shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 5. Numbered list (1. 2.)
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-1.5 my-2 pl-2">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-200 leading-relaxed">
              <span className="font-mono text-cyan-400 font-bold text-[11px] mt-0.5 shrink-0">
                {lIdx + 1}.
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 6. Blockquote (> quote)
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`bq-${i}`}
          className="border-l-2 border-cyan-400/60 bg-cyan-500/5 px-3 py-1.5 my-2 text-xs italic text-slate-300 rounded-r"
        >
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // 7. Empty line spacer
    if (!trimmed) {
      elements.push(<div key={`sp-${i}`} className="h-1" />);
      i++;
      continue;
    }

    // 8. Normal paragraph
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-[13px] leading-relaxed text-slate-200 my-1">
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className={`skipper-markdown-flow ${className}`}>{elements}</div>;
};
