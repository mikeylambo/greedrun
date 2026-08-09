class_name VaultGraph
extends RefCounted
## Structured room-grid layer over the vault interior. Divides the play area into
## a grid of rooms (regions) joined by doorways (gaps in partition walls). The set
## of open doorways is a spanning tree over the rooms plus a few extra loop
## doorways, so the whole map is connected BY CONSTRUCTION — never by a runtime
## check. Tree doorways are permanent; loop doorways are the only ones a future
## severing pass may ever close.
##
## Everything is driven by the vault's single seeded RNG (no new RNG source), so a
## seed reproduces the same rooms, doorways and region graph.

## Doorway clear width. Must comfortably exceed the player/guard diameter (28 px)
## so both can thread a gap. # TUNE
const DOOR_WIDTH := 132.0
## Grid sizing: interior pixels per column / row before clamping. # TUNE
const COL_SPAN := 820.0
const ROW_SPAN := 640.0
const MIN_COLS := 2
const MAX_COLS := 4
const MIN_ROWS := 2
const MAX_ROWS := 3

var cols := 0
var rows := 0
var origin := Vector2.ZERO
var cell_size := Vector2.ZERO
var region_rects: Array[Rect2] = []
var doorways: Dictionary = {}  # edge key "a-b" (a < b) -> world-space gap center
var loop_doorways: Array[String] = []  # edge keys added beyond the spanning tree
var adjacency: Dictionary = {}  # region id -> Array[int] of open-doorway neighbors
var extraction_region := 0
var _dist_to_exit: Dictionary = {}  # region id -> BFS hops from extraction_region


## Builds the grid, records the region/doorway graph, and returns the partition
## wall rects for the caller to append to its wall list. Connectivity is guaranteed
## by the spanning tree — the returned walls always leave every room reachable.
func build(rng: RandomNumberGenerator, interior: Rect2, thickness: float) -> Array[Rect2]:
	cols = clampi(int(round(interior.size.x / COL_SPAN)), MIN_COLS, MAX_COLS)
	rows = clampi(int(round(interior.size.y / ROW_SPAN)), MIN_ROWS, MAX_ROWS)
	origin = interior.position
	cell_size = Vector2(interior.size.x / float(cols), interior.size.y / float(rows))
	region_rects.clear()
	doorways.clear()
	loop_doorways.clear()
	adjacency.clear()
	_dist_to_exit.clear()
	var count := cols * rows
	for i in range(count):
		region_rects.append(_cell_rect(i))
		adjacency[i] = ([] as Array[int])

	var open_edges := _spanning_tree(rng)
	_add_loop_edges(rng, open_edges)

	var walls_out: Array[Rect2] = []
	_emit_boundaries(rng, thickness, open_edges, walls_out)
	return walls_out


## Fixes the extraction room from the portal position and computes the distance
## field (BFS hops) from it. Call once the portal exists.
func set_extraction(point: Vector2) -> void:
	extraction_region = region_of(point)
	_dist_to_exit.clear()
	var queue: Array[int] = [extraction_region]
	_dist_to_exit[extraction_region] = 0
	while not queue.is_empty():
		var cur: int = queue.pop_front()
		for nb: int in adjacency[cur]:
			if not _dist_to_exit.has(nb):
				_dist_to_exit[nb] = int(_dist_to_exit[cur]) + 1
				queue.append(nb)


func region_of(point: Vector2) -> int:
	if cols == 0 or rows == 0:
		return -1
	var c := clampi(int((point.x - origin.x) / cell_size.x), 0, cols - 1)
	var r := clampi(int((point.y - origin.y) / cell_size.y), 0, rows - 1)
	return r * cols + c


## The walkable interior of a room, inset off the partition walls — for placing
## loot, guards and patrol waypoints inside a single room.
func region_open_rect(region: int) -> Rect2:
	if region < 0 or region >= region_rects.size():
		return Rect2()
	return region_rects[region].grow(-32.0)


## Next waypoint a mover at from_point should steer toward to reach to_point: the
## doorway into the next room along the path, or to_point itself when already in
## the same room (or when the graph is unavailable).
func nav_target(from_point: Vector2, to_point: Vector2) -> Vector2:
	var here := region_of(from_point)
	var there := region_of(to_point)
	if here < 0 or there < 0 or here == there:
		return to_point
	var hop := _next_hop(here, there)
	if hop < 0:
		return to_point
	return doorways.get(_edge_key(here, hop), to_point)


func dist_to_exit(region: int) -> int:
	return int(_dist_to_exit.get(region, -1))


func greed_gradient(region: int) -> float:
	var d := dist_to_exit(region)
	if d < 0:
		return 0.0
	var span := 0
	for value: int in _dist_to_exit.values():
		span = maxi(span, value)
	return 0.0 if span == 0 else float(d) / float(span)


func region_count() -> int:
	return cols * rows


# --- construction internals -------------------------------------------------


func _cell_rect(region: int) -> Rect2:
	@warning_ignore("integer_division")
	var r := region / cols
	var c := region % cols
	return Rect2(origin + Vector2(c * cell_size.x, r * cell_size.y), cell_size)


func _edge_key(a: int, b: int) -> String:
	return "%d-%d" % [mini(a, b), maxi(a, b)]


func _grid_neighbors(region: int) -> Array[int]:
	@warning_ignore("integer_division")
	var r := region / cols
	var c := region % cols
	var out: Array[int] = []
	if c > 0:
		out.append(region - 1)
	if c < cols - 1:
		out.append(region + 1)
	if r > 0:
		out.append(region - cols)
	if r < rows - 1:
		out.append(region + cols)
	return out


