import { MobilePositionUpdaterService } from '../mobile/mobile-position-updater.service';
import type { MobileCustomWatchlist } from '../../types/mobile';

/**
 * Centralized Watchlist Service for OceanLens Platform
 * 
 * Provides unified, safe methods for reading and writing watchlists
 * with zero risk of undefined 'this' errors.
 */
export const watchlistService = {
  getWatchlists(): MobileCustomWatchlist[] {
    try {
      return MobilePositionUpdaterService.getWatchlists() ?? [];
    } catch (err) {
      console.error('[watchlistService] Failed to load watchlists:', err);
      return [];
    }
  },

  saveWatchlists(lists: MobileCustomWatchlist[]): void {
    try {
      MobilePositionUpdaterService.saveWatchlists(lists ?? []);
    } catch (err) {
      console.error('[watchlistService] Failed to save watchlists:', err);
    }
  },

  updateWatchlist(id: string, updates: Partial<MobileCustomWatchlist>): MobileCustomWatchlist[] {
    const lists = this.getWatchlists();
    const updated = lists.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
    this.saveWatchlists(updated);
    return updated;
  },

  deleteWatchlist(id: string): MobileCustomWatchlist[] {
    const lists = this.getWatchlists();
    const filtered = lists.filter((l) => l.id !== id);
    this.saveWatchlists(filtered);
    return filtered;
  },

  toggleVessel(watchlistId: string, vesselId: number): boolean {
    try {
      return MobilePositionUpdaterService.toggleVesselInWatchlist(watchlistId, vesselId);
    } catch (err) {
      console.error('[watchlistService] Failed to toggle vessel in watchlist:', err);
      return false;
    }
  },
};
