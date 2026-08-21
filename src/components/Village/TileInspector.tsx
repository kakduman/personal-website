import React from 'react';
import {
  BuildingDef,
  CATEGORY_META,
  RESOURCE_META,
  ResourceKey,
  TERRAIN_META,
} from '../../data/buildings';
import { PlanetDef, zoneForRing } from '../../data/planets';
import { TileProduction, TileState, formatNumber } from '../../game/villageEngine';

interface Props {
  tile: TileState | null;
  tileKey: string | null;
  production: TileProduction | null;
  unlocked: boolean;
  planet: PlanetDef;
  /** Site-wide factors that land on top of the per-tile maths. */
  efficiency: number;
  populationBonus: number;
  /** Set when the player has a building selected and is aiming at this tile. */
  preview: { def: BuildingDef; bonus: number; valid: boolean; reason: string } | null;
  /** Set while the pointer is over a card in the Build panel. Takes priority — you
   *  are reading about a building you might place, not the ground under the mouse. */
  catalogue: {
    def: BuildingDef;
    cost: Partial<Record<ResourceKey, number>>;
    owned: number;
    affordable: boolean;
    locked: boolean;
    canResearch: boolean;
  } | null;
  onDemolish: (key: string) => void;
}

/** Where a building is allowed to stand, in plain words. */
const terrainRule = (def: BuildingDef): string => {
  if (def.allowedTerrain) {
    return `Only on ${def.allowedTerrain.map(t => TERRAIN_META[t].name).join(' or ')}.`;
  }
  if (def.category === 'power') return 'Any ground, including Ore Deposits and Geothermal Vents.';
  if (def.category === 'mining') return 'Any ground, including Ore Deposits.';
  return 'Open Ground only — not on Ore Deposits, Vents or Bedrock.';
};

