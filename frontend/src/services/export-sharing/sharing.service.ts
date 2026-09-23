/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 30: EXPORT & SHARING — URL Sharing & Web Share Service
 *
 * Provides safe link sharing and parameter encoding:
 * - Zero-credential parameter serialization
 * - Native Web Share API integration (mobile devices) with clipboard fallback
 * - Clean shareable links for Data Query, Reporting, and Vessel Views
 */

import type { ShareableUrlConfig } from '../../types/export-sharing';
import { ExportService } from './export.service';

export class SharingService {
  /**
   * Constructs a shareable URL from base route and parameter dictionary
   */
  public static buildShareableUrl(config: ShareableUrlConfig): string {
    const params = new URLSearchParams();

    for (const [key, val] of Object.entries(config.parameters)) {
      if (val === undefined || val === null || val === '') continue;

      // Ensure no credentials, secrets, tokens, or private workspace data are ever serialized
      const lowerKey = key.toLowerCase();
      const forbiddenTerms = [
        'token',
        'auth',
        'secret',
        'password',
        'key',
        'credential',
        'session',
        'private',
        'cargo',
      ];
      if (forbiddenTerms.some((term) => lowerKey.includes(term))) {
        continue;
      }

      if (typeof val === 'object') {
        try {
          params.set(key, JSON.stringify(val));
        } catch {
          // ignore serialization failure
        }
      } else {
        params.set(key, String(val));
      }
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sih26006.maritime.local';
    const cleanPath = config.entityOrView.startsWith('/') ? config.entityOrView : `/${config.entityOrView}`;
    const paramString = params.toString();

    return paramString ? `${origin}${cleanPath}?${paramString}` : `${origin}${cleanPath}`;
  }

  /**
   * Shares link using native mobile Web Share API if supported, or copies to clipboard
   */
  public static async shareLink(options: {
    title: string;
    text?: string;
    url: string;
  }): Promise<{ method: 'native_share' | 'clipboard'; success: boolean }> {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: options.title,
          text: options.text || options.title,
          url: options.url,
        });
        return { method: 'native_share', success: true };
      } catch (err: any) {
        // If user cancelled, return true; if failed, fall through to clipboard
        if (err?.name === 'AbortError') {
          return { method: 'native_share', success: true };
        }
      }
    }

    // Fallback to clipboard
    const copied = await ExportService.copyToClipboard(options.url);
    return { method: 'clipboard', success: copied };
  }

  /**
   * Convenience boolean helper for Web Share API invocation with fallback
   */
  public static async shareViaWebShare(options: {
    title: string;
    text?: string;
    url: string;
  }): Promise<boolean> {
    const res = await this.shareLink(options);
    return res.success;
  }
}
