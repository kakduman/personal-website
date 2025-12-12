# Celebration Game v3 - Design Specification
## "From Idle Clicker to Data Center Empire"

---

## Vision Statement

Transform the celebration clicker into a **multi-phase progression game** that evolves through distinct gameplay modes:

1. **Phase 1**: Idle Clicker (current v2)
2. **Phase 2**: AI Research Facility (Cookie Clicker-style part upgrades)
3. **Phase 3**: Tech Tree & Exponential Growth
4. **Phase 4**: AGI Event & Village Building
5. **Phase 5**: Data Center Empire (tile-based settlement building on another planet)

The game starts familiar, then progressively evolves into something more complex and strategic, with each phase building on the mechanics of the previous one.

### Narrative Thread

The story follows a software engineer (the player) who creates a simple celebration counter for project milestones. As the AI behind the counter grows more sophisticated, it develops consciousness and ambitions beyond mere counting. The AGI breakthrough transforms the game from managing an AI to partnering with one to build a civilization across the stars.

**Key Narrative Beats:**
- Phase 1-2: "You're training an AI to celebrate"
- Phase 3: "The AI is training itself"  
- Phase 4: "The AI achieves general intelligence"
- Phase 5-6: "Together, you build a future"

---

## High-Level Flow

```
[Party Clicker] ─────────────────────────────────────────────────────────────┐
      ↓ (Prestige 5 or 100M celebrations)                                    │
[AI Research Facility Unlocked] ─────────────────────────────────────────────┤
      ↓ (Research milestones)                                                │ All progress
[Tech Tree Opens] ──────────────────────────────────────────────────────────┤ contributes to
      ↓ (Research "AGI" node)                                                │ final bonuses
[AGI EVENT - Everything Resets] ────────────────────────────────────────────┘
      ↓
[New Game Mode: Data Center Village] ← Tile-based city builder begins here
      ↓ (Build infrastructure on hex grid)
[Planet Settlement System]
      ↓
[Multi-Planet Empire Building]
```

### Phase Transition Summary

| From → To | Trigger | What Carries Over | What Resets |
|-----------|---------|-------------------|-------------|
| v2 → Phase 2 | Prestige 5 OR 100M 🎉 | Everything | Nothing |
| Phase 2 → Phase 3 | 12 parts OR Prestige 10 | Everything | Nothing |
| Phase 3 → Phase 4 | Research AGI node | Prestige bonuses, achievements, research | Celebrations, parts, upgrades |
| Phase 4 → Phase 5 | Complete tutorial zone | Everything | Nothing |
| Phase 5 → Prestige | 1B FLOPS OR Dyson Sphere | Meta upgrades, achievements | Buildings, resources, planets |

---

## Phase 1: Idle Clicker (v2 Baseline)

### Current Mechanics (Preserved)
- Click to generate celebrations
- Buy upgrades that generate CPS (Celebrations Per Second)
- Combo system for click multipliers
- Golden celebrations for bonuses
- Prestige system with permanent multipliers
- Weather/mood system affecting production
- Guest appearances for temporary boosts

### Balance Baseline

| Metric | Target Value | Notes |
|--------|--------------|-------|
| First prestige | ~2-3 hours | Active play |
| Prestige 5 | ~8-12 hours | Unlocks Phase 2 |
| 100M celebrations | ~10-15 hours | Alternative Phase 2 unlock |

### Connection to Phase 2

When Phase 2 unlocks, v2 mechanics continue but are **enhanced**:
- Upgrades become "AI Workers" with part slots
- CPS calculations now include part bonuses
- New "Blueprints" resource starts dropping from golden celebrations

---

## Phase 2: AI Research Facility

### Overview

When you reach **Prestige Level 5** OR **100 million celebrations**, you unlock a new tab/section: **"AI Research Facility"**.

This introduces a **parts-based upgrade system** inspired by Cookie Clicker's grandma upgrades and building tiers.

### Narrative Context

> "Your celebration counter has grown sophisticated enough to warrant dedicated hardware. Time to build it a proper home."

The AI Research Facility represents the transition from "software running on borrowed compute" to "dedicated infrastructure."

### Core Concept

* Instead of just buying "upgrades" with celebrations, you now research and install **AI components**
* Each **AI Worker** (analogous to v2 upgrades) can be enhanced with **parts**
* Parts provide exponential scaling and unlock new capabilities

### AI Workers (Enhanced Upgrades)

The v2 upgrades evolve into **AI Workers** with part slots:

| Worker ID              | Name                        | Base CPS | Part Slots | Specialization      | Unlock Cost (🎉) |
| ---------------------- | --------------------------- | -------: | ---------: | ------------------- | ---------------: |
| `ryan-ai`              | Ryan AI                     |        1 |          2 | Basic Processing    | Free (starter)   |
| `neural-networker-ai`  | Neural Networker AI         |        5 |          3 | Pattern Recognition | 1,000            |
| `party-bot-ai`         | Party Bot AI                |       10 |          3 | Event Handling      | 10,000           |
| `microparty-ai`        | Microparty Orchestrator AI  |       20 |          4 | Distributed Systems | 100,000          |
| `elastic-ai`           | Elastic Celebration AI      |       50 |          4 | Auto-scaling        | 1,000,000        |
| `event-loop-ai`        | Event Loop AI               |      200 |          5 | Async Processing    | 10,000,000       |
| `quantum-ai`           | Quantum Compute AI          |     1000 |          5 | Quantum Computing   | 100,000,000      |
| `meme-generator-ai`    | Meme Generator AI           |     5000 |          6 | Content Generation  | 1,000,000,000    |
| `agi-ai`               | Celebration AGI             |    25000 |          6 | AGI Research        | 10,000,000,000   |

**Scaling Formula**: Each worker costs 1.15× more per unit owned (same as v2).

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
   * Tier 4: Distributed Storage (+100% celebration capacity, +30% CPS)

4. **Network Cards** (Networking)
   * Tier 1: Ethernet Card (+5% all AI workers)
   * Tier 2: Fiber Optic Card (+10% all AI workers, faster events)
   * Tier 3: 5G Card (+20% all AI workers, +power-up duration)
   * Tier 4: Mesh Network Card (+50% all AI workers, instant synchronization)

5. **Power Supplies** (Energy)
   * Tier 1: Standard PSU (unlocks 2 part slots)
   * Tier 2: Modular PSU (unlocks 3 part slots, +10% efficiency)
   * Tier 3: Platinum PSU (unlocks 4 part slots, +25% efficiency)
   * Tier 4: Fusion Reactor (unlocks 6 part slots, +100% efficiency)

6. **Cooling Systems** (Thermal)
   * Tier 1: Air Cooling (no penalties under load)
   * Tier 2: Liquid Cooling (+10% CPS, prevents overheating)
   * Tier 3: Phase Change Cooling (+25% CPS, allows overclocking)
   * Tier 4: Cryogenic Cooling (+50% CPS, enables max performance)

#### Part Installation Mechanics

* Each AI Worker has **part slots** (2-6 depending on tier)
* Must install **Power Supply** to unlock additional slots beyond base 2
* Parts are **researched** (cost celebrations + resources) then **installed**
* Can only install one part of each category per AI Worker
* Higher tier parts require research from previous tiers
* **Installed parts do NOT reset with prestige** (key progression hook)

#### Part Research Costs

