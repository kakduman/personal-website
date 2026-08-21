// v3.4–v3.8: pure calculation layer for the Data Center Village.
// Nothing in here touches React or the DOM, so it can be unit-tested and reused.

import {
  BUILDINGS,
  BuildingCategory,
  BuildingDef,
  RESOURCE_META,
  ResourceKey,
  TerrainType,
  getBuilding,
} from '../data/buildings';
import {
  HOME_PLANET_ID,
  PLANETS,
  PLANET_MAP,
  PlanetDef,
  ZONES,
  generatePlanetTiles,
  zoneIndexForRing,
} from '../data/planets';
import { META_MAP, VICTORIES, metaCostAtLevel } from '../data/villageMeta';
import { calculateTechEffects } from '../data/techTree';
import { hexKey, neighborKeys } from '../utils/hexMath';

export const VILLAGE_VERSION = '3.8';
export const VILLAGE_STORAGE_KEY = 'personal-website::village-state';

export type Stage = 'cutscene' | 'village';

export interface TileState {
  terrain: TerrainType;
  ring: number;
  elevation: number;
  building: string | null;
  placedAt: number;
}

export interface SectorAssignment {
  mining: number;
  research: number;
  engineering: number;
  power: number;
}

export interface PlanetState {
  unlocked: boolean;
  tiles: Record<string, TileState>;
  population: number;
  assignment: SectorAssignment;
}

export interface Resources {
  flops: number;
  ore: number;
  data: number;
  alloys: number;
}

export interface VillageState {
  version: string;
  stage: Stage;
  resources: Resources;
  lifetimeFlops: number;
  planets: Record<string, PlanetState>;
  currentPlanetId: string;
  quantumShards: number;
  totalQuantumShards: number;
  quantumResets: number;
  metaUpgrades: Record<string, number>;
  achievements: string[];
  victories: string[];
  totalClicks: number;
  /** Building types bought with Research. Survives a Restructure. */
  unlockedBuildings: string[];
  /** Carried over from the clicker half of the game. */
  prestigeLevel: number;
  researchedNodes: string[];
  researchedParts: string[];
  preAGI: { celebrations: number; prestigeLevel: number; parts: number };
  lastTick: number;
}

// --- Construction -----------------------------------------------------------

export const emptyAssignment = (): SectorAssignment => ({
  mining: 0, research: 0, engineering: 0, power: 0,
});

export const createPlanetState = (planet: PlanetDef, unlocked: boolean): PlanetState => {
  const tiles: Record<string, TileState> = {};
  for (const tile of generatePlanetTiles(planet)) {
    tiles[hexKey(tile.q, tile.r)] = {
      terrain: tile.terrain,
      ring: tile.ring,
      elevation: tile.elevation,
      building: null,
      placedAt: 0,
    };
  }
  return { unlocked, tiles, population: 0, assignment: emptyAssignment() };
};

export const createInitialState = (carry?: Partial<VillageState>): VillageState => {
  const planets: Record<string, PlanetState> = {};
  for (const planet of PLANETS) {
    planets[planet.id] = createPlanetState(planet, planet.id === HOME_PLANET_ID);
  }
  return {
    version: VILLAGE_VERSION,
    stage: 'cutscene',
    resources: { flops: 0, ore: 0, data: 0, alloys: 0 },
    lifetimeFlops: 0,
    planets,
    currentPlanetId: HOME_PLANET_ID,
    quantumShards: 0,
    totalQuantumShards: 0,
    quantumResets: 0,
    metaUpgrades: {},
    achievements: [],
    victories: [],
    totalClicks: 0,
    unlockedBuildings: [],
    prestigeLevel: 0,
    researchedNodes: [],
    researchedParts: [],
    preAGI: { celebrations: 0, prestigeLevel: 0, parts: 0 },
    lastTick: Date.now(),
    ...carry,
  };
};

// --- Derived: global multipliers --------------------------------------------

export interface GlobalContext {
  /** Multiplier on every resource output across every world. */
  globalMultiplier: number;
  cheapConstruction: number;
  infinitePower: boolean;
  autoClick: number;
  popGrowthMultiplier: number;
  quantumMemory: boolean;
  omniscience: boolean;
  offlineFullRate: boolean;
}

