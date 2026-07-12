extends Node

const VAULT_SCENE := preload("res://scenes/Vault.tscn")
const TOUCH_OVERLAY_SCRIPT := preload("res://scripts/touch_overlay.gd")

const GOLD := Color("#f5c542")
const BONE := Color("#f0e7d2")
const MUTED := Color("#a69b86")
const PANEL := Color("#17130d")
const PANEL_LINE := Color("#46391f")
const HEAT := Color("#e0503f")
const OK := Color("#8fe39a")
const PURPLE := Color("#a98bff")

const SOFT_LIGHT := preload("res://gfx/soft_light.tres")
const VIGNETTE_SHADER := preload("res://gfx/vignette.gdshader")
const CINZEL := preload("res://assets/fonts/Cinzel.ttf")

var world_root: Node2D
var canvas_layer: CanvasLayer
var vignette: GreedrunVignette
var screens: Dictionary = {}
var screen_boxes: Dictionary = {}
var vault: GreedrunVault
var hud: Control
var hud_hearts: Label
var hud_haul: Label
var hud_load: Label
var hud_heat: Label
var hud_secured: Label
var hud_contract: Label
var hud_timer: Label
var hud_prompt: Label
var toast_label: Label
var toast_timer: Timer
var touch_overlay: GreedrunTouchOverlay
var hideout_bank: Label
var hideout_notoriety: Label
var shop_bank: Label
var shop_grid: GridContainer
var collection_bank: Label
var collection_grid: GridContainer
var contracts_box: VBoxContainer
var ascension_title: Label
var ascension_summary: Label
var ascension_minus: Button
var ascension_plus: Button
var result_title: Label
var result_amount: Label
var result_body: Label
var result_stats: Label
var result_continue: Button
var one_more_label: Label
var artifact_title: Label
var artifact_flavor: Label
var artifact_buttons: Array[Button] = []
var fence_box: VBoxContainer
var fence_total: Label
var fence_note: Label
var pending_result: Dictionary = {}
var contract_rng := RandomNumberGenerator.new()
var reset_armed := false


func _ready() -> void:
	_ensure_input_map()
	contract_rng.randomize()
	world_root = Node2D.new()
	world_root.name = "WorldRoot"
	add_child(world_root)
	_build_atmosphere()
	_build_ui()
	_show_screen("title")


func _build_atmosphere() -> void:
	# 2D bloom so bright gold loot, Jo's aura and the portal actually glow.
	# Requires the Mobile/Forward+ renderer (set in project.godot).
	get_viewport().use_hdr_2d = true
	var world_env := WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_CANVAS
	env.glow_enabled = true
	env.glow_intensity = 0.55
	env.glow_strength = 1.0
	env.glow_bloom = 0.05
	env.glow_blend_mode = Environment.GLOW_BLEND_MODE_ADDITIVE
	env.glow_hdr_threshold = 0.9
	world_env.environment = env
	add_child(world_env)

	# Gentle warm cast over the world layer only (HUD lives on canvas_layer 20).
	var modulate := CanvasModulate.new()
	modulate.color = Color(0.97, 0.92, 0.82)
	world_root.add_child(modulate)

	# Screen-space vignette / heat / curse / alarm — above world, below HUD.
	var fx_layer := CanvasLayer.new()
	fx_layer.layer = 15
	add_child(fx_layer)
	vignette = GreedrunVignette.new()
	vignette.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	vignette.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vignette.color = Color(0, 0, 0, 0)
	var mat := ShaderMaterial.new()
	mat.shader = VIGNETTE_SHADER
	vignette.material = mat
	fx_layer.add_child(vignette)


func _ensure_input_map() -> void:
	_add_key_action("move_left", KEY_A)
	_add_key_action("move_left", KEY_LEFT)
	_add_key_action("move_right", KEY_D)
	_add_key_action("move_right", KEY_RIGHT)
	_add_key_action("move_up", KEY_W)
	_add_key_action("move_up", KEY_UP)
	_add_key_action("move_down", KEY_S)
	_add_key_action("move_down", KEY_DOWN)
	_add_key_action("extract", KEY_E)
	_add_key_action("pause_run", KEY_P)
	_add_key_action("pause_run", KEY_ESCAPE)


func _add_key_action(action: StringName, keycode: int) -> void:
	if not InputMap.has_action(action):
		InputMap.add_action(action)
	for existing: InputEvent in InputMap.action_get_events(action):
		if existing is InputEventKey and existing.physical_keycode == keycode:
			return
	var event := InputEventKey.new()
	event.physical_keycode = keycode
	InputMap.action_add_event(action, event)


