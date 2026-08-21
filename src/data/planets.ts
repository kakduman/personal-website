// v3.5/v3.6: Zones, planets and terrain generation.
//
// Deviation from the v3 spec: the spec's zone table asked for 10 buildings before
// the second zone unlocks, but the Landing Zone only holds 7 tiles — the game would
// deadlock. Zone unlocks are now keyed to counts the previous zones can actually
// hold. Grid sizes are ring bands, so the home planet totals 91 hexes rather than 119.

import { TerrainType } from './buildings';
import { Axial, hexRing, hexesWithinRadius, seededRandom, hashString } from '../utils/hexMath';

export interface ZoneDef {
  id: string;
  name: string;
  /** Inclusive ring band this zone covers. */
  ringFrom: number;
  ringTo: number;
  /** Total buildings on the planet required to unlock. */
  requiresBuildings: number;
  blurb: string;
}

export const ZONES: ZoneDef[] = [
  { id: 'landing',    name: 'Phase 1 · Core Site',      ringFrom: 0, ringTo: 1, requiresBuildings: 0,  blurb: 'Where the first crew set down. Permitted from day one.' },
  { id: 'industrial', name: 'Phase 2 · Industrial Yard', ringFrom: 2, ringTo: 2, requiresBuildings: 5,  blurb: 'Ore reaches the surface here. Heavy machinery welcome.' },
  { id: 'research',   name: 'Phase 3 · Research Park',   ringFrom: 3, ringTo: 3, requiresBuildings: 15, blurb: 'Warm ground from the vents. Good for labs, oddly.' },
  { id: 'expansion',  name: 'Phase 4 · West Expansion',  ringFrom: 4, ringTo: 4, requiresBuildings: 30, blurb: 'Room enough to stop optimising and start sprawling.' },
  { id: 'spaceport',  name: 'Phase 5 · Launch Complex',  ringFrom: 5, ringTo: 5, requiresBuildings: 55, blurb: 'Bedrock stable enough to put something into orbit.' },
];

export const MAX_RING = ZONES[ZONES.length - 1].ringTo;

export const zoneForRing = (ring: number): ZoneDef | undefined =>
  ZONES.find(z => ring >= z.ringFrom && ring <= z.ringTo);

export const zoneIndexForRing = (ring: number): number =>
  ZONES.findIndex(z => ring >= z.ringFrom && ring <= z.ringTo);

export interface PlanetModifiers {
  /** Multipliers applied to the whole planet. 1 = neutral. */
  power: number;
  compute: number;
  mining: number;
  research: number;
  manufacturing: number;
  /** Multiplier on every building's Watts draw. >1 = harsher. */
  wattsDraw: number;
  /** Multiplier on habitation build cost. */
  housingCost: number;
}

const NEUTRAL: PlanetModifiers = {
  power: 1, compute: 1, mining: 1, research: 1, manufacturing: 1, wattsDraw: 1, housingCost: 1,
};

export interface PlanetDef {
  id: string;
  name: string;
  subtitle: string;
  /** Colonisation cost. The home world is free. */
  cost: { flops: number; alloys: number };
  maxRing: number;
  modifiers: PlanetModifiers;
  perk: string;
  challenge: string;
  /** Weights for terrain generation outside the landing zone. */
  terrainWeights: Partial<Record<TerrainType, number>>;
  /** Visual identity for the renderer. */
  palette: {
    ground: string;
    groundLow: string;
    /** Exposed stone / boulders. */
    rock: string;
    /** Rim light and marker colour for this site. */
    accent: string;
    side: string;
    sky: [string, string];
    nebula: string;
    star: string;
  };
  /** Distance in "hops" from the home world — used for trade route timing. */
  distance: number;
}

