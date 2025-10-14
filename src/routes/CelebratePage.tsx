import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useBadges } from '../context/BadgeContext';
import BadgeOverlay from '../components/BadgeOverlay/BadgeOverlay';
import './CelebratePage.css';

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  cps: number; // celebrations per second
  owned: number;
}

const UPGRADES: Omit<Upgrade, 'owned'>[] = [
  { id: 'ryan', name: 'Ryan', description: 'My college roommate. Celebrates once per second.', cost: 10, cps: 1 },
  { id: 'neural-networker', name: 'Neural Networker', description: 'Deep-learning model trained to exchange LinkedIns.', cost: 50, cps: 5 },
  { id: 'party-bot', name: 'Party Bot', description: 'AI celebration agent, built with LangGraph.', cost: 200, cps: 10 },
  { id: 'microparty-orchestrator', name: 'Microparty Orchestrator', description: 'Deploys micro-parties across every node with flawless uptime.', cost: 500, cps: 20 },
  { id: 'elastic-celebration-service', name: 'Elastic Celebration Service', description: 'Auto-scales celebrations based on user load.', cost: 2000, cps: 50 },
  { id: 'event-loop', name: 'Event Loop', description: 'Dispatches callback after callback of confetti.', cost: 10000, cps: 200 },
  { id: 'quantum-compartier', name: 'Quantum Compartier', description: 'Turns one celebration into many (if left unobserved).', cost: 100000, cps: 1000 },
];

const CelebratePage: React.FC = () => {
  const { registerCelebration, celebrateCount, unlockBadge } = useBadges();
  const [localCount, setLocalCount] = useState(celebrateCount);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(
    UPGRADES.map(u => ({ ...u, owned: 0 }))
  );
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef<number | null>(null);
  const autoClickIntervalRef = useRef<number | null>(null);
  const lastSyncedCount = useRef(celebrateCount);

  // Unlock the Party Seeker badge on mount
  useEffect(() => {
    unlockBadge('partySeeker');
  }, [unlockBadge]);

  // Sync with global celebration count only if it changed externally
  useEffect(() => {
    const diff = celebrateCount - lastSyncedCount.current;
    if (diff > 0) {
      setLocalCount(prev => prev + diff);
      lastSyncedCount.current = celebrateCount;
    }
  }, [celebrateCount]);

  // Calculate total celebrations per second
  const totalCPS = upgrades.reduce((sum, upgrade) => sum + (upgrade.cps * upgrade.owned), 0);

  // Auto-click based on upgrades
  useEffect(() => {
    if (totalCPS === 0) {
      if (autoClickIntervalRef.current !== null) {
        window.clearInterval(autoClickIntervalRef.current);
        autoClickIntervalRef.current = null;
      }
      return;
    }

    // Update every 100ms for smooth increments
    autoClickIntervalRef.current = window.setInterval(() => {
      const increment = totalCPS / 10; // Divide by 10 because we're updating 10 times per second
      setLocalCount(prev => prev + increment);
      
      // Sync to global count every second
      registerCelebration();
      lastSyncedCount.current += 1;
    }, 100);

    return () => {
      if (autoClickIntervalRef.current !== null) {
        window.clearInterval(autoClickIntervalRef.current);
      }
    };
  }, [totalCPS, registerCelebration]);

  const celebrate = (event: React.MouseEvent<HTMLButtonElement>) => {
    registerCelebration();
    setLocalCount(prev => prev + 1);
    lastSyncedCount.current += 1;
    triggerConfetti(event);
  };

  const triggerConfetti = (event: React.MouseEvent<HTMLButtonElement> | MouseEvent) => {
    const clientX = 'clientX' in event ? event.clientX : window.innerWidth / 2;
    const clientY = 'clientY' in event ? event.clientY : window.innerHeight / 2;
    
    const canvasX = clientX / window.innerWidth;
    const canvasY = clientY / window.innerHeight;

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x: canvasX, y: canvasY },
      colors: ['#00cccc', '#0088cc', '#00cc66', '#ff6b6b', '#ffd93d']
    });
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    celebrate(event);
    setIsHolding(true);

    holdIntervalRef.current = window.setInterval(() => {
      registerCelebration();
      setLocalCount(prev => prev + 1);
      lastSyncedCount.current += 1;
      triggerConfetti(event as any);
    }, 100);
  };

  const handleMouseUp = () => {
    setIsHolding(false);
    if (holdIntervalRef.current !== null) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (isHolding) {
      setIsHolding(false);
      if (holdIntervalRef.current !== null) {
        window.clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
    }
  };

  const buyUpgrade = (upgradeId: string) => {
    setUpgrades(prevUpgrades => {
      const upgrade = prevUpgrades.find(u => u.id === upgradeId);
      if (!upgrade) return prevUpgrades;

      const currentCost = Math.floor(upgrade.cost * Math.pow(1.15, upgrade.owned));
      
      if (localCount >= currentCost) {
        setLocalCount(prev => prev - currentCost);
        return prevUpgrades.map(u =>
          u.id === upgradeId ? { ...u, owned: u.owned + 1 } : u
        );
      }
      return prevUpgrades;
    });
  };

  const getUpgradeCost = (upgrade: Upgrade) => {
    return Math.floor(upgrade.cost * Math.pow(1.15, upgrade.owned));
  };

  const formatNumber = (num: number) => {
    const rounded = Math.floor(num);
    if (rounded >= 1e9) return (rounded / 1e9).toFixed(2) + 'B';
    if (rounded >= 1e6) return (rounded / 1e6).toFixed(2) + 'M';
    if (rounded >= 1e3) return (rounded / 1e3).toFixed(2) + 'K';
    return rounded.toString();
  };

  return (
    <div className="celebrate-page">
      <BadgeOverlay />
      <Link to="/" className="back-button">← Back to Website</Link>
      
      <div className="celebrate-container">
        <div className="celebrate-header">
          <h1>Party Module</h1>
          <div className="celebrate-stats">
            <div className="stat-item">
              <span className="stat-label">Total Celebrations</span>
              <span className="stat-value">{formatNumber(localCount)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Per Second</span>
              <span className="stat-value">{formatNumber(totalCPS)}</span>
            </div>
          </div>
        </div>

        <div className="celebrate-main">
          <div className="clicker-section">
            <button
              className={`mega-celebrate-button ${isHolding ? 'holding' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleMouseDown as any}
              onTouchEnd={handleMouseUp}
            >
              <span className="celebrate-text">Celebrate</span>
              <span className="celebrate-hint">Hold for rapid fire</span>
            </button>
          </div>

          <div className="upgrades-section">
            <h2>Upgrades</h2>
            <div className="upgrades-list">
              {upgrades.map(upgrade => {
                const cost = getUpgradeCost(upgrade);
                const canAfford = localCount >= cost;
                
                return (
                  <div
                    key={upgrade.id}
                    className={`upgrade-item ${canAfford ? 'can-afford' : 'cannot-afford'}`}
                    onClick={() => buyUpgrade(upgrade.id)}
                  >
                    <div className="upgrade-header">
                      <span className="upgrade-name">{upgrade.name}</span>
                      <span className="upgrade-owned">{upgrade.owned}</span>
                    </div>
                    <div className="upgrade-description">{upgrade.description}</div>
                    <div className="upgrade-footer">
                      <span className="upgrade-cps">+{formatNumber(upgrade.cps)} /sec</span>
                      <span className="upgrade-cost">{formatNumber(cost)} celebrations</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelebratePage;

