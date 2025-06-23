const canvas = document.getElementById('gameCanvas');
const NUM_POINTS = 2000;

let somePositionList = [];
for (let i = 0; i < NUM_POINTS; ++i) {
	somePositionList.push({ x: 0, y: 0, direction: 0,});
	somePositionList[i].x = Math.random() * 2 - 1;
	somePositionList[i].y = Math.random() * 2 - 1;
	somePositionList[i].direction = Math.random() * Math.PI * 2;
}

if (!navigator.gpu) {
	throw new Error("WebGPU not supported on this browser.");
}

const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
	throw new Error("No appropriate GPUAdapter found.");
}
const device = await adapter.requestDevice();

const context = canvas.getContext("webgpu");
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
	device: device,
	format: canvasFormat,
});

const vertices = new Float32Array([
//   X,    Y,
  -1, -1,
   1, -1,
   1,  1,

  -1, -1,
   1,  1,
  -1,  1,
]);

const vertexBuffer = device.createBuffer({
  label: "Cell vertices",
  size: vertices.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, vertices);

let pointPositions = new Float32Array(NUM_POINTS * 2);
for (let i = 0; i < NUM_POINTS; ++i) {
    pointPositions[i * 2 + 0] = somePositionList[i].x;
    pointPositions[i * 2 + 1] = somePositionList[i].y;
}

const pointBuffer = device.createBuffer({
  size: pointPositions.byteLength,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(pointBuffer, 0, pointPositions);

const vertexBufferLayout = {
  arrayStride: 8,
  attributes: [{
    format: "float32x2",
    offset: 0,
    shaderLocation: 0, // Position, see vertex shader
  }],
};

let shaderCode = ""

// fetch('./shaders.wgsl')
//   .then(response => response.text())
//   .then(data => {
//     shaderCode = data;
//   })
//   .catch(error => console.error('Error loading file:', error));

shaderCode = `
@group(0) @binding(0) var<storage, read> point_positions: array<vec2f>;

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) center: vec2f,
  @location(1) scale: vec2f, // half-size of quad
};

@vertex
fn vertexMain(@location(0) pos: vec2f,
  @builtin(instance_index) instance: u32) -> VSOut {
  let c = point_positions[instance];
  let s = vec2f(0.002, 0.002); // adjust circle size
  let scaled = pos * s;
  var out: VSOut;
  out.pos = vec4f(c + scaled, 0, 1);
  out.center = c;
  out.scale = s;
  return out;
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
	return vec4f(0.6, 0.9, 1.0, 1.0);
}`

const cellShaderModule = device.createShaderModule({
  label: 'Cell shader',
  code: shaderCode
});

const cellPipeline = device.createRenderPipeline({
  label: "Cell pipeline",
  layout: "auto",
  vertex: {
    module: cellShaderModule,
    entryPoint: "vertexMain",
    buffers: [vertexBufferLayout]
  },
  fragment: {
    module: cellShaderModule,
    entryPoint: "fragmentMain",
    targets: [{
      format: canvasFormat
    }]
  }
});

const bindGroup = device.createBindGroup({
  label: "point renderer bind group",
  layout: cellPipeline.getBindGroupLayout(0),
  entries: [{
    binding: 0,
    resource: {
      buffer: pointBuffer
    }
  }]
});

function update() {
	updateParticles();
	draw_frame();
}

function updateParticles() {
	const time_scale = 0.005;
	const boid_detection_radius = 0.05;
	const separation_strength = 0.0001;
	const alignment_strength = 0.001;
	const cohesion_strength = 0.0001;

	for (let i = 0; i < NUM_POINTS; ++i) {
		let separation_dx = 0;
		let separation_dy = 0;

		let alignment_sin = 0;
		let alignment_cos = 0;

		let cohesion_x = 0;
		let cohesion_y = 0;

		let neighbor_count = 0;

		const boid = somePositionList[i];

		for (let j = 0; j < NUM_POINTS; ++j) {
			if (i === j) continue;

			const other = somePositionList[j];
			const dx = other.x - boid.x;
			const dy = other.y - boid.y;
			const dist_sq = dx * dx + dy * dy;

			if (dist_sq < boid_detection_radius * boid_detection_radius && dist_sq > 0.000001) {

				// Separation
				separation_dx -= dx / dist_sq;
				separation_dy -= dy / dist_sq;

				// Alignment
				alignment_cos += Math.cos(other.direction);
				alignment_sin += Math.sin(other.direction);

				// Cohesion
				cohesion_x += other.x;
				cohesion_y += other.y;

				neighbor_count++;
			}
		}

		let steer_angle = 0;
		let steer_weight = 0;

		// --- Separation ---
		if (separation_dx !== 0 || separation_dy !== 0) {
			const sep_angle = Math.atan2(separation_dy, separation_dx);
			const angle_diff = ((sep_angle - boid.direction + Math.PI) % (2 * Math.PI)) - Math.PI;
			steer_angle += angle_diff * separation_strength;
			steer_weight += separation_strength;
		}

		// --- Alignment ---
		if (neighbor_count > 0) {
			const avg_angle = Math.atan2(alignment_sin, alignment_cos);
			const angle_diff = ((avg_angle - boid.direction + Math.PI) % (2 * Math.PI)) - Math.PI;
			steer_angle += angle_diff * alignment_strength;
			steer_weight += alignment_strength;
		}

		// --- Cohesion ---
		if (neighbor_count > 0) {
			const avg_x = cohesion_x / neighbor_count;
			const avg_y = cohesion_y / neighbor_count;
			const dx = avg_x - boid.x;
			const dy = avg_y - boid.y;
			if (dx !== 0 || dy !== 0) {
				const coh_angle = Math.atan2(dy, dx);
				const angle_diff = ((coh_angle - boid.direction + Math.PI) % (2 * Math.PI)) - Math.PI;
				steer_angle += angle_diff * cohesion_strength;
				steer_weight += cohesion_strength;
			}
		}

		// Apply steering
		if (steer_weight > 0) {
			boid.direction += steer_angle / steer_weight;
		}

		// Move forward
		boid.x += Math.cos(boid.direction) * time_scale;
		boid.y += Math.sin(boid.direction) * time_scale;

		// Bounce off walls
		// if (boid.x < -1 || boid.x > 1) {
		// 	boid.direction = Math.PI - boid.direction;
		// 	boid.x = Math.max(-1, Math.min(1, boid.x));
		// }
		// if (boid.y < -1 || boid.y > 1) {
		// 	boid.direction = -boid.direction;
		// 	boid.y = Math.max(-1, Math.min(1, boid.y));
		// }

		// Wrap around edges
		if (boid.x < -1) {
			boid.x += 2;
		}
		if (boid.x > 1) {
			boid.x -= 2;
		}
		if (boid.y < -1) {
			boid.y += 2;
		}
		if (boid.y > 1) {
			boid.y -= 2;
		}
	}
}


function draw_frame() {
	pointPositions = new Float32Array(NUM_POINTS * 2);
	for (let i = 0; i < NUM_POINTS; ++i) {
		pointPositions[i * 2 + 0] = somePositionList[i].x;
		pointPositions[i * 2 + 1] = somePositionList[i].y;
	}
	device.queue.writeBuffer(pointBuffer, 0, pointPositions);

	const encoder = device.createCommandEncoder();

	const pass = encoder.beginRenderPass({
		colorAttachments: [{
			view: context.getCurrentTexture().createView(),
			loadOp: "clear",
			clearValue: [ 0.1, 0.1, 0.3, 1 ], // RGBA
			storeOp: "store",
		}]
	});

	pass.setPipeline(cellPipeline);
	pass.setVertexBuffer(0, vertexBuffer);

	pass.setBindGroup(0, bindGroup);

	pass.draw(vertices.length / 2, NUM_POINTS);

	pass.end();
	device.queue.submit([encoder.finish()]);
}

setInterval(update, 1000 / 60); // 60 FPS

function reset() {
    alert("This does not yet work...");
}