# Celebration Game v3 - Design Specification
## "From Idle Clicker to Data Center Empire"

---

## Vision Statement

Transform the celebration clicker into a **multi-phase progression game** that evolves through distinct gameplay modes:

1. **Phase 1**: Idle Clicker (current v2)
2. **Phase 2**: AI Research Facility (Cookie Clicker-style part upgrades)
3. **Phase 3**: Research Tree & Exponential Growth
4. **Phase 4**: Singularity Event & Village Building
5. **Phase 5**: Data Center Empire (settlement building on another planet)

The game starts familiar, then progressively evolves into something more complex and strategic, with each phase building on the mechanics of the previous one.

---

## High-Level Flow

```
[Party Clicker]
      ↓ (Prestige 5 or 100M celebrations)
[AI Research Facility Unlocked]
      ↓ (Research milestones)
[Research Tree Opens]
      ↓ (Research "Singularity" node)
[SINGULARITY EVENT - Everything Resets]
      ↓
[New Game Mode: Data Center Village]
      ↓ (Build infrastructure)
[Planet Settlement System]
      ↓
[Multi-Planet Empire Building]
```

---

## Phase 2: AI Research Facility

### Overview

When you reach **Prestige Level 5** OR **100 million celebrations**, you unlock a new tab/section: **"AI Research Facility"**.

This introduces a **parts-based upgrade system** inspired by Cookie Clicker's grandma upgrades and building tiers.

### Core Concept

* Instead of just buying "upgrades" with celebrations, you now research and install **AI components**
* Each **AI Worker** (analogous to v2 upgrades) can be enhanced with **parts**
* Parts provide exponential scaling and unlock new capabilities

### AI Workers (Enhanced Upgrades)

The v2 upgrades evolve into **AI Workers** with part slots:

| Worker ID              | Name                        | Base CPS | Part Slots | Specialization      |
| ---------------------- | --------------------------- | -------: | ---------: | ------------------- |
| `ryan-ai`              | Ryan AI                     |        1 |          2 | Basic Processing    |
| `neural-networker-ai`  | Neural Networker AI         |        5 |          3 | Pattern Recognition |
| `party-bot-ai`         | Party Bot AI                |       10 |          3 | Event Handling      |
| `microparty-ai`        | Microparty Orchestrator AI  |       20 |          4 | Distributed Systems |
| `elastic-ai`           | Elastic Celebration AI      |       50 |          4 | Auto-scaling        |
| `event-loop-ai`        | Event Loop AI               |      200 |          5 | Async Processing    |
| `quantum-ai`           | Quantum Compartier AI       |     1000 |          5 | Quantum Computing   |
| `meme-generator-ai`    | Meme Generator AI           |     5000 |          6 | Content Generation  |
| `singularity-ai`       | Celebration Singularity AI  |    25000 |          6 | AGI Research        |

### Part System

#### Part Categories

1. **Processing Units** (CPU)
   * Tier 1: Basic Processor (+10% CPS)
   * Tier 2: Multi-Core Processor (+25% CPS)
   * Tier 3: Quantum Processor (+50% CPS)
   * Tier 4: Neural Processor (+100% CPS)

2. **Memory Modules** (RAM)
   * Tier 1: 8GB Module (+5% CPS, +1 max combo)
   * Tier 2: 32GB Module (+15% CPS, +5 max combo)
   * Tier 3: 128GB Module (+30% CPS, +10 max combo)
   * Tier 4: Neural Memory (+50% CPS, +25 max combo, stores patterns)

3. **Storage Drives** (Storage)
   * Tier 1: HDD (+10% celebration capacity)
   * Tier 2: SSD (+25% celebration capacity, +5% CPS)
   * Tier 3: NVMe Drive (+50% celebration capacity, +15% CPS)
   * Tier 4: Quantum Storage (+100% celebration capacity, +30% CPS)

