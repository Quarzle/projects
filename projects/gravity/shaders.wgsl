@group(0) @binding(0) var<uniform> point_position: vec2f;

@vertex
fn vertexMain(@location(0) pos: vec2f,
	@builtin(instance_index) instance: u32) ->
	@builtin(position) vec4f {

	let i = f32(instance);
	
	let offset = vec2f(
		point_position.x + (i * 0.1),
		point_position.y + (i * 0.1)
	);

	return vec4f(offset, 0, 1);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
	return vec4f(0.1, 0.1, 1, 1);
}