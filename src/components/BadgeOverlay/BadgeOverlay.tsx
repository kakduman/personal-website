import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useBadges } from '../../context/BadgeContext';

const DISPLAY_DURATION = 4000;
const FADE_DURATION = 300;

const BadgeOverlay: React.FC = () => {
  const { toastQueue, definitions, popToast } = useBadges();
  const [visible, setVisible] = useState(false);
  const [displayingBadgeId, setDisplayingBadgeId] = useState<string | null>(null);
  const currentBadgeRef = useRef<string | null>(null);
  const timersRef = useRef<{ hide: ReturnType<typeof setTimeout>; remove: ReturnType<typeof setTimeout> } | null>(null);

  const activeBadgeId = toastQueue[0];

  const displayBadge = useMemo(
    () => definitions.find((badge) => badge.id === displayingBadgeId),
    [definitions, displayingBadgeId]
  );

  useEffect(() => {
    console.log(`[Badge] Effect running - activeBadgeId: ${activeBadgeId}, currentBadge: ${currentBadgeRef.current}, queue:`, toastQueue);
    
    // Clear existing timers if any
    if (timersRef.current) {
      console.log(`[Badge] Clearing existing timers`);
      clearTimeout(timersRef.current.hide);
      clearTimeout(timersRef.current.remove);
      timersRef.current = null;
    }

    // No badge to display - reset state
    if (!activeBadgeId) {
      console.log(`[Badge] No active badge, resetting state`);
      currentBadgeRef.current = null;
      setVisible(false);
      setDisplayingBadgeId(null);
      return;
    }

    // Already displaying this badge
    if (currentBadgeRef.current === activeBadgeId) {
      console.log(`[Badge] Already displaying ${activeBadgeId}, skipping`);
      return;
    }

    console.log(`[Badge] Starting display for: ${activeBadgeId}`);
    
    // Track current badge
    currentBadgeRef.current = activeBadgeId;
    
    // Show the new badge
    setDisplayingBadgeId(activeBadgeId);
    setVisible(true);

    // Hide animation
    const hideTimer = setTimeout(() => {
      console.log(`[Badge] Hiding: ${activeBadgeId}`);
      setVisible(false);
    }, DISPLAY_DURATION - FADE_DURATION);

    // Remove from queue and reset state
    const removeTimer = setTimeout(() => {
      console.log(`[Badge] Removing from queue: ${activeBadgeId}, queue before pop:`, toastQueue);
      currentBadgeRef.current = null;
      setDisplayingBadgeId(null);
      setVisible(false);
      popToast();
      timersRef.current = null;
    }, DISPLAY_DURATION);

    timersRef.current = { hide: hideTimer, remove: removeTimer };

    return () => {
      if (timersRef.current) {
        console.log(`[Badge] Cleanup - clearing timers for ${activeBadgeId}`);
        clearTimeout(timersRef.current.hide);
        clearTimeout(timersRef.current.remove);
      }
    };
  }, [activeBadgeId, popToast]);

  if (!displayBadge || !visible) {
    return null;
  }

  return (
    <div className="badge-overlay" aria-live="polite" aria-atomic="true">
      <div
        className="badge-toast"
        style={{
          opacity: 1,
          transform: 'translateY(0)',
          pointerEvents: 'auto',
        }}
      >
        <h3>Badge unlocked: {displayBadge.title}</h3>
        <p>{displayBadge.description}</p>
      </div>
    </div>
  );
};

export default BadgeOverlay;

