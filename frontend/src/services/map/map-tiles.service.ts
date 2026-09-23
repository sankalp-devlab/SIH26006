import { ENV } from '../../config/env';
import type { MapTheme } from '../../types/map';

export interface MapTileConfig {
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains: string;
}

export class MapTilesService {
  /**
   * Generates the tile layer configuration for Leaflet maps across the platform.
   * Connects to CARTO Basemaps and appends the required API key if configured in environment.
   */
  static getTileConfig(theme: MapTheme = 'dark'): MapTileConfig {
    const keyParam = ENV.CARTO_API_KEY ? `?key=${encodeURIComponent(ENV.CARTO_API_KEY)}` : '';

    const themeUrls: Record<MapTheme, string> = {
      dark: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${keyParam}`,
      voyager: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${keyParam}`,
      light: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${keyParam}`,
    };

    return {
      url: themeUrls[theme] || themeUrls.dark,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OSM</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
      maxZoom: 18,
      subdomains: 'abcd',
    };
  }
}
