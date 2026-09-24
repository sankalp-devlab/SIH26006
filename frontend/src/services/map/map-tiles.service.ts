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
   * If an authentic CARTO API key is provided, uses authenticated CARTO Basemaps.
   * If no API key is provided, seamlessly uses Esri World Canvas & Ocean Basemaps
   * which provide crystal-clear, high-performance dark nautical tiles without any API key or watermarks.
   */
  static getTileConfig(theme: MapTheme = 'dark'): MapTileConfig {
    if (ENV.CARTO_API_KEY && ENV.CARTO_API_KEY.trim() !== '') {
      const keyParam = `?key=${encodeURIComponent(ENV.CARTO_API_KEY.trim())}`;
      const cartoUrls: Record<MapTheme, string> = {
        dark: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${keyParam}`,
        voyager: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${keyParam}`,
        light: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${keyParam}`,
      };

      return {
        url: cartoUrls[theme] || cartoUrls.dark,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OSM</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
        maxZoom: 18,
        subdomains: 'abcd',
      };
    }

    // Default: High-performance, watermark-free enterprise tiles (zero API key required)
    const openUrls: Record<MapTheme, string> = {
      dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      voyager: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      light: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    };

    const openAttributions: Record<MapTheme, string> = {
      dark: '&copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
      voyager: '&copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>, GEBCO, NOAA, National Geographic',
      light: '&copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
    };

    return {
      url: openUrls[theme] || openUrls.dark,
      attribution: openAttributions[theme] || openAttributions.dark,
      maxZoom: 18,
      subdomains: '',
    };
  }
}
