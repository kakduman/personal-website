// Site renderer: a bird's-eye view of one build site.
//
// Deliberately top-down rather than a globe — you need to read the whole grid at a
// glance, the way Civ and Cities: Skylines do. Depth comes from an isometric squash,
// stepped terrain with cliff faces, cast shadows and atmospheric fade, not from a
// tilted camera that would hide tiles behind each other.
//
// Everything past the permitted claim is drawn as continuous ground with no grid on
// it, fading into haze, so the world clearly keeps going — you just can't build there.

import { TerrainType, getBuilding, CATEGORY_META } from '../../data/buildings';
import { PlanetDef } from '../../data/planets';
import { hexCorners, hexToPixel, pixelToHex, hexKey } from '../../utils/hexMath';
import { BUILDING_PAINTERS, PaintTile } from './buildingArt';
import {
  LEVEL_HEIGHT, TileSpriteCache, fbm, mixRgb, rgbCss, toRgb, variantFor,
} from './terrain';

export interface RenderTile {
  key: string;
  q: number;
  r: number;
  terrain: TerrainType;
  ring: number;
  elevation: number;
  building: string | null;
  unlocked: boolean;
  powered: boolean;
  linked: boolean;
  adjacencyRatio: number;
}

export interface RenderState {
  tiles: RenderTile[];
  palette: PlanetDef['palette'];
  planetId: string;
  /** Outermost ring the claim covers — the frontier starts one ring beyond. */
  maxRing: number;
  hoverKey: string | null;
  selectedBuildingId: string | null;
  validPlacement: Set<string>;
  bestKey: string | null;
  efficiency: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; color: string;
  kind: 'smoke' | 'spark' | 'ring';
}

/** A little figure walking an errand between two buildings. */
interface Worker {
  fromX: number; fromY: number;
  toX: number; toY: number;
  t: number;
  speed: number;
  colour: string;
}

interface FloatingText {
  x: number; y: number; text: string; life: number; color: string;
}

const TAU = Math.PI * 2;
const HEX = 62;
/** One full day in seconds. */
const DAY_LENGTH = 240;

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Where smoke leaves each building, in fractions of the building draw unit `s`,
 * plus how hard it pours. Painters no longer draw static puffs — a puff pinned to
 * a chimney just hovers; real smoke has to be a particle that rises and drifts.
 */
const SMOKE_SOURCES: Record<string, Array<{ x: number; y: number; rate: number; colour: string; rise: number }>> = {
  'geothermal-plant': [{ x: 0.46, y: -0.72, rate: 3.4, colour: '222,236,255', rise: 26 }],
  smelter: [
    { x: -0.32, y: -0.82, rate: 2.6, colour: '255,196,150', rise: 24 },
    { x: 0.16, y: -0.74, rate: 2.0, colour: '255,196,150', rise: 22 },
  ],
  'planet-cracker': [{ x: 0, y: -0.1, rate: 3.0, colour: '210,190,165', rise: 14 }],
  'matter-compiler': [{ x: 0.34, y: -0.66, rate: 1.6, colour: '226,214,248', rise: 20 }],
};

const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const DEFAULT_PALETTE: PlanetDef['palette'] = {
  ground: '#5c6b84', groundLow: '#333f59', rock: '#8b93a6',
  accent: 'rgba(140,190,255,0.5)', side: '#1b2338',
  sky: ['#0b1024', '#1a1038'], nebula: 'rgba(90,120,255,0.16)', star: '#cfe0ff',
};

