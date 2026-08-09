class_name GreedrunVault
extends Node2D

signal hud_changed(snapshot: Dictionary)
signal toast_requested(message: String)
signal one_more_requested(carry_value: int)
signal artifact_decision_requested(data: Dictionary)
signal run_finished(result: Dictionary)

const PLAYER_SCENE := preload("res://scenes/Player.tscn")
const LOOT_SCENE := preload("res://scenes/Loot.tscn")
const GUARD_SCENE := preload("res://scenes/Guard.tscn")
const SENTRY_SCENE := preload("res://scenes/Sentry.tscn")
const PORTAL_SCENE := preload("res://scenes/Portal.tscn")

const LOOT_TYPES := {
	"coin":
	{
		"name": "Loose Coin",
		"value": 60,
		"weight": 1.0,
		"noise": 0.0,
		"marked": 0.0,
		"kind": "common"
	},
	"gem":
	{
		"name": "Cut Gem",
		"value": 170,
		"weight": 2.0,
		"noise": 1.0,
		"marked": 0.0,
		"kind": "valuable"
	},
	"idol":
	{
		"name": "Golden Idol",
		"value": 460,
		"weight": 5.0,
		"noise": 4.0,
		"marked": 0.0,
		"kind": "loud"
	},
	"mask":
	{
		"name": "Marked Relic",
		"value": 900,
		"weight": 6.0,
		"noise": 2.0,
		"marked": 3.0,
		"kind": "cursed"
	},
	"living":
	{
		"name": "Skitterjewel",
		"value": 380,
		"weight": 3.0,
		"noise": 2.0,
		"marked": 0.0,
		"kind": "living"
	},
	"royal":
	{
		"name": "Crown Jewels",
		"value": 720,
		"weight": 5.0,
		"noise": 3.0,
		"marked": 0.0,
		"kind": "royal"
	},
	"fragile":
	{
		"name": "Porcelain Relic",
		"value": 560,
		"weight": 2.0,
		"noise": 0.0,
		"marked": 0.0,
		"kind": "fragile"
	},
	"heart":
	{
		"name": "Vault Heart",
		"value": 2600,
		"weight": 11.0,
		"noise": 6.0,
		"marked": 6.0,
		"kind": "mythic"
	},
}

const ARTIFACTS: Array[Dictionary] = [
	{"name": "The Gilded Debt", "flavor": "Gold that remembers who owes it."},
	{"name": "The Baron's Ransom", "flavor": "Paid once. Worth stealing twice."},
	{"name": "Crown of Seven Debts", "flavor": "Every jewel is a promise someone broke."},
	{"name": "The Usurer's Lantern", "flavor": "It only lights the way to what you owe."},
	{"name": "The Empty Throne", "flavor": "Whoever sat here always wanted one more thing."},
]
const BOONS := ["sense", "ghost", "muffle"]
const THEMES := {
	"treasury":
	{
		"name": "Sunken Treasury",
		"floor": Color("#17150f"),
		"wall": Color("#534323"),
		"grid": Color("#292318"),
		"platform": Color("#302919")
	},
	"fortress":
	{
		"name": "Cliffside Fortress",
		"floor": Color("#15171a"),
		"wall": Color("#4d5159"),
		"grid": Color("#23272d"),
		"platform": Color("#2b3037")
	},
	"undercity":
	{
		"name": "Undercity Vaults",
		"floor": Color("#111719"),
		"wall": Color("#31505a"),
		"grid": Color("#1b2a2f"),
		"platform": Color("#20363c")
	},
	"mint":
	{
		"name": "Old Mint",
		"floor": Color("#181510"),
		"wall": Color("#61513a"),
		"grid": Color("#2b2419"),
		"platform": Color("#382e20")
	},
}

var rng := RandomNumberGenerator.new()
var run_seed := 0
var active_contract: Dictionary = {}
var world_size := Vector2(2400, 1700)
var world_bounds := Rect2()
var current_theme: Dictionary = THEMES.treasury
var walls: Array[Rect2] = []
var platforms: Array[Dictionary] = []
var loot_items: Array[GreedrunLoot] = []
var guards: Array[GreedrunGuard] = []
var sentries: Array[GreedrunSentry] = []
var player: GreedrunPlayer
var portal: GreedrunPortal

