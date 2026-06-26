// Get the canvas and drawing tool
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let score = 0;
let combo = 0;
let comboTimer = 0;

// Player object
const player = {
    x: canvas.width / 2,
    y: canvas.height - 150,
    width: 40,
    height: 50,
    velocityY: 0,
    velocityX: 0,
    rotation: 0,
    rotationVelocity: 0,
    isJumping: false,
    jumpPower: 0,
    isFlipping: false,
    flipProgress: 0,
    color: '#FF6B6B'
};

// Trampoline object
const trampoline = {
    x: canvas.width / 2 - 80,
    y: canvas.height - 100,
    width: 160,
    height: 20,
    bounce: 0,
    maxBounce: 15
};

// Physics
const gravity = 0.5;
const trampolineBounce = 18;
const friction = 0.98;

// Keyboard input
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // Jump
    if (e.key === 'ArrowUp') {
        if (!player.isJumping) {
            player.velocityY = -trampolineBounce;
            player.isJumping = true;
            score += 10;
            addCombo();
        }
    }

    // Flip
    if (e.key === ' ') {
        e.preventDefault();
        if (!player.isFlipping) {
            player.isFlipping = true;
            player.flipProgress = 0;
            score += 50;
            addCombo();
        }
    }

    // Spin tricks
    if (e.key === 'z' || e.key === 'Z') {
        player.rotationVelocity = -0.3;
        score += 20;
        addCombo();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// BUTTON CONTROLS FOR MOBILE

document.getElementById('jumpBtn').addEventListener('click', () => {
    if (!player.isJumping) {
        player.velocityY = -trampolineBounce;
        player.isJumping = true;
        score += 10;
        addCombo();
    }
});

document.getElementById('spinLeftBtn').addEventListener('click', () => {
    player.velocityX = -5;
    player.rotationVelocity = -0.2;
    score += 20;
    addCombo();
});

document.getElementById('spinRightBtn').addEventListener('click', () => {
    player.velocityX = 5;
    player.rotationVelocity = 0.2;
    score += 20;
    addCombo();
});

document.getElementById('flipBtn').addEventListener('click', () => {
    if (!player.isFlipping) {
        player.isFlipping = true;
        player.flipProgress = 0;
        score += 50;
        addCombo();
    }
});

document.getElementById('trickBtn').addEventListener('click', () => {
    player.rotationVelocity = -0.3;
    score += 20;
    addCombo();
});

// Add combo bonus
function addCombo() {
    combo++;
    comboTimer = 60; // 60 frames = 1 second (at 60fps)
    
    // Bonus points for combos!
    if (combo > 1) {
        score += combo * 5;
    }
}

// Reset combo
function updateComboTimer() {
    if (comboTimer > 0) {
        comboTimer--;
    } else {
        combo = 0;
    }
}

// Update game
function update() {
    // Apply gravity
    player.velocityY += gravity;

    // Left and right movement from keyboard
    if (keys['ArrowLeft']) {
        player.velocityX = -5;
        player.rotationVelocity = -0.1;
    }
    if (keys['ArrowRight']) {
        player.velocityX = 5;
        player.rotationVelocity = 0.1;
    }

    // Apply friction
    player.velocityX *= friction;
    player.rotationVelocity *= friction;

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    player.rotation += player.rotationVelocity;

    // Keep player on screen (left and right)
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Check collision with trampoline
    if (
        player.y + player.height >= trampoline.y &&
        player.y + player.height <= trampoline.y + trampoline.height + 20 &&
        player.x + player.width > trampoline.x &&
        player.x < trampoline.x + trampoline.width &&
        player.velocityY > 0
    ) {
        player.velocityY = -trampolineBounce;
        player.isJumping = true;
        trampoline.bounce = trampoline.maxBounce;
    }

    // Update flip animation
    if (player.isFlipping) {
        player.flipProgress += 0.1;
        if (player.flipProgress >= Math.PI * 2) {
            player.isFlipping = false;
            player.rotation = 0;
        } else {
            player.rotation = player.flipProgress;
        }
    }

    // Ground collision
    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Trampoline bounce animation
    if (trampoline.bounce > 0) {
        trampoline.bounce--;
    }

    // Update combo timer
    updateComboTimer();
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(135, 206, 235, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    // Draw trampoline
    ctx.save();
    ctx.translate(trampoline.x + trampoline.width / 2, trampoline.y);
    ctx.scale(1, 1 - trampoline.bounce / 30);
    ctx.fillStyle = '#FF1493';
    ctx.fillRect(-trampoline.width / 2, 0, trampoline.width, trampoline.height);
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 3;
    ctx.strokeRect(-trampoline.width / 2, 0, trampoline.width, trampoline.height);
    ctx.restore();

    // Draw player (stick figure style)
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate(player.rotation);

    // Head
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(0, -15, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-4, -17, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, -17, 2, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.arc(0, -15, 5, 0, Math.PI);
    ctx.stroke();

    // Body
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(0, 10);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-15, -5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(15, -5);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(-10, 25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(10, 25);
    ctx.stroke();

    ctx.restore();

    // Update score display
    document.getElementById('score').textContent = score;
    document.getElementById('combo').textContent = combo;

    // Draw combo text
    if (combo > 1) {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 30px Arial';
        ctx.fillText('COMBO x' + combo, 20, 50);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game!
gameLoop();