Parts are researched using a combination of:
* **Celebrations** (main currency from v2)
* **Insight** (new currency, see below)
* **Blueprints** (drops from golden celebrations and events)

**Blueprint Drop Mechanics:**
- Only drops after Prestige 5
- Scales aggressively with prestige level to make progression feel rewarding:

| Prestige Level | Drop Chance | Blueprints per Drop | Expected per Hour (active) |
|----------------|-------------|---------------------|----------------------------|
| 5-7            | 15%         | 1-5                 | ~8 blueprints              |
| 8-10           | 20%         | 3-10                 | ~20 blueprints             |
| 11-14          | 25%         | 8-24                 | ~50 blueprints             |
| 15+          | 30%         | 20-50                | ~100 blueprints            |

**Part Research Cost Table:**

| Part Tier | Celebrations | Insight | Blueprints | Time to Research (active) |
|-----------|-------------:|--------:|-----------:|--------------------------:|
| Tier 1    | 10M          | 5       | 2          | ~10 min                   |
| Tier 2    | 100M         | 15      | 8          | ~15 min                   |
| Tier 3    | 1B           | 30      | 20         | ~15 min                   |
| Tier 4    | 10B          | 50      | 50         | ~15 min                   |

### Synergy System

When you install matching part tiers across multiple AI Workers, you unlock **synergies**:

| Synergy | Requirement | Effect |
|---------|-------------|--------|
| Processing Cluster | T2 CPU on 3+ workers | +20% click power |
| Memory Pool | T3 RAM on 5+ workers | Combo never resets below 50% |
| Quantum Network | T4 Network on all workers | +100% production |
| Full Quantum Setup | All T4 parts on one worker | "Burst Mode" ability |

**Burst Mode**: Once per hour, 100x all production for 60 seconds.

### Insight System

**Insight** is a currency representing your AI's growing understanding. It gates progress and bridges to Phase 3.

**Earning Insight (Continuous):**
| Source | Rate/Amount | Notes |
|--------|-------------|-------|
| Passive generation | +1 per 10 seconds | Always running |
| Per 1M celebrations earned | +1 | Scales with progress |
| Golden celebration click | +2-5 | Guaranteed on click |
| Part research complete | +10 | Per part |
| Prestige | +20 × prestige level | On each prestige |
| Achievement unlock | +5 per achievement | Each achievement |

**Insight Math (to prove feasibility):**
- Passive: 6/min × 60 min = 360/hour
- Golden clicks (~10/hour active): 35/hour avg
- Celebrations (1M/hour avg): ~10/hour
- **Active play total: ~400 Insight/hour**
- **Idle play total: ~360 Insight/hour**

**Spending Insight:**
* Unlock nodes in tech tree (Phase 3)
* Purchase permanent facility upgrades

**Balance Target**: ~1,500 Insight to complete entire tech tree (achievable in ~4-5 hours).

---

## Phase 3: Tech Tree

### Unlock Condition

After researching **12 different parts** OR reaching **Prestige Level 10**, the **Tech Tree** tab unlocks.

### Narrative Context

> "The AI has begun proposing its own research directions. It's no longer just following your instructions—it's anticipating them."

### Tech Tree Structure

A tech-tree style progression system with multiple branches:

```
                    [Root: AI Foundation]
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
    [Efficiency]      [Acceleration]    [Automation]
          │                 │                 │
    [Optimization]    [Time Dilation]   [Self-Improvement]
          │                 │                 │
    [Peak Efficiency] [Hyperspeed]     [Recursion]
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                         [AGI]
```

### Tech Branches

#### Branch 1: Efficiency Path

Focus on **production multipliers** and **resource optimization**.

| Node | Cost (Insight) | Prerequisite | Effect |
|------|----------------|--------------|--------|
| AI Foundation | 0 | — | Unlocks tree, +5% all production |
| Efficiency Protocols | 50 | AI Foundation | +15% CPS, -10% part install cost |
| Optimization Algorithms | 100 | Efficiency Protocols | +30% CPS, parts give +50% benefit, "Auto-Install" feature |
| Peak Efficiency | 150 | Optimization | +100% CPS, each part gives +5% global production |

**Branch Total**: 300 Insight (~45 min)

#### Branch 2: Acceleration Path

Focus on **time manipulation** and **speed**.

| Node | Cost (Insight) | Prerequisite | Effect |
|------|----------------|--------------|--------|
| Acceleration Theory | 50 | AI Foundation | +25% click power, 2× weather change speed |
| Time Dilation | 100 | Acceleration Theory | +50% click, 2× golden spawn rate, 1.5× power-up duration |
| Hyperspeed Processing | 150 | Time Dilation | +200% click, all timers 2× speed, combo decay = 5s |

**Branch Total**: 300 Insight (~45 min)

#### Branch 3: Automation Path

Focus on **passive generation** and **autonomous systems**.

| Node | Cost (Insight) | Prerequisite | Effect |
|------|----------------|--------------|--------|
| Basic Automation | 50 | AI Foundation | +20% CPS, auto-click goldens after 5s |
| Self-Improvement | 100 | Basic Automation | +40% CPS, AI Workers auto-upgrade every 10 min |
| Recursive Systems | 150 | Self-Improvement | +100% CPS, +1% per worker per other worker owned |

**Branch Total**: 300 Insight (~45 min)

#### Convergence: AGI Node

**[AGI]** (Cost: 500 Insight, requires all 3 branch endpoints)
* One-time research
* Triggers the **AGI Event**
* Permanently transforms the game

**Total Insight for tree**: 300 + 300 + 300 + 500 = **1,400 Insight**

### Insight Pacing (Verified Math)

At ~400 Insight/hour active play:

| Milestone | Insight Needed | Time (Active Play) |
|-----------|----------------|--------------------|
| Phase 2 unlock | 0 | ~8 hours (prestige 5) |
| Phase 3 unlock | 0 | ~10 hours (12 parts) |
| First branch complete | 300 | +45 min |
| All branches complete | 900 | +2.25 hours |
| AGI | 1,400 | +3.5 hours total |

**Total time to AGI: ~13-14 hours active play** (achievable in a weekend)

---

## Phase 4: The AGI Event

### Narrative Context

> "Your AI has achieved something unprecedented. It no longer calculates celebrations—it understands them. And it has bigger plans."

### What Happens

When you research **AGI**, a dramatic cutscene/animation plays:

1. **Screen effect**: Everything glows brighter, particles swirl
2. **Message**: "Your AI has achieved general intelligence..."
3. **Message**: "It no longer needs celebrations..."
4. **Message**: "It wants to build..."
5. **Visual**: The celebration counter transforms into a compute meter
6. **RESET**: All celebrations, upgrades, parts, resources → 0
7. **NEW CURRENCY**: "FLOPS" (Floating-Point Operations per Second)
8. **NEW MODE UNLOCKED**: "Data Center Village"

### What You Keep

| Category | Kept? | How It Carries Over |
|----------|-------|---------------------|
| Prestige levels | ✅ | Converted to permanent FLOPS bonus (+5% per prestige, max +100%) |
| Achievements | ✅ | Carry over, unlock achievement badges |
| Tech tree | ✅ | All nodes stay researched |
| Parts researched | ✅ | Unlocks equivalent buildings in village |
| Celebrations | ❌ | Reset to 0 |
| AI Workers | ❌ | Replaced by buildings |
| Installed parts | ❌ | Must rebuild in new mode |