## Randomised depth-first spanning tree over the room grid. Returns the set of
## open-doorway edge keys. Every room is reachable from every other by these
## edges alone — this is the always-escapable guarantee, by construction.
func _spanning_tree(rng: RandomNumberGenerator) -> Dictionary:
	var open_edges: Dictionary = {}
	var visited: Dictionary = {0: true}
	var stack: Array[int] = [0]
	while not stack.is_empty():
		var cur: int = stack[stack.size() - 1]
		var options: Array[int] = []
		for nb: int in _grid_neighbors(cur):
			if not visited.has(nb):
				options.append(nb)
		if options.is_empty():
			stack.pop_back()
			continue
		var nxt: int = options[rng.randi_range(0, options.size() - 1)]
		open_edges[_edge_key(cur, nxt)] = true
		visited[nxt] = true
		stack.append(nxt)
	return open_edges


## Adds a handful of extra doorways beyond the tree so the map has alternate
## routes. These loop doorways are the only ones a future severing pass may close.
func _add_loop_edges(rng: RandomNumberGenerator, open_edges: Dictionary) -> void:
	var candidates: Array[String] = []
	for a in range(cols * rows):
		for b: int in _grid_neighbors(a):
			if a < b:
				var key := _edge_key(a, b)
				if not open_edges.has(key):
					candidates.append(key)
	_shuffle(candidates, rng)
	@warning_ignore("integer_division")
	var loop_count := clampi((cols * rows) / 3, 1, 4)
	for i in range(mini(loop_count, candidates.size())):
		open_edges[candidates[i]] = true
		loop_doorways.append(candidates[i])


## Deterministic Fisher-Yates using the seeded stream (Array.shuffle() would use
## the unseeded global RNG and break daily-run reproducibility).
func _shuffle(arr: Array, rng: RandomNumberGenerator) -> void:
	for i in range(arr.size() - 1, 0, -1):
		var j := rng.randi_range(0, i)
		var tmp: Variant = arr[i]
		arr[i] = arr[j]
		arr[j] = tmp


## Emits one wall rect per internal room boundary, split around a doorway gap when
## that edge is open. Records the doorway centre and the adjacency both ways.
func _emit_boundaries(
	rng: RandomNumberGenerator, thickness: float, open_edges: Dictionary, walls_out: Array[Rect2]
) -> void:
	var half := thickness * 0.5
	# Vertical boundaries (between horizontally-adjacent rooms).
	for c in range(cols - 1):
		for r in range(rows):
			var a := r * cols + c
			var b := a + 1
			var line_x := origin.x + (c + 1) * cell_size.x
			var seg_top := origin.y + r * cell_size.y
			var seg_bot := seg_top + cell_size.y
			if open_edges.has(_edge_key(a, b)):
				var door_y := _door_pos(rng, seg_top, seg_bot)
				_add_wall(
					walls_out,
					line_x - half,
					seg_top,
					thickness,
					door_y - DOOR_WIDTH * 0.5 - seg_top
				)
				_add_wall(
					walls_out,
					line_x - half,
					door_y + DOOR_WIDTH * 0.5,
					thickness,
					seg_bot - (door_y + DOOR_WIDTH * 0.5)
				)
				_link(a, b, Vector2(line_x, door_y))
			else:
				_add_wall(walls_out, line_x - half, seg_top, thickness, cell_size.y)
	# Horizontal boundaries (between vertically-adjacent rooms).
	for r in range(rows - 1):
		for c in range(cols):
			var a := r * cols + c
			var b := a + cols
			var line_y := origin.y + (r + 1) * cell_size.y
			var seg_left := origin.x + c * cell_size.x
			var seg_right := seg_left + cell_size.x
			if open_edges.has(_edge_key(a, b)):
				var door_x := _door_pos(rng, seg_left, seg_right)
				_add_wall(
					walls_out,
					seg_left,
					line_y - half,
					door_x - DOOR_WIDTH * 0.5 - seg_left,
					thickness
				)
				_add_wall(
					walls_out,
					door_x + DOOR_WIDTH * 0.5,
					line_y - half,
					seg_right - (door_x + DOOR_WIDTH * 0.5),
					thickness
				)
				_link(a, b, Vector2(door_x, line_y))
			else:
				_add_wall(walls_out, seg_left, line_y - half, cell_size.x, thickness)


func _door_pos(rng: RandomNumberGenerator, lo: float, hi: float) -> float:
	var margin := DOOR_WIDTH * 0.5 + 56.0
	var low := lo + margin
	var high := hi - margin
	if low >= high:
		return (lo + hi) * 0.5
	return rng.randf_range(low, high)


func _add_wall(walls_out: Array[Rect2], x: float, y: float, w: float, h: float) -> void:
	if w > 1.0 and h > 1.0:
		walls_out.append(Rect2(x, y, w, h))


func _link(a: int, b: int, door_center: Vector2) -> void:
	doorways[_edge_key(a, b)] = door_center
	(adjacency[a] as Array[int]).append(b)
	(adjacency[b] as Array[int]).append(a)


## First room to step into on the shortest path from `here` to `there` (BFS over
## open doorways). Returns -1 if unreachable (never happens on a built graph).
func _next_hop(here: int, there: int) -> int:
	if here == there:
		return there
	var prev: Dictionary = {here: here}
	var queue: Array[int] = [here]
	while not queue.is_empty():
		var cur: int = queue.pop_front()
		for nb: int in adjacency[cur]:
			if prev.has(nb):
				continue
			prev[nb] = cur
			if nb == there:
				var step := nb
				while int(prev[step]) != here:
					step = int(prev[step])
				return step
			queue.append(nb)
	return -1
