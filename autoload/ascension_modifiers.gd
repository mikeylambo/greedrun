extends Node

## Difficulty Ascension dials. Every number a designer should tune lives in TABLE.
## Rows are Ascension 1-10; Ascension 0 (normal) returns DEFAULTS.

const MAX_LEVEL := 10

## Sentinel for hunter_heat_delta: the Bounty Hunter is inside from the opening second.
const HUNTER_FROM_START := -999

const DEFAULTS := {
	"guard_speed_mult": 1.0,
	"guard_detr_mult": 1.0,
	"heat_floor_add": 0,
	"hunter_heat_delta": 0,
	"payout_mult": 1.0,
}

const COLUMNS: Array[String] = [
	"guard_speed_mult", "guard_detr_mult", "heat_floor_add", "hunter_heat_delta", "payout_mult"
]

# One row per Ascension level 1-10, columns as listed above. Starting values — tune here.
const TABLE: Array[Array] = [
	[1.03, 1.05, 0, 0, 1.15],  # 1
	[1.05, 1.10, 0, 0, 1.30],  # 2
	[1.07, 1.16, 1, 1, 1.50],  # 3
	[1.09, 1.22, 1, 1, 1.70],  # 4
	[1.11, 1.28, 1, 1, 1.95],  # 5
	[1.14, 1.34, 2, 2, 2.20],  # 6
	[1.16, 1.40, 2, 2, 2.45],  # 7
	[1.18, 1.46, 2, 2, 2.70],  # 8
	[1.20, 1.52, 3, 3, 3.00],  # 9
	[1.22, 1.58, 3, HUNTER_FROM_START, 3.40],  # 10
]


func modifiers_for(level: int) -> Dictionary:
	if level <= 0:
		return DEFAULTS
	var row: Array = TABLE[clampi(level, 1, MAX_LEVEL) - 1]
	var bundle := {}
	for i in range(COLUMNS.size()):
		bundle[COLUMNS[i]] = row[i]
	return bundle


func payout_mult(level: int) -> float:
	return float(modifiers_for(level).payout_mult)


func hunter_from_start(level: int) -> bool:
	return int(modifiers_for(level).hunter_heat_delta) == HUNTER_FROM_START


## Highest ascension the player may select. Ascension 1 opens when the meta is
## fully maxed (see Progression.is_meta_maxed); clearing level N unlocks N+1.
func highest_unlocked() -> int:
	var saved := MetaSave.ascension_level()
	if saved == 0 and Progression.is_meta_maxed():
		return 1
	return mini(saved, MAX_LEVEL)


func summary(level: int) -> String:
	if level <= 0:
		return "Standard vault. No modifiers."
	var m := modifiers_for(level)
	var parts: Array[String] = []
	parts.append("guards +%d%% speed" % roundi((float(m.guard_speed_mult) - 1.0) * 100.0))
	parts.append("+%d%% sight" % roundi((float(m.guard_detr_mult) - 1.0) * 100.0))
	if int(m.heat_floor_add) > 0:
		parts.append("+%d starting Heat" % int(m.heat_floor_add))
	if int(m.hunter_heat_delta) == HUNTER_FROM_START:
		parts.append("the Hunter waits inside")
	elif int(m.hunter_heat_delta) > 0:
		parts.append("Hunter %d tier(s) sooner" % int(m.hunter_heat_delta))
	parts.append("payout ×%.2f" % float(m.payout_mult))
	return " · ".join(parts)