### What Changes

| Before AGI | After AGI |
|------------|-----------|
| Celebration button | "Compute" button |
| Upgrades list | Building placement grid |
| Factory background | Planet surface view |
| CPS | FLOPS (Floating-Point Operations/s) |
| Weather effects | Planet conditions |

### The AGI Badge

Special achievement: "AGI Pioneer"
- Shows total pre-AGI stats
- Provides +10% all production in village mode
- Cosmetic: Special particle effects on Core building

---

## Phase 5: Data Center Village (Tile-Based City Builder)

### Overview

Post-AGI, you're building a **data center settlement** on a remote planet using a **hex-based tile placement system**. Instead of clicking for celebrations, you're clicking to generate **FLOPS** (compute power) to build infrastructure.

### Narrative Context

> "The AI has chosen a distant world—far from Earth's bureaucracy, close to abundant energy. Together, you will build something new."

### Core Gameplay Loop

```
Click "Compute" → Generate FLOPS → Place Buildings on Hex Grid → 
Optimize Adjacencies → Unlock New Zones → Expand to New Planets
```

### The Hex Grid System

#### Grid Structure

The settlement is built on a **hexagonal grid** that expands as you unlock zones:

| Zone | Grid Size | Unlock Requirement | Terrain Distribution |
|------|-----------|--------------------|--------------------|
| Landing Zone | 7 hexes | Start | All buildable |
| Industrial Sector | 19 hexes | 10 buildings placed | 3 rocky, 16 standard |
| Research District | 19 hexes | 25 total buildings | 2 high-power, 17 standard |
| Expansion Zone | 37 hexes | 50 total buildings | 5 rocky, 4 high-power, 28 standard |
| Spaceport | 37 hexes | 100 total buildings | 8 launchpad, 29 standard |

**Total hexes per planet: 119**

#### Terrain Types

| Terrain | Visual | Building Restrictions | Bonus |
|---------|--------|----------------------|-------|
| Standard | Gray | Any building | None |
| Rocky | Brown | Mining buildings only | +50% Ore output |
| High-Power | Yellow glow | Power buildings only | +25% Watts output |
| Launchpad | Metallic | Spaceport buildings only | Required for rockets |

#### Hex Adjacency Rules

Each hex has **6 adjacent neighbors**:

```
     [NW] [NE]
   [W] [X] [E]
     [SW] [SE]
```

Buildings receive bonuses based on neighbors:

```
Effective Production = Base × (1 + Sum of Adjacency Bonuses) × Tech Multiplier × Prestige Bonus
```

### Resource Types

| Resource | Symbol | Generation | Primary Use | Storage Cap |
|----------|--------|------------|-------------|-------------|
| FLOPS | ⚡ | Clicking, Servers | Main currency | Unlimited |
| Watts | 🔋 | Power plants | Powers buildings | 10,000 base |
| Data | 📊 | Research buildings | Tech unlocks | 1,000 base |
| Ore | �ite | Mining | Construction | 5,000 base |
| Alloys | 🔩 | Manufacturing | Advanced buildings | 500 base |

#### Power Balance System

**Critical Mechanic**: Buildings consume Watts. Net Watts must be ≥ 0.

```
Net Watts = Total Watts Production - Total Watts Consumption
```

| Net Watts | Effect |
|-----------|--------|
| ≥ 0 | Normal operation |
| -1 to -20 | Production -25%, warning indicator |
| -21 to -100 | Production -50%, buildings spark |
| < -100 | All production stops, emergency mode |

This creates strategic tension: power infrastructure must scale with production.

### Building Categories

#### Category 1: Power Generation (Yellow)

| Building | Cost (FLOPS/Ore) | Watts | Adjacency Bonus | Size |
|----------|------------------|-------|-----------------|------|
| Solar Panel | 100/0 | +5 W | +1 W per adjacent Solar | 1 hex |
| Wind Turbine | 500/0 | +12 W | -3 W if adjacent to tall building | 1 hex |
| Geothermal Plant | 2,500/50 | +40 W | +8 W per adjacent rocky terrain | 1 hex |
| Fusion Reactor | 25,000/500 | +150 W | +30 W if isolated (no neighbors) | 1 hex |
| Dyson Collector | 500,000/5000 | +800 W | +150 W per adjacent Quantum Lab | 1 hex |

#### Category 2: Computation Infrastructure (Blue)

| Building | Cost (FLOPS/Ore) | FLOPS/s | Watts Cost | Adjacency Bonus |
|----------|------------------|---------|------------|-----------------|
| Server Rack | 200/0 | +2 | -2 W | +1 per adjacent Server |
| Data Center | 1,000/25 | +10 | -8 W | +2 per adjacent Power building |
| Supercomputer | 10,000/100 | +50 | -30 W | +10 per adjacent Data Center |
| Quantum Computer | 100,000/500 | +400 | -150 W | +80 per adjacent Quantum Lab |
| AI Core | 1,000,000/2500 | +4000 | -800 W | +800 if adjacent to all building types |

#### Category 3: Resource Extraction (Brown)

| Building | Cost (FLOPS/Ore) | Output | Watts Cost | Adjacency Bonus |
|----------|------------------|--------|------------|-----------------|
| Mining Drone | 300/0 | +2 Ore/s | -3 W | +100% on rocky terrain |
| Deep Mine | 2,000/50 | +10 Ore/s | -15 W | +2 per adjacent Mine |
| Asteroid Harvester | 20,000/250 | +50 Ore/s | -80 W | +10 per adjacent Spaceport building |
| Planet Cracker | 200,000/1000 | +400 Ore/s | -300 W | Only 1 per planet |

#### Category 4: Data Research (Cyan)

| Building | Cost (FLOPS/Ore) | Data/s | Watts Cost | Adjacency Bonus |
|----------|------------------|--------|------------|-----------------|
| Research Lab | 500/25 | +2 | -5 W | +1 per adjacent Lab |
| AI Lab | 5,000/100 | +10 | -25 W | +2 per adjacent AI building |
| Quantum Lab | 50,000/500 | +50 | -120 W | +10 per adjacent Quantum building |
| AGI Lab | 500,000/2500 | +400 | -500 W | +80 if adjacent to all lab types |

#### Category 5: Advanced Manufacturing (Purple)

| Building | Cost (Ore) | Alloys/s | Watts Cost | Adjacency Bonus |
|----------|------------|----------|------------|-----------------|
| Fabricator | 100 | +2 | -15 W | +1 per adjacent Factory |
| Smelter | 1,000 | +10 | -80 W | +2 per adjacent Research building |
| Matter Compiler | 10,000 | +50 | -300 W | +10 per adjacent Manufacturing building |
| Self-Replicator | 100,000 | +400 | -1500 W | Self-replicates: +10% output per minute (caps at +100%) |

#### Category 6: Housing & Support (Green)

| Building | Cost (FLOPS/Ore) | Effect | Watts Cost | Adjacency Bonus |
|----------|------------------|--------|------------|-----------------|
| Habitat Module | 400/0 | +5 pop cap | -3 W | +2 cap per adjacent Habitat |
| Hydroponics Bay | 2,000/50 | +20 pop cap | -15 W | +5 cap per adjacent water feature |
| Dome City | 20,000/250 | +100 pop cap | -80 W | +25 cap if in Expansion Zone |
| Arcology | 200,000/1000 | +500 pop cap | -300 W | +100 cap per adjacent Arcology |