export const metaLevel = (state: VillageState, id: string): number => state.metaUpgrades[id] ?? 0;

export const computeGlobalContext = (state: VillageState): GlobalContext => {
  let multiplier = 1;

  // Prestige carried over from the clicker: +5% per level, capped at +100%.
  multiplier *= 1 + Math.min(state.prestigeLevel * 0.05, 1);

  // Tech tree nodes survive the AGI event.
  const tech = calculateTechEffects(state.researchedNodes);
  multiplier *= 1 + tech.globalMultiplier;

  // The AGI Pioneer badge is worth a flat 10% in village mode.
  if (state.achievements.includes('agi-pioneer')) multiplier *= 1.1;

  // Meta upgrades.
  multiplier *= 1 + 0.10 * metaLevel(state, 'quantum-efficiency-1');
  multiplier *= 1 + 0.25 * metaLevel(state, 'quantum-efficiency-2');
  multiplier *= 1 + 0.50 * metaLevel(state, 'quantum-efficiency-3');

  // Victory conditions are permanent.
  for (const victoryId of state.victories) {
    const victory = VICTORIES.find(v => v.id === victoryId);
    if (victory) multiplier *= 1 + victory.productionBonus;
  }

  return {
    globalMultiplier: multiplier,
    cheapConstruction: Math.pow(0.85, metaLevel(state, 'cheap-construction')),
    infinitePower: metaLevel(state, 'infinite-power') > 0,
    autoClick: metaLevel(state, 'universal-automation') > 0 ? 5 : 0,
    popGrowthMultiplier: metaLevel(state, 'time-compression') > 0 ? 5 : 1,
    quantumMemory: metaLevel(state, 'quantum-memory') > 0,
    omniscience: metaLevel(state, 'omniscience') > 0,
    offlineFullRate: metaLevel(state, 'parallel-processing') > 0,
  };
};

// --- Derived: adjacency ------------------------------------------------------

export interface AdjacencyResult {
  /** Flat bonus added to the building's primary stat. */
  bonus: number;
  /** Human-readable breakdown for the inspector panel. */
  reasons: Array<{ label: string; count: number; amount: number }>;
  /** Neighbour tile keys that actually contributed — drawn as energy arcs. */
  contributors: string[];
}

export const computeAdjacency = (
  def: BuildingDef,
  key: string,
  tiles: Record<string, TileState>
): AdjacencyResult => {
  const [q, r] = key.split(',').map(Number);
  const neighbours = neighborKeys(q, r)
    .map(k => ({ key: k, tile: tiles[k] }))
    .filter((entry): entry is { key: string; tile: TileState } => Boolean(entry.tile));

  const reasons: AdjacencyResult['reasons'] = [];
  const contributors = new Set<string>();
  let bonus = 0;

  for (const rule of def.adjacency) {
    let matched: typeof neighbours = [];
    let count = 0;

    switch (rule.match.kind) {
      case 'building':
        matched = neighbours.filter(n => n.tile.building === (rule.match as any).id);
        count = matched.length;
        break;
      case 'category': {
        const target = (rule.match as any).category as BuildingCategory;
        matched = neighbours.filter(
          n => n.tile.building && getBuilding(n.tile.building)?.category === target
        );
        count = matched.length;
        break;
      }
      case 'terrain': {
        const target = (rule.match as any).terrain as TerrainType;
        matched = neighbours.filter(n => n.tile.terrain === target);
        count = matched.length;
        break;
      }
      case 'empty':
        matched = neighbours.filter(n => !n.tile.building);
        count = matched.length;
        break;
      case 'isolated':
        count = neighbours.some(n => n.tile.building) ? 0 : 1;
        break;
      case 'distinctCategories': {
        const built = neighbours.filter(n => n.tile.building);
        const categories = new Set(
          built
            .map(n => getBuilding(n.tile.building!)?.category)
            .filter(Boolean) as BuildingCategory[]
        );
        if (categories.size >= (rule.match as any).atLeast) {
          matched = built;
          count = 1;
        }
        break;
      }
    }

    if (count > 0) {
      const amount = rule.bonus * count;
      bonus += amount;
      reasons.push({ label: rule.label, count, amount });
      matched.forEach(n => contributors.add(n.key));
    }
  }

  return { bonus, reasons, contributors: Array.from(contributors) };
};

