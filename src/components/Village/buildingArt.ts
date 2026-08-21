// Building art — flat, chunky, a little bit cute.
//
// House rules, applied to every painter:
//   · No gradients. Ever. Flat fills only, two or three tones per shape.
//   · No shadowBlur glows. Lights are solid dots, warmer at night.
//   · Rounded corners and generous radii. Shapes should read as toys, not renders.
//   · A structure is: a chunky body (top face + short front face) + one silhouette
//     feature that says what it is + a few light dots.
//
// Painters draw centred on (0,0) with +y toward the viewer, in units of `s`
// (roughly 0.7 of a tile radius). `night` runs 0 (day) to ~0.8 (dark).

import { CATEGORY_META, TerrainType } from '../../data/buildings';
import { roundRect, tones } from './terrain';

const TAU = Math.PI * 2;

export interface PaintTile {
  q: number;
  r: number;
  terrain: TerrainType;
  building: string | null;
  powered: boolean;
}

export type Meta = typeof CATEGORY_META[keyof typeof CATEGORY_META];
export type Painter = (
  ctx: CanvasRenderingContext2D,
  s: number,
  time: number,
  meta: Meta,
  tile: PaintTile,
  night: number
) => void;

// --- shared shapes -----------------------------------------------------------

/**
 * A chunky block: flat top face, short flat front face, rounded corners.
 * This is the workhorse — nearly every building is one or more of these.
 */
const chunk = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  top: string, front: string, radius = 0
): void => {
  const r = radius || Math.min(w, h) * 0.22;
  ctx.fillStyle = front;
  roundRect(ctx, x - w / 2, y - h * 0.42, w, h * 0.72, r);
  ctx.fill();
  ctx.fillStyle = top;
  roundRect(ctx, x - w / 2, y - h, w, h * 0.72, r);
  ctx.fill();
};

/** Solid light dot. Warm after dark, cool and quiet by day. */
const lamp = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number, night: number, on = true
): void => {
  ctx.fillStyle = !on
    ? 'rgba(120,140,170,0.5)'
    : night > 0.2 ? '#ffd98a' : 'rgba(214,238,255,0.9)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
};

/** A grid of little window squares across a face. */
const windows = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  cols: number, rows: number, night: number, seed: number
): void => {
  const cw = w / cols;
  const ch = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const on = (Math.sin(seed * 2.3 + c * 2.7 + r * 5.1) + 1) / 2 > 0.3;
      ctx.fillStyle = on && night > 0.2 ? '#ffd98a' : 'rgba(198,222,244,0.6)';
      roundRect(ctx, x + c * cw + cw * 0.22, y + r * ch + ch * 0.22, cw * 0.56, ch * 0.56, cw * 0.16);
      ctx.fill();
    }
  }
};

const disc = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string): void => {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
};

/**
 * A factory hall: one continuous outline whose top edge is a sawtooth roof, so the
 * roof is part of the building silhouette instead of triangles sitting on a box.
 */
const sawtoothHall = (
  ctx: CanvasRenderingContext2D,
  w: number, h: number, teeth: number,
  top: string, front: string
): void => {
  const left = -w / 2;
  const toothW = w / teeth;
  const peak = h * 0.42;

  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.moveTo(left, 0);
  ctx.lineTo(left, -h * 0.42);
  for (let i = 0; i < teeth; i++) {
    const x = left + i * toothW;
    ctx.lineTo(x + toothW * 0.34, -h * 0.42 - peak);
    ctx.lineTo(x + toothW, -h * 0.42);
  }
  ctx.lineTo(left + w, 0);
  ctx.closePath();
  ctx.fill();

  // Front wall in the darker tone, sharing the same outline.
  ctx.fillStyle = front;
  ctx.beginPath();
  ctx.moveTo(left, 0);
  ctx.lineTo(left, -h * 0.42);
  ctx.lineTo(left + w, -h * 0.42);
  ctx.lineTo(left + w, 0);
  ctx.closePath();
  ctx.fill();
};

/** Half-circle dome sitting on the ground line. */
const dome = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number, body: string, light: string
): void => {
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.arc(x - r * 0.28, y, r * 0.46, Math.PI, TAU);
  ctx.closePath();
  ctx.fill();
};

// --- painters ----------------------------------------------------------------