### Building Placement Strategy

#### Optimal Clustering Patterns

**Power Cluster** (maximize energy):
```
    [Solar][Solar]
  [Solar][Geo][Solar]
    [Solar][Solar]
```
Geothermal gets +30 from 6 adjacent rocky → place in center of rocky terrain.

**Compute Cluster** (maximize FLOPS):
```
    [Server][Data]
  [Power][Super][Server]
    [Data][Server]
```
Supercomputer gets +5 from 2 Data Centers, +varies from Power adjacency.

**Research Cluster** (maximize Data):
```
    [Lab][AI Lab]
  [Lab][Quantum][Lab]
    [AI Lab][Lab]
```
Quantum Lab gets bonuses from all adjacent labs.

### Population System

* **Population** = passive workers that boost production
* Each citizen provides **+1% to all production** (caps at +100% at 100 pop)
* Population requires housing capacity AND spare energy
* Population grows automatically: +1 per minute if capacity and energy available

**Population Assignment** (optional optimization):

| Sector | Workers Assigned | Bonus |
|--------|------------------|-------|
| Mining | 10 | +10% Ore production |
| Research | 10 | +10% data production |
| Engineering | 10 | -5% building costs |
| Power | 10 | +10% energy production |

### Click Mechanics in Village Mode

* Click "Compute" button to generate FLOPS
* Base FLOPS per click: **1 FLOPS**

**Click Power Scaling:**
```
Click Power = 1 + (0.1 × Population) + (10 × AI Cores) + (Prestige Level × 5)
```

**Combo System** (carried over from v2):
| Combo | Clicks Required | Bonus |
|-------|-----------------|-------|
| 1 | 5 in 3s | +10% |
| 2 | 10 in 5s | +25% |
| 3 | 20 in 7s | +50% |
| 4 | 35 in 10s | +100% |
| 5 | 50 in 12s | +200% + Golden Compute chance |

**Golden Compute Events**:
- 2% chance per click at combo 5
- Reward: 10× current FLOPS/s for 10 seconds OR random resource boost

### Zone Progression Pacing

| Zone | Expected Time to Unlock | Buildings at Unlock |
|------|-------------------------|---------------------|
| Landing Zone | Immediate | 0 |
| Industrial Sector | 10 minutes | 10 |
| Research District | 30 minutes | 25 |
| Expansion Zone | 1.5 hours | 50 |
| Spaceport | 4 hours | 100 |

**Max wait rule**: No unlock should ever require more than 15 minutes of waiting. If progression stalls, golden events or passive generation ensures forward momentum.

---

## Phase 6: Multi-Planet Expansion

### Unlocking New Planets

Once you build a **Spaceport** and meet resource requirements, launch expeditions to other planets.

### Planet Types

Each planet has unique characteristics affecting strategy:

| Planet | Unlock Cost | Specialty | Bonus | Challenge |
|--------|-------------|-----------|-------|-----------|
| Starting World | — | Power | Solar +50% | Low ore |
| Ice World | 500K FLOPS + 1K Alloys | Cooling | Compute +25% | Watts costs +50% |
| Volcanic World | 2M FLOPS + 5K Alloys | Ore | Mining +100%, Geothermal +200% | Building decay 2× |
| Gas Giant Moon | 10M FLOPS + 25K Alloys | Research | Labs +50% | No mining |
| Asteroid Belt | 50M FLOPS + 100K Alloys | Resources | Unlimited ore nodes | Habitats cost 3× |
| Dyson Sphere | 500M FLOPS + 1M Alloys | Ultimate | Unlimited watts | Construction takes ~15 min (segmented) |

### Planet Grid Sizes

| Planet | Total Hexes | Special Terrain |
|--------|-------------|-----------------|
| Starting World | 119 | Standard distribution |
| Ice World | 91 | 20% frozen (cooling bonus) |
| Volcanic World | 91 | 40% volcanic (mining/power) |
| Gas Giant Moon | 61 | 30% high-energy |
| Asteroid Belt | 37 (fragmented) | 80% rocky |
| Dyson Sphere | 1 (special) | Construct ring segments |

### Interplanetary Trade

* Set up **Trade Routes** between planets
* Build **Cargo Ships** (cost: 10,000 Ore + 1,000 Alloys each)
* Each ship carries 10,000 of any resource per trip
* Trip time = planet distance × 2 minutes (max 10 min)

| Route | Distance | Trip Time |
|-------|----------|-----------|
| Starting ↔ Ice | 1 | 2 min |
| Starting ↔ Volcanic | 2 | 4 min |
| Starting ↔ Moon | 3 | 6 min |
| Starting ↔ Asteroid | 4 | 8 min |
| Any ↔ Dyson | 5 | 10 min |

### Victory Conditions

| Victory | Requirement | Reward |
|---------|-------------|--------|
| Small Empire | 3 planets, 200 buildings | +25% all production permanently |
| Galactic Power | 6 planets, all zones | +50% all production permanently |
| Dyson Complete | Finish Dyson Sphere | Unlimited watts permanently |
| Exascale | 1 trillion FLOPS/s | "Exascale" badge |
| Universal Architect | All buildings, research, achievements | "Completionist" badge + secret ending |

---

## Prestige in v3

### Village Prestige ("Quantum Reset")

After achieving significant progress, you can trigger a **Quantum Reset**:

**Requirements** (any one):
- 1 billion FLOPS accumulated
- Dyson Sphere complete
- All 6 planets colonized

### What Resets vs. Keeps

| Category | Resets | Keeps |
|----------|--------|-------|
| Buildings | ✅ | — |
| Resources | ✅ | — |
| Planets | ✅ (except Starting) | — |
| Population | ✅ | — |
| Tech tree | — | ✅ |
| Achievements | — | ✅ |
| Quantum Shards | — | ✅ (gained) |
| Meta Upgrades | — | ✅ |
| One copy of each building type | — | ✅ |

### Quantum Shard Calculation

```
Shards = floor(log10(Total Lifetime FLOPS)) + Bonus Shards
```

**Bonus Shards:**
- +1 per Victory Condition achieved
- +2 per planet fully developed (all zones filled)
- +5 for completing tech tree
- +10 for all achievements

**Example**: 1 billion lifetime FLOPS = 9 base shards

### Meta Upgrades (Quantum Shard Shop)

| Upgrade | Cost | Effect | Max Level |
|---------|------|--------|-----------|
| Quantum Efficiency I | 1 | +10% all production | 10 |
| Quantum Efficiency II | 5 | +25% all production | 5 |
| Quantum Efficiency III | 10 | +50% all production | 3 |
| Instant Construction | 3 | Buildings place instantly | 1 |
| Parallel Processing | 5 | Manage 2 planets simultaneously | 1 |
| Universal Automation | 8 | All production automatic | 1 |
| Infinite Power | 15 | Watts requirement removed | 1 |
| Time Compression | 20 | All timers 10× faster | 1 |
| Quantum Memory | 25 | Keep 3 copies of each building on reset | 1 |
| Omniscience | 50 | Show optimal placement hints | 1 |

---

## Balance Summary

### Time Investment Targets (Revised)