export class VillageRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private dpr = 1;
  private width = 0;
  private height = 0;

  private state: RenderState = {
    tiles: [], palette: DEFAULT_PALETTE, planetId: '', maxRing: 5,
    hoverKey: null, selectedBuildingId: null, validPlacement: new Set(),
    bestKey: null, efficiency: 1,
  };

  private camera = { x: 0, y: 0, zoom: 1 };
  // Start mid-morning so the first thing you see is a lit site.
  private time = DAY_LENGTH * 0.08;
  private particles: Particle[] = [];
  private floaters: FloatingText[] = [];
  private popIns = new Map<string, number>();
  private workers: Worker[] = [];
  private hasFramed = false;
  private lastUnlockedCount = 0;

  private sprites = new TileSpriteCache(HEX, 1);
  private macro: HTMLCanvasElement | null = null;
  private macroKey = '';
  private tileIndex = new Map<string, RenderTile>();

  /** Frontier tiles are generated here, not stored in game state. */
  private frontierRocks: Array<{ x: number; y: number; r: number; shade: number }> = [];
  private frontierKey = '';


  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;
    this.resize();
  }

  // --- lifecycle ---

  start(): void {
    if (this.raf) return;
    let last = performance.now();
    const loop = (now: number) => {
      // rAF's timestamp is the frame start, which can predate `last` — clamp to >= 0
      // or `time` goes negative and every time-driven animation breaks.
      const dt = Math.max(0, Math.min((now - last) / 1000, 0.1));
      last = now;
      this.time += dt;
      this.step(dt);
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  setState(state: RenderState): void {
    for (const tile of state.tiles) {
      if (tile.building && !this.popIns.has(tile.key)) {
        const previous = this.tileIndex.get(tile.key);
        if (previous && !previous.building) this.popIns.set(tile.key, 0);
      }
      if (!tile.building) this.popIns.delete(tile.key);
    }

    this.state = state;
    this.tileIndex = new Map(state.tiles.map(t => [t.key, t]));
    this.sprites.reset(`${state.planetId}`, HEX, this.dpr);
    if (this.macroKey !== state.planetId) {
      this.macroKey = state.planetId;
      this.macro = null;
    }
    this.ensureFrontier();

    const unlockedCount = state.tiles.reduce((n, t) => n + (t.unlocked ? 1 : 0), 0);
    if (state.tiles.length && (!this.hasFramed || unlockedCount > this.lastUnlockedCount)) {
      this.hasFramed = true;
      this.fitToContent();
    }
    this.lastUnlockedCount = unlockedCount;
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.floor(rect.width * this.dpr);
    this.canvas.height = Math.floor(rect.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.sprites.reset(`${this.state.planetId}`, HEX, this.dpr);
    if (this.hasFramed) this.fitToContent();
  }

  // --- camera ---

  pan(dx: number, dy: number): void {
    this.camera.x += dx;
    this.camera.y += dy;
  }

  zoomAt(factor: number, screenX: number, screenY: number): void {
    const before = this.screenToWorld(screenX, screenY);
    this.camera.zoom = Math.max(0.45, Math.min(2.6, this.camera.zoom * factor));
    const after = this.screenToWorld(screenX, screenY);
    this.camera.x += (after.x - before.x) * this.camera.zoom;
    this.camera.y += (after.y - before.y) * this.camera.zoom;
  }

  fitToContent(): void {
    const tiles = this.state.tiles.filter(t => t.unlocked);
    if (!tiles.length) {
      this.camera = { x: 0, y: 0, zoom: 1 };
      return;
    }
    const padTop = 138;
    const padBottom = 152;
    const padX = this.width > 1000 ? 340 : 40;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const tile of tiles) {
      const p = this.project(tile.q, tile.r, tile.elevation);
      minX = Math.min(minX, p.x - HEX);
      maxX = Math.max(maxX, p.x + HEX);
      minY = Math.min(minY, p.y - HEX * 1.6);
      maxY = Math.max(maxY, p.y + HEX + LEVEL_HEIGHT * 3);
    }

    const availW = Math.max(200, this.width - padX * 2);
    const availH = Math.max(200, this.height - padTop - padBottom);
    // Floor the zoom: tiles staying big and legible matters more than fitting
    // the whole claim on screen. Past that point the player pans.
    const zoom = Math.max(0.72, Math.min(1.25, Math.min(availW / (maxX - minX), availH / (maxY - minY))));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    this.camera = {
      zoom,
      x: -cx * zoom,
      y: padTop + availH / 2 - this.height / 2 - cy * zoom,
    };
  }

  private worldOrigin(): { x: number; y: number } {
    return { x: this.width / 2 + this.camera.x, y: this.height / 2 + this.camera.y };
  }

  private screenToWorld(sx: number, sy: number): { x: number; y: number } {
    const o = this.worldOrigin();
    return { x: (sx - o.x) / this.camera.zoom, y: (sy - o.y) / this.camera.zoom };
  }

  hexAtScreen(sx: number, sy: number): string | null {
    const world = this.screenToWorld(sx, sy);
    // Tiles are drawn lifted by their elevation, so undo an average lift before
    // converting back, then check the exact tile's own lift for a closer match.
    for (const guessLift of [LEVEL_HEIGHT, 0, LEVEL_HEIGHT * 2]) {
      const { q, r } = pixelToHex(world.x, world.y + guessLift, HEX);
      const key = hexKey(q, r);
      const tile = this.tileIndex.get(key);
      if (tile && Math.abs(this.liftFor(tile.elevation) - guessLift) <= LEVEL_HEIGHT) return key;
    }
    const { q, r } = pixelToHex(world.x, world.y + LEVEL_HEIGHT, HEX);
    const key = hexKey(q, r);
    return this.tileIndex.has(key) ? key : null;
  }

  // --- projection ---

  /**
   * Straight overhead, tiles sit flush — you cannot see the side of a block from
   * directly above it. Height reads through shading instead, so the surface stays
   * one continuous landscape rather than a tray of separate coasters.
   */
  private liftFor(_elevation: number): number {
    return 0;
  }

  private project(q: number, r: number, elevation: number): { x: number; y: number; base: number } {
    const p = hexToPixel(q, r, HEX);
    return { x: p.x, y: p.y - this.liftFor(elevation), base: p.y };
  }

  // --- effects ---

  burstAt(key: string, color: string): void {
    const tile = this.tileIndex.get(key);
    if (!tile) return;
    const { x, y } = this.project(tile.q, tile.r, tile.elevation);
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * TAU + Math.random() * 0.3;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.5 - 30,
        life: 0.7 + Math.random() * 0.4, maxLife: 1.1,
        size: 2 + Math.random() * 3, color, kind: 'spark',
      });
    }
    this.particles.push({ x, y, vx: 0, vy: 0, life: 0.55, maxLife: 0.55, size: HEX, color, kind: 'ring' });
  }

  floatText(key: string, text: string, color: string): void {
    const tile = this.tileIndex.get(key);
    if (!tile) return;
    const { x, y } = this.project(tile.q, tile.r, tile.elevation);
    this.floaters.push({ x, y: y - HEX * 0.6, text, life: 1.3, color });
  }

  floatTextAtCenter(text: string, color: string): void {
    const world = this.screenToWorld(this.width / 2, this.height * 0.35);
    this.floaters.push({ x: world.x, y: world.y, text, life: 1.4, color });
  }

  // --- frontier & roads --------------------------------------------------------

  /** Deterministic scatter for the frontier, generated once per site. */
  private ensureFrontier(): void {
    const key = `${this.state.planetId}:${this.state.maxRing}`;
    if (this.frontierKey === key) return;
    this.frontierKey = key;

    const inner = (this.state.maxRing + 0.6) * HEX * 1.732;
    const outer = (this.state.maxRing + 5) * HEX * 1.732;
    const rocks: Array<{ x: number; y: number; r: number; shade: number }> = [];
    for (let i = 0; i < 420; i++) {
      const a = fbm(i * 0.37, 4.2, 3) * TAU * 2;
      const t = fbm(i * 0.11 + 9, 1.7, 3);
      const dist = inner + t * (outer - inner);
      const x = Math.cos(a) * dist;
      const y = Math.sin(a) * dist;
      // Density falls off with distance so the far field reads as haze.
      if (fbm(i * 0.53, 2.9, 2) < t * 0.75) continue;
      rocks.push({
        x, y,
        r: HEX * (0.05 + fbm(i * 0.29, 6.1, 2) * 0.16) * (1 - t * 0.4),
        shade: fbm(i * 0.71, 3.3, 2),
      });
    }
    this.frontierRocks = rocks;
  }

  // --- simulation ---

  private step(dt: number): void {
    this.particles = this.particles.filter(p => {
      p.life -= dt;
      if (p.life <= 0) return false;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'smoke') {
        // Keeps accelerating upward and spreading, so it reads as a plume rather
        // than a cloud sitting on the roof.
        p.vy -= 16 * dt;
        p.vx += Math.sin(p.y * 0.05 + this.time) * 5 * dt;
        p.vx *= 0.99;
        p.size += 9 * dt;
      }
      else if (p.kind === 'spark') { p.vy += 170 * dt; p.vx *= 0.97; }
      return true;
    });

    this.floaters = this.floaters.filter(f => {
      f.life -= dt;
      f.y -= 34 * dt;
      return f.life > 0;
    });

    this.popIns.forEach((value, key) => {
      this.popIns.set(key, value + dt * 3.2 >= 1 ? 1 : value + dt * 3.2);
    });

    // Vents steam continuously whether or not anything is built on them.
    if (Math.random() < dt * 16) {
      const vents = this.state.tiles.filter(t => t.unlocked && t.terrain === 'vent');
      if (vents.length) {
        const tile = vents[Math.floor(Math.random() * vents.length)];
        const p = this.project(tile.q, tile.r, tile.elevation);
        const spread = HEX * 0.3;
        this.particles.push({
          x: p.x + (Math.random() - 0.5) * spread,
          y: p.y + (Math.random() - 0.5) * spread * 0.7,
          vx: (Math.random() - 0.5) * 5,
          vy: -14 - Math.random() * 12,
          life: 1.4 + Math.random() * 0.8, maxLife: 2.2,
          size: 3 + Math.random() * 3,
          color: 'rgba(255,214,170,0.5)',
          kind: 'smoke',
        });
      }
    }

    // Every chimney emits on its own schedule, from its own position.
    const bs = HEX * 0.78;
    for (const tile of this.state.tiles) {
      if (!tile.building || !tile.unlocked || !tile.powered) continue;
      const sources = SMOKE_SOURCES[tile.building];
      if (!sources) continue;
      const p = this.project(tile.q, tile.r, tile.elevation);
      for (const src of sources) {
        if (Math.random() > dt * src.rate) continue;
        this.particles.push({
          x: p.x + src.x * bs + (Math.random() - 0.5) * bs * 0.14,
          y: p.y + src.y * bs,
          vx: (Math.random() - 0.5) * 6,
          vy: -src.rise - Math.random() * 10,
          life: 1.8 + Math.random() * 1.1,
          maxLife: 2.9,
          size: bs * 0.1 + Math.random() * bs * 0.05,
          color: `rgba(${src.colour},0.55)`,
          kind: 'smoke',
        });
      }
    }

    this.stepWorkers(dt);
  }

  /** 0 = noon, 1 = midnight. */
  private get night(): number {
    const phase = (this.time % DAY_LENGTH) / DAY_LENGTH;
    // Capped below 1 so the site never becomes hard to read after dark.
    return clamp01((1 - Math.cos(phase * TAU)) / 2) * 0.6;
  }

  // --- drawing ---

  private draw(): void {
    const ctx = this.ctx;
    const night = this.night;
    ctx.clearRect(0, 0, this.width, this.height);

    this.drawSky(night);

    ctx.save();
    const origin = this.worldOrigin();
    ctx.translate(origin.x, origin.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);

    this.drawFrontier(night);

    const sorted = [...this.state.tiles].sort((a, b) => {
      const ay = hexToPixel(a.q, a.r, HEX).y;
      const by = hexToPixel(b.q, b.r, HEX).y;
      return ay !== by ? ay - by : a.q - b.q;
    });

    for (const tile of sorted) this.drawTile(tile, night);
    this.drawMacroWash();
    this.drawLinks();
    this.drawWorkers(night);
    for (const tile of sorted) this.drawBuilding(tile, night);
    this.drawGhost(night);
    this.drawParticles();
    this.drawFloaters();

    ctx.restore();

    this.drawVignette(night);
  }

  private drawSky(night: number): void {
    const ctx = this.ctx;
    const { palette } = this.state;

    const dayTop = mixRgb(toRgb('#2c4a72'), toRgb(palette.sky[0]), night);
    const dayBottom = mixRgb(toRgb('#6d7f96'), toRgb(palette.sky[1]), night);
    const sky = ctx.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, rgbCss(dayTop));
    sky.addColorStop(1, rgbCss(dayBottom));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

    const origin = this.worldOrigin();
    const glow = ctx.createRadialGradient(origin.x, origin.y, 0, origin.x, origin.y, Math.max(this.width, this.height) * 0.62);
    glow.addColorStop(0, palette.nebula);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.state.efficiency < 1) {
      const severity = 1 - this.state.efficiency;
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 4);
      ctx.fillStyle = `rgba(255,60,40,${0.05 * severity + 0.05 * severity * pulse})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  /** Darkened edges so attention stays on the claim. */
  private drawVignette(night: number): void {
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(
      this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.28,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.75
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(6,12,26,${0.2 + night * 0.18})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  private hexPath(cx: number, cy: number, size: number): void {
    const ctx = this.ctx;
    const corners = hexCorners(size);
    ctx.beginPath();
    corners.forEach((c, i) => {
      if (i === 0) ctx.moveTo(cx + c.x, cy + c.y);
      else ctx.lineTo(cx + c.x, cy + c.y);
    });
    ctx.closePath();
  }

  /**
   * Ground outside the claim. Drawn as one continuous plain with no grid on it —
   * the world plainly keeps going, you simply have no permit past the markers.
   */
  private drawFrontier(night: number): void {
    const ctx = this.ctx;
    const { palette } = this.state;
    const inner = (this.state.maxRing + 0.4) * HEX * 1.732;
    const outer = (this.state.maxRing + 5) * HEX * 1.732;

    const ground = mixRgb(toRgb(palette.groundLow), toRgb(palette.ground), 0.35);
    const fog = toRgb(palette.sky[1]);

    ctx.save();
    // Soft-edged plain: solid near the claim, dissolving into atmosphere further out.
    const g = ctx.createRadialGradient(0, 0, inner * 0.5, 0, 0, outer);
    g.addColorStop(0, rgbCss(mixRgb(ground, fog, 0.15)));
    g.addColorStop(0.45, rgbCss(mixRgb(ground, fog, 0.5), 0.9));
    g.addColorStop(0.78, rgbCss(mixRgb(ground, fog, 0.8), 0.5));
    g.addColorStop(1, rgbCss(fog, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, outer, 0, TAU);
    ctx.fill();

    // Broad relief so the plain is not a flat wash.
    ctx.globalAlpha = 0.5;
    for (const rock of this.frontierRocks) {
      const dist = Math.hypot(rock.x, rock.y);
      const fade = clamp01(1 - (dist - inner) / (outer - inner));
      if (fade <= 0.05) continue;
      ctx.fillStyle = rgbCss(
        mixRgb(mixRgb(toRgb(palette.rock), ground, 0.4), fog, 1 - fade),
        0.5 * fade
      );
      ctx.beginPath();
      ctx.ellipse(rock.x, rock.y, rock.r * 2.1, rock.r * 1.4, rock.shade * 3, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Night cools the whole plain down.
    if (night > 0.05) {
      ctx.fillStyle = `rgba(12,22,46,${night * 0.45})`;
      ctx.beginPath();
      ctx.arc(0, 0, outer, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawTile(tile: RenderTile, night: number): void {
    const ctx = this.ctx;
    const { palette } = this.state;
    const p = this.project(tile.q, tile.r, tile.elevation);

    if (!tile.unlocked) {
      // Surveyed but not permitted: outline only, so you can see the shape of what's next.
      ctx.save();
      ctx.globalAlpha = 0.3;
      this.hexPath(p.x, p.base, HEX * 0.97);
      ctx.fillStyle = 'rgba(10,18,30,0.5)';
      ctx.fill();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(255,220,150,0.5)';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.restore();
      return;
    }

    // --- tile top, drawn flush with its neighbours ---
    const sprite = this.sprites.get(tile.terrain, variantFor(tile.q, tile.r), {
      ground: palette.ground, groundLow: palette.groundLow, side: palette.side,
      rock: palette.rock, accent: palette.accent,
    });
    const sw = sprite.canvas.width / this.dpr;
    const sh = sprite.canvas.height / this.dpr;
    ctx.drawImage(sprite.canvas, p.x + sprite.ox, p.y + sprite.oy, sw, sh);

    // Hairline hex border: enough to read the grid, not enough to fence each tile in.
    this.hexPath(p.x, p.y, HEX);
    ctx.strokeStyle = 'rgba(255,255,255,0.055)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Night wash on the ground.
    if (night > 0.05) {
      this.hexPath(p.x, p.y, HEX * 0.99);
      ctx.fillStyle = `rgba(22,36,68,${night * 0.3})`;
      ctx.fill();
    }

    // Placement affordance.
    if (this.state.selectedBuildingId && !tile.building) {
      const valid = this.state.validPlacement.has(tile.key);
      ctx.save();
      this.hexPath(p.x, p.y, HEX * 0.9);
      ctx.fillStyle = valid ? 'rgba(120,255,190,0.13)' : 'rgba(255,90,90,0.1)';
      ctx.fill();
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = valid ? 'rgba(140,255,205,0.6)' : 'rgba(255,110,110,0.4)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();
    }

    if (this.state.bestKey === tile.key) {
      const pulse = 0.55 + 0.45 * Math.sin(this.time * 5);
      ctx.save();
      this.hexPath(p.x, p.y, HEX * 0.88);
      ctx.strokeStyle = `rgba(255,220,120,${pulse})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(255,220,120,0.8)';
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.restore();
    }

    if (this.state.hoverKey === tile.key) {
      ctx.save();
      this.hexPath(p.x, p.y, HEX * 0.99);
      ctx.strokeStyle = 'rgba(255,255,255,0.92)';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = 'rgba(180,230,255,0.9)';
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawLinks(): void {
    const linked = this.state.tiles.filter(t => t.linked);
    if (!linked.length || !this.state.hoverKey) return;
    const target = this.tileIndex.get(this.state.hoverKey);
    if (!target) return;

    const ctx = this.ctx;
    const to = this.project(target.q, target.r, target.elevation);
    ctx.save();
    ctx.lineCap = 'round';
    for (const tile of linked) {
      const from = this.project(tile.q, tile.r, tile.elevation);
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2 - 30;
      ctx.strokeStyle = 'rgba(140,240,255,0.6)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(140,240,255,0.9)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(mx, my, to.x, to.y);
      ctx.stroke();

      const t = (this.time * 0.8 + (tile.q + tile.r) * 0.17) % 1;
      const px = (1 - t) ** 2 * from.x + 2 * (1 - t) * t * mx + t ** 2 * to.x;
      const py = (1 - t) ** 2 * from.y + 2 * (1 - t) * t * my + t ** 2 * to.y;
      ctx.fillStyle = '#dffaff';
      ctx.beginPath();
      ctx.arc(px, py, 3.2, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawGhost(night: number): void {
    const { hoverKey, selectedBuildingId } = this.state;
    if (!hoverKey || !selectedBuildingId) return;
    const tile = this.tileIndex.get(hoverKey);
    if (!tile || tile.building || !tile.unlocked) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = this.state.validPlacement.has(hoverKey) ? 0.92 : 0.6;
    const p = this.project(tile.q, tile.r, tile.elevation);
    this.paintBuilding(selectedBuildingId, p.x, p.y, 1, tile, true, night);
    ctx.restore();
  }

  private drawBuilding(tile: RenderTile, night: number): void {
    if (!tile.building || !tile.unlocked) return;
    const p = this.project(tile.q, tile.r, tile.elevation);
    const pop = this.popIns.get(tile.key);
    const scale = pop === undefined ? 1 : easeOutBack(pop);
    this.paintBuilding(tile.building, p.x, p.y, scale, tile, false, night);
  }

  private paintBuilding(
    buildingId: string, cx: number, cy: number, scale: number,
    tile: RenderTile, ghost: boolean, night: number
  ): void {
    const def = getBuilding(buildingId);
    if (!def) return;
    const ctx = this.ctx;
    const s = HEX * 0.78 * scale;
    const meta = CATEGORY_META[def.category];
    const dim = !ghost && !tile.powered;

    ctx.save();
    ctx.translate(cx, cy);
    // Unpowered used to fade to 45% and vanish. Keep it readable and show the
    // state through the sparks below instead.
    if (dim) ctx.globalAlpha *= 0.82;

    if (!ghost) {
      // Seen from directly above, a structure drops a short shadow, not a long cast.
      ctx.save();
      // Flat contact shadow. A radial gradient here is what made these look dated.
      ctx.globalAlpha *= 0.2 * (1 - night * 0.35);
      ctx.fillStyle = '#050a16';
      ctx.beginPath();
      ctx.ellipse(s * 0.06, s * 0.16, s * 0.62, s * 0.34, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    const paintTile: PaintTile = {
      q: tile.q, r: tile.r, terrain: tile.terrain,
      building: tile.building, powered: tile.powered,
    };
    const painter = BUILDING_PAINTERS[buildingId];
    if (painter) painter(ctx, s, this.time, meta, paintTile, night);

    if (dim && Math.sin(this.time * 9 + tile.q * 2 + tile.r) > 0.93) {
      ctx.fillStyle = 'rgba(255,220,120,0.9)';
      ctx.beginPath();
      ctx.arc((Math.random() - 0.5) * s, -s * (0.6 + Math.random() * 0.5), 1.6, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }



  /**
   * One large noise layer laid over every tile at once. Without it the grid reads as
   * a set of repeated stamps; with it the same six sprites become one landscape with
   * broad light and dark country running across tile boundaries.
   */
  private macroTexture(): HTMLCanvasElement {
    if (this.macro) return this.macro;
    const N = 320;
    const canvas = document.createElement('canvas');
    canvas.width = N;
    canvas.height = N;
    const c = canvas.getContext('2d')!;
    const img = c.createImageData(N, N);
    const seed = this.state.planetId.length * 7.3;

    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const broad = fbm(x / 46 + seed, y / 46 + seed, 5);
        const streak = fbm(x / 130 + seed + 20, y / 18 + seed, 3);
        const v = broad * 0.72 + streak * 0.28;
        // Neutral grey around 128 so 'overlay' lightens and darkens symmetrically.
        const level = 110 + v * 92;
        const i = (y * N + x) * 4;
        img.data[i] = level;
        img.data[i + 1] = level * 0.99;
        img.data[i + 2] = level * 0.96;
        img.data[i + 3] = 255;
      }
    }
    c.putImageData(img, 0, 0);
    this.macro = canvas;
    return canvas;
  }

  private drawMacroWash(): void {
    const tiles = this.state.tiles.filter(t => t.unlocked);
    if (!tiles.length) return;
    const ctx = this.ctx;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    ctx.save();
    ctx.beginPath();
    for (const tile of tiles) {
      const p = this.project(tile.q, tile.r, tile.elevation);
      minX = Math.min(minX, p.x - HEX);
      maxX = Math.max(maxX, p.x + HEX);
      minY = Math.min(minY, p.y - HEX);
      maxY = Math.max(maxY, p.y + HEX);
      const corners = hexCorners(HEX * 1.02);
      corners.forEach((c, i) => {
        if (i === 0) ctx.moveTo(p.x + c.x, p.y + c.y);
        else ctx.lineTo(p.x + c.x, p.y + c.y);
      });
      ctx.closePath();
    }
    ctx.clip();

    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.22;
    ctx.drawImage(this.macroTexture(), minX, minY, maxX - minX, maxY - minY);
    ctx.restore();
  }


  /**
   * Occasional foot traffic between nearby buildings. Cheap, but it is the thing
   * that makes the site feel staffed rather than static.
   */
  private stepWorkers(dt: number): void {
    for (const w of this.workers) w.t += w.speed * dt;
    this.workers = this.workers.filter(w => w.t < 1);

    const built = this.state.tiles.filter(t => t.building && t.unlocked);
    const want = Math.min(8, Math.floor(built.length / 4));
    if (this.workers.length >= want || built.length < 2) return;
    if (Math.random() > dt * 1.6) return;

    const from = built[Math.floor(Math.random() * built.length)];
    // Prefer a neighbour that is actually close, so nobody hikes across the map.
    const near = built.filter(t => {
      if (t.key === from.key) return false;
      const dq = t.q - from.q;
      const dr = t.r - from.r;
      return (Math.abs(dq) + Math.abs(dq + dr) + Math.abs(dr)) / 2 <= 2;
    });
    if (!near.length) return;
    const to = near[Math.floor(Math.random() * near.length)];

    const a = this.project(from.q, from.r, from.elevation);
    const b = this.project(to.q, to.r, to.elevation);
    this.workers.push({
      fromX: a.x + (Math.random() - 0.5) * HEX * 0.3,
      fromY: a.y + HEX * 0.22,
      toX: b.x + (Math.random() - 0.5) * HEX * 0.3,
      toY: b.y + HEX * 0.22,
      t: 0,
      speed: 0.16 + Math.random() * 0.12,
      colour: Math.random() > 0.5 ? '#ffd98a' : '#dce8f7',
    });
  }

  private drawWorkers(night: number): void {
    if (!this.workers.length) return;
    const ctx = this.ctx;
    ctx.save();
    for (const w of this.workers) {
      const x = w.fromX + (w.toX - w.fromX) * w.t;
      const y = w.fromY + (w.toY - w.fromY) * w.t;
      // Fade in and out at the ends so they appear to enter and leave the buildings.
      const fade = Math.min(1, Math.min(w.t, 1 - w.t) * 6);
      // Little bob for the walk cycle.
      const bob = Math.sin(this.time * 9 + w.fromX) * 0.8;

      ctx.globalAlpha = fade * 0.5;
      ctx.fillStyle = '#050a16';
      ctx.beginPath();
      ctx.ellipse(x, y + 2.4, 3.2, 1.5, 0, 0, TAU);
      ctx.fill();

      ctx.globalAlpha = fade;
      ctx.fillStyle = w.colour;
      ctx.beginPath();
      ctx.arc(x, y + bob, 2.3, 0, TAU);
      ctx.fill();
      if (night > 0.3) {
        ctx.fillStyle = 'rgba(255,226,160,0.9)';
        ctx.beginPath();
        ctx.arc(x, y + bob - 3, 1.1, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private drawParticles(): void {
    const ctx = this.ctx;
    ctx.save();
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      if (p.kind === 'ring') {
        const progress = 1 - alpha;
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3 * alpha;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * (0.4 + progress * 1.3), p.size * (0.2 + progress * 0.7), 0, 0, TAU);
        ctx.stroke();
      } else {
        ctx.globalAlpha = alpha * (p.kind === 'smoke' ? 0.32 : 1);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private drawFloaters(): void {
    const ctx = this.ctx;
    ctx.save();
    // Counter the camera zoom so this reads the same size however far out you are.
    const px = Math.round(19 / Math.max(0.55, this.camera.zoom));
    ctx.font = `800 ${px}px Jost, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    for (const f of this.floaters) {
      ctx.globalAlpha = Math.min(1, f.life);
      ctx.lineWidth = px * 0.22;
      ctx.strokeStyle = 'rgba(6,12,26,0.85)';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.restore();
  }
}