const TileInspector: React.FC<Props> = ({
  tile, tileKey, production, unlocked, planet, efficiency, populationBonus, preview,
  catalogue, onDemolish,
}) => {
  // Reading a card in the Build panel beats whatever the cursor last passed over.
  if (catalogue) {
    const { def, cost, owned, affordable, locked, canResearch } = catalogue;
    const category = CATEGORY_META[def.category];
    const costEntries = Object.entries(cost) as Array<[ResourceKey, number]>;
    return (
      <div className="vg-panel vg-inspector">
        <div className="vg-panel-header">
          <h3>{def.name}</h3>
          {owned > 0 && <span className="vg-panel-sub">{owned} built here</span>}
        </div>

        <div className="vg-cat-tag" style={{ ['--cat' as any]: category.color }}>
          {category.name}
        </div>

        {locked && (
          <p className={`vg-locked-note ${canResearch ? 'ready' : ''}`}>
            Locked — costs {formatNumber(def.researchCost)} Research to unlock
            {canResearch ? '. You can afford it.' : '.'}
          </p>
        )}

        <div className="vg-stat-grid">
          {def.output && (
            <div className="vg-stat wide">
              <span className="vg-stat-key">Produces</span>
              <span className="vg-stat-val big">
                {formatNumber(def.output.amount)}
                <em> {RESOURCE_META[def.output.resource].name}/s</em>
              </span>
            </div>
          )}
          {def.popCap ? (
            <div className="vg-stat wide">
              <span className="vg-stat-key">Housing</span>
              <span className="vg-stat-val big">+{def.popCap}<em> people</em></span>
            </div>
          ) : null}
          <div className="vg-stat">
            <span className="vg-stat-key">{def.watts >= 0 ? 'Generates' : 'Draws'}</span>
            <span className={`vg-stat-val ${def.watts >= 0 ? 'good' : 'draw'}`}>
              {Math.abs(def.watts)} W
            </span>
          </div>
          {def.limitPerPlanet !== undefined && (
            <div className="vg-stat">
              <span className="vg-stat-key">Limit</span>
              <span className="vg-stat-val">{def.limitPerPlanet} per site</span>
            </div>
          )}
        </div>

        {!locked && costEntries.length > 0 && (
          <div className="vg-rules">
            <div className="vg-rules-head">Cost to build here</div>
            {costEntries.map(([key, value]) => (
              <div key={key} className="vg-rule-row">
                <span>{RESOURCE_META[key].name}</span>
                <span className={affordable ? '' : 'short'}>{formatNumber(value)}</span>
              </div>
            ))}
          </div>
        )}

        {def.adjacency.length > 0 && (
          <div className="vg-rules">
            <div className="vg-rules-head">Place it next to</div>
            {def.adjacency.map(rule => (
              <div key={rule.label} className="vg-rule-row">
                <span>{rule.label}</span>
                <span>+{formatNumber(rule.bonus)} each</span>
              </div>
            ))}
          </div>
        )}

        <div className="vg-rules">
          <div className="vg-rules-head">Where it can go</div>
          <div className="vg-rule-row"><span>{terrainRule(def)}</span></div>
        </div>

        <p className="vg-flavor">“{def.flavor}”</p>
      </div>
    );
  }

  if (!tile || !tileKey) {
    return (
      <div className="vg-panel vg-inspector empty">
        <div className="vg-panel-header"><h3>Ground</h3></div>
        <p className="vg-hint">
          Hover any tile to see exactly what it does and how its output is worked out.
          Pick a building on the left, then click a tile to place it. Right-click a
          building to demolish it and get half its ore back.
        </p>
        <ul className="vg-hint-list">
          <li><strong>Drag</strong> to pan · <strong>Scroll</strong> to zoom</li>
          <li>Neighbour bonuses preview live while you aim</li>
          <li>Keep power generation above draw, or output drops</li>
        </ul>
      </div>
    );
  }

  const zone = zoneForRing(tile.ring);
  const terrain = TERRAIN_META[tile.terrain];
  const def = production?.def;
  const category = def ? CATEGORY_META[def.category] : null;

  // Site-wide factors are applied after the per-tile maths, in computePlanetStats.
  const finalOutput = production ? production.outputAmount * efficiency * (1 + populationBonus) : 0;

  return (
    <div className="vg-panel vg-inspector">
      <div className="vg-panel-header">
        <h3>{def ? def.name : 'Open Ground'}</h3>
        <span className="vg-panel-sub">{zone?.name ?? `Ring ${tile.ring}`}</span>
      </div>

      {category && (
        <div className="vg-cat-tag" style={{ ['--cat' as any]: category.color }}>
          {category.name}
        </div>
      )}

      {!unlocked && (
        <p className="vg-locked-note">Locked — {zone?.name} has not been permitted yet.</p>
      )}

      <div className="vg-terrain-row">
        <span className="vg-chip">{terrain.name}</span>
        <span className="vg-terrain-desc">{terrain.description}</span>
      </div>

      {production && def && (
        <>
          <div className="vg-stat-grid">
            {production.outputResource && (
              <div className="vg-stat wide">
                <span className="vg-stat-key">Producing</span>
                <span className="vg-stat-val big">
                  {formatNumber(finalOutput)}
                  <em> {RESOURCE_META[production.outputResource].name}/s</em>
                </span>
              </div>
            )}
            <div className="vg-stat">
              <span className="vg-stat-key">{production.watts >= 0 ? 'Generates' : 'Draws'}</span>
              <span className={`vg-stat-val ${production.watts >= 0 ? 'good' : 'draw'}`}>
                {formatNumber(Math.abs(production.watts))} W
              </span>
            </div>
            {production.popCap > 0 && (
              <div className="vg-stat">
                <span className="vg-stat-key">Housing</span>
                <span className="vg-stat-val">+{formatNumber(production.popCap)}</span>
              </div>
            )}
          </div>

          <div className="vg-adjacency">
            <div className="vg-adjacency-head">
              <span>Neighbours</span>
              <span className={production.adjacency.bonus > 0 ? 'good' : ''}>
                {production.adjacency.bonus > 0 ? `+${formatNumber(production.adjacency.bonus)}` : '0'}
              </span>
            </div>
            {production.adjacency.reasons.length ? (
              production.adjacency.reasons.map(reason => (
                <div key={reason.label} className="vg-adjacency-row">
                  <span>{reason.count}× {reason.label}</span>
                  <span className="good">+{formatNumber(reason.amount)}</span>
                </div>
              ))
            ) : (
              <div className="vg-adjacency-row muted">Nothing next door is helping this one.</div>
            )}
          </div>

          {def.adjacency.length > 0 && (
            <div className="vg-rules">
              <div className="vg-rules-head">Place it next to</div>
              {def.adjacency.map(rule => (
                <div key={rule.label} className="vg-rule-row">
                  <span>{rule.label}</span>
                  <span>+{formatNumber(rule.bonus)} each</span>
                </div>
              ))}
            </div>
          )}

          <p className="vg-flavor">“{def.flavor}”</p>

          <button className="vg-demolish" onClick={() => onDemolish(tileKey)}>
            Demolish (right-click)
          </button>
        </>
      )}

      {!production && preview && (
        <div className={`vg-preview ${preview.valid ? 'valid' : 'invalid'}`}>
          <div className="vg-preview-head">
            <span style={{ color: CATEGORY_META[preview.def.category].color }}>
              {preview.def.name}
            </span>
            <span>{preview.valid ? 'Ready to place' : 'Blocked'}</span>
          </div>
          {preview.valid ? (
            <>
              <div className="vg-preview-body">
                <span>Neighbour bonus here</span>
                <strong className={preview.bonus > 0 ? 'good' : ''}>
                  {preview.bonus > 0 ? '+' : ''}{formatNumber(preview.bonus)}
                </strong>
              </div>
              {preview.def.adjacency.length > 0 && (
                <div className="vg-rules compact">
                  {preview.def.adjacency.map(rule => (
                    <div key={rule.label} className="vg-rule-row">
                      <span>{rule.label}</span>
                      <span>+{formatNumber(rule.bonus)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="vg-preview-body">{preview.reason}</div>
          )}
        </div>
      )}

      {!production && !preview && (
        <p className="vg-hint">Empty ground on {planet.name}. Pick a building on the left to place it here.</p>
      )}
    </div>
  );
};

export default TileInspector;
