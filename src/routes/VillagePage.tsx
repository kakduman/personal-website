// v3.3–v3.8: the Data Center Village.
//
// This page is deliberately standalone — it reads the clicker's prestige / tech-tree
// keys if they exist so progress carries over, but it never *requires* them. That
// keeps it testable in isolation while /celebrate is still being finished.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AGICutscene from '../components/AGIEvent/AGICutscene';
import BuildingPalette from '../components/Village/BuildingPalette';
import TileInspector from '../components/Village/TileInspector';
import VillageCanvas, { VillageCanvasHandle } from '../components/Village/VillageCanvas';
import {
  AchievementModal,
  DevModal,
  HelpModal,
  PlanetModal,
  QuantumModal,
} from '../components/Village/VillageModals';
import { RenderState, RenderTile } from '../components/Village/renderer';
import {
  BUILDINGS,
  CATEGORY_META,
  POWER_INFO,
  RESOURCE_META,
  ResourceKey,
  canPlaceOnTerrain,
  getBuilding,
} from '../data/buildings';
import { HOME_PLANET_ID, PLANETS, PLANET_MAP, ZONES } from '../data/planets';
import { ACHIEVEMENT_MAP, VICTORIES, VILLAGE_ACHIEVEMENTS } from '../data/villageMeta';
import {
  EmpireStats,
  PlanetState,
  VILLAGE_STORAGE_KEY,
  VILLAGE_VERSION,
  VillageState,
  applyQuantumReset,
  availableBuildings,
  researchableBuildings,
  buildingCost,
  canAfford,
  canQuantumReset,
  clickPower,
  computeAdjacency,
  computeEmpireStats,
  countBuildingsOnPlanet,
  createInitialState,
  createPlanetState,
  formatNumber,
  isTileUnlocked,
  metaLevel,
  metaUpgradeCost,
  payCost,
  quantumShardsFor,
  unlockedZoneCount,
} from '../game/villageEngine';
import './VillagePage.css';

const TICK_MS = 100;
const SAVE_MS = 5_000;
const MAX_OFFLINE_HOURS = 8;

// --- Save / load -------------------------------------------------------------

const readNumber = (key: string, fallback = 0): number => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : Number(raw) || fallback;
  } catch {
    return fallback;
  }
};

