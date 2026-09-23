import { useState, useEffect, useCallback } from 'react';
import { FavouritesService, type FavouriteItem } from '../services/favourites.service';

export function useFavourites() {
  const [favourites, setFavourites] = useState<FavouriteItem[]>(() => FavouritesService.getFavourites());

  const refresh = useCallback(() => {
    setFavourites(FavouritesService.getFavourites());
  }, []);

  useEffect(() => {
    const handleUpdate = () => refresh();
    window.addEventListener('favourites-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('favourites-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  const toggle = useCallback((item: { id: string; name: string; path: string; icon?: string }) => {
    return FavouritesService.toggleFavourite(item);
  }, []);

  const isFavourite = useCallback(
    (path: string) => {
      return favourites.some((f) => f.path === path);
    },
    [favourites]
  );

  return {
    favourites,
    toggle,
    isFavourite,
    refresh,
  };
}
