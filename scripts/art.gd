class_name Art
extends RefCounted

## Shared helpers for the generated art (see docs/ART_PIPELINE.md). Textures are
## cached and return null when missing / not yet imported, so every caller can
## fall back to the original procedural drawing.

## On-screen repeat period (px) for tiled floor / wall / platform textures.
const SURFACE_TILE_PX := 384.0

static var _cache: Dictionary = {}


static func texture(path: String) -> Texture2D:
	if _cache.has(path):
		return _cache[path]
	var tex: Texture2D = load(path) if ResourceLoader.exists(path) else null
	_cache[path] = tex
	return tex


static func draw_tiled(
	canvas: CanvasItem, tex: Texture2D, rect: Rect2, tint := Color.WHITE
) -> void:
	# Tile a 1024px texture across `rect` at SURFACE_TILE_PX on-screen period.
	var s := SURFACE_TILE_PX / float(tex.get_width())
	canvas.draw_set_transform(rect.position, 0.0, Vector2(s, s))
	canvas.draw_texture_rect(tex, Rect2(Vector2.ZERO, rect.size / s), true, tint)
	canvas.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)


static func paint_surface(
	canvas: CanvasItem, tex: Texture2D, rect: Rect2, flat: Color, tint := Color.WHITE
) -> void:
	# Tiled texture when present, else the original flat colour fill.
	if tex != null:
		draw_tiled(canvas, tex, rect, tint)
	else:
		canvas.draw_rect(rect, flat, true)