func _build_ui() -> void:
	canvas_layer = CanvasLayer.new()
	canvas_layer.layer = 20
	add_child(canvas_layer)
	_build_title()
	_build_hideout()
	_build_shop()
	_build_collection()
	_build_contracts()
	_build_one_more()
	_build_artifact()
	_build_result()
	_build_fence()
	_build_pause()
	_build_how_to()
	_build_hud()
	toast_label = Label.new()
	toast_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toast_label.add_theme_color_override("font_color", GOLD)
	toast_label.add_theme_font_size_override("font_size", 19)
	toast_label.set_anchors_preset(Control.PRESET_CENTER_TOP)
	toast_label.position = Vector2(-250, 78)
	toast_label.size = Vector2(500, 38)
	toast_label.visible = false
	canvas_layer.add_child(toast_label)
	toast_timer = Timer.new()
	toast_timer.one_shot = true
	toast_timer.timeout.connect(_on_toast_timeout)
	add_child(toast_timer)
	touch_overlay = TOUCH_OVERLAY_SCRIPT.new()
	touch_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	touch_overlay.visible = false
	touch_overlay.movement_changed.connect(_on_touch_movement)
	touch_overlay.extract_changed.connect(_on_touch_extract)
	canvas_layer.add_child(touch_overlay)


func _new_screen(id: String, width := 680.0) -> VBoxContainer:
	var root := Control.new()
	root.name = id.capitalize()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var shade := ColorRect.new()
	shade.color = Color(0.035, 0.03, 0.022, 0.94)
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_child(shade)
	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_child(center)
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(width, 0)
	var panel_style := StyleBoxFlat.new()
	panel_style.bg_color = PANEL
	panel_style.border_color = PANEL_LINE
	panel_style.set_border_width_all(1)
	panel_style.set_corner_radius_all(12)
	panel_style.content_margin_left = 28
	panel_style.content_margin_right = 28
	panel_style.content_margin_top = 24
	panel_style.content_margin_bottom = 24
	panel.add_theme_stylebox_override("panel", panel_style)
	center.add_child(panel)
	var box := VBoxContainer.new()
	box.alignment = BoxContainer.ALIGNMENT_CENTER
	box.add_theme_constant_override("separation", 12)
	panel.add_child(box)
	canvas_layer.add_child(root)
	screens[id] = root
	screen_boxes[id] = box
	return box


func _title(text: String, size := 36, color := GOLD) -> Label:
	var label := Label.new()
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_color_override("font_color", color)
	label.add_theme_font_override("font", CINZEL)
	label.add_theme_font_size_override("font_size", size)
	return label


func _body(text: String, color := BONE) -> Label:
	var label := Label.new()
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.add_theme_color_override("font_color", color)
	label.add_theme_font_size_override("font_size", 15)
	return label


func _button(text: String, callback: Callable, min_width := 250.0) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(min_width, 44)
	button.add_theme_color_override("font_color", BONE)
	button.add_theme_color_override("font_hover_color", GOLD)
	button.add_theme_font_override("font", CINZEL)
	button.add_theme_font_size_override("font_size", 16)
	button.pressed.connect(callback)
	return button


func _build_title() -> void:
	var box := _new_screen("title", 620)
	box.add_child(_title("JO: GREEDRUN", 48))
	box.add_child(
		_body(
			"A one-finger loot-heist roguelite\nHow greedy can you be before the vault owns you?",
			MUTED
		)
	)
	box.add_child(_button("ENTER THE HIDEOUT", _open_hideout))
	box.add_child(_button("HOW TO PLAY", _open_how_to))


func _build_hideout() -> void:
	var box := _new_screen("hideout", 650)
	box.add_child(_title("THE HIDEOUT", 34))
	hideout_bank = _title("$0", 30, GOLD)
	box.add_child(hideout_bank)
	hideout_notoriety = _body("")
	box.add_child(hideout_notoriety)
	box.add_child(_button("CONTRACTS BOARD", _open_contracts))
	box.add_child(_button("UPGRADES", _open_shop))
	box.add_child(_button("THE COLLECTION", _open_collection))
	box.add_child(_button("HOW TO PLAY", _open_how_to))
	box.add_child(_button("RESET PROGRESS", _reset_progress))


func _build_shop() -> void:
	var box := _new_screen("shop", 820)
	box.add_child(_title("TOOLS OF THE TRADE", 32))
	shop_bank = _title("$0", 27)
	box.add_child(shop_bank)
	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(760, 390)
	box.add_child(scroll)
	shop_grid = GridContainer.new()
	shop_grid.columns = 2
	shop_grid.add_theme_constant_override("h_separation", 10)
	shop_grid.add_theme_constant_override("v_separation", 10)
	scroll.add_child(shop_grid)
	box.add_child(_button("BACK TO HIDEOUT", _open_hideout))