var carried_value := 0
var carried_weight := 0.0
var carried_noise := 0.0
var carried_marked := 0.0
var heat_tier := 0
var peak_heat := 0
var heat_seed := 0
var ascension_level := 0
var ascension: Dictionary = AscensionModifiers.modifiers(0)
var alarm_heat_bonus := 0
var forced_heat_floor := 0
var run_clock := 0.0
var run_time_limit := 0.0
var extract_hold := 0.0
var touch_vector := Vector2.ZERO
var touch_extract := false
var run_paused := false
var run_spotted := false
var run_damaged := false
var low_noise_run := true
var noise_muffled := false
var vault_cleared := false
var one_more_seen := false
var heart_revealed := false
var hunter_spawned := false
var pending_artifact: GreedrunLoot
var finished := false

func _ready() -> void:
	z_as_relative = false


func start_run(contract: Dictionary = {}, seed_value: int = 0) -> void:
	active_contract = contract.duplicate(true)
	run_seed = (
		seed_value if seed_value != 0 else int(Time.get_unix_time_from_system() * 1000.0) ^ randi()
	)
	rng.seed = run_seed
	world_size = Vector2(rng.randi_range(2300, 3200), rng.randi_range(1550, 2200))
	world_bounds = Rect2(Vector2.ZERO, world_size)
	var theme_key := str(active_contract.get("theme_key", ""))
	if theme_key.is_empty() or not THEMES.has(theme_key):
		var keys := THEMES.keys()
		theme_key = str(keys[rng.randi_range(0, keys.size() - 1)])
	current_theme = THEMES[theme_key]
	run_time_limit = float(active_contract.get("time_limit", 0.0))
	ascension_level = GameState.ascension_level
	ascension = AscensionModifiers.modifiers(ascension_level)
	heat_seed = clampi(floori(MetaSave.notoriety() / 2.0) - MetaSave.upgrade_level("cool"), 0, 3)
	heat_seed += int(ascension["heat_floor_add"])
	_generate_world()
	_recompute_load()
	if bool(ascension["hunter_from_start"]) and not hunter_spawned:
		_spawn_hunter()
	_emit_hud()


func _generate_world() -> void:
	walls.clear()
	platforms.clear()
	loot_items.clear()
	guards.clear()
	sentries.clear()
	for child in get_children():
		child.queue_free()
	var thickness := 44.0
	walls.append(Rect2(0, 0, world_size.x, thickness))
	walls.append(Rect2(0, world_size.y - thickness, world_size.x, thickness))
	walls.append(Rect2(0, 0, thickness, world_size.y))
	walls.append(Rect2(world_size.x - thickness, 0, thickness, world_size.y))
	_generate_layout()
	_generate_platforms()
	for wall: Rect2 in walls:
		_add_wall_body(wall)
	portal = PORTAL_SCENE.instantiate()
	add_child(portal)
	portal.position = Vector2(150, world_size.y * 0.5)
	player = PLAYER_SCENE.instantiate()
	add_child(player)
	player.position = Vector2(190, world_size.y * 0.5)
	player.setup(world_bounds, platforms)
	player.ledge_dropped.connect(_on_player_drop)
	player.died.connect(_on_player_died)
	_spawn_loot()
	_spawn_guards()
	_spawn_sentries()
	queue_redraw()


func _generate_layout() -> void:
	var layout := rng.randi_range(0, 3)
	var safe_left := 340.0
	if layout == 0:
		for x_index in range(5):
			for y_index in range(4):
				if rng.randf() < 0.72:
					var size := rng.randf_range(70, 120)
					var cell_w := (world_size.x - safe_left - 160.0) / 5.0
					var cell_h := (world_size.y - 240.0) / 4.0
					walls.append(
						Rect2(
							(
								safe_left
								+ 60
								+ x_index * cell_w
								+ rng.randf_range(0, maxf(4, cell_w - size))
							),
							120 + y_index * cell_h + rng.randf_range(0, maxf(4, cell_h - size)),
							size,
							size
						)
					)
	elif layout == 1:
		for i in range(8):
			var horizontal := rng.randf() < 0.5
			var length := rng.randf_range(260, 520)
			var rect := Rect2()
			if horizontal:
				rect = Rect2(
					rng.randf_range(safe_left, world_size.x - length - 80),
					rng.randf_range(100, world_size.y - 160),
					length,
					54
				)
			else:
				rect = Rect2(
					rng.randf_range(safe_left, world_size.x - 140),
					rng.randf_range(100, world_size.y - length - 80),
					54,
					length
				)
			walls.append(rect)
	elif layout == 2:
		for i in range(7):
			var size := Vector2(rng.randf_range(120, 300), rng.randf_range(120, 300))
			walls.append(
				Rect2(
					Vector2(
						rng.randf_range(safe_left, world_size.x - size.x - 80),
						rng.randf_range(100, world_size.y - size.y - 80)
					),
					size
				)
			)
	else:
		for i in range(12):
			var size := rng.randf_range(70, 155)
			walls.append(
				Rect2(
					rng.randf_range(safe_left, world_size.x - size - 80),
					rng.randf_range(100, world_size.y - size - 80),
					size,
					size
				)
			)


