import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type BadgeId =
  | 'projectExplorer'
  | 'nightOwl'
  | 'earlyBird'
  | 'completionist'
  | 'bountyHunter'
  | 'socialButterfly'
  | 'partyAnimal'
  | 'offGrid'
  | 'partySeeker';

export interface BadgeDefinition {
  id: BadgeId;
  title: string;
  description: string;
  threshold?: number;
}

interface BadgeUnlockMetadata {
  unlockedAt: string;
}

interface BadgeState {
  unlocked: Partial<Record<BadgeId, BadgeUnlockMetadata>>;
  celebrateCount: number;
  projectButtons: string[];
  sectionsSeen: string[];
}

interface BadgeContextValue {
  definitions: BadgeDefinition[];
  unlocked: Partial<Record<BadgeId, BadgeUnlockMetadata>>;
  celebrateCount: number;
  registerCelebration: () => void;
  registerProjectButtonClick: (buttonId: string) => void;
  markSectionSeen: (sectionId: string) => void;
  unlockBadge: (badgeId: BadgeId) => void;
  toastQueue: BadgeId[];
  popToast: () => void;
}

const STORAGE_KEY = 'personal-website::badges';

const INITIAL_STATE: BadgeState = {
  unlocked: {},
  celebrateCount: 0,
  projectButtons: [],
  sectionsSeen: [],
};

export const COMPLETION_SECTIONS = ['hero-section', 'about-section', 'experience-section', 'projects-section', 'footer-section'];

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'projectExplorer',
    title: 'Project Explorer',
    description: 'Clicked three unique project buttons.',
  },
  {
    id: 'nightOwl',
    title: 'Night Owl',
    description: 'Visited between 10 pm and 5 am.',
  },
  {
    id: 'earlyBird',
    title: 'Early Bird',
    description: 'Visited between 5 am and 8 am.',
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Scrolled through every section in one visit.',
  },
  {
    id: 'bountyHunter',
    title: 'Bounty Hunter',
    description: 'Opened the browser console while visiting.',
  },
  {
    id: 'socialButterfly',
    title: 'Social Butterfly',
    description: 'Celebrated 10 times.',
    threshold: 10,
  },
  {
    id: 'partyAnimal',
    title: 'Party Animal',
    description: 'Celebrated 100 times.',
    threshold: 100,
  },
  {
    id: 'offGrid',
    title: 'Off Grid',
    description: 'Opened the print preview.',
  },
  {
    id: 'partySeeker',
    title: 'Party Seeker',
    description: 'Found the secret celebration page.',
  },
];

const BadgeContext = createContext<BadgeContextValue | undefined>(undefined);

const loadInitialState = (): BadgeState => {
  if (typeof window === 'undefined') {
    return INITIAL_STATE;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return INITIAL_STATE;
    }

    const parsed = JSON.parse(stored) as BadgeState;
    return {
      unlocked: parsed.unlocked ?? {},
      celebrateCount: parsed.celebrateCount ?? 0,
      projectButtons: Array.isArray(parsed.projectButtons) ? parsed.projectButtons : [],
      sectionsSeen: Array.isArray(parsed.sectionsSeen) ? parsed.sectionsSeen : [],
    };
  } catch (error) {
    console.warn('Failed to parse badge state from storage', error);
    return INITIAL_STATE;
  }
};