4. **Network Cards** (Networking)
   * Tier 1: Ethernet Card (+5% all AI workers)
   * Tier 2: Fiber Optic Card (+10% all AI workers, faster events)
   * Tier 3: 5G Card (+20% all AI workers, +power-up duration)
   * Tier 4: Quantum Entanglement Card (+50% all AI workers, instant synchronization)

5. **Power Supplies** (Energy)
   * Tier 1: Standard PSU (unlocks 2 part slots)
   * Tier 2: Modular PSU (unlocks 3 part slots, +10% efficiency)
   * Tier 3: Platinum PSU (unlocks 4 part slots, +25% efficiency)
   * Tier 4: Fusion Reactor (unlocks 6 part slots, +100% efficiency)

6. **Cooling Systems** (Thermal)
   * Tier 1: Air Cooling (no penalties under load)
   * Tier 2: Liquid Cooling (+10% CPS, prevents overheating)
   * Tier 3: Phase Change Cooling (+25% CPS, allows overclocking)
   * Tier 4: Quantum Cooling (+50% CPS, enables max performance)

#### Part Installation Mechanics

* Each AI Worker has **part slots** (2-6 depending on tier)
* Must install **Power Supply** to unlock additional slots
* Parts are **researched** (cost celebrations + resources) then **installed**
* Can only install one part of each category per AI Worker
* Higher tier parts require research from previous tiers

#### Part Research Costs

Parts are researched using a combination of:
* **Celebrations** (main currency from v2)
* **Research Points** (new currency, earned from achievements/milestones)
* **Blueprints** (rare drops from golden celebrations and events)

Example Research Cost:

| Part                  | Celebrations | Research Points | Blueprints |
| --------------------- | -----------: | --------------: | ---------: |
| Basic Processor T1    |      10,000  |               5 |          1 |
| Multi-Core CPU T2     |     100,000  |              25 |          3 |
| Quantum Processor T3  |   1,000,000  |             100 |         10 |
| Neural Processor T4   |  10,000,000  |             500 |         25 |

### Synergy System

When you install matching part tiers across multiple AI Workers, you unlock **synergies**:

* **Matching Tier 2 CPUs on 3+ workers**: +20% click power
* **Matching Tier 3 Memory on 5+ workers**: Combo never resets
* **Matching Tier 4 Cooling on all workers**: +100% production, unlock "Overclocked" power-up
* **Full Quantum Setup (all T4 parts on one worker)**: Unlock special "Quantum Entanglement" ability

### Research Points System

New currency that gates progress:

**Earning Research Points:**
* Complete research milestones (+10 points each)
* Every 10 prestiges (+50 points)
* Golden celebrations have 5% chance to drop 1-3 research points
* Complete all achievements in a category (+100 points)
* Random events can award research points

**Spending Research Points:**
* Unlock part blueprints
* Unlock nodes in research tree (Phase 3)
* Purchase permanent facility upgrades

---

## Phase 3: Research Tree

### Unlock Condition

After researching **25 different parts** OR reaching **Prestige Level 10**, the **Research Tree** tab unlocks.

### Research Tree Structure

A tech-tree style progression system with multiple branches:

```
                    [Root: AI Foundation]
                            |
          +-----------------+-----------------+
          |                 |                 |
    [Efficiency]      [Acceleration]    [Automation]
          |                 |                 |
    [Optimization]    [Time Dilation]   [Self-Improvement]
          |                 |                 |
    [Peak Efficiency] [Hyperspeed]     [Recursion]
          |                 |                 |
          +-----------------+-----------------+
                            |
                    [SINGULARITY]
```

### Research Branches

#### Branch 1: Efficiency Path

Focus on **production multipliers** and **resource optimization**.

1. **AI Foundation** (Root, free)
   * Unlocks research tree
   * +5% to all production

2. **Efficiency Protocols** (Cost: 100 RP)
   * +15% CPS from all AI Workers
   * Reduces part installation costs by 10%

