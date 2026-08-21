import React from 'react';
import { POWER_INFO, RESOURCE_META, ResourceKey } from '../../data/buildings';
import { PLANETS, ZONES } from '../../data/planets';
import {
  META_UPGRADES,
  VICTORIES,
  VILLAGE_ACHIEVEMENTS,
  metaCostAtLevel,
} from '../../data/villageMeta';
import { EmpireStats, VillageState, formatNumber, metaLevel } from '../../game/villageEngine';

interface ShellProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

export const ModalShell: React.FC<ShellProps> = ({ title, subtitle, onClose, children, wide }) => (
  <div className="vg-modal-backdrop" onClick={onClose}>
    <div className={`vg-modal ${wide ? 'wide' : ''}`} onClick={e => e.stopPropagation()}>
      <div className="vg-modal-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button className="vg-modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="vg-modal-body">{children}</div>
    </div>
  </div>
);

// --- Planets -----------------------------------------------------------------

interface PlanetModalProps {
  state: VillageState;
  empire: EmpireStats;
  hasSpaceport: boolean;
  onColonise: (planetId: string) => void;
  onSwitch: (planetId: string) => void;
  onClose: () => void;
}

export const PlanetModal: React.FC<PlanetModalProps> = ({
  state, empire, hasSpaceport, onColonise, onSwitch, onClose,
}) => (
  <ModalShell
    title="Sites"
    subtitle={hasSpaceport
      ? 'Send crews from any Launch Pad. Every site you hold produces at the same time.'
      : 'Build a Launch Pad on a Bedrock tile to open new sites.'}
    onClose={onClose}
    wide
  >
    <div className="vg-planet-grid">
      {PLANETS.map(planet => {
        const planetState = state.planets[planet.id];
        const stats = empire.perPlanet[planet.id];
        const affordable =
          state.resources.flops >= planet.cost.flops && state.resources.alloys >= planet.cost.alloys;
        const current = state.currentPlanetId === planet.id;

        return (
          <div
            key={planet.id}
            className={`vg-planet-card ${planetState.unlocked ? 'owned' : 'locked'} ${current ? 'current' : ''}`}
            style={{ ['--planet' as any]: planet.palette.ground }}
          >
            <div className="vg-planet-orb" style={{
              background: `radial-gradient(circle at 32% 30%, ${planet.palette.ground}, ${planet.palette.side} 72%)`,
              boxShadow: `0 0 34px ${planet.palette.nebula}`,
            }} />
            <div className="vg-planet-info">
              <h4>{planet.name}<span>{planet.subtitle}</span></h4>
              <p className="vg-perk">✦ {planet.perk}</p>
              <p className="vg-challenge">⚠ {planet.challenge}</p>

              {planetState.unlocked ? (
                <>
                  <div className="vg-planet-stats">
                    <span>{stats?.buildingCount ?? 0} buildings</span>
                    <span>{formatNumber(stats?.rates.flops ?? 0)} Compute/s</span>
                    <span>{Math.floor(stats?.population ?? 0)} workers</span>
                  </div>
                  <button
                    className="vg-btn primary"
                    disabled={current}
                    onClick={() => { onSwitch(planet.id); onClose(); }}
                  >
                    {current ? 'Currently viewing' : 'View site'}
                  </button>
                </>
              ) : (
                <>
                  <div className="vg-planet-cost">
                    <span className={state.resources.flops >= planet.cost.flops ? 'ok' : 'short'}>
                      {formatNumber(planet.cost.flops)} Compute
                    </span>
                    <span className={state.resources.alloys >= planet.cost.alloys ? 'ok' : 'short'}>
                      {formatNumber(planet.cost.alloys)} Alloys
                    </span>
                  </div>
                  <button
                    className="vg-btn primary"
                    disabled={!affordable || !hasSpaceport}
                    onClick={() => onColonise(planet.id)}
                  >
                    {hasSpaceport ? 'Open this site' : 'Launch Pad required'}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </ModalShell>
);

// --- Quantum Reset -----------------------------------------------------------

interface QuantumModalProps {
  state: VillageState;
  shardPreview: number;
  canReset: boolean;
  onReset: () => void;
  onBuyMeta: (id: string) => void;
  onClose: () => void;
}

export const QuantumModal: React.FC<QuantumModalProps> = ({
  state, shardPreview, canReset, onReset, onBuyMeta, onClose,
}) => (
  <ModalShell
    title="Restructure"
    subtitle="Wind the sites down and bank the know-how as Patents. Research, records and permanent upgrades all survive."
    onClose={onClose}
    wide
  >
    <div className="vg-quantum-head">
      <div className="vg-shard-box">
        <span className="vg-shard-count">{state.quantumShards}</span>
        <span className="vg-shard-label">Patents held</span>
      </div>
      <div className="vg-shard-box">
        <span className="vg-shard-count">+{shardPreview}</span>
        <span className="vg-shard-label">Patents on restructure</span>
      </div>
      <div className="vg-shard-box">
        <span className="vg-shard-count">{state.quantumResets}</span>
        <span className="vg-shard-label">Restructures done</span>
      </div>
      <button className="vg-btn danger" disabled={!canReset} onClick={onReset}>
        {canReset ? 'Restructure the company' : 'Needs 1B lifetime Compute'}
      </button>
    </div>

    <div className="vg-meta-grid">
      {META_UPGRADES.map(def => {
        const level = metaLevel(state, def.id);
        const maxed = level >= def.maxLevel;
        const cost = metaCostAtLevel(def, level);
        const affordable = !maxed && state.quantumShards >= cost;
        return (
          <button
            key={def.id}
            className={`vg-meta-card ${maxed ? 'maxed' : ''} ${affordable ? 'affordable' : ''}`}
            disabled={maxed || !affordable}
            onClick={() => onBuyMeta(def.id)}
          >
            <div className="vg-meta-top">
              <span className="vg-meta-icon">{def.icon}</span>
              <span className="vg-meta-name">{def.name}</span>
              <span className="vg-meta-level">{level}/{def.maxLevel}</span>
            </div>
            <div className="vg-meta-desc">{def.description}</div>
            <div className="vg-meta-cost">{maxed ? 'Maxed' : `${cost} patents`}</div>
          </button>
        );
      })}
    </div>
  </ModalShell>
);

// --- Achievements & victories -------------------------------------------------

interface AchievementModalProps {
  state: VillageState;
  onClose: () => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({ state, onClose }) => (
  <ModalShell
    title="Records"
    subtitle={`${state.achievements.length}/${VILLAGE_ACHIEVEMENTS.length} achievements · ${state.victories.length}/${VICTORIES.length} victories`}
    onClose={onClose}
    wide
  >
    <h4 className="vg-section-title">Victory conditions</h4>
    <div className="vg-victory-list">
      {VICTORIES.map(victory => {
        const done = state.victories.includes(victory.id);
        return (
          <div key={victory.id} className={`vg-victory ${done ? 'done' : ''}`}>
            <span className="vg-victory-name">{done ? '✔' : '○'} {victory.name}</span>
            <span className="vg-victory-req">{victory.requirement}</span>
            <span className="vg-victory-reward">{victory.reward}</span>
          </div>
        );
      })}
    </div>

    <h4 className="vg-section-title">Achievements</h4>
    <div className="vg-achieve-grid">
      {VILLAGE_ACHIEVEMENTS.map(achievement => {
        const done = state.achievements.includes(achievement.id);
        return (
          <div key={achievement.id} className={`vg-achieve ${done ? 'done' : ''}`}>
            <span className="vg-achieve-icon">{done ? achievement.icon : '🔒'}</span>
            <div>
              <strong>{achievement.name}</strong>
              <p>{achievement.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  </ModalShell>
);


// --- How this works ----------------------------------------------------------

const RESOURCE_ORDER: ResourceKey[] = ['flops', 'ore', 'data', 'alloys'];

export const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalShell
    title="How this works"
    subtitle="Five things to track. Nothing else is hidden from you."
    onClose={onClose}
    wide
  >
    <h4 className="vg-section-title">Resources</h4>
    <div className="vg-help-grid">
      {RESOURCE_ORDER.map(key => {
        const info = RESOURCE_META[key];
        return (
          <div key={key} className="vg-help-card">
            <div className="vg-help-name" style={{ color: info.color }}>{info.name}</div>
            <p className="vg-help-what">{info.whatItIs}</p>
            <div className="vg-help-flow">
              <span><strong>From</strong> {info.madeBy}</span>
              <span><strong>For</strong> {info.spentOn}</span>
            </div>
          </div>
        );
      })}
      <div className="vg-help-card power">
        <div className="vg-help-name">{POWER_INFO.name}</div>
        <p className="vg-help-what">{POWER_INFO.whatItIs}</p>
        <div className="vg-help-flow">
          <span><strong>From</strong> {POWER_INFO.madeBy}</span>
          <span><strong>For</strong> {POWER_INFO.spentOn}</span>
        </div>
      </div>
    </div>

    <h4 className="vg-section-title">The loop</h4>
    <ol className="vg-help-steps">
      <li><strong>Run workloads</strong> or let Compute buildings tick to earn Compute.</li>
      <li><strong>Spend Compute</strong> to build. Bigger buildings also want Ore and Alloys.</li>
      <li><strong>Watch power.</strong> If draw exceeds generation, everything slows down — 25%, then 50%, then a full stop.</li>
      <li><strong>Bank Research</strong> from labs and spend it to unlock new building types.</li>
      <li><strong>Place carefully.</strong> Most buildings pay a bonus for the right neighbours or the right ground.</li>
      <li><strong>Every site shares one pool.</strong> Ore dug on one world is spent on any other, which is how sites with no diggable ground still get built.</li>
    </ol>

    <h4 className="vg-section-title">Why can&rsquo;t I build out there?</h4>
    <p className="vg-help-para">
      You hold a permit for one claim, released in phases. Each phase opens once the
      previous one is built up:
    </p>
    <div className="vg-help-phases">
      {ZONES.map((zone, index) => (
        <div key={zone.id} className="vg-help-phase">
          <span className="vg-help-phase-n">{index + 1}</span>
          <div>
            <strong>{zone.name}</strong>
            <span>
              {zone.requiresBuildings === 0
                ? 'Open from the start'
                : `Opens at ${zone.requiresBuildings} buildings`}
            </span>
          </div>
        </div>
      ))}
    </div>
    <p className="vg-help-para">
      Past the claim boundary the survey markers stop and the ground is someone
      else&rsquo;s problem. Build a Launch Pad on bedrock to claim a different site entirely.
    </p>
  </ModalShell>
);

// --- Developer skip panel -----------------------------------------------------

export interface DevJump {
  id: string;
  label: string;
  detail: string;
}

export const DEV_JUMPS: DevJump[] = [
  { id: 'cutscene',   label: 'Replay AGI cutscene',   detail: 'Phase 4 — the transition scene, start to finish.' },
  { id: 'fresh',      label: 'Fresh landing',         detail: 'Phase 5 start: empty grid, 1K FLOPS seed.' },
  { id: 'early',      label: 'Early settlement',      detail: '~12 buildings placed, Industrial Sector open.' },
  { id: 'mid',        label: 'Mid game',              detail: '~35 buildings, all inner zones, healthy economy.' },
  { id: 'spaceport',  label: 'Spaceport ready',       detail: 'All zones open, Spaceport built, colony funds banked.' },
  { id: 'multi',      label: 'Multi-planet empire',   detail: 'Phase 6: every world colonised and developed.' },
  { id: 'prestige',   label: 'Prestige ready',        detail: 'Phase 7: 1B lifetime FLOPS, Quantum Reset available.' },
  { id: 'loaded',     label: 'Shard millionaire',     detail: '500 shards to test the meta-upgrade shop.' },
  { id: 'brownout',   label: 'Force a brownout',      detail: 'Strips power plants so the deficit penalties show.' },
];

interface DevModalProps {
  onJump: (id: string) => void;
  onWipe: () => void;
  onClose: () => void;
}

export const DevModal: React.FC<DevModalProps> = ({ onJump, onWipe, onClose }) => (
  <ModalShell
    title="Dev · Skip to stage"
    subtitle="Local testing only. Each jump rewrites the save for this page."
    onClose={onClose}
  >
    <div className="vg-dev-grid">
      {DEV_JUMPS.map(jump => (
        <button key={jump.id} className="vg-dev-card" onClick={() => onJump(jump.id)}>
          <strong>{jump.label}</strong>
          <span>{jump.detail}</span>
        </button>
      ))}
    </div>
    <button className="vg-btn danger full" onClick={onWipe}>Wipe village save</button>
  </ModalShell>
);
