class_name GreedrunTouchOverlay
extends Control

signal movement_changed(vector: Vector2)
signal extract_changed(held: bool)

var move_id := -1
var extract_id := -1
var origin := Vector2.ZERO
var current := Vector2.ZERO
var move_vector := Vector2.ZERO


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_process_unhandled_input(true)


func _unhandled_input(event: InputEvent) -> void:
	if not visible:
		return
	var width := get_viewport_rect().size.x
	if event is InputEventScreenTouch:
		if event.pressed:
			if event.position.x < width * 0.55 and move_id < 0:
				move_id = event.index
				origin = event.position
				current = origin
				queue_redraw()
			elif extract_id < 0:
				extract_id = event.index
				extract_changed.emit(true)
		else:
			if event.index == move_id:
				move_id = -1
				move_vector = Vector2.ZERO
				movement_changed.emit(move_vector)
				queue_redraw()
			if event.index == extract_id:
				extract_id = -1
				extract_changed.emit(false)
	elif event is InputEventScreenDrag and event.index == move_id:
		current = event.position
		var delta := current - origin
		move_vector = delta.limit_length(56.0) / 56.0
		movement_changed.emit(move_vector)
		queue_redraw()


func reset() -> void:
	move_id = -1
	extract_id = -1
	move_vector = Vector2.ZERO
	movement_changed.emit(Vector2.ZERO)
	extract_changed.emit(false)
	queue_redraw()


func _draw() -> void:
	if move_id >= 0:
		draw_circle(origin, 58.0, Color(0.08, 0.07, 0.05, 0.45))
		draw_arc(origin, 58.0, 0, TAU, 40, Color(0.95, 0.75, 0.25, 0.55), 3.0)
		draw_circle(origin + move_vector * 42.0, 23.0, Color(0.95, 0.75, 0.25, 0.65))
	var size := get_viewport_rect().size
	var center := Vector2(size.x - 84, size.y - 88)
	draw_circle(center, 48.0, Color(0.08, 0.07, 0.05, 0.38))
	draw_arc(center, 48.0, 0, TAU, 36, Color(0.95, 0.75, 0.25, 0.45), 3.0)
