extends SceneTree
## Headless verification for seeded runs and the daily layer. Run from the repo root:
##
##   godot --headless --path . -s tests/daily_check.gd
##
## Checks: a fixed seed reproduces a vault identically (layout_signature), the daily
## config is stable within a date and rotates across dates, and the streak rules.
## Read-only — it never writes to the save file. Exit code = number of failures.

const VAULT_SCENE := preload("res://scenes/Vault.tscn")
const TEST_DATE := {"year": 2026, "month": 7, "day": 15}

var failures := 0


func _initialize() -> void:
	GameState.ascension_level = Daily.DAILY_ASCENSION
	_check_seed_determinism()
	_check_daily_config()
	_check_streak_rules()
	if failures == 0:
		print("daily_check: ALL PASS")
	else:
		printerr("daily_check: %d FAILURE(S)" % failures)
	quit(failures)


func _check(condition: bool, label: String) -> void:
	if condition:
		print("PASS  %s" % label)
	else:
		failures += 1
		printerr("FAIL  %s" % label)


func _signature_for(seed_value: int, contract: Dictionary = {}) -> int:
	var vault: GreedrunVault = VAULT_SCENE.instantiate()
	root.add_child(vault)
	vault.set_run_paused(true)
	vault.start_run(contract, seed_value)
	var signature := vault.layout_signature()
	root.remove_child(vault)
	vault.free()
	return signature


func _check_seed_determinism() -> void:
	var fixed_a := _signature_for(12345)
	var fixed_b := _signature_for(12345)
	var other := _signature_for(54321)
	_check(fixed_a == fixed_b, "same seed => identical vault")
	_check(fixed_a != other, "different seed => different vault")
	var config := Daily.daily_config_for_date(TEST_DATE)
	var daily_contract := {"theme_key": config.theme}
	var first := _signature_for(int(config.seed), daily_contract)
	var second := _signature_for(int(config.seed), daily_contract)
	_check(first == second, "fixed test date => identical daily vault")


func _check_daily_config() -> void:
	var config := Daily.daily_config_for_date(TEST_DATE)
	_check(str(config.date_key) == "2026-07-15", "date key formats as YYYY-MM-DD")
	_check(int(config.seed) == 20260715, "seed derives from the UTC date")
	var again := Daily.daily_config_for_date(TEST_DATE)
	_check(str(config.contract_type) == str(again.contract_type), "contract stable within a day")
	_check(str(config.theme) == str(again.theme), "theme stable within a day")
	_check(config.contract_type in Daily.CONTRACT_ROTATION, "contract type is a known type")
	_check(GreedrunVault.THEMES.has(str(config.theme)), "theme is a known theme")
	var next_day := Daily.daily_config_for_date({"year": 2026, "month": 7, "day": 16})
	_check(str(next_day.contract_type) != str(config.contract_type), "contract rotates daily")
	_check(str(next_day.theme) != str(config.theme), "theme rotates daily")
	var month_end := Daily.daily_config_for_date({"year": 2026, "month": 7, "day": 31})
	var month_start := Daily.daily_config_for_date({"year": 2026, "month": 8, "day": 1})
	_check(
		str(month_end.contract_type) != str(month_start.contract_type),
		"rotation is continuous across a month boundary"
	)


func _check_streak_rules() -> void:
	var today := "2026-07-15"
	var yesterday := "2026-07-14"
	_check(Daily.next_streak("", 0, today, yesterday) == 1, "first ever play starts streak at 1")
	_check(Daily.next_streak(yesterday, 3, today, yesterday) == 4, "consecutive day builds streak")
	_check(Daily.next_streak("2026-07-10", 5, today, yesterday) == 1, "missed day resets streak")
	_check(Daily.next_streak(today, 4, today, yesterday) == 4, "same-day replay keeps streak")