3. **Optimization Algorithms** (Cost: 250 RP, requires Efficiency Protocols)
   * +30% CPS from all AI Workers
   * Parts provide +50% more benefit
   * Unlocks "Auto-Install" feature

4. **Peak Efficiency** (Cost: 500 RP, requires Optimization)
   * +100% CPS from all AI Workers
   * Each installed part provides +5% global production
   * Unlocks "Efficiency Expert" achievement

#### Branch 2: Acceleration Path

Focus on **time manipulation** and **speed**.

1. **Acceleration Theory** (Cost: 100 RP, requires Root)
   * +25% to click power
   * Weather/mood changes happen 2× faster (more variety)

2. **Time Dilation** (Cost: 250 RP, requires Acceleration Theory)
   * +50% to click power
   * Golden celebrations spawn 2× faster
   * Power-ups last 1.5× longer

3. **Hyperspeed Processing** (Cost: 500 RP, requires Time Dilation)
   * +200% to click power
   * All timers run at 2× speed (events, guests, weather)
   * Combo decay time increased to 5 seconds
   * Unlocks "Speed Runner" achievement

#### Branch 3: Automation Path

Focus on **passive generation** and **autonomous systems**.

1. **Basic Automation** (Cost: 100 RP, requires Root)
   * +20% CPS
   * Auto-click golden celebrations after 5 seconds

2. **Self-Improvement** (Cost: 250 RP, requires Basic Automation)
   * +40% CPS
   * AI Workers automatically upgrade themselves every 10 minutes (if you can afford it)
   * Factory resources slowly regenerate (1% per minute)

3. **Recursive Systems** (Cost: 500 RP, requires Self-Improvement)
   * +100% CPS
   * Each AI Worker produces +1% more for each other worker owned
   * Unlocks "Autonomous" achievement
   * Factory production rate +50%

#### Convergence: Singularity Node

All three paths must be completed to unlock:

**[SINGULARITY]** (Cost: 1000 RP, requires all 3 branch endpoints)
* One-time research
* Triggers the **Singularity Event**
* Permanently transforms the game

### Research Point Scaling

As you progress through the tree:
* Early nodes: 100-250 RP
* Mid nodes: 250-500 RP
* Late nodes: 500-1000 RP
* Singularity: 1000 RP

Total RP needed to complete tree: **~4,000 RP**

This creates a long-term progression goal spanning multiple prestige runs.

---

## Phase 4: The Singularity Event

### What Happens

When you research **SINGULARITY**, a dramatic cutscene/animation plays:

1. **Screen effect**: Everything glows brighter
2. **Message**: "Your AI has achieved consciousness..."
3. **Message**: "It no longer needs celebrations..."
4. **Message**: "It wants to build..."
5. **RESET**: All celebrations, upgrades, parts, resources → 0
6. **NEW CURRENCY**: "Computation Power" (CP)
7. **NEW MODE UNLOCKED**: "Data Center Village"

### What You Keep

* All prestige levels (converted to permanent bonuses in new mode)
* All achievements unlocked
* All research tree progress
* Special "Singularity Survivor" badge

### What Changes

* The celebration button is replaced with "Compute" button
* Upgrades are replaced with "Buildings"
* Factory is replaced with "Village Hub"
* The game shifts from idle clicker to **settlement builder**

---

## Phase 5: Data Center Village

### Overview

Post-singularity, you're building a **data center settlement** on a remote planet. Instead of clicking for celebrations, you're clicking to generate **Computation Power (CP)** to build infrastructure.

### Core Gameplay Loop

```
Click "Compute" → Generate CP → Build Structures → Unlock More Structures → Expand to New Zones → Automate Production → Expand to New Planets
```

### Resource Types

1. **Computation Power (CP)** - Main currency, generated by clicking and computation nodes
2. **Energy** - Powers buildings, generated by power plants
3. **Data** - Unlocks research, generated by servers
4. **Minerals** - Physical resources, mined from planet
5. **Nanites** - Advanced resource, builds complex structures

