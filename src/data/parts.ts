// v3.1: Parts System - Components that enhance ALL upgrades globally
// Each category has a DISTINCT purpose - no overlap

export type PartCategory = 'cpu' | 'memory' | 'storage' | 'network' | 'power' | 'cooling';
export type PartTier = 1 | 2 | 3 | 4;

export interface Part {
  id: string;
  name: string;
  description: string;
  category: PartCategory;
  tier: PartTier;
  effects: {
    cpsMultiplier: number;        // CPU: passive income boost
    comboMax: number;             // Memory: +max combo
    comboDecay: number;           // Memory: slower decay (seconds added)
    critChance: number;           // Storage: +crit chance (additive)
    critMultiplier: number;       // Storage: +crit multiplier (celebrations from crits)
    goldenSpawnRate: number;      // Network: golden spawn multiplier
    goldenReward: number;         // Network: golden reward multiplier
    clickMultiplier: number;      // Power: click power
    powerupDuration: number;      // Cooling: power-up duration multiplier
  };
  researchCost: {
    celebrations: number;
    insight: number;
    blueprints: number;
  };
  prerequisite: string | null;
}

const DEFAULT_EFFECTS = {
  cpsMultiplier: 0,
  comboMax: 0,
  comboDecay: 0,
  critChance: 0,
  critMultiplier: 0,
  goldenSpawnRate: 0,
  goldenReward: 0,
  clickMultiplier: 0,
  powerupDuration: 0,
};

