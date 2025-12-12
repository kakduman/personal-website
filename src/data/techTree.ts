// v3.2: Tech Tree - Unlock powerful bonuses with Insight

export type TechBranch = 'foundation' | 'efficiency' | 'acceleration' | 'automation' | 'convergence';

export interface TechNode {
  id: string;
  name: string;
  description: string;
  branch: TechBranch;
  cost: number; // Insight cost
  prerequisites: string[]; // Node IDs that must be researched first
  effects: TechEffect[];
  position: { x: number; y: number }; // For visual layout
}

export interface TechEffect {
  type: 'cps_multiplier' | 'click_multiplier' | 'golden_rate' | 'powerup_duration' | 
        'auto_click' | 'part_bonus' | 'combo_decay' | 'weather_speed' | 'global_multiplier';
  value: number;
  description: string;
}

export const TECH_NODES: TechNode[] = [
  // === Foundation (Root) ===
  {
    id: 'ai-foundation',
    name: 'AI Foundation',
    description: 'Unlocks the tech tree and provides base bonuses.',
    branch: 'foundation',
    cost: 0, // Free starting node
    prerequisites: [],
    effects: [
      { type: 'global_multiplier', value: 0.05, description: '+5% all production' },
    ],
    position: { x: 50, y: 10 },
  },

  // === Efficiency Branch (Left) ===
  {
    id: 'efficiency-protocols',
    name: 'Efficiency Protocols',
    description: 'Optimize AI Worker performance.',
    branch: 'efficiency',
    cost: 50,
    prerequisites: ['ai-foundation'],
    effects: [
      { type: 'cps_multiplier', value: 0.15, description: '+15% CPS' },
      { type: 'part_bonus', value: 0.1, description: '-10% part install cost' },
    ],
    position: { x: 20, y: 30 },
  },
  {
    id: 'optimization-algorithms',
    name: 'Optimization Algorithms',
    description: 'Advanced algorithms for maximum efficiency.',
    branch: 'efficiency',
    cost: 100,
    prerequisites: ['efficiency-protocols'],
    effects: [
      { type: 'cps_multiplier', value: 0.30, description: '+30% CPS' },
      { type: 'part_bonus', value: 0.5, description: 'Parts give +50% more benefit' },
    ],
    position: { x: 20, y: 50 },
  },
  {
    id: 'peak-efficiency',
    name: 'Peak Efficiency',
    description: 'Maximum optimization achieved.',
    branch: 'efficiency',
    cost: 150,
    prerequisites: ['optimization-algorithms'],
    effects: [
      { type: 'cps_multiplier', value: 1.0, description: '+100% CPS' },
      { type: 'global_multiplier', value: 0.05, description: '+5% per installed part' },
    ],
    position: { x: 20, y: 70 },
  },

  // === Acceleration Branch (Center) ===
  {
    id: 'acceleration-theory',
    name: 'Acceleration Theory',
    description: 'Speed up time-based mechanics.',
    branch: 'acceleration',
    cost: 50,
    prerequisites: ['ai-foundation'],
    effects: [
      { type: 'click_multiplier', value: 0.25, description: '+25% click power' },
      { type: 'weather_speed', value: 2, description: '2× weather change speed' },
    ],
    position: { x: 50, y: 30 },
  },
  {
    id: 'time-dilation',
    name: 'Time Dilation',
    description: 'Manipulate the flow of time.',
    branch: 'acceleration',
    cost: 100,
    prerequisites: ['acceleration-theory'],
    effects: [
      { type: 'click_multiplier', value: 0.50, description: '+50% click power' },
      { type: 'golden_rate', value: 2, description: '2× golden spawn rate' },
      { type: 'powerup_duration', value: 1.5, description: '1.5× power-up duration' },
    ],
    position: { x: 50, y: 50 },
  },
  {
    id: 'hyperspeed-processing',
    name: 'Hyperspeed Processing',
    description: 'Break through the speed barrier.',
    branch: 'acceleration',
    cost: 150,
    prerequisites: ['time-dilation'],
    effects: [
      { type: 'click_multiplier', value: 2.0, description: '+200% click power' },
      { type: 'combo_decay', value: 5, description: 'Combo decay = 5 seconds' },
    ],
    position: { x: 50, y: 70 },
  },

  // === Automation Branch (Right) ===
  {
    id: 'basic-automation',
    name: 'Basic Automation',
    description: 'Let the AI help you click.',
    branch: 'automation',
    cost: 50,
    prerequisites: ['ai-foundation'],
    effects: [
      { type: 'cps_multiplier', value: 0.20, description: '+20% CPS' },
      { type: 'auto_click', value: 5, description: 'Auto-click goldens after 5s' },
    ],
    position: { x: 80, y: 30 },
  },
  {
    id: 'self-improvement',
    name: 'Self-Improvement',
    description: 'AI Workers upgrade themselves.',
    branch: 'automation',
    cost: 100,
    prerequisites: ['basic-automation'],
    effects: [
      { type: 'cps_multiplier', value: 0.40, description: '+40% CPS' },
      { type: 'auto_click', value: 1, description: 'Auto-click 1/second' },
    ],
    position: { x: 80, y: 50 },
  },
  {
    id: 'recursive-systems',
    name: 'Recursive Systems',
    description: 'Each worker boosts other workers.',
    branch: 'automation',
    cost: 150,
    prerequisites: ['self-improvement'],
    effects: [
      { type: 'cps_multiplier', value: 1.0, description: '+100% CPS' },
      { type: 'auto_click', value: 5, description: 'Auto-click 5/second' },
    ],
    position: { x: 80, y: 70 },
  },

  // === Convergence (AGI) ===
  {
    id: 'agi',
    name: 'AGI',
    description: 'Achieve Artificial General Intelligence. This changes everything.',
    branch: 'convergence',
    cost: 500,
    prerequisites: ['peak-efficiency', 'hyperspeed-processing', 'recursive-systems'],
    effects: [
      { type: 'global_multiplier', value: 10, description: 'Unlocks Phase 5: Data Center Village' },
    ],
    position: { x: 50, y: 90 },
  },
];

