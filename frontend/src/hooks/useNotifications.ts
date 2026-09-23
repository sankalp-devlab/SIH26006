/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 28: useNotifications Custom Reactive Hook
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  MaritimeNotification,
  NotificationFiltersState,
} from '../types/notification';
import {
  NotificationService,
  NOTIF_UPDATED_EVENT,
} from '../services/notifications/notification.service';

export function useNotifications(initialFilters?: Partial<NotificationFiltersState>) {
  const [notifications, setNotifications] = useState<MaritimeNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [filters, setFilters] = useState<NotificationFiltersState>({
    searchQuery: '',
    category: 'all',
    severity: 'all',
    readStatus: 'all',
    dateRange: 'all',
    ...initialFilters,
  });

  // Hydrate notifications from NotificationService
  const loadNotifications = useCallback(() => {
    try {
      const data = NotificationService.getNotifications();
      setNotifications(data);
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    NotificationService.initEventListener();
    loadNotifications();

    // Listen for cross-component and storage updates
    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener(NOTIF_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(NOTIF_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadNotifications]);

  // Unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Actions
  const markAsRead = useCallback((id: string) => {
    NotificationService.markAsRead(id);
    loadNotifications();
  }, [loadNotifications]);

  const markAllAsRead = useCallback(() => {
    NotificationService.markAllAsRead();
    loadNotifications();
  }, [loadNotifications]);

  const deleteNotification = useCallback((id: string) => {
    NotificationService.deleteNotification(id);
    loadNotifications();
  }, [loadNotifications]);

  const clearAll = useCallback(() => {
    NotificationService.clearAll();
    loadNotifications();
  }, [loadNotifications]);

  // Filtered subset for presentation
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // 1. Category
      if (filters.category !== 'all' && n.category !== filters.category) return false;

      // 2. Severity
      if (filters.severity !== 'all' && n.severity !== filters.severity) return false;

      // 3. Read status
      if (filters.readStatus === 'unread' && n.isRead) return false;
      if (filters.readStatus === 'read' && !n.isRead) return false;

      // 4. Date range
      if (filters.dateRange !== 'all') {
        const time = new Date(n.timestamp).getTime();
        const now = Date.now();
        const diffMs = now - time;
        if (filters.dateRange === 'today' && diffMs > 86400000) return false;
        if (filters.dateRange === 'last_7_days' && diffMs > 86400000 * 7) return false;
        if (filters.dateRange === 'last_30_days' && diffMs > 86400000 * 30) return false;
      }

      // 5. Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchMsg = n.message.toLowerCase().includes(q);
        const matchVessel = n.metadata?.vesselName?.toLowerCase().includes(q);
        const matchFx = n.metadata?.fixtureReference?.toLowerCase().includes(q);
        const matchCharterer = n.metadata?.charterer?.toLowerCase().includes(q);
        if (!matchTitle && !matchMsg && !matchVessel && !matchFx && !matchCharterer) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, filters]);

  return {
    notifications,
    filteredNotifications,
    unreadCount,
    isLoading,
    isError,
    filters,
    setFilters,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refetch: loadNotifications,
  };
}
