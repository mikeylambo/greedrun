extends Node
## Difficulty Ascension modifier bundle. Given a level 1-10, returns the run
## modifiers that harden the vault and raise the payout. Level 0 is a standard
## run and returns an identity bundle (no change to base difficulty or economy).
##
## These are the STARTING VALUES to be tuned by hand — the entire dial surface is
## the TABLE below. Consumers only ever read the bundle; they never branch on level.

const MAX_LEVEL := 10

## Sentinel for A10: the Hunter is present from the opening second rather than
## entering at a heat threshold. Kept explicit so it never reads as a magic number.
const HUNTER_FROM_START := -1

## One row per level 1-10. Columns match the ascension spec's modifier table.
const TABLE: Array[Dictionary] = [
	{
		"guard_speed_mult": 1.03,
		"guard_detr_mult": 1.05,
		"heat_floor_add": 0,
		"hunter_heat_delta": 0,
		"payout_mult": 1.15
	},
	{
		"guard_speed_mult": 1.05,
		"guard_detr_mult": 1.10,
		"heat_floor_add": 0,
		"hunter_heat_delta": 0,
		"payout_mult": 1.30
	},
	{
		"guard_speed_mult": 1.07,
		"guard_detr_mult": 1.16,
		"heat_floor_add": 1,
		"hunter_heat_delta": 1,
		"payout_mult": 1.50
	},
	{
		"guard_speed_mult": 1.09,
		"guard_detr_mult": 1.22,
		"heat_floor_add": 1,
		"hunter_heat_delta": 1,
		"payout_mult": 1.70
	},
	{
		"guard_speed_mult": 1.11,
		"guard_detr_mult": 1.28,
		"heat_floor_add": 1,
		"hunter_heat_delta": 1,
		"payout_mult": 1.95
	},
	{
		"guard_speed_mult": 1.14,
		"guard_detr_mult": 1.34,
		"heat_floor_add": 2,
		"hunter_heat_delta": 2,
		"payout_mult": 2.20
	},
	{
		"guard_speed_mult": 1.16,
		"guard_detr_mult": 1.40,
		"heat_floor_add": 2,
		"hunter_heat_delta": 2,
		"payout_mult": 2.45
	},
	{
		"guard_speed_mult": 1.18,
		"guard_detr_mult": 1.46,
		"heat_floor_add": 2,
		"hunter_heat_delta": 2,
		"payout_mult": 2.70
	},
	{
		"guard_speed_mult": 1.20,
		"guard_detr_mult": 1.52,
		"heat_floor_add": 3,
		"hunter_heat_delta": 3,
		"payout_mult": 3.00
	},
	{
		"guard_speed_mult": 1.22,
		"guard_detr_mult": 1.58,
		"heat_floor_add": 3,
		"hunter_heat_delta": HUNTER_FROM_START,
		"payout_mult": 3.40
	},
]


## Identity bundle for a standard (level 0) run.
func _identity() -> Dictionary:
	return {
		"guard_speed_mult": 1.0,
		"guard_detr_mult": 1.0,
		"heat_floor_add": 0,
		"hunter_heat_delta": 0,
		"payout_mult": 1.0,
		"hunter_from_start": false,
	}


## Full modifier bundle for a level. Level <= 0 is a standard run. The A10
## HUNTER_FROM_START sentinel is resolved here into an explicit hunter_from_start
## flag with a neutral (0) heat delta, so consumers never see the sentinel.
func modifiers(level: int) -> Dictionary:
	if level <= 0:
		return _identity()
	var row: Dictionary = TABLE[clampi(level, 1, MAX_LEVEL) - 1].duplicate()
	row["hunter_from_start"] = int(row["hunter_heat_delta"]) == HUNTER_FROM_START
	if bool(row["hunter_from_start"]):
		row["hunter_heat_delta"] = 0
	return row


## Convenience for the one clean payout multiply at the end of the economy math.
func payout_mult(level: int) -> float:
	return float(modifiers(level)["payout_mult"])