export const PART_DEFINITIONS: Part[] = [
  // === CPU: Passive CPS Boost ===
  {
    id: 'cpu-t1',
    name: 'Basic Processor',
    description: '+15% passive CPS',
    category: 'cpu',
    tier: 1,
    effects: { ...DEFAULT_EFFECTS, cpsMultiplier: 0.15 },
    researchCost: { celebrations: 10_000_000, insight: 5, blueprints: 2 },
    prerequisite: null,
  },
  {
    id: 'cpu-t2',
    name: 'Multi-Core CPU',
    description: '+35% passive CPS',
    category: 'cpu',
    tier: 2,
    effects: { ...DEFAULT_EFFECTS, cpsMultiplier: 0.35 },
    researchCost: { celebrations: 100_000_000, insight: 15, blueprints: 8 },
    prerequisite: 'cpu-t1',
  },
  {
    id: 'cpu-t3',
    name: 'Quantum Processor',
    description: '+75% passive CPS',
    category: 'cpu',
    tier: 3,
    effects: { ...DEFAULT_EFFECTS, cpsMultiplier: 0.75 },
    researchCost: { celebrations: 1_000_000_000, insight: 30, blueprints: 20 },
    prerequisite: 'cpu-t2',
  },
  {
    id: 'cpu-t4',
    name: 'Neural Processor',
    description: '+150% passive CPS',
    category: 'cpu',
    tier: 4,
    effects: { ...DEFAULT_EFFECTS, cpsMultiplier: 1.5 },
    researchCost: { celebrations: 10_000_000_000, insight: 50, blueprints: 50 },
    prerequisite: 'cpu-t3',
  },

  // === Memory: Combo System ===
  {
    id: 'memory-t1',
    name: '8GB RAM',
    description: '+10 max combo',
    category: 'memory',
    tier: 1,
    effects: { ...DEFAULT_EFFECTS, comboMax: 10 },
    researchCost: { celebrations: 10_000_000, insight: 5, blueprints: 2 },
    prerequisite: null,
  },
  {
    id: 'memory-t2',
    name: '32GB RAM',
    description: '+25 max combo, +1s decay time',
    category: 'memory',
    tier: 2,
    effects: { ...DEFAULT_EFFECTS, comboMax: 25, comboDecay: 1 },
    researchCost: { celebrations: 100_000_000, insight: 15, blueprints: 8 },
    prerequisite: 'memory-t1',
  },
  {
    id: 'memory-t3',
    name: '128GB RAM',
    description: '+50 max combo, +2s decay time',
    category: 'memory',
    tier: 3,
    effects: { ...DEFAULT_EFFECTS, comboMax: 50, comboDecay: 2 },
    researchCost: { celebrations: 1_000_000_000, insight: 30, blueprints: 20 },
    prerequisite: 'memory-t2',
  },
  {
    id: 'memory-t4',
    name: 'Neural Cache',
    description: '+100 max combo, +3s decay time',
    category: 'memory',
    tier: 4,
    effects: { ...DEFAULT_EFFECTS, comboMax: 100, comboDecay: 3 },
    researchCost: { celebrations: 10_000_000_000, insight: 50, blueprints: 50 },
    prerequisite: 'memory-t3',
  },

  // === Storage: Critical Hits ===
  {
    id: 'storage-t1',
    name: 'HDD',
    description: '+5% crit chance',
    category: 'storage',
    tier: 1,
    effects: { ...DEFAULT_EFFECTS, critChance: 0.05 },
    researchCost: { celebrations: 10_000_000, insight: 5, blueprints: 2 },
    prerequisite: null,
  },
  {
    id: 'storage-t2',
    name: 'SSD',
    description: '+10% crit chance, +25% crit multiplier',
    category: 'storage',
    tier: 2,
    effects: { ...DEFAULT_EFFECTS, critChance: 0.10, critMultiplier: 0.25 },
    researchCost: { celebrations: 100_000_000, insight: 15, blueprints: 8 },
    prerequisite: 'storage-t1',
  },
  {
    id: 'storage-t3',
    name: 'NVMe Drive',
    description: '+15% crit chance, +50% crit multiplier',
    category: 'storage',
    tier: 3,
    effects: { ...DEFAULT_EFFECTS, critChance: 0.15, critMultiplier: 0.50 },
    researchCost: { celebrations: 1_000_000_000, insight: 30, blueprints: 20 },
    prerequisite: 'storage-t2',
  },
  {
    id: 'storage-t4',
    name: 'Quantum Storage',
    description: '+20% crit chance, +100% crit multiplier',
    category: 'storage',
    tier: 4,
    effects: { ...DEFAULT_EFFECTS, critChance: 0.20, critMultiplier: 1.0 },
    researchCost: { celebrations: 10_000_000_000, insight: 50, blueprints: 50 },
    prerequisite: 'storage-t3',
  },

  // === Network: Golden Celebrations ===
  {
    id: 'network-t1',
    name: 'Ethernet Card',
    description: '+25% golden spawn rate',
    category: 'network',
    tier: 1,
    effects: { ...DEFAULT_EFFECTS, goldenSpawnRate: 0.25 },
    researchCost: { celebrations: 10_000_000, insight: 5, blueprints: 2 },
    prerequisite: null,
  },
  {
    id: 'network-t2',
    name: 'Fiber Optic',
    description: '+50% golden spawn, +25% golden rewards',
    category: 'network',
    tier: 2,
    effects: { ...DEFAULT_EFFECTS, goldenSpawnRate: 0.50, goldenReward: 0.25 },
    researchCost: { celebrations: 100_000_000, insight: 15, blueprints: 8 },
    prerequisite: 'network-t1',
  },
  {
    id: 'network-t3',
    name: '5G Antenna',
    description: '+100% golden spawn, +50% golden rewards',
    category: 'network',
    tier: 3,
    effects: { ...DEFAULT_EFFECTS, goldenSpawnRate: 1.0, goldenReward: 0.50 },
    researchCost: { celebrations: 1_000_000_000, insight: 30, blueprints: 20 },
    prerequisite: 'network-t2',
  },
  {
    id: 'network-t4',
    name: 'Satellite Link',
    description: '+200% golden spawn, +100% golden rewards',
    category: 'network',
    tier: 4,
    effects: { ...DEFAULT_EFFECTS, goldenSpawnRate: 2.0, goldenReward: 1.0 },
    researchCost: { celebrations: 10_000_000_000, insight: 50, blueprints: 50 },
    prerequisite: 'network-t3',
  },

  // === Power: Click Strength ===
  {
    id: 'power-t1',
    name: 'Basic PSU',
    description: '+25% click power',
    category: 'power',
    tier: 1,
    effects: { ...DEFAULT_EFFECTS, clickMultiplier: 0.25 },
    researchCost: { celebrations: 10_000_000, insight: 5, blueprints: 2 },
    prerequisite: null,
  },
  {
    id: 'power-t2',
    name: 'Modular PSU',
    description: '+50% click power',
    category: 'power',
    tier: 2,
    effects: { ...DEFAULT_EFFECTS, clickMultiplier: 0.50 },
    researchCost: { celebrations: 100_000_000, insight: 15, blueprints: 8 },
    prerequisite: 'power-t1',
  },
  {
    id: 'power-t3',
    name: 'Platinum PSU',
    description: '+100% click power',
    category: 'power',
    tier: 3,
    effects: { ...DEFAULT_EFFECTS, clickMultiplier: 1.0 },
    researchCost: { celebrations: 1_000_000_000, insight: 30, blueprints: 20 },
    prerequisite: 'power-t2',
  },
  {
    id: 'power-t4',
    name: 'Fusion Core',
    description: '+200% click power',
    category: 'power',
    tier: 4,
    effects: { ...DEFAULT_EFFECTS, clickMultiplier: 2.0 },
    researchCost: { celebrations: 10_000_000_000, insight: 50, blueprints: 50 },
    prerequisite: 'power-t3',
  },

  // === Cooling: Power-up Enhancement ===
  {
    id: 'cooling-t1',
    name: 'Air Cooling',
    description: '+25% power-up duration',
    category: 'cooling',
    tier: 1,
    effects: { ...DEFAULT_EFFECTS, powerupDuration: 0.25 },
    researchCost: { celebrations: 10_000_000, insight: 5, blueprints: 2 },
    prerequisite: null,
  },
  {
    id: 'cooling-t2',
    name: 'Liquid Cooling',
    description: '+50% power-up duration',
    category: 'cooling',
    tier: 2,
    effects: { ...DEFAULT_EFFECTS, powerupDuration: 0.50 },
    researchCost: { celebrations: 100_000_000, insight: 15, blueprints: 8 },
    prerequisite: 'cooling-t1',
  },
  {
    id: 'cooling-t3',
    name: 'Phase Change',
    description: '+100% power-up duration',
    category: 'cooling',
    tier: 3,
    effects: { ...DEFAULT_EFFECTS, powerupDuration: 1.0 },
    researchCost: { celebrations: 1_000_000_000, insight: 30, blueprints: 20 },
    prerequisite: 'cooling-t2',
  },
  {
    id: 'cooling-t4',
    name: 'Cryo System',
    description: '+200% power-up duration',
    category: 'cooling',
    tier: 4,
    effects: { ...DEFAULT_EFFECTS, powerupDuration: 2.0 },
    researchCost: { celebrations: 10_000_000_000, insight: 50, blueprints: 50 },
    prerequisite: 'cooling-t3',
  },
];