// --- Derived: per-tile production -------------------------------------------

export interface TileProduction {
  def: BuildingDef;
  /** Watts produced (positive) or drawn (negative), after all modifiers. */
  watts: number;
  /** Resource output per second after all modifiers (0 for housing/logistics). */
  outputAmount: number;
  outputResource: ResourceKey | null;
  popCap: number;
  baseStat: number;
  adjacency: AdjacencyResult;
  /** Ratio of bonus to base — used for the Cluster Theory achievement. */
  adjacencyRatio: number;
  terrainMultiplier: number;
  /** Every factor that went into `outputAmount`, so the UI can show the working. */
  breakdown: {
    base: number;
    adjacencyBonus: number;
    terrainMultiplier: number;
    siteMultiplier: number;
    sectorMultiplier: number;
    globalMultiplier: number;
    selfRamp: number;
  };
}

const VENT_WATT_BONUS = 1.25;

export const computeTileProduction = (
  key: string,
  tile: TileState,
  tiles: Record<string, TileState>,
  planet: PlanetDef,
  global: GlobalContext,
  sectorBonuses: SectorBonuses,
  now: number
): TileProduction | null => {
  if (!tile.building) return null;
  const def = getBuilding(tile.building);
  if (!def) return null;

  const adjacency = computeAdjacency(def, key, tiles);

  let terrainMultiplier = 1;
  if (def.category === 'mining' && tile.terrain === 'rocky') terrainMultiplier = 2;

  let watts = 0;
  let outputAmount = 0;
  let popCap = 0;
  let baseStat = 0;

  if (def.watts > 0) {
    baseStat = def.watts;
    watts = def.watts + adjacency.bonus;
    if (tile.terrain === 'vent') watts *= VENT_WATT_BONUS;
    watts *= planet.modifiers.power * (1 + sectorBonuses.power);
  } else if (def.watts < 0) {
    watts = def.watts * planet.modifiers.wattsDraw;
  }

  let selfRamp = 1;
  let siteMultiplier = 1;
  let sectorMultiplier = 1;

  if (def.output) {
    baseStat = def.output.amount;
    let amount = (def.output.amount + adjacency.bonus) * terrainMultiplier;

    // Automated Foundry ramps up the longer it has been running.
    if (def.id === 'self-replicator') {
      const minutes = Math.max(0, (now - tile.placedAt) / 60_000);
      selfRamp = 1 + Math.min(minutes * 0.1, 1);
      amount *= selfRamp;
    }

    siteMultiplier = categoryMultiplier(def.category, planet);
    sectorMultiplier = 1 + sectorBonusFor(def.category, sectorBonuses);
    amount *= siteMultiplier;
    amount *= sectorMultiplier;
    amount *= global.globalMultiplier;
    outputAmount = amount;
  }

  if (def.popCap) {
    baseStat = def.popCap;
    popCap = def.popCap + adjacency.bonus;
  }

  return {
    def,
    watts,
    outputAmount,
    outputResource: def.output?.resource ?? null,
    popCap,
    baseStat,
    adjacency,
    adjacencyRatio: baseStat > 0 ? adjacency.bonus / baseStat : 0,
    terrainMultiplier,
    breakdown: {
      base: def.output?.amount ?? def.popCap ?? Math.abs(def.watts),
      adjacencyBonus: adjacency.bonus,
      terrainMultiplier,
      siteMultiplier,
      sectorMultiplier,
      globalMultiplier: global.globalMultiplier,
      selfRamp,
    },
  };
};

const categoryMultiplier = (category: BuildingCategory, planet: PlanetDef): number => {
  switch (category) {
    case 'power': return planet.modifiers.power;
    case 'compute': return planet.modifiers.compute;
    case 'mining': return planet.modifiers.mining;
    case 'research': return planet.modifiers.research;
    case 'manufacturing': return planet.modifiers.manufacturing;
    default: return 1;
  }
};

// --- Derived: population sectors --------------------------------------------

export interface SectorBonuses {
  mining: number;
  research: number;
  engineering: number;
  power: number;
}

