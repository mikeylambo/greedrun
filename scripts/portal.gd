class_name GreedrunPortal
extends Node2D

const SOFT_LIGHT := preload("res://gfx/soft_light.tres")

var radius := 26.0
var spin := 0.0


func _process(delta: float) -> void:
	spin += delta * 1.6
	queue_redraw()


func _draw() -> void:
	var halo := radius * (2.4 + sin(spin * 1.3) * 0.12)
	draw_texture_rect(
		SOFT_LIGHT,
		Rect2(-halo, -halo, halo * 2.0, halo * 2.0),
		false,
		Color(0.98, 0.82, 0.4, 0.5)
	)
	draw_arc(Vector2.ZERO, radius, spin, spin + PI * 1.45, 32, Color(0.95, 0.75, 0.25), 5.0)
	draw_arc(Vector2.ZERO, radius - 8.0, -spin, -spin + PI * 1.4, 28, Color(0.55, 0.85, 0.78), 3.0)
