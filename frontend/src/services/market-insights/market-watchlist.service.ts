/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 5: Market Watchlist Persistence Service
 */

import type { MarketWatchlistItem } from '../../types/market-insights';

const WATCHLIST_STORAGE_KEY = 'sih26006_market_watchlist';

const DEFAULT_WATCHLIST: MarketWatchlistItem[] = [
  {
    id: 'fav-route-c5',
    type: 'route',
    code: 'C5',
    title: 'C5: West Australia → Qingdao (Capesize)',
    sector: 'dry',
    vessel_class: 'Capesize',
    benchmark_rate: 9.65,
    rate_unit: '$/MT',
    change_1d_pct: 2.12,
    pinned_at: new Date().toISOString()
  },
  {
    id: 'fav-route-c3',
    type: 'route',
    code: 'C3',
    title: 'C3: Tubarao → Qingdao (Capesize)',
    sector: 'dry',
    vessel_class: 'Capesize',
    benchmark_rate: 24.80,
    rate_unit: '$/MT',
    change_1d_pct: -0.85,
    pinned_at: new Date().toISOString()
  },
  {
    id: 'fav-route-td3',
    type: 'route',
    code: 'TD3',
    title: 'TD3: Ras Tanura → Ningbo (VLCC Crude)',
    sector: 'tanker',
    vessel_class: 'VLCC',
    benchmark_rate: 49200,
    rate_unit: '$/Day',
    change_1d_pct: 1.65,
    pinned_at: new Date().toISOString()
  },
  {
    id: 'fav-route-tc2',
    type: 'route',
    code: 'TC2',
    title: 'TC2: Rotterdam → New York (MR Products)',
    sector: 'tanker',
    vessel_class: 'MR',
    benchmark_rate: 23600,
    rate_unit: '$/Day',
    change_1d_pct: 0.90,
    pinned_at: new Date().toISOString()
  }
];

export class MarketWatchlistService {
  public static getWatchlist(): MarketWatchlistItem[] {
    try {
      const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (!raw) {
        MarketWatchlistService.saveWatchlist(DEFAULT_WATCHLIST);
        return DEFAULT_WATCHLIST;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : DEFAULT_WATCHLIST;
    } catch {
      return DEFAULT_WATCHLIST;
    }
  }

  public static saveWatchlist(items: MarketWatchlistItem[]): void {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }

  public static isWatched(code: string): boolean {
    const list = MarketWatchlistService.getWatchlist();
    return list.some(item => item.code.toUpperCase() === code.toUpperCase());
  }

  public static toggleWatch(item: Omit<MarketWatchlistItem, 'pinned_at'>): boolean {
    const list = MarketWatchlistService.getWatchlist();
    const index = list.findIndex(i => i.code.toUpperCase() === item.code.toUpperCase());
    
    if (index >= 0) {
      list.splice(index, 1);
      MarketWatchlistService.saveWatchlist(list);
      return false; // unpinned
    } else {
      list.unshift({ ...item, pinned_at: new Date().toISOString() });
      MarketWatchlistService.saveWatchlist(list);
      return true; // pinned
    }
  }
}
