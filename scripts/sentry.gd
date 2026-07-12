class_name GreedrunSentry
extends Node2D

var center_angle := 0.0
var angle := 0.0
var direction := 1.0
var sweep := 0.75
var cooldown := 0.0
var hot := 0.0


func configure(center: float) -> void:
	center_angle = center
	angle = center


func update_sentry(delta: float, player: GreedrunPlayer, vault: GreedrunVault) -> void:
	cooldown = maxf(0.0, cooldown - delta)
	hot = maxf(0.0, hot - delta)
	angle += direction * 1.1 * delta
	if angle > center_angle + sweep:
		angle = center_angle + sweep
		direction = -1.0
	elif angle < center_angle - sweep:
		angle = center_angle - sweep
		direction = 1.0
	if player.ghost_time <= 0.0 and sees(player, vault) and cooldown <= 0.0:
		cooldown = 2.2
		hot = 0.6
		vault.trip_alarm(global_position)
	queue_redraw()


func sees(player: GreedrunPlayer, vault: GreedrunVault) -> bool:
	var to_player: Vector2 = player.global_position - global_position
	if to_player.length() > 250.0:
		return false
	var angle_delta: float = wrapf(to_player.angle() - angle, -PI, PI)
	return absf(angle_delta) <= 0.42 and vault.los_clear(global_position, player.global_position)


func _draw() -> void:
	var color: Color = Color(0.95, 0.25, 0.18) if hot > 0.0 else Color(0.92, 0.72, 0.25)
	var p1: Vector2 = Vector2.from_angle(angle - 0.42) * 250.0
	var p2: Vector2 = Vector2.from_angle(angle + 0.42) * 250.0
	draw_colored_polygon(
		PackedVector2Array([Vector2.ZERO, p1, p2]), Color(color.r, color.g, color.b, 0.08)
	)
	draw_circle(Vector2.ZERO, 10.0, color)
	draw_line(Vector2.ZERO, Vector2.from_angle(angle) * 18.0, Color.WHITE, 2.0)