func _generate_platforms() -> void:
	var count := rng.randi_range(2, 4)
	for i in range(count):
		for attempt in range(45):
			var size := Vector2(rng.randf_range(180, 300), rng.randf_range(160, 260))
			var rect := Rect2(
				Vector2(
					rng.randf_range(world_size.x * 0.34, world_size.x - size.x - 120),
					rng.randf_range(140, world_size.y - size.y - 140)
				),
				size
			)
			if _rect_near_walls(rect, 42.0) or _rect_near_platforms(rect, 90.0):
				continue
			var side := rng.randi_range(0, 3)
			var stair := Rect2()
			match side:
				0:
					stair = Rect2(
						rect.position + Vector2(rect.size.x * 0.5 - 34, -58), Vector2(68, 58)
					)
				1:
					stair = Rect2(
						rect.position + Vector2(rect.size.x * 0.5 - 34, rect.size.y),
						Vector2(68, 58)
					)
				2:
					stair = Rect2(
						rect.position + Vector2(-58, rect.size.y * 0.5 - 34), Vector2(58, 68)
					)
				_:
					stair = Rect2(
						rect.position + Vector2(rect.size.x, rect.size.y * 0.5 - 34),
						Vector2(58, 68)
					)
			platforms.append({"rect": rect, "stair": stair})
			break


func _rect_near_walls(rect: Rect2, margin: float) -> bool:
	for wall: Rect2 in walls:
		if wall.grow(margin).intersects(rect):
			return true
	return false


func _rect_near_platforms(rect: Rect2, margin: float) -> bool:
	for platform: Dictionary in platforms:
		var platform_rect: Rect2 = platform.rect
		if platform_rect.grow(margin).intersects(rect):
			return true
	return false


func _add_wall_body(rect: Rect2) -> void:
	var body := StaticBody2D.new()
	body.collision_layer = 1
	body.collision_mask = 1
	var shape_node := CollisionShape2D.new()
	var shape := RectangleShape2D.new()
	shape.size = rect.size
	shape_node.shape = shape
	shape_node.position = rect.position + rect.size * 0.5
	body.add_child(shape_node)
	add_child(body)


