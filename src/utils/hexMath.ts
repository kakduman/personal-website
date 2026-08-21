// Axial hex coordinate helpers for the v3 Data Center Village.
// Layout is pointy-top: neighbours sit E / NE / NW / W / SW / SE.

export interface Axial {
  q: number;
  r: number;
}

export const HEX_DIRECTIONS: Axial[] = [
  { q: 1, r: 0 },   // E
  { q: 1, r: -1 },  // NE
  { q: 0, r: -1 },  // NW
  { q: -1, r: 0 },  // W
  { q: -1, r: 1 },  // SW
  { q: 0, r: 1 },   // SE
];

export const hexKey = (q: number, r: number): string => `${q},${r}`;

export const parseHexKey = (key: string): Axial => {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
};

export const neighbors = (q: number, r: number): Axial[] =>
  HEX_DIRECTIONS.map(d => ({ q: q + d.q, r: r + d.r }));

export const neighborKeys = (q: number, r: number): string[] =>
  HEX_DIRECTIONS.map(d => hexKey(q + d.q, r + d.r));

/** Ring distance from the origin — also the zone ring index. */
export const hexDistance = (q: number, r: number): number =>
  (Math.abs(q) + Math.abs(q + r) + Math.abs(r)) / 2;

/** Every hex within `radius` of the origin, ordered by ring then angle. */
export const hexesWithinRadius = (radius: number): Axial[] => {
  const out: Axial[] = [];
  for (let q = -radius; q <= radius; q++) {
    const rMin = Math.max(-radius, -q - radius);
    const rMax = Math.min(radius, -q + radius);
    for (let r = rMin; r <= rMax; r++) out.push({ q, r });
  }
  return out.sort((a, b) => {
    const da = hexDistance(a.q, a.r);
    const db = hexDistance(b.q, b.r);
    if (da !== db) return da - db;
    return Math.atan2(a.r, a.q) - Math.atan2(b.r, b.q);
  });
};

/** Exactly the hexes at ring distance `ring`. */
export const hexRing = (ring: number): Axial[] =>
  hexesWithinRadius(ring).filter(h => hexDistance(h.q, h.r) === ring);

// --- Pixel conversion (pointy-top) ---

const SQRT3 = Math.sqrt(3);

export const hexToPixel = (q: number, r: number, size: number): { x: number; y: number } => ({
  x: size * SQRT3 * (q + r / 2),
  y: size * 1.5 * r,
});

export const pixelToHex = (x: number, y: number, size: number): Axial => {
  const q = (SQRT3 / 3 * x - y / 3) / size;
  const r = (2 / 3 * y) / size;
  return axialRound(q, r);
};

export const axialRound = (q: number, r: number): Axial => {
  // Round in cube space so ties break correctly.
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);

  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);

  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;

  return { q: rq, r: rr };
};

/** The 6 corner offsets of a pointy-top hex, starting at the top vertex. */
export const hexCorners = (size: number): Array<{ x: number; y: number }> => {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90);
    corners.push({ x: size * Math.cos(angle), y: size * Math.sin(angle) });
  }
  return corners;
};

/** Deterministic 0..1 PRNG so generated terrain survives a page reload. */
export const seededRandom = (seed: number): (() => number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

export const hashString = (str: string): number => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