func _build_collection() -> void:
	var box := _new_screen("collection", 820)
	box.add_child(_title("THE COLLECTION", 32))
	collection_bank = _title("$0", 26)
	box.add_child(collection_bank)
	var collection_copy := (
		"Keep a notable treasure instead of selling it. "
		+ "Restore trophies to deepen their passive bonuses."
	)
	box.add_child(_body(collection_copy, MUTED))
	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(760, 390)
	box.add_child(scroll)
	collection_grid = GridContainer.new()
	collection_grid.columns = 2
	collection_grid.add_theme_constant_override("h_separation", 10)
	collection_grid.add_theme_constant_override("v_separation", 10)
	scroll.add_child(collection_grid)
	box.add_child(_button("BACK TO HIDEOUT", _open_hideout))


func _build_contracts() -> void:
	var box := _new_screen("contracts", 720)
	box.add_child(_title("CONTRACTS BOARD", 32))
	box.add_child(_body("Three standing jobs and one no-questions-asked free run.", MUTED))
	var ascension_row := HBoxContainer.new()
	ascension_row.alignment = BoxContainer.ALIGNMENT_CENTER
	ascension_row.add_theme_constant_override("separation", 14)
	ascension_minus = _button("−", _shift_ascension.bind(-1), 52)
	ascension_row.add_child(ascension_minus)
	ascension_title = _title("ASCENSION 0", 22)
	ascension_title.custom_minimum_size = Vector2(220, 0)
	ascension_row.add_child(ascension_title)
	ascension_plus = _button("+", _shift_ascension.bind(1), 52)
	ascension_row.add_child(ascension_plus)
	box.add_child(ascension_row)
	ascension_summary = _body("", MUTED)
	box.add_child(ascension_summary)
	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(660, 390)
	box.add_child(scroll)
	contracts_box = VBoxContainer.new()
	contracts_box.add_theme_constant_override("separation", 10)
	scroll.add_child(contracts_box)
	box.add_child(_button("FREE RUN", _start_free_run))
	box.add_child(_button("BACK", _open_hideout))


func _build_one_more() -> void:
	var box := _new_screen("onemore", 650)
	box.add_child(_title("ONE MORE THING?", 48, Color("#ffcf3f")))
	one_more_label = _body("")
	box.add_child(one_more_label)
	box.add_child(
		_body(
			"Leave now and the haul is certain. Stay, and the Vault Heart wakes with every guard.",
			MUTED
		)
	)
	box.add_child(_button("LEAVE WITH THE HAUL", _leave_with_haul))
	box.add_child(_button("STAY GREEDY", _resume_one_more))


func _build_artifact() -> void:
	var box := _new_screen("artifact", 760)
	artifact_title = _title("DECISION ARTIFACT", 36, PURPLE)
	box.add_child(artifact_title)
	artifact_flavor = _body("")
	box.add_child(artifact_flavor)
	for i in range(3):
		var button := _button("CHOICE", _choose_artifact.bind(i), 600)
		artifact_buttons.append(button)
		box.add_child(button)


func _build_result() -> void:
	var box := _new_screen("result", 690)
	result_title = _title("EXTRACTION", 34)
	box.add_child(result_title)
	result_amount = _title("$0", 48)
	box.add_child(result_amount)
	result_body = _body("")
	box.add_child(result_body)
	result_stats = _body("")
	box.add_child(result_stats)
	result_continue = _button("CONTINUE", _route_after_result)
	box.add_child(result_continue)


func _build_fence() -> void:
	var box := _new_screen("fence", 820)
	box.add_child(_title("MOVE THE GOODS", 32))
	fence_total = _title("$0", 30)
	box.add_child(fence_total)
	fence_note = _body("")
	box.add_child(fence_note)
	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(760, 390)
	box.add_child(scroll)
	fence_box = VBoxContainer.new()
	fence_box.add_theme_constant_override("separation", 10)
	scroll.add_child(fence_box)
	box.add_child(_button("BANK THE HAUL", _bank_fence))


func _build_pause() -> void:
	var box := _new_screen("pause", 560)
	box.add_child(_title("PAUSED", 42, BONE))
	box.add_child(_button("RESUME", _resume_pause))
	box.add_child(_button("HOW TO PLAY", _open_how_to))
	box.add_child(_button("ABANDON RUN", _abandon_run))


