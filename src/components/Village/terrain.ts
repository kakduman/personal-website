// Ground for the site view — flat, clean, a little bit cute.
//
// Deliberately NOT photoreal. Earlier passes piled on per-pixel noise, mineral veins
// and baked directional light, and the result read as muddy and dated. This is a flat
// illustration style instead: solid colour fields, a handful of crisp rounded shapes,
// no gradients. It reads better at a glance and costs almost nothing to draw.

import { TerrainType } from '../../data/buildings';
import { hexCorners } from '../../utils/hexMath';

/** 1.0 = true top-down. Do not squash this. */
export const ISO = 1;
export const LEVEL_HEIGHT = 7;
export const ELEVATION_TIERS = 3;

export interface GroundPalette {
  ground: string;
  groundLow: string;
  side: string;
  rock: string;
  accent: string;
}

const TAU = Math.PI * 2;

const hash2 = (x: number, y: number): number => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

const smooth = (t: number): number => t * t * (3 - 2 * t);

const valueNoise = (x: number, y: number): number => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = smooth(x - xi);
  const v = smooth(y - yi);
  return (
    hash2(xi, yi) * (1 - u) * (1 - v) +
    hash2(xi + 1, yi) * u * (1 - v) +
    hash2(xi, yi + 1) * (1 - u) * v +
    hash2(xi + 1, yi + 1) * u * v
  );
};

