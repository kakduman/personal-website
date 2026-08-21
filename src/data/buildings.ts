// v3.4/v3.5: Data Center Village building definitions.
//
// Deviations from the v3 spec (deliberate, see docs/celebration-game-v3-spec.md):
//  - Watts is a *rate* balance (production vs draw), not a stored resource. The spec
//    listed it both ways; a rate is the only reading that makes the power-balance
//    penalty table work.
//  - Wind Turbine's "-3W next to a tall building" became "+4W per adjacent empty tile",
//    which is the same placement tension but legible without a hidden "tall" tag.
//  - Added the Launch Pad building so multi-site expansion has a concrete gate.

export type ResourceKey = 'flops' | 'ore' | 'data' | 'alloys';

export type BuildingCategory =
  | 'power'
  | 'compute'
  | 'mining'
  | 'research'
  | 'manufacturing'
  | 'housing'
  | 'logistics';

export type TerrainType = 'standard' | 'rocky' | 'vent' | 'launchpad';

/** What a building's adjacency bonus is measured against. */
export type AdjacencyMatch =
  | { kind: 'building'; id: string }
  | { kind: 'category'; category: BuildingCategory }
  | { kind: 'terrain'; terrain: TerrainType }
  | { kind: 'empty' }
  | { kind: 'isolated' }
  | { kind: 'distinctCategories'; atLeast: number };

export interface AdjacencyRule {
  match: AdjacencyMatch;
  /** Flat amount added to the building's primary output per match (or once, for
   *  the isolated / distinctCategories matches). */
  bonus: number;
  label: string;
}

export interface BuildingDef {
  id: string;
  name: string;
  category: BuildingCategory;
  description: string;
  cost: Partial<Record<ResourceKey, number>>;
  /** Cost multiplier applied per copy already built on the current planet. */
  costGrowth: number;
  /** Watts produced (positive) or drawn (negative). */
  watts: number;
  /** Primary output per second: which resource and how much. Housing uses popCap. */
  output?: { resource: ResourceKey; amount: number };
  popCap?: number;
  adjacency: AdjacencyRule[];
  /** Terrain the building may be placed on. Undefined = anything but vent/launchpad. */
  allowedTerrain?: TerrainType[];
  /** Max copies per planet. */
  limitPerPlanet?: number;
  /** Research points needed to unlock this building type. 0 = available from day one. */
  researchCost: number;
  /** Ordering hint for the palette; no longer gates availability. */
  tier: number;
  flavor: string;
}

export const CATEGORY_META: Record<BuildingCategory, { name: string; color: string; accent: string; icon: string }> = {
  power:         { name: 'Power',         color: '#f5c542', accent: '#fff3c4', icon: '⚡' },
  compute:       { name: 'Compute',       color: '#3fa9f5', accent: '#c7e8ff', icon: '🖥️' },
  mining:        { name: 'Extraction',    color: '#c98a4b', accent: '#f0d4b0', icon: '⛏️' },
  research:      { name: 'Research',      color: '#3fe0d0', accent: '#c2fff8', icon: '🔬' },
  manufacturing: { name: 'Manufacturing', color: '#a86fe0', accent: '#e3d0ff', icon: '🏭' },
  housing:       { name: 'Habitation',    color: '#5fd97a', accent: '#d2ffdc', icon: '🏠' },
  logistics:     { name: 'Logistics',     color: '#e8eaf0', accent: '#ffffff', icon: '🚀' },
};

export const TERRAIN_META: Record<TerrainType, { name: string; description: string }> = {
  standard:  { name: 'Open Ground',   description: 'Flat and buildable. No bonuses, no restrictions.' },
  rocky:     { name: 'Ore Deposit',   description: 'Extraction and power structures only. Doubles excavator yield.' },
  vent:      { name: 'Geothermal Vent', description: 'Power structures only. +25% Watts from anything built here.' },
  launchpad: { name: 'Bedrock',       description: 'The only ground stable enough to take a launch pad.' },
};