export const BUILDING_PAINTERS: Record<string, Painter> = {
  // ======================= POWER =======================
  'solar-panel': (ctx, s) => {
    // Two tilted arrays with a visible cell grid and support legs — the cell grid is
    // what actually makes this read as a solar panel rather than a blue slab.
    const t = tones('#2f5fa8');
    for (const oy of [-s * 0.3, s * 0.24]) {
      // Legs poking out below the panel.
      ctx.fillStyle = '#79839a';
      roundRect(ctx, -s * 0.4, oy + s * 0.16, s * 0.08, s * 0.16, s * 0.03);
      ctx.fill();
      roundRect(ctx, s * 0.32, oy + s * 0.16, s * 0.08, s * 0.16, s * 0.03);
      ctx.fill();

      // Frame, then the dark glass, then the cells.
      ctx.fillStyle = '#aab4c6';
      roundRect(ctx, -s * 0.66, oy - s * 0.24, s * 1.32, s * 0.44, s * 0.05);
      ctx.fill();
      ctx.fillStyle = t.dark;
      roundRect(ctx, -s * 0.63, oy - s * 0.21, s * 1.26, s * 0.38, s * 0.04);
      ctx.fill();
      ctx.fillStyle = t.base;
      for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 2; r++) {
          roundRect(
            ctx,
            -s * 0.6 + c * s * 0.248, oy - s * 0.185 + r * s * 0.175,
            s * 0.21, s * 0.14, s * 0.02
          );
          ctx.fill();
        }
      }
      // Highlight streak across the top row of cells, flat not gradient.
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      roundRect(ctx, -s * 0.6, oy - s * 0.185, s * 1.2, s * 0.055, s * 0.02);
      ctx.fill();
    }
  },

  'wind-turbine': (ctx, s, time) => {
    disc(ctx, 0, s * 0.3, s * 0.16, '#8d97a8');
    ctx.fillStyle = '#e8edf5';
    roundRect(ctx, -s * 0.06, -s * 0.5, s * 0.12, s * 0.85, s * 0.06);
    ctx.fill();
    ctx.save();
    ctx.translate(0, -s * 0.52);
    ctx.rotate(time * 1.6);
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i * TAU) / 3);
      roundRect(ctx, -s * 0.055, -s * 0.62, s * 0.11, s * 0.62, s * 0.055);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    disc(ctx, 0, -s * 0.52, s * 0.09, '#c3ccda');
  },

  'geothermal-plant': (ctx, s, time, meta, tile, night) => {
    // Plant hall, a stack with steam, and pipework running to a wellhead.
    const t = tones('#9a7350');
    // Pipes first so they read as going under the building.
    ctx.strokeStyle = '#8f9aa8';
    ctx.lineWidth = s * 0.09;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.56, s * 0.24);
    ctx.lineTo(s * 0.2, s * 0.24);
    ctx.moveTo(s * 0.2, s * 0.24);
    ctx.lineTo(s * 0.5, -s * 0.02);
    ctx.stroke();
    disc(ctx, -s * 0.58, s * 0.24, s * 0.1, '#6f7a88');

    chunk(ctx, -s * 0.12, s * 0.06, s * 0.82, s * 0.6, t.light, t.base, s * 0.08);
    windows(ctx, -s * 0.44, -s * 0.36, s * 0.6, s * 0.18, 3, 1, night, tile.q);

    // Stack.
    ctx.fillStyle = '#b8a48c';
    roundRect(ctx, s * 0.34, -s * 0.66, s * 0.24, s * 0.62, s * 0.06);
    ctx.fill();
    ctx.fillStyle = '#8a7460';
    roundRect(ctx, s * 0.34, -s * 0.66, s * 0.24, s * 0.09, s * 0.04);
    ctx.fill();
  },

  'fusion-reactor': (ctx, s, time, meta, tile, night) => {
    const t = tones('#5d6a86');
    chunk(ctx, 0, s * 0.16, s * 1.02, s * 0.5, t.light, t.base, s * 0.2);
    disc(ctx, 0, -s * 0.22, s * 0.34, t.dark);
    disc(ctx, 0, -s * 0.22, s * 0.26, '#7fe3ff');
    disc(ctx, 0, -s * 0.22, s * 0.13 * (1 + Math.sin(time * 2) * 0.12), '#e8fbff');
    for (const dx of [-s * 0.44, s * 0.44]) lamp(ctx, dx, -s * 0.3, s * 0.05, night);
  },

  'dyson-collector': (ctx, s, time) => {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + time * 0.12;
      ctx.save();
      ctx.translate(Math.cos(a) * s * 0.6, Math.sin(a) * s * 0.6 * 0.78);
      ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = '#dfe8f5';
      roundRect(ctx, -s * 0.14, -s * 0.09, s * 0.28, s * 0.18, s * 0.05);
      ctx.fill();
      ctx.restore();
    }
    chunk(ctx, 0, s * 0.06, s * 0.3, s * 0.62, '#f5dd94', '#c9a94e', s * 0.1);
    disc(ctx, 0, -s * 0.5, s * 0.15, '#fff4c4');
  },

  // ======================= COMPUTE =======================
  'server-rack': (ctx, s, time, meta, tile) => {
    // Three cabinets with visible 1U slots and an LED column each.
    const t = tones('#2f4f83');
    ctx.fillStyle = '#20293c';
    roundRect(ctx, -s * 0.72, -s * 0.02, s * 1.44, s * 0.42, s * 0.08);
    ctx.fill();

    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * s * 0.46;
      chunk(ctx, x, s * 0.06, s * 0.4, s * 0.78, t.light, t.base, s * 0.06);
      // Server units: thin horizontal slots down the face.
      for (let u = 0; u < 6; u++) {
        const y = -s * 0.6 + u * s * 0.1;
        ctx.fillStyle = '#16203a';
        roundRect(ctx, x - s * 0.15, y, s * 0.3, s * 0.062, s * 0.014);
        ctx.fill();
        const on = Math.sin(time * 3 + u * 1.3 + i * 2.2 + tile.q) > -0.3;
        ctx.fillStyle = on ? '#7fe8ff' : 'rgba(150,175,210,0.55)';
        ctx.beginPath();
        ctx.arc(x + s * 0.11, y + s * 0.031, s * 0.018, 0, TAU);
        ctx.fill();
      }
    }
  },

  'data-center': (ctx, s, time, meta, tile, night) => {
    // Long shed: ribbed roof, rooftop chillers with fans, loading dock.
    const t = tones('#356094');
    chunk(ctx, 0, s * 0.14, s * 1.24, s * 0.7, t.light, t.base, s * 0.1);

    // A single seam along the roof rather than a fence of ribs.
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    roundRect(ctx, -s * 0.56, -s * 0.44, s * 1.12, s * 0.05, s * 0.02);
    ctx.fill();

    // Chiller units with turning fans.
    for (let i = 0; i < 3; i++) {
      const x = -s * 0.38 + i * s * 0.38;
      ctx.fillStyle = '#8fa8c8';
      roundRect(ctx, x - s * 0.14, -s * 0.62, s * 0.28, s * 0.24, s * 0.05);
      ctx.fill();
      disc(ctx, x, -s * 0.5, s * 0.1, '#22364f');
      ctx.save();
      ctx.translate(x, -s * 0.5);
      ctx.rotate(time * 3 + i);
      ctx.fillStyle = '#cfe6ff';
      for (let b = 0; b < 3; b++) {
        ctx.save();
        ctx.rotate((b * TAU) / 3);
        roundRect(ctx, -s * 0.018, -s * 0.085, s * 0.036, s * 0.085, s * 0.018);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    // Dock door and a strip of windows.
    ctx.fillStyle = '#1b2c44';
    roundRect(ctx, -s * 0.16, -s * 0.1, s * 0.32, s * 0.24, s * 0.03);
    ctx.fill();
    windows(ctx, -s * 0.58, -s * 0.1, s * 0.36, s * 0.18, 2, 1, night, tile.r);
    windows(ctx, s * 0.22, -s * 0.1, s * 0.36, s * 0.18, 2, 1, night, tile.r + 3);
  },

  supercomputer: (ctx, s, time) => {
    const t = tones('#2f4f83');
    const heights = [0.62, 0.86, 0.7];
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * s * 0.42;
      chunk(ctx, x, s * 0.12, s * 0.34, s * heights[i], t.light, t.base, s * 0.09);
      const on = Math.sin(time * 2.4 + i * 1.9) > -0.3;
      ctx.fillStyle = on ? '#8ceaff' : 'rgba(140,168,205,0.45)';
      roundRect(ctx, x - s * 0.1, -s * heights[i] + s * 0.16, s * 0.2, s * 0.36, s * 0.06);
      ctx.fill();
    }
  },

  'quantum-computer': (ctx, s, time) => {
    const t = tones('#2f4f83');
    chunk(ctx, 0, s * 0.14, s * 1.0, s * 0.72, t.light, t.base, s * 0.16);
    for (let i = 0; i < 6; i++) {
      const on = Math.sin(time * 4 + i * 0.9) > -0.4;
      ctx.fillStyle = on ? '#a8f0ff' : 'rgba(140,168,205,0.4)';
      roundRect(ctx, -s * 0.42 + i * s * 0.15, -s * 0.44, s * 0.1, s * 0.3, s * 0.04);
      ctx.fill();
    }
    disc(ctx, 0, -s * 0.6, s * 0.1, '#7fe8ff');
  },

  'ai-core': (ctx, s, time, meta, tile, night) => {
    const t = tones('#3aa8e8');
    chunk(ctx, 0, s * 0.18, s * 1.06, s * 0.5, t.light, t.base, s * 0.2);
    ctx.save();
    ctx.translate(0, -s * 0.34);
    ctx.rotate(time * 0.5);
    ctx.fillStyle = '#c9edff';
    roundRect(ctx, -s * 0.3, -s * 0.3, s * 0.6, s * 0.6, s * 0.12);
    ctx.fill();
    ctx.restore();
    disc(ctx, 0, -s * 0.34, s * 0.15, '#ffffff');
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + time * 0.9;
      lamp(ctx, Math.cos(a) * s * 0.52, -s * 0.34 + Math.sin(a) * s * 0.3, s * 0.05, night);
    }
  },

  // ======================= EXTRACTION =======================
  'mining-drone': (ctx, s, time, meta, tile, night) => {
    // A tracked digger: two tracks, a cab, a boom and a toothed bucket.
    const t = tones('#c98a4b');
    const swing = Math.sin(time * 1.3);

    // Tracks.
    ctx.fillStyle = '#3f4450';
    roundRect(ctx, -s * 0.5, s * 0.06, s * 0.86, s * 0.16, s * 0.08);
    ctx.fill();
    roundRect(ctx, -s * 0.5, s * 0.26, s * 0.86, s * 0.16, s * 0.08);
    ctx.fill();
    ctx.fillStyle = '#5a616f';
    for (let i = 0; i < 5; i++) {
      roundRect(ctx, -s * 0.46 + i * s * 0.17, s * 0.09, s * 0.06, s * 0.1, s * 0.02);
      ctx.fill();
      roundRect(ctx, -s * 0.46 + i * s * 0.17, s * 0.29, s * 0.06, s * 0.1, s * 0.02);
      ctx.fill();
    }

    // Cab.
    ctx.fillStyle = t.base;
    roundRect(ctx, -s * 0.42, -s * 0.34, s * 0.56, s * 0.42, s * 0.08);
    ctx.fill();
    ctx.fillStyle = t.light;
    roundRect(ctx, -s * 0.42, -s * 0.34, s * 0.56, s * 0.2, s * 0.07);
    ctx.fill();
    ctx.fillStyle = '#1f2a3a';
    roundRect(ctx, -s * 0.34, -s * 0.28, s * 0.24, s * 0.18, s * 0.04);
    ctx.fill();

    // Boom and bucket.
    ctx.strokeStyle = t.dark;
    ctx.lineWidth = s * 0.11;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s * 0.08, -s * 0.18);
    ctx.lineTo(s * 0.36 + swing * s * 0.05, -s * 0.4);
    ctx.lineTo(s * 0.54 + swing * s * 0.08, -s * 0.12);
    ctx.stroke();
    ctx.fillStyle = '#e8d3b4';
    ctx.beginPath();
    ctx.moveTo(s * 0.44 + swing * s * 0.08, -s * 0.14);
    ctx.lineTo(s * 0.68 + swing * s * 0.08, -s * 0.14);
    ctx.lineTo(s * 0.62 + swing * s * 0.08, s * 0.06);
    ctx.lineTo(s * 0.48 + swing * s * 0.08, s * 0.06);
    ctx.closePath();
    ctx.fill();
    lamp(ctx, -s * 0.36, -s * 0.4, s * 0.05, night);
  },

  'deep-mine': (ctx, s, time) => {
    const t = tones('#8a6a4a');
    chunk(ctx, 0, s * 0.2, s * 0.9, s * 0.44, t.light, t.base, s * 0.12);
    // Headframe as one solid silhouette, merged into the building tone.
    ctx.fillStyle = '#a8906f';
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.1);
    ctx.lineTo(-s * 0.07, -s * 0.78);
    ctx.lineTo(s * 0.07, -s * 0.78);
    ctx.lineTo(s * 0.3, -s * 0.1);
    ctx.lineTo(s * 0.16, -s * 0.1);
    ctx.lineTo(0, -s * 0.6);
    ctx.lineTo(-s * 0.16, -s * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.translate(0, -s * 0.74);
    ctx.rotate(time * 1.4);
    disc(ctx, 0, 0, s * 0.17, '#d9c3a2');
    ctx.strokeStyle = '#8a6a4a';
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.moveTo(-s * 0.17, 0);
    ctx.lineTo(s * 0.17, 0);
    ctx.moveTo(0, -s * 0.17);
    ctx.lineTo(0, s * 0.17);
    ctx.stroke();
    ctx.restore();
  },

  'asteroid-harvester': (ctx, s, time) => {
    const t = tones('#a8845c');
    disc(ctx, 0, 0, s * 0.72, t.dark);
    disc(ctx, 0, s * 0.03, s * 0.5, t.base);
    disc(ctx, 0, s * 0.06, s * 0.28, t.light);
    for (let i = 0; i < 2; i++) {
      const a = time * 0.6 + i * Math.PI;
      ctx.fillStyle = '#ffd98a';
      roundRect(ctx, Math.cos(a) * s * 0.6 - s * 0.06, Math.sin(a) * s * 0.6 - s * 0.04, s * 0.12, s * 0.08, s * 0.03);
      ctx.fill();
    }
  },

  'planet-cracker': (ctx, s, time) => {
    const t = tones('#8f6f4e');
    disc(ctx, 0, 0, s * 0.92, t.deep);
    disc(ctx, 0, s * 0.02, s * 0.7, t.dark);
    disc(ctx, 0, s * 0.04, s * 0.48, t.base);
    disc(ctx, 0, s * 0.06, s * 0.26, t.light);
    disc(ctx, 0, s * 0.06, s * 0.12, '#ff9a4c');
    for (let i = 0; i < 3; i++) {
      const a = time * 0.5 + (i / 3) * TAU;
      ctx.fillStyle = '#ffd98a';
      roundRect(ctx, Math.cos(a) * s * 0.78 - s * 0.06, Math.sin(a) * s * 0.78 - s * 0.04, s * 0.13, s * 0.08, s * 0.03);
      ctx.fill();
    }
  },

  // ======================= RESEARCH =======================
  'research-lab': (ctx, s, time, meta, tile, night) => {
    // Lab block with an observatory dome and a dish on a mast.
    const t = tones('#3fbfae');
    chunk(ctx, -s * 0.08, s * 0.22, s * 0.82, s * 0.36, t.light, t.base, s * 0.08);
    windows(ctx, -s * 0.42, -s * 0.06, s * 0.5, s * 0.16, 3, 1, night, tile.q);

    dome(ctx, -s * 0.16, -s * 0.14, s * 0.34, '#e4fffa', '#ffffff');
    // Observatory slit, in the dome's own shadow tone so it reads as an opening.
    ctx.fillStyle = '#9fded4';
    roundRect(ctx, -s * 0.2, -s * 0.42, s * 0.07, s * 0.28, s * 0.035);
    ctx.fill();

    // Dish on a short mast.
    ctx.strokeStyle = '#8fb8b2';
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.moveTo(s * 0.36, s * 0.04);
    ctx.lineTo(s * 0.36, -s * 0.26);
    ctx.stroke();
    ctx.save();
    ctx.translate(s * 0.36, -s * 0.3);
    ctx.rotate(Math.sin(time * 0.4) * 0.35);
    ctx.fillStyle = '#d6fff8';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.17, s * 0.11, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#7fd8cc';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.01, s * 0.1, s * 0.06, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    lamp(ctx, -s * 0.42, -s * 0.24, s * 0.045, night);
  },

  'ai-lab': (ctx, s, time, meta, tile, night) => {
    const t = tones('#3fbfae');
    chunk(ctx, -s * 0.42, s * 0.2, s * 0.34, s * 0.4, t.light, t.base, s * 0.1);
    chunk(ctx, s * 0.42, s * 0.2, s * 0.34, s * 0.34, t.light, t.base, s * 0.1);
    dome(ctx, 0, -s * 0.02, s * 0.42, t.base, '#d6fff8');
    for (let i = 0; i < 3; i++) {
      lamp(ctx, -s * 0.2 + i * s * 0.2, -s * 0.52, s * 0.045, night, Math.sin(time * 2 + i) > -0.4);
    }
  },

  'quantum-lab': (ctx, s) => {
    const t = tones('#3fbfae');
    chunk(ctx, 0, s * 0.2, s * 0.98, s * 0.36, t.light, t.base, s * 0.12);
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * s * 0.32;
      ctx.fillStyle = '#1f7c72';
      roundRect(ctx, x - s * 0.12, -s * 0.62, s * 0.24, s * 0.56, s * 0.12);
      ctx.fill();
      ctx.fillStyle = '#a8f5ea';
      roundRect(ctx, x - s * 0.08, -s * 0.58, s * 0.16, s * 0.2, s * 0.08);
      ctx.fill();
      disc(ctx, x, -s * 0.62, s * 0.12, '#d6fff8');
    }
  },

  'agi-lab': (ctx, s, time, meta, tile, night) => {
    const t = tones('#3fbfae');
    chunk(ctx, 0, s * 0.24, s * 1.1, s * 0.3, t.light, t.base, s * 0.12);
    dome(ctx, -s * 0.4, s * 0.04, s * 0.3, t.base, '#d6fff8');
    dome(ctx, s * 0.4, s * 0.04, s * 0.3, t.base, '#d6fff8');
    dome(ctx, 0, s * 0.04, s * 0.46, t.base, '#d6fff8');
    ctx.save();
    ctx.translate(0, -s * 0.5);
    ctx.rotate(Math.sin(time * 0.35) * 0.5);
    ctx.fillStyle = '#d6fff8';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.16, s * 0.1, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    lamp(ctx, 0, -s * 0.62, s * 0.06, night, Math.sin(time * 1.6) > -0.5);
  },

  // ======================= MANUFACTURING =======================
  fabricator: (ctx, s, time, meta, tile, night) => {
    // Machine shop: sawtooth hall, a turning extractor fan, and a press that strokes.
    const t = tones('#7a55a8');
    ctx.save();
    ctx.translate(0, s * 0.3);
    sawtoothHall(ctx, s * 1.04, s * 0.72, 3, t.light, t.base);
    ctx.restore();

    windows(ctx, -s * 0.42, -s * 0.06, s * 0.84, s * 0.18, 4, 1, night, tile.q + 2);

    // Roof extractor, turning.
    disc(ctx, s * 0.3, -s * 0.52, s * 0.11, t.dark);
    ctx.save();
    ctx.translate(s * 0.3, -s * 0.52);
    ctx.rotate(time * 2.6);
    ctx.fillStyle = '#e3d0ff';
    for (let b = 0; b < 3; b++) {
      ctx.save();
      ctx.rotate((b * TAU) / 3);
      roundRect(ctx, -s * 0.018, -s * 0.09, s * 0.036, s * 0.09, s * 0.018);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Press arm, stroking up and down inside the open bay.
    const stroke = (Math.sin(time * 2.2) + 1) / 2;
    ctx.fillStyle = '#3b2b52';
    roundRect(ctx, -s * 0.36, -s * 0.06, s * 0.28, s * 0.3, s * 0.04);
    ctx.fill();
    ctx.fillStyle = '#c9a6f0';
    roundRect(ctx, -s * 0.32, -s * 0.02 + stroke * s * 0.12, s * 0.2, s * 0.09, s * 0.03);
    ctx.fill();
  },

  smelter: (ctx, s, time) => {
    const t = tones('#7a55a8');
    chunk(ctx, 0, s * 0.18, s * 1.04, s * 0.48, t.light, t.base, s * 0.1);
    for (const dx of [-s * 0.32, s * 0.16]) {
      ctx.fillStyle = t.dark;
      roundRect(ctx, dx - s * 0.1, -s * 0.76, s * 0.2, s * 0.44, s * 0.07);
      ctx.fill();
    }
    // Tap hole glow, and a crucible tracking across on its rail.
    ctx.fillStyle = '#ff9a4c';
    roundRect(ctx, -s * 0.28, -s * 0.16, s * 0.56, s * 0.16, s * 0.06);
    ctx.fill();
    const travel = (Math.sin(time * 0.8) + 1) / 2;
    ctx.fillStyle = '#4a3663';
    roundRect(ctx, -s * 0.34, -s * 0.3, s * 0.68, s * 0.05, s * 0.02);
    ctx.fill();
    ctx.fillStyle = '#ffb45c';
    roundRect(ctx, -s * 0.32 + travel * s * 0.54, -s * 0.3, s * 0.12, s * 0.12, s * 0.04);
    ctx.fill();
  },

  'matter-compiler': (ctx, s, time) => {
    const t = tones('#7a55a8');
    ctx.save();
    ctx.translate(0, s * 0.34);
    sawtoothHall(ctx, s * 1.2, s * 0.8, 4, t.light, t.base);
    ctx.restore();

    // Conveyor running out of the hall with stock moving along it.
    ctx.fillStyle = '#3b2b52';
    roundRect(ctx, -s * 0.54, s * 0.06, s * 1.08, s * 0.13, s * 0.06);
    ctx.fill();
    for (let i = 0; i < 4; i++) {
      const x = -s * 0.5 + ((time * 0.32 + i / 4) % 1) * s * 1.0;
      ctx.fillStyle = '#e3d0ff';
      roundRect(ctx, x, s * 0.08, s * 0.1, s * 0.09, s * 0.03);
      ctx.fill();
    }
    // Extractor stack.
    ctx.fillStyle = t.dark;
    roundRect(ctx, s * 0.26, -s * 0.7, s * 0.17, s * 0.34, s * 0.05);
    ctx.fill();
  },

  'self-replicator': (ctx, s, time) => {
    const t = tones('#7a55a8');
    const cells: Array<[number, number]> = [[-0.3, -0.24], [0.3, -0.24], [-0.3, 0.24], [0.3, 0.24]];
    for (const [dx, dy] of cells) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 2 + dx * 4 + dy * 3);
      chunk(ctx, dx * s, dy * s + s * 0.1, s * 0.42, s * 0.4, t.light, t.base, s * 0.1);
      ctx.fillStyle = pulse > 0.5 ? '#e3d0ff' : 'rgba(180,150,220,0.55)';
      roundRect(ctx, dx * s - s * 0.09, dy * s - s * 0.2, s * 0.18, s * 0.12, s * 0.04);
      ctx.fill();
    }
    disc(ctx, 0, 0, s * 0.14, '#e3d0ff');
  },

  // ======================= HABITATION =======================
  'habitat-module': (ctx, s, time, meta, tile, night) => {
    const t = tones('#4f9d68');
    for (const dx of [-s * 0.28, s * 0.28]) {
      ctx.fillStyle = t.base;
      roundRect(ctx, dx - s * 0.26, -s * 0.42, s * 0.52, s * 0.66, s * 0.24);
      ctx.fill();
      ctx.fillStyle = t.light;
      roundRect(ctx, dx - s * 0.26, -s * 0.42, s * 0.52, s * 0.36, s * 0.2);
      ctx.fill();
      windows(ctx, dx - s * 0.18, -s * 0.32, s * 0.36, s * 0.18, 2, 1, night, tile.q + dx);
    }
    ctx.fillStyle = t.dark;
    roundRect(ctx, -s * 0.28, -s * 0.16, s * 0.56, s * 0.16, s * 0.07);
    ctx.fill();
  },

  'hydroponics-bay': (ctx, s, time) => {
    // Polytunnel: arched ribs, glazing, and visible rows of planting inside.
    const t = tones('#5fbf7a');
    chunk(ctx, 0, s * 0.24, s * 1.12, s * 0.22, t.dark, t.deep, s * 0.06);

    ctx.fillStyle = '#c8f7d4';
    ctx.beginPath();
    ctx.arc(0, s * 0.1, s * 0.56, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();

    // Planting rows showing through the glass.
    for (let row = 0; row < 3; row++) {
      const y = -s * 0.02 - row * s * 0.13;
      const halfWidth = s * 0.46 * Math.sqrt(Math.max(0, 1 - Math.pow((y - s * 0.1) / (s * 0.56), 2)));
      const sway = Math.sin(time * 1.1 + row) * s * 0.012;
      ctx.fillStyle = '#3f9d5a';
      roundRect(ctx, -halfWidth + sway, y, halfWidth * 2, s * 0.055, s * 0.025);
      ctx.fill();
    }

    // Ribs over the top.
    ctx.strokeStyle = 'rgba(70,140,95,0.65)';
    ctx.lineWidth = s * 0.04;
    for (let i = -2; i <= 2; i++) {
      const x = i * s * 0.22;
      const hh = s * 0.56 * Math.sqrt(Math.max(0, 1 - Math.pow(x / (s * 0.56), 2)));
      ctx.beginPath();
      ctx.moveTo(x, s * 0.1);
      ctx.lineTo(x, s * 0.1 - hh);
      ctx.stroke();
    }
    // Door.
    ctx.fillStyle = '#2f7a48';
    roundRect(ctx, -s * 0.09, -s * 0.04, s * 0.18, s * 0.16, s * 0.03);
    ctx.fill();
  },

  'dome-city': (ctx, s, time, meta, tile, night) => {
    const t = tones('#4f9d68');
    const towers: Array<[number, number]> = [[-0.34, 0.6], [0, 0.86], [0.34, 0.68]];
    for (const [dx, hh] of towers) {
      chunk(ctx, dx * s, s * 0.18, s * 0.3, s * hh, t.light, t.base, s * 0.09);
      windows(ctx, dx * s - s * 0.1, -s * hh + s * 0.16, s * 0.2, s * hh * 0.5, 2, 3, night, tile.q + dx * 7);
    }
    ctx.fillStyle = 'rgba(190,255,210,0.2)';
    ctx.beginPath();
    ctx.arc(0, s * 0.2, s * 0.72, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
  },

  arcology: (ctx, s, time, meta, tile, night) => {
    const t = tones('#4f9d68');
    const steps: Array<[number, number]> = [[1.02, 0.26], [0.7, 0.4], [0.38, 0.54]];
    for (const [y, wf] of steps) {
      ctx.fillStyle = t.base;
      roundRect(ctx, -(wf * s) / 2, -s * y, wf * s, s * 0.36, s * 0.1);
      ctx.fill();
      ctx.fillStyle = t.light;
      roundRect(ctx, -(wf * s) / 2, -s * y, wf * s, s * 0.2, s * 0.09);
      ctx.fill();
      windows(ctx, -(wf * s) / 2 + s * 0.05, -s * y + s * 0.04, wf * s - s * 0.1, s * 0.13, 4, 1, night, y * 11);
    }
    lamp(ctx, 0, -s * 1.12, s * 0.06, night, Math.sin(time * 1.8) > -0.4);
  },

  // ======================= LOGISTICS =======================
  spaceport: (ctx, s, time, meta, tile, night) => {
    disc(ctx, 0, 0, s * 0.76, '#4c525e');
    disc(ctx, 0, 0, s * 0.58, '#5c6470');
    ctx.strokeStyle = 'rgba(255,220,140,0.7)';
    ctx.lineWidth = s * 0.07;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.34, 0);
    ctx.lineTo(s * 0.34, 0);
    ctx.moveTo(0, -s * 0.34);
    ctx.lineTo(0, s * 0.34);
    ctx.stroke();

    const lift = (Math.sin(time * 0.7) + 1) / 2;
    const y = -s * 0.12 - lift * s * 0.14;
    ctx.fillStyle = '#f2f5fa';
    roundRect(ctx, -s * 0.14, y - s * 0.5, s * 0.28, s * 0.62, s * 0.13);
    ctx.fill();
    ctx.fillStyle = '#e0533c';
    roundRect(ctx, -s * 0.14, y - s * 0.5, s * 0.28, s * 0.18, s * 0.12);
    ctx.fill();
    ctx.fillStyle = '#c3ccda';
    roundRect(ctx, -s * 0.22, y - s * 0.02, s * 0.1, s * 0.18, s * 0.04);
    ctx.fill();
    roundRect(ctx, s * 0.12, y - s * 0.02, s * 0.1, s * 0.18, s * 0.04);
    ctx.fill();
    disc(ctx, 0, y + s * 0.2, s * 0.09 * (0.7 + lift * 0.5), '#ffb45c');
    for (const dx of [-s * 0.62, s * 0.62]) lamp(ctx, dx, -s * 0.1, s * 0.055, night);
  },
};
