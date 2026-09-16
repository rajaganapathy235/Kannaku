import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { triggerHaptic } from '../utils/nativeCapabilities';

export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<any> | void;
  pullDownThreshold?: number;
  maxPullDistance?: number;
  disabled?: boolean;
}

/**
 * Mobile-first Pull-to-Refresh container for PWA/TWA views.
 * Intercepts touch gestures when scroll is at top (scrollTop === 0),
 * displays an animated emerald loading indicator, triggers onRefresh, and provides haptic feedback.
 */
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  pullDownThreshold = 70,
  maxPullDistance = 120,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const startYRef = useRef<number>(0);
  const isPullingRef = useRef<boolean>(false);

  const isAtTop = useCallback(() => {
    if (!containerRef.current) return true;
    return containerRef.current.scrollTop <= 0;
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (disabled || isRefreshing) return;

    if (isAtTop()) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPullingRef.current || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    // Only allow pulling down when at top
    if (diff > 0 && isAtTop()) {
      // Apply rubber-band damping curve (logarithmic / square root scale)
      const dampedDistance = Math.min(
        maxPullDistance,
        Math.pow(diff, 0.82) * 1.8
      );
      setPullDistance(dampedDistance);

      // Light haptic tick when passing the threshold trigger
      if (dampedDistance >= pullDownThreshold && pullDistance < pullDownThreshold) {
        triggerHaptic('light');
      }
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current || disabled) return;
    isPullingRef.current = false;

    if (pullDistance >= pullDownThreshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(pullDownThreshold * 0.85); // Lock indicator in view during refresh
      triggerHaptic('medium');

      try {
        await Promise.resolve(onRefresh());
        triggerHaptic('success');
      } catch (err) {
        console.error('[PullToRefresh] Refresh failed:', err);
        triggerHaptic('error');
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const progressRatio = Math.min(1, pullDistance / pullDownThreshold);
  const rotationDeg = progressRatio * 180;

  return (
    <div
      ref={containerRef}
      id="pull-to-refresh-container"
      className="relative w-full h-full overflow-y-auto overscroll-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull down indicator tray */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none transition-transform duration-150 ease-out z-30"
        style={{
          transform: `translateY(${pullDistance - 50}px)`,
          opacity: pullDistance > 10 ? 1 : 0,
        }}
      >
        <div className="w-10 h-10 rounded-full bg-white border border-emerald-100 shadow-md flex items-center justify-center text-[#059669]">
          {isRefreshing ? (
            <RefreshCw className="w-5 h-5 animate-spin text-[#059669]" />
          ) : (
            <div
              className="transition-transform duration-75"
              style={{ transform: `rotate(${rotationDeg}deg)` }}
            >
              {pullDistance >= pullDownThreshold ? (
                <RefreshCw className="w-5 h-5 text-[#059669]" />
              ) : (
                <ArrowDown className="w-5 h-5 text-emerald-600" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main scrollable body with smooth offset translation */}
      <div
        className="w-full h-full transition-transform duration-150 ease-out"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.4}px)` : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
