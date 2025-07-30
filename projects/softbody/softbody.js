const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const SOFTBODY_NODES = 20; // number of nodes in the softbody
const SPRING_CONSTANT = 0.8; // spring constant for the softbody
const DAMPING = 0.97; // damping factor for velocity
const RADIUS = 50;

const SCREEN_COLOR = '#313146';
const LINE_COLOR = '#6496C8';

let positions = [];
let velocities = [];

// Track mouse position globally
let mouseX = WIDTH / 2;
let mouseY = HEIGHT / 2;
let mouseDown = false;

function initPositions() {
	positions = [];
	velocities = [];
	// automatically create positions in a circle
	for (let i = 0; i < SOFTBODY_NODES; i++) {
		const angle = (i / SOFTBODY_NODES) * Math.PI * 2;
		const x = WIDTH / 2 + Math.cos(angle) * RADIUS;
		const y = HEIGHT / 2 + Math.sin(angle) * RADIUS;
		positions.push({ x, y });
		velocities.push({ x: 0, y: 0 });
	}
}

function distanceSquared(p1, p2) {
	return (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2;
}

function physicsUpdate() {
	const springConstant = SPRING_CONSTANT;
	const damping = DAMPING; // velocity damping (closer to 1 = less damping)
	const restLength = RADIUS / SOFTBODY_NODES;

	// Spring forces
	for (let i = 0; i < SOFTBODY_NODES; i++) {
		const p1 = positions[i];
		const p2 = positions[(i + 1) % SOFTBODY_NODES];
		const v1 = velocities[i];
		const v2 = velocities[(i + 1) % SOFTBODY_NODES];

		const dx = p2.x - p1.x;
		const dy = p2.y - p1.y;
		const dist = Math.sqrt(dx * dx + dy * dy);

		if (dist > 0) {
			const forceMagnitude = springConstant * (dist - restLength);
			const fx = (forceMagnitude * dx) / dist;
			const fy = (forceMagnitude * dy) / dist;

			v1.x += fx;
			v1.y += fy;
			v2.x -= fx;
			v2.y -= fy;
		}
	}

	// Apply gravity and update positions
	for (let i = 0; i < SOFTBODY_NODES; i++) {
		velocities[i].y += 0.5; // gravity
		velocities[i].x *= damping;
		velocities[i].y *= damping;

		positions[i].x += velocities[i].x;
		positions[i].y += velocities[i].y;

		// Prevent going off screen (simple floor)
		if (positions[i].y > HEIGHT - 20) {
			positions[i].y = HEIGHT - 20;
			velocities[i].y = 0;
		}
	}
	// Inflate the softbody with pressure proportional to area difference
	// Calculate current area using the shoelace formula
	let area = 0;
	for (let i = 0; i < SOFTBODY_NODES; i++) {
		const p1 = positions[i];
		const p2 = positions[(i + 1) % SOFTBODY_NODES];
		area += (p1.x * p2.y - p2.x * p1.y);
	}
	area = Math.abs(area) / 2;

	// Target area (area of regular polygon with SOFTBODY_NODES and RADIUS)
	const targetArea = 0.5 * SOFTBODY_NODES * RADIUS * RADIUS * Math.sin((2 * Math.PI) / SOFTBODY_NODES);

	let pressure = 0.007 * (targetArea - area); // pressure factor scales with area difference

	for (let i = 0; i < SOFTBODY_NODES; i++) {
		const v = velocities[i];
		const angle = (i / SOFTBODY_NODES) * Math.PI * 2;
		v.x += Math.cos(angle) * pressure;
		v.y += Math.sin(angle) * pressure;
	}

	// Handle mouse interaction
	let in_range = false;
	for (let i = 0; i < SOFTBODY_NODES; i++) {
		const p = positions[i];
		const dx = mouseX - p.x;
		const dy = mouseY - p.y;
		const dist_sq = dx * dx + dy * dy;

		if (dist_sq < 1500) { // 100^2
			in_range = true;
		}
	}
	if (in_range) {
		canvas.classList.add('grabable-cursor');
	}else {
		canvas.classList.remove('grabable-cursor');
	}
	if (mouseDown) {
		for (let i = 0; i < SOFTBODY_NODES; i++) {
			const p = positions[i];
			const dx = mouseX - p.x;
			const dy = mouseY - p.y;
			const dist_sq = dx * dx + dy * dy;

			if (dist_sq < 10000) { // 100^2
				canvas.classList.add('grabbing-cursor');
				let forceMagnitude = 0.1 * (100 - Math.sqrt(dist_sq)); // force decreases with distance
				// clamp force to prevent excessive movement
				if (forceMagnitude > 3) forceMagnitude = 3;
				velocities[i].x += (dx / Math.sqrt(dist_sq)) * forceMagnitude;
				velocities[i].y += (dy / Math.sqrt(dist_sq)) * forceMagnitude;
			}
		}
	}
}

function draw() {
    // Clear canvas
    ctx.fillStyle = SCREEN_COLOR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // --- Fill the blob as a polygon ---
    ctx.beginPath();
    ctx.moveTo(positions[0].x, positions[0].y);
    for (let i = 1; i < SOFTBODY_NODES; i++) {
        ctx.lineTo(positions[i].x, positions[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = LINE_COLOR; // fill color of the blob
    ctx.fill();

    // --- Draw the blob outline ---
    for (let i = 0; i < SOFTBODY_NODES; i++) {
        const p1 = positions[i];
        const p2 = positions[(i + 1) % SOFTBODY_NODES]; // wrap around
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = LINE_COLOR;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

initPositions();

// Mouse event listeners
canvas.addEventListener('mousedown', function(e) {
	//true if the mouse is pressed down ONLY inside the canvas
	if (mouseX >= 0 && mouseX <= WIDTH && mouseY >= 0 && mouseY <= HEIGHT) {
		mouseDown = true;
	}
});

canvas.addEventListener('mouseup', function() {
	canvas.classList.remove('grabbing-cursor');
	mouseDown = false;
});

canvas.addEventListener('mousemove', function(e) {
	const rect = canvas.getBoundingClientRect();
	mouseX = (e.clientX - rect.left) / rect.width * WIDTH;
	mouseY = (e.clientY - rect.top) / rect.height * HEIGHT;
});

// Animation loop
function animate() {
	physicsUpdate();
	draw();
}

// run the animation loop every frame
setInterval(animate, 1000 / 60); // 60 FPS