/** Each 10 workers in a sector is +10% to that sector, with diminishing scale. */
export const computeSectorBonuses = (assignment: SectorAssignment): SectorBonuses => ({
  mining: assignment.mining * 0.01,
  research: assignment.research * 0.01,
  engineering: assignment.engineering * 0.005,
  power: assignment.power * 0.01,
});

const sectorBonusFor = (category: BuildingCategory, bonuses: SectorBonuses): number => {
  switch (category) {
    case 'mining': return bonuses.mining;
    case 'research': return bonuses.research;
    case 'power': return bonuses.power;
    default: return 0;
  }
};

// --- Derived: whole-planet stats --------------------------------------------

export interface PlanetStats {
  planet: PlanetDef;
  buildingCount: number;
  wattsProduced: number;
  wattsConsumed: number;
  netWatts: number;
  efficiency: number;
  powerStatus: 'nominal' | 'strained' | 'critical' | 'blackout';
  popCap: number;
  population: number;
  populationBonus: number;
  unlockedZones: number;
  perTile: Record<string, TileProduction>;
  rates: Resources;
  bestAdjacencyRatio: number;
}

export const powerStatusFor = (netWatts: number, infinitePower: boolean): { status: PlanetStats['powerStatus']; efficiency: number } => {
  if (infinitePower || netWatts >= 0) return { status: 'nominal', efficiency: 1 };
  if (netWatts >= -20) return { status: 'strained', efficiency: 0.75 };
  if (netWatts >= -100) return { status: 'critical', efficiency: 0.5 };
  return { status: 'blackout', efficiency: 0 };
};

export const computePlanetStats = (
  planetId: string,
  state: VillageState,
  global: GlobalContext,
  now: number
): PlanetStats => {
  const planet = PLANET_MAP[planetId];
  const planetState = state.planets[planetId];
  const tiles = planetState.tiles;
  const sectorBonuses = computeSectorBonuses(planetState.assignment);

  const perTile: Record<string, TileProduction> = {};
  let wattsProduced = 0;
  let wattsConsumed = 0;
  let popCap = 0;
  let buildingCount = 0;
  let bestAdjacencyRatio = 0;

  for (const [key, tile] of Object.entries(tiles)) {
    const production = computeTileProduction(key, tile, tiles, planet, global, sectorBonuses, now);
    if (!production) continue;
    perTile[key] = production;
    buildingCount++;
    if (production.watts > 0) wattsProduced += production.watts;
    else wattsConsumed += -production.watts;
    popCap += production.popCap;
    bestAdjacencyRatio = Math.max(bestAdjacencyRatio, production.adjacencyRatio);
  }

  const netWatts = wattsProduced - wattsConsumed;
  const { status, efficiency } = powerStatusFor(netWatts, global.infinitePower);

  // Every citizen adds +0.5% to this planet's output, capped at +100%.
  const populationBonus = Math.min(planetState.population * 0.005, 1);

  const rates: Resources = { flops: 0, ore: 0, data: 0, alloys: 0 };
  for (const production of Object.values(perTile)) {
    if (!production.outputResource) continue;
    rates[production.outputResource] += production.outputAmount * efficiency * (1 + populationBonus);
  }

  const unlockedZones = unlockedZoneCount(buildingCount, planet);

  return {
    planet,
    buildingCount,
    wattsProduced,
    wattsConsumed,
    netWatts,
    efficiency,
    powerStatus: status,
    popCap,
    population: planetState.population,
    populationBonus,
    unlockedZones,
    perTile,
    rates,
    bestAdjacencyRatio,
  };
};

export const unlockedZoneCount = (buildingCount: number, planet: PlanetDef): number => {
  let count = 0;
  for (const zone of ZONES) {
    if (zone.ringFrom > planet.maxRing) break;
    if (buildingCount >= zone.requiresBuildings) count++;
    else break;
  }
  return Math.max(1, count);
};

export const isTileUnlocked = (tile: TileState, unlockedZones: number): boolean =>
  zoneIndexForRing(tile.ring) < unlockedZones;

// --- Derived: empire-wide ----------------------------------------------------

