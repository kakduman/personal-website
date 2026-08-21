// v3.7/v3.8: Quantum Reset meta upgrades, achievements and victory conditions.

export interface MetaUpgradeDef {
  id: string;
  name: string;
  description: string;
  cost: number;       // Quantum Shards for the first level
  costGrowth: number; // multiplier per level owned
  maxLevel: number;
  icon: string;
}

export const META_UPGRADES: MetaUpgradeDef[] = [
  { id: 'quantum-efficiency-1', name: 'Process Improvement I',  description: '+10% all production per level.',                cost: 1,  costGrowth: 1.6, maxLevel: 10, icon: '' },
  { id: 'quantum-efficiency-2', name: 'Process Improvement II', description: '+25% all production per level.',                cost: 5,  costGrowth: 1.8, maxLevel: 5,  icon: '' },
  { id: 'quantum-efficiency-3', name: 'Process Improvement III', description: '+50% all production per level.',               cost: 10, costGrowth: 2.0, maxLevel: 3,  icon: '' },
  { id: 'cheap-construction',   name: 'Standardised Parts',     description: '−15% building costs per level.',                cost: 3,  costGrowth: 2.0, maxLevel: 3,  icon: '' },
  { id: 'parallel-processing',  name: 'Remote Operations',      description: 'Sites keep running at full rate while you are away.', cost: 5, costGrowth: 1, maxLevel: 1, icon: '' },
  { id: 'universal-automation', name: 'Autoscaler',             description: 'Runs a workload five times a second for you.',  cost: 8,  costGrowth: 1,   maxLevel: 1,  icon: '' },
  { id: 'infinite-power',       name: 'Grid Connection',        description: 'Power shortfalls no longer slow production.',   cost: 15, costGrowth: 1,   maxLevel: 1,  icon: '' },
  { id: 'time-compression',     name: 'Recruitment Drive',      description: 'Workers arrive five times faster.',             cost: 20, costGrowth: 1,   maxLevel: 1,  icon: '' },
  { id: 'quantum-memory',       name: 'Modular Prefab',         description: 'Keep 3 of each building through a restructure.', cost: 25, costGrowth: 1,  maxLevel: 1,  icon: '' },
  { id: 'omniscience',          name: 'Site Planner',           description: 'Highlights the best tile for whatever you are placing.', cost: 50, costGrowth: 1, maxLevel: 1, icon: '' },
];

export const META_MAP: Record<string, MetaUpgradeDef> = Object.fromEntries(
  META_UPGRADES.map(u => [u.id, u])
);

export const metaCostAtLevel = (def: MetaUpgradeDef, level: number): number =>
  Math.ceil(def.cost * Math.pow(def.costGrowth, level));

// --- Achievements -----------------------------------------------------------

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const VILLAGE_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-steps',       name: 'First Steps',        description: 'Place your first building.',                    icon: '🏗️' },
  { id: 'power-hungry',      name: 'Power Hungry',       description: 'Generate 1,000 W at once.',                  icon: '⚡' },
  { id: 'lights-out',        name: 'Lights Out',         description: 'Enter emergency power mode. Oops.',             icon: '💀' },
  { id: 'cluster-theory',    name: 'Cluster Theory',     description: 'Get +200% neighbour bonus on one building.',    icon: '🔗' },
  { id: 'ten-buildings',     name: 'Settlement',         description: 'Place 10 buildings.',                           icon: '🏘️' },
  { id: 'fifty-buildings',   name: 'Metropolis',         description: 'Place 50 buildings.',                           icon: '🌆' },
  { id: 'hundred-buildings', name: 'Megastructure',      description: 'Place 100 buildings across all sites.',        icon: '🏙️' },
  { id: 'full-zone',         name: 'No Vacancy',         description: 'Fill every tile of a zone.',                    icon: '📐' },
  { id: 'population-100',    name: 'Company Town',       description: 'Reach 100 population.',                         icon: '👥' },
  { id: 'megaflop',          name: 'Megaflop',           description: 'Reach 1,000,000 Compute/s.',                      icon: '📈' },
  { id: 'exascale',          name: 'Exascale',           description: 'Reach 1 trillion Compute/s.',                     icon: '🌌' },
  { id: 'interplanetary',    name: 'Interplanetary',     description: 'Open your second site.',                   icon: '🚀' },
  { id: 'six-worlds',        name: 'Galactic Power',     description: 'Open all six sites.',                      icon: '🪐' },
  { id: 'quantum-leaper',    name: 'Second Pass',        description: 'Complete your first restructure.',              icon: '💎' },
  { id: 'agi-pioneer',       name: 'AGI Pioneer',        description: 'Witness the AGI event.',                        icon: '✨' },
  { id: 'the-cracker',       name: 'Moving Mountains',   description: 'Build an Open-Pit Mine.',                       icon: '💥' },
  { id: 'self-replicating',  name: 'Runs Itself',        description: 'Build an Automated Foundry.',                   icon: '♾️' },
  { id: 'completionist',     name: 'Universal Architect', description: 'Build one of every structure.',                icon: '🏆' },
];

export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  VILLAGE_ACHIEVEMENTS.map(a => [a.id, a])
);

// --- Victory conditions -----------------------------------------------------

export interface VictoryDef {
  id: string;
  name: string;
  requirement: string;
  reward: string;
  /** Permanent production multiplier granted when achieved. */
  productionBonus: number;
}

export const VICTORIES: VictoryDef[] = [
  { id: 'small-empire',    name: 'Regional Operator',   requirement: '3 sites, 200 buildings',        reward: '+25% all production, permanently',  productionBonus: 0.25 },
  { id: 'galactic-power',  name: 'Every Site',          requirement: 'All 6 sites open',         reward: '+50% all production, permanently',  productionBonus: 0.50 },
  { id: 'dyson-complete',  name: 'Full Array',          requirement: 'Fill Sutton completely',           reward: '+100% all production, permanently', productionBonus: 1.00 },
  { id: 'exascale',        name: 'Exascale',            requirement: '1 trillion Compute/s',             reward: '+75% all production, permanently',  productionBonus: 0.75 },
  { id: 'universal',       name: 'Universal Architect', requirement: 'Every building type, everywhere',   reward: '+150% all production, permanently', productionBonus: 1.50 },
];

export const VICTORY_MAP: Record<string, VictoryDef> = Object.fromEntries(
  VICTORIES.map(v => [v.id, v])
);
