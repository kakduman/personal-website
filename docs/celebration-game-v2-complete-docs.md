# Celebration Game v2 - Complete Technical Documentation

## 1. High-Level Overview

The **Party / Celebrate page** is an idle-clicker style mini-game where you:

* Click a big **"Celebrate"** button to earn celebrations.
* Unlock **upgrades** that generate celebrations automatically.
* Trigger **power-ups, moods, weather effects, party guests, golden celebrations**, and **minigames** for more celebrations.
* Experience **random events** that dramatically change gameplay.
* Earn **achievements** and **badges**, and eventually **prestige** to get permanent multipliers.

Your progress (celebrations, upgrades, achievements, prestige, factory resources) is stored in your browser and persists between visits on that device.

---

## 2. Core Resources & Counters

### 2.1 Local Celebrations

* This is your main **personal counter** shown on the page.
* It increases when:
  * You click the Celebrate button.
  * Auto-clickers (upgrades) generate celebrations.
  * Golden stars ("Golden Celebrations") are clicked.
  * Party guests arrive.
  * Achievements, minigames, rhythms, Konami, etc. award bonuses.

### 2.2 Global Celebration Count (for badges)

* Every time the system calls **"register a celebration"**, the **global** count increases by 1.
* Some badges depend on this:
  * **Party Animal** badge unlocks when **global celebrations ≥ 100**.
  * **Party Seeker** badge is tied to finding/using the secret celebration page at least once.
* This global count is shared across the site (i.e., it isn't just this page's local currency).

### 2.3 Game Stats

The Party module tracks a separate **Game Stats** object:

* `totalClicks` – total times you've clicked the Celebrate button.
* `criticalHits` – total critical hits you've triggered.
* `goldenCelebsCaught` – number of golden stars you've clicked.
* `comboHighScore` – highest combo streak you've ever achieved.
* `prestigeLevel` – how many times you've prestiged.
* `timePlayedSeconds` – approximate total time spent with the page running.

These stats drive **achievements** and some bonuses.

---

## 3. Manual Celebrations: Click Mechanics

### 3.1 Base Click Power

* **Base click power** starts at **1 celebration per click**.

### 3.2 Combo System

* Each click increases your **combo level** by **+1**.
* If you don't click for **2 seconds**, the combo resets to **0**.
* Combo gives a small **multiplicative bonus** to click value:

> **Combo bonus multiplier** = `1 + (0.001 × combo)`
> → Each combo level adds **+0.1%** to your click.

Example:

* Combo = 50 → 1 + 0.001×50 = **1.05×** (5% boost)
* Combo = 200 → 1 + 0.001×200 = **1.20×** (20% boost)

Your **highest combo ever** is tracked in `comboHighScore` and used for achievements.

### 3.3 Prestige Multiplier (clicks)

Your **Prestige level** provides a permanent multiplier:

> **Click multiplier (base)** = `1 + 0.10 × prestigeLevel`

* Each prestige gives +10% to clicks *before* weather/mood and crits.
* This base multiplier is further multiplied by certain power-ups (see Power-ups).

### 3.4 Critical Hits

Every click may be a **critical hit**:

* Base crit chance: **10%** (`0.10`).
* Each prestige adds **+1 percentage point** to crit chance:

> **Crit chance** = `0.10 + 0.01 × prestigeLevel`,
> unless a crit power-up is active (see below).

* When a click is critical, you get a **crit multiplier**:

> **Crit multiplier** = `2 + 0.5 × prestigeLevel`
> (otherwise 1 if non-crit)

* A **crit power-up** (Four Leaf Clover) sets crit chance to **100%** while active.

Critical hits:

* Increment `criticalHits`.
* Greatly increase celebrations on that click.

### 3.5 Bonus From "Bonus" Power-Ups

Some power-ups add a **flat bonus** celebrations per click:

* A helper function sums all active power-ups with effect `"bonus"`:
  * Example: **Elder Blessing** has `multiplier: 777`, meaning **+777 celebrations per click** while active.
* This flat bonus is added *before* weather + mood multipliers.

### 3.6 Weather & Mood Multipliers

Your click value is further multiplied by **current weather** and **current mood**:

#### Weather Types & Multipliers

