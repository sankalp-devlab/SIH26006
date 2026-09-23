/**
 * Favourites Service
 * Manages user's pinned favourite routes/items in localStorage
 */

export interface FavouriteItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  addedAt: number;
}

const STORAGE_KEY = 'sih26006_favourites';

export class FavouritesService {
  static getFavourites(): FavouriteItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static isFavourite(path: string): boolean {
    const list = this.getFavourites();
    return list.some((item) => item.path === path);
  }

  static toggleFavourite(item: { id: string; name: string; path: string; icon?: string }): boolean {
    const list = this.getFavourites();
    const existingIndex = list.findIndex((fav) => fav.path === item.path);

    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('favourites-updated'));
      return false;
    } else {
      list.push({ ...item, addedAt: Date.now() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('favourites-updated'));
      return true;
    }
  }

  static removeFavourite(path: string): void {
    const list = this.getFavourites().filter((item) => item.path !== path);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('favourites-updated'));
  }
}
