class_name GreedrunVignette
extends ColorRect
## Screen-space atmosphere layer. Reads run heat, eases the shader toward it,
## and exposes flash() for alarms. Purely cosmetic — never touches run state.

var _heat := 0.0
var _curse := 0.0
var _flash := 0.0
var _t_heat := 0.0
var _t_curse := 0.0


func set_from_heat(heat_tier: int) -> void:
	_t_heat = clampf(float(heat_tier) / 6.0, 0.0, 1.0)
	# curse mood creeps in a tier behind heat and caps lower
	_t_curse = clampf(float(heat_tier - 1) / 6.0, 0.0, 0.7)


func clear_levels() -> void:
	_t_heat = 0.0
	_t_curse = 0.0


func flash() -> void:
	_flash = 1.0


func _process(delta: float) -> void:
	if material == null:
		return
	_heat = lerpf(_heat, _t_heat, clampf(delta * 3.0, 0.0, 1.0))
	_curse = lerpf(_curse, _t_curse, clampf(delta * 2.0, 0.0, 1.0))
	_flash = maxf(0.0, _flash - delta * 2.2)
	material.set_shader_parameter("heat_amt", _heat)
	material.set_shader_parameter("curse_amt", _curse)
	material.set_shader_parameter("flash_amt", _flash)