export interface EmpireStats {
  perPlanet: Record<string, PlanetStats>;
  rates: Resources;
  totalBuildings: number;
  totalPopulation: number;
  colonisedCount: number;
  global: GlobalContext;
}

export const computeEmpireStats = (state: VillageState, now: number): EmpireStats => {
  const global = computeGlobalContext(state);
  const perPlanet: Record<string, PlanetStats> = {};
  const rates: Resources = { flops: 0, ore: 0, data: 0, alloys: 0 };
  let totalBuildings = 0;
  let totalPopulation = 0;
  let colonisedCount = 0;

  for (const planet of PLANETS) {
    if (!state.planets[planet.id]?.unlocked) continue;
    colonisedCount++;
    const stats = computePlanetStats(planet.id, state, global, now);
    perPlanet[planet.id] = stats;
    totalBuildings += stats.buildingCount;
    totalPopulation += stats.population;
    (Object.keys(rates) as ResourceKey[]).forEach(key => {
      rates[key] += stats.rates[key];
    });
  }

  return { perPlanet, rates, totalBuildings, totalPopulation, colonisedCount, global };
};

// --- Costs -------------------------------------------------------------------

export const countBuildingsOnPlanet = (planetState: PlanetState, buildingId: string): number =>
  Object.values(planetState.tiles).filter(t => t.building === buildingId).length;

export const buildingCost = (
  def: BuildingDef,
  planetState: PlanetState,
  planet: PlanetDef,
  global: GlobalContext
): Partial<Record<ResourceKey, number>> => {
  const owned = countBuildingsOnPlanet(planetState, def.id);
  const growth = Math.pow(def.costGrowth, owned);
  const housingScale = def.category === 'housing' ? planet.modifiers.housingCost : 1;
  const out: Partial<Record<ResourceKey, number>> = {};
  for (const [key, value] of Object.entries(def.cost) as Array<[ResourceKey, number]>) {
    out[key] = Math.ceil(value * growth * housingScale * global.cheapConstruction);
  }
  return out;
};

export const canAfford = (cost: Partial<Record<ResourceKey, number>>, resources: Resources): boolean =>
  (Object.entries(cost) as Array<[ResourceKey, number]>).every(([key, value]) => resources[key] >= value);

export const payCost = (cost: Partial<Record<ResourceKey, number>>, resources: Resources): Resources => {
  const next = { ...resources };
  for (const [key, value] of Object.entries(cost) as Array<[ResourceKey, number]>) {
    next[key] -= value;
  }
  return next;
};

/** Buildings that need no Research, plus everything the player has paid to unlock. */
export const availableBuildings = (unlockedIds: string[]): BuildingDef[] =>
  BUILDINGS.filter(b => b.researchCost === 0 || unlockedIds.includes(b.id));

/**
 * The next few buildings worth saving Research for: cheapest first, so the palette
 * always shows a concrete next goal rather than a wall of locks.
 */
export const researchableBuildings = (unlockedIds: string[]): BuildingDef[] =>
  BUILDINGS
    .filter(b => b.researchCost > 0 && !unlockedIds.includes(b.id))
    .sort((a, b) => a.researchCost - b.researchCost || a.tier - b.tier);

// --- Quantum Reset -----------------------------------------------------------

export const quantumShardsFor = (state: VillageState, empire: EmpireStats): number => {
  const base = state.lifetimeFlops > 10 ? Math.floor(Math.log10(state.lifetimeFlops)) : 0;
  let bonus = 0;
  bonus += state.victories.length;
  bonus += 2 * PLANETS.filter(p => {
    const ps = state.planets[p.id];
    if (!ps?.unlocked) return false;
    return Object.values(ps.tiles).every(t => t.building !== null);
  }).length;
  if (state.researchedNodes.includes('agi')) bonus += 5;
  if (state.achievements.length >= 15) bonus += 10;
  return Math.max(0, base + bonus);
};

export const canQuantumReset = (state: VillageState, empire: EmpireStats): boolean =>
  state.lifetimeFlops >= 1e9 ||
  empire.colonisedCount >= PLANETS.length ||
  Boolean(state.planets['helios-ring']?.unlocked &&
    Object.values(state.planets['helios-ring'].tiles).every(t => t.building !== null));