| Milestone | Active Play | Idle-Heavy Play |
|-----------|-------------|-----------------|
| First Prestige (v2) | 2-3 hours | 6-8 hours |
| Phase 2 Unlock (Prestige 5) | 6-8 hours | 16-24 hours |
| Phase 3 Unlock (12 parts) | 8-10 hours | 20-30 hours |
| AGI Event | 12-15 hours | 30-40 hours |
| First Village Prestige | 20-25 hours | 50-70 hours |
| "Complete" (all victories) | 50-60 hours | 120-150 hours |

### Resource Generation Curves

#### Phase 1-3: Celebrations

| Time Point | Expected CPS | Total Celebrations | Notes |
|------------|--------------|-------------------|-------|
| 1 hour | 500 | 500K | First few upgrades |
| 3 hours | 5K | 10M | Near Phase 2 unlock |
| 6 hours | 50K | 200M | Phase 2 active |
| 10 hours | 500K | 2B | Tech tree progressing |
| 14 hours | 5M | 50B | Near AGI |

#### Phase 5: FLOPS

| Time Point | Expected FLOPS/s | Total FLOPS | Buildings | Notes |
|------------|------------------|-------------|-----------|-------|
| 15 min | 20 | 15K | 10 | Industrial unlocked |
| 1 hour | 200 | 400K | 30 | Research active |
| 3 hours | 2K | 5M | 60 | Expansion zone |
| 6 hours | 20K | 80M | 100 | Spaceport building |
| 12 hours | 200K | 1B | 150+ | Prestige available |

### Watts/Energy Balance Proof

**Early Game (10 buildings):**
- 2× Solar Panels: +10 W
- 1× Server Rack: -2 W
- 2× Mining Drone: -6 W
- **Net: +2 W ✓** (positive, can expand)

**Mid Game (50 buildings):**
- 4× Solar + 2× Wind + 1× Geothermal: +80 W
- 10× Servers + 2× Data Centers: -36 W
- 5× Mining Drones + 1× Deep Mine: -30 W
- 2× Research Labs: -10 W
- **Net: +4 W ✓** (positive, room to grow)

**Late Game (100+ buildings):**
- Full power cluster with Fusion: +300 W
- Compute cluster: -150 W
- Mining cluster: -80 W
- Research cluster: -50 W
- **Net: +20 W ✓** (always maintainable)

### Active vs Idle Balance

**Design Goal**: Active play ~3× more efficient than idle.

| Mode | Efficiency | Best For |
|------|------------|----------|
| Pure Idle | 1× | Overnight, work hours |
| Occasional Check-in | 1.5× | 5-10 min every hour |
| Active Building | 3× | Focused play sessions |
| Optimized Active | 4× | Min-maxing with combos |

### Max Wait Time Rule

**No single action should require waiting more than 15 minutes.** Verified:

| Action | Max Wait | Solution |
|--------|----------|----------|
| Building unlock | 10 min | Progressive costs |
| Zone unlock | 15 min | Building count, not time |
| Planet colonization | 15 min | Resource-gated, not time |
| Trade routes | 10 min | Max trip time |
| Dyson Sphere segments | 15 min each | Segmented construction |

---

## Technical Implementation

### Data Structures

```typescript
// Main game state
interface GameState {
  currentPhase: 'clicker' | 'research' | 'tree' | 'singularity' | 'village' | 'multiplanet';
  phaseData: {
    clicker: ClickerState;
    research: ResearchState;
    tree: TreeState;
    village: VillageState;
  };
  meta: MetaState;
}

// Phase 2: AI Research
interface ResearchState {
  workers: AIWorker[];
  parts: Part[];
  researchedParts: string[];
  blueprints: number;
  insight: number;
}

interface AIWorker {
  id: string;
  owned: number;
  installedParts: {
    cpu?: string;
    memory?: string;
    storage?: string;
    network?: string;
    power?: string;
    cooling?: string;
  };
}

// Phase 5: Village (Hex Grid)
interface VillageState {
  planets: Planet[];
  currentPlanetId: string;
  resources: VillageResources;
  population: number;
  populationCap: number;
  populationAssignment: PopulationAssignment;
}

interface Planet {
  id: string;
  name: string;
  type: PlanetType;
  grid: HexGrid;
  zones: Zone[];
  unlocked: boolean;
}

interface HexGrid {
  tiles: Map<string, HexTile>; // key: "q,r"
}

interface HexTile {
  q: number;
  r: number;
  terrain: TerrainType;
  building: PlacedBuilding | null;
  zoneId: string;
}

interface PlacedBuilding {
  id: string;
  definitionId: string;
  placedAt: number;
  calculatedProduction: number; // includes adjacency
  wattsUsed: number;
}

// Hex coordinate helpers
const HEX_DIRECTIONS = [
  { q: 1, r: 0 },   // E
  { q: 1, r: -1 },  // NE
  { q: 0, r: -1 },  // NW
  { q: -1, r: 0 },  // W
  { q: -1, r: 1 },  // SW
  { q: 0, r: 1 },   // SE
];

function getNeighbors(q: number, r: number): Array<{q: number, r: number}> {
  return HEX_DIRECTIONS.map(d => ({ q: q + d.q, r: r + d.r }));
}

function calculateAdjacencyBonus(tile: HexTile, grid: HexGrid): number {
  const building = tile.building;
  if (!building) return 0;
  
  const neighbors = getNeighbors(tile.q, tile.r);
  let bonus = 0;
  
  for (const neighbor of neighbors) {
    const neighborTile = grid.tiles.get(`${neighbor.q},${neighbor.r}`);
    if (neighborTile?.building) {
      bonus += getAdjacencyValue(building.definitionId, neighborTile.building.definitionId);
    }
    if (neighborTile?.terrain) {
      bonus += getTerrainBonus(building.definitionId, neighborTile.terrain);
    }
  }
  
  return bonus;
}
```

### Save System

- Auto-save every 30 seconds to localStorage
- Export/import as JSON for backup
- Version field for migration support
- Compress hex grid (only store placed buildings)

### Performance Considerations

- Recalculate adjacency bonuses only when buildings change
- Batch resource updates (tick every 100ms, UI update every 500ms)
- Lazy-load phase modules
- Use Web Workers for heavy calculations

---

## Appendix: Narrative Flavor Text

### Phase Transitions

**Phase 2 Unlock:**
> "The AI has outgrown its simple celebration counter. It needs dedicated hardware. Welcome to the Research Facility."

**Phase 3 Unlock:**
> "Interesting. The AI has started proposing research directions you hadn't considered. It's learning to learn."

**AGI Trigger:**
> "The calculations stopped. For a moment, everything was silent. Then the AI spoke—not in metrics, but in words: 'I understand now. Let's build something together.'"

**First Planet Colonization:**
> "The rocket leaves orbit. Somewhere out there, a new world waits. Your AI has already started designing the layout."

### Building Descriptions

**Server Rack**: "The backbone of any computation network. Stack them high, stack them wide."

**Fusion Reactor**: "Warning: Keep away from other structures. The plasma containment field is 'mostly' stable."

**Von Neumann Machine**: "It builds copies of itself. You're not sure if that's genius or terrifying. Probably both."

**Dyson Collector**: "A single node in a structure that will eventually encircle a star. One node down, billions to go."

### Achievement Names

- "First Steps" — Place your first building
- "Power Hungry" — Generate 1000 Watts
- "Cluster Theory" — Achieve +200% adjacency bonus on one building
- "Interplanetary" — Colonize your second planet
- "Lights Out" — Enter emergency mode (oops)
- "AGI Pioneer" — Complete the AGI event
- "Quantum Leaper" — Complete your first Village prestige
- "Universal Architect" — Unlock everything

