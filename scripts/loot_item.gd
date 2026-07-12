class_name GreedrunLoot
extends Node2D

const SOFT_LIGHT := preload("res://gfx/soft_light.tres")

var loot_type := "coin"
var display_name := "Loose Coin"
var value := 60
var weight := 1.0
var noise := 0.0
var marked := 0.0
var kind := "common"
var elevation := -1
var is_hidden := false
var picked := false
var destroyed := false
var base_value := 0
var artifact_name := ""
var artifact_flavor := ""
var boon := ""
var pulse := 0.0
var scurry := 0.0


func configure(config: Dictionary) -> void:
	loot_type = str(config.get("type", "coin"))
	display_name = str(config.get("name", "Loose Coin"))
	value = int(config.get("value", 60))
	base_value = int(config.get("base_value", value))
	weight = float(config.get("weight", 1.0))
	noise = float(config.get("noise", 0.0))
	marked = float(config.get("marked", 0.0))
	kind = str(config.get("kind", "common"))
	elevation = int(config.get("elevation", -1))
	is_hidden = bool(config.get("hidden", false))
	artifact_name = str(config.get("artifact_name", display_name))
	artifact_flavor = str(config.get("artifact_flavor", ""))
	boon = str(config.get("boon", ""))
	visible = not is_hidden
	queue_redraw()


func set_revealed(value_revealed: bool) -> void:
	is_hidden = not value_revealed
	visible = value_revealed and not picked and not destroyed
	queue_redraw()


func mark_picked() -> void:
	picked = true
	visible = false


func shatter() -> void:
	picked = false
	destroyed = true
	visible = false


func _process(delta: float) -> void:
	pulse += delta * 3.5
	if visible:
		queue_redraw()


func _draw() -> void:
	if is_hidden or picked or destroyed:
		return
	var glow := 1.0 + sin(pulse) * 0.12
	var color := Color(0.96, 0.77, 0.24)
	match kind:
		"valuable":
			color = Color(0.38, 0.85, 0.95)
		"cursed":
			color = Color(0.66, 0.55, 1.0)
		"living":
			color = Color(0.52, 0.90, 0.57)
		"royal":
			color = Color(1.0, 0.87, 0.42)
		"fragile":
			color = Color(0.84, 0.92, 0.96)
		"artifact":
			color = Color(0.75, 0.58, 1.0)
		"mythic":
			color = Color(0.72, 0.45, 1.0)
	# Soft radial glow (blooms under the WorldEnvironment) instead of a flat disc.
	var glow_radius := 26.0 * glow
	var glow_strength := 0.85 if kind in ["artifact", "mythic", "royal", "cursed"] else 0.6
	draw_texture_rect(
		SOFT_LIGHT,
		Rect2(-glow_radius, -glow_radius, glow_radius * 2.0, glow_radius * 2.0),
		false,
		Color(color.r, color.g, color.b, glow_strength)
	)
	match loot_type:
		"coin":
			draw_circle(Vector2.ZERO, 6.0, color)
			draw_arc(Vector2.ZERO, 6.0, 0.0, TAU, 16, color.lightened(0.35), 2.0)
		"gem", "living":
			var points := PackedVector2Array(
				[Vector2(0, -10), Vector2(8, 0), Vector2(0, 10), Vector2(-8, 0)]
			)
			draw_colored_polygon(points, color)
		"idol":
			draw_rect(Rect2(-7, -10, 14, 20), color, true)
			draw_circle(Vector2(0, -10), 6.0, color.lightened(0.2))
		"mask":
			draw_circle(Vector2.ZERO, 10.0, color)
			draw_circle(Vector2(-3, -1), 1.8, Color(0.1, 0.08, 0.06))
			draw_circle(Vector2(3, -1), 1.8, Color(0.1, 0.08, 0.06))
		"royal":
			var crown := PackedVector2Array(
				[
					Vector2(-11, 7),
					Vector2(-9, -7),
					Vector2(-3, 0),
					Vector2(0, -10),
					Vector2(4, 0),
					Vector2(10, -7),
					Vector2(11, 7)
				]
			)
			draw_colored_polygon(crown, color)
		"fragile":
			draw_circle(Vector2(0, 2), 8.0, color)
			draw_rect(Rect2(-4, -10, 8, 7), color, true)
		"artifact":
			draw_rect(Rect2(-9, -9, 18, 18), color, true)
			draw_rect(Rect2(-5, -5, 10, 10), Color(0.14, 0.1, 0.18), true)
		"heart":
			draw_circle(Vector2(-5, -2), 8.0, color)
			draw_circle(Vector2(5, -2), 8.0, color)
			var tri := PackedVector2Array([Vector2(-12, 0), Vector2(12, 0), Vector2(0, 15)])
			draw_colored_polygon(tri, color)