export const applyQuantumReset = (state: VillageState, shards: number): VillageState => {
  const global = computeGlobalContext(state);
  const keepPerBuilding = global.quantumMemory ? 3 : 1;

  // Tally which buildings to re-seed on the home world.
  const kept: string[] = [];
  for (const def of BUILDINGS) {
    const built = PLANETS.reduce(
      (sum, p) => sum + countBuildingsOnPlanet(state.planets[p.id], def.id),
      0
    );
    if (built > 0) {
      for (let i = 0; i < Math.min(built, keepPerBuilding); i++) kept.push(def.id);
    }
  }

  const planets: Record<string, PlanetState> = {};
  for (const planet of PLANETS) {
    planets[planet.id] = createPlanetState(planet, planet.id === HOME_PLANET_ID);
  }

  // Re-seed kept buildings onto valid home-world tiles, innermost first.
  const home = planets[HOME_PLANET_ID];
  const homeDef = PLANET_MAP[HOME_PLANET_ID];
  const openKeys = Object.entries(home.tiles)
    .filter(([, t]) => t.ring <= 1)
    .sort((a, b) => a[1].ring - b[1].ring)
    .map(([k]) => k);
  const now = Date.now();
  for (const buildingId of kept) {
    const def = getBuilding(buildingId);
    if (!def) continue;
    const index = openKeys.findIndex(k => {
      const tile = home.tiles[k];
      return !tile.building && terrainAllows(def, tile.terrain);
    });
    if (index === -1) continue;
    home.tiles[openKeys[index]].building = buildingId;
    home.tiles[openKeys[index]].placedAt = now;
  }
  void homeDef;

  return {
    ...state,
    resources: { flops: 0, ore: 0, data: 0, alloys: 0 },
    lifetimeFlops: 0,
    planets,
    currentPlanetId: HOME_PLANET_ID,
    quantumShards: state.quantumShards + shards,
    totalQuantumShards: state.totalQuantumShards + shards,
    quantumResets: state.quantumResets + 1,
    lastTick: now,
  };
};

// Local copy so the engine does not need to import the placement helper twice.
const terrainAllows = (def: BuildingDef, terrain: TerrainType): boolean => {
  if (def.allowedTerrain) return def.allowedTerrain.includes(terrain);
  if (terrain === 'vent') return def.category === 'power';
  if (terrain === 'rocky') return def.category === 'mining' || def.category === 'power';
  if (terrain === 'launchpad') return false;
  return true;
};

export const metaUpgradeCost = (state: VillageState, id: string): number => {
  const def = META_MAP[id];
  if (!def) return Infinity;
  return metaCostAtLevel(def, metaLevel(state, id));
};

// --- Click power -------------------------------------------------------------

export const clickPower = (state: VillageState, empire: EmpireStats): number => {
  const home = empire.perPlanet[state.currentPlanetId];
  const aiCores = home
    ? Object.values(home.perTile).filter(p => p.def.id === 'ai-core').length
    : 0;
  const base = 1 + 0.1 * empire.totalPopulation + 10 * aiCores + state.prestigeLevel * 5;
  // Clicking scales with the settlement so it stays relevant, but sub-linearly.
  const scale = 1 + Math.sqrt(Math.max(0, empire.rates.flops)) * 0.5;
  return base * scale * empire.global.globalMultiplier;
};

// --- Formatting --------------------------------------------------------------

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

export const formatNumber = (value: number, decimals = 2): string => {
  if (!isFinite(value)) return '∞';
  if (value === 0) return '0';
  const negative = value < 0;
  const abs = Math.abs(value);
  if (abs < 1000) {
    const rounded = abs < 10 ? abs.toFixed(abs % 1 === 0 ? 0 : 1) : Math.round(abs).toString();
    return (negative ? '-' : '') + rounded;
  }
  const tier = Math.min(Math.floor(Math.log10(abs) / 3), SUFFIXES.length - 1);
  const scaled = abs / Math.pow(1000, tier);
  return (negative ? '-' : '') + scaled.toFixed(scaled < 100 ? decimals : 0) + SUFFIXES[tier];
};

export const formatRate = (value: number): string => `${formatNumber(value)}/s`;

export const resourceLabel = (key: ResourceKey): string => RESOURCE_META[key].name;