// Get node by ID
export const getTechNode = (id: string): TechNode | undefined =>
  TECH_NODES.find(n => n.id === id);

// Get all nodes in a branch
export const getNodesByBranch = (branch: TechBranch): TechNode[] =>
  TECH_NODES.filter(n => n.branch === branch);

// Check if node can be researched
export const canResearchNode = (
  nodeId: string,
  researchedNodes: string[],
  insight: number
): { canResearch: boolean; reason?: string } => {
  const node = getTechNode(nodeId);
  if (!node) return { canResearch: false, reason: 'Node not found' };
  
  if (researchedNodes.includes(nodeId)) {
    return { canResearch: false, reason: 'Already researched' };
  }
  
  // Check prerequisites
  for (const prereqId of node.prerequisites) {
    if (!researchedNodes.includes(prereqId)) {
      const prereq = getTechNode(prereqId);
      return { canResearch: false, reason: `Requires ${prereq?.name || prereqId}` };
    }
  }
  
  if (insight < node.cost) {
    return { canResearch: false, reason: `Need ${node.cost} Insight` };
  }
  
  return { canResearch: true };
};

// Calculate total effects from researched nodes
export const calculateTechEffects = (researchedNodes: string[]): {
  cpsMultiplier: number;
  clickMultiplier: number;
  goldenRate: number;
  powerupDuration: number;
  autoClickRate: number;
  autoClickGoldenDelay: number | null;
  partBonus: number;
  comboDecay: number;
  weatherSpeed: number;
  globalMultiplier: number;
} => {
  const result = {
    cpsMultiplier: 0,
    clickMultiplier: 0,
    goldenRate: 1,
    powerupDuration: 1,
    autoClickRate: 0,
    autoClickGoldenDelay: null as number | null,
    partBonus: 0,
    comboDecay: 2, // default 2 seconds
    weatherSpeed: 1,
    globalMultiplier: 0,
  };

  for (const nodeId of researchedNodes) {
    const node = getTechNode(nodeId);
    if (!node) continue;

    for (const effect of node.effects) {
      switch (effect.type) {
        case 'cps_multiplier':
          result.cpsMultiplier += effect.value;
          break;
        case 'click_multiplier':
          result.clickMultiplier += effect.value;
          break;
        case 'golden_rate':
          result.goldenRate *= effect.value;
          break;
        case 'powerup_duration':
          result.powerupDuration *= effect.value;
          break;
        case 'auto_click':
          // If value is >= 1, it's auto-clicks per second
          // If value is < 1 (like 5 for "after 5s"), it's golden auto-click delay
          if (effect.description.includes('golden')) {
            result.autoClickGoldenDelay = effect.value;
          } else {
            result.autoClickRate = Math.max(result.autoClickRate, effect.value);
          }
          break;
        case 'part_bonus':
          result.partBonus += effect.value;
          break;
        case 'combo_decay':
          result.comboDecay = Math.max(result.comboDecay, effect.value);
          break;
        case 'weather_speed':
          result.weatherSpeed *= effect.value;
          break;
        case 'global_multiplier':
          result.globalMultiplier += effect.value;
          break;
      }
    }
  }

  return result;
};

// Branch display info
export const BRANCH_INFO: Record<TechBranch, { name: string; color: string; description: string }> = {
  foundation: { name: 'Foundation', color: '#888888', description: 'Base bonuses' },
  efficiency: { name: 'Efficiency', color: '#4CAF50', description: 'Production multipliers' },
  acceleration: { name: 'Acceleration', color: '#FF9800', description: 'Speed and time' },
  automation: { name: 'Automation', color: '#2196F3', description: 'Passive generation' },
  convergence: { name: 'Convergence', color: '#9C27B0', description: 'AGI breakthrough' },
};

// Total insight needed for full tree
export const TOTAL_INSIGHT_FOR_TREE = TECH_NODES.reduce((sum, node) => sum + node.cost, 0);
// Should be: 0 + 50 + 100 + 150 + 50 + 100 + 150 + 50 + 100 + 150 + 500 = 1400

