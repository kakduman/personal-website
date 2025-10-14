import { useEffect } from 'react';
import { useBadges } from '../context/BadgeContext';

export const useSectionObserver = (sectionId: string, threshold: number = 0.2) => {
  const { markSectionSeen } = useBadges();

  useEffect(() => {
    if (!sectionId) {
      return;
    }

    const element = document.getElementById(sectionId);

    if (!element) {
      console.warn(`[Badge] Section element not found: ${sectionId}`);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log(`[Badge] Section seen: ${sectionId}`);
          markSectionSeen(sectionId);
          observer.disconnect();
        }
      });
    }, { threshold });

    observer.observe(element);

    return () => observer.disconnect();
  }, [sectionId, threshold, markSectionSeen]);
};