export const fbm = (x: number, y: number, octaves = 4): number => {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  let total = 0;
  for (let i = 0; i < octaves; i++) {
    value += amp * valueNoise(x * freq, y * freq);
    total += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return value / total;
};

// --- colour helpers ----------------------------------------------------------

export const toRgb = (hex: string): [number, number, number] => {
  const v = hex.replace('#', '');
  const n = parseInt(v.length === 3 ? v.split('').map(c => c + c).join('') : v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const mixRgb = (
  a: [number, number, number], b: [number, number, number], t: number
): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export const rgbCss = (c: [number, number, number], alpha = 1): string =>
  alpha >= 1
    ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
    : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${alpha})`;

export const shade = (hex: string, amount: number): string => {
  const [r, g, b] = toRgb(hex);
  const f = (v: number) => Math.max(0, Math.min(255, v + amount * 255));
  return `rgb(${f(r) | 0},${f(g) | 0},${f(b) | 0})`;
};

/** Light / base / dark / deep set for flat two-tone shapes. */
export const tones = (hex: string) => {
  const base = toRgb(hex);
  return {
    light: rgbCss(mixRgb(base, [255, 255, 255], 0.3)),
    base: rgbCss(base),
    dark: rgbCss(mixRgb(base, [0, 0, 0], 0.3)),
    deep: rgbCss(mixRgb(base, [0, 0, 0], 0.55)),
  };
};

export const roundRect = (
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number
): void => {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
};

// --- tile sprites ------------------------------------------------------------

interface TerrainLook {
  /** How far the flat fill shifts from the site's base ground colour. */
  tint: [number, number, number];
  tintAmount: number;
  pebbles: number;
}

const TERRAIN_LOOK: Record<TerrainType, TerrainLook> = {
  standard:  { tint: [255, 255, 255], tintAmount: 0.00, pebbles: 3 },
  rocky:     { tint: [193, 132, 74],  tintAmount: 0.46, pebbles: 5 },
  vent:      { tint: [226, 146, 60],  tintAmount: 0.30, pebbles: 2 },
  launchpad: { tint: [200, 210, 226], tintAmount: 0.50, pebbles: 0 },
};

export interface TileSprite {
  canvas: HTMLCanvasElement;
  ox: number;
  oy: number;
}

const hexPathOn = (
  ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number
): void => {
  const corners = hexCorners(size);
  ctx.beginPath();
  corners.forEach((c, i) => {
    if (i === 0) ctx.moveTo(cx + c.x, cy + c.y);
    else ctx.lineTo(cx + c.x, cy + c.y);
  });
  ctx.closePath();
};

/** A rounded pebble: flat body plus one darker crescent. No gradients. */
const pebble = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  body: string, dark: string
): void => {
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.22, r, r * 0.82, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.8, 0, 0, TAU);
  ctx.fill();
};

export const buildTileSprite = (
  terrain: TerrainType,
  variant: number,
  size: number,
  palette: GroundPalette,
  dpr: number
): TileSprite => {
  const w = Math.ceil(size * 2 + 8);
  const h = Math.ceil(size * 2 + 8);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(w * dpr);
  canvas.height = Math.ceil(h * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  const cx = w / 2;
  const cy = h / 2;
  const look = TERRAIN_LOOK[terrain];
  const rnd = (n: number) => hash2(variant * 19.3 + n * 2.77, n * 5.31 + variant * 3.1);

  const groundRgb = mixRgb(toRgb(palette.ground), look.tint, look.tintAmount);
  const patchRgb = mixRgb(groundRgb, toRgb(palette.groundLow), 0.4);
  const rockRgb = mixRgb(toRgb(palette.rock), look.tint, look.tintAmount * 0.7);

  ctx.save();
  // Slight overdraw so neighbouring tiles meet with no seam.
  hexPathOn(ctx, cx, cy, size * 1.02);
  ctx.clip();

  // Flat base.
  ctx.fillStyle = rgbCss(groundRgb);
  ctx.fillRect(0, 0, w, h);

  // One or two soft patches of a second tone — enough variation to avoid dead flat.
  for (let i = 0; i < 2; i++) {
    const a = rnd(i + 3) * TAU;
    const d = rnd(i + 9) * size * 0.45;
    ctx.fillStyle = rgbCss(patchRgb, 0.55);
    ctx.beginPath();
    ctx.ellipse(
      cx + Math.cos(a) * d, cy + Math.sin(a) * d,
      size * (0.34 + rnd(i + 15) * 0.22), size * (0.26 + rnd(i + 21) * 0.2),
      rnd(i + 27) * TAU, 0, TAU
    );
    ctx.fill();
  }

  // Pebbles.
  for (let i = 0; i < look.pebbles; i++) {
    const a = rnd(i + 40) * TAU;
    const d = Math.sqrt(rnd(i + 46)) * size * 0.62;
    pebble(
      ctx,
      cx + Math.cos(a) * d,
      cy + Math.sin(a) * d,
      size * (0.045 + rnd(i + 52) * 0.045),
      rgbCss(rockRgb),
      rgbCss(mixRgb(rockRgb, [0, 0, 0], 0.4))
    );
  }

  if (terrain === 'rocky') {
    // Ore showing through: a few flat amber facets.
    for (let i = 0; i < 4; i++) {
      const a = rnd(i + 70) * TAU;
      const d = rnd(i + 76) * size * 0.5;
      const px = cx + Math.cos(a) * d;
      const py = cy + Math.sin(a) * d;
      const r = size * (0.05 + rnd(i + 82) * 0.04);
      ctx.fillStyle = 'rgba(255,206,120,0.85)';
      ctx.beginPath();
      ctx.moveTo(px, py - r);
      ctx.lineTo(px + r * 0.8, py);
      ctx.lineTo(px, py + r);
      ctx.lineTo(px - r * 0.8, py);
      ctx.closePath();
      ctx.fill();
    }
  }

  if (terrain === 'vent') {
    // Scorched ground and a hot mouth. No radiating spokes — they read as a built
    // structure and made empty vents look occupied.
    ctx.fillStyle = 'rgba(74,40,18,0.42)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.54, size * 0.48, 0, 0, TAU);
    ctx.fill();

    // A couple of irregular scorch blotches so it is not a perfect circle.
    for (let i = 0; i < 3; i++) {
      const a = rnd(i + 90) * TAU;
      const d = size * (0.24 + rnd(i + 96) * 0.24);
      ctx.fillStyle = 'rgba(64,32,14,0.32)';
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.cos(a) * d, cy + Math.sin(a) * d,
        size * (0.14 + rnd(i + 102) * 0.1), size * (0.1 + rnd(i + 108) * 0.08),
        rnd(i + 114) * TAU, 0, TAU
      );
      ctx.fill();
    }

    ctx.fillStyle = '#4a2412';
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.22, size * 0.19, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ff8a2c';
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.15, size * 0.125, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffd27a';
    ctx.beginPath();
    ctx.ellipse(cx, cy - size * 0.01, size * 0.08, size * 0.065, 0, 0, TAU);
    ctx.fill();
  }

  if (terrain === 'launchpad') {
    // Clean pale slab. No joint lines — they read as stripes across the map.
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.55, size * 0.5, 0, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
  return { canvas, ox: -cx, oy: -cy };
};

export class TileSpriteCache {
  private sprites = new Map<string, TileSprite>();
  private key = '';

  constructor(private size: number, private dpr: number) {}

  reset(paletteKey: string, size: number, dpr: number): void {
    if (this.key === paletteKey && this.size === size && this.dpr === dpr) return;
    this.key = paletteKey;
    this.size = size;
    this.dpr = dpr;
    this.sprites.clear();
  }

  get(terrain: TerrainType, variant: number, palette: GroundPalette): TileSprite {
    const id = `${terrain}:${variant}`;
    let sprite = this.sprites.get(id);
    if (!sprite) {
      sprite = buildTileSprite(terrain, variant, this.size, palette, this.dpr);
      this.sprites.set(id, sprite);
    }
    return sprite;
  }
}

export const variantFor = (q: number, r: number): number =>
  Math.floor(hash2(q * 3.71, r * 8.13) * 6) % 6;

export const tierFor = (elevation: number): number =>
  Math.min(ELEVATION_TIERS - 1, Math.floor(elevation * ELEVATION_TIERS));