* ☀️ **Sunny** – `×1.2`
* 🌧️ **Rainy** – `×1.5`
* ⛈️ **Stormy** – `×2.0`
* ❄️ **Snowy** – `×0.8`  (nerf)
* 💨 **Windy** – `×1.3`
* 🌫️ **Foggy** – `×0.9`  (slight nerf)

Weather changes every **2-5 minutes** (randomized).

#### Mood Types & Multipliers

* 😊 **Happy** – `×1.1`
* 😎 **Cool** – `×1.2`
* 🤪 **Crazy** – `×1.5`
* 😴 **Sleepy** – `×0.8`
* 🤔 **Thoughtful** – `×1.0`
* 🥳 **Party Mode** – `×2.0` (the best one)

Mood changes every **1-3 minutes** (randomized).

### 3.7 Full Click Formula (Conceptual)

For a single click, **before rounding**, the celebrations gained are basically:

```text
base = 1  // base click power
comboMultiplier = 1 + 0.001 * combo
clickMultiplier = (1 + 0.10 * prestigeLevel) * (product of click/all power-up multipliers)
critMultiplier = 1  or  (2 + 0.5 * prestigeLevel) if crit
bonusFlat = sum(multiplier of all 'bonus' power-ups)
weatherMultiplier = (from weather table above)
moodMultiplier = (from mood table above)

rawClickValue = (base * comboMultiplier * clickMultiplier * critMultiplier + bonusFlat)
finalClick = floor(rawClickValue) * weatherMultiplier * moodMultiplier
```

That **finalClick** is the number added to your **local celebrations**.

---

## 4. Passive Celebrations: Upgrades & Auto-Clicking

### 4.1 Upgrades (CPS – Celebrations per Second)

Each **Upgrade** has:

* `name`
* `description`
* `cost` (in celebrations, base)
* `cps` (**celebrations per second** contributed)
* `owned` (how many copies you have)

Known upgrades and their base stats:

| Upgrade ID                    | Name                            | Base Cost |    CPS |
| ----------------------------- | ------------------------------- | --------: | -----: |
| `ryan`                        | Ryan                            |        10 |      1 |
| `neural-networker`            | Neural Networker                |        50 |      5 |
| `party-bot`                   | Party Bot                       |       200 |     10 |
| `microparty-orchestrator`     | Microparty Orchestrator         |       500 |     20 |
| `elastic-celebration-service` | Elastic Celebration Service     |      2000 |     50 |
| `event-loop`                  | Event Loop                      |     10000 |    200 |
| `quantum-compartier`          | Quantum Compartier              |    100000 |   1000 |
| `meme-generator`              | Meme Generator                  |    500000 |   5000 |
| `celebration-singularity`     | Celebration Singularity         |   5000000 |  25000 |
| `celebration-factory`         | Celebration Factory (special)   |  10000000 |      0 |

#### Cost Scaling

Each time you buy an upgrade, its cost increases:

> **Current cost** ≈ `baseCost × 1.15^owned` (rounded down)

So each copy gets 15% more expensive than the last.

### 4.2 Production Multiplier (Auto CPS)

Total celebrations per second (**CPS**) from upgrades:

```text
baseCPS = sum(upgrade.cps * upgrade.owned for all upgrades)
productionMultiplier = (1 + 0.05 * prestigeLevel) * (product of production/all power-up multipliers)

totalCPS = baseCPS * productionMultiplier
```

### 4.3 Auto-Click Loop

* As long as `totalCPS > 0`, an internal timer:
  * Every **100 ms** (10× per second) adds:
    > `increment = totalCPS / 10`
    to your **local celebrations**.
  * Registers additional celebrations for the global count as it goes.
* Practically: you gain **approximately `totalCPS` celebrations per second** passively.

---

## 5. Power-Ups

Power-ups are **temporary buffs** with durations and different "effects": `click`, `production`, `all`, `bonus`, or `crit`.

They can appear:

* randomly on clicks (about **1%** chance per click),
* sometimes when interacting with golden celebrations (30% chance),
* from certain random events.

### 5.1 Power-Up List

From your config:

