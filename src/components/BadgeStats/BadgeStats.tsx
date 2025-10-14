import React, { useState } from 'react';
import { useBadges } from '../../context/BadgeContext';
import './BadgeStats.css';

const BadgeStats: React.FC = () => {
  const { unlocked, definitions } = useBadges();
  const [showTooltip, setShowTooltip] = useState(false);

  const unlockedCount = Object.keys(unlocked).length;
  const totalBadges = definitions.length;

  // Don't show the icon until at least one badge is earned
  if (unlockedCount === 0) {
    return null;
  }

  return (
    <div
      className="badge-stats-icon"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="badge-count">{unlockedCount}</span>

      {showTooltip && (
        <div className="badge-stats-tooltip">
          <div className="badge-stats-content">
            <p>Badges: {unlockedCount}/{totalBadges}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeStats;

