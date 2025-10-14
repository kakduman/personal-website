import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useBadges } from '../../context/BadgeContext';

const DISPLAY_DURATION = 4000;
const FADE_DURATION = 300;

const BadgeOverlay: React.FC = () => {
  const { toastQueue, definitions, popToast } = useBadges();
  const [isVisible, setIsVisible] = useState(false);
  const [currentBadgeId, setCurrentBadgeId] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const popToastRef = useRef(popToast);
  const displayedBadgesRef = useRef<Set<string>>(new Set());

  // Keep popToast ref updated without triggering effects
  useEffect(() => {
    popToastRef.current = popToast;
  }, [popToast]);

  const displayBadge = useMemo(
    () => currentBadgeId ? definitions.find((badge) => badge.id === currentBadgeId) : undefined,
    [definitions, currentBadgeId]
  );

  // Process the queue
  useEffect(() => {
    // Already displaying a badge, don't interrupt
    if (timerRef.current !== null) {
      return;
    }

    // Nothing in queue
    if (toastQueue.length === 0) {
      setIsVisible(false);
      setCurrentBadgeId(null);
      return;
    }

    // Get the next badge
    const nextBadgeId = toastQueue[0];
    
    // Skip if already displayed in this session
    if (displayedBadgesRef.current.has(nextBadgeId)) {
      console.log(`[BadgeOverlay] Badge ${nextBadgeId} already displayed, skipping`);
      popToastRef.current();
      return;
    }

    // Mark as displayed
    displayedBadgesRef.current.add(nextBadgeId);
    console.log(`[BadgeOverlay] Displaying badge: ${nextBadgeId}`);
    
    setCurrentBadgeId(nextBadgeId);
    setIsVisible(true);

    // Schedule hide animation
    const hideTimer = window.setTimeout(() => {
      console.log(`[BadgeOverlay] Hiding badge: ${nextBadgeId}`);
      setIsVisible(false);
    }, DISPLAY_DURATION - FADE_DURATION);

    // Schedule removal from queue
    const removeTimer = window.setTimeout(() => {
      console.log(`[BadgeOverlay] Completed badge: ${nextBadgeId}`);
      timerRef.current = null;
      setCurrentBadgeId(null);
      popToastRef.current();
    }, DISPLAY_DURATION);

    // Store timer ID so we know we're processing
    timerRef.current = removeTimer;

    return () => {
      if (timerRef.current !== null) {
        console.log(`[BadgeOverlay] Cleaning up timers for: ${nextBadgeId}`);
        clearTimeout(hideTimer);
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [toastQueue]);

  if (!displayBadge || !isVisible) {
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