| ID       | Name               | Effect Type  | Multiplier | Duration (ms) | Effect Summary                        |
| -------- | ------------------ | ------------ | ---------: | ------------: | ------------------------------------- |
| `frenzy` | Celebration Frenzy | `click`      |         7× |         15000 | 7× manual click celebrations.         |
| `lucky`  | Lucky Streak       | `production` |         2× |         20000 | 2× auto CPS.                          |
| `dragon` | Dragon Mode        | `click`      |        10× |         10000 | 10× manual clicks.                    |
| `storm`  | Confetti Storm     | `all`        |         5× |          8000 | 5× clicks **and** auto CPS.           |
| `elder`  | Elder Blessing     | `bonus`      |        777 |         30000 | +777 flat celebrations per click.     |
| `clover` | Four Leaf Clover   | `crit`       |          1 |         12000 | Forces 100% crit chance while active. |

Power-ups stack **multiplicatively** where relevant:

* Multiple `click` / `all` power-ups multiply together.
* Multiple `production` / `all` power-ups multiply together.
* Multiple `bonus` power-ups add their flat bonus amounts.

---

## 6. Golden Celebrations ⭐

Random **golden stars** spawn on the screen:

* Position:
  * X: between 10%–80% of width.
  * Y: between 20%–80% of height.
* **Value (celebrations granted on click):**

> `value = floor(100 + random(0–900)) × (prestigeLevel + 1)`
> → So between **100 and 1000**, scaled by `(prestigeLevel + 1)`.

* Lifetime: **10 seconds** before disappearing.
* Spawn rate: Every **15-40 seconds** (randomized).
* Clicking a golden star:
  * Adds `value` to your **local celebrations**.
  * Increments `goldenCelebsCaught`.
  * Has a **30% chance** to spawn a power-up.
  * Shows special golden confetti.

Golden celebrations are how you unlock the **"Golden Hunter"** achievement (after enough catches).

---

## 7. Party Guests 🎉

The **Party Guest system** periodically spawns a guest pop-up:

* Guests are randomly chosen from a list such as:
  * **DJ Byte** – gift: 250 celebrations
  * **Professor Code** – gift: 500
  * **Captain Confetti** – gift: 1000
  * **Pizza Delivery** – gift: 300
  * **Party Penguin** – gift: 150
  * **Disco Ball** – gift: 400
  * **Cake Boss** – gift: 350
  * **Balloon Artist** – gift: 200
  * **Magician** – gift: 800
  * **Time Traveler** – gift: 2000

### Timing & Rewards

* A guest appears every **45–135 seconds** (randomized).
* When a guest appears:
  * A popup shows their emoji, message, and reward.
  * You instantly gain **`guest.gift` celebrations**.
  * The popup lasts ~5 seconds.

---

## 8. Random Events System 🎲

Random events trigger automatically every **30-90 seconds** (randomized) and can dramatically change gameplay.

### 8.1 Event Types & Effects

Events are selected using **weighted random selection** (different weights = different spawn rates).

| Event ID    | Message                                             | Effect                                              | Weight | Rarity    |
| ----------- | --------------------------------------------------- | --------------------------------------------------- | ------ | --------- |
| `meteor`    | ☄️ Meteor shower! +1000 celebrations!              | Adds **+1000 celebrations**                         | 1      | Common    |
| `rainbow`   | 🌈 Rainbow appeared! Colors changed!               | Changes confetti colors to random palette           | 2      | Common    |
| `aliens`    | 👽 Aliens visited! They brought gifts!             | Adds **+60 seconds of CPS** + spawns power-up       | 1      | Common    |
| `timewarp`  | ⏰ Time warp! +5 minutes of production!            | Adds **+300 seconds (5 min) of CPS**                | 1      | Common    |
| `jackpot`   | 🎰 Jackpot! Triple your current celebrations!      | **Multiplies celebrations by 3×**                   | 0.5    | **RARE**  |
| `ghost`     | 👻 Spooky ghost stole some celebrations!           | **Reduces celebrations to 95%** (5% penalty)        | 1      | Common    |
| `santa`     | 🎅 Santa came early! Ho ho ho!                     | Adds **+10,000 celebrations** + spawns golden star  | 0.5    | **RARE**  |
| `dragon`    | 🐉 A dragon blessed you with power!                | Spawns a **random power-up**                        | 2      | Common    |
| `earthquake`| 🌍 Earthquake! Everything is shaking!              | **Screen shake effect** for 2 seconds (cosmetic)    | 1      | Common    |
| `midas`     | ✨ Midas touch! Everything turns to gold!          | Spawns **3 golden celebrations** in sequence        | 0.5    | **RARE**  |