func _build_how_to() -> void:
	var box := _new_screen("howto", 720)
	box.add_child(_title("HOW TO PLAY", 34))
	var how_to_copy := (
		"MOVE — WASD / arrow keys, or drag on the left side of a touchscreen.\n\n"
		+ "LOOT — walk over valuables. Every item adds value, weight, noise, "
		+ "and sometimes marked-goods Heat.\n\n"
		+ "ESCAPE — return to the portal and hold E, or hold the right side "
		+ "of the touchscreen.\n\n"
		+ "VERTICALITY — steer onto stairs. Step off a ledge and a heavy bag "
		+ "may make noise or cost a heart.\n\n"
		+ "THE RULE — leaving safely is smart. Taking one more thing is Jo."
	)
	box.add_child(_body(how_to_copy, BONE))
	box.add_child(_button("BACK", _close_how_to))


func _build_hud() -> void:
	hud = Control.new()
	hud.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	hud.visible = false
	canvas_layer.add_child(hud)
	var top := HBoxContainer.new()
	top.position = Vector2(18, 14)
	top.size = Vector2(924, 80)
	top.add_theme_constant_override("separation", 24)
	hud.add_child(top)
	var left := VBoxContainer.new()
	left.custom_minimum_size = Vector2(230, 0)
	top.add_child(left)
	hud_hearts = _body("♥♥♥", HEAT)
	hud_hearts.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	left.add_child(hud_hearts)
	hud_haul = _title("$0", 24)
	hud_haul.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	left.add_child(hud_haul)
	hud_load = _body("Light · Silent", MUTED)
	hud_load.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	left.add_child(hud_load)
	hud_contract = _body("")
	hud_contract.custom_minimum_size = Vector2(420, 0)
	top.add_child(hud_contract)
	var right := VBoxContainer.new()
	right.custom_minimum_size = Vector2(200, 0)
	top.add_child(right)
	hud_heat = _body("HEAT T0", GOLD)
	hud_heat.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	right.add_child(hud_heat)
	hud_secured = _body("0 / 0 secured", MUTED)
	hud_secured.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	right.add_child(hud_secured)
	hud_timer = _title("", 24, HEAT)
	hud_timer.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	right.add_child(hud_timer)
	var pause_button := _button("Ⅱ", _pause_run, 52)
	pause_button.position = Vector2(884, 100)
	pause_button.size = Vector2(52, 44)
	hud.add_child(pause_button)
	hud_prompt = _title("", 20, GOLD)
	hud_prompt.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	hud_prompt.position = Vector2(-300, -74)
	hud_prompt.size = Vector2(600, 40)
	hud.add_child(hud_prompt)


func _on_toast_timeout() -> void:
	toast_label.visible = false


func _on_touch_movement(value: Vector2) -> void:
	if vault:
		vault.set_touch_vector(value)


func _on_touch_extract(held: bool) -> void:
	if vault:
		vault.set_touch_extract(held)


func _open_how_to() -> void:
	_show_screen("howto")


func _close_how_to() -> void:
	if vault:
		_resume_pause()
	else:
		_open_hideout()


func _start_free_run() -> void:
	_start_run({})


func _leave_with_haul() -> void:
	if vault:
		vault.finish_run(true)


func _choose_artifact(index: int) -> void:
	if vault:
		_show_screen("")
		vault.resolve_artifact(index)


func _disarm_reset() -> void:
	reset_armed = false


func _show_screen(id: String) -> void:
	for key: String in screens.keys():
		screens[key].visible = key == id
	hud.visible = id.is_empty() and vault != null
	touch_overlay.visible = hud.visible and DisplayServer.is_touchscreen_available()
	GameState.change(id if not id.is_empty() else "playing")


func _open_hideout() -> void:
	if vault:
		vault.queue_free()
		vault = null
	hideout_bank.text = "$%s" % _money(MetaSave.gold())
	var notoriety := MetaSave.notoriety()
	if notoriety > 0:
		hideout_notoriety.text = "Notoriety %d · return marked goods to cool the world." % notoriety
	else:
		hideout_notoriety.text = "Low profile. The vaults have not learned your name yet."
	_show_screen("hideout")


func _open_shop() -> void:
	_rebuild_shop()
	_show_screen("shop")


func _rebuild_shop() -> void:
	_clear(shop_grid)
	shop_bank.text = "$%s" % _money(MetaSave.gold())
	for upgrade: Dictionary in Progression.UPGRADES:
		var level := MetaSave.upgrade_level(str(upgrade.id))
		var cost := Progression.upgrade_cost(upgrade)
		var maxed := level >= int(upgrade.max)
		var price_text := "MAX" if maxed else "$" + _money(cost)
		var text := (
			"%s  ·  Lv %d/%d\n%s\n%s"
			% [upgrade.name, level, upgrade.max, upgrade.description, price_text]
		)
		var button := _button(text, _on_upgrade_pressed.bind(str(upgrade.id)), 360)
		button.custom_minimum_size.y = 92
		button.disabled = maxed or MetaSave.gold() < cost
		shop_grid.add_child(button)