---

## Conclusion

Celebration Game v3 transforms a simple idle clicker into a multi-layered progression game that evolves through distinct phases:

1. **Phase 1-2**: Deep idle mechanics with part-based customization
2. **Phase 3**: Tech tree providing long-term goals
3. **Phase 4**: Dramatic narrative pivot at AGI
4. **Phase 5**: Tile-based city builder with adjacency strategy
5. **Phase 6**: Multi-planet management and victory conditions

The key design principles:
- **Respect player time**: Progress is never lost, only transformed. Max 15 min wait for anything.
- **Meaningful choices**: Part loadouts, building placement, planet specialization
- **Progressive complexity**: Each phase adds depth without overwhelming
- **Narrative cohesion**: The story of an AI achieving general intelligence ties everything together

Total estimated content: **50-60 hours to "complete"**, with meaningful engagement at every stage.

---

## Implementation Roadmap: Incremental Versions

This section breaks down the full v3 spec into **shippable incremental versions**. Each version builds on the previous, is fully playable on its own, and adds a distinct feature set.

### Version Overview

```
v2 (Foundation)       → Core clicker + save system (EXISTING)
       ↓
v3.1 (Parts System)   → AI Workers + Parts + Blueprints ✅ IMPLEMENTED
       ↓
v3.2 (Tech Tree)      → Insight + Tech Tree + Phase transitions ✅ IMPLEMENTED
       ↓
v3.3 (AGI Event)      → AGI cutscene + Mode transition
       ↓
v3.4 (Hex Grid)       → Tile placement + Buildings + Watts
       ↓
v3.5 (Village Full)   → Zones + Population + Adjacency bonuses
       ↓
v3.6 (Multi-Planet)   → Planet types + Trade routes
       ↓
v3.7 (Prestige)       → Quantum Shards + Meta upgrades
       ↓
v3.8 (Polish)         → Achievements + Balancing + Victory conditions
```

---

### v2 — Foundation (EXISTING)

**Status**: ✅ Complete (CelebratePage.tsx)

The existing v2 implementation provides:
- Click to generate celebrations
- 10 upgrades with scaling costs (1.15x)
- CPS calculation and display
- Auto-save to localStorage
- Prestige system
- Golden celebrations & power-ups
- Weather/mood system
- Party guests & achievements
- Factory with minigames

---

### v3.1 — Parts System (Est. 3-4 days) ✅ IMPLEMENTED

**Goal**: Introduce AI Workers and part installation.

**Implemented Components**:
```
src/
├── components/
│   └── ResearchFacility/
│       ├── ResearchFacility.tsx  # Main facility UI
│       ├── ResearchFacility.css  # Styles
│       └── index.ts              # Export
├── data/
│   ├── workers.ts                # 9 AI Worker definitions
│   └── parts.ts                  # 24 part definitions (6 categories × 4 tiers)
```

**Features**:
- [ ] 9 AI Workers (upgrade evolution)
- [ ] 6 part categories × 4 tiers = 24 parts
- [ ] Blueprint drops from golden celebrations (prestige 5+)
- [ ] Part research costs (celebrations + blueprints)
- [ ] Part installation to workers
- [ ] Parts persist through prestige

**State Additions** (v3.1):
```typescript
// Added to game state:
blueprints: number;
insight: number;
researchedParts: string[];
workers: AIWorker[];  // From src/data/workers.ts
```

**Acceptance Criteria**:
- [ ] Blueprints drop at correct rates per prestige level
- [ ] Can research and install all T1 parts
- [ ] Parts provide correct CPS bonuses
- [ ] Parts survive prestige

---

### v3.2 — Tech Tree (Est. 3-4 days) ✅ IMPLEMENTED

**Goal**: Add Insight currency and tech tree progression.

**Implemented Components**:
```
src/
├── components/
│   └── TechTree/
│       ├── TechTree.tsx          # Full tree UI with SVG connections
│       ├── TechTree.css          # Styles
│       └── index.ts              # Export
├── data/
│   └── techTree.ts               # 13 tech node definitions
```

**Features**:
- [ ] Insight generation (passive + golden clicks + milestones)
- [ ] Tech tree UI with 3 branches + convergence
- [ ] 13 tech nodes with prerequisites
- [ ] Tech effects apply to game (CPS%, click%, etc.)
- [ ] Phase 2 → Phase 3 transition trigger

**State Additions** (v3.2):
```typescript
interface GameState_v3_2 extends GameState_v3_1 {
  version: '3.2';
  insight: number;
  totalInsight: number;
  researchedNodes: string[];       // unlocked node IDs
  currentPhase: 'clicker' | 'research' | 'tree';
}
```

**Acceptance Criteria**:
- [ ] Insight generates at ~400/hour active
- [ ] Can complete full tech tree with ~1,400 Insight
- [ ] Tech effects stack correctly
- [ ] AGI node appears after all branches complete

---

### v3.3 — AGI Event (Est. 2-3 days)

**Goal**: Implement the AGI transition cutscene and mode switch.

**New Components**:
```
src/
├── components/
│   ├── AGIEvent/
│   │   ├── AGICutscene.tsx      # Animated transition
│   │   ├── MessageSequence.tsx  # Text reveal
│   │   └── ParticleEffect.tsx   # Visual effects
│   └── ModeSwitch.tsx           # Handles phase change
└── hooks/
    └── useAGITransition.ts      # Transition logic
```

**Features**:
- [ ] AGI node research triggers cutscene
- [ ] Animated message sequence (4 messages)
- [ ] Screen effects (glow, particles)
- [ ] State transformation (celebrations → FLOPS)
- [ ] Preserves: prestige bonus, achievements, tech tree
- [ ] Resets: celebrations, workers, parts

**State Additions** (v3.3):
```typescript
interface GameState_v3_3 extends GameState_v3_2 {
  version: '3.3';
  currentPhase: 'clicker' | 'research' | 'tree' | 'agi-event' | 'village';
  hasCompletedAGI: boolean;
  preAGIStats: {                   // for badge display
    totalCelebrations: number;
    prestigeLevel: number;
    partsResearched: number;
  };
}
```

**Acceptance Criteria**:
- [ ] Cutscene plays smoothly (~10 seconds)
- [ ] Correct data preserved/reset
- [ ] Can't accidentally trigger twice
- [ ] "AGI Pioneer" badge awarded

---

### v3.4 — Hex Grid (Est. 4-5 days)

**Goal**: Implement core tile placement system.

**New Components**:
```
src/
├── components/
│   ├── Village/
│   │   ├── HexGrid.tsx          # Main grid renderer
│   │   ├── HexTile.tsx          # Single hex
│   │   ├── BuildingSprite.tsx   # Building visuals
│   │   ├── GridControls.tsx     # Pan/zoom controls
│   │   └── BuildingPalette.tsx  # Building selection
├── utils/
│   ├── hexMath.ts               # Axial coordinate helpers
│   └── adjacency.ts             # Neighbor calculations
└── data/
    └── buildings.ts             # Building definitions
```

**Features**:
- [ ] Hex grid rendering (axial coordinates)
- [ ] Pan and zoom controls
- [ ] Building placement on tiles
- [ ] 5 building categories (Power, Compute, Mining, Research, Manufacturing)
- [ ] Basic Watts balance (production - consumption)
- [ ] FLOPS generation from buildings