### 8.2 Event Mechanics

#### Jackpot Event Details

* **Effect**: Multiplies your current local celebrations by **3×**
* **Formula**: `localCount = localCount × 3`
* **Rarity**: Weight 0.5 (rare)
* **Strategic Impact**: This is the most powerful event for exponential growth. The more celebrations you have, the bigger the gain. Players should try to trigger this when they have a high celebration count.

#### Rainbow Event Details

* **Effect**: Changes confetti colors to a random color palette
* **Color Palettes**:
  * Hot Pink Set: `['#ff0080', '#ff8c00', '#ffff00', '#00ff00', '#0080ff']`
  * Pink Party Set: `['#ff1493', '#ff69b4', '#ffc0cb', '#ffb6c1', '#ff69b4']`
  * Neon Set: `['#8b00ff', '#ff00ff', '#ff1493', '#00ffff', '#00ff00']`
  * Gold Set: `['#ffd700', '#ffff00', '#fff68f', '#fafad2', '#fffacd']`
* **Rarity**: Weight 2 (common)
* **Strategic Impact**: Purely cosmetic, changes the visual feel of the game

#### Dragon Event Details

* **Effect**: Spawns a random power-up from the power-up pool
* **Rarity**: Weight 2 (common)
* **Strategic Impact**: Good chance to get a power-up without clicking. Can chain with other effects.

#### Midas Event Details

* **Effect**: Spawns 3 golden celebrations in sequence (one every 0.5 seconds)
* **Rarity**: Weight 0.5 (rare)
* **Strategic Impact**: Combined value of 300-3000 celebrations (scaled by prestige), plus potential power-ups from each golden click (30% chance each)

### 8.3 Event Timing

* Events are scheduled with randomized delays
* Base interval: **30-90 seconds** between events
* Events continue to spawn as long as the game is active
* Only one event triggers at a time

---

## 9. Minigames & Factory (Resources → Upgrades)

The **Celebration Factory** is a meta-system where you use minigames to earn resources that manufacture upgrades.

### 9.1 Factory Unlock

* Unlock by purchasing the **"Celebration Factory"** upgrade
* Cost: **10,000,000 celebrations**
* This is a special upgrade with **0 CPS** but unlocks the factory system

### 9.2 Factory Resources

Factory tracks 3 resource types:

* 🎊 **Confetti** (from Whack-a-Mole)
* ⚡ **Energy** (from Memory Match)
* 😊 **Happiness** (from Reaction Test)

These start at 0 and are increased by minigames.

### 9.3 Resource Costs for Manufacturing Upgrades

Each upgrade has a **resource requirement triple**:

> `[confetti, energy, happiness]` needed

From `UPGRADE_RESOURCE_COSTS`:

| Upgrade ID                    | Requires 🎊 | Requires ⚡ | Requires 😊 |
| ----------------------------- | ----------: | ---------: | ----------: |
| `ryan`                        |          10 |          5 |           5 |
| `neural-networker`            |          30 |         20 |          10 |
| `party-bot`                   |          50 |         40 |          30 |
| `microparty-orchestrator`     |          80 |         60 |          50 |
| `elastic-celebration-service` |         120 |        100 |          80 |
| `event-loop`                  |         200 |        150 |         120 |
| `quantum-compartier`          |         350 |        300 |         250 |
| `meme-generator`              |         600 |        500 |         400 |
| `celebration-singularity`     |        1000 |        800 |         600 |

In the factory UI:

* You choose a **target upgrade**.
* It shows the **required** Confetti / Energy / Happiness.
* As you play minigames, you accumulate resources.
* Once you have enough, the production progress can complete and grants **one copy** of the selected upgrade (increasing its `owned` and CPS).

### 9.4 Factory Production System

* **Production Rate**: 1.0% per second (base)
* **Prestige Bonus**: `×(1 + 0.25 × prestigeLevel)` — +25% per prestige
* Production **pauses** if you don't have enough resources
* When progress reaches **100%** AND you have required resources:
  * The upgrade is automatically added to your collection
  * Resources are consumed
  * Progress resets to 0%
  * Production starts on the same upgrade again

### 9.5 Whack-a-Mole → Confetti

