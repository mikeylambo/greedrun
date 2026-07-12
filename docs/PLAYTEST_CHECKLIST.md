# First Godot 4.7 Playtest Checklist

## A. Boot certification

- [ ] Open `project.godot` without import or parser errors.
- [ ] Press F5 and reach the JO: GREEDRUN title screen.
- [ ] Enter the Hideout; confirm starting bank is $0 and notoriety is 0.
- [ ] Open and close Upgrades, Collection, Contracts and How to Play.

## B. First free run

- [ ] Start a Free Run.
- [ ] Move with WASD and arrow keys.
- [ ] Camera follows Jo and never reveals beyond the world boundary.
- [ ] Walk into walls; collision blocks Jo cleanly.
- [ ] Collect a coin and gem; haul and load HUD update.
- [ ] Collect a loud item; feedback reports that the vault heard it.
- [ ] Confirm heavier loot visibly enlarges Jo's bag and slows movement.

## C. Stealth and enemy behavior

- [ ] Enter guard range with clear line of sight; guard chases and Heat pressure rises.
- [ ] Break line of sight; guard investigates the last known position, then resumes patrol.
- [ ] Trigger a sentry cone; an alarm wakes nearby guards.
- [ ] Reach the hunter threshold; a bounty hunter enters the run.
- [ ] Take damage; one heart is removed and brief invulnerability prevents immediate multi-hit loss.

## D. Loot personalities

- [ ] Chase and collect the moving Skitterjewel.
- [ ] Touch Crown Jewels; elite guards enter.
- [ ] Collect Porcelain Relic, then take a hit; the relic shatters and leaves the haul.
- [ ] Collect a Marked Relic; Heat jumps.
- [ ] Touch a branching artifact and test each choice over separate runs.
- [ ] Verify sense reveals the Vault Heart, ghost grants six seconds of safety, and muffle removes carried noise.

## E. Verticality

- [ ] Enter a raised platform only through its stairs.
- [ ] Guards remain below unless the bounty hunter is active.
- [ ] Leave by the stairs without a drop penalty.
- [ ] Step off another edge with a light load; no penalty.
- [ ] Repeat with a medium load; nearby guards investigate.
- [ ] Repeat with a very heavy load; Jo loses a heart.
- [ ] Buy Cat's Landing later and confirm drops become safe and silent.

## F. Signature extraction loop

- [ ] Return to the portal with any nonzero haul.
- [ ] ONE MORE THING? appears.
- [ ] Choose Leave; run resolves immediately with the current haul.
- [ ] On another run choose Stay Greedy; Vault Heart reveals and guards become aggressive.
- [ ] Return and hold E; extraction completes after the hold duration.
- [ ] Empty the entire vault on a later run; VAULT CLEARED appears and perfect-heist pressure activates.

## G. Contracts

Complete or intentionally fail each family:

- [ ] Smuggling Run / quota
- [ ] Silent Job
- [ ] Contract Theft
- [ ] Clean Sweep
- [ ] Timed Raid
- [ ] Recovery Job
- [ ] Legendary Heist / Vault Heart
- [ ] Ghost Job / untouched
- [ ] Bounty Run / high Heat

## H. Fence and progression

- [ ] Extract ordinary coin/gems; they auto-sell.
- [ ] Extract notable goods; buyer selection appears.
- [ ] Compare Black Market, Noble and Syndicate payouts.
- [ ] Return marked goods; notoriety falls.
- [ ] Keep an eligible treasure; its Collection pedestal activates.
- [ ] Restore an owned trophy and confirm its passive level changes.
- [ ] Buy an upgrade and verify gold is deducted and the level persists.
- [ ] Close/reopen the project; bank, upgrades, trophies, runs and notoriety persist.

## I. Touch smoke test

- [ ] Run on a touchscreen-capable target or emulate touch events.
- [ ] Left drag controls movement with analog magnitude.
- [ ] Right hold controls extraction.
- [ ] Touch controls reset after a run and do not remain stuck under menus.
