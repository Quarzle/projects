const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = 1000;
const HEIGHT = 500;
const ROWS = 34;
const COLS = 67;
const CELL_SIZE = 15;

const SCREEN_COLOR = '#313146';
const LINE_COLOR = '#6496C8';

let draw_stars = true;

function toggleStars() {
    const button = document.getElementById('generateDots');
    button.classList.toggle('active');
    button.textContent = draw_stars ? 'Toggle stars (stars off)' : 'Toggle stars (stars on)';
    draw_stars = !draw_stars;
}

// Generate grid of random positions
function generateRandomPositions() {
    const positions = [];
    for (let i = 0; i < ROWS; i++) {
        positions.push([]);
        for (let j = 0; j < COLS; j++) {
            positions[i].push([
                CELL_SIZE * Math.random() + j * CELL_SIZE,
                CELL_SIZE * Math.random() + i * CELL_SIZE
            ]);
        }
    }
    return positions;
}

function distanceSquared(p1, p2) {
    return (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = SCREEN_COLOR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const connections = new Set();

    const positions = generateRandomPositions();

        // Draw points
        positions.forEach((row, i) => {
            row.forEach(([x, y]) => {
                // Draw circle
                // if draw_stars is true, draw stars
                if (draw_stars) {
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = LINE_COLOR;
                    ctx.fill();
                }
            });
        });

    // Connect points
    positions.forEach((row, i) => {
        row.forEach(([x1, y1], j) => {
            const src = [i, j];
            let minDist = Infinity;
            let closestTarget = null;

            positions.forEach((otherRow, m) => {
                otherRow.forEach(([x2, y2], n) => {
                    const tgt = [m, n];
                    if (tgt.toString() === src.toString()) return; // Skip the same point
                    if (connections.has(`${tgt},${src}`)) return; // Skip mutual connections

                    const dist = distanceSquared([x1, y1], [x2, y2]);
                    if (dist < minDist) {
                        minDist = dist;
                        closestTarget = tgt;
                    }
                });
            });

            if (closestTarget) {
                const [m, n] = closestTarget;
                const [x2, y2] = positions[m][n];
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = LINE_COLOR;
                ctx.lineWidth = 1;
                ctx.stroke();
                connections.add(`${src},${closestTarget}`);
            }
        });
    });
}

// Draw the canvas initially
draw();
