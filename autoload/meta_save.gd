extends Node

signal changed

const SAVE_PATH := "user://greedrun.save"

var data: Dictionary = {}


func _ready() -> void:
	load_save()


func default_data() -> Dictionary:
	return {
		"gold": 0,
		"runs": 0,
		"best_haul": 0,
		"notoriety": 0,
		"ascension_level": 0,
		"best_by_ascension": {},
		"daily":
		{
			"last_played_key": "",
			"last_score": 0,
			"best_daily": 0,
			"streak": 0,
		},
		"upgrades":
		{
			"straps": 0,
			"boots": 0,
			"feet": 0,
			"luck": 0,
			"landing": 0,
			"scanner": 0,
			"pockets": 0,
			"contacts": 0,
			"cool": 0,
			"revive": 0,
		},
		"collection":
		{
			"idol": 0,
			"relic": 0,
			"jewel": 0,
			"relicart": 0,
			"heart": 0,
		},
	}


func load_save() -> void:
	data = default_data()
	if not FileAccess.file_exists(SAVE_PATH):
		changed.emit()
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		changed.emit()
		return
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	if parsed is Dictionary:
		_merge_dictionary(data, parsed)
	changed.emit()


func _merge_dictionary(target: Dictionary, source: Dictionary) -> void:
	for key: Variant in source.keys():
		if target.has(key) and target[key] is Dictionary and source[key] is Dictionary:
			var target_child: Dictionary = target[key]
			var source_child: Dictionary = source[key]
			_merge_dictionary(target_child, source_child)
			target[key] = target_child
		else:
			target[key] = source[key]


func save() -> void:
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		push_warning("Greedrun: could not open save path for writing.")
		return
	file.store_string(JSON.stringify(data, "\t"))
	changed.emit()


func reset() -> void:
	data = default_data()
	save()


func gold() -> int:
	return int(data.get("gold", 0))


func add_gold(amount: int) -> void:
	data["gold"] = max(0, gold() + amount)


func spend_gold(amount: int) -> bool:
	if gold() < amount:
		return false
	data["gold"] = gold() - amount
	return true


func notoriety() -> int:
	return int(data.get("notoriety", 0))


func add_notoriety(delta: int) -> void:
	data["notoriety"] = clampi(notoriety() + delta, 0, 10)


func ascension_level() -> int:
	return int(data.get("ascension_level", 0))


func set_ascension_level(level: int) -> void:
	data["ascension_level"] = clampi(level, 0, AscensionModifiers.MAX_LEVEL)


func ascension_best(level: int) -> int:
	return int(data.get("best_by_ascension", {}).get(str(level), 0))


func record_ascension_best(level: int, score: int) -> bool:
	if level < 1 or score <= ascension_best(level):
		return false
	data["best_by_ascension"][str(level)] = score
	return true


func upgrade_level(id: String) -> int:
	return int(data.get("upgrades", {}).get(id, 0))


func set_upgrade_level(id: String, level: int) -> void:
	data["upgrades"][id] = max(0, level)


func collection_level(id: String) -> int:
	return int(data.get("collection", {}).get(id, 0))


func set_collection_level(id: String, level: int) -> void:
	data["collection"][id] = max(0, level)