func _spawn_loot() -> void:
	var area_scale := world_size.x * world_size.y / (2000.0 * 1400.0)
	var occupied: Array[Vector2] = [portal.position]
	for i in range(roundi(7 * area_scale)):
		_spawn_standard_loot("coin", _open_spot(14, occupied, 140), -1, occupied)
	for i in range(roundi(5 * area_scale)):
		_spawn_standard_loot("gem", _open_spot(14, occupied, 150), -1, occupied)
	for i in range(2):
		_spawn_deep_loot("idol", 0.50, occupied)
	_spawn_deep_loot("mask", 0.55, occupied)
	_spawn_deep_loot("living", 0.30, occupied)
	if rng.randf() < 0.7:
		_spawn_deep_loot("royal", 0.50, occupied)
	if rng.randf() < 0.7:
		_spawn_deep_loot("fragile", 0.35, occupied)
	var artifacts := ARTIFACTS.duplicate(true)
	artifacts.shuffle()
	var artifact_count := 1 + int(rng.randf() < 0.6)
	for i in range(artifact_count):
		var point := _open_spot(14, occupied, 190, 0.40)
		var base := rng.randi_range(700, 1149)
		var artifact: Dictionary = artifacts[i % artifacts.size()]
		var config := {
			"type": "artifact",
			"name": artifact.name,
			"artifact_name": artifact.name,
			"artifact_flavor": artifact.flavor,
			"base_value": base,
			"value": base,
			"weight": 6.0,
			"noise": 3.0,
			"marked": 3.0,
			"kind": "artifact",
			"boon": BOONS[rng.randi_range(0, BOONS.size() - 1)]
		}
		_spawn_loot_node(config, point, -1, occupied)
	var heart_position := Vector2(
		world_size.x - 150, 180 if rng.randf() < 0.5 else world_size.y - 180
	)
	var heart_hidden := MetaSave.upgrade_level("scanner") == 0
	_spawn_loot_node(_loot_config("heart", {"hidden": heart_hidden}), heart_position, -1, occupied)
	heart_revealed = not heart_hidden
	for i in range(platforms.size()):
		var rect: Rect2 = platforms[i].rect
		var point := (
			rect.position
			+ rect.size * 0.5
			+ Vector2(
				rng.randf_range(-rect.size.x * 0.24, rect.size.x * 0.24),
				rng.randf_range(-rect.size.y * 0.24, rect.size.y * 0.24)
			)
		)
		_spawn_standard_loot("idol" if rng.randf() < 0.5 else "gem", point, i, occupied)


func _spawn_deep_loot(type: String, min_x_fraction: float, occupied: Array) -> void:
	var point := _open_spot(14, occupied, 175, min_x_fraction)
	_spawn_standard_loot(type, point, -1, occupied)


func _loot_config(type: String, extras: Dictionary = {}) -> Dictionary:
	var config: Dictionary = LOOT_TYPES[type].duplicate(true)
	config.type = type
	for key: Variant in extras.keys():
		config[key] = extras[key]
	return config


func _spawn_standard_loot(type: String, point: Vector2, elevation: int, occupied: Array) -> void:
	_spawn_loot_node(_loot_config(type), point, elevation, occupied)


func _spawn_loot_node(config: Dictionary, point: Vector2, elevation: int, occupied: Array) -> void:
	var item: GreedrunLoot = LOOT_SCENE.instantiate()
	add_child(item)
	item.position = point
	config.elevation = elevation
	item.configure(config)
	item.z_index = 4 if elevation >= 0 else 2
	loot_items.append(item)
	occupied.append(point)


func _spawn_guards() -> void:
	var area_scale := world_size.x * world_size.y / (2000.0 * 1400.0)
	var count := clampi(roundi(5 * area_scale), 5, 8)
	for i in range(count):
		var start := _open_spot(14, [], 0, 0.25)
		var points: Array[Vector2] = [start]
		for j in range(2):
			points.append(_open_spot(14, [], 0, 0.18))
		_spawn_guard(start, points)

func _spawn_guard(
	point: Vector2, points: Array[Vector2], elite: bool = false, hunter: bool = false
) -> GreedrunGuard:
	var guard: GreedrunGuard = GUARD_SCENE.instantiate()
	add_child(guard)
	guard.position = point
	guard.configure(points, elite, hunter)
	guard.z_index = 3
	guards.append(guard)
	return guard


func _spawn_sentries() -> void:
	for i in range(rng.randi_range(2, 3)):
		var point := _open_spot(12, [], 0, 0.42)
		var sentry: GreedrunSentry = SENTRY_SCENE.instantiate()
		add_child(sentry)
		sentry.position = point
		sentry.configure(rng.randf_range(0, TAU))
		sentry.z_index = 1
		sentries.append(sentry)


func _open_spot(
	radius: float, occupied: Array, min_distance: float, min_x_fraction := 0.08
) -> Vector2:
	for attempt in range(300):
		var point := Vector2(
			rng.randf_range(maxf(100, world_size.x * min_x_fraction), world_size.x - 100),
			rng.randf_range(100, world_size.y - 100)
		)
		if not can_move(point, radius, false):
			continue
		var okay := true
		for other: Vector2 in occupied:
			if point.distance_squared_to(other) < min_distance * min_distance:
				okay = false
				break
		if okay:
			return point
	return Vector2(world_size.x * 0.7, world_size.y * 0.5)


