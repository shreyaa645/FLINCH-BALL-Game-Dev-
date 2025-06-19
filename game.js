const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const backgroundAudio = document.getElementById('background-audio');
const hitAudio = document.getElementById('hit-audio');

let spacebarPressed = false;
let score = 0;
let paused = false;

const fish = {
    x: 60,
    y: 200,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jumpStrength: 8
};

const obstacles = [];
const gap = 180;
let particles = [];

// Set canvas size
function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// Glowing ball
function drawFish() {
    const centerX = fish.x + fish.width / 2;
    const centerY = fish.y + fish.height / 2;
    const radius = fish.width / 2;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, "#00fff7");
    gradient.addColorStop(1, "rgba(0, 255, 255, 0)");

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
}

// Particle class (subtle trail)
class Particle {
    constructor(x, y) {
        this.x = x + (Math.random() * 10 - 5);
        this.y = y + (Math.random() * 10 - 5);
        this.radius = Math.random() * 2 + 0.5;
        this.alpha = 0.3 + Math.random() * 0.3;
    }

    update() {
        this.alpha -= 0.005;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 247, ${this.alpha})`;
        ctx.fill();
    }
}

// Glowing obstacles
function drawObstacles() {
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#0ff';
    for (const obs of obstacles) {
        const grd = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.width, obs.y + obs.height);
        grd.addColorStop(0, "#00fff7");
        grd.addColorStop(1, "#0099ff");
        ctx.fillStyle = grd;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }
    ctx.shadowBlur = 0;
}

// Update fish position
function updateFish() {
    fish.velocity += fish.gravity;
    fish.y += fish.velocity;

    if (fish.y < 0) {
        fish.y = 0;
        fish.velocity = 0;
    }
    if (fish.y + fish.height > canvas.height) {
        fish.y = canvas.height - fish.height;
        fish.velocity = 0;
    }
}

// Update obstacles
function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= 3;

        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }

        const fishX = fish.x + fish.width / 2;
        const fishY = fish.y + fish.height / 2;

        const inX = fishX > obstacles[i].x && fishX < obstacles[i].x + obstacles[i].width;
        const inY = fishY > obstacles[i].y && fishY < obstacles[i].y + obstacles[i].height;

        if (inX && inY) {
            hitAudio.play();
            gameOver();
        }
    }

    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 300) {
        const height = Math.floor(Math.random() * (canvas.height - gap - 100)) + 50;
        const width = 40;

        obstacles.push({
            x: canvas.width,
            y: 0,
            width: width,
            height: height
        });

        obstacles.push({
            x: canvas.width,
            y: height + gap,
            width: width,
            height: canvas.height - height - gap
        });
    }
}

// Score display
function drawScore() {
    ctx.font = "bold 24px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    ctx.fillStyle = "#00fff7";
    ctx.shadowColor = "#0ff";
    ctx.shadowBlur = 10;
    ctx.fillText("Score: " + score, 30, 40);
    ctx.shadowBlur = 0;
}

// Draw loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ✨ Particle trail (subtle)
    if (score % 2 === 0) {
        particles.push(new Particle(fish.x + fish.width / 2, fish.y + fish.height / 2));
    }
    particles = particles.filter(p => p.alpha > 0);
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    drawFish();
    drawObstacles();
    drawScore();

    requestAnimationFrame(draw);
}

// Game over
function gameOver() {
    localStorage.setItem("finalScore", score);
    localStorage.setItem("finalNickname", localStorage.getItem("nickname") || "");
    setTimeout(() => {
        window.location.href = "retry.html";
    }, 400);
}

// Controls
function jump() {
    fish.velocity = -fish.jumpStrength;
}

document.addEventListener("keydown", e => {
    if (e.code === "Space" || e.code === "Enter") {
        spacebarPressed = true;
        jump();
        backgroundAudio.play();
    } else if (e.code === "KeyP") {
        paused = !paused;
    }
});

document.addEventListener("keyup", e => {
    if (e.code === "Space" || e.code === "Enter") {
        spacebarPressed = false;
    }
});

// Main update loop
setInterval(() => {
    if (!paused) {
        updateFish();
        updateObstacles();
        score++;
    }
}, 1000 / 60);

draw();
