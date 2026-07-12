class_name GreedrunGuard
extends Node2D

var state := "patrol"
var waypoints: Array[Vector2] = []
var waypoint_index := 0
var last_known := Vector2.ZERO
var search_time := 0.0
var alert := 0.0
var hit_cooldown := 0.0
var facing := 0.0
var elite := false
var hunter := false
var radius := 14.0


func configure(points: Array[Vector2], is_elite: bool = false, is_hunter: bool = false) -> void:
	waypoints.clear()
	for point: Vector2 in points:
		waypoints.append(point)
	elite = is_elite
	hunter = is_hunter
	queue_redraw()


func update_ai(
	delta: float, player: GreedrunPlayer, vault: GreedrunVault, detect_radius: float, base_speed: float
) -> void:
	hit_cooldown = maxf(0.0, hit_cooldown - delta)
	var own_detect: float = detect_radius * (1.25 if hunter else 1.2 if elite else 1.0)
	var own_speed: float = base_speed * (1.10 if hunter else 1.12 if elite else 1.0)
	if player.ghost_time > 0.0:
		state = "patrol"
		alert = 0.0
	var seeing: bool = (
		player.ghost_time <= 0.0
		and global_position.distance_squared_to(player.global_position) < own_detect * own_detect
		and vault.los_clear(global_position, player.global_position)
	)
	if seeing:
		state = "chase"
		alert = minf(1.0, alert + delta * 3.0)
		last_known = player.global_position
		vault.mark_spotted()
	elif state == "chase":
		state = "investigate"
		search_time = 3.5 if hunter else 2.4
	else:
		alert = maxf(0.0, alert - delta * 0.5)
	var target: Vector2 = global_position
	var speed: float = own_speed
	if state == "chase":
		target = player.global_position
		speed *= 1.35
	elif state == "investigate":
		target = last_known
		speed *= 1.05
		if global_position.distance_squared_to(target) < 900.0:
			search_time -= delta
			facing += delta * 3.4
			if search_time <= 0.0:
				state = "patrol"
			return
	elif not waypoints.is_empty():
		target = waypoints[waypoint_index]
		if global_position.distance_squared_to(target) < 1024.0:
			waypoint_index = (waypoint_index + 1) % waypoints.size()
	var move_direction: Vector2 = global_position.direction_to(target)
	if move_direction.length_squared() > 0.001:
		facing = move_direction.angle()
		var step: Vector2 = move_direction * speed * delta
		var candidate: Vector2 = global_position + step
		if vault.can_move(candidate, radius, hunter):
			global_position = candidate
		elif vault.can_move(Vector2(candidate.x, global_position.y), radius, hunter):
			global_position.x = candidate.x
		elif vault.can_move(Vector2(global_position.x, candidate.y), radius, hunter):
			global_position.y = candidate.y
	queue_redraw()


func _draw() -> void:
	var color: Color = (
		Color(0.82, 0.25, 0.18)
		if hunter
		else Color(0.78, 0.60, 0.24) if elite else Color(0.52, 0.45, 0.33)
	)
	draw_circle(Vector2.ZERO, radius, color)
	draw_line(Vector2.ZERO, Vector2.from_angle(facing) * 18.0, Color(1, 0.86, 0.58), 3.0)
	if state == "chase":
		draw_arc(Vector2.ZERO, radius + 5.0, 0, TAU, 24, Color(0.95, 0.25, 0.17), 2.0)
