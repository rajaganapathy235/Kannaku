import React, { useEffect, useState, useCallback } from 'react';
import { triggerHaptic } from '../utils/nativeCapabilities';

export interface PwaUpdateState {
  needRefresh: boolean;
  updateApp: () => void;
  dismissUpdate: () => void;
}

/**
 * Custom React hook for automated Service Worker updates.
 * - Listens for new Service Worker installations
 * - Auto-checks for updates on visibility change & interval
 * - Replaces current page when new Service Worker claims control
 */
export function usePwaAutoUpdate(autoReload = false): PwaUpdateState {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let refreshing = false;

    // 1. Listen for Service Worker controllerchange to trigger page reload
    const handleControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // 2. Register & monitor Service Worker lifecycle
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);

      // Check if a waiting worker already exists on initial load
      if (reg.waiting) {
        setNeedRefresh(true);
        if (autoReload) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }

      // Detect newly installed service worker
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version is installed and waiting
            setNeedRefresh(true);
            triggerHaptic('light');

            if (autoReload) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          }
        });
      });
    });

    // 3. Periodic Background Check (Every 15 minutes) + On App Focus
    const checkForUpdates = () => {
      if (registration) {
        registration.update().catch((err) => {
          console.debug('[PWA] Update check failed:', err);
        });
      }
    };

    const intervalId = setInterval(checkForUpdates, 15 * 60 * 1000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoReload, registration]);

  const updateApp = useCallback(() => {
    triggerHaptic('medium');
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  }, [registration]);

  const dismissUpdate = useCallback(() => {
    setNeedRefresh(false);
  }, []);

  return { needRefresh, updateApp, dismissUpdate };
}

/**
 * Headless or transparent component to mount in App.tsx for automatic background reload
 */
export const PwaAutoUpdateHandler: React.FC<{ autoReload?: boolean }> = ({ autoReload = true }) => {
  usePwaAutoUpdate(autoReload);
  return null;
};

export default PwaAutoUpdateHandler;
