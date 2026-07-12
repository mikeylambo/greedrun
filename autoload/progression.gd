extends Node

const UPGRADES: Array[Dictionary] = [
	{
		"id": "feet",
		"name": "Quick Feet",
		"base": 650,
		"max": 5,
		"description": "+11% base movement speed per level."
	},
	{
		"id": "straps",
		"name": "Reinforced Straps",
		"base": 750,
		"max": 5,
		"description": "Weight drags Jo down less with each level."
	},
	{
		"id": "boots",
		"name": "Muffled Boots",
		"base": 650,
		"max": 5,
		"description": "Carried loot creates less noise."
	},
	{
		"id": "pockets",
		"name": "Deep Pockets",
		"base": 850,
		"max": 4,
		"description": "Raise the minimum speed under a heavy load."
	},
	{
		"id": "contacts",
		"name": "Guild Contacts",
		"base": 900,
		"max": 5,
		"description": "+8% from every buyer per level."
	},
	{
		"id": "luck",
		"name": "Thief's Luck",
		"base": 1200,
		"max": 3,
		"description": "+1 starting heart per level."
	},
	{
		"id": "cool",
		"name": "Cool Head",
		"base": 1100,
		"max": 3,
		"description": "Start jobs one Heat tier calmer per level."
	},
	{
		"id": "revive",
		"name": "Second Wind",
		"base": 2200,
		"max": 1,
		"description": "Once per run, a fatal hit leaves Jo at one heart."
	},
	{
		"id": "landing",
		"name": "Cat's Landing",
		"base": 1100,
		"max": 1,
		"description": "Ledge drops are silent and safe."
	},
	{
		"id": "scanner",
		"name": "Treasure Sense",
		"base": 1500,
		"max": 1,
		"description": "Reveal the Vault Heart from the start."
	},
]

const TROPHIES: Array[Dictionary] = [
	{
		"id": "idol",
		"kind": "loud",
		"name": "Golden Idol",
		"passive": "Merchant's Eye",
		"base": 900,
		"max": 5
	},
	{
		"id": "relic",
		"kind": "cursed",
		"name": "Marked Relic",
		"passive": "Iron Nerve",
		"base": 1000,
		"max": 5
	},
	{
		"id": "jewel",
		"kind": "living",
		"name": "Skitterjewel",
		"passive": "Quick Hands",
		"base": 800,
		"max": 5
	},
	{
		"id": "relicart",
		"kind": "artifact",
		"name": "Bound Relic",
		"passive": "Fortune's Cache",
		"base": 1100,
		"max": 5
	},
	{
		"id": "heart",
		"kind": "mythic",
		"name": "Vault Heart",
		"passive": "Vault-Sense",
		"base": 1500,
		"max": 5
	},
]

const KIND_TROPHY := {
	"loud": "idol",
	"cursed": "relic",
	"living": "jewel",
	"artifact": "relicart",
	"mythic": "heart",
}


## The Ascension unlock trigger. "Maxed" currently means every upgrade AND every
## Collection trophy at max level — edit this function to change that definition.
func is_meta_maxed() -> bool:
	for upgrade: Dictionary in UPGRADES:
		if MetaSave.upgrade_level(str(upgrade.id)) < int(upgrade.max):
			return false
	for trophy: Dictionary in TROPHIES:
		if MetaSave.collection_level(str(trophy.id)) < int(trophy.max):
			return false
	return true


func upgrade_by_id(id: String) -> Dictionary:
	for upgrade: Dictionary in UPGRADES:
		if upgrade.id == id:
			return upgrade
	return {}


func trophy_by_id(id: String) -> Dictionary:
	for trophy: Dictionary in TROPHIES:
		if trophy.id == id:
			return trophy
	return {}


func upgrade_cost(upgrade: Dictionary) -> int:
	return roundi(float(upgrade.base) * pow(1.55, MetaSave.upgrade_level(str(upgrade.id))))


func restore_cost(trophy: Dictionary) -> int:
	return roundi(
		float(trophy.base) * pow(1.5, max(0, MetaSave.collection_level(str(trophy.id)) - 1))
	)


func move_speed() -> float:
	return 171.0 * (1.0 + 0.11 * MetaSave.upgrade_level("feet"))


func max_hp() -> int:
	return 3 + MetaSave.upgrade_level("luck")


func speed_with_weight(weight: float) -> float:
	var strap_multiplier := 0.011 * maxf(0.32, 1.0 - 0.14 * MetaSave.upgrade_level("straps"))
	var cap_penalty := maxf(0.34, 0.66 - 0.07 * MetaSave.upgrade_level("pockets"))
	var penalty := clampf(weight * strap_multiplier, 0.0, cap_penalty)
	return move_speed() * (1.0 - penalty)


func effective_noise(noise: float, muffled: bool = false) -> float:
	if muffled:
		return 0.0
	return noise * maxf(0.2, 1.0 - 0.18 * MetaSave.upgrade_level("boots"))


func detection_multiplier() -> float:
	return maxf(0.55, 1.0 - 0.06 * MetaSave.collection_level("relic"))


func pickup_bonus() -> float:
	return 6.0 * MetaSave.collection_level("jewel")


func sell_multiplier() -> float:
	return (
		1.0 + 0.08 * MetaSave.upgrade_level("contacts") + 0.03 * MetaSave.collection_level("idol")
	)


func collection_gold_multiplier() -> float:
	return 1.0 + 0.04 * MetaSave.collection_level("relicart")


func danger_heart_bonus() -> float:
	return 0.05 * MetaSave.collection_level("heart")


func effect_label(id: String, level: int) -> String:
	var label := ""
	match id:
		"feet":
			label = "+%d%% speed" % (11 * level)
		"straps":
			label = "%d%% less drag" % (14 * level)
		"boots":
			label = "%d%% quieter" % (18 * level)
		"pockets":
			var penalty_cap := maxf(0.34, 0.66 - 0.07 * level)
			var floor_percent := roundi((1.0 - penalty_cap) * 100.0)
			label = "%d%% minimum speed" % floor_percent
		"contacts":
			label = "+%d%% from buyers" % (8 * level)
		"luck":
			label = "+%d hearts" % level
		"cool":
			label = "-%d starting Heat" % level
		"revive":
			label = "one fatal-hit rescue" if level > 0 else "locked"
		"landing":
			label = "silent, safe drops" if level > 0 else "locked"
		"scanner":
			label = "Heart revealed" if level > 0 else "locked"
	return label


func trophy_effect_label(id: String, level: int) -> String:
	match id:
		"idol":
			return "+%d%% from every buyer" % (3 * level)
		"relic":
			return "guards spot Jo %d%% later" % (6 * level)
		"jewel":
			return "+%d pickup reach" % (6 * level)
		"relicart":
			return "+%d%% on all gold" % (4 * level)
		"heart":
			return "+%d%% danger bonus" % (5 * level)
	return ""