func _on_upgrade_pressed(id: String) -> void:
	var upgrade := Progression.upgrade_by_id(id)
	var level := MetaSave.upgrade_level(id)
	var cost := Progression.upgrade_cost(upgrade)
	if level < int(upgrade.max) and MetaSave.spend_gold(cost):
		MetaSave.set_upgrade_level(id, level + 1)
		MetaSave.save()
		_toast("%s — Lv %d" % [upgrade.name, level + 1])
		_rebuild_shop()


func _open_collection() -> void:
	_rebuild_collection()
	_show_screen("collection")


func _rebuild_collection() -> void:
	_clear(collection_grid)
	collection_bank.text = "$%s" % _money(MetaSave.gold())
	for trophy: Dictionary in Progression.TROPHIES:
		var level := MetaSave.collection_level(str(trophy.id))
		var owned := level > 0
		var cost := Progression.restore_cost(trophy)
		var maxed := level >= int(trophy.max)
		var trophy_name := str(trophy.name) if owned else "— empty pedestal —"
		var text := "%s\n%s\n" % [trophy.passive, trophy_name]
		text += (
			Progression.trophy_effect_label(str(trophy.id), level)
			if owned
			else "Keep this treasure at the fence."
		)
		if maxed:
			text += "\nFULLY RESTORED"
		elif owned:
			text += "\n$" + _money(cost)
		else:
			text += "\nNOT CLAIMED"
		var button := _button(text, _on_restore_pressed.bind(str(trophy.id)), 360)
		button.custom_minimum_size.y = 112
		button.disabled = not owned or maxed or MetaSave.gold() < cost
		collection_grid.add_child(button)


func _on_restore_pressed(id: String) -> void:
	var trophy := Progression.trophy_by_id(id)
	var level := MetaSave.collection_level(id)
	var cost := Progression.restore_cost(trophy)
	if level > 0 and level < int(trophy.max) and MetaSave.spend_gold(cost):
		MetaSave.set_collection_level(id, level + 1)
		MetaSave.save()
		_toast("%s restored — Lv %d" % [trophy.passive, level + 1])
		_rebuild_collection()


func _shift_ascension(delta: int) -> void:
	GameState.ascension_level = clampi(
		GameState.ascension_level + delta, 0, AscensionModifiers.highest_unlocked()
	)
	_refresh_ascension_row()


func _refresh_ascension_row() -> void:
	var unlocked := AscensionModifiers.highest_unlocked()
	GameState.ascension_level = clampi(GameState.ascension_level, 0, unlocked)
	var level := GameState.ascension_level
	ascension_title.text = "ASCENSION %d" % level
	ascension_minus.disabled = level <= 0
	ascension_plus.disabled = level >= unlocked
	if unlocked == 0:
		ascension_summary.text = "Ascension is locked — max every upgrade and trophy to open it."
	elif level == 0:
		ascension_summary.text = (
			"Standard vault. Ascend up to %d for harder jobs and richer payouts." % unlocked
		)
	else:
		var text := AscensionModifiers.summary(level)
		var best := MetaSave.ascension_best(level)
		if best > 0:
			text += "\nBest haul at this level: $%s" % _money(best)
		ascension_summary.text = text


func _open_contracts() -> void:
	_refresh_ascension_row()
	_clear(contracts_box)
	for contract: Dictionary in _generate_contracts(3):
		var text := (
			"%s · %s\n%s\n+$%s · %s"
			% [
				contract.title,
				contract.client,
				contract.desc,
				_money(int(contract.reward)),
				contract.location
			]
		)
		var button := _button(text, _start_run.bind(contract), 620)
		button.custom_minimum_size.y = 92
		contracts_box.add_child(button)
	_show_screen("contracts")