* **Game:** 9 spots; moles pop up. You click them.
* **Duration:** 15 seconds.
* **Mole Speed**: New mole every 0.75 seconds

On game end:

* **Base reward:** 100
* **Performance bonus:** `floor(score × 1.5)`
* **Prestige multiplier:** `1 + 0.25 × prestigeLevel`
* **Confetti gained:**

  > `confettiReward = floor((baseReward × score + performanceBonus) × prestigeMultiplier)`

* This is added to **Confetti** resource.
* An event message indicates the amount (e.g., "+X 🎊 Confetti").

### 9.6 Memory Match → Energy

* **Game:** 16 cards (8 pairs with party emojis).
* You flip 2 at a time until all pairs are matched.
* Emojis used: 🎉, 🎊, 🎈, 🎁, 🎂, 🎆, 🎇, ✨

When all 16 cards are matched:

* Estimate `totalFlips` (roughly number of moves).
* **Base reward:** 1000
* **Performance bonus:** `max(0, 1000 − totalFlips × 5)`
  (fewer moves ⇒ bigger bonus)
* **Prestige multiplier:** `1 + 0.25 × prestigeLevel`
* **Energy gained:**

  > `energyReward = floor((baseReward + performanceBonus) × prestigeMultiplier)`

* This is added to **Energy** resource.

### 9.7 Reaction Test → Happiness

* **Game:** Wait, then click when the signal arrives.
* Setup:
  * You enter a waiting state.
  * After 2–5 seconds (random), it signals you to click.
* On click, if you clicked after the signal:
  * Compute **reactionTime** in ms.
  * Happiness reward tiers:

    | Reaction Time | Happiness Reward |
    | ------------- | ---------------: |
    | < 200 ms      |              800 |
    | 200–299 ms    |              700 |
    | 300–499 ms    |              600 |
    | 500–799 ms    |              500 |
    | ≥ 800 ms      |              200 |

  * Apply prestige multiplier: `× (1 + 0.25 × prestigeLevel)`.
  * Result is added to **Happiness** resource.

If you click too early (before the signal), you get a warning and no reward.

---

## 10. Fortunes & Special Events

### 10.1 Fortune Cookie 🥠

* Every time `totalClicks` is a multiple of **200** and no fortune is showing:
  * A **random fortune** is picked from a themed list (debugging, git, AI, etc.).
  * A fortune banner appears for ~6 seconds.
* Fortunes are **cosmetic only** – they do **not** change celebrations.

**Fortune List:**

* "You will find a bug in production soon... oh wait, wrong fortune!"
* "Your code will compile on the first try."
* "Beware of semicolons in unexpected places."
* "A mysterious stranger will star your GitHub repo."
* "Your next deploy will be on a Friday at 5pm."
* "The universe is just a giant callback function."
* "Tomorrow you will remember to fetch before pulling."
* "Your debugging skills will be tested by a missing comma."
* "The answer you seek is in the console.log."
* "You can't spell celebration without AI."

### 10.2 Rhythmic Clicking Bonus

The system tracks your last few click timestamps:

* If you have at least 5 clicks, it computes the intervals.
* If all intervals are close to each other (within ~100 ms) and between **200–600 ms**:
  * You're considered to be clicking **in rhythm**.
  * Effect:
    * You get **+500 celebrations** added to your local count.
    * An event message appears ("Perfect rhythm! Bonus celebrations!").
    * The click pattern buffer is cleared.

---

## 11. Achievements 🏆

Achievements are objects with:

* `id`, `name`
* `description`
* `reward` (a one-time celebrations bonus)
* `condition(stats)`

### 11.1 Achievement List