func can_move(point: Vector2, radius: float, ignore_platforms: bool = false) -> bool:
	if (
		point.x < radius
		or point.y < radius
		or point.x > world_size.x - radius
		or point.y > world_size.y - radius
	):
		return false
	for wall: Rect2 in walls:
		var closest := Vector2(
			clampf(point.x, wall.position.x, wall.end.x),
			clampf(point.y, wall.position.y, wall.end.y)
		)
		if point.distance_squared_to(closest) < radius * radius:
			return false
	if not ignore_platforms:
		for platform: Dictionary in platforms:
			var rect: Rect2 = platform.rect
			var closest := Vector2(
				clampf(point.x, rect.position.x, rect.end.x),
				clampf(point.y, rect.position.y, rect.end.y)
			)
			if point.distance_squared_to(closest) < radius * radius:
				return false
	return true


func los_clear(from: Vector2, to: Vector2) -> bool:
	var distance := from.distance_to(to)
	var steps := maxi(2, int(distance / 18.0))
	for i in range(1, steps):
		var point := from.lerp(to, float(i) / steps)
		for wall: Rect2 in walls:
			if wall.has_point(point):
				return false
	return true


func _process(delta: float) -> void:
	if run_paused or finished or player == null:
		return
	run_clock += delta
	if run_time_limit > 0.0 and run_clock >= run_time_limit:
		toast_requested.emit("The vault collapsed!")
		finish_run(false)
		return
	var keyboard := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	player.set_move_input((keyboard + touch_vector).limit_length(1.0))
	_update_living_loot(delta)
	_check_pickups()
	_update_guards(delta)
	_update_sentries(delta)
	_check_one_more()
	_update_extraction(delta)
	peak_heat = maxi(peak_heat, heat_tier)
	_emit_hud()


func _update_living_loot(delta: float) -> void:
	for item: GreedrunLoot in loot_items:
		if item.kind != "living" or item.picked or item.is_hidden or item.destroyed:
			continue
		var distance := item.position.distance_to(player.position)
		if distance < 155.0:
			var direction := player.position.direction_to(item.position)
			var candidate := item.position + direction * 141.0 * delta
			if can_move(candidate, 10, false):
				item.position = candidate


func _check_pickups() -> void:
	for item: GreedrunLoot in loot_items:
		if item.picked or item.is_hidden or item.destroyed or item.elevation != player.elevation:
			continue
		var reach := GreedrunPlayer.RADIUS + 16.0 + Progression.pickup_bonus()
		if player.position.distance_squared_to(item.position) > reach * reach:
			continue
		if item.kind == "artifact":
			pending_artifact = item
			set_run_paused(true)
			artifact_decision_requested.emit(
				{
					"name": item.artifact_name,
					"flavor": item.artifact_flavor,
					"value": item.base_value,
					"boon": item.boon
				}
			)
			return
		_pick_item(item)


func _pick_item(item: GreedrunLoot) -> void:
	item.mark_picked()
	if item.kind == "living":
		toast_requested.emit("Cornered the Skitterjewel!")
	if item.kind == "royal":
		_summon_elites(item.position)
		toast_requested.emit("You touched the crown — elite guards enter!")
	if item.noise >= 3.0:
		low_noise_run = false
		toast_requested.emit("The vault heard that.")
	if item.marked > 0.0:
		toast_requested.emit("Marked goods — the vault turns hostile.")
	_recompute_load()
	_check_vault_clear()


func _check_vault_clear() -> void:
	if vault_cleared:
		return
	for item: GreedrunLoot in loot_items:
		if not item.picked:
			return
	vault_cleared = true
	forced_heat_floor = maxi(forced_heat_floor, 4)
	_recompute_load()
	for guard: GreedrunGuard in guards:
		guard.state = "chase"
		guard.alert = 1.0
	toast_requested.emit("VAULT EMPTY — every last coin. Now RUN.")


