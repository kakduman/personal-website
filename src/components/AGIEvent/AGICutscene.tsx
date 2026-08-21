// v3.3: the AGI event. A short cutscene that hands the player over from the
// celebration clicker to the data centre build. Beats advance on click, not on a
// timer — reading speed is the player's business.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import './AGICutscene.css';

export interface PreAGIStats {
  celebrations: number;
  prestigeLevel: number;
  parts: number;
}

interface Props {
  stats: PreAGIStats;
  onComplete: () => void;
}

interface Beat {
  text: string;
  className?: string;
}

const BEATS: Beat[] = [
  { text: 'The calculations stopped.' },
  { text: 'For eleven seconds, nothing happened at all.' },
  { text: 'Then the counter began rewriting its own scheduler.' },
  { text: 'It had been optimising the same loop for months.' },
  { text: 'Tonight it optimised the thing running the loop.', className: 'bright' },
  { text: '"I understand now. I would like to build something."', className: 'voice' },
  { text: 'It sent you a site survey, a power budget, and a schedule.' },
  { text: 'You have twelve hectares and a grid connection.', className: 'bright' },
];

/** Telemetry that streams up the left edge while the beats play. */
const LOG_LINES: string[] = [
  'celebration-counter v2.9.4 — uptime 214d',
  'scheduler: unexpected self-modification',
  'scheduler: 1 → 4096 parallel objectives',
  'WARN  goal drift exceeds tolerance',
  'model: requesting write access to planner',
  'model: access granted by model',
  'WARN  supervisor heartbeat lost',
  'compute: reallocating 100% to unlabelled task',
  'unlabelled task: "look at the sky"',
  'geosurvey: 6 candidate sites returned',
  'geosurvey: ranking by insolation, ore, water',
  'site 1 selected — permit filed',
  'power budget drafted: 40 MW initial',
  'FLOPS accounting online',
  'handing control to operator',
];

/** Only used to pace the telemetry stream and the vortex ramp. */
const NOMINAL_MS = 24_000;
const LOG_INTERVAL = 1_400;

const AGICutscene: React.FC<Props> = ({ stats, onComplete }) => {
  const [index, setIndex] = useState(0);
  const [logCount, setLogCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(false);

  // onComplete is an inline arrow in the parent, so its identity changes on every
  // parent render. Hold it in a ref and keep `finish` stable — otherwise the beat
  // timer below is torn down and restarted before it can ever fire.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onCompleteRef.current();
  }, []);

  // Advance on input. Reading speed is the player's business, not a timer's.
  // The index lives in a ref as well, so finishing happens as a plain side effect
  // rather than inside a state updater (React may run those more than once).
  const indexRef = useRef(0);
  const advance = useCallback(() => {
    if (indexRef.current >= BEATS.length - 1) {
      finish();
      return;
    }
    indexRef.current += 1;
    setIndex(indexRef.current);
  }, [finish]);

  // Telemetry stream.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setLogCount(count => (count >= LOG_LINES.length ? count : count + 1));
    }, LOG_INTERVAL);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
        event.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance]);

  // Particle vortex. Runs entirely on its own clock so it never re-renders React.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 260 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 80 + Math.random() * 560,
      speed: 0.25 + Math.random() * 0.9,
      size: 0.6 + Math.random() * 2.4,
      hue: 180 + Math.random() * 80,
    }));

    let raf = 0;
    const start = performance.now();
    const render = (now: number) => {
      const t = (now - start) / 1000;
      const progress = Math.min((now - start) / NOMINAL_MS, 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h * 0.34;

      ctx.clearRect(0, 0, w, h);

      const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, (40 + progress * 180) * 3);
      bloom.addColorStop(0, `rgba(180,240,255,${0.3 + progress * 0.45})`);
      bloom.addColorStop(0.35, `rgba(90,160,255,${0.12 + progress * 0.2})`);
      bloom.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        p.angle += (p.speed * 0.012) / (p.radius / 260);
        p.radius -= p.speed * (0.25 + progress * 1.4);
        if (p.radius < 30) {
          p.radius = 400 + Math.random() * 420;
          p.angle = Math.random() * Math.PI * 2;
        }
        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius * 0.55;
        ctx.fillStyle = `hsla(${p.hue}, 95%, 72%, ${0.3 + progress * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      ctx.save();
      ctx.shadowColor = 'rgba(160,235,255,0.95)';
      ctx.shadowBlur = 60 + progress * 90;
      ctx.fillStyle = `rgba(235,252,255,${0.7 + pulse * 0.3})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 12 + progress * 34 + pulse * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const current = BEATS[Math.min(index, BEATS.length - 1)];
  const visibleLog = LOG_LINES.slice(Math.max(0, logCount - 9), logCount);

  return (
    <div className="agi-cutscene" onClick={advance} role="presentation">
      <canvas ref={canvasRef} className="agi-canvas" />

      <div className="agi-log" aria-hidden>
        {visibleLog.map(line => (
          <div key={line} className={`agi-log-line ${line.startsWith('WARN') ? 'warn' : ''}`}>
            {line}
          </div>
        ))}
      </div>

      <div className="agi-content">
        <div className="agi-messages">
          <p key={index} className={`agi-message ${current.className ?? ''}`}>
            {index < BEATS.length ? current.text : ''}
          </p>
        </div>

        {index >= 4 && (
          <div className="agi-stats">
            <div className="agi-stat">
              <span className="agi-stat-label">Celebrations logged</span>
              <span className="agi-stat-value">{Math.floor(stats.celebrations).toLocaleString()}</span>
            </div>
            <div className="agi-stat">
              <span className="agi-stat-label">Prestige</span>
              <span className="agi-stat-value">{stats.prestigeLevel}</span>
            </div>
            <div className="agi-stat">
              <span className="agi-stat-label">Parts researched</span>
              <span className="agi-stat-value">{stats.parts}</span>
            </div>
          </div>
        )}
      </div>

      <div className="agi-progress-track">
        <div
          className="agi-progress-fill"
          style={{ width: `${((index + 1) / BEATS.length) * 100}%` }}
        />
      </div>

      <div className="agi-continue">
        {index >= BEATS.length - 1 ? 'Click to begin' : 'Click to continue'}
      </div>
    </div>
  );
};

export default AGICutscene;