| ID              | Name                | Description                       | Reward | Condition                      |
| --------------- | ------------------- | --------------------------------- | -----: | ------------------------------ |
| `first-click`   | Getting Started     | Make your first click             |     10 | totalClicks ≥ 1                |
| `hundred-clicks`| Warming Up          | Click 100 times                   |    100 | totalClicks ≥ 100              |
| `thousand-clicks`| Click Master       | Click 1,000 times                 |   1000 | totalClicks ≥ 1000             |
| `first-crit`    | Critical Hit!       | Get your first critical hit       |     50 | criticalHits ≥ 1               |
| `crit-master`   | Crit Master         | Get 100 critical hits             |   5000 | criticalHits ≥ 100             |
| `golden-hunter` | Golden Hunter       | Catch 10 golden celebrations      |   2000 | goldenCelebsCaught ≥ 10        |
| `combo-5`       | Combo Starter       | Achieve a 5x combo                |    500 | comboHighScore ≥ 5             |
| `combo-20`      | Combo Expert        | Achieve a 20x combo               |   5000 | comboHighScore ≥ 20            |
| `combo-50`      | Combo Legend        | Achieve a 50x combo               |  50000 | comboHighScore ≥ 50            |
| `prestige-1`    | First Prestige      | Prestige for the first time       |  10000 | prestigeLevel ≥ 1              |
| `dedicated`     | Dedicated Player    | Play for 1 hour total             |  10000 | timePlayedSeconds ≥ 3600       |

### 11.2 Achievement Mechanics

When condition first becomes true:

1. Achievement is marked **unlocked**.
2. You gain **+reward** celebrations.
3. A popup appears for ~4 seconds showing:
   * The achievement name, description.
   * `+<reward> celebrations`.

---

## 12. Badges Tied to Party Module

From the shared **badges system**:

Relevant badges:

* **Party Animal**
  * Description: "Celebrated 100 times."
  * Condition: Global `celebrateCount ≥ 100`.
  * Threshold = **100**.

* **Party Seeker**
  * Description: "Found the secret celebration page."
  * Unlocked when you discover/visit the secret celebration route.
  * Unlocks automatically on page load.

The badge system watches `celebrateCount` and automatically unlocks any badge with a `threshold` when that number is reached.

---

## 13. Prestige System

Prestige lets you **reset your progress** for permanent bonuses.

### 13.1 Requirement

To prestige:

> **Required celebrations** = `1,000,000 × 10^(prestigeLevel)`

* Prestige 0 → need 1,000,000 celebrations.
* Prestige 1 → need 10,000,000.
* Prestige 2 → 100,000,000, etc.

When you have at least this many celebrations, you can press a Prestige button. A confirmation warns you that you'll **lose**:

* All local celebrations (resets to 0).
* All upgrades you bought.
* All factory resources.

You **keep**:

* Prestige level (increases by 1).
* Badges.
* Achievements (and their rewards already applied).
* Historical stats (with prestigeLevel incremented in stats).

### 13.2 Prestige Benefits

Each prestige grants:

* **+10% click power** permanently (stacking):
  * via `1 + 0.10 × prestigeLevel`.
* **+5% production (CPS)** permanently:
  * via `1 + 0.05 × prestigeLevel`.
* **+25% factory production speed**:
  * Production rate multiplied by `1 + 0.25 × prestigeLevel`.
* **+25% factory resource rewards from minigames**:
  * All minigame rewards multiplied by `1 + 0.25 × prestigeLevel`.
* **More crit chance**:
  * +1% crit chance per prestige (base 10% + 1% per prestige).
* **Better crit multiplier**:
  * `2 + 0.5 × prestigeLevel`.

---

## 14. Secrets & Konami Code

### 14.1 Konami Code

The page listens for a **Konami-like code** via keyboard:

* **Code sequence**: `↑ ↑ ↓ ↓ ← → ← → B A`
* When correctly entered:
  * `secretUnlocked` is set to `true`.
  * You get an event message: **"KONAMI CODE UNLOCKED! You are a legend!"**
  * Your **local celebrations are multiplied by 10** (×10).
  * A huge confetti burst triggers (20 bursts with random positions and rainbow colors).
* In the Stats panel, an extra row appears:
  > 🎮 Konami Code: ✓ UNLOCKED

### 14.2 Secret Celebration Page (Party Seeker Badge)

Visiting the hidden / special celebration route at least once unlocks the **"Party Seeker"** badge. Functionally, this is more of a **meta secret** than a numeric modifier, but it is part of the Party experience.

---

## 15. Visual Effects & UI

### 15.1 Weather Visual Effects

Each weather type has associated visual effects:

* **Rainy** (🌧️): Animated rain overlay
* **Snowy** (❄️): Animated snow overlay
* **Stormy** (⛈️): Animated storm effects
* **Foggy** (🌫️): Fog overlay
* **Windy** (💨): Wind animation
* **Sunny** (☀️): No overlay (default bright)