const readArray = (key: string): string[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/** Pull anything the clicker half of the game has already earned. */
const carryFromClicker = (): Partial<VillageState> => {
  const prestigeLevel = readNumber('personal-website::celebrate-prestige');
  const researchedNodes = readArray('personal-website::celebrate-researched-nodes');
  const researchedParts = readArray('personal-website::celebrate-researched-parts');
  return {
    prestigeLevel,
    researchedNodes,
    researchedParts,
    preAGI: {
      celebrations: readNumber('personal-website::celebrate-local-count'),
      prestigeLevel,
      parts: researchedParts.length,
    },
  };
};

const loadState = (): VillageState => {
  try {
    const raw = localStorage.getItem(VILLAGE_STORAGE_KEY);
    if (!raw) return createInitialState(carryFromClicker());
    const parsed = JSON.parse(raw) as VillageState;
    if (parsed.version !== VILLAGE_VERSION) {
      // Only one shipped version so far; anything else restarts with carry-over intact.
      return createInitialState({ ...carryFromClicker(), ...migrate(parsed) });
    }
    // Backfill any planet added after the save was written.
    for (const planet of PLANETS) {
      if (!parsed.planets[planet.id]) {
        parsed.planets[planet.id] = createPlanetState(planet, false);
      }
    }
    return parsed;
  } catch {
    return createInitialState(carryFromClicker());
  }
};

const migrate = (old: any): Partial<VillageState> => ({
  achievements: Array.isArray(old?.achievements) ? old.achievements : [],
  quantumShards: Number(old?.quantumShards) || 0,
  totalQuantumShards: Number(old?.totalQuantumShards) || 0,
  metaUpgrades: old?.metaUpgrades ?? {},
});

// --- Placement helpers --------------------------------------------------------

const placeableKeys = (
  planetState: PlanetState,
  buildingId: string,
  unlockedZones: number
): Set<string> => {
  const def = getBuilding(buildingId);
  const out = new Set<string>();
  if (!def) return out;
  const atLimit = def.limitPerPlanet !== undefined &&
    countBuildingsOnPlanet(planetState, def.id) >= def.limitPerPlanet;
  if (atLimit) return out;

  for (const [key, tile] of Object.entries(planetState.tiles)) {
    if (tile.building) continue;
    if (!isTileUnlocked(tile, unlockedZones)) continue;
    if (!canPlaceOnTerrain(def, tile.terrain)) continue;
    out.add(key);
  }
  return out;
};

const blockedReason = (
  planetState: PlanetState,
  buildingId: string,
  key: string,
  unlockedZones: number
): string => {
  const def = getBuilding(buildingId);
  const tile = planetState.tiles[key];
  if (!def || !tile) return 'Nothing here.';
  if (tile.building) return 'Tile already occupied.';
  if (!isTileUnlocked(tile, unlockedZones)) return 'This phase has not been permitted yet.';
  if (!canPlaceOnTerrain(def, tile.terrain)) {
    if (tile.terrain === 'launchpad') return 'Bedrock is reserved for a Launch Pad.';
    if (tile.terrain === 'vent') return 'Geothermal Vents take power buildings only.';
    if (tile.terrain === 'rocky') return 'Ore Deposits take extraction or power buildings only.';
    return 'Wrong ground for this building.';
  }
  if (def.limitPerPlanet !== undefined && countBuildingsOnPlanet(planetState, def.id) >= def.limitPerPlanet) {
    return `Limit ${def.limitPerPlanet} per site.`;
  }
  return 'Cannot build here.';
};

/** Used by the dev jumps to lay down a plausible settlement quickly. */
const autoBuild = (planetState: PlanetState, planetId: string, plan: string[]): void => {
  const planet = PLANET_MAP[planetId];
  for (const buildingId of plan) {
    const def = getBuilding(buildingId);
    if (!def) continue;
    const count = Object.values(planetState.tiles).filter(t => t.building).length;
    const zones = unlockedZoneCount(count, planet);
    const candidates = Object.entries(planetState.tiles)
      .filter(([, tile]) =>
        !tile.building && isTileUnlocked(tile, zones) && canPlaceOnTerrain(def, tile.terrain))
      // Put specialists on their specialist terrain first so plain regolith stays
      // free for the buildings that can only go there (housing, compute, labs).
      .sort((a, b) => {
        const score = (terrain: string) => {
          if (def.category === 'mining' && terrain === 'rocky') return 0;
          if (def.category === 'power' && terrain === 'vent') return 0;
          if (terrain === 'standard') return 1;
          return 2;
        };
        const diff = score(a[1].terrain) - score(b[1].terrain);
        return diff !== 0 ? diff : a[1].ring - b[1].ring;
      });
    if (!candidates.length) continue;
    const [key, tile] = candidates[0];
    planetState.tiles[key] = { ...tile, building: buildingId, placedAt: Date.now() - 120_000 };
  }
};

const repeat = (id: string, times: number): string[] => Array.from({ length: times }, () => id);

/** Dev jumps place buildings directly, so mark those types researched too. */
const syncUnlocks = (state: VillageState): VillageState => {
  const placed = new Set<string>();
  for (const planet of PLANETS) {
    for (const tile of Object.values(state.planets[planet.id].tiles)) {
      if (tile.building) placed.add(tile.building);
    }
  }
  return { ...state, unlockedBuildings: Array.from(placed) };
};

/** Shared by the "multi-planet" and "prestige" dev jumps. */
const buildMultiPlanetState = (carry: Partial<VillageState>): VillageState => {
  const next = createInitialState({ ...carry, stage: 'village' });
  autoBuild(next.planets[HOME_PLANET_ID], HOME_PLANET_ID, [
    ...repeat('solar-panel', 8), ...repeat('geothermal-plant', 5), ...repeat('fusion-reactor', 4),
    ...repeat('server-rack', 8), ...repeat('data-center', 6), ...repeat('supercomputer', 5),
    ...repeat('quantum-computer', 2),
    ...repeat('mining-drone', 6), ...repeat('deep-mine', 4), ...repeat('asteroid-harvester', 3),
    ...repeat('research-lab', 4), ...repeat('ai-lab', 3), ...repeat('quantum-lab', 2),
    ...repeat('fabricator', 3), ...repeat('smelter', 3), ...repeat('matter-compiler', 2),
    ...repeat('habitat-module', 4), ...repeat('hydroponics-bay', 3), ...repeat('dome-city', 3),
    'spaceport',
  ]);
  for (const planet of PLANETS.slice(1)) {
    next.planets[planet.id].unlocked = true;
    autoBuild(next.planets[planet.id], planet.id, [
      ...repeat('solar-panel', 5), ...repeat('geothermal-plant', 3), ...repeat('fusion-reactor', 2),
      ...repeat('server-rack', 5), ...repeat('data-center', 4),
      ...repeat('mining-drone', 3), ...repeat('deep-mine', 2),
      ...repeat('research-lab', 3), ...repeat('fabricator', 2),
      ...repeat('habitat-module', 3), 'spaceport',
    ]);
    next.planets[planet.id].population = 60;
  }
  next.resources = { flops: 2e8, ore: 5e6, data: 1e6, alloys: 2e6 };
  next.planets[HOME_PLANET_ID].population = 300;
  next.lifetimeFlops = 4e8;
  return next;
};

// --- Component ----------------------------------------------------------------

const VillagePage: React.FC = () => {
  const [state, setState] = useState<VillageState>(loadState);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [hoverBuildingId, setHoverBuildingId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [modal, setModal] = useState<'planets' | 'quantum' | 'records' | 'dev' | 'help' | null>(null);
  const [toast, setToast] = useState<{ text: string; tone: 'good' | 'bad' | 'info' } | null>(null);
  const [structureVersion, setStructureVersion] = useState(0);
  const [slowTick, setSlowTick] = useState(0);
  const [combo, setCombo] = useState(0);

  const canvasRef = useRef<VillageCanvasHandle>(null);
  const clickTimesRef = useRef<number[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  const bumpStructures = useCallback(() => setStructureVersion(v => v + 1), []);

  const showToast = useCallback((text: string, tone: 'good' | 'bad' | 'info' = 'info') => {
    setToast({ text, tone });
    window.setTimeout(() => setToast(current => (current?.text === text ? null : current)), 3600);
  }, []);

  // --- derived stats ---

  const empire: EmpireStats = useMemo(
    () => computeEmpireStats(state, Date.now()),
    // Recomputed when structures change and once per second for time-based output.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [structureVersion, slowTick, state.currentPlanetId, state.metaUpgrades, state.victories, state.planets]
  );
  const empireRef = useRef(empire);
  empireRef.current = empire;

  const planetDef = PLANET_MAP[state.currentPlanetId];
  const planetState = state.planets[state.currentPlanetId];
  const planetStats = empire.perPlanet[state.currentPlanetId];
  const unlockedZones = planetStats?.unlockedZones ?? 1;

  const unlockedBuildings = useMemo(
    () => availableBuildings(state.unlockedBuildings),
    [state.unlockedBuildings]
  );

  const researchableList = useMemo(
    () => researchableBuildings(state.unlockedBuildings),
    [state.unlockedBuildings]
  );

  const costs = useMemo(() => {
    const out: Record<string, Partial<Record<ResourceKey, number>>> = {};
    for (const def of BUILDINGS) {
      out[def.id] = buildingCost(def, planetState, planetDef, empire.global);
    }
    return out;
  }, [planetState, planetDef, empire.global]);

  const owned = useMemo(() => {
    const out: Record<string, number> = {};
    for (const tile of Object.values(planetState.tiles)) {
      if (tile.building) out[tile.building] = (out[tile.building] ?? 0) + 1;
    }
    return out;
  }, [planetState]);

  const validPlacement = useMemo(
    () => (selectedBuildingId ? placeableKeys(planetState, selectedBuildingId, unlockedZones) : new Set<string>()),
    [selectedBuildingId, planetState, unlockedZones]
  );

  /** Omniscience: the unlocked, affordable tile with the biggest adjacency payoff. */
  const bestKey = useMemo(() => {
    if (!selectedBuildingId || !empire.global.omniscience) return null;
    const def = getBuilding(selectedBuildingId);
    if (!def) return null;
    let best: { key: string; bonus: number } | null = null;
    validPlacement.forEach(key => {
      const simulated = { ...planetState.tiles, [key]: { ...planetState.tiles[key], building: def.id } };
      const bonus = computeAdjacency(def, key, simulated).bonus;
      if (!best || bonus > best.bonus) best = { key, bonus };
    });
    return best ? (best as { key: string; bonus: number }).key : null;
  }, [selectedBuildingId, validPlacement, planetState, empire.global.omniscience]);

  const hasSpaceport = useMemo(
    () => PLANETS.some(p => countBuildingsOnPlanet(state.planets[p.id], 'spaceport') > 0),
    [state.planets]
  );

  const shardPreview = useMemo(() => quantumShardsFor(state, empire), [state, empire]);
  const resetAvailable = useMemo(() => canQuantumReset(state, empire), [state, empire]);

  // --- render state for the canvas ---

  /** Details for whichever Build-panel card the pointer is over. */
  const catalogue = useMemo(() => {
    if (!hoverBuildingId) return null;
    const def = getBuilding(hoverBuildingId);
    if (!def) return null;
    const cost = costs[def.id] ?? def.cost;
    const locked = def.researchCost > 0 && !state.unlockedBuildings.includes(def.id);
    return {
      def,
      cost,
      owned: owned[def.id] ?? 0,
      affordable: canAfford(cost, state.resources),
      locked,
      canResearch: state.resources.data >= def.researchCost,
    };
  }, [hoverBuildingId, costs, owned, state.resources, state.unlockedBuildings]);

  /** Adjacency the selected building *would* get on the hovered tile. */
  const previewAdjacency = useMemo(() => {
    if (!selectedBuildingId || !hoverKey) return null;
    const def = getBuilding(selectedBuildingId);
    const tile = planetState.tiles[hoverKey];
    if (!def || !tile || tile.building) return null;
    return computeAdjacency(def, hoverKey, {
      ...planetState.tiles,
      [hoverKey]: { ...tile, building: def.id },
    });
  }, [selectedBuildingId, hoverKey, planetState]);

  const renderState: RenderState = useMemo(() => {
    // Only neighbours that actually feed the hovered tile get an energy arc.
    const linkedKeys = new Set<string>(
      hoverKey
        ? planetStats?.perTile[hoverKey]?.adjacency.contributors ?? previewAdjacency?.contributors ?? []
        : []
    );

    const tiles: RenderTile[] = Object.entries(planetState.tiles).map(([key, tile]) => {
      const production = planetStats?.perTile[key];
      return {
        key,
        q: Number(key.split(',')[0]),
        r: Number(key.split(',')[1]),
        terrain: tile.terrain,
        ring: tile.ring,
        elevation: tile.elevation,
        building: tile.building,
        unlocked: isTileUnlocked(tile, unlockedZones),
        powered: (planetStats?.efficiency ?? 1) > 0,
        linked: linkedKeys.has(key),
        adjacencyRatio: production?.adjacencyRatio ?? 0,
      };
    });

    return {
      tiles,
      palette: planetDef.palette,
      planetId: planetDef.id,
      maxRing: planetDef.maxRing,
      hoverKey,
      selectedBuildingId,
      validPlacement,
      bestKey,
      efficiency: planetStats?.efficiency ?? 1,
    };
  }, [planetState, planetStats, planetDef, hoverKey, selectedBuildingId, validPlacement, bestKey, unlockedZones, previewAdjacency]);

  // --- main loop ---

  useEffect(() => {
    if (state.stage !== 'village') return undefined;
    const interval = window.setInterval(() => {
      const dt = TICK_MS / 1000;
      const stats = empireRef.current;
      setState(current => {
        const resources = { ...current.resources };
        (Object.keys(resources) as ResourceKey[]).forEach(key => {
          resources[key] += stats.rates[key] * dt;
        });

        const planets = { ...current.planets };
        let changed = false;
        for (const planet of PLANETS) {
          const ps = planets[planet.id];
          if (!ps?.unlocked) continue;
          const planetStatsForId = stats.perPlanet[planet.id];
          if (!planetStatsForId || planetStatsForId.efficiency <= 0) continue;
          if (ps.population < planetStatsForId.popCap) {
            const growth = 0.34 * stats.global.popGrowthMultiplier * dt;
            planets[planet.id] = {
              ...ps,
              population: Math.min(planetStatsForId.popCap, ps.population + growth),
            };
            changed = true;
          } else if (ps.population > planetStatsForId.popCap) {
            planets[planet.id] = { ...ps, population: planetStatsForId.popCap };
            changed = true;
          }
        }

        return {
          ...current,
          resources,
          lifetimeFlops: current.lifetimeFlops + stats.rates.flops * dt,
          planets: changed ? planets : current.planets,
          lastTick: Date.now(),
        };
      });
    }, TICK_MS);
    return () => window.clearInterval(interval);
  }, [state.stage]);

  // Recompute time-dependent production once a second.
  useEffect(() => {
    const interval = window.setInterval(() => setSlowTick(t => t + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Universal Automation clicks for you.
  useEffect(() => {
    if (state.stage !== 'village' || !empire.global.autoClick) return undefined;
    const interval = window.setInterval(() => {
      const stats = empireRef.current;
      const gain = clickPower(stateRef.current, stats);
      setState(current => ({
        ...current,
        resources: { ...current.resources, flops: current.resources.flops + gain },
        lifetimeFlops: current.lifetimeFlops + gain,
      }));
    }, 1000 / empire.global.autoClick);
    return () => window.clearInterval(interval);
  }, [state.stage, empire.global.autoClick]);

  // Autosave.
  useEffect(() => {
    const interval = window.setInterval(() => {
      try {
        localStorage.setItem(VILLAGE_STORAGE_KEY, JSON.stringify({ ...stateRef.current, lastTick: Date.now() }));
      } catch {
        /* storage full or unavailable — the game keeps running in memory */
      }
    }, SAVE_MS);
    return () => window.clearInterval(interval);
  }, []);

  // Offline progress, granted once on mount.
  useEffect(() => {
    const loaded = stateRef.current;
    if (loaded.stage !== 'village') return;
    const elapsed = (Date.now() - loaded.lastTick) / 1000;
    if (elapsed < 60) return;
    const capped = Math.min(elapsed, MAX_OFFLINE_HOURS * 3600);
    const stats = computeEmpireStats(loaded, Date.now());
    const rate = metaLevel(loaded, 'parallel-processing') > 0 ? 1 : 0.35;
    const gained = stats.rates.flops * capped * rate;
    if (gained <= 0) return;
    setState(current => ({
      ...current,
      resources: {
        flops: current.resources.flops + gained,
        ore: current.resources.ore + stats.rates.ore * capped * rate,
        data: current.resources.data + stats.rates.data * capped * rate,
        alloys: current.resources.alloys + stats.rates.alloys * capped * rate,
      },
      lifetimeFlops: current.lifetimeFlops + gained,
    }));
    showToast(
      `While you were away: +${formatNumber(gained)} FLOPS over ${(capped / 60).toFixed(0)} min`,
      'good'
    );
  }, [showToast]);

  // Achievements and victories.
  useEffect(() => {
    if (state.stage !== 'village') return;
    const unlocked: string[] = [];
    const has = (id: string) => state.achievements.includes(id);
    const add = (id: string, condition: boolean) => {
      if (condition && !has(id)) unlocked.push(id);
    };

    const everyBuildingBuilt = BUILDINGS.every(def =>
      PLANETS.some(p => countBuildingsOnPlanet(state.planets[p.id], def.id) > 0)
    );
    const anyFullZone = ZONES.some(zone => {
      const tiles = Object.values(planetState.tiles).filter(t => t.ring >= zone.ringFrom && t.ring <= zone.ringTo);
      return tiles.length > 0 && tiles.every(t => t.building);
    });

    add('first-steps', empire.totalBuildings >= 1);
    add('ten-buildings', empire.totalBuildings >= 10);
    add('fifty-buildings', empire.totalBuildings >= 50);
    add('hundred-buildings', empire.totalBuildings >= 100);
    add('power-hungry', (planetStats?.wattsProduced ?? 0) >= 1000);
    add('lights-out', (planetStats?.powerStatus ?? 'nominal') === 'blackout');
    add('cluster-theory', (planetStats?.bestAdjacencyRatio ?? 0) >= 2);
    add('full-zone', anyFullZone);
    add('population-100', empire.totalPopulation >= 100);
    add('megaflop', empire.rates.flops >= 1e6);
    add('exascale', empire.rates.flops >= 1e12);
    add('interplanetary', empire.colonisedCount >= 2);
    add('six-worlds', empire.colonisedCount >= PLANETS.length);
    add('quantum-leaper', state.quantumResets >= 1);
    add('the-cracker', PLANETS.some(p => countBuildingsOnPlanet(state.planets[p.id], 'planet-cracker') > 0));
    add('self-replicating', PLANETS.some(p => countBuildingsOnPlanet(state.planets[p.id], 'self-replicator') > 0));
    add('completionist', everyBuildingBuilt);

    const victories: string[] = [];
    const addVictory = (id: string, condition: boolean) => {
      if (condition && !state.victories.includes(id)) victories.push(id);
    };
    const heliosFull = Boolean(
      state.planets['helios-ring']?.unlocked &&
      Object.values(state.planets['helios-ring'].tiles).every(t => t.building)
    );
    addVictory('small-empire', empire.colonisedCount >= 3 && empire.totalBuildings >= 200);
    addVictory('galactic-power', empire.colonisedCount >= PLANETS.length);
    addVictory('dyson-complete', heliosFull);
    addVictory('exascale', empire.rates.flops >= 1e12);
    addVictory('universal', everyBuildingBuilt && state.achievements.length >= VILLAGE_ACHIEVEMENTS.length - 1);

    if (!unlocked.length && !victories.length) return;

    setState(current => ({
      ...current,
      achievements: [...current.achievements, ...unlocked.filter(id => !current.achievements.includes(id))],
      victories: [...current.victories, ...victories.filter(id => !current.victories.includes(id))],
    }));

    const headline = unlocked[0] ?? victories[0];
    if (unlocked.length) showToast(`🏅 ${ACHIEVEMENT_MAP[headline]?.name ?? headline}`, 'good');
    else showToast(`🏆 Victory: ${VICTORIES.find(v => v.id === headline)?.name}`, 'good');
  }, [empire, state.achievements, state.victories, state.planets, state.quantumResets, state.stage, planetStats, planetState, showToast]);

  // Esc cancels placement.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedBuildingId(null);
        setModal(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Combo decay.
  useEffect(() => {
    const interval = window.setInterval(() => {
      const cutoff = Date.now() - 3000;
      clickTimesRef.current = clickTimesRef.current.filter(t => t > cutoff);
      setCombo(comboTier(clickTimesRef.current.length));
    }, 400);
    return () => window.clearInterval(interval);
  }, []);

  // --- actions ---

  const handlePlace = useCallback(
    (key: string) => {
      if (!selectedBuildingId) return;
      const def = getBuilding(selectedBuildingId);
      if (!def) return;

      const tile = planetState.tiles[key];
      if (tile && !isTileUnlocked(tile, unlockedZones)) {
        // Clicking outside the permitted area means "never mind", not "try harder".
        setSelectedBuildingId(null);
        return;
      }
      if (!validPlacement.has(key)) {
        showToast(blockedReason(planetState, selectedBuildingId, key, unlockedZones), 'bad');
        return;
      }
      const cost = costs[def.id];
      if (!canAfford(cost, state.resources)) {
        const missing = (Object.entries(cost) as Array<[ResourceKey, number]>)
          .filter(([res, value]) => state.resources[res] < value)
          .map(([res]) => RESOURCE_META[res].name)
          .join(', ');
        showToast(`Not enough ${missing}.`, 'bad');
        return;
      }

      setState(current => {
        const planet = current.planets[current.currentPlanetId];
        const tile = planet.tiles[key];
        if (!tile || tile.building) return current;
        return {
          ...current,
          resources: payCost(cost, current.resources),
          planets: {
            ...current.planets,
            [current.currentPlanetId]: {
              ...planet,
              tiles: { ...planet.tiles, [key]: { ...tile, building: def.id, placedAt: Date.now() } },
            },
          },
        };
      });

      canvasRef.current?.burst(key, CATEGORY_META[def.category].accent);
      canvasRef.current?.float(key, def.name, CATEGORY_META[def.category].color);
      bumpStructures();
    },
    [selectedBuildingId, validPlacement, costs, state.resources, planetState, unlockedZones, showToast, bumpStructures]
  );

  const handleDemolish = useCallback(
    (key: string) => {
      const tile = planetState.tiles[key];
      if (!tile?.building) return;
      const def = getBuilding(tile.building);
      if (!def) return;
      const refund = Math.floor((costs[def.id]?.ore ?? 0) / 2);

      setState(current => {
        const planet = current.planets[current.currentPlanetId];
        const target = planet.tiles[key];
        if (!target?.building) return current;
        return {
          ...current,
          resources: { ...current.resources, ore: current.resources.ore + refund },
          planets: {
            ...current.planets,
            [current.currentPlanetId]: {
              ...planet,
              tiles: { ...planet.tiles, [key]: { ...target, building: null, placedAt: 0 } },
            },
          },
        };
      });
      canvasRef.current?.burst(key, '#ff9a6b');
      showToast(`Demolished ${def.name}${refund ? ` · +${refund} ore` : ''}`, 'info');
      bumpStructures();
    },
    [planetState, costs, showToast, bumpStructures]
  );

  const handleCompute = useCallback(() => {
    const now = Date.now();
    clickTimesRef.current = [...clickTimesRef.current.filter(t => t > now - 3000), now];
    const tier = comboTier(clickTimesRef.current.length);
    setCombo(tier);

    const gain = clickPower(stateRef.current, empireRef.current) * COMBO_MULTIPLIER[tier];
    setState(current => ({
      ...current,
      resources: { ...current.resources, flops: current.resources.flops + gain },
      lifetimeFlops: current.lifetimeFlops + gain,
      totalClicks: current.totalClicks + 1,
    }));
    canvasRef.current?.floatCenter(`+${formatNumber(gain)}`, tier >= 4 ? '#ffd76b' : '#9fe8ff');
  }, []);

  const handleColonise = useCallback(
    (planetId: string) => {
      const planet = PLANET_MAP[planetId];
      if (!planet) return;
      if (state.resources.flops < planet.cost.flops || state.resources.alloys < planet.cost.alloys) return;
      setState(current => ({
        ...current,
        resources: {
          ...current.resources,
          flops: current.resources.flops - planet.cost.flops,
          alloys: current.resources.alloys - planet.cost.alloys,
        },
        planets: { ...current.planets, [planetId]: { ...current.planets[planetId], unlocked: true } },
        currentPlanetId: planetId,
      }));
      setModal(null);
      canvasRef.current?.fitToContent();
      showToast(`Colony established on ${planet.name}.`, 'good');
      bumpStructures();
    },
    [state.resources, showToast, bumpStructures]
  );

  const handleResearch = useCallback(
    (buildingId: string) => {
      const def = getBuilding(buildingId);
      if (!def) return;
      if (stateRef.current.resources.data < def.researchCost) return;
      setState(current => ({
        ...current,
        resources: { ...current.resources, data: current.resources.data - def.researchCost },
        unlockedBuildings: current.unlockedBuildings.includes(buildingId)
          ? current.unlockedBuildings
          : [...current.unlockedBuildings, buildingId],
      }));
      showToast(`${def.name} unlocked — you can build it now.`, 'good');
    },
    [showToast]
  );

  const handleQuantumReset = useCallback(() => {
    setState(current => applyQuantumReset(current, quantumShardsFor(current, empireRef.current)));
    setModal(null);
    setSelectedBuildingId(null);
    canvasRef.current?.fitToContent();
    showToast('Wavefunction collapsed. Shards banked.', 'good');
    bumpStructures();
  }, [showToast, bumpStructures]);

  const handleBuyMeta = useCallback(
    (id: string) => {
      const cost = metaUpgradeCost(stateRef.current, id);
      if (stateRef.current.quantumShards < cost) return;
      setState(current => ({
        ...current,
        quantumShards: current.quantumShards - cost,
        metaUpgrades: { ...current.metaUpgrades, [id]: (current.metaUpgrades[id] ?? 0) + 1 },
      }));
      bumpStructures();
    },
    [bumpStructures]
  );

  // --- dev jumps ---

  const applyDevJump = useCallback(
    (id: string) => {
      const carry = carryFromClicker();
      const fresh = () => createInitialState({ ...carry, stage: 'village' });

      let next: VillageState;
      switch (id) {
        case 'cutscene':
          next = createInitialState({ ...carry, stage: 'cutscene' });
          break;

        case 'fresh':
          next = fresh();
          next.resources.flops = 900;
          break;

        case 'early': {
          next = fresh();
          autoBuild(next.planets[HOME_PLANET_ID], HOME_PLANET_ID, [
            ...repeat('solar-panel', 4), ...repeat('server-rack', 4),
            ...repeat('mining-drone', 2), ...repeat('habitat-module', 2),
          ]);
          next.resources = { flops: 25_000, ore: 400, data: 60, alloys: 0 };
          next.planets[HOME_PLANET_ID].population = 6;
          break;
        }

        case 'mid': {
          next = fresh();
          autoBuild(next.planets[HOME_PLANET_ID], HOME_PLANET_ID, [
            ...repeat('solar-panel', 6), ...repeat('wind-turbine', 3), ...repeat('geothermal-plant', 3),
            ...repeat('server-rack', 6), ...repeat('data-center', 4), ...repeat('supercomputer', 2),
            ...repeat('mining-drone', 4), ...repeat('deep-mine', 2),
            ...repeat('research-lab', 3), ...repeat('ai-lab', 1),
            ...repeat('fabricator', 2), ...repeat('habitat-module', 3), ...repeat('hydroponics-bay', 2),
          ]);
          next.resources = { flops: 400_000, ore: 30_000, data: 5_000, alloys: 2_000 };
          next.planets[HOME_PLANET_ID].population = 40;
          next.lifetimeFlops = 2e6;
          break;
        }

        case 'spaceport': {
          next = fresh();
          autoBuild(next.planets[HOME_PLANET_ID], HOME_PLANET_ID, [
            ...repeat('solar-panel', 8), ...repeat('wind-turbine', 4), ...repeat('geothermal-plant', 5),
            ...repeat('fusion-reactor', 3),
            ...repeat('server-rack', 8), ...repeat('data-center', 6), ...repeat('supercomputer', 4),
            ...repeat('mining-drone', 6), ...repeat('deep-mine', 4), ...repeat('asteroid-harvester', 2),
            ...repeat('research-lab', 4), ...repeat('ai-lab', 3), ...repeat('quantum-lab', 1),
            ...repeat('fabricator', 3), ...repeat('smelter', 2),
            ...repeat('habitat-module', 4), ...repeat('hydroponics-bay', 3), ...repeat('dome-city', 2),
            'spaceport',
          ]);
          next.resources = { flops: 5_000_000, ore: 200_000, data: 50_000, alloys: 60_000 };
          next.planets[HOME_PLANET_ID].population = 160;
          next.lifetimeFlops = 5e7;
          break;
        }

        case 'multi':
          next = buildMultiPlanetState(carry);
          break;

        case 'prestige': {
          next = buildMultiPlanetState(carry);
          next.lifetimeFlops = 1.4e9;
          next.resources.flops = 2e9;
          break;
        }

        case 'loaded': {
          next = { ...stateRef.current, quantumShards: 500, totalQuantumShards: 500, stage: 'village' };
          break;
        }

        case 'brownout': {
          const current = stateRef.current;
          const planet = current.planets[current.currentPlanetId];
          const tiles = { ...planet.tiles };
          for (const [key, tile] of Object.entries(tiles)) {
            const def = tile.building ? getBuilding(tile.building) : null;
            if (def && def.watts > 0) tiles[key] = { ...tile, building: null, placedAt: 0 };
          }
          next = {
            ...current,
            planets: { ...current.planets, [current.currentPlanetId]: { ...planet, tiles } },
          };
          break;
        }

        default:
          return;
      }

      setState(syncUnlocks(next));
      setModal(null);
      setSelectedBuildingId(null);
      canvasRef.current?.fitToContent();
      bumpStructures();
      showToast(`Jumped to: ${id}`, 'info');
    },
    [bumpStructures, showToast]
  );

  const wipeSave = useCallback(() => {
    localStorage.removeItem(VILLAGE_STORAGE_KEY);
    setState(createInitialState(carryFromClicker()));
    setModal(null);
    bumpStructures();
  }, [bumpStructures]);

  // --- cutscene gate ---

  if (state.stage === 'cutscene') {
    return (
      <AGICutscene
        stats={state.preAGI}
        onComplete={() =>
          setState(current => ({
            ...current,
            stage: 'village',
            resources: { ...current.resources, flops: Math.max(current.resources.flops, 900) },
            achievements: current.achievements.includes('agi-pioneer')
              ? current.achievements
              : [...current.achievements, 'agi-pioneer'],
            lastTick: Date.now(),
          }))
        }
      />
    );
  }

  // --- inspector inputs ---

  const hoveredTile = hoverKey ? planetState.tiles[hoverKey] ?? null : null;
  const hoveredProduction = hoverKey ? planetStats?.perTile[hoverKey] ?? null : null;
  const previewDef = selectedBuildingId ? getBuilding(selectedBuildingId) : null;
  const preview =
    previewDef && hoverKey && hoveredTile && !hoveredTile.building
      ? {
          def: previewDef,
          bonus: validPlacement.has(hoverKey) ? previewAdjacency?.bonus ?? 0 : 0,
          valid: validPlacement.has(hoverKey),
          reason: blockedReason(planetState, previewDef.id, hoverKey, unlockedZones),
        }
      : null;

  const nextZone = ZONES[unlockedZones];
  const powerStatus = planetStats?.powerStatus ?? 'nominal';

  return (
    <div className="village-page">
      <VillageCanvas
        ref={canvasRef}
        render={renderState}
        onHover={setHoverKey}
        onClickTile={handlePlace}
        onClickAway={() => setSelectedBuildingId(null)}
        onRightClickTile={handleDemolish}
      />

      {/* ---- Top HUD ---- */}
      <header className="vg-hud">
        <Link to="/" className="vg-home">← Home</Link>

        <div className="vg-resources">
          {(['flops', 'ore', 'data', 'alloys'] as ResourceKey[]).map(key => {
            const info = RESOURCE_META[key];
            return (
              <div
                key={key}
                className="vg-resource"
                title={`${info.name} — ${info.whatItIs}\nMade by: ${info.madeBy}\nSpent on: ${info.spentOn}`}
              >
                <span className="vg-res-name">{info.name}</span>
                <span className="vg-res-amount" style={{ color: info.color }}>
                  {formatNumber(state.resources[key])}
                </span>
                <span className="vg-res-rate">
                  {empire.rates[key] > 0 ? '+' : ''}{formatNumber(empire.rates[key])}/s
                </span>
              </div>
            );
          })}
        </div>

        <div
          className={`vg-power vg-power-${powerStatus}`}
          title={`${POWER_INFO.name} — ${POWER_INFO.whatItIs}`}
        >
          <div className="vg-power-head">
            <span className="vg-res-name">Power</span>
            <span className="vg-power-status">{POWER_LABEL[powerStatus]}</span>
          </div>
          <div className="vg-power-numbers">
            <strong>{formatNumber(planetStats?.wattsConsumed ?? 0)} W</strong>
            <span>used of</span>
            <strong>{formatNumber(planetStats?.wattsProduced ?? 0)} W</strong>
          </div>
          <div className="vg-power-bar">
            <div
              className="vg-power-fill"
              style={{
                width: `${Math.min(100, ((planetStats?.wattsConsumed ?? 0) / Math.max(1, planetStats?.wattsProduced ?? 1)) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="vg-pop" title="Workers living on site. Each one adds a little output, up to +100%.">
          <span className="vg-res-name">Workers</span>
          <span className="vg-pop-count">
            {Math.floor(planetStats?.population ?? 0)}<em> / {formatNumber(planetStats?.popCap ?? 0)}</em>
          </span>
          <span className="vg-pop-bonus">+{Math.round((planetStats?.populationBonus ?? 0) * 100)}% output</span>
        </div>

        <div className="vg-hud-buttons">
          <button onClick={() => setModal('help')}>How this works</button>
          <button onClick={() => setModal('planets')}>Sites<em>{empire.colonisedCount}</em></button>
          <button onClick={() => setModal('quantum')}>Restructure<em>{state.quantumShards}</em></button>
          <button onClick={() => setModal('records')}>Records<em>{state.achievements.length}</em></button>
          <button className="dev" onClick={() => setModal('dev')}>Dev</button>
        </div>
      </header>

      {/* ---- Planet banner ---- */}
      <div className="vg-site-strip">
        <span className="vg-site-name">{planetDef.name}</span>
        <span className="vg-site-sep">·</span>
        <span>{planetDef.subtitle}</span>
        <span className="vg-site-sep">·</span>
        <span>{planetStats?.buildingCount ?? 0} structures</span>
        <span className="vg-site-sep">·</span>
        <span>×{empire.global.globalMultiplier.toFixed(2)}</span>
        {nextZone && (
          <span className="vg-site-next">
            {nextZone.name} at {nextZone.requiresBuildings}
            <em>{planetStats?.buildingCount ?? 0}/{nextZone.requiresBuildings}</em>
          </span>
        )}
      </div>

      {/* ---- Side panels ---- */}
      <aside className="vg-left">
        <BuildingPalette
          unlocked={unlockedBuildings}
          researchable={researchableList}
          onResearch={handleResearch}
          costs={costs}
          owned={owned}
          resources={state.resources}
          selectedId={selectedBuildingId}
          onSelect={setSelectedBuildingId}
          onHoverBuilding={setHoverBuildingId}
          totalBuildings={empire.totalBuildings}
        />
      </aside>

      <aside className="vg-right">
        <TileInspector
          tile={hoveredTile}
          tileKey={hoverKey}
          production={hoveredProduction}
          unlocked={hoveredTile ? isTileUnlocked(hoveredTile, unlockedZones) : false}
          planet={planetDef}
          efficiency={planetStats?.efficiency ?? 1}
          populationBonus={planetStats?.populationBonus ?? 0}
          preview={preview}
          catalogue={catalogue}
          onDemolish={handleDemolish}
        />
      </aside>

      {/* ---- Compute button ---- */}
      <div className="vg-compute-dock">
        {combo > 0 && (
          <div className="vg-combo" data-tier={combo}>
            Combo ×{COMBO_MULTIPLIER[combo].toFixed(2)}
          </div>
        )}
        <button className="vg-compute" onClick={handleCompute}>
          <span className="vg-compute-label">RUN WORKLOAD</span>
          <span className="vg-compute-value">
            +{formatNumber(clickPower(state, empire) * COMBO_MULTIPLIER[combo])} Compute
          </span>
        </button>
      </div>

      {toast && <div className={`vg-toast ${toast.tone}`}>{toast.text}</div>}

      {modal === 'planets' && (
        <PlanetModal
          state={state}
          empire={empire}
          hasSpaceport={hasSpaceport}
          onColonise={handleColonise}
          onSwitch={planetId => {
            setState(current => ({ ...current, currentPlanetId: planetId }));
            canvasRef.current?.fitToContent();
            bumpStructures();
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'quantum' && (
        <QuantumModal
          state={state}
          shardPreview={shardPreview}
          canReset={resetAvailable}
          onReset={handleQuantumReset}
          onBuyMeta={handleBuyMeta}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'help' && <HelpModal onClose={() => setModal(null)} />}
      {modal === 'records' && <AchievementModal state={state} onClose={() => setModal(null)} />}
      {modal === 'dev' && (
        <DevModal onJump={applyDevJump} onWipe={wipeSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
};

// --- Combo ---------------------------------------------------------------------

const COMBO_MULTIPLIER = [1, 1.1, 1.25, 1.5, 2, 3];

const comboTier = (clicksInWindow: number): number => {
  if (clicksInWindow >= 22) return 5;
  if (clicksInWindow >= 16) return 4;
  if (clicksInWindow >= 11) return 3;
  if (clicksInWindow >= 7) return 2;
  if (clicksInWindow >= 4) return 1;
  return 0;
};

const POWER_LABEL: Record<string, string> = {
  nominal: 'Nominal',
  strained: 'Strained −25%',
  critical: 'Critical −50%',
  blackout: 'Blackout',
};

export default VillagePage;
