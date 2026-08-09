extends Node


func buyers_for(kind: String, value: int) -> Array[Dictionary]:
	var buyers: Array[Dictionary] = [
		{"id": "black", "name": "Black Market", "mult": 1.0, "effect": "", "payout": 0}
	]
	if kind in ["loud", "living", "mythic", "royal", "fragile"]:
		buyers.append(
			{"id": "noble", "name": "Noble Collector", "mult": 1.7, "effect": "", "payout": 0}
		)
	if kind in ["cursed", "artifact", "mythic"]:
		buyers.append(
			{
				"id": "syndicate",
				"name": "The Syndicate",
				"mult": 2.2,
				"effect": "notoriety_up",
				"payout": 0
			}
		)
		buyers.append(
			{
				"id": "return",
				"name": "Return it",
				"mult": 0.4,
				"effect": "notoriety_down",
				"payout": 0
			}
		)
	var trophy_id := str(Progression.KIND_TROPHY.get(kind, ""))
	if not trophy_id.is_empty() and MetaSave.collection_level(trophy_id) == 0:
		var trophy := Progression.trophy_by_id(trophy_id)
		(
			buyers
			. append(
				{
					"id": "keep",
					"name": "Keep it",
					"mult": 0.0,
					"effect": "keep",
					"payout": 0,
					"passive": str(trophy.get("passive", "Collection trophy")),
				}
			)
		)
	var sell_mult := Progression.sell_multiplier()
	for buyer: Dictionary in buyers:
		buyer.payout = roundi(value * float(buyer.mult) * sell_mult)
	return buyers


func danger_multiplier(peak_heat: int) -> float:
	return 1.0 + peak_heat * 0.09 + Progression.danger_heart_bonus()


func final_total(raw_total: int, peak_heat: int, perfect: bool) -> int:
	var total := float(raw_total)
	if perfect:
		total *= 1.4
	total *= danger_multiplier(peak_heat)
	total *= Progression.collection_gold_multiplier()
	total *= AscensionModifiers.payout_mult(GameState.ascension_level)
	return roundi(total)
