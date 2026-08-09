extends Node

signal state_changed(previous: String, current: String)

var current := "menu"
var ascension_level := 0


func change(next_state: String) -> void:
	if next_state == current:
		return
	var previous := current
	current = next_state
	state_changed.emit(previous, current)