func _generate_contracts(count: int) -> Array[Dictionary]:
	var pool: Array[Dictionary] = []
	var quota := roundi(contract_rng.randf_range(1400, 2400) / 50.0) * 50
	pool.append(
		{
			"type": "quota",
			"title": "Smuggling Run",
			"client": "the Merchant Guild",
			"desc": "Smuggle out at least $%s of goods." % _money(quota),
			"target": quota,
			"reward": roundi(quota * 0.35)
		}
	)
	pool.append(
		{
			"type": "silent",
			"title": "Silent Job",
			"client": "a Nervous Client",
			"desc": "Extract without being spotted once.",
			"reward": 750
		}
	)
	var targets := [
		{"id": "idol", "name": "a Golden Idol"},
		{"id": "mask", "name": "a Marked Relic"},
		{"id": "living", "name": "the Skitterjewel"},
	]
	var target: Dictionary = targets[contract_rng.randi_range(0, targets.size() - 1)]
	pool.append(
		{
			"type": "steal",
			"title": "Contract Theft",
			"client": "a Noble Collector",
			"desc": "Steal %s and get it out alive." % target.name,
			"target_kind": target.id,
			"reward": 700
		}
	)
	pool.append(
		{
			"type": "sweep",
			"title": "Clean Sweep",
			"client": "a Rival Thief",
			"desc": "Clear the vault completely, then escape.",
			"reward": 1100
		}
	)
	var limit := contract_rng.randi_range(85, 120)
	pool.append(
		{
			"type": "timed",
			"title": "Timed Raid",
			"client": "the Tollhouse Keeper",
			"desc": "The vault collapses in %d seconds." % limit,
			"time_limit": limit,
			"reward": 850
		}
	)
	pool.append(
		{
			"type": "recovery",
			"title": "Recovery Job",
			"client": "an Old Fence",
			"desc": "Lay low and complete a clean extraction.",
			"reward": 400,
			"notoriety_down": 2
		}
	)
	pool.append(
		{
			"type": "heart",
			"title": "Legendary Heist",
			"client": "a Legend-Chaser",
			"desc": "Steal the Vault Heart and carry it out.",
			"reward": 1700
		}
	)
	pool.append(
		{
			"type": "untouched",
			"title": "Ghost Job",
			"client": "a Perfectionist",
			"desc": "Extract without taking a single hit.",
			"reward": 950
		}
	)
	pool.append(
		{
			"type": "hot",
			"title": "Bounty Run",
			"client": "a Thrill-Seeker",
			"desc": "Reach Heat T4 or higher, then escape.",
			"reward": 1050
		}
	)
	pool.shuffle()
	var result: Array[Dictionary] = []
	var theme_keys := GreedrunVault.THEMES.keys()
	for i in range(count):
		var contract: Dictionary = pool[i].duplicate(true)
		var theme_key := str(theme_keys[contract_rng.randi_range(0, theme_keys.size() - 1)])
		contract.theme_key = theme_key
		contract.location = GreedrunVault.THEMES[theme_key].name
		result.append(contract)
	return result


func _start_run(contract: Dictionary) -> void:
	if vault:
		vault.queue_free()
	vault = VAULT_SCENE.instantiate()
	world_root.add_child(vault)
	vault.hud_changed.connect(_update_hud)
	vault.toast_requested.connect(_toast)
	vault.one_more_requested.connect(_open_one_more)
	vault.artifact_decision_requested.connect(_open_artifact)
	vault.run_finished.connect(_open_result)
	vault.start_run(contract)
	touch_overlay.reset()
	_show_screen("")


func _open_one_more(value: int) -> void:
	one_more_label.text = "Carrying $%s · yours for certain if you leave now." % _money(value)
	_show_screen("onemore")


func _resume_one_more() -> void:
	_show_screen("")
	if vault:
		vault.accept_one_more()


func _open_artifact(data: Dictionary) -> void:
	artifact_title.text = str(data.name)
	artifact_flavor.text = str(data.flavor)
	var boon_text := {
		"sense": "Read its secrets — reveal the Vault Heart",
		"ghost": "Trade it for passage — 6s untouchable",
		"muffle": "Wrap it in silence — no carried noise",
	}
	artifact_buttons[0].text = (
		"POCKET IT WHOLE\n+$%s · heavy, loud, marked" % _money(int(data.value))
	)
	artifact_buttons[1].text = (
		"PRY IT APART\n+$%s · light and clean" % _money(roundi(int(data.value) * 0.4))
	)
	artifact_buttons[2].text = str(boon_text.get(str(data.boon), "BEND ITS POWER"))
	_show_screen("artifact")


