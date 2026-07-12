shader_type canvas_item;
render_mode blend_mix, unshaded;

// 0..1 escalation drivers, pushed each frame from fx_vignette.gd
uniform float heat_amt : hint_range(0.0, 1.0) = 0.0;
uniform float curse_amt : hint_range(0.0, 1.0) = 0.0;
uniform float flash_amt : hint_range(0.0, 1.0) = 0.0;

uniform vec3 heat_col : source_color = vec3(0.878, 0.314, 0.247);   // #e0503f
uniform vec3 curse_col : source_color = vec3(0.663, 0.545, 1.0);   // #a98bff

void fragment() {
	vec2 uv = UV - vec2(0.5);
	float d = length(uv) * 1.42;                 // 0 center -> ~1 corners
	float edge = smoothstep(0.40, 1.0, d);       // vignette mask

	// always-on warm depth at the edges (subtle)
	vec3 col = vec3(0.0);
	float a = edge * 0.42;

	// curse creeps in from the edges as danger climbs
	col = mix(col, curse_col, curse_amt);
	a += curse_amt * edge * 0.30;

	// heat pushes red inward, not just at the edges
	float heat_field = mix(edge, 1.0, 0.22);
	col = mix(col, heat_col, heat_amt * 0.6);
	a += heat_amt * heat_field * 0.34;

	// alarm: brief near-full-screen red pulse
	col = mix(col, heat_col, flash_amt);
	a = clamp(a + flash_amt * 0.30, 0.0, 0.9);

	COLOR = vec4(col, a);
}
