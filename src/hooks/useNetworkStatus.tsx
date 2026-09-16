import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../utils/nativeCapabilities';

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  effectiveType?: string; // '4g', '3g', '2g', 'slow-2g'
  saveData?: boolean;
}

/**
 * Custom React hook for monitoring network connectivity and status transitions
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [effectiveType, setEffectiveType] = useState<string | undefined>(undefined);
  const [saveData, setSaveData] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateConnectionInfo = () => {
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn) {
        setEffectiveType(conn.effectiveType);
        setSaveData(conn.saveData);
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      triggerHaptic('success');
      updateConnectionInfo();

      // Show "back online" state for 4 seconds then reset
      setTimeout(() => {
        setWasOffline(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      triggerHaptic('error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      conn.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (conn) {
        conn.removeEventListener('change', updateConnectionInfo);
      }
    };
  }, []);

  return { isOnline, wasOffline, effectiveType, saveData };
}

/**
 * Floating UI Banner that mounts at the top of the viewport when offline
 */
export const NetworkStatusBanner: React.FC = () => {
  const { isOnline, wasOffline } = useNetworkStatus();

  // If online and was not recently offline, do not render anything
  if (isOnline && !wasOffline) {
    return null;
  }

  // Back Online State (Green Pill)
  if (isOnline && wasOffline) {
    return (
      <div
        id="network-online-banner"
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg transition-all animate-bounce"
        role="status"
        aria-live="polite"
      >
        <Wifi className="w-3.5 h-3.5 shrink-0" />
        <span>Back online. Syncing data...</span>
      </div>
    );
  }

  // Offline State (Amber/Red Pill with manual retry)
  return (
    <div
      id="network-offline-banner"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-slate-900/95 text-amber-300 border border-amber-500/30 text-xs font-medium px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md transition-all max-w-[92vw]"
      role="alert"
      aria-live="assertive"
    >
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
      <span className="truncate">No internet connection. Working in offline mode.</span>
      <button
        onClick={() => {
          triggerHaptic('light');
          if (navigator.onLine) {
            window.location.reload();
          }
        }}
        className="ml-1 text-[11px] bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 transition-colors cursor-pointer"
        aria-label="Retry network connection"
      >
        <RefreshCw className="w-3 h-3 shrink-0" />
        Retry
      </button>
    </div>
  );
};