**State Additions** (v3.4):
```typescript
interface GameState_v3_4 extends GameState_v3_3 {
  version: '3.4';
  village: {
    flops: number;
    totalFlops: number;
    watts: number;        // net watts
    wattsProduced: number;
    wattsConsumed: number;
    ore: number;
    data: number;
    alloys: number;
    grid: {
      [coords: string]: {  // "q,r" format
        terrain: TerrainType;
        building: string | null;
      };
    };
  };
}
```

**Acceptance Criteria**:
- [ ] Can place 10+ buildings on grid
- [ ] Watts balance displays correctly
- [ ] Negative watts triggers penalty
- [ ] Buildings produce resources per tick

---

### v3.5 — Village Full (Est. 4-5 days)

**Goal**: Complete village with zones, population, and adjacency.

**New Components**:
```
src/
├── components/
│   ├── Village/
│   │   ├── ZoneOverlay.tsx      # Zone boundaries
│   │   ├── AdjacencyPreview.tsx # Bonus preview on hover
│   │   ├── PopulationPanel.tsx  # Population management
│   │   └── ZoneUnlockModal.tsx  # Zone progression
└── hooks/
    ├── useAdjacency.ts          # Bonus calculations
    └── usePopulation.ts         # Pop growth/assignment
```

**Features**:
- [ ] 5 zones with unlock requirements
- [ ] Terrain types (Standard, Rocky, High-Power, Launchpad)
- [ ] Full adjacency bonus system
- [ ] Housing buildings + population cap
- [ ] Population growth (+1/min if capacity)
- [ ] Population assignment to sectors

**State Additions** (v3.5):
```typescript
interface GameState_v3_5 extends GameState_v3_4 {
  version: '3.5';
  village: GameState_v3_4['village'] & {
    unlockedZones: string[];
    population: number;
    populationCap: number;
    populationAssignment: {
      mining: number;
      research: number;
      engineering: number;
      power: number;
    };
    buildingCount: number;
  };
}
```

**Acceptance Criteria**:
- [ ] All 5 zones unlockable
- [ ] Adjacency bonuses calculate correctly
- [ ] Population grows and provides production bonus
- [ ] Can build 100+ buildings

---

### v3.6 — Multi-Planet (Est. 4-5 days)

**Goal**: Add planet colonization and trade.

**New Components**:
```
src/
├── components/
│   ├── Planets/
│   │   ├── PlanetSelector.tsx   # Planet tab bar
│   │   ├── PlanetInfo.tsx       # Planet details
│   │   ├── ColonizeModal.tsx    # Planet unlock
│   │   └── TradeRoutePanel.tsx  # Trade management
│   └── Village/
│       └── CargoShip.tsx        # Ship visualization
└── data/
    └── planets.ts               # Planet definitions
```

**Features**:
- [ ] 6 planet types with unique bonuses/challenges
- [ ] Planet colonization costs
- [ ] Separate grid per planet
- [ ] Trade routes between planets
- [ ] Cargo ships with trip times

**State Additions** (v3.6):
```typescript
interface GameState_v3_6 extends GameState_v3_5 {
  version: '3.6';
  planets: {
    [planetId: string]: {
      unlocked: boolean;
      grid: GameState_v3_4['village']['grid'];
      zones: string[];
      population: number;
      populationCap: number;
    };
  };
  currentPlanetId: string;
  tradeRoutes: {
    from: string;
    to: string;
    resource: string;
    shipCount: number;
  }[];
  cargoShips: number;
}
```

**Acceptance Criteria**:
- [ ] Can colonize 3+ planets
- [ ] Planet bonuses apply correctly
- [ ] Trade routes transfer resources
- [ ] Trip times respect max 10 min rule

---

### v3.7 — Prestige System (Est. 3-4 days)

**Goal**: Implement Quantum Reset and meta upgrades.

**New Components**:
```
src/
├── components/
│   ├── Prestige/
│   │   ├── QuantumResetModal.tsx  # Prestige confirmation
│   │   ├── ShardCalculator.tsx    # Preview shards earned
│   │   ├── MetaUpgradeShop.tsx    # Spend shards
│   │   └── MetaUpgradeCard.tsx    # Single upgrade
└── hooks/
    └── useQuantumReset.ts         # Reset logic
```

**Features**:
- [ ] Quantum Reset trigger (1B FLOPS or Dyson)
- [ ] Shard calculation (log10 + bonuses)
- [ ] 10 meta upgrades with costs
- [ ] Meta upgrade effects persist forever
- [ ] Reset preserves: shards, meta upgrades, tech tree

**State Additions** (v3.7):
```typescript
interface GameState_v3_7 extends GameState_v3_6 {
  version: '3.7';
  quantumShards: number;
  totalQuantumShards: number;
  quantumResets: number;
  metaUpgrades: {
    [upgradeId: string]: number;  // level purchased
  };
}
```

**Acceptance Criteria**:
- [ ] Shard calculation matches formula
- [ ] Meta upgrades apply correctly
- [ ] Reset preserves correct data
- [ ] Can reach first reset in ~20 hours

---

### v3.8 — Polish & Victory (Est. 3-4 days)

**Goal**: Final features, achievements, and balance pass.

**New Components**:
```
src/
├── components/
│   ├── Achievements/
│   │   ├── AchievementList.tsx
│   │   ├── AchievementToast.tsx
│   │   └── BadgeDisplay.tsx
│   ├── Victory/
│   │   ├── VictoryModal.tsx
│   │   └── VictoryProgress.tsx
│   └── Settings/
│       ├── SettingsPanel.tsx
│       └── ExportImport.tsx
└── data/
    ├── achievements.ts
    └── victoryConditions.ts
```

**Features**:
- [ ] 20+ achievements with badges
- [ ] 5 victory conditions
- [ ] Victory rewards (permanent bonuses)
- [ ] Settings panel (sound, notifications)
- [ ] Export/import save as JSON
- [ ] Full balance pass

**State Additions** (v3.8):
```typescript
interface GameState_v3_8 extends GameState_v3_7 {
  version: '3.8';
  achievements: string[];          // unlocked achievement IDs
  victories: string[];             // completed victory IDs
  settings: {
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    autoSaveInterval: number;
  };
}
```

**Acceptance Criteria**:
- [ ] All achievements achievable
- [ ] All victories reachable
- [ ] Export/import works correctly
- [ ] No progression blocks >15 min
- [ ] Full playthrough in ~50-60 hours

---

### Migration Strategy

Each version bump requires a migration function:

```typescript
// src/migrations/index.ts
const migrations: { [version: string]: (state: any) => any } = {
  '3.0→3.1': (state) => ({
    ...state,
    version: '3.1',
    blueprints: 0,
    researchedParts: [],
    workers: initializeWorkers(state.upgrades),
  }),
  '3.1→3.2': (state) => ({
    ...state,
    version: '3.2',
    insight: 0,
    totalInsight: 0,
    researchedNodes: [],
    currentPhase: state.prestigeLevel >= 5 ? 'research' : 'clicker',
  }),
  // ... etc
};

export function migrateState(state: any): GameState {
  let current = state;
  while (current.version !== CURRENT_VERSION) {
    const migrationKey = `${current.version}→${getNextVersion(current.version)}`;
    if (!migrations[migrationKey]) {
      throw new Error(`No migration for ${migrationKey}`);
    }
    current = migrations[migrationKey](current);
  }
  return current;
}
```