func _recompute_load() -> void:
	carried_value = 0
	carried_weight = 0.0
	carried_noise = 0.0
	carried_marked = 0.0
	for item: GreedrunLoot in loot_items:
		if item.picked and not item.destroyed:
			carried_value += item.value
			carried_weight += item.weight
			carried_noise += item.noise
			carried_marked += item.marked
	var greed_heat := (
		floori(carried_value / 650.0) + floori(carried_marked / 3.0) + heat_seed + alarm_heat_bonus
	)
	heat_tier = clampi(maxi(greed_heat, forced_heat_floor), 0, 6)
	player.set_load(carried_weight)
	peak_heat = maxi(peak_heat, heat_tier)
	var hunter_at := maxi(2, 4 - floori(MetaSave.notoriety() / 3.0))
	hunter_at = maxi(1, hunter_at - int(ascension["hunter_heat_delta"]))
	if not hunter_spawned and heat_tier >= hunter_at:
		_spawn_hunter()


func _update_guards(delta: float) -> void:
	var effective_noise := Progression.effective_noise(carried_noise, noise_muffled)
	var detect_radius := (
		(92.0 + effective_noise * 6.0 + heat_tier * 9.0)
		* Progression.detection_multiplier()
		* float(ascension["guard_detr_mult"])
	)
	var guard_speed := (
		(1.5 + heat_tier * 0.16 + carried_marked * 0.03) * 60.0 * float(ascension["guard_speed_mult"])
	)
	for guard: GreedrunGuard in guards:
		guard.update_ai(delta, player, self, detect_radius, guard_speed)
		if (
			guard.hit_cooldown <= 0.0
			and (player.elevation < 0 or guard.hunter)
			and (
				guard.position.distance_squared_to(player.position)
				< pow(guard.radius + GreedrunPlayer.RADIUS, 2)
			)
		):
			if player.damage():
				guard.hit_cooldown = 0.8
				run_damaged = true
				_shatter_fragile_if_needed()
				var knock := guard.position.direction_to(player.position) * 26.0
				if can_move(player.position + knock, GreedrunPlayer.RADIUS, true):
					player.position += knock
				if player.hp > 0:
					toast_requested.emit(
						(
							"Second wind — back on your feet."
							if player.used_revive and player.hp == 1
							else "CAUGHT!"
						)
					)


func _update_sentries(delta: float) -> void:
	for sentry: GreedrunSentry in sentries:
		sentry.update_sentry(delta, player, self)


func mark_spotted() -> void:
	run_spotted = true


func trip_alarm(_origin: Vector2) -> void:
	run_spotted = true
	alarm_heat_bonus += 1
	_recompute_load()
	var sorted: Array[GreedrunGuard] = guards.duplicate()
	sorted.sort_custom(_sort_guard_distance)
	for i in range(mini(2, sorted.size())):
		sorted[i].state = "chase"
		sorted[i].alert = 1.0
	toast_requested.emit("SPOTTED — alarm!")


func _sort_guard_distance(a: GreedrunGuard, b: GreedrunGuard) -> bool:
	return (
		a.position.distance_squared_to(player.position)
		< b.position.distance_squared_to(player.position)
	)


func _summon_elites(origin: Vector2) -> void:
	for i in range(2):
		var point := _open_spot(14, [origin], 100, 0.25)
		var guard: GreedrunGuard = _spawn_guard(point, [player.position], true, false)
		guard.state = "chase"
		guard.alert = 1.0
		guard.last_known = player.position


func _spawn_hunter() -> void:
	hunter_spawned = true
	var point := Vector2(world_size.x - 120, 120)
	if not can_move(point, 14, true):
		point = _open_spot(14, [], 0, 0.55)
	var hunter: GreedrunGuard = _spawn_guard(point, [player.position], false, true)
	hunter.state = "chase"
	hunter.alert = 1.0
	toast_requested.emit("A bounty hunter has entered the vault.")


func _shatter_fragile_if_needed() -> void:
	for item: GreedrunLoot in loot_items:
		if item.kind == "fragile" and item.picked and not item.destroyed:
			item.shatter()
			_recompute_load()
			toast_requested.emit("The Porcelain Relic shattered.")
			return


func _on_player_drop(weight: float) -> void:
	if MetaSave.upgrade_level("landing") > 0:
		toast_requested.emit("Cat's Landing — silent.")
	elif weight >= 20.0:
		run_damaged = true
		player.damage()
		toast_requested.emit("The loaded drop cost a heart.")
	elif weight >= 8.0:
		for guard: GreedrunGuard in guards:
			if guard.position.distance_to(player.position) < 200.0 + weight * 9.0:
				guard.state = "investigate"
				guard.last_known = player.position
				guard.search_time = 2.4
		toast_requested.emit("A loud landing — nearby guards investigate.")