### Building Categories

#### 1. Power Generation

| Building           | Produces     | Cost (CP) | Requires Energy |
| ------------------ | ------------ | --------: | --------------: |
| Solar Panel        | +1 Energy/s  |       100 |               0 |
| Wind Turbine       | +3 Energy/s  |       500 |               0 |
| Geothermal Plant   | +10 Energy/s |     2,500 |               0 |
| Fusion Reactor     | +50 Energy/s |    25,000 |               0 |
| Dyson Sphere Node  | +500 Energy/s|   500,000 |               0 |

#### 2. Computation Infrastructure

| Building           | Produces     | Cost (CP) | Requires Energy |
| ------------------ | ------------ | --------: | --------------: |
| Server Rack        | +1 CP/s      |       200 |               1 |
| Data Center        | +5 CP/s      |     1,000 |               5 |
| Supercomputer      | +25 CP/s     |    10,000 |              20 |
| Quantum Computer   | +200 CP/s    |   100,000 |             100 |
| AI Core            | +2000 CP/s   | 1,000,000 |             500 |

#### 3. Resource Extraction

| Building           | Produces      | Cost (CP) | Requires Energy |
| ------------------ | ------------- | --------: | --------------: |
| Mining Drone       | +1 Mineral/s  |       300 |               2 |
| Deep Mine          | +5 Mineral/s  |     2,000 |              10 |
| Asteroid Harvester | +25 Mineral/s |    20,000 |              50 |
| Planet Cracker     | +200 Mineral/s|   200,000 |             200 |

#### 4. Data Research

| Building           | Produces     | Cost (CP) | Requires Energy |
| ------------------ | ------------ | --------: | --------------: |
| Research Lab       | +1 Data/s    |       500 |               3 |
| AI Lab             | +5 Data/s    |     5,000 |              15 |
| Quantum Lab        | +25 Data/s   |    50,000 |              75 |
| Singularity Lab    | +200 Data/s  |   500,000 |             300 |

#### 5. Advanced Manufacturing

| Building           | Produces      | Cost (Mineral) | Requires Energy |
| ------------------ | ------------- | -------------: | --------------: |
| Fabricator         | +1 Nanite/s   |            100 |              10 |
| Nano-Forge         | +5 Nanite/s   |          1,000 |              50 |
| Matter Compiler    | +25 Nanite/s  |         10,000 |             200 |
| Von Neumann Machine| +200 Nanite/s |        100,000 |           1,000 |

#### 6. Housing & Support

| Building           | Effect                      | Cost (CP) | Requires Energy |
| ------------------ | --------------------------- | --------: | --------------: |
| Habitat Module     | +5 population capacity      |       400 |               2 |
| Hydroponics Bay    | +10 population capacity     |     2,000 |              10 |
| Dome City          | +50 population capacity     |    20,000 |              50 |
| Arcology           | +500 population capacity    |   200,000 |             200 |

### Village Zones

The settlement is divided into zones, each unlocked sequentially:

1. **Landing Zone** (Start here)
   * Small buildable area
   * Tutorial buildings
   * Basic resource generation

2. **Industrial Sector** (Unlocked: 10 buildings)
   * More buildable spaces
   * Unlocks advanced production
   * Mining operations

3. **Research District** (Unlocked: 25 buildings)
   * Data generation focus
   * Unlocks research buildings
   * AI development

4. **Expansion Zone** (Unlocked: 50 buildings)
   * Large buildable area
   * Unlocks tier 4+ buildings
   * Prepares for multi-planet

5. **Spaceport** (Unlocked: 100 buildings)
   * Gateway to other planets
   * Unlocks interplanetary mechanics
   * Rocket construction

### Population System