export const PLANETS: PlanetDef[] = [
  {
    id: 'kepler-9c',
    name: 'Hopfield',
    subtitle: 'Primary Site',
    cost: { flops: 0, alloys: 0 },
    maxRing: 5,
    modifiers: { ...NEUTRAL, power: 1.5 },
    perk: 'Bright primary star — power buildings generate +50%.',
    challenge: 'Thin crust — ore deposits are rare here.',
    terrainWeights: { standard: 74, rocky: 14, vent: 7, launchpad: 5 },
    palette: {
      ground: '#93a184', groundLow: '#6e7c62', rock: '#c4cdb0', accent: 'rgba(190,220,150,0.5)', side: '#4a5442',
      sky: ['#1d2740', '#2f3d55'], nebula: 'rgba(150,190,255,0.12)', star: '#e6f0ff',
    },
    distance: 0,
  },
  {
    id: 'brumal',
    name: 'Boltzmann',
    subtitle: 'Cold Site',
    cost: { flops: 500_000, alloys: 1_000 },
    maxRing: 4,
    modifiers: { ...NEUTRAL, compute: 1.25, wattsDraw: 1.5 },
    perk: 'Free cooling at −180°C — compute runs 25% harder.',
    challenge: 'Everything else needs heating — 50% more power draw.',
    terrainWeights: { standard: 80, rocky: 10, vent: 5, launchpad: 5 },
    palette: {
      ground: '#aecbdf', groundLow: '#7e9db4', rock: '#e6f2fa', accent: 'rgba(190,235,255,0.55)', side: '#5c7488',
      sky: ['#1b3448', '#2c5064'], nebula: 'rgba(150,225,255,0.14)', star: '#f0fbff',
    },
    distance: 1,
  },
  {
    id: 'ashfall',
    name: 'Vapnik',
    subtitle: 'Geothermal Site',
    cost: { flops: 2_000_000, alloys: 5_000 },
    maxRing: 4,
    modifiers: { ...NEUTRAL, mining: 2, power: 1.4 },
    perk: 'Shallow magma — double ore, and 40% more power.',
    challenge: 'Constant ashfall — housing costs twice as much.',
    terrainWeights: { standard: 46, rocky: 32, vent: 18, launchpad: 4 },
    palette: {
      ground: '#b57761', groundLow: '#8a4f3f', rock: '#dda276', accent: 'rgba(255,180,110,0.55)', side: '#5c3226',
      sky: ['#331410', '#54241a'], nebula: 'rgba(255,140,70,0.15)', star: '#ffe6c8',
    },
    distance: 2,
  },
  {
    id: 'tethys-minor',
    name: 'Pearl',
    subtitle: 'Outer Moon',
    cost: { flops: 10_000_000, alloys: 25_000 },
    maxRing: 3,
    modifiers: { ...NEUTRAL, research: 1.5, mining: 0 },
    perk: 'Quiet, cold and far from everything — research +50%.',
    challenge: 'No crust worth digging — this site produces no Ore. It runs on Ore your other sites mine.',
    terrainWeights: { standard: 68, rocky: 0, vent: 26, launchpad: 6 },
    palette: {
      ground: '#93ab9b', groundLow: '#6b8274', rock: '#c8d8cb', accent: 'rgba(180,240,200,0.5)', side: '#47594c',
      sky: ['#15301f', '#254b33'], nebula: 'rgba(160,245,190,0.12)', star: '#e8ffe4',
    },
    distance: 3,
  },
  {
    id: 'the-shoal',
    name: 'Markov',
    subtitle: 'Quarry Site',
    cost: { flops: 50_000_000, alloys: 100_000 },
    maxRing: 3,
    modifiers: { ...NEUTRAL, mining: 2.5, housingCost: 3 },
    perk: 'Nothing but ore — extraction +150%, deposits everywhere.',
    challenge: 'No atmosphere to hold — housing costs three times as much.',
    terrainWeights: { standard: 24, rocky: 66, vent: 2, launchpad: 8 },
    palette: {
      ground: '#b8a88c', groundLow: '#8e806a', rock: '#ddd2b8', accent: 'rgba(255,225,175,0.45)', side: '#5e5442',
      sky: ['#241f18', '#3d352a'], nebula: 'rgba(255,215,160,0.10)', star: '#fff6e2',
    },
    distance: 4,
  },
  {
    id: 'helios-ring',
    name: 'Sutton',
    subtitle: 'Inner Orbit',
    cost: { flops: 500_000_000, alloys: 1_000_000 },
    maxRing: 3,
    modifiers: { ...NEUTRAL, power: 6, compute: 1.5, wattsDraw: 0.5, mining: 0, housingCost: 2 },
    perk: 'Close to the star — six times the power, half the draw, compute +50%.',
    challenge: 'A platform, not a planet: no ground to dig, so this site produces no Ore. It runs on Ore your other sites mine. Housing costs 2×.',
    terrainWeights: { standard: 40, rocky: 0, vent: 54, launchpad: 6 },
    palette: {
      ground: '#e0c778', groundLow: '#b39a49', rock: '#f7ecbb', accent: 'rgba(255,240,175,0.6)', side: '#7a6524',
      sky: ['#3a2c08', '#5e4710'], nebula: 'rgba(255,230,150,0.18)', star: '#fffae0',
    },
    distance: 5,
  },
];

export const PLANET_MAP: Record<string, PlanetDef> = Object.fromEntries(PLANETS.map(p => [p.id, p]));
export const HOME_PLANET_ID = PLANETS[0].id;

export interface GeneratedTile {
  q: number;
  r: number;
  terrain: TerrainType;
  ring: number;
  /** Small per-tile height jitter so the surface is not perfectly flat. */
  elevation: number;
}

/**
 * Deterministic terrain for a planet. The landing zone (rings 0-1) is always
 * plain regolith so the opening moves are never blocked.
 */
export const generatePlanetTiles = (planet: PlanetDef): GeneratedTile[] => {
  const rand = seededRandom(hashString(planet.id));
  const tiles: GeneratedTile[] = [];

  const entries = Object.entries(planet.terrainWeights) as Array<[TerrainType, number]>;
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);

  const pickTerrain = (): TerrainType => {
    let roll = rand() * totalWeight;
    for (const [terrain, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return terrain;
    }
    return 'standard';
  };

  for (let ring = 0; ring <= planet.maxRing; ring++) {
    const hexes: Axial[] = ring === 0 ? [{ q: 0, r: 0 }] : hexRing(ring);
    for (const hex of hexes) {
      tiles.push({
        q: hex.q,
        r: hex.r,
        terrain: ring <= 1 ? 'standard' : pickTerrain(),
        ring,
        elevation: rand(),
      });
    }
  }

  // Guarantee at least one Bedrock Shelf in the outermost ring so a Spaceport is
  // always eventually placeable.
  const outer = tiles.filter(t => t.ring === planet.maxRing);
  if (outer.length && !outer.some(t => t.terrain === 'launchpad')) {
    outer[Math.floor(rand() * outer.length)].terrain = 'launchpad';
  }

  return tiles;
};

export const totalTilesForPlanet = (planet: PlanetDef): number =>
  hexesWithinRadius(planet.maxRing).length;
