class_name GreedrunPlayer
extends CharacterBody2D

signal health_changed(current: int, maximum: int)
signal died
signal ledge_dropped(weight: float)

const RADIUS := 14.0
const SOFT_LIGHT := preload("res://gfx/soft_light.tres")

var _lantern: PointLight2D

var max_hp := 3
var hp := 3
var invincibility := 0.0
var ghost_time := 0.0
var used_revive := false
var move_input := Vector2.ZERO
var move_speed := 171.0
var carried_weight := 0.0
var facing := 0.0
var elevation := -1
var controls_locked := false

var world_bounds := Rect2()
var platform_data: Array = []
var stair_candidate := -1


func _ready() -> void:
	collision_layer = 1
	collision_mask = 1
	_lantern = PointLight2D.new()
	_lantern.texture = SOFT_LIGHT
	_lantern.texture_scale = 3.4
	_lantern.energy = 0.9
	_lantern.color = Color(1.0, 0.86, 0.55)
	add_child(_lantern)
	queue_redraw()


func setup(bounds: Rect2, platforms: Array) -> void:
	world_bounds = bounds
	platform_data = platforms
	max_hp = Progression.max_hp()
	hp = max_hp
	var camera := get_node_or_null("Camera2D") as Camera2D
	if camera != null:
		camera.limit_left = int(world_bounds.position.x)
		camera.limit_top = int(world_bounds.position.y)
		camera.limit_right = int(world_bounds.end.x)
		camera.limit_bottom = int(world_bounds.end.y)
	health_changed.emit(hp, max_hp)


func set_move_input(value: Vector2) -> void:
	move_input = value.limit_length(1.0)
	if move_input.length_squared() > 0.0025:
		facing = move_input.angle()


func set_load(weight: float) -> void:
	carried_weight = weight
	move_speed = Progression.speed_with_weight(weight)
	queue_redraw()


func set_controls_locked(value: bool) -> void:
	controls_locked = value
	if value:
		velocity = Vector2.ZERO


func _physics_process(delta: float) -> void:
	invincibility = maxf(0.0, invincibility - delta)
	ghost_time = maxf(0.0, ghost_time - delta)
	if controls_locked:
		velocity = Vector2.ZERO
		return
	var old_position := position
	_update_stair_candidate(old_position)
	velocity = move_input * move_speed
	move_and_slide()
	position.x = clampf(position.x, world_bounds.position.x + RADIUS, world_bounds.end.x - RADIUS)
	position.y = clampf(position.y, world_bounds.position.y + RADIUS, world_bounds.end.y - RADIUS)
	_resolve_platform_transition(old_position)
	queue_redraw()


func _update_stair_candidate(point: Vector2) -> void:
	if elevation >= 0:
		return
	for i in range(platform_data.size()):
		var stair: Rect2 = platform_data[i].stair
		if stair.grow(8.0).has_point(point):
			stair_candidate = i
			return
	if _platform_at(point) < 0:
		stair_candidate = -1


func _resolve_platform_transition(old_position: Vector2) -> void:
	if elevation < 0:
		var entered := _platform_at(position)
		if entered >= 0:
			var stair: Rect2 = platform_data[entered].stair
			if stair_candidate == entered or stair.grow(10.0).has_point(old_position):
				elevation = entered
			else:
				position = old_position
	else:
		if elevation >= platform_data.size():
			elevation = -1
			return
		var platform_rect: Rect2 = platform_data[elevation].rect
		var stair_rect: Rect2 = platform_data[elevation].stair
		if platform_rect.grow(4.0).has_point(position) or stair_rect.grow(4.0).has_point(position):
			return
		var used_stairs := stair_rect.grow(8.0).has_point(old_position)
		elevation = -1
		stair_candidate = -1
		if not used_stairs:
			ledge_dropped.emit(carried_weight)


func _platform_at(point: Vector2) -> int:
	for i in range(platform_data.size()):
		var rect: Rect2 = platform_data[i].rect
		if rect.has_point(point):
			return i
	return -1


func damage(amount: int = 1) -> bool:
	if invincibility > 0.0 or ghost_time > 0.0:
		return false
	hp -= amount
	invincibility = 1.1
	if hp <= 0 and MetaSave.upgrade_level("revive") > 0 and not used_revive:
		used_revive = true
		hp = 1
		invincibility = 2.0
		health_changed.emit(hp, max_hp)
		return true
	health_changed.emit(maxi(hp, 0), max_hp)
	if hp <= 0:
		died.emit()
	return true


func grant_smoke_step() -> void:
	ghost_time = 6.0
	invincibility = maxf(invincibility, 6.0)


func _draw() -> void:
	var alpha := 0.38 if invincibility > 0.0 and fmod(invincibility * 12.0, 2.0) > 1.0 else 1.0
	var body_color := Color(0.12, 0.11, 0.10, alpha)
	var scarf_color := Color(1.0, 0.81, 0.25, alpha)
	var bag_size := clampf(4.0 + carried_weight * 0.42, 4.0, 20.0)
	var back := Vector2.from_angle(facing + PI)
	var side := back.rotated(PI * 0.5)
	var scarf_points := PackedVector2Array(
		[
			Vector2.ZERO,
			back * 18.0 + side * 5.0,
			back * 30.0 - side * 3.0,
			back * 14.0 - side * 6.0,
		]
	)
	# soft warm aura under Jo (reads as a glow once bloom is on)
	var aura := 30.0
	draw_texture_rect(
		SOFT_LIGHT,
		Rect2(-aura, -aura, aura * 2.0, aura * 2.0),
		false,
		Color(1.0, 0.82, 0.4, 0.28 * alpha)
	)
	if ghost_time > 0.0:
		var g := 34.0
		draw_texture_rect(
			SOFT_LIGHT,
			Rect2(-g, -g, g * 2.0, g * 2.0),
			false,
			Color(0.66, 0.55, 1.0, 0.45)
		)
	draw_colored_polygon(scarf_points, scarf_color)
	draw_circle(back * 10.0, bag_size, Color(0.35, 0.26, 0.13, alpha))
	draw_circle(Vector2.ZERO, RADIUS, body_color)
	draw_circle(Vector2.from_angle(facing) * 3.0, RADIUS * 0.62, Color(0.13, 0.09, 0.05, alpha))
	draw_arc(Vector2.ZERO, RADIUS * 0.52, 0.0, TAU, 24, scarf_color, 4.0)
	if _lantern:
		_lantern.color = Color(0.72, 0.6, 1.0) if ghost_time > 0.0 else Color(1.0, 0.86, 0.55)
