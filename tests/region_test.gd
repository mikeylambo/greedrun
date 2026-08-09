extends SceneTree
## Headless verification for the room-grid generator. Runs entirely in
## _initialize() and quits before any frame ticks, so no _process/input runs.
##   godot --headless --path . -s tests/region_test.gd

const SEEDS := [1, 2, 7, 42, 1337, 90210, 5, 88, 314159, 271828]
const RASTER := 20.0

var failures := 0


func _initialize() -> void:
	for s in SEEDS:
		_check_seed(s)
	for s in SEEDS:
		_check_arena(s)
	_check_determinism(42)
	_check_guard_nav(1337)
	_check_mix()
	if failures == 0:
		print("\nALL REGION TESTS PASSED (%d seeds, both layout modes)" % SEEDS.size())
	else:
		print("\nREGION TESTS FAILED: %d problem(s)" % failures)
	quit(1 if failures > 0 else 0)


func _fail(msg: String) -> void:
	failures += 1
	print("  FAIL: ", msg)


func _new_vault(seed_value: int, layout: String = ""):
	var vault = load("res://scripts/vault.gd").new()
	get_root().add_child(vault)
	var contract := {}
	if layout != "":
		contract = {"layout": layout}
	vault.start_run(contract, seed_value)
	return vault


func _check_seed(seed_value: int) -> void:
	var vault = _new_vault(seed_value, "rooms")
	var graph = vault.graph
	if graph == null:
		_fail("seed %d: forced rooms but no graph built" % seed_value)
		return
	print(
		(
			"seed %d: %dx%d rooms=%d doorways=%d loops=%d walls=%d"
			% [
				seed_value,
				graph.cols,
				graph.rows,
				graph.region_count(),
				graph.doorways.size(),
				graph.loop_doorways.size(),
				vault.walls.size()
			]
		)
	)

	# 1. Connectivity BY CONSTRUCTION: BFS over adjacency reaches every room.
	var reached := {graph.extraction_region: true}
	var queue := [graph.extraction_region]
	while not queue.is_empty():
		var cur = queue.pop_front()
		for nb in graph.adjacency[cur]:
			if not reached.has(nb):
				reached[nb] = true
				queue.append(nb)
	if reached.size() != graph.region_count():
		_fail("seed %d: graph connects %d/%d rooms" % [seed_value, reached.size(), graph.region_count()])

	# 2. Every doorway centre is actually open floor (gap really exists).
	for center in graph.doorways.values():
		if not vault.can_move(center, 14, false):
			_fail("seed %d: doorway centre %s is blocked" % [seed_value, center])

	# 3. PHYSICAL connectivity via flood-fill of open space from the player.
	var open := _flood(vault)
	if not _reachable(open, vault, vault.portal.position):
		_fail("seed %d: portal not reachable from spawn" % seed_value)
	for i in range(graph.region_count()):
		if not _room_reachable(open, vault, graph.region_open_rect(i)):
			_fail("seed %d: room %d unreachable from spawn" % [seed_value, i])
	for item in vault.loot_items:
		if item.elevation < 0 and not _reachable(open, vault, item.position):
			_fail("seed %d: ground loot at %s unreachable" % [seed_value, item.position])


func _check_arena(seed_value: int) -> void:
	var vault = _new_vault(seed_value, "arena")
	if vault.graph != null or vault.layout_style != "arena":
		_fail("seed %d: forced arena but got %s" % [seed_value, vault.layout_style])
		return
	# Open arenas have no region graph; verify the floor is one connected space.
	var open := _flood(vault)
	if not _reachable(open, vault, vault.portal.position):
		_fail("arena seed %d: portal not reachable from spawn" % seed_value)
	var unreachable := 0
	for item in vault.loot_items:
		if item.elevation < 0 and not _reachable(open, vault, item.position):
			unreachable += 1
	if unreachable > 0:
		_fail("arena seed %d: %d ground loot unreachable" % [seed_value, unreachable])


func _check_mix() -> void:
	var rooms := 0
	var arenas := 0
	for s in SEEDS:
		var vault = _new_vault(s)
		if vault.layout_style == "rooms":
			rooms += 1
		else:
			arenas += 1
		if (vault.graph != null) != (vault.layout_style == "rooms"):
			_fail("seed %d: layout_style/graph mismatch" % s)
	print("layout mix over %d seeds: rooms=%d arenas=%d" % [SEEDS.size(), rooms, arenas])
	if rooms == 0 or arenas == 0:
		_fail("seeded layout flip did not produce both modes (rooms=%d arenas=%d)" % [rooms, arenas])