func _on_player_died() -> void:
	finish_run(false)


func _check_one_more() -> void:
	if one_more_seen or carried_value <= 0:
		return
	if player.position.distance_to(portal.position) < portal.radius + 34.0:
		one_more_seen = true
		set_run_paused(true)
		one_more_requested.emit(carried_value)


func accept_one_more() -> void:
	_reveal_heart()
	forced_heat_floor = maxi(forced_heat_floor, 4)
	_recompute_load()
	for guard: GreedrunGuard in guards:
		guard.state = "chase"
		guard.alert = 1.0
	toast_requested.emit("The vault wakes — every eye turns to you.")
	set_run_paused(false)


func _reveal_heart() -> void:
	for item: GreedrunLoot in loot_items:
		if item.loot_type == "heart":
			item.set_revealed(true)
			heart_revealed = true
			return


func resolve_artifact(choice: int) -> void:
	if pending_artifact == null:
		return
	var item: GreedrunLoot = pending_artifact
	if choice == 0:
		item.value = item.base_value
		item.weight = 6
		item.noise = 3
		item.marked = 3
		low_noise_run = false
	elif choice == 1:
		item.value = roundi(item.base_value * 0.4)
		item.weight = 2
		item.noise = 0
		item.marked = 0
	else:
		item.value = 0
		item.weight = 0
		item.noise = 0
		item.marked = 0
		_apply_boon(item.boon)
	item.mark_picked()
	pending_artifact = null
	_recompute_load()
	_check_vault_clear()
	set_run_paused(false)


func _apply_boon(boon: String) -> void:
	match boon:
		"sense":
			_reveal_heart()
			toast_requested.emit("Greed Sense — the Vault Heart is revealed.")
		"ghost":
			player.grant_smoke_step()
			for guard: GreedrunGuard in guards:
				guard.state = "patrol"
				guard.alert = 0.0
			toast_requested.emit("Smoke Step — six seconds untouchable.")
		"muffle":
			noise_muffled = true
			toast_requested.emit("Silence — the haul makes no noise this run.")


func _update_extraction(delta: float) -> void:
	var near: bool = player.position.distance_to(portal.position) < portal.radius + 30.0
	var wants: bool = Input.is_action_pressed("extract") or touch_extract
	if near and wants and one_more_seen:
		extract_hold += delta
		if extract_hold >= 0.6:
			finish_run(true)
	else:
		extract_hold = maxf(0.0, extract_hold - delta * 2.0)


func set_touch_vector(value: Vector2) -> void:
	touch_vector = value


func set_touch_extract(value: bool) -> void:
	touch_extract = value


func set_run_paused(value: bool) -> void:
	run_paused = value
	if player:
		player.set_controls_locked(value)


func finish_run(escaped: bool) -> void:
	if finished:
		return
	finished = true
	set_run_paused(true)
	MetaSave.data.runs = int(MetaSave.data.runs) + 1
	MetaSave.data.best_haul = maxi(int(MetaSave.data.best_haul), carried_value if escaped else 0)
	var ascension_score := carried_value if escaped else 0
	var ascension_new_best: bool = escaped and ascension_score > MetaSave.best_for_ascension(
		ascension_level
	)
	if ascension_new_best:
		MetaSave.set_best_for_ascension(ascension_level, ascension_score)
	if (
		escaped
		and ascension_level >= 1
		and ascension_level == MetaSave.ascension_unlocked()
		and ascension_level < AscensionModifiers.MAX_LEVEL
	):
		MetaSave.set_ascension_unlocked(ascension_level + 1)
	var pending_haul: Array[Dictionary] = []
	var bulk_value := 0
	var bulk_count := 0
	if escaped:
		for item: GreedrunLoot in loot_items:
			if not item.picked or item.destroyed:
				continue
			if item.kind in ["loud", "cursed", "artifact", "living", "mythic", "royal", "fragile"]:
				pending_haul.append(
					{
						"kind": item.kind,
						"name": item.display_name,
						"value": item.value,
						"selection": 0
					}
				)
			else:
				bulk_value += item.value
				bulk_count += 1
	var contract_done: bool = escaped and _contract_succeeded()
	var result: Dictionary = {
		"escaped": escaped,
		"haul_value": carried_value if escaped else 0,
		"secured": _secured_count(),
		"total": loot_items.size(),
		"perfect": escaped and vault_cleared,
		"peak_heat": peak_heat,
		"epithet": _epithet(escaped),
		"pending_haul": pending_haul,
		"bulk_value": bulk_value,
		"bulk_count": bulk_count,
		"contract": active_contract.duplicate(true),
		"contract_done": contract_done,
		"contract_reward": int(active_contract.get("reward", 0)) if contract_done else 0,
		"notoriety_down": int(active_contract.get("notoriety_down", 0)) if contract_done else 0,
		"ascension": ascension_level,
		"ascension_new_best": ascension_new_best,
	}
	run_finished.emit(result)