// Get part by ID
export const getPart = (id: string): Part | undefined => 
  PART_DEFINITIONS.find(p => p.id === id);

// Get all parts of a category
export const getPartsByCategory = (category: PartCategory): Part[] =>
  PART_DEFINITIONS.filter(p => p.category === category);

// Check if a part can be researched
export const canResearchPart = (
  partId: string,
  researchedParts: string[],
  celebrations: number,
  insight: number,
  blueprints: number
): { canResearch: boolean; reason?: string } => {
  const part = getPart(partId);
  if (!part) return { canResearch: false, reason: 'Part not found' };
  
  if (researchedParts.includes(partId)) {
    return { canResearch: false, reason: 'Already researched' };
  }
  
  if (part.prerequisite && !researchedParts.includes(part.prerequisite)) {
    const prereq = getPart(part.prerequisite);
    return { canResearch: false, reason: `Requires ${prereq?.name || part.prerequisite}` };
  }
  
  if (celebrations < part.researchCost.celebrations) {
    return { canResearch: false, reason: 'Not enough celebrations' };
  }
  
  if (insight < part.researchCost.insight) {
    return { canResearch: false, reason: 'Not enough insight' };
  }
  
  if (blueprints < part.researchCost.blueprints) {
    return { canResearch: false, reason: 'Not enough blueprints' };
  }
  
  return { canResearch: true };
};

// Category display info - each has a DISTINCT purpose
export const CATEGORY_INFO: Record<PartCategory, { name: string; emoji: string; description: string }> = {
  cpu: { name: 'CPU', emoji: '🖥️', description: 'Passive CPS boost' },
  memory: { name: 'RAM', emoji: '🧠', description: 'Combo bonuses' },
  storage: { name: 'Storage', emoji: '💿', description: 'Critical hits' },
  network: { name: 'Network', emoji: '📡', description: 'Golden celebrations' },
  power: { name: 'Power', emoji: '⚡', description: 'Click strength' },
  cooling: { name: 'Cooling', emoji: '❄️', description: 'Power-up duration' },
};
