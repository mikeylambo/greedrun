extends Node

signal state_changed(previous: String, current: String)

var current := "menu"

# The active run's Difficulty Ascension (0 = normal). Set by the contracts
# selector, read by the vault at start_run and by Economy at payout.
var ascension_level := 0


func change(next_state: String) -> void:
	if next_state == current:
		return
	var previous := current
	current = next_state
	state_changed.emit(previous, current)