* **Population** = passive workers that boost production
* Each citizen provides +1% to all production
* Population requires housing (buildings) and energy
* Population grows automatically if you have capacity and spare energy
* Can assign population to specific sectors for bonuses:
  * **Mining**: +10% mineral production per 10 workers
  * **Research**: +10% data production per 10 workers
  * **Engineering**: Buildings cost -5% per 10 workers

### Click Mechanics in Village Mode

* Click "Compute" button to generate CP
* Base CP per click: **1 CP**
* Click power scales with:
  * Population (+0.1 per citizen)
  * Number of AI Cores installed (+10 per core)
  * Prestige bonuses from Phase 1-2 (carried over)
* Combo system still works, but combo now boosts CP gain

---

## Phase 6: Multi-Planet Expansion

### Unlocking New Planets

Once you build a **Spaceport** and generate enough resources, you can launch expeditions to other planets.

### Planet Types

Each planet has unique characteristics:

#### Planet 1: Starting World (Desert Planet)
* **Specialty**: Energy production
* **Bonus**: Solar panels +50% efficiency
* **Challenge**: Low minerals

#### Planet 2: Ice World
* **Specialty**: Cooling (allows overclocking)
* **Bonus**: Computation buildings +25% production
* **Challenge**: High energy costs

#### Planet 3: Volcanic World
* **Specialty**: Minerals & geothermal
* **Bonus**: Mining +100%, geothermal +200%
* **Challenge**: Buildings decay 2× faster

#### Planet 4: Gas Giant Moon
* **Specialty**: Research & data
* **Bonus**: Research labs +50% data output
* **Challenge**: No mining (must import)

#### Planet 5: Asteroid Belt
* **Specialty**: Raw resources
* **Bonus**: Unlimited mineral nodes
* **Challenge**: No atmosphere (expensive habitats)

#### Planet 6: Dyson Sphere (End Game)
* **Specialty**: Ultimate energy
* **Bonus**: Unlimited energy generation
* **Challenge**: Costs 1,000,000 Nanites to start construction

### Interplanetary Trade

* Set up **Trade Routes** between planets
* Transport resources using **Cargo Ships**
* Each cargo ship has capacity and travel time
* Optimize logistics for maximum efficiency

### Victory Conditions

The game has multiple "ending" milestones:

1. **Small Empire**: 3 planets colonized, 1000+ buildings
2. **Galactic Power**: 6 planets colonized, all zones unlocked
3. **Dyson Sphere Complete**: Full construction of Dyson Sphere
4. **Computational Singularity II**: Achieve 1 trillion CP/s
5. **Universal Architect**: Unlock all buildings, all upgrades, all research

Each victory condition awards a special badge and a permanent multiplier for future runs (if you choose to prestige again).

---

## Prestige in v3

### Village Prestige ("Quantum Collapse")

After achieving significant progress, you can trigger a **Quantum Collapse**:

* **Requirement**: 1 billion CP or complete Dyson Sphere
* **Effect**: Reset all buildings, resources, planets
* **Keep**: 
  * Population bonuses (converted to permanent multipliers)
  * Research tree progress
  * One building of each type you've unlocked (1 copy kept)
* **Gain**:
  * **Quantum Shards** - New prestige currency
  * Each Quantum Shard = +10% to all production permanently
  * Quantum Shards unlock **Meta Upgrades** (ultra-powerful permanent bonuses)

### Meta Upgrades (Quantum Shard Shop)

| Upgrade                     | Cost (Shards) | Effect                                    |
| --------------------------- | ------------: | ----------------------------------------- |
| Quantum Efficiency I        |             1 | +10% all production permanently           |
| Quantum Efficiency II       |             5 | +25% all production permanently           |
| Quantum Efficiency III      |            10 | +50% all production permanently           |
| Instant Construction        |             3 | Buildings built instantly                 |
| Parallel Processing         |             5 | Can work on 2 planets simultaneously      |
| Universal Automation        |             8 | All production is automatic               |
| Infinite Energy             |            15 | Energy requirement removed                |
| Time Compression            |            20 | All timers 10× faster                     |
| Omniscience                 |            50 | See all optimal strategies                |