func _check_determinism(seed_value: int) -> void:
	var a = _new_vault(seed_value, "rooms")
	var b = _new_vault(seed_value, "rooms")
	var wa: Array = a.walls
	var wb: Array = b.walls
	var ok: bool = wa.size() == wb.size()
	if ok:
		for i in range(wa.size()):
			if wa[i] != wb[i]:
				ok = false
				break
	if not ok:
		_fail("determinism: wall geometry differs for seed %d" % seed_value)
	if str(a.graph.doorways) != str(b.graph.doorways):
		_fail("determinism: doorways differ for seed %d" % seed_value)
	if a.graph.loop_doorways != b.graph.loop_doorways:
		_fail("determinism: loop doorways differ for seed %d" % seed_value)
	print("determinism seed %d: walls match=%s" % [seed_value, ok])


func _check_guard_nav(seed_value: int) -> void:
	var vault = _new_vault(seed_value, "rooms")
	var graph = vault.graph
	# Target the room farthest from the extraction room.
	var target_region := 0
	var best := -1
	for i in range(graph.region_count()):
		var d = graph.dist_to_exit(i)
		if d > best:
			best = d
			target_region = i
	var target = graph.region_open_rect(target_region).get_center()
	var guard = vault.guards[0]
	var start_region = graph.region_of(guard.global_position)
	# Simulate doorway-aware chase steering (mirrors guard.gd movement).
	var pos: Vector2 = guard.global_position
	var speed := 200.0
	var dt := 1.0 / 60.0
	var arrived := false
	for step in range(4000):
		var nav = vault.nav_target(pos, target)
		var dir: Vector2 = pos.direction_to(nav)
		var cand: Vector2 = pos + dir * speed * dt
		if vault.can_move(cand, 14, false):
			pos = cand
		elif vault.can_move(Vector2(cand.x, pos.y), 14, false):
			pos.x = cand.x
		elif vault.can_move(Vector2(pos.x, cand.y), 14, false):
			pos.y = cand.y
		if graph.region_of(pos) == target_region:
			arrived = true
			break
	print(
		(
			"guard nav seed %d: room %d -> %d (dist %d) arrived=%s"
			% [seed_value, start_region, target_region, best, arrived]
		)
	)
	if not arrived:
		_fail("guard could not thread doorways from room %d to %d" % [start_region, target_region])


# --- flood fill over open space --------------------------------------------


func _key(cx: int, cy: int) -> int:
	return cy * 100000 + cx


func _flood(vault) -> Dictionary:
	var open := {}
	var start: Vector2 = vault.player.position
	var scx := int(start.x / RASTER)
	var scy := int(start.y / RASTER)
	var stack := [_key(scx, scy)]
	open[stack[0]] = true
	var w = vault.world_size.x
	var h = vault.world_size.y
	while not stack.is_empty():
		var k = stack.pop_back()
		@warning_ignore("integer_division")
		var cy = k / 100000
		var cx = k % 100000
		for d in [[1, 0], [-1, 0], [0, 1], [0, -1]]:
			var nx = cx + d[0]
			var ny = cy + d[1]
			var px = (nx + 0.5) * RASTER
			var py = (ny + 0.5) * RASTER
			if px <= 0 or py <= 0 or px >= w or py >= h:
				continue
			var nk = _key(nx, ny)
			if open.has(nk):
				continue
			if vault.can_move(Vector2(px, py), 12, false):
				open[nk] = true
				stack.append(nk)
	return open


## A room counts as reachable if any genuinely-open point inside it (not under a
## raised platform) is in the flood set. Rooms with no open floor at all are
## vacuously fine.
func _room_reachable(open: Dictionary, vault, rect: Rect2) -> bool:
	var any_open := false
	var n := 6
	for ix in range(n):
		for iy in range(n):
			var p := Vector2(
				lerpf(rect.position.x, rect.end.x, (ix + 0.5) / n),
				lerpf(rect.position.y, rect.end.y, (iy + 0.5) / n)
			)
			if vault.can_move(p, 12, false):
				any_open = true
				if _reachable(open, vault, p):
					return true
	return not any_open


func _reachable(open: Dictionary, _vault, point: Vector2) -> bool:
	# Accept the target cell or any of its immediate neighbours as reached, so a
	# point sitting near a wall edge still counts as connected.
	var cx := int(point.x / RASTER)
	var cy := int(point.y / RASTER)
	for dx in [-1, 0, 1]:
		for dy in [-1, 0, 1]:
			if open.has(_key(cx + dx, cy + dy)):
				return true
	return false