export const BUILDINGS: BuildingDef[] = [
  // ============ POWER ============
  {
    id: 'solar-panel',
    name: 'Solar Panel',
    category: 'power',
    description: '+5 W. +1 W per adjacent Solar Panel.',
    cost: { flops: 100 },
    costGrowth: 1.12,
    watts: 5,
    adjacency: [{ match: { kind: 'building', id: 'solar-panel' }, bonus: 1, label: 'adjacent Solar Panel' }],
    researchCost: 0,
    tier: 0,
    flavor: 'Cheap, silent, and entirely at the mercy of the local star.',
  },
  {
    id: 'wind-turbine',
    name: 'Wind Turbine',
    category: 'power',
    description: '+12 W. +4 W per adjacent empty tile — it needs open air.',
    cost: { flops: 500 },
    costGrowth: 1.14,
    watts: 12,
    adjacency: [{ match: { kind: 'empty' }, bonus: 4, label: 'adjacent open tile' }],
    researchCost: 20,
    tier: 1,
    flavor: 'Crowd it and it stalls. Give it room and it sings.',
  },
  {
    id: 'geothermal-plant',
    name: 'Geothermal Plant',
    category: 'power',
    description: '+40 W. +8 W per adjacent Ore Seam.',
    cost: { flops: 2_500, ore: 50 },
    costGrowth: 1.16,
    watts: 40,
    adjacency: [{ match: { kind: 'terrain', terrain: 'rocky' }, bonus: 8, label: 'adjacent Ore Deposit' }],
    researchCost: 80,
    tier: 2,
    flavor: 'Drill until it complains, then drill a little further.',
  },
  {
    id: 'fusion-reactor',
    name: 'Modular Reactor',
    category: 'power',
    description: '+150 W. +60 W if sited clear of everything else.',
    cost: { flops: 25_000, ore: 500, alloys: 25 },
    costGrowth: 1.18,
    watts: 150,
    adjacency: [{ match: { kind: 'isolated' }, bonus: 60, label: 'no adjacent buildings' }],
    researchCost: 260,
    tier: 3,
    flavor: 'Small modular reactor. The safety case runs to four thousand pages.',
  },
  {
    id: 'dyson-collector',
    name: 'Solar Concentrator',
    category: 'power',
    description: '+800 W. +150 W per adjacent Cryogenics Lab.',
    cost: { flops: 500_000, ore: 5_000, alloys: 500 },
    costGrowth: 1.2,
    watts: 800,
    adjacency: [{ match: { kind: 'building', id: 'quantum-lab' }, bonus: 150, label: 'adjacent Cryogenics Lab' }],
    researchCost: 700,
    tier: 4,
    flavor: 'A field of mirrors chasing one point in the sky. Do not stand at that point.',
  },

  // ============ COMPUTE ============
  {
    id: 'server-rack',
    name: 'Server Rack',
    category: 'compute',
    description: '+2 FLOPS/s, −2 W. +1 per adjacent Server Rack.',
    cost: { flops: 200 },
    costGrowth: 1.12,
    watts: -2,
    output: { resource: 'flops', amount: 2 },
    adjacency: [{ match: { kind: 'building', id: 'server-rack' }, bonus: 1, label: 'adjacent Server Rack' }],
    researchCost: 0,
    tier: 0,
    flavor: 'The backbone of any network. Stack them high, stack them wide.',
  },
  {
    id: 'data-center',
    name: 'Data Hall',
    category: 'compute',
    description: '+10 FLOPS/s, −8 W. +3 per adjacent Power building.',
    cost: { flops: 1_000, ore: 25 },
    costGrowth: 1.14,
    watts: -8,
    output: { resource: 'flops', amount: 10 },
    adjacency: [{ match: { kind: 'category', category: 'power' }, bonus: 3, label: 'adjacent Power building' }],
    researchCost: 20,
    tier: 1,
    flavor: 'Hot aisle, cold aisle, and a hum you can feel through the floor.',
  },
  {
    id: 'supercomputer',
    name: 'Compute Cluster',
    category: 'compute',
    description: '+50 FLOPS/s, −30 W. +12 per adjacent Data Hall.',
    cost: { flops: 10_000, ore: 100 },
    costGrowth: 1.16,
    watts: -30,
    output: { resource: 'flops', amount: 50 },
    adjacency: [{ match: { kind: 'building', id: 'data-center' }, bonus: 12, label: 'adjacent Data Hall' }],
    researchCost: 80,
    tier: 2,
    flavor: 'Benchmarked once, at commissioning. Never spoken of again.',
  },
  {
    id: 'quantum-computer',
    name: 'GPU Superpod',
    category: 'compute',
    description: '+400 FLOPS/s, −150 W. +80 per adjacent Cryogenics Lab.',
    cost: { flops: 100_000, ore: 500, alloys: 50 },
    costGrowth: 1.18,
    watts: -150,
    output: { resource: 'flops', amount: 400 },
    adjacency: [{ match: { kind: 'building', id: 'quantum-lab' }, bonus: 80, label: 'adjacent Cryogenics Lab' }],
    researchCost: 260,
    tier: 3,
    flavor: 'Eight figures of silicon in a room you are not allowed to enter alone.',
  },
  {
    id: 'ai-core',
    name: 'Training Cluster',
    category: 'compute',
    description: '+4,000 FLOPS/s, −800 W. +2,000 if adjacent to 4+ distinct categories.',
    cost: { flops: 1_000_000, ore: 2_500, alloys: 250 },
    costGrowth: 1.25,
    watts: -800,
    output: { resource: 'flops', amount: 4_000 },
    adjacency: [{ match: { kind: 'distinctCategories', atLeast: 4 }, bonus: 2_000, label: '4+ distinct neighbour categories' }],
    researchCost: 1800,
    tier: 5,
    flavor: 'The part of the system that still remembers counting celebrations.',
  },

  // ============ EXTRACTION ============
  {
    id: 'mining-drone',
    name: 'Excavator',
    category: 'mining',
    description: '+2 Ore/s, −3 W. +2 on an Ore Deposit.',
    cost: { flops: 300 },
    costGrowth: 1.12,
    watts: -3,
    output: { resource: 'ore', amount: 2 },
    adjacency: [],
    researchCost: 0,
    tier: 1,
    flavor: 'Tireless, cheerful, and completely indifferent to what it digs up.',
  },
  {
    id: 'deep-mine',
    name: 'Deep Mine',
    category: 'mining',
    description: '+10 Ore/s, −15 W. +3 per adjacent Extraction building.',
    cost: { flops: 2_000, ore: 50 },
    costGrowth: 1.15,
    watts: -15,
    output: { resource: 'ore', amount: 10 },
    adjacency: [{ match: { kind: 'category', category: 'mining' }, bonus: 3, label: 'adjacent Extraction building' }],
    researchCost: 80,
    tier: 2,
    flavor: 'Down past the regolith, past the basalt, past where the surveys stop.',
  },
  {
    id: 'asteroid-harvester',
    name: 'Quarry',
    category: 'mining',
    description: '+50 Ore/s, −80 W. +25 per adjacent Bedrock tile.',
    cost: { flops: 20_000, ore: 250, alloys: 25 },
    costGrowth: 1.17,
    watts: -80,
    output: { resource: 'ore', amount: 50 },
    adjacency: [{ match: { kind: 'terrain', terrain: 'launchpad' }, bonus: 25, label: 'adjacent Bedrock tile' }],
    researchCost: 260,
    tier: 3,
    flavor: 'Why tunnel down when the good rock is lying right there?',
  },
  {
    id: 'planet-cracker',
    name: 'Open-Pit Mine',
    category: 'mining',
    description: '+400 Ore/s, −300 W. One per site — there is only so much ground.',
    cost: { flops: 200_000, ore: 1_000, alloys: 200 },
    costGrowth: 1,
    watts: -300,
    output: { resource: 'ore', amount: 400 },
    adjacency: [],
    limitPerPlanet: 1,
    researchCost: 1800,
    tier: 5,
    flavor: 'Visible from orbit. The environmental review was filed retroactively.',
  },

  // ============ RESEARCH ============
  {
    id: 'research-lab',
    name: 'Field Lab',
    category: 'research',
    description: '+2 Data/s, −5 W. +1 per adjacent Research building.',
    cost: { flops: 500, ore: 25 },
    costGrowth: 1.13,
    watts: -5,
    output: { resource: 'data', amount: 2 },
    adjacency: [{ match: { kind: 'category', category: 'research' }, bonus: 1, label: 'adjacent Research building' }],
    researchCost: 0,
    tier: 1,
    flavor: 'Mostly whiteboards. The whiteboards turn out to matter.',
  },
  {
    id: 'ai-lab',
    name: 'Research Lab',
    category: 'research',
    description: '+10 Data/s, −25 W. +3 per adjacent Compute building.',
    cost: { flops: 5_000, ore: 100 },
    costGrowth: 1.15,
    watts: -25,
    output: { resource: 'data', amount: 10 },
    adjacency: [{ match: { kind: 'category', category: 'compute' }, bonus: 3, label: 'adjacent Compute building' }],
    researchCost: 80,
    tier: 2,
    flavor: 'Where the models are studied by the models.',
  },
  {
    id: 'quantum-lab',
    name: 'Cryogenics Lab',
    category: 'research',
    description: '+50 Data/s, −120 W. +15 per adjacent Research building.',
    cost: { flops: 50_000, ore: 500, alloys: 50 },
    costGrowth: 1.17,
    watts: -120,
    output: { resource: 'data', amount: 50 },
    adjacency: [{ match: { kind: 'category', category: 'research' }, bonus: 15, label: 'adjacent Research building' }],
    researchCost: 700,
    tier: 4,
    flavor: 'Getting to millikelvin is easy. Getting an answer out is the hard part.',
  },
  {
    id: 'agi-lab',
    name: 'Research Campus',
    category: 'research',
    description: '+400 Data/s, −500 W. +400 if adjacent to 5+ distinct categories.',
    cost: { flops: 500_000, ore: 2_500, alloys: 250 },
    costGrowth: 1.22,
    watts: -500,
    output: { resource: 'data', amount: 400 },
    adjacency: [{ match: { kind: 'distinctCategories', atLeast: 5 }, bonus: 400, label: '5+ distinct neighbour categories' }],
    researchCost: 1800,
    tier: 5,
    flavor: 'It stopped publishing years ago. It simply becomes correct.',
  },

  // ============ MANUFACTURING ============
  {
    id: 'fabricator',
    name: 'Machine Shop',
    category: 'manufacturing',
    description: '+2 Alloys/s, −15 W. +1 per adjacent Manufacturing building.',
    cost: { flops: 1_000, ore: 100 },
    costGrowth: 1.14,
    watts: -15,
    output: { resource: 'alloys', amount: 2 },
    adjacency: [{ match: { kind: 'category', category: 'manufacturing' }, bonus: 1, label: 'adjacent Manufacturing building' }],
    researchCost: 80,
    tier: 2,
    flavor: 'Feed it ore, receive something suspiciously well-machined.',
  },
  {
    id: 'smelter',
    name: 'Smelter',
    category: 'manufacturing',
    description: '+10 Alloys/s, −80 W. +4 per adjacent Research building.',
    cost: { flops: 8_000, ore: 1_000 },
    costGrowth: 1.16,
    watts: -80,
    output: { resource: 'alloys', amount: 10 },
    adjacency: [{ match: { kind: 'category', category: 'research' }, bonus: 4, label: 'adjacent Research building' }],
    researchCost: 260,
    tier: 3,
    flavor: 'Metallurgy is just chemistry that got angry.',
  },
  {
    id: 'matter-compiler',
    name: 'Fabrication Plant',
    category: 'manufacturing',
    description: '+50 Alloys/s, −300 W. +15 per adjacent Manufacturing building.',
    cost: { flops: 80_000, ore: 10_000, alloys: 100 },
    costGrowth: 1.18,
    watts: -300,
    output: { resource: 'alloys', amount: 50 },
    adjacency: [{ match: { kind: 'category', category: 'manufacturing' }, bonus: 15, label: 'adjacent Manufacturing building' }],
    researchCost: 700,
    tier: 4,
    flavor: 'Raw stock in, finished girders out, nobody on the floor.',
  },
  {
    id: 'self-replicator',
    name: 'Automated Foundry',
    category: 'manufacturing',
    description: '+400 Alloys/s, −1,500 W. Output ramps +10%/min while powered, to +100%.',
    cost: { flops: 800_000, ore: 100_000, alloys: 1_000 },
    costGrowth: 1.25,
    watts: -1_500,
    output: { resource: 'alloys', amount: 400 },
    adjacency: [],
    researchCost: 1800,
    tier: 5,
    flavor: 'It builds its own replacement parts. Nobody has checked what else it builds.',
  },

  // ============ HABITATION ============
  {
    id: 'habitat-module',
    name: 'Bunkhouse',
    category: 'housing',
    description: '+5 population cap, −3 W. +2 cap per adjacent Bunkhouse.',
    cost: { flops: 400 },
    costGrowth: 1.13,
    watts: -3,
    popCap: 5,
    adjacency: [{ match: { kind: 'building', id: 'habitat-module' }, bonus: 2, label: 'adjacent Bunkhouse' }],
    researchCost: 20,
    tier: 1,
    flavor: 'Six bunks, one window, and a very optimistic coffee machine.',
  },
  {
    id: 'hydroponics-bay',
    name: 'Greenhouse',
    category: 'housing',
    description: '+20 population cap, −15 W. +6 cap per adjacent Habitation building.',
    cost: { flops: 2_000, ore: 50 },
    costGrowth: 1.15,
    watts: -15,
    popCap: 20,
    adjacency: [{ match: { kind: 'category', category: 'housing' }, bonus: 6, label: 'adjacent Habitation building' }],
    researchCost: 80,
    tier: 2,
    flavor: 'Tomatoes, in defiance of everything.',
  },
  {
    id: 'dome-city',
    name: 'Housing Block',
    category: 'housing',
    description: '+100 population cap, −80 W. +40 cap per adjacent Habitation building.',
    cost: { flops: 20_000, ore: 250, alloys: 25 },
    costGrowth: 1.17,
    watts: -80,
    popCap: 100,
    adjacency: [{ match: { kind: 'category', category: 'housing' }, bonus: 40, label: 'adjacent Habitation building' }],
    researchCost: 700,
    tier: 4,
    flavor: 'The first building here that someone called home without irony.',
  },
  {
    id: 'arcology',
    name: 'Residential Tower',
    category: 'housing',
    description: '+500 population cap, −300 W. +250 cap per adjacent Residential Tower.',
    cost: { flops: 200_000, ore: 1_000, alloys: 150 },
    costGrowth: 1.2,
    watts: -300,
    popCap: 500,
    adjacency: [{ match: { kind: 'building', id: 'arcology' }, bonus: 250, label: 'adjacent Residential Tower' }],
    researchCost: 1800,
    tier: 5,
    flavor: 'A town that fits in one building, in a place that has neither.',
  },

  // ============ LOGISTICS ============
  {
    id: 'spaceport',
    name: 'Launch Pad',
    category: 'logistics',
    description: '−50 W. Required on Bedrock to send crews to a new site.',
    cost: { flops: 50_000, ore: 2_500, alloys: 100 },
    costGrowth: 1.3,
    watts: -50,
    adjacency: [],
    allowedTerrain: ['launchpad'],
    researchCost: 260,
    tier: 3,
    flavor: 'Somewhere out there is a better site. The survey drones already went.',
  },
];