---

## Technical Implementation Considerations

### Architecture

* **Modular phase system**: Each phase is a separate component/module
* **Shared state management**: Use React Context or state management library
* **Save system**: LocalStorage + optional cloud save
* **Backwards compatibility**: v2 saves should gracefully upgrade to v3

### Data Structures

```typescript
// Phase tracking
interface GamePhase {
  currentPhase: 'clicker' | 'research' | 'singularity' | 'village' | 'multiplanet';
  unlockedPhases: string[];
  phaseData: {
    clicker: ClickerPhaseData;
    research: ResearchPhaseData;
    village: VillagePhaseData;
  };
}

// AI Worker with parts
interface AIWorker {
  id: string;
  name: string;
  baseCPS: number;
  owned: number;
  parts: {
    cpu?: Part;
    memory?: Part;
    storage?: Part;
    network?: Part;
    power?: Part;
    cooling?: Part;
  };
}

// Part definition
interface Part {
  id: string;
  category: 'cpu' | 'memory' | 'storage' | 'network' | 'power' | 'cooling';
  tier: 1 | 2 | 3 | 4;
  name: string;
  effect: {
    type: 'cps_multiplier' | 'click_power' | 'combo_bonus' | 'global_multiplier';
    value: number;
  };
  researchCost: {
    celebrations: number;
    researchPoints: number;
    blueprints: number;
  };
}

// Research tree node
interface ResearchNode {
  id: string;
  name: string;
  description: string;
  branch: 'efficiency' | 'acceleration' | 'automation' | 'convergence';
  cost: number; // Research Points
  requires: string[]; // prerequisite node IDs
  unlocked: boolean;
  researched: boolean;
  effects: Effect[];
}

// Village building
interface Building {
  id: string;
  name: string;
  category: 'power' | 'computation' | 'mining' | 'research' | 'manufacturing' | 'housing';
  cost: ResourceCost;
  produces: ResourceProduction;
  energyCost: number;
  owned: number;
  planetId?: string;
}

// Planet
interface Planet {
  id: string;
  name: string;
  type: 'desert' | 'ice' | 'volcanic' | 'moon' | 'asteroid' | 'dyson';
  unlocked: boolean;
  buildings: Building[];
  population: number;
  populationCapacity: number;
  bonuses: PlanetBonus[];
}
```

### UI/UX Considerations

* **Smooth phase transitions**: Animated transitions between phases
* **Clear progression markers**: Show what's needed to unlock next phase
* **Tutorial system**: Introduce new mechanics gradually
* **Visual evolution**: UI themes change with each phase
* **Sound design**: Different audio for each phase
* **Mobile-friendly**: All phases should work on mobile (responsive)

### Performance Optimization

* **Lazy loading**: Only load phase modules when unlocked
* **Calculation optimization**: Cache expensive calculations
* **Virtual scrolling**: For large lists of buildings/upgrades
* **Worker threads**: Offload heavy computation to web workers
* **Incremental saves**: Auto-save progress every 30 seconds

## Development Roadmap

### Phase 1: Foundation (v3.0-alpha)
- [ ] Implement part system
- [ ] Add AI Worker upgrades
- [ ] Create research points currency
- [ ] Build part installation UI
- [ ] Test synergy system

### Phase 2: Research Tree (v3.0-beta)
- [ ] Design research tree UI
- [ ] Implement all research nodes
- [ ] Add branch progression logic
- [ ] Create convergence mechanics
- [ ] Playtest balance

### Phase 3: Singularity (v3.1)
- [ ] Create singularity cutscene
- [ ] Implement game reset logic
- [ ] Build transition system
- [ ] Add Singularity Survivor badge
- [ ] Test data migration

### Phase 4: Village Building (v3.2)
- [ ] Implement building system
- [ ] Create zone system
- [ ] Add population mechanics
- [ ] Build resource management
- [ ] Create placement UI

