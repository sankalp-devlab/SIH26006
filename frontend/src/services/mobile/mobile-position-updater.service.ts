/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 27: Mobile Position Updater, Notes & Watchlist Service
 */

import type {
  MobileVesselPositionUpdate,
  MobileVesselNote,
  MobileCustomWatchlist,
} from '../../types/mobile';

const POSITIONS_KEY = 'sih26006_mobile_positions_v1';
const NOTES_KEY = 'sih26006_mobile_vessel_notes_v1';
const WATCHLISTS_KEY = 'sih26006_mobile_watchlists_v1';

export const SEED_MOBILE_NOTES: MobileVesselNote[] = [
  {
    id: 'note-001',
    vesselId: 1,
    vesselName: 'APOLLO GLORY',
    author: 'Captain K. Hansen',
    content: 'Completed bunkering at Fujairah anchorage (3,200 MT VLSFO). All main engine cylinder clearances inspected and within limits. Commencing passage through Arabian Sea.',
    category: 'operational',
    createdAt: '2026-09-12T08:30:00Z',
  },
  {
    id: 'note-002',
    vesselId: 1,
    vesselName: 'APOLLO GLORY',
    author: 'Operations Desk',
    content: 'Terminal pre-arrival documentation sent to Qingdao port agent. Discharge sequence scheduled for Berth 4 at Qianwan Crude Terminal.',
    category: 'commercial',
    createdAt: '2026-09-13T10:15:00Z',
  },
  {
    id: 'note-003',
    vesselId: 2,
    vesselName: 'OCEAN TITAN',
    author: 'Chief Engineer M. Rossi',
    content: 'Ballast water treatment system (BWTS) UV filtration maintenance completed during Taiwan Strait passage. System fully operational for Ningbo arrival.',
    category: 'technical',
    createdAt: '2026-09-12T14:40:00Z',
  },
];

export const SEED_WATCHLISTS: MobileCustomWatchlist[] = [
  {
    id: 'watchlist-crude',
    name: 'VLCC Commercial Pool',
    vesselIds: [1, 3, 5],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 'watchlist-china-discharge',
    name: 'China Inbound En Route',
    vesselIds: [1, 2, 4],
    createdAt: '2026-09-05T00:00:00Z',
    updatedAt: '2026-09-13T08:00:00Z',
  },
];

export class MobilePositionUpdaterService {
  /**
   * Retrieves all position overrides
   */
  public static getPositionUpdates(): Record<number, MobileVesselPositionUpdate> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(POSITIONS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /**
   * Retrieves position override for a specific vessel if exists
   */
  public static getVesselPositionUpdate(vesselId: number): MobileVesselPositionUpdate | null {
    const all = MobilePositionUpdaterService.getPositionUpdates();
    return all[vesselId] || null;
  }

  /**
   * Saves a position update for a vessel
   */
  public static savePositionUpdate(update: MobileVesselPositionUpdate): boolean {
    if (!MobilePositionUpdaterService.validateCoordinates(update.latitude, update.longitude)) {
      throw new Error('Invalid GPS coordinates: Latitude must be -90 to +90, Longitude -180 to +180.');
    }
    if (update.heading < 0 || update.heading > 360) {
      throw new Error('Invalid heading: Must be between 0° and 360°.');
    }

    const all = MobilePositionUpdaterService.getPositionUpdates();
    all[update.vesselId] = {
      ...update,
      timestamp: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(POSITIONS_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('mobile-vessel-position-updated', { detail: update }));
    }
    return true;
  }

  /**
   * Validates GPS coordinate bounds
   */
  public static validateCoordinates(lat: number, lng: number): boolean {
    return (
      typeof lat === 'number' &&
      !isNaN(lat) &&
      lat >= -90 &&
      lat <= 90 &&
      typeof lng === 'number' &&
      !isNaN(lng) &&
      lng >= -180 &&
      lng <= 180
    );
  }

  /**
   * Retrieves operational notes
   */
  public static getNotes(): MobileVesselNote[] {
    if (typeof window === 'undefined') return [...SEED_MOBILE_NOTES];
    try {
      const raw = localStorage.getItem(NOTES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    MobilePositionUpdaterService.saveNotes(SEED_MOBILE_NOTES);
    return [...SEED_MOBILE_NOTES];
  }

  /**
   * Saves operational notes array
   */
  public static saveNotes(notes: MobileVesselNote[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    window.dispatchEvent(new Event('mobile-notes-updated'));
  }

  /**
   * Appends a new operational note
   */
  public static addNote(note: Omit<MobileVesselNote, 'id' | 'createdAt'>): MobileVesselNote {
    const newNote: MobileVesselNote = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const all = MobilePositionUpdaterService.getNotes();
    all.unshift(newNote);
    MobilePositionUpdaterService.saveNotes(all);
    return newNote;
  }

  /**
   * Retrieves notes for a specific vessel
   */
  public static getVesselNotes(vesselId: number): MobileVesselNote[] {
    return MobilePositionUpdaterService.getNotes().filter((n) => n.vesselId === vesselId);
  }

  /**
   * Retrieves user custom watchlists
   */
  public static getWatchlists(): MobileCustomWatchlist[] {
    if (typeof window === 'undefined') return [...SEED_WATCHLISTS];
    try {
      const raw = localStorage.getItem(WATCHLISTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    MobilePositionUpdaterService.saveWatchlists(SEED_WATCHLISTS);
    return [...SEED_WATCHLISTS];
  }

  /**
   * Saves watchlists to storage
   */
  public static saveWatchlists(lists: MobileCustomWatchlist[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(WATCHLISTS_KEY, JSON.stringify(lists));
    window.dispatchEvent(new Event('mobile-watchlists-updated'));
  }

  /**
   * Toggles vessel in a watchlist
   */
  public static toggleVesselInWatchlist(watchlistId: string, vesselId: number): boolean {
    const lists = MobilePositionUpdaterService.getWatchlists();
    const list = lists.find((l) => l.id === watchlistId);
    if (!list) return false;

    const idx = list.vesselIds.indexOf(vesselId);
    let added = false;
    if (idx >= 0) {
      list.vesselIds.splice(idx, 1);
    } else {
      list.vesselIds.push(vesselId);
      added = true;
    }
    list.updatedAt = new Date().toISOString();
    MobilePositionUpdaterService.saveWatchlists(lists);
    return added;
  }
}