export const BUILDING_MAP: Record<string, BuildingDef> = Object.fromEntries(
  BUILDINGS.map(b => [b.id, b])
);

export const getBuilding = (id: string): BuildingDef | undefined => BUILDING_MAP[id];

/** Terrain gating. Vent and Bedrock Shelf are specialised; Ore Seam is semi-open. */
export const canPlaceOnTerrain = (def: BuildingDef, terrain: TerrainType): boolean => {
  if (def.allowedTerrain) return def.allowedTerrain.includes(terrain);
  switch (terrain) {
    case 'vent':
      return def.category === 'power';
    case 'rocky':
      return def.category === 'mining' || def.category === 'power';
    case 'launchpad':
      return false; // reserved for the Spaceport
    default:
      return true;
  }
};

export interface ResourceInfo {
  /** Shown in the HUD. */
  name: string;
  /** Unit suffix, e.g. "1.2k FLOP/s". */
  unit: string;
  color: string;
  /** Plain-language explanation, surfaced on hover. */
  whatItIs: string;
  madeBy: string;
  spentOn: string;
}

export const RESOURCE_META: Record<ResourceKey, ResourceInfo> = {
  flops: {
    name: 'Compute',
    unit: 'FLOP',
    color: '#7fd6ff',
    whatItIs: 'The work your site can do. Your main construction currency.',
    madeBy: 'Compute buildings, and the Run Workload button.',
    spentOn: 'Building almost everything.',
  },
  ore: {
    name: 'Ore',
    unit: 't',
    color: '#d9a86c',
    whatItIs: 'Raw rock, dug out of the ground.',
    madeBy: 'Extraction buildings.',
    spentOn: 'Construction materials for larger buildings.',
  },
  data: {
    name: 'Research',
    unit: 'pts',
    color: '#5fe8d8',
    whatItIs: 'What your labs learn. Unlocks new kinds of building.',
    madeBy: 'Research buildings.',
    spentOn: 'Unlocking buildings you have not built before.',
  },
  alloys: {
    name: 'Alloys',
    unit: 't',
    color: '#c79bf0',
    whatItIs: 'Refined structural material.',
    madeBy: 'Manufacturing buildings, from Ore.',
    spentOn: 'Advanced buildings and new sites.',
  },
};

/** Power is a live budget, not a stored resource — it gets its own descriptor. */
export const POWER_INFO = {
  name: 'Power',
  unit: 'W',
  whatItIs: 'Generation must cover draw. It is not stored or spent.',
  madeBy: 'Power buildings.',
  spentOn: 'Every building that is not a power building.',
};
