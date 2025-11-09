import React, { useEffect, useRef, useState, useCallback } from 'react';
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

interface PowerUp {
  id: string;
  name: string;
  description: string;
  duration: number;
  multiplier?: number;
  effect: string;
  emoji: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: number;
  unlocked: boolean;
  condition: (stats: GameStats) => boolean;
}

interface GameStats {
  totalClicks: number;
  criticalHits: number;
  goldenCelebsCaught: number;
  comboHighScore: number;
  prestigeLevel: number;
  timePlayedSeconds: number;
}

interface RandomEvent {
  id: string;
  message: string;
  effect: () => void;
  weight: number;
}

interface GoldenCelebration {
  id: string;
  x: number;
  y: number;
  value: number;
  createdAt: number;
}

interface PartyGuest {
  id: string;
  name: string;
  emoji: string;
  message: string;
  gift: number;
}

interface Weather {
  type: 'sunny' | 'rainy' | 'stormy' | 'snowy' | 'windy' | 'foggy';
  emoji: string;
  effect: string;
  multiplier: number;
}

interface FactoryProduction {
  targetUpgradeId: string;
  progress: number;
  resources: {
    confetti: number;
    energy: number;
    happiness: number;
  };
}

const FORTUNES: string[] = [
  "You will find a bug in production soon... oh wait, wrong fortune!",
  "Your code will compile on the first try.",
  "Beware of semicolons in unexpected places.",
  "A mysterious stranger will star your GitHub repo.",
  "Your next deploy will be on a Friday at 5pm.",
  "The universe is just a giant callback function.",
  "Tomorrow you will remember to fetch before pulling.",
  "Your debugging skills will be tested by a missing comma.",
  "The answer you seek is in the console.log.",
  "You can't spell celebration without AI."
];

const PARTY_GUESTS: Omit<PartyGuest, 'id'>[] = [
  { name: 'DJ Byte', emoji: '🎧', message: 'Dropping sick beats!', gift: 250 },
  { name: 'Professor Code', emoji: '👨‍🏫', message: 'Teaching you optimization!', gift: 500 },
  { name: 'Captain Confetti', emoji: '🦸', message: 'Here to save the party!', gift: 1000 },
  { name: 'Pizza Delivery', emoji: '🍕', message: 'Special delivery!', gift: 300 },
  { name: 'Party Penguin', emoji: '🐧', message: 'Waddle waddle!', gift: 150 },
  { name: 'Disco Ball', emoji: '🪩', message: 'Making everything sparkle!', gift: 400 },
  { name: 'Cake Boss', emoji: '🎂', message: 'Let them eat cake!', gift: 350 },
  { name: 'Balloon Artist', emoji: '🎈', message: 'Making balloon animals!', gift: 200 },
  { name: 'Magician', emoji: '🎩', message: 'Watch this trick!', gift: 800 },
  { name: 'Time Traveler', emoji: '⏱️', message: 'From the future!', gift: 2000 },
];

const WEATHERS: Weather[] = [
  { type: 'sunny', emoji: '☀️', effect: 'Everything feels bright!', multiplier: 1.2 },
  { type: 'rainy', emoji: '🌧️', effect: 'Celebrations flow like rain!', multiplier: 1.5 },
  { type: 'stormy', emoji: '⛈️', effect: 'Electric energy!', multiplier: 2.0 },
  { type: 'snowy', emoji: '❄️', effect: 'Celebrations frozen in time!', multiplier: 0.8 },
  { type: 'windy', emoji: '💨', effect: 'Confetti flies everywhere!', multiplier: 1.3 },
  { type: 'foggy', emoji: '🌫️', effect: 'Mysterious vibes...', multiplier: 0.9 },
];

const MOODS = [
  { emoji: '😊', name: 'Happy', bonus: 1.1, message: 'Feeling great!' },
  { emoji: '😎', name: 'Cool', bonus: 1.2, message: 'Too cool for school!' },
  { emoji: '🤪', name: 'Crazy', bonus: 1.5, message: 'Wild energy!' },
  { emoji: '😴', name: 'Sleepy', bonus: 0.8, message: 'Need coffee...' },
  { emoji: '🤔', name: 'Thoughtful', bonus: 1.0, message: 'Hmm...' },
  { emoji: '🥳', name: 'Party Mode', bonus: 2.0, message: 'PARTY TIME!' },
];

const UPGRADES: Omit<Upgrade, 'owned'>[] = [
  { id: 'ryan', name: 'Ryan', description: 'My college roommate. Celebrates once per second.', cost: 10, cps: 1 },
  { id: 'neural-networker', name: 'Neural Networker', description: 'Deep-learning model trained to exchange LinkedIns.', cost: 50, cps: 5 },
  { id: 'party-bot', name: 'Party Bot', description: 'AI celebration agent, built with LangGraph.', cost: 200, cps: 10 },
  { id: 'microparty-orchestrator', name: 'Microparty Orchestrator', description: 'Deploys micro-parties across every node with flawless uptime.', cost: 500, cps: 20 },
  { id: 'elastic-celebration-service', name: 'Elastic Celebration Service', description: 'Auto-scales celebrations based on user load.', cost: 2000, cps: 50 },
  { id: 'event-loop', name: 'Event Loop', description: 'Dispatches callback after callback of confetti.', cost: 10000, cps: 200 },
  { id: 'quantum-compartier', name: 'Quantum Compartier', description: 'Turns one celebration into many (if left unobserved).', cost: 100000, cps: 1000 },
  { id: 'meme-generator', name: 'Meme Generator', description: 'Viral content creates celebrations automatically.', cost: 500000, cps: 5000 },
  { id: 'celebration-singularity', name: 'Celebration Singularity', description: 'A black hole of pure party energy.', cost: 5000000, cps: 25000 },
  { id: 'celebration-factory', name: 'Celebration Factory', description: 'An automated mega-facility that produces upgrades! Play minigames to gather resources and manufacture upgrades.', cost: 10000000, cps: 0 },
];

// Resource requirements for each upgrade (Whack-a-Mole, Memory, Reaction)
const UPGRADE_RESOURCE_COSTS: Record<string, [number, number, number]> = {
  'ryan': [10, 5, 5],
  'neural-networker': [30, 20, 10],
  'party-bot': [50, 40, 30],
  'microparty-orchestrator': [80, 60, 50],
  'elastic-celebration-service': [120, 100, 80],
  'event-loop': [200, 150, 120],
  'quantum-compartier': [350, 300, 250],
  'meme-generator': [600, 500, 400],
  'celebration-singularity': [1000, 800, 600],
};