func _open_result(result: Dictionary) -> void:
	pending_result = result
	if bool(result.perfect):
		result_title.text = "PERFECT HEIST"
	elif bool(result.escaped):
		result_title.text = "EXTRACTION"
	else:
		result_title.text = "CAUGHT"
	result_title.add_theme_color_override("font_color", OK if bool(result.escaped) else HEAT)
	result_amount.text = "$%s" % _money(int(result.haul_value))
	var body_lead := (
		"The haul made the door." if bool(result.escaped) else "The vault kept everything."
	)
	result_body.text = body_lead + '  — "%s"' % result.epithet
	var contract_line := ""
	if not result.contract.is_empty():
		var outcome := (
			"COMPLETE +$" + _money(int(result.contract_reward))
			if bool(result.contract_done)
			else "FAILED"
		)
		contract_line = "\n%s: %s" % [result.contract.title, outcome]
	var ascension_line := ""
	var ascension_played := int(result.get("ascension", 0))
	if ascension_played > 0:
		ascension_line = "\nAscension %d" % ascension_played
		if bool(result.get("ascension_new_best", false)):
			ascension_line += " · NEW BEST"
		elif bool(result.escaped) and int(result.get("ascension_best", 0)) > 0:
			ascension_line += " · best $%s" % _money(int(result.ascension_best))
	result_stats.text = (
		"Secured %d/%d · Peak Heat T%d%s%s"
		% [result.secured, result.total, result.peak_heat, contract_line, ascension_line]
	)
	result_continue.text = (
		"TO THE FENCE"
		if bool(result.escaped) and not result.pending_haul.is_empty()
		else "TO THE HIDEOUT"
	)
	_show_screen("result")


func _route_after_result() -> void:
	if pending_result.get("escaped", false) and not pending_result.pending_haul.is_empty():
		_open_fence()
		return
	if pending_result.get("escaped", false):
		var raw := roundi(int(pending_result.bulk_value) * Progression.sell_multiplier())
		MetaSave.add_gold(
			Economy.final_total(raw, int(pending_result.peak_heat), bool(pending_result.perfect))
		)
		_apply_contract_rewards()
	MetaSave.save()
	pending_result = {}
	_open_hideout()


func _open_fence() -> void:
	for item: Dictionary in pending_result.pending_haul:
		item.buyers = Economy.buyers_for(str(item.kind), int(item.value))
		item.selection = 0
	_rebuild_fence()
	_show_screen("fence")


func _rebuild_fence() -> void:
	_clear(fence_box)
	if int(pending_result.bulk_count) > 0:
		fence_box.add_child(
			_body(
				(
					"Loose coin & gems ×%d — auto-sold to the Black Market."
					% int(pending_result.bulk_count)
				),
				MUTED
			)
		)
	for i in range(pending_result.pending_haul.size()):
		var item: Dictionary = pending_result.pending_haul[i]
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 10)
		var label := _body(str(item.name))
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
		label.custom_minimum_size = Vector2(260, 42)
		row.add_child(label)
		var options := OptionButton.new()
		options.custom_minimum_size = Vector2(390, 42)
		for buyer: Dictionary in item.buyers:
			var payout_text := "$" + _money(int(buyer.payout))
			if buyer.effect == "keep":
				payout_text = str(buyer.passive)
			options.add_item("%s · %s" % [buyer.name, payout_text])
		options.select(int(item.selection))
		options.item_selected.connect(_on_buyer_selected.bind(i))
		row.add_child(options)
		fence_box.add_child(row)
	var info := _fence_totals()
	fence_total.text = "$%s" % _money(int(info.total))
	var note := "Different buyers want different goods. "
	if int(info.notoriety_delta) > 0:
		note = "Syndicate coin raises notoriety. "
	elif int(info.notoriety_delta) < 0:
		note = "Returning goods lowers notoriety. "
	var danger_percent := roundi(
		(Economy.danger_multiplier(int(pending_result.peak_heat)) - 1.0) * 100.0
	)
	fence_note.text = note + "Danger bonus +%d%%." % danger_percent


func _on_buyer_selected(selected: int, item_index: int) -> void:
	var item: Dictionary = pending_result.pending_haul[item_index]
	var buyer: Dictionary = item.buyers[selected]
	if buyer.id == "noble":
		for i in range(pending_result.pending_haul.size()):
			if i == item_index:
				continue
			var other: Dictionary = pending_result.pending_haul[i]
			var chosen: Dictionary = other.buyers[int(other.selection)]
			if chosen.id == "noble":
				other.selection = 0
	item.selection = selected
	_rebuild_fence()


func _fence_totals() -> Dictionary:
	var raw := roundi(int(pending_result.bulk_value) * Progression.sell_multiplier())
	var notoriety_delta := 0
	for item: Dictionary in pending_result.pending_haul:
		var buyer: Dictionary = item.buyers[int(item.selection)]
		raw += int(buyer.payout)
		if buyer.effect == "notoriety_up":
			notoriety_delta += 1
		elif buyer.effect == "notoriety_down":
			notoriety_delta -= 1
	return {
		"total":
		Economy.final_total(raw, int(pending_result.peak_heat), bool(pending_result.perfect)),
		"notoriety_delta": notoriety_delta,
	}


