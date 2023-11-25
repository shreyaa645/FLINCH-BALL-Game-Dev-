const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let spacebarPressed = false;
var urlParams = new URLSearchParams(window.location.search);
var nickname = urlParams.get('nickname');
const backgroundAudio = document.getElementById('background-audio');
const hitAudio = document.getElementById('hit-audio');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fish = {
    x: 50,
    y: canvas.height / 2 - 15,
    width: 30,
    height: 30,
    color: 'aqua',
    velocity: 0,
    gravity: 0.5,
    jumpStrength: 8,
    wobbleSpeed: 0.1,
    wobbleDistance: 10,
    wobbleDirection: 1
};

const obstacles = [];
const particles = [];

let obstacleSpawnDistance = 0;
const minObstacleDistance = 500; // Set a minimum distance for obstacle spawning
const maxObstacleDistance = 800; // Set a maximum distance for obstacle spawning
let gap = 300;
let score = 0;

function drawFish() {
    ctx.beginPath();
    ctx.arc(fish.x + fish.width / 2, fish.y + fish.height / 2, fish.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = fish.color;
    ctx.fill();
    ctx.closePath();
}

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

    if (!spacebarPressed) {
        fish.y += fish.wobbleSpeed * fish.wobbleDirection;
        if (Math.abs(fish.y - (canvas.height / 2 - 15)) >= fish.wobbleDistance) {
            fish.wobbleDirection *= -1;
        }
    }
}

function drawObstacles() {
    for (const obstacle of obstacles) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
}

function handleObstacles() {
    obstacleSpawnDistance -= gamespeed;

    if (obstacleSpawnDistance <= 0) {
        const obstacleHeight = Math.random() * (canvas.height - 200) + 50;

        const newObstacle = {
            x: canvas.width + 70,
            y: 0,
            width: 30,
            height: obstacleHeight,
            color: 'blue',
        };

        // Check if the new obstacle overlaps with existing ones
        if (!obstaclesOverlap(newObstacle)) {
            obstacles.push(newObstacle);

            obstacles.push({
                x: canvas.width,
                y: newObstacle.height + gap,
                width: 30,
                height: canvas.height - newObstacle.height - gap,
                color: 'blue',
            });

            obstacleSpawnDistance = getRandomDistance();
            gap = getNewGap();
        }
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= 2;

        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function getRandomDistance() {
    return Math.random() * (maxObstacleDistance - minObstacleDistance) + minObstacleDistance;
}

function getNewGap() {
    return 300;
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= 3;

        const fishCenterX = fish.x + fish.width / 2;
        const fishCenterY = fish.y + fish.height / 2;
        const obstacleCenterX = obstacles[i].x + obstacles[i].width / 2;
        const obstacleCenterY = obstacles[i].y + obstacles[i].height / 2;

        const halfWidth = obstacles[i].width / 2;
        const halfHeight = obstacles[i].height / 2;

        const isInsideX = fishCenterX > obstacles[i].x && fishCenterX < obstacles[i].x + obstacles[i].width;
        const isInsideY = fishCenterY > obstacles[i].y && fishCenterY < obstacles[i].y + obstacles[i].height;

        if (isInsideX && isInsideY) {
            hitAudio.play();
            gameOver();
        }
    } 

    if (Math.random() < 0.008) { // Reduce the probability of obstacle creation
        const obstacleHeight = Math.random() * (canvas.height - 200) + 50;
        obstacles.push({
            x: canvas.width + 60,
            y: 4,
            width: 30,
            height: obstacleHeight,
            color: 'blue'
        });

        obstacles.push({
            x: canvas.width + 100,
            y: obstacleHeight + 200,
            width: 30,
            height: canvas.height - obstacleHeight - 50,
            color: 'blue'
        });
    }
}



function drawParticles() {
    for (const particle of particles) {
        const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, 3
        );

        gradient.addColorStop(0, spacebarPressed ? 'blue' : 'yellow');
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
    }
}

function updateParticles() {
    if (!spacebarPressed && Math.random() < 0.2) {
        particles.push({
            x: fish.x,
            y: fish.y + fish.height / 2,
        });
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x -= 2;

        if (particles[i].x < 0) {
            particles.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    backgroundAudio.play();
    var urlParams = new URLSearchParams(window.location.search);
    var nickname = urlParams.get('nickname');

    ctx.fillStyle = 'aqua';
    ctx.font = '20px Arial';
    ctx.fillText(nickname + "'s Score: " + score, 20, 30);

    drawFish();
    drawObstacles();
    drawParticles();

    requestAnimationFrame(draw);
}

function resetGame() {
    fish.y = canvas.height / 2 - 15;
    fish.velocity = 0;
    obstacles.length = 0;
    score = 0;
}

function jump() {
    fish.velocity = -fish.jumpStrength;

    for (let i = 0; i < 5; i++) {
        particles.push({
            x: fish.x,
            y: fish.y + fish.height / 2,
        });
    }
}

function gameOver() {
    var nickname = localStorage.getItem('nickname');
    localStorage.setItem('finalScore', score);
    localStorage.setItem('finalNickname', nickname);

    resetGame();

    setTimeout(function () {
        window.location.href = 'retry.html';
    }, 300); 
}

document.addEventListener('keydown', function (event) {
    if (event.code === 'Space') {
        spacebarPressed = true;
        jump();
    }
});

document.addEventListener('keyup', function (event) {
    if (event.code === 'Space') {
        spacebarPressed = false;
    }
});

resetGame();
draw();

setInterval(function () {
    updateFish();
    updateObstacles();
    updateParticles();
    score += 1; 
}, 1000 / 40);