func _contract_succeeded() -> bool:
	var succeeded: bool = false
	match str(active_contract.get("type", "")):
		"quota":
			succeeded = carried_value >= int(active_contract.get("target", 0))
		"silent":
			succeeded = not run_spotted
		"steal":
			var target_kind := str(active_contract.get("target_kind", ""))
			for item: GreedrunLoot in loot_items:
				if item.picked and (item.loot_type == target_kind or item.kind == target_kind):
					succeeded = true
					break
		"sweep":
			succeeded = vault_cleared
		"timed", "recovery":
			succeeded = true
		"heart":
			for item: GreedrunLoot in loot_items:
				if item.loot_type == "heart" and item.picked:
					succeeded = true
					break
		"untouched":
			succeeded = not run_damaged
		"hot":
			succeeded = peak_heat >= 4
	return succeeded


func _secured_count() -> int:
	var count := 0
	for item: GreedrunLoot in loot_items:
		if item.picked and not item.destroyed:
			count += 1
	return count


func _epithet(escaped: bool) -> String:
	if not escaped:
		return "BURIED WITH IT" if vault_cleared else "TOO GREEDY"
	if vault_cleared:
		return "TOMB RAIDER"
	if heart_revealed:
		return "PHANTOM BURGLAR"
	if low_noise_run and carried_value > 0:
		return "GENTLEMAN THIEF"
	if carried_value >= 1500:
		return "MASTER LOOTER"
	return "OPPORTUNIST"


func _emit_hud() -> void:
	if player == null:
		return
	hud_changed.emit(
		{
			"hp": player.hp,
			"max_hp": player.max_hp,
			"haul": carried_value,
			"weight": carried_weight,
			"noise": Progression.effective_noise(carried_noise, noise_muffled),
			"heat": heat_tier,
			"peak_heat": peak_heat,
			"secured": _secured_count(),
			"total": loot_items.size(),
			"vault_cleared": vault_cleared,
			"near_portal": player.position.distance_to(portal.position) < portal.radius + 30.0,
			"extract_ready": one_more_seen,
			"extract_progress": extract_hold / 0.6,
			"time_left": maxf(0.0, run_time_limit - run_clock) if run_time_limit > 0 else -1.0,
			"contract": active_contract,
			"elevation": player.elevation,
			"weight_drop": carried_weight
		}
	)


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, world_size), current_theme.floor, true)
	var grid_color: Color = current_theme.grid
	for x in range(0, int(world_size.x), 64):
		draw_line(Vector2(x, 0), Vector2(x, world_size.y), grid_color, 1)
	for y in range(0, int(world_size.y), 64):
		draw_line(Vector2(0, y), Vector2(world_size.x, y), grid_color, 1)
	for platform: Dictionary in platforms:
		var rect: Rect2 = platform.rect
		var stair: Rect2 = platform.stair
		draw_rect(Rect2(rect.position + Vector2(0, 12), rect.size), Color(0, 0, 0, 0.35), true)
		draw_rect(rect, current_theme.platform, true)
		draw_rect(rect, current_theme.wall, false, 4)
		draw_rect(stair, current_theme.platform.lightened(0.13), true)
		for step in range(5):
			var t := float(step) / 5.0
			draw_line(
				stair.position + Vector2(0, stair.size.y * t),
				stair.position + Vector2(stair.size.x, stair.size.y * t),
				current_theme.wall,
				1
			)
	for wall: Rect2 in walls:
		draw_rect(wall, current_theme.wall, true)
		draw_rect(wall, current_theme.wall.lightened(0.18), false, 2)
