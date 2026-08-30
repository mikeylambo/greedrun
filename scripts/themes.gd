class_name Themes
extends RefCounted

## Vault theme palettes (fallback colours when textures are absent) and display
## names. Folder names under assets/textures/ match these keys. See vault.gd.

const DATA := {
	"treasury":
	{
		"name": "Sunken Treasury",
		"floor": Color("#17150f"),
		"wall": Color("#534323"),
		"grid": Color("#292318"),
		"platform": Color("#302919")
	},
	"fortress":
	{
		"name": "Cliffside Fortress",
		"floor": Color("#15171a"),
		"wall": Color("#4d5159"),
		"grid": Color("#23272d"),
		"platform": Color("#2b3037")
	},
	"undercity":
	{
		"name": "Undercity Vaults",
		"floor": Color("#111719"),
		"wall": Color("#31505a"),
		"grid": Color("#1b2a2f"),
		"platform": Color("#20363c")
	},
	"mint":
	{
		"name": "Old Mint",
		"floor": Color("#181510"),
		"wall": Color("#61513a"),
		"grid": Color("#2b2419"),
		"platform": Color("#382e20")
	},
}