export const BadgeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<BadgeState>(loadInitialState);
  const [toastQueue, setToastQueue] = useState<BadgeId[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const enqueueToast = useCallback((badgeId: BadgeId) => {
    console.log(`[Badge] Enqueueing toast for: ${badgeId}`);
    setToastQueue((prev) => [...prev, badgeId]);
  }, []);

  const unlockBadge = useCallback((badgeId: BadgeId) => {
    setState((prev) => {
      if (prev.unlocked[badgeId]) {
        return prev;
      }

      console.log(`[Badge] Unlocking badge: ${badgeId}`);
      enqueueToast(badgeId);

      return {
        ...prev,
        unlocked: {
          ...prev.unlocked,
          [badgeId]: { unlockedAt: new Date().toISOString() },
        },
      };
    });
  }, [enqueueToast]);

  const registerCelebration = useCallback(() => {
    setState((prev) => ({
      ...prev,
      celebrateCount: prev.celebrateCount + 1,
    }));
  }, []);

  const registerProjectButtonClick = useCallback((buttonId: string) => {
    setState((prev) => {
      if (prev.projectButtons.includes(buttonId)) {
        return prev;
      }

      console.log(`[Badge] Project button clicked: ${buttonId}`, [...prev.projectButtons, buttonId]);

      return {
        ...prev,
        projectButtons: [...prev.projectButtons, buttonId],
      };
    });
  }, []);

  const markSectionSeen = useCallback((sectionId: string) => {
    setState((prev) => {
      if (prev.sectionsSeen.includes(sectionId)) {
        return prev;
      }

      console.log(`[Badge] Marking section as seen: ${sectionId}`, [...prev.sectionsSeen, sectionId]);
      
      return {
        ...prev,
        sectionsSeen: [...prev.sectionsSeen, sectionId],
      };
    });
  }, []);

  const popToast = useCallback(() => {
    console.log(`[BadgeContext] popToast called`);
    setToastQueue((prev) => {
      const next = prev.slice(1);
      console.log(`[BadgeContext] Queue update - before:`, prev, `after:`, next);
      return next;
    });
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 22 || hour < 5) {
      unlockBadge('nightOwl');
    }

    if (hour >= 5 && hour < 8) {
      unlockBadge('earlyBird');
    }
  }, [unlockBadge]);

  useEffect(() => {
    const threshold = 160;
    const checkDevTools = () => {
      const widthThreshold = Math.abs(window.outerWidth - window.innerWidth) > threshold;
      const heightThreshold = Math.abs(window.outerHeight - window.innerHeight) > threshold;

      if (widthThreshold || heightThreshold) {
        unlockBadge('bountyHunter');
      }
    };

    const interval = window.setInterval(checkDevTools, 1000);

    return () => window.clearInterval(interval);
  }, [unlockBadge]);

  useEffect(() => {
    const handleBeforePrint = () => {
      console.log('[Badge] Print preview detected');
      unlockBadge('offGrid');
    };

    const handleAfterPrint = () => {
      console.log('[Badge] Print preview closed');
      unlockBadge('offGrid');
    };

    // Detect print preview via keyboard shortcut or menu
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    // Additional detection for when matchMedia changes to print
    const printMediaQuery = window.matchMedia('print');
    const handlePrintMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        console.log('[Badge] Print media query detected');
        unlockBadge('offGrid');
      }
    };

    if (printMediaQuery.addEventListener) {
      printMediaQuery.addEventListener('change', handlePrintMediaChange);
    } else {
      // Fallback for older browsers
      printMediaQuery.addListener(handlePrintMediaChange as any);
    }

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      if (printMediaQuery.removeEventListener) {
        printMediaQuery.removeEventListener('change', handlePrintMediaChange);
      } else {
        printMediaQuery.removeListener(handlePrintMediaChange as any);
      }
    };
  }, [unlockBadge]);

  useEffect(() => {
    if (state.projectButtons.length >= 3) {
      unlockBadge('projectExplorer');
    }
  }, [state.projectButtons.length, unlockBadge]);

  useEffect(() => {
    const hasSeenAllSections = COMPLETION_SECTIONS.every((sectionId) =>
      state.sectionsSeen.includes(sectionId)
    );

    console.log(`[Badge] Completionist check:`, {
      required: COMPLETION_SECTIONS,
      seen: state.sectionsSeen,
      hasSeenAll: hasSeenAllSections
    });

    if (hasSeenAllSections && COMPLETION_SECTIONS.length > 0) {
      unlockBadge('completionist');
    }
  }, [state.sectionsSeen, unlockBadge]);

  useEffect(() => {
    BADGE_DEFINITIONS.forEach((badge) => {
      if (!badge.threshold) {
        return;
      }

      if (state.celebrateCount >= badge.threshold) {
        unlockBadge(badge.id);
      }
    });
  }, [state.celebrateCount, unlockBadge]);

  const contextValue = useMemo<BadgeContextValue>(() => ({
    definitions: BADGE_DEFINITIONS,
    unlocked: state.unlocked,
    celebrateCount: state.celebrateCount,
    registerCelebration,
    registerProjectButtonClick,
    markSectionSeen,
    unlockBadge,
    toastQueue,
    popToast,
  }), [
    state.unlocked,
    state.celebrateCount,
    registerCelebration,
    registerProjectButtonClick,
    markSectionSeen,
    unlockBadge,
    toastQueue,
    popToast,
  ]);

  return <BadgeContext.Provider value={contextValue}>{children}</BadgeContext.Provider>;
};

export const useBadges = (): BadgeContextValue => {
  const context = useContext(BadgeContext);

  if (!context) {
    throw new Error('useBadges must be used within a BadgeProvider');
  }

  return context;
};

