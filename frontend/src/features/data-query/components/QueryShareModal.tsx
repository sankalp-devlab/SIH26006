import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Globe,
  Lock,
  BookmarkPlus,
  FolderKanban,
} from 'lucide-react';
import type { DataQueryConfig } from '../../../types/data-query';
import { personalizationService } from '../../../services/personalization/personalization.service';

interface QueryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareableUrl: string;
  config?: DataQueryConfig;
}

export const QueryShareModal: React.FC<QueryShareModalProps> = ({
  isOpen,
  onClose,
  shareableUrl,
  config,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(3, 11, 20, 0.78)',
          backdropFilter: 'blur(4px)',
          transition: 'opacity 0.2s ease',
        }}
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '540px',
          backgroundColor: 'var(--ol-surface-primary, #091B2E)',
          border: '1px solid var(--ol-border, #183A52)',
          borderRadius: 'var(--ol-radius-xl, 14px)',
          boxShadow: 'var(--ol-shadow-lg, 0 16px 36px rgba(0,0,0,0.5))',
          padding: '24px',
          color: 'var(--ol-text-primary, #F1F5F9)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box',
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--ol-border, #183A52)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: 'var(--ol-radius-md, 8px)',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                color: 'var(--ol-cyan, #00D4FF)',
                border: '1px solid rgba(0, 212, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Share2 size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                Share Query Workbench Link
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--ol-text-muted, #94A3B8)' }}>
                Refreshable, parameterized query link for team collaboration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ol-text-muted, #94A3B8)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--ol-radius-md, 6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--ol-text-primary, #F1F5F9)';
              e.currentTarget.style.backgroundColor = 'var(--ol-surface-secondary, #0D2238)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--ol-text-muted, #94A3B8)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* URL Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ol-text-muted, #94A3B8)' }}>
            Encoded Shareable URL:
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--ol-bg-deep, #040E19)',
              border: '1px solid var(--ol-border, #183A52)',
              borderRadius: 'var(--ol-radius-md, 8px)',
              padding: '8px 12px',
            }}
          >
            <Globe size={16} style={{ color: 'var(--ol-cyan, #00D4FF)', flexShrink: 0 }} />
            <input
              type="text"
              readOnly
              value={shareableUrl}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--ol-text-primary, #F1F5F9)',
                textOverflow: 'ellipsis',
              }}
            />
            <button
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--ol-radius-md, 6px)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                border: 'none',
                transition: 'all 0.15s ease',
                backgroundColor: copied ? 'var(--ol-green, #10B981)' : 'var(--ol-cyan, #00D4FF)',
                color: '#030B14',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Save to Personal Workspace Option */}
        {config && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--ol-radius-lg, 10px)',
              backgroundColor: 'var(--ol-surface-secondary, #0D2238)',
              border: '1px solid var(--ol-border, #183A52)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FolderKanban size={18} style={{ color: 'var(--ol-blue, #3B82F6)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>
                  Save to Personal Workspace
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ol-text-muted, #94A3B8)' }}>
                  Bookmark this query for 1-click execution
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const name = prompt(
                  'Enter a title for this saved query:',
                  `${config.entity.toUpperCase()} ${config.mode.replace('_', ' ')} Query`
                );
                if (name && name.trim()) {
                  personalizationService.saveQuery(
                    name.trim(),
                    `Saved from Data Query Workbench on ${new Date().toLocaleDateString()}`,
                    config,
                    config.entity,
                    config.mode,
                    ['Data Query'],
                    shareableUrl
                  );
                  alert('Query successfully saved to your Personal Workspace!');
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--ol-radius-md, 6px)',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--ol-blue, #3B82F6)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <BookmarkPlus size={14} />
              <span>Save to Workspace</span>
            </button>
          </div>
        )}

        {/* Security & Integrity Note */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--ol-radius-lg, 10px)',
            backgroundColor: 'rgba(4, 14, 25, 0.6)',
            border: '1px solid var(--ol-border, #183A52)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--ol-text-primary, #F1F5F9)' }}>
            <Lock size={14} style={{ color: 'var(--ol-green, #10B981)' }} />
            Zero-Credential Serialization Guarantee
          </div>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--ol-text-muted, #94A3B8)', lineHeight: 1.5 }}>
            This URL parameters specify the analytical mode, target maritime entity, multi-year date range, functions, and active filter conditions. No API keys, credentials, or confidential tenant secrets are ever embedded into the URL query parameters.
          </p>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <button
            onClick={onClose}
            className="ol-btn ol-btn-secondary ol-btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