### 15.2 Background Effects

* **Earthquake event**: Triggers a screen shake effect for 2 seconds
* **Weather effects**: Applied as CSS classes to the page container

### 15.3 Confetti Colors

* **Default**: `['#00cccc', '#0088cc', '#00cc66', '#ff6b6b', '#ffd93d']`
* **Rainbow event**: Changes to one of 4 color palettes (see Rainbow Event Details)
* **Golden celebrations**: Special golden confetti with colors `['#FFD700', '#FFA500', '#FFFF00']`

### 15.4 Combo Visual Feedback

* When combo > 10, the celebrate button gets a `combo-active` class
* The button displays combo count in real-time
* Confetti particle count increases with combo: `min(30 + combo × 2, 100)`
* Confetti spread increases with combo: `50 + combo × 2`

---

## 16. UI Structure (Conceptual)

On the Celebrate page, you'll see:

* **Main Celebrate Button**
  * Shows combo state (e.g., if combo > 10, it gets a "combo-active" class).
  * Displays active power-up icons.

* **Counters & Stats Panel**
  * Local celebrations count.
  * CPS readout (affected by weather).
  * Total clicks, crits, golden catches, best combo, time played.
  * Konami status when unlocked.

* **Conditions Display**
  * Current weather with emoji and multiplier percentage.
  * Current mood with emoji and multiplier percentage.

* **Upgrades Panel**
  * List of upgrades, cost, CPS, "owned".
  * Buy buttons (disabled when you can't afford).
  * Factory upgrade shows "Manage Factory" button when owned.

* **Power-Up Bar**
  * Active power-ups with remaining duration.
  * Hover to see full details.

* **Factory Button & Modal**
  * Shows current target upgrade, progress %, resource counts, and minigame launch buttons.
  * Production progress bar.
  * Resource requirements display.

* **Overlays for Minigames**
  * Whack-a-mole grid (3×3).
  * Memory cards grid (4×4).
  * Reaction box with timing instructions.

* **Golden Stars & Overlays**
  * Golden stars floating on the main play area.
  * Show value on hover.

* **Fortune Cookie Banner**
  * Appears at top/middle of screen.

* **Party Guest Popup**
  * Shows guest emoji, name, message, and gift amount.

* **Event Messages**
  * Temporary messages showing random events, achievements, etc.

* **Achievement Popups**
  * Full-screen overlay with achievement details.

* **Badge Toasts** (coming from the shared badge overlay component).

* **Prestige Button**
  * Always visible at top of upgrades section.
  * Shows required amount.
  * Disabled until requirement met.

---

## 17. Persistence & Storage

All data is stored in `localStorage` with the following keys:

* `personal-website::celebrate-upgrades` - Array of all upgrades with owned counts
* `personal-website::celebrate-local-count` - Current celebration count
* `personal-website::celebrate-last-synced` - Last synced global count
* `personal-website::celebrate-stats` - Game statistics object
* `personal-website::celebrate-achievements` - Achievement unlock states
* `personal-website::celebrate-prestige` - Current prestige level

Data persists between sessions on the same device/browser.

---

## 18. Game Progression Path

### Early Game (0 - 1M celebrations)
1. Manual clicking to get first few upgrades
2. Unlock Ryan (first auto-clicker)
3. Build combo chains for bonus multipliers
4. Watch for golden celebrations
5. Unlock first achievements
6. Experience random events
7. Build up to Neural Networker and Party Bot

### Mid Game (1M - 10M celebrations)
1. First prestige at 1M
2. Permanent bonuses make rebuilding faster
3. Unlock higher-tier upgrades (Event Loop, Quantum Compartier)
4. Random events become more impactful with higher base counts
5. Farm golden celebrations for boosts
6. Multiple prestiges for stacking bonuses

### Late Game (10M+ celebrations)
1. Unlock Celebration Factory
2. Play minigames to earn resources
3. Manufacture upgrades through factory system
4. High prestige levels make minigames very rewarding
5. Multiple prestige runs for exponential growth
6. Optimize factory production targets

### End Game
1. Max out all upgrades through factory
2. High prestige levels (5+)
3. Unlock all achievements
4. Experience rare random events (Jackpot, Midas, Santa)
5. Push for high combo records
6. Explore secret Konami code
