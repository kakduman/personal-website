import React, { useMemo, useState } from 'react';
import {
  BuildingCategory,
  BuildingDef,
  CATEGORY_META,
  RESOURCE_META,
  ResourceKey,
} from '../../data/buildings';
import { Resources, formatNumber } from '../../game/villageEngine';

interface Props {
  unlocked: BuildingDef[];
  researchable: BuildingDef[];
  costs: Record<string, Partial<Record<ResourceKey, number>>>;
  owned: Record<string, number>;
  resources: Resources;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onResearch: (id: string) => void;
  /** Fires as the pointer moves over cards, so the info panel can follow along. */
  onHoverBuilding: (id: string | null) => void;
  totalBuildings: number;
}

const ORDER: BuildingCategory[] = [
  'power', 'compute', 'mining', 'research', 'manufacturing', 'housing', 'logistics',
];

/** Short label for what a building does, in plain words. */
const outputLabel = (def: BuildingDef): string => {
  if (def.output) return `+${formatNumber(def.output.amount)} ${RESOURCE_META[def.output.resource].name}/s`;
  if (def.popCap) return `+${def.popCap} housing`;
  if (def.watts > 0) return `+${def.watts} W power`;
  return 'Enables new sites';
};

const BuildingPalette: React.FC<Props> = ({
  unlocked, researchable, costs, owned, resources, selectedId, onSelect, onResearch,
  onHoverBuilding, totalBuildings,
}) => {
  const [openCategory, setOpenCategory] = useState<BuildingCategory | 'all'>('all');

  const grouped = useMemo(() => {
    const map = new Map<BuildingCategory, BuildingDef[]>();
    for (const def of unlocked) {
      if (!map.has(def.category)) map.set(def.category, []);
      map.get(def.category)!.push(def);
    }
    map.forEach(list => list.sort((a, b) => a.tier - b.tier));
    return map;
  }, [unlocked]);

  const visibleCategories = ORDER.filter(
    c => grouped.has(c) && (openCategory === 'all' || openCategory === c)
  );

  const nextResearch = researchable.slice(0, openCategory === 'all' ? 3 : 6)
    .filter(def => openCategory === 'all' || def.category === openCategory);

  return (
    <div className="vg-panel vg-palette">
      <div className="vg-panel-header">
        <h3>Build</h3>
        <span className="vg-panel-sub">{totalBuildings} built</span>
      </div>

      <div className="vg-cat-filter">
        <button
          className={openCategory === 'all' ? 'active' : ''}
          onClick={() => setOpenCategory('all')}
        >
          All
        </button>
        {ORDER.filter(c => grouped.has(c)).map(category => (
          <button
            key={category}
            className={openCategory === category ? 'active' : ''}
            style={{ ['--cat' as any]: CATEGORY_META[category].color }}
            onClick={() => setOpenCategory(category)}
          >
            {CATEGORY_META[category].name}
          </button>
        ))}
      </div>

      <div className="vg-palette-scroll" onMouseLeave={() => onHoverBuilding(null)}>
        {visibleCategories.map(category => (
          <div key={category} className="vg-cat-group">
            <div className="vg-cat-label" style={{ color: CATEGORY_META[category].color }}>
              {CATEGORY_META[category].name}
            </div>
            {grouped.get(category)!.map(def => {
              const cost = costs[def.id] ?? def.cost;
              const costEntries = Object.entries(cost) as Array<[ResourceKey, number]>;
              const affordable = costEntries.every(([key, value]) => resources[key] >= value);
              const selected = selectedId === def.id;
              return (
                <button
                  key={def.id}
                  className={`vg-build-card ${selected ? 'selected' : ''} ${affordable ? '' : 'unaffordable'}`}
                  style={{ ['--cat' as any]: CATEGORY_META[category].color }}
                  onClick={() => onSelect(selected ? null : def.id)}
                  onMouseEnter={() => onHoverBuilding(def.id)}
                >
                  <div className="vg-build-top">
                    <span className="vg-build-name">{def.name}</span>
                    {owned[def.id] > 0 && <span className="vg-build-count">×{owned[def.id]}</span>}
                  </div>

                  <div className="vg-build-effect">
                    <span className="vg-effect-out">{outputLabel(def)}</span>
                    <span className={`vg-effect-power ${def.watts >= 0 ? 'gen' : 'draw'}`}>
                      {def.watts >= 0 ? `+${def.watts} W` : `${Math.abs(def.watts)} W draw`}
                    </span>
                  </div>

                  <div className="vg-build-cost">
                    {costEntries.map(([key, value]) => (
                      <span key={key} className={resources[key] >= value ? 'ok' : 'short'}>
                        <em>{formatNumber(value)}</em> {RESOURCE_META[key].name}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        ))}

        {nextResearch.length > 0 && (
          <div className="vg-cat-group">
            <div className="vg-cat-label locked">Locked — spend Research</div>
            {nextResearch.map(def => {
              const canAfford = resources.data >= def.researchCost;
              return (
                <div
                  key={def.id}
                  className={`vg-research-card ${canAfford ? 'ready' : ''}`}
                  onMouseEnter={() => onHoverBuilding(def.id)}
                >
                  <div className="vg-build-top">
                    <span className="vg-build-name">{def.name}</span>
                    <span className="vg-build-cat" style={{ color: CATEGORY_META[def.category].color }}>
                      {CATEGORY_META[def.category].name}
                    </span>
                  </div>
                  <div className="vg-build-effect">
                    <span className="vg-effect-out">{outputLabel(def)}</span>
                  </div>
                  <button
                    className="vg-unlock-btn"
                    disabled={!canAfford}
                    onClick={() => onResearch(def.id)}
                  >
                    {canAfford
                      ? `Unlock · ${formatNumber(def.researchCost)} Research`
                      : `Needs ${formatNumber(def.researchCost)} Research (${formatNumber(resources.data)})`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedId && (
        <button className="vg-cancel-place" onClick={() => onSelect(null)}>
          Cancel placement (Esc)
        </button>
      )}
    </div>
  );
};

export default BuildingPalette;