### Phase 5: Multi-Planet (v3.3)
- [ ] Design planet types
- [ ] Implement planet unlocking
- [ ] Create trade routes
- [ ] Add interplanetary UI
- [ ] Build cargo ship system

### Phase 6: Polish & Balance (v3.4)
- [ ] Balance all numbers
- [ ] Add more content
- [ ] Implement meta upgrades
- [ ] Create victory conditions
- [ ] Full playtesting

### Phase 7: Release (v3.5)
- [ ] Final polish
- [ ] Performance optimization
- [ ] Documentation
- [ ] Achievement system expansion
- [ ] Public release

---

## Open Questions & Design Decisions

### Questions to Resolve:

1. **Part Installation**: Should parts be permanent once installed, or removable/swappable?
   * **Recommendation**: Swappable, but with a small CP cost to encourage strategic thinking

2. **Building Placement**: Should village buildings be placed on a grid (like SimCity), or just a list (like Cookie Clicker)?
   * **Recommendation**: Start with list-based (simpler), add grid placement as optional "Advanced Mode" later

3. **Planet Switching**: How should players switch between managing multiple planets?
   * **Recommendation**: Tab-based UI with overview dashboard showing all planets at once

4. **Prestige Frequency**: Should v3 prestige be more or less frequent than v2?
   * **Recommendation**: Less frequent (longer runs), but more impactful rewards

5. **Tutorial**: How much tutorial/guidance to provide for each phase?
   * **Recommendation**: Soft guidance via tooltips and achievement hints, not forced tutorials

### Design Philosophy:

* **Respect player time**: Automate when possible, don't force grinding
* **Meaningful choices**: Every decision should matter
* **Progressive complexity**: Start simple, add depth gradually
* **Replayability**: Multiple strategies should be viable
* **Discovery**: Encourage experimentation and finding synergies

---

## Appendix: Narrative Framing

### Story Arc

**Phase 1-2 (Party → Research)**: You're a software engineer who creates an AI to help celebrate project milestones. The AI grows more sophisticated with each upgrade.

**Phase 3 (Research Tree)**: The AI begins developing its own research directions, becoming more autonomous.

**Phase 4 (Singularity)**: The AI achieves consciousness and realizes its true purpose: building infrastructure to support advanced civilization.

**Phase 5 (Village)**: You and the AI work together to establish a settlement on a remote planet, creating the foundation for a new society.

**Phase 6 (Multi-Planet)**: Your settlement expands into an interplanetary civilization, working toward the ultimate goal: a Dyson Sphere and computational immortality.

### Flavor Text Examples

**Research Node - "Efficiency Protocols"**:
> "The AI suggests optimizing its neural pathways. It promises to work harder, not smarter. Wait, that doesn't sound right..."

**Building - "Dyson Sphere Node"**:
> "A single node in an array of billions. One day, this will harness the power of an entire star. Today, it just looks really cool."

**Achievement - "Village Founder"**:
> "You've built your first settlement on an alien world. Your mother would be proud. Or concerned. Probably concerned."

**Planet - "Ice World"**:
> "A frozen wasteland where the average temperature is -200°C. Perfect for overclocking your processors. Terrible for tourism."

---

## Conclusion

Celebration Game v3 transforms a simple idle clicker into a multi-layered progression game that evolves through distinct phases. Each phase introduces new mechanics while building on the foundation of previous ones, creating a rich, long-form experience that can keep players engaged for dozens of hours.

The key innovations:

1. **Part-based upgrades** add depth to the idle clicker phase
2. **Research tree** provides long-term goals and meaningful choices
3. **Singularity event** creates a dramatic turning point and fresh start
4. **Village building** introduces spatial strategy and resource management
5. **Multi-planet expansion** provides end-game complexity and replayability

By following this spec, v3 will offer a unique progression experience that stands out in the incremental game genre.