func _bank_fence() -> void:
	var totals := _fence_totals()
	MetaSave.add_gold(int(totals.total))
	MetaSave.add_notoriety(int(totals.notoriety_delta))
	for item: Dictionary in pending_result.pending_haul:
		var buyer: Dictionary = item.buyers[int(item.selection)]
		if buyer.effect == "keep":
			var trophy_id := str(Progression.KIND_TROPHY.get(str(item.kind), ""))
			if not trophy_id.is_empty() and MetaSave.collection_level(trophy_id) == 0:
				MetaSave.set_collection_level(trophy_id, 1)
	_apply_contract_rewards()
	MetaSave.save()
	pending_result = {}
	_open_hideout()


func _apply_contract_rewards() -> void:
	MetaSave.add_gold(int(pending_result.get("contract_reward", 0)))
	var down := int(pending_result.get("notoriety_down", 0))
	if down > 0:
		MetaSave.add_notoriety(-down)


func _update_hud(data: Dictionary) -> void:
	hud_hearts.text = ""
	for i in range(int(data.max_hp)):
		hud_hearts.text += "♥" if i < int(data.hp) else "♡"
	hud_haul.text = "$%s" % _money(int(data.haul))
	var load_name := "Light"
	if float(data.weight) >= 28.0:
		load_name = "Backbreaking"
	elif float(data.weight) >= 16.0:
		load_name = "Heavy"
	elif float(data.weight) >= 6.0:
		load_name = "Laden"
	var noise_name := "Silent"
	if float(data.noise) >= 9.0:
		noise_name = "Deafening"
	elif float(data.noise) >= 5.0:
		noise_name = "Loud"
	elif float(data.noise) >= 1.0:
		noise_name = "Clinking"
	hud_load.text = "%s · %s" % [load_name, noise_name]
	hud_heat.text = "HEAT T%d" % int(data.heat)
	if vignette:
		vignette.set_from_heat(int(data.heat))
	hud_secured.text = (
		"VAULT CLEARED — RUN"
		if bool(data.vault_cleared)
		else "%d / %d secured" % [data.secured, data.total]
	)
	var contract: Dictionary = data.contract
	if contract.is_empty():
		hud_contract.text = "FREE RUN"
	else:
		hud_contract.text = "%s\n%s" % [contract.get("title", ""), contract.get("desc", "")]
	if int(data.get("ascension", 0)) > 0:
		hud_contract.text = "ASCENSION %d · %s" % [int(data.ascension), hud_contract.text]
	if float(data.time_left) < 0.0:
		hud_timer.text = ""
	else:
		hud_timer.text = (
			"%d:%02d" % [floori(float(data.time_left) / 60.0), floori(float(data.time_left)) % 60]
		)
	hud_prompt.text = (
		"HOLD E TO EXTRACT" if bool(data.near_portal) and bool(data.extract_ready) else ""
	)
	if int(data.elevation) >= 0:
		if MetaSave.upgrade_level("landing") > 0 or float(data.weight) < 8.0:
			hud_prompt.text = "DROP: SAFE"
		elif float(data.weight) < 20.0:
			hud_prompt.text = "DROP: LOUD"
		else:
			hud_prompt.text = "DROP: COSTS A HEART"


func _pause_run() -> void:
	if vault and GameState.current == "playing":
		vault.set_run_paused(true)
		_show_screen("pause")


func _resume_pause() -> void:
	if vault:
		_show_screen("")
		vault.set_run_paused(false)
	else:
		_open_hideout()


func _abandon_run() -> void:
	if vault:
		vault.queue_free()
		vault = null
	_toast("Run abandoned — you walk out with nothing.")
	_open_hideout()


func _reset_progress() -> void:
	if not reset_armed:
		reset_armed = true
		_toast("Press RESET PROGRESS again to wipe everything.")
		get_tree().create_timer(2.5).timeout.connect(_disarm_reset)
	else:
		reset_armed = false
		MetaSave.reset()
		_toast("Progress wiped.")
		_open_hideout()


func _toast(message: String) -> void:
	toast_label.text = message
	toast_label.visible = true
	toast_timer.start(1.6)
	if vignette and ("alarm" in message.to_lower() or "spotted" in message.to_lower()):
		vignette.flash()


func _clear(node: Node) -> void:
	for child: Node in node.get_children():
		node.remove_child(child)
		child.queue_free()


func _money(value: int) -> String:
	var text := str(abs(value))
	var output := ""
	while text.length() > 3:
		output = "," + text.substr(text.length() - 3, 3) + output
		text = text.substr(0, text.length() - 3)
	return ("-" if value < 0 else "") + text + output


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("pause_run"):
		if GameState.current == "playing":
			_pause_run()
		elif GameState.current == "pause":
			_resume_pause()