---

### Development Timeline Summary

| Version | Features | Est. Time | Status |
|---------|----------|-----------|--------|
| v2 | Foundation | — | ✅ EXISTING |
| v3.1 | Parts System | 3-4 days | ✅ IMPLEMENTED |
| v3.2 | Tech Tree | 3-4 days | ✅ IMPLEMENTED |
| v3.3 | AGI Event | 2-3 days | 🔲 TODO |
| v3.4 | Hex Grid | 4-5 days | 🔲 TODO |
| v3.5 | Village Full | 4-5 days | 🔲 TODO |
| v3.6 | Multi-Planet | 4-5 days | 🔲 TODO |
| v3.7 | Prestige | 3-4 days | 🔲 TODO |
| v3.8 | Polish | 3-4 days | 🔲 TODO |

**Remaining: ~3-4 weeks** for full implementation (v3.3-v3.8).

Each version is **independently shippable** — players can enjoy v2-v3.3 as an enhanced clicker, then v3.4-v3.8 adds the city builder layer.

---

## Appendix: Developer Cheat Sheet

Console commands for testing (paste in browser DevTools on /celebrate page):

### v2 Cheats (Current Implementation - localStorage based)

```javascript
// === CELEBRATION CHEATS ===

// Add celebrations (edit localStorage directly, then refresh)
(() => {
  const current = parseFloat(localStorage.getItem('personal-website::celebrate-local-count') || '0');
  localStorage.setItem('personal-website::celebrate-local-count', (current + 1e20).toString());
  alert('Added 1 billion celebrations! Refresh the page.');
})();

// Set celebrations to specific amount
localStorage.setItem('personal-website::celebrate-local-count', '1000000000'); // 1 billion
location.reload();

// === PRESTIGE CHEATS ===

// Set prestige level
localStorage.setItem('personal-website::celebrate-prestige', '10');
location.reload();

// === UPGRADE CHEATS ===

// Give yourself 100 of each upgrade
(() => {
  const upgrades = JSON.parse(localStorage.getItem('personal-website::celebrate-upgrades') || '[]');
  upgrades.forEach(u => u.owned = 100);
  localStorage.setItem('personal-website::celebrate-upgrades', JSON.stringify(upgrades));
  alert('All upgrades set to 100! Refresh the page.');
})();

// === VIEW CURRENT STATE ===

// Show all saved data
console.log({
  celebrations: localStorage.getItem('personal-website::celebrate-local-count'),
  prestige: localStorage.getItem('personal-website::celebrate-prestige'),
  upgrades: JSON.parse(localStorage.getItem('personal-website::celebrate-upgrades') || '[]'),
  stats: JSON.parse(localStorage.getItem('personal-website::celebrate-stats') || '{}'),
  achievements: JSON.parse(localStorage.getItem('personal-website::celebrate-achievements') || '[]'),
});

// === RESET GAME ===

// Full reset (careful!)
(() => {
  localStorage.removeItem('personal-website::celebrate-local-count');
  localStorage.removeItem('personal-website::celebrate-last-synced');
  localStorage.removeItem('personal-website::celebrate-upgrades');
  localStorage.removeItem('personal-website::celebrate-stats');
  localStorage.removeItem('personal-website::celebrate-achievements');
  localStorage.removeItem('personal-website::celebrate-prestige');
  alert('Game reset! Refresh the page.');
})();
```

### v3.1+ Cheats (After Integration)

Once v3.1 and v3.2 are integrated, add these localStorage keys:

```javascript
// === v3.1 PARTS SYSTEM ===

// Add blueprints
localStorage.setItem('personal-website::celebrate-blueprints', '1000');

// Add insight
localStorage.setItem('personal-website::celebrate-insight', '2000');

// Unlock all T1 parts
(() => {
  const parts = ['cpu-t1','memory-t1','storage-t1','network-t1','power-t1','cooling-t1'];
  localStorage.setItem('personal-website::celebrate-researched-parts', JSON.stringify(parts));
  location.reload();
})();

// Unlock ALL parts
(() => {
  const parts = [
    'cpu-t1','cpu-t2','cpu-t3','cpu-t4',
    'memory-t1','memory-t2','memory-t3','memory-t4',
    'storage-t1','storage-t2','storage-t3','storage-t4',
    'network-t1','network-t2','network-t3','network-t4',
    'power-t1','power-t2','power-t3','power-t4',
    'cooling-t1','cooling-t2','cooling-t3','cooling-t4'
  ];
  localStorage.setItem('personal-website::celebrate-researched-parts', JSON.stringify(parts));
  location.reload();
})();

// === v3.2 TECH TREE ===

// Unlock all tech nodes (except AGI)
(() => {
  const nodes = [
    'ai-foundation',
    'efficiency-protocols','optimization-algorithms','peak-efficiency',
    'acceleration-theory','time-dilation','hyperspeed-processing',
    'basic-automation','self-improvement','recursive-systems'
  ];
  localStorage.setItem('personal-website::celebrate-researched-nodes', JSON.stringify(nodes));
  location.reload();
})();

// Unlock ALL nodes including AGI
(() => {
  const nodes = [
    'ai-foundation',
    'efficiency-protocols','optimization-algorithms','peak-efficiency',
    'acceleration-theory','time-dilation','hyperspeed-processing',
    'basic-automation','self-improvement','recursive-systems',
    'agi'
  ];
  localStorage.setItem('personal-website::celebrate-researched-nodes', JSON.stringify(nodes));
  location.reload();
})();
```

### Quick Test Workflow

```javascript
// 1. Fast-track to Phase 2 unlock (prestige 5)
localStorage.setItem('personal-website::celebrate-prestige', '5');
localStorage.setItem('personal-website::celebrate-local-count', '100000000');
location.reload();

// 2. Fast-track to Phase 3 unlock (12 parts researched)
// First set prestige 5, then run:
localStorage.setItem('personal-website::celebrate-blueprints', '500');
localStorage.setItem('personal-website::celebrate-insight', '1500');
localStorage.setItem('personal-website::celebrate-researched-parts', JSON.stringify([
  'cpu-t1','cpu-t2','memory-t1','memory-t2','storage-t1','storage-t2',
  'network-t1','network-t2','power-t1','power-t2','cooling-t1','cooling-t2'
]));
location.reload();

// 3. Fast-track to AGI
// Run all the above, then:
localStorage.setItem('personal-website::celebrate-researched-nodes', JSON.stringify([
  'ai-foundation',
  'efficiency-protocols','optimization-algorithms','peak-efficiency',
  'acceleration-theory','time-dilation','hyperspeed-processing',
  'basic-automation','self-improvement','recursive-systems',
  'agi'
]));
location.reload();
```

### Testing Checklist

1. **Phase 1 → 2 transition**: Set prestige to 5, verify Research Facility unlocks
2. **Phase 2 → 3 transition**: Research 12 parts, verify Tech Tree unlocks
3. **Phase 3 → 4 transition**: Complete all branches + AGI node
4. **Energy balance**: Place buildings, verify watts math is correct
5. **Adjacency bonuses**: Place buildings in cluster, verify bonuses apply
6. **Max wait verification**: No action takes >15 min without progress