const POWER_UPS: PowerUp[] = [
  { id: 'frenzy', name: 'Celebration Frenzy', description: '7x click power!', duration: 15000, multiplier: 7, effect: 'click', emoji: '🔥' },
  { id: 'lucky', name: 'Lucky Streak', description: '2x all production!', duration: 20000, multiplier: 2, effect: 'production', emoji: '🍀' },
  { id: 'dragon', name: 'Dragon Mode', description: '10x click power!', duration: 10000, multiplier: 10, effect: 'click', emoji: '🐉' },
  { id: 'storm', name: 'Confetti Storm', description: '5x everything!', duration: 8000, multiplier: 5, effect: 'all', emoji: '⚡' },
  { id: 'elder', name: 'Elder Blessing', description: 'Clicks give +777!', duration: 30000, multiplier: 777, effect: 'bonus', emoji: '✨' },
  { id: 'clover', name: 'Four Leaf Clover', description: '100% crit chance!', duration: 12000, multiplier: 1, effect: 'crit', emoji: '🍀' },
];

const UPGRADES_STORAGE_KEY = 'personal-website::celebrate-upgrades';
const LOCAL_COUNT_STORAGE_KEY = 'personal-website::celebrate-local-count';
const LAST_SYNCED_COUNT_STORAGE_KEY = 'personal-website::celebrate-last-synced';
const STATS_STORAGE_KEY = 'personal-website::celebrate-stats';
const ACHIEVEMENTS_STORAGE_KEY = 'personal-website::celebrate-achievements';
const PRESTIGE_STORAGE_KEY = 'personal-website::celebrate-prestige';

const loadUpgrades = (): Upgrade[] => {
  try {
    const stored = localStorage.getItem(UPGRADES_STORAGE_KEY);
    if (!stored) {
      return UPGRADES.map(u => ({ ...u, owned: 0 }));
    }
    
    const parsed = JSON.parse(stored) as Upgrade[];
    // Merge with UPGRADES to ensure we have all upgrades (in case new ones were added)
    return UPGRADES.map(u => {
      const saved = parsed.find(p => p.id === u.id);
      return saved ? saved : { ...u, owned: 0 };
    });
  } catch (error) {
    console.warn('Failed to load upgrades from storage', error);
    return UPGRADES.map(u => ({ ...u, owned: 0 }));
  }
};

const loadLocalCount = (globalCount: number): number => {
  try {
    const stored = localStorage.getItem(LOCAL_COUNT_STORAGE_KEY);
    if (!stored) {
      return globalCount;
    }
    
    const parsed = parseFloat(stored);
    return parsed;
  } catch (error) {
    console.warn('Failed to load local count from storage', error);
    return globalCount;
  }
};

const loadLastSyncedCount = (globalCount: number): number => {
  try {
    const stored = localStorage.getItem(LAST_SYNCED_COUNT_STORAGE_KEY);
    if (!stored) {
      return globalCount;
    }
    
    return parseFloat(stored);
  } catch (error) {
    console.warn('Failed to load last synced count from storage', error);
    return globalCount;
  }
};

const loadStats = (): GameStats => {
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (!stored) {
      return { totalClicks: 0, criticalHits: 0, goldenCelebsCaught: 0, comboHighScore: 0, prestigeLevel: 0, timePlayedSeconds: 0 };
    }
    return JSON.parse(stored) as GameStats;
  } catch (error) {
    console.warn('Failed to load stats from storage', error);
    return { totalClicks: 0, criticalHits: 0, goldenCelebsCaught: 0, comboHighScore: 0, prestigeLevel: 0, timePlayedSeconds: 0 };
  }
};

const loadPrestigeLevel = (): number => {
  try {
    const stored = localStorage.getItem(PRESTIGE_STORAGE_KEY);
    if (!stored) {
      return 0;
    }
    return parseInt(stored, 10);
  } catch (error) {
    console.warn('Failed to load prestige level from storage', error);
    return 0;
  }
};

const createAchievements = (): Achievement[] => [
  { id: 'first-click', name: 'Getting Started', description: 'Make your first click', reward: 10, unlocked: false, condition: (stats) => stats.totalClicks >= 1 },
  { id: 'hundred-clicks', name: 'Warming Up', description: 'Click 100 times', reward: 100, unlocked: false, condition: (stats) => stats.totalClicks >= 100 },
  { id: 'thousand-clicks', name: 'Click Master', description: 'Click 1,000 times', reward: 1000, unlocked: false, condition: (stats) => stats.totalClicks >= 1000 },
  { id: 'first-crit', name: 'Critical Hit!', description: 'Get your first critical hit', reward: 50, unlocked: false, condition: (stats) => stats.criticalHits >= 1 },
  { id: 'crit-master', name: 'Crit Master', description: 'Get 100 critical hits', reward: 5000, unlocked: false, condition: (stats) => stats.criticalHits >= 100 },
  { id: 'golden-hunter', name: 'Golden Hunter', description: 'Catch 10 golden celebrations', reward: 2000, unlocked: false, condition: (stats) => stats.goldenCelebsCaught >= 10 },
  { id: 'combo-5', name: 'Combo Starter', description: 'Achieve a 5x combo', reward: 500, unlocked: false, condition: (stats) => stats.comboHighScore >= 5 },
  { id: 'combo-20', name: 'Combo Expert', description: 'Achieve a 20x combo', reward: 5000, unlocked: false, condition: (stats) => stats.comboHighScore >= 20 },
  { id: 'combo-50', name: 'Combo Legend', description: 'Achieve a 50x combo', reward: 50000, unlocked: false, condition: (stats) => stats.comboHighScore >= 50 },
  { id: 'prestige-1', name: 'First Prestige', description: 'Prestige for the first time', reward: 10000, unlocked: false, condition: (stats) => stats.prestigeLevel >= 1 },
  { id: 'dedicated', name: 'Dedicated Player', description: 'Play for 1 hour total', reward: 10000, unlocked: false, condition: (stats) => stats.timePlayedSeconds >= 3600 },
];

const loadAchievements = (): Achievement[] => {
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    const fresh = createAchievements();
    if (!stored) {
      return fresh;
    }
    const saved = JSON.parse(stored) as Achievement[];
    // Merge with fresh list but keep the condition functions from fresh
    return fresh.map(a => {
      const savedAch = saved.find(s => s.id === a.id);
      return savedAch ? { ...a, unlocked: savedAch.unlocked } : a;
    });
  } catch (error) {
    console.warn('Failed to load achievements from storage', error);
    return createAchievements();
  }
};

