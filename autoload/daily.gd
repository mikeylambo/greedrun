extends Node

## Seeded Daily Runs. Everything about "today" derives from the UTC date, so every
## install generates the identical daily vault with no server. One scored attempt,
## a streak for showing up, all local.

## One scored attempt per day — once played, the entry locks until tomorrow.
const DAILY_ONE_ATTEMPT := true

## The streak advances when the daily is STARTED, not only on a successful escape
## (a death should not break the habit). If false, it advances on escape instead.
const DAILY_STREAK_ON_ATTEMPT := true

## The player's upgrades and trophies apply to the daily (your build matters).
## false would mean a parity character — reserved for later, not implemented.
const DAILY_USE_META := true

## Fixed Difficulty Ascension for the daily so the day plays the same for everyone,
## independent of what the player has unlocked.
const DAILY_ASCENSION := 0

## The day's contract type: day index mod this list. Every entry must exist as a
## "type" in the contracts pool built by main.gd.
const CONTRACT_ROTATION: Array[String] = [
	"quota", "silent", "steal", "sweep", "timed", "recovery", "heart", "untouched", "hot"
]

## Streak computed at launch but only committed on escape when
## DAILY_STREAK_ON_ATTEMPT is false.
var _pending_streak := 0


func daily_config_for_today() -> Dictionary:
	return daily_config_for_date(Time.get_datetime_dict_from_system(true))


## One source of truth: what a given UTC date produces. `date` needs year/month/day.
func daily_config_for_date(date: Dictionary) -> Dictionary:
	var day_index := _day_index(date)
	var theme_keys := GreedrunVault.THEMES.keys()
	return {
		"date_key": _date_key(date),
		"seed": int("%04d%02d%02d" % [date.year, date.month, date.day]),
		"contract_type": CONTRACT_ROTATION[day_index % CONTRACT_ROTATION.size()],
		"theme": str(theme_keys[day_index % theme_keys.size()]),
	}


func _date_key(date: Dictionary) -> String:
	return "%04d-%02d-%02d" % [date.year, date.month, date.day]


func _day_index(date: Dictionary) -> int:
	var stamp := {
		"year": date.year,
		"month": date.month,
		"day": date.day,
		"hour": 0,
		"minute": 0,
		"second": 0,
	}
	return floori(Time.get_unix_time_from_datetime_dict(stamp) / 86400.0)


func _yesterday_key(today: Dictionary) -> String:
	var stamp := {
		"year": today.year,
		"month": today.month,
		"day": today.day,
		"hour": 12,
		"minute": 0,
		"second": 0,
	}
	var yesterday := Time.get_datetime_dict_from_unix_time(
		Time.get_unix_time_from_datetime_dict(stamp) - 86400
	)
	return _date_key(yesterday)


func state() -> Dictionary:
	return MetaSave.data.daily


func streak() -> int:
	return int(state().streak)


func last_score() -> int:
	return int(state().last_score)


func best() -> int:
	return int(state().best_daily)


func played_today() -> bool:
	return str(state().last_played_key) == str(daily_config_for_today().date_key)


func can_play_today() -> bool:
	return not (DAILY_ONE_ATTEMPT and played_today())


## Pure streak rule, exposed for testing: consecutive days build the streak, a missed
## day resets it, and a same-day replay (DAILY_ONE_ATTEMPT off) keeps it.
func next_streak(last_key: String, current: int, today_key: String, yesterday: String) -> int:
	if last_key == today_key:
		return maxi(current, 1)
	if last_key == yesterday:
		return current + 1
	return 1


## Call when today's daily is launched: locks today's entry, zeroes today's score and
## (with DAILY_STREAK_ON_ATTEMPT) advances the streak.
func register_attempt() -> void:
	var today := Time.get_datetime_dict_from_system(true)
	var today_key := _date_key(today)
	var daily: Dictionary = state()
	var advanced := next_streak(
		str(daily.last_played_key), int(daily.streak), today_key, _yesterday_key(today)
	)
	if DAILY_STREAK_ON_ATTEMPT:
		daily.streak = advanced
		_pending_streak = 0
	else:
		_pending_streak = advanced
	daily.last_played_key = today_key
	daily.last_score = 0
	MetaSave.save()


## Call when the daily run finishes. Returns true when the score is a new daily best.
func record_result(score: int, escaped: bool) -> bool:
	var daily: Dictionary = state()
	daily.last_score = score
	var new_best := score > int(daily.best_daily)
	daily.best_daily = maxi(int(daily.best_daily), score)
	if not DAILY_STREAK_ON_ATTEMPT and escaped and _pending_streak > 0:
		daily.streak = _pending_streak
		_pending_streak = 0
	MetaSave.save()
	return new_best