const CelebratePage: React.FC = () => {
  const { registerCelebration, celebrateCount, unlockBadge } = useBadges();
  const [localCount, setLocalCount] = useState(() => loadLocalCount(celebrateCount));
  const [upgrades, setUpgrades] = useState<Upgrade[]>(loadUpgrades);
  const [activePowerUps, setActivePowerUps] = useState<Array<PowerUp & {endTime: number}>>([]);
  const [hoveredPowerUpId, setHoveredPowerUpId] = useState<string | null>(null);
  const [goldenCelebs, setGoldenCelebs] = useState<GoldenCelebration[]>([]);
  const [stats, setStats] = useState<GameStats>(loadStats);
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements);
  const [prestigeLevel, setPrestigeLevel] = useState(loadPrestigeLevel);
  const [combo, setCombo] = useState(0);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const [clickPower] = useState(1);
  const [confettiColors, setConfettiColors] = useState(['#00cccc', '#0088cc', '#00cc66', '#ff6b6b', '#ffd93d']);
  const [backgroundEffect, setBackgroundEffect] = useState<string | null>(null);
  
  // New wild features
  const [fortune, setFortune] = useState<string | null>(null);
  const [partyGuest, setPartyGuest] = useState<PartyGuest | null>(null);
  const [weather, setWeather] = useState<Weather>(WEATHERS[0]);
  const [currentMood, setCurrentMood] = useState(MOODS[0]);
  const [konamiProgress, setKonamiProgress] = useState<string[]>([]);
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [clickPattern, setClickPattern] = useState<number[]>([]);
  
  // Factory & Minigames
  const [showFactory, setShowFactory] = useState(false);
  const [factoryProduction, setFactoryProduction] = useState<FactoryProduction>({
    targetUpgradeId: 'ryan',
    progress: 0,
    resources: { confetti: 0, energy: 0, happiness: 0 } // Start with 0, earn through minigames
  });
  const [activeMinigame, setActiveMinigame] = useState<string | null>(null);
  const [whackAMoleGame, setWhackAMoleGame] = useState({ score: 0, timeLeft: 30, moles: Array(9).fill(false) });
  const [memoryGame, setMemoryGame] = useState({ flipped: [] as number[], matched: [] as number[], cards: [] as string[] });
  const [reactionGame, setReactionGame] = useState({ waiting: true, startTime: 0, bestTime: Infinity });
  
  const autoClickIntervalRef = useRef<number | null>(null);
  const lastSyncedCount = useRef(loadLastSyncedCount(celebrateCount));
  const comboTimerRef = useRef<number | null>(null);
  const gameTimeIntervalRef = useRef<number | null>(null);
  const randomEventIntervalRef = useRef<number | null>(null);
  const goldenCelebTimerRef = useRef<number | null>(null);

  // Helper to update lastSyncedCount and save to localStorage
  const updateLastSyncedCount = (value: number) => {
    lastSyncedCount.current = value;
    localStorage.setItem(LAST_SYNCED_COUNT_STORAGE_KEY, value.toString());
  };

  // Save data effects
  useEffect(() => {
    localStorage.setItem(UPGRADES_STORAGE_KEY, JSON.stringify(upgrades));
  }, [upgrades]);

  useEffect(() => {
    localStorage.setItem(LOCAL_COUNT_STORAGE_KEY, localCount.toString());
  }, [localCount]);

  useEffect(() => {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem(PRESTIGE_STORAGE_KEY, prestigeLevel.toString());
  }, [prestigeLevel]);

  // Track game time
  useEffect(() => {
    gameTimeIntervalRef.current = window.setInterval(() => {
      setStats(prev => ({ ...prev, timePlayedSeconds: prev.timePlayedSeconds + 1 }));
    }, 1000);

    return () => {
      if (gameTimeIntervalRef.current) {
        window.clearInterval(gameTimeIntervalRef.current);
      }
    };
  }, []);

  // Check achievements
  useEffect(() => {
    achievements.forEach((ach, index) => {
      if (!ach.unlocked && ach.condition(stats)) {
        setAchievements(prev => {
          const updated = [...prev];
          updated[index] = { ...ach, unlocked: true };
          return updated;
        });
        setLocalCount(prev => prev + ach.reward);
        setShowAchievement(ach);
        setTimeout(() => setShowAchievement(null), 4000);
      }
    });
  }, [stats, achievements]);

  // Unlock badge on mount
  useEffect(() => {
    unlockBadge('partySeeker');
  }, [unlockBadge]);

  // Sync with global celebration count
  useEffect(() => {
    const diff = celebrateCount - lastSyncedCount.current;
    if (diff > 0) {
      setLocalCount(prev => prev + diff);
      updateLastSyncedCount(celebrateCount);
    }
  }, [celebrateCount]);

  // Calculate multipliers from power-ups and prestige
  const getClickMultiplier = () => {
    let mult = 1 + (prestigeLevel * 0.1); // +10% per prestige
    activePowerUps.forEach(pu => {
      if (pu.effect === 'click' || pu.effect === 'all') {
        mult *= pu.multiplier || 1;
      }
    });
    return mult;
  };

  const getProductionMultiplier = () => {
    let mult = 1 + (prestigeLevel * 0.05); // +5% per prestige
    activePowerUps.forEach(pu => {
      if (pu.effect === 'production' || pu.effect === 'all') {
        mult *= pu.multiplier || 1;
      }
    });
    return mult;
  };

  const getBonusFromPowerUps = () => {
    let bonus = 0;
    activePowerUps.forEach(pu => {
      if (pu.effect === 'bonus') {
        bonus += pu.multiplier || 0;
      }
    });
    return bonus;
  };

  const hasCritPowerUp = () => {
    return activePowerUps.some(pu => pu.effect === 'crit');
  };

  // Calculate total celebrations per second with production multiplier
  const totalCPS = upgrades.reduce((sum, upgrade) => sum + (upgrade.cps * upgrade.owned), 0) * getProductionMultiplier();

  // Auto-click based on upgrades
  useEffect(() => {
    if (totalCPS === 0) {
      if (autoClickIntervalRef.current !== null) {
        window.clearInterval(autoClickIntervalRef.current);
        autoClickIntervalRef.current = null;
      }
      return;
    }

    autoClickIntervalRef.current = window.setInterval(() => {
      const increment = totalCPS / 10;
      setLocalCount(prev => prev + increment);
      registerCelebration();
      updateLastSyncedCount(lastSyncedCount.current + 1);
    }, 100);

    return () => {
      if (autoClickIntervalRef.current !== null) {
        window.clearInterval(autoClickIntervalRef.current);
      }
    };
  }, [totalCPS, registerCelebration]);

  // Clean up expired power-ups
  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      setActivePowerUps(prev => prev.filter(pu => pu.endTime > now));
    }, 100);

    return () => window.clearInterval(interval);
  }, []);

  // Weather system - changes every 2-5 minutes
  useEffect(() => {
    const changeWeather = () => {
      const newWeather = WEATHERS[Math.floor(Math.random() * WEATHERS.length)];
      setWeather(newWeather);
      setEventMessage(`${newWeather.emoji} Weather changed: ${newWeather.effect}`);
      setTimeout(() => setEventMessage(null), 3000);
    };

    const scheduleWeatherChange = () => {
      const delay = 120000 + Math.random() * 180000; // 2-5 minutes
      return window.setTimeout(() => {
        changeWeather();
      }, delay);
    };

    const timer = scheduleWeatherChange();
    return () => window.clearTimeout(timer);
  }, [weather]);

  // Mood system - changes every 1-3 minutes
  useEffect(() => {
    const changeMood = () => {
      const newMood = MOODS[Math.floor(Math.random() * MOODS.length)];
      setCurrentMood(newMood);
      setEventMessage(`${newMood.emoji} Mood: ${newMood.message}`);
      setTimeout(() => setEventMessage(null), 2500);
    };

    const scheduleMoodChange = () => {
      const delay = 60000 + Math.random() * 120000; // 1-3 minutes
      return window.setTimeout(() => {
        changeMood();
      }, delay);
    };

    const timer = scheduleMoodChange();
    return () => window.clearTimeout(timer);
  }, [currentMood]);

  // Party guest system - random visitors
  useEffect(() => {
    const guestVisit = () => {
      const guest = { ...PARTY_GUESTS[Math.floor(Math.random() * PARTY_GUESTS.length)], id: `guest-${Date.now()}` };
      setPartyGuest(guest);
      setLocalCount(prev => prev + guest.gift);
      setTimeout(() => setPartyGuest(null), 5000);
    };

    const scheduleGuest = () => {
      const delay = 45000 + Math.random() * 90000; // 45-135 seconds
      return window.setTimeout(() => {
        guestVisit();
      }, delay);
    };

    const timer = scheduleGuest();
    return () => window.clearTimeout(timer);
  }, [partyGuest]);

  // Fortune cookie system - appears on certain click counts
  useEffect(() => {
    if (stats.totalClicks > 0 && stats.totalClicks % 200 === 0 && !fortune) {
      const randomFortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      setFortune(randomFortune);
      setTimeout(() => setFortune(null), 6000);
    }
  }, [stats.totalClicks, fortune]);

  // Konami code listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
      const newProgress = [...konamiProgress, e.key];
      
      if (newProgress.length > konamiCode.length) {
        newProgress.shift();
      }
      
      setKonamiProgress(newProgress);
      
      if (newProgress.join(',') === konamiCode.join(',') && !secretUnlocked) {
        setSecretUnlocked(true);
        setEventMessage('🎮 KONAMI CODE UNLOCKED! You are a legend!');
        setLocalCount(prev => prev * 10);
        
        // Massive confetti celebration
        for (let i = 0; i < 20; i++) {
          setTimeout(() => {
    confetti({
              particleCount: 100,
              spread: 360,
              origin: { x: Math.random(), y: Math.random() },
              colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
            });
          }, i * 100);
        }
        
        setTimeout(() => setEventMessage(null), 4000);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [konamiProgress, secretUnlocked]);

  // Click pattern detector - detects rhythmic clicking
  useEffect(() => {
    if (clickPattern.length >= 5) {
      const intervals = [];
      for (let i = 1; i < clickPattern.length; i++) {
        intervals.push(clickPattern[i] - clickPattern[i - 1]);
      }
      
      // Check if intervals are roughly similar (rhythmic clicking)
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const isRhythmic = intervals.every(interval => Math.abs(interval - avgInterval) < 100);
      
      if (isRhythmic && avgInterval > 200 && avgInterval < 600) {
        setEventMessage('🎵 Perfect rhythm! Bonus celebrations!');
        setLocalCount(prev => prev + 500);
        setTimeout(() => setEventMessage(null), 2000);
        setClickPattern([]);
      }
    }
  }, [clickPattern]);

  // Factory production system
  useEffect(() => {
    const factoryUpgrade = upgrades.find(u => u.id === 'celebration-factory');
    if (!factoryUpgrade || factoryUpgrade.owned === 0) return;

    const interval = window.setInterval(() => {
      setFactoryProduction(prev => {
        const prestigeBonus = 1 + (prestigeLevel * 0.25); // +25% per prestige
        const productionRate = 1.0 * prestigeBonus;
        const newProgress = prev.progress + productionRate;
        
        const resourceCosts = UPGRADE_RESOURCE_COSTS[prev.targetUpgradeId] || [10, 10, 10];
        const [requiredConfetti, requiredEnergy, requiredHappiness] = resourceCosts;
        
        // Check if we have enough resources to produce
        const hasResources = 
          prev.resources.confetti >= requiredConfetti &&
          prev.resources.energy >= requiredEnergy &&
          prev.resources.happiness >= requiredHappiness;
        
        // Check if we completed an upgrade
        if (newProgress >= 100 && hasResources) {
          setUpgrades(prevUpgrades => 
            prevUpgrades.map(u =>
              u.id === prev.targetUpgradeId ? { ...u, owned: u.owned + 1 } : u
            )
          );
          setEventMessage(`🏭 Factory produced: ${UPGRADES.find(u => u.id === prev.targetUpgradeId)?.name}!`);
          setTimeout(() => setEventMessage(null), 3000);
          
          // Consume resources
          return {
            ...prev,
            progress: 0,
            resources: {
              confetti: prev.resources.confetti - requiredConfetti,
              energy: prev.resources.energy - requiredEnergy,
              happiness: prev.resources.happiness - requiredHappiness,
            },
          };
        }
        
        // If no resources, pause production
        if (!hasResources) {
          return prev;
        }
        
        return { ...prev, progress: newProgress };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [upgrades, prestigeLevel]);

  // Random events system
  useEffect(() => {
    const triggerRandomEvent = () => {
      const events: RandomEvent[] = [
        {
          id: 'meteor',
          message: '☄️ Meteor shower! +1000 celebrations!',
          effect: () => setLocalCount(prev => prev + 1000),
          weight: 1,
        },
        {
          id: 'rainbow',
          message: '🌈 Rainbow appeared! Colors changed!',
          effect: () => {
            const newColors = [
              ['#ff0080', '#ff8c00', '#ffff00', '#00ff00', '#0080ff'],
              ['#ff1493', '#ff69b4', '#ffc0cb', '#ffb6c1', '#ff69b4'],
              ['#8b00ff', '#ff00ff', '#ff1493', '#00ffff', '#00ff00'],
              ['#ffd700', '#ffff00', '#fff68f', '#fafad2', '#fffacd'],
            ];
            setConfettiColors(newColors[Math.floor(Math.random() * newColors.length)]);
          },
          weight: 2,
        },
        {
          id: 'aliens',
          message: '👽 Aliens visited! They brought gifts!',
          effect: () => {
            setLocalCount(prev => prev + (totalCPS * 60));
            spawnRandomPowerUp();
          },
          weight: 1,
        },
        {
          id: 'timewarp',
          message: '⏰ Time warp! +5 minutes of production!',
          effect: () => {
            setLocalCount(prev => prev + (totalCPS * 300));
          },
          weight: 1,
        },
        {
          id: 'lottery',
          message: '🎰 Jackpot! Triple your current celebrations!',
          effect: () => setLocalCount(prev => prev * 3),
          weight: 0.5,
        },
        {
          id: 'ghost',
          message: '👻 Spooky ghost stole some celebrations!',
          effect: () => setLocalCount(prev => Math.max(0, prev * 0.95)),
          weight: 1,
        },
        {
          id: 'santa',
          message: '🎅 Santa came early! Ho ho ho!',
          effect: () => {
            setLocalCount(prev => prev + 10000);
            spawnGoldenCeleb();
          },
          weight: 0.5,
        },
        {
          id: 'dragon',
          message: '🐉 A dragon blessed you with power!',
          effect: () => spawnRandomPowerUp(),
          weight: 2,
        },
        {
          id: 'earthquake',
          message: '🌍 Earthquake! Everything is shaking!',
          effect: () => {
            setBackgroundEffect('shake');
            setTimeout(() => setBackgroundEffect(null), 2000);
          },
          weight: 1,
        },
        {
          id: 'midas',
          message: '✨ Midas touch! Everything turns to gold!',
          effect: () => {
            for (let i = 0; i < 3; i++) {
              setTimeout(() => spawnGoldenCeleb(), i * 500);
            }
          },
          weight: 0.5,
        },
      ];

      // Weighted random selection
      const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
      let random = Math.random() * totalWeight;
      let selectedEvent: RandomEvent | null = null;

      for (const event of events) {
        random -= event.weight;
        if (random <= 0) {
          selectedEvent = event;
          break;
        }
      }

      if (selectedEvent) {
        selectedEvent.effect();
        setEventMessage(selectedEvent.message);
        setTimeout(() => setEventMessage(null), 3000);
      }
    };

    // Random event every 30-90 seconds
    const scheduleNext = () => {
      const delay = 30000 + Math.random() * 60000;
      randomEventIntervalRef.current = window.setTimeout(() => {
        triggerRandomEvent();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (randomEventIntervalRef.current) {
        window.clearTimeout(randomEventIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCPS]);

  // Golden celebration spawner
  const spawnGoldenCeleb = useCallback(() => {
    const id = `golden-${Date.now()}-${Math.random()}`;
    const x = 10 + Math.random() * 70; // 10% to 80% of width
    const y = 20 + Math.random() * 60; // 20% to 80% of height
    const value = Math.floor(100 + Math.random() * 900) * (prestigeLevel + 1);
    
    setGoldenCelebs(prev => [...prev, { id, x, y, value, createdAt: Date.now() }]);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      setGoldenCelebs(prev => prev.filter(gc => gc.id !== id));
    }, 10000);
  }, [prestigeLevel]);

  // Spawn golden celebrations periodically
  useEffect(() => {
    const scheduleGolden = () => {
      const delay = 15000 + Math.random() * 25000; // 15-40 seconds
      goldenCelebTimerRef.current = window.setTimeout(() => {
        spawnGoldenCeleb();
        scheduleGolden();
      }, delay);
    };

    scheduleGolden();

    return () => {
      if (goldenCelebTimerRef.current) {
        window.clearTimeout(goldenCelebTimerRef.current);
      }
    };
  }, [spawnGoldenCeleb]);

  const spawnRandomPowerUp = useCallback(() => {
    const powerUp = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
    const endTime = Date.now() + powerUp.duration;
    setActivePowerUps(prev => [...prev, { ...powerUp, endTime }]);
  }, []);

  const incrementCombo = () => {
    setCombo(prev => {
      const newCombo = prev + 1;
      setStats(s => ({ ...s, comboHighScore: Math.max(s.comboHighScore, newCombo) }));
      return newCombo;
    });

    // Reset combo timer
    if (comboTimerRef.current) {
      window.clearTimeout(comboTimerRef.current);
    }
    comboTimerRef.current = window.setTimeout(() => {
      setCombo(0);
    }, 2000); // Combo resets after 2 seconds of no clicking
  };

  const calculateClickValue = () => {
    const basePower = clickPower;
    const comboBonus = combo * 0.001; // +0.1% per combo level
    const clickMult = getClickMultiplier();
    const bonus = getBonusFromPowerUps();
    
    // Check for critical hit
    const critChance = hasCritPowerUp() ? 1.0 : 0.1 + (prestigeLevel * 0.01); // Base 10% crit chance + 1% per prestige
    const isCrit = Math.random() < critChance;
    
    if (isCrit) {
      setStats(prev => ({ ...prev, criticalHits: prev.criticalHits + 1 }));
    }
    
    const critMult = isCrit ? (2 + prestigeLevel * 0.5) : 1; // Crit multiplier scales with prestige
    
    return Math.floor((basePower * (1 + comboBonus) * clickMult * critMult) + bonus);
  };

  const celebrate = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const value = calculateClickValue() * weather.multiplier * currentMood.bonus;
    registerCelebration();
    setLocalCount(prev => prev + value);
    updateLastSyncedCount(lastSyncedCount.current + 1);
    setStats(prev => ({ ...prev, totalClicks: prev.totalClicks + 1 }));
    incrementCombo();
    triggerConfetti(event);
    
    // Track click pattern for rhythm detection
    setClickPattern(prev => {
      const newPattern = [...prev, Date.now()];
      if (newPattern.length > 10) newPattern.shift();
      return newPattern;
    });

    // Small chance to spawn power-up on click
    if (Math.random() < 0.01) { // 1% chance
      spawnRandomPowerUp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerCelebration, clickPower, combo, prestigeLevel, activePowerUps, weather, currentMood]);

  const triggerConfetti = (event: React.MouseEvent<HTMLButtonElement> | MouseEvent) => {
    const clientX = 'clientX' in event ? event.clientX : window.innerWidth / 2;
    const clientY = 'clientY' in event ? event.clientY : window.innerHeight / 2;
    
    const canvasX = clientX / window.innerWidth;
    const canvasY = clientY / window.innerHeight;

    const particleCount = Math.min(30 + combo * 2, 100); // More confetti with combo
    confetti({
      particleCount,
      spread: 50 + combo * 2,
      origin: { x: canvasX, y: canvasY },
      colors: confettiColors,
    });
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

  const handleGoldenClick = (golden: GoldenCelebration) => {
    setLocalCount(prev => prev + golden.value);
    setGoldenCelebs(prev => prev.filter(g => g.id !== golden.id));
    setStats(prev => ({ ...prev, goldenCelebsCaught: prev.goldenCelebsCaught + 1 }));
    
    // Special confetti for golden
    confetti({
      particleCount: 100,
      spread: 160,
      origin: { x: golden.x / 100, y: golden.y / 100 },
      colors: ['#FFD700', '#FFA500', '#FFFF00'],
    });

    // Chance to spawn power-up
    if (Math.random() < 0.3) {
      spawnRandomPowerUp();
    }
  };

  const handlePrestige = () => {
    const requiredForPrestige = 1000000 * Math.pow(10, prestigeLevel);
    
    if (localCount >= requiredForPrestige) {
      const confirmed = window.confirm(
        `Prestige and reset? You'll get:\n- +10% click power permanently\n- +5% production permanently\n- +25% factory speed permanently\n- +1% crit chance permanently\n- Better crit multiplier\n\nYou'll lose all celebrations, upgrades, and factory resources!`
      );
      
      if (confirmed) {
        setPrestigeLevel(prev => prev + 1);
        setLocalCount(0);
        setUpgrades(UPGRADES.map(u => ({ ...u, owned: 0 })));
        setStats(prev => ({ ...prev, prestigeLevel: prev.prestigeLevel + 1 }));
        
        // Reset factory resources but keep workers and efficiency
        setFactoryProduction(prev => ({
          ...prev,
          progress: 0,
          resources: { confetti: 0, energy: 0, happiness: 0 },
        }));
        
        // Celebration fireworks
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            confetti({
              particleCount: 200,
              spread: 180,
              origin: { x: Math.random(), y: Math.random() * 0.8 },
            });
          }, i * 200);
        }
      }
    }
  };

  const formatNumber = (num: number) => {
    const rounded = Math.floor(num);
    if (rounded >= 1e12) return (rounded / 1e12).toFixed(2) + 'T';
    if (rounded >= 1e9) return (rounded / 1e9).toFixed(2) + 'B';
    if (rounded >= 1e6) return (rounded / 1e6).toFixed(2) + 'M';
    if (rounded >= 1e3) return (rounded / 1e3).toFixed(2) + 'K';
    return rounded.toString();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  // Minigame: Whack-a-Mole - Rewards Confetti
  const startWhackAMole = () => {
    setShowFactory(false); // Close factory when starting minigame
    setActiveMinigame('whack-a-mole');
    setWhackAMoleGame({ score: 0, timeLeft: 15, moles: Array(9).fill(false) });
    
    const gameInterval = setInterval(() => {
      setWhackAMoleGame(prev => {
        if (prev.timeLeft <= 0) {
          clearInterval(gameInterval);
          const baseReward = 100;
          const performanceBonus = Math.floor(prev.score * 1.5); // Extra bonus for high scores
          const prestigeMultiplier = 1 + (prestigeLevel * 0.25); // +25% per prestige
          const confettiReward = Math.floor((baseReward * prev.score + performanceBonus) * prestigeMultiplier);
          setFactoryProduction(p => ({
            ...p,
            resources: { ...p.resources, confetti: p.resources.confetti + confettiReward }
          }));
          setEventMessage(`🎮 Whack-a-Mole complete! +${confettiReward} 🎊 Confetti!`);
          setTimeout(() => {
            setEventMessage(null);
            setActiveMinigame(null);
            setShowFactory(true); // Reopen factory after game
          }, 2000);
          return prev;
        }
        
        const newMoles = Array(9).fill(false);
        const randomIndex = Math.floor(Math.random() * 9);
        newMoles[randomIndex] = true;
        
        return { ...prev, timeLeft: prev.timeLeft - 1, moles: newMoles };
      });
    }, 750); // Lower this for faster mole speed
  };

  const whackMole = (index: number) => {
    setWhackAMoleGame(prev => {
      if (prev.moles[index]) {
        return { ...prev, score: prev.score + 1 };
      }
      return prev;
    });
  };

  // Minigame: Memory Match - Rewards Energy
  const startMemoryGame = () => {
    setShowFactory(false); // Close factory when starting minigame
    const emojis = ['🎉', '🎊', '🎈', '🎁', '🎂', '🎆', '🎇', '✨'];
    const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    setMemoryGame({ flipped: [], matched: [], cards });
    setActiveMinigame('memory');
  };

  const flipCard = (index: number) => {
    setMemoryGame(prev => {
      if (prev.flipped.length >= 2 || prev.matched.includes(index) || prev.flipped.includes(index)) {
        return prev;
      }
      
      const newFlipped = [...prev.flipped, index];
      
      if (newFlipped.length === 2) {
        const [first, second] = newFlipped;
        if (prev.cards[first] === prev.cards[second]) {
          const newMatched = [...prev.matched, first, second];
          if (newMatched.length === 16) {
            // Calculate performance-based reward (fewer moves = more energy)
            const totalFlips = prev.flipped.length / 2; // Rough estimate of moves
            const baseReward = 1000;
            const performanceBonus = Math.max(0, 1000 - totalFlips * 5); // Bonus for efficiency
            const prestigeMultiplier = 1 + (prestigeLevel * 0.25); // +25% per prestige
            const energyReward = Math.floor((baseReward + performanceBonus) * prestigeMultiplier);
            setFactoryProduction(p => ({
              ...p,
              resources: { ...p.resources, energy: p.resources.energy + energyReward }
            }));
            setEventMessage(`🎮 Memory Match complete! +${energyReward} ⚡ Energy!`);
            setTimeout(() => {
              setEventMessage(null);
              setActiveMinigame(null);
              setShowFactory(true); // Reopen factory after game
            }, 2000);
          }
          return { ...prev, flipped: [], matched: newMatched };
        }
        setTimeout(() => {
          setMemoryGame(p => ({ ...p, flipped: [] }));
        }, 1000);
      }
      
      return { ...prev, flipped: newFlipped };
    });
  };

  // Minigame: Reaction Test - Rewards Happiness (😊 resource)
  const startReactionTest = () => {
    setShowFactory(false); // Close factory when starting minigame
    setActiveMinigame('reaction');
    setReactionGame({ waiting: true, startTime: 0, bestTime: reactionGame.bestTime });
    
    setTimeout(() => {
      setReactionGame(prev => ({ ...prev, waiting: false, startTime: Date.now() }));
    }, 2000 + Math.random() * 3000);
  };

  const clickReaction = () => {
    setReactionGame(prev => {
      if (prev.waiting) {
        setEventMessage('⚠️ Too early! Wait for green!');
        setTimeout(() => setEventMessage(null), 1500);
        return prev;
      }
      
      const reactionTime = Date.now() - prev.startTime;
      // Much more generous rewards based on reaction time
      let happinessReward: number;
      if (reactionTime < 200) {
        happinessReward = 800; // Lightning fast!
      } else if (reactionTime < 300) {
        happinessReward = 700; // Very fast
      } else if (reactionTime < 500) {
        happinessReward = 600; // Fast
      } else if (reactionTime < 800) {
        happinessReward = 500; // Good
      } else {
        happinessReward = 200; // Okay
      }
      
      // Apply prestige multiplier
      const prestigeMultiplier = 1 + (prestigeLevel * 0.25); // +25% per prestige
      happinessReward = Math.floor(happinessReward * prestigeMultiplier);
      
      setFactoryProduction(p => ({
        ...p,
        resources: { ...p.resources, happiness: p.resources.happiness + happinessReward }
      }));
      
      setEventMessage(`🎮 ${reactionTime}ms reaction! +${happinessReward} 😊 Happiness!`);
      setTimeout(() => {
        setEventMessage(null);
        setActiveMinigame(null);
        setShowFactory(true); // Reopen factory after game
      }, 2000);
      
      return { ...prev, bestTime: Math.min(prev.bestTime, reactionTime) };
    });
  };

  return (
    <div className={`celebrate-page ${backgroundEffect || ''} weather-${weather.type}`}>
      <BadgeOverlay />
      <Link to="/" className="back-button">← Back to Website</Link>
      
      {/* Weather Visual Effects */}
      {weather.type === 'rainy' && <div className="weather-rain"></div>}
      {weather.type === 'snowy' && <div className="weather-snow"></div>}
      {weather.type === 'stormy' && <div className="weather-storm"></div>}
      {weather.type === 'foggy' && <div className="weather-fog"></div>}
      {weather.type === 'windy' && <div className="weather-wind"></div>}
      
      {/* Minigames Overlay */}
      {activeMinigame && (
        <div className="minigame-overlay" onClick={() => {
          setActiveMinigame(null);
          // Check if factory is owned, if so reopen it
          if ((upgrades.find(u => u.id === 'celebration-factory')?.owned ?? 0) > 0) {
            setShowFactory(true);
          }
        }}>
          <div className="minigame-modal" onClick={(e) => e.stopPropagation()}>
            {activeMinigame === 'whack-a-mole' && (
              <div className="whack-a-mole-game">
                <h2>🎮 Whack-a-Mole!</h2>
                <div className="game-info">
                  <span>Score: {whackAMoleGame.score}</span>
                  <span>Time: {whackAMoleGame.timeLeft}s</span>
                </div>
                <div className="mole-grid">
                  {whackAMoleGame.moles.map((isActive, i) => (
                    <div
                      key={i}
                      className={`mole-hole ${isActive ? 'mole-up' : ''}`}
                      onClick={() => whackMole(i)}
                    >
                      {isActive && '🐹'}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeMinigame === 'memory' && (
              <div className="memory-game">
                <h2>🎮 Memory Match!</h2>
                <div className="memory-grid">
                  {memoryGame.cards.map((card, i) => (
                    <div
                      key={i}
                      className={`memory-card ${memoryGame.flipped.includes(i) || memoryGame.matched.includes(i) ? 'flipped' : ''}`}
                      onClick={() => flipCard(i)}
                    >
                      {(memoryGame.flipped.includes(i) || memoryGame.matched.includes(i)) ? card : '?'}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeMinigame === 'reaction' && (
              <div className="reaction-game">
                <h2>🎮 Reaction Test!</h2>
                <div
                  className={`reaction-box ${reactionGame.waiting ? 'waiting' : 'go'}`}
                  onClick={clickReaction}
                >
                  {reactionGame.waiting ? 'Wait...' : 'CLICK NOW!'}
                </div>
                {reactionGame.bestTime < Infinity && (
                  <p>Best: {reactionGame.bestTime}ms</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Factory Management Modal */}
      {showFactory && (
        <div className="factory-overlay" onClick={() => setShowFactory(false)}>
          <div className="factory-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-factory" onClick={() => setShowFactory(false)}>✕</button>
            
            <div className="factory-content">
              <div className="factory-production">
                <h3>Current Production</h3>
                <div className="production-target">
                  <label>Target Upgrade:</label>
                  <select
                    value={factoryProduction.targetUpgradeId}
                    onChange={(e) => setFactoryProduction(prev => ({ ...prev, targetUpgradeId: e.target.value }))}
                  >
                    {UPGRADES.filter(u => u.cps > 0).map(upgrade => (
                      <option key={upgrade.id} value={upgrade.id}>{upgrade.name}</option>
                    ))}
                  </select>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${factoryProduction.progress}%` }}></div>
                  <span>{factoryProduction.progress.toFixed(1)}%</span>
                </div>
                <div className="resource-requirements">
                  {(() => {
                    const costs = UPGRADE_RESOURCE_COSTS[factoryProduction.targetUpgradeId] || [10, 10, 10];
                    return (
                      <p className="requirements-text">
                        Requires: {costs[0]} 🎊 {costs[1]} ⚡ {costs[2]} 😊
                      </p>
                    );
                  })()}
                </div>
              </div>
              
              <div className="factory-resources">
                <h3>Resources (Play Minigames to Collect)</h3>
                <div className="resource-item">
                  <span>🎊 Confetti: {factoryProduction.resources.confetti.toFixed(1)}</span>
                </div>
                <div className="resource-item">
                  <span>⚡ Energy: {factoryProduction.resources.energy.toFixed(1)}</span>
                </div>
                <div className="resource-item">
                  <span>😊 Happiness: {factoryProduction.resources.happiness.toFixed(1)}</span>
                </div>
              </div>

              {/* Minigames inside Factory */}
              <div className="factory-minigames">
                <h3>🎮 Play Minigames for Resources</h3>
                <button onClick={startWhackAMole} className="minigame-button">
                  🐹 Whack-a-Mole → 🎊 Confetti
                </button>
                <button onClick={startMemoryGame} className="minigame-button">
                  🎴 Memory Match → ⚡ Energy
                </button>
                <button onClick={startReactionTest} className="minigame-button">
                  ⚡ Reaction Test → 😊 Happiness
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Event Message */}
      {eventMessage && (
        <div className="event-message">
          {eventMessage}
        </div>
      )}

      {/* Achievement Popup */}
      {showAchievement && (
        <div className="achievement-popup">
          <h3>🏆 Achievement Unlocked!</h3>
          <p>{showAchievement.name}</p>
          <small>{showAchievement.description}</small>
          <div className="achievement-reward">+{formatNumber(showAchievement.reward)} celebrations</div>
        </div>
      )}

      {/* Golden Celebrations */}
      {goldenCelebs.map(golden => (
        <div
          key={golden.id}
          className="golden-celebration"
          style={{ left: `${golden.x}%`, top: `${golden.y}%` }}
          onClick={() => handleGoldenClick(golden)}
        >
          ⭐
          <span className="golden-value">+{formatNumber(golden.value)}</span>
        </div>
      ))}

      {/* Fortune Cookie */}
      {fortune && (
        <div className="fortune-cookie">
          🥠 <span>{fortune}</span>
        </div>
      )}

      {/* Party Guest */}
      {partyGuest && (
        <div className="party-guest">
          <div className="guest-emoji">{partyGuest.emoji}</div>
          <div className="guest-info">
            <strong>{partyGuest.name}</strong>
            <p>{partyGuest.message}</p>
            <span className="guest-gift">+{formatNumber(partyGuest.gift)} celebrations!</span>
          </div>
        </div>
      )}
      
      <div className="celebrate-container">
        <div className="celebrate-header">
          <h1>
            Party Module {prestigeLevel > 0 && <span className="prestige-badge">✨ Prestige {prestigeLevel}</span>}
          </h1>
          
          {/* Weather & Mood Display */}
          <div className="conditions-display">
            <div className="condition-item">
              <span className="condition-emoji">{weather.emoji}</span>
              <span className="condition-text">{weather.effect} ({(weather.multiplier * 100).toFixed(0)}%)</span>
            </div>
            <div className="condition-item">
              <span className="condition-emoji">{currentMood.emoji}</span>
              <span className="condition-text">{currentMood.name} ({(currentMood.bonus * 100).toFixed(0)}%)</span>
            </div>
          </div>

          <div className="celebrate-stats">
            <div className="stat-item">
              <span className="stat-label">Total Celebrations</span>
              <span className="stat-value">{formatNumber(localCount)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Per Second</span>
              <span className="stat-value">{formatNumber(totalCPS * weather.multiplier)}</span>
            </div>
            {combo > 0 && (
              <div className="stat-item combo-display">
                <span className="stat-label">Combo</span>
                <span className="stat-value">{combo}x</span>
          </div>
            )}
          </div>
          
          {/* Active Power-ups */}
          {activePowerUps.length > 0 && (
            <div className="active-powerups">
              {activePowerUps.map((pu, i) => (
                <div
                  key={`${pu.id}-${i}`}
                  className={`powerup-badge ${hoveredPowerUpId === pu.id ? 'is-hovered' : ''}`}
                  onMouseEnter={() => setHoveredPowerUpId(pu.id)}
                  onMouseLeave={() => setHoveredPowerUpId(null)}
                >
                  <span className="powerup-emoji">{pu.emoji}</span>
                  <div className="powerup-text">
                    {hoveredPowerUpId === pu.id ? (
                      <>
                        <strong>{pu.name}</strong>
                        <p>{pu.description}</p>
                      </>
                    ) : (
                      <>
                        <span className="powerup-name">{pu.name}</span>
                        <span className="powerup-timer">
                          {Math.ceil((pu.endTime - Date.now()) / 1000)}s
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="celebrate-main">
          <div className="clicker-section">
            <button
              className={`mega-celebrate-button ${combo > 10 ? 'combo-active' : ''}`}
              onClick={celebrate}
            >
              <span className="celebrate-text">Celebrate</span>
              <span className="celebrate-hint">
                {combo > 0 ? `${combo}x COMBO!` : 'Click for celebrations!'}
              </span>
              {activePowerUps.length > 0 && (
                <div className="button-powerup-icons">
                  {activePowerUps.map((pu, i) => (
                    <span
                      key={`${pu.id}-icon-${i}`}
                      title={pu.description}
                      onMouseEnter={() => setHoveredPowerUpId(pu.id)}
                      onMouseLeave={() => setHoveredPowerUpId(null)}
                    >
                      {pu.emoji}
                    </span>
                  ))}
                </div>
              )}
            </button>
          </div>

          <div className="upgrades-section">
            {/* Prestige at Top - Always shown */}
            <button
              className={`prestige-button ${localCount >= 1000000 * Math.pow(10, prestigeLevel) ? 'can-prestige' : ''}`}
              onClick={handlePrestige}
              disabled={localCount < 1000000 * Math.pow(10, prestigeLevel)}
            >
              ✨ Prestige
              <small>Requires: {formatNumber(1000000 * Math.pow(10, prestigeLevel))}</small>
            </button>
            
            <h2>Upgrades</h2>
            <div className="upgrades-list">
              {upgrades
                .sort((a, b) => {
                  // Factory at top if owned
                  if (a.id === 'celebration-factory' && a.owned > 0) return -1;
                  if (b.id === 'celebration-factory' && b.owned > 0) return 1;
                  return 0;
                })
                .map(upgrade => {
                const cost = getUpgradeCost(upgrade);
                const canAfford = localCount >= cost;
                const isFactory = upgrade.id === 'celebration-factory';
                
                return (
                  <div
                    key={upgrade.id}
                  className={`upgrade-item ${canAfford ? 'can-afford' : 'cannot-afford'} ${isFactory && upgrade.owned > 0 ? 'has-factory' : ''}`}
                    onClick={() => {
                      if (isFactory && upgrade.owned > 0) {
                        setShowFactory(true);
                      } else {
                        buyUpgrade(upgrade.id);
                      }
                    }}
                  style={{ cursor: 'pointer' }}
                  >
                    <div className="upgrade-header">
                      <span className="upgrade-name">{upgrade.name}</span>
                      <span className="upgrade-owned">{upgrade.owned}</span>
                    </div>
                    <div className="upgrade-description">{upgrade.description}</div>
                    <div className="upgrade-footer">
                      {!isFactory && <span className="upgrade-cps">+{formatNumber(upgrade.cps)} /sec</span>}
                      {isFactory && upgrade.owned > 0 ? (
                        <button
                          className="manage-factory-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFactory(true);
                          }}
                        >
                          Manage Factory
                        </button>
                      ) : (
                        <span className="upgrade-cost">
                          {formatNumber(cost)} celebrations
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Achievements Section */}
            <div className="achievements-section">
              <h3>Achievements ({achievements.filter(a => a.unlocked).length}/{achievements.length})</h3>
              <div className="achievements-grid">
                {achievements.map(ach => (
                  <div
                    key={ach.id}
                    className={`achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}`}
                    title={ach.description}
                  >
                    <span className="achievement-icon">{ach.unlocked ? '🏆' : '🔒'}</span>
                    <span className="achievement-name">{ach.name}</span>
          </div>
                ))}
              </div>
            </div>

            {/* Stats Panel - At Bottom */}
            <div className="stats-panel">
              <h3>Statistics</h3>
              <div className="stat-row">
                <span>Total Clicks:</span>
                <span>{formatNumber(stats.totalClicks)}</span>
              </div>
              <div className="stat-row">
                <span>Critical Hits:</span>
                <span>{formatNumber(stats.criticalHits)}</span>
              </div>
              <div className="stat-row">
                <span>Golden Caught:</span>
                <span>{stats.goldenCelebsCaught}</span>
              </div>
              <div className="stat-row">
                <span>Best Combo:</span>
                <span>{stats.comboHighScore}x</span>
              </div>
              <div className="stat-row">
                <span>Time Played:</span>
                <span>{formatTime(stats.timePlayedSeconds)}</span>
              </div>
              {secretUnlocked && (
                <div className="stat-row secret-unlocked">
                  <span>🎮 Konami Code:</span>
                  <span>✓ UNLOCKED</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelebratePage;

