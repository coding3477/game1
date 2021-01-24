const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector("#scoreEl")

//console.log(canvas);

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 10, 'white');
const projectiles = []
const enemies = []
const particles = []
const enemy_speed = 1.0;

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;

        let x;
        let y;

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = 'hsl(' + Math.random() * 360 + ', 50%, 50%)';
        const angle = Math.atan2(player.y - y, player.x - x)
        const velocity = {
            x: Math.cos(angle) * enemy_speed,
            y: Math.sin(angle) * enemy_speed
        };

        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

let animationId;
let score = 0;
key_pressed = {
    t: false,
    r: false,
    b: false,
    l: false
}

function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, 0.1';
    c.fillRect(0, 0, canvas.width, canvas.height);

    if (key_pressed.t == true && player.y - player.radius > 0) {
        player.y -= 2;
    }
    if (key_pressed.r == true && player.x + player.radius < canvas.width) {
        player.x += 2;
    }
    if (key_pressed.b == true && player.y + player.radius < canvas.height) {
        player.y += 2;
    }
    if (key_pressed.l == true && player.x - player.radius > 0) {
        player.x -= 2;
    }

    player.draw();

    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update();
        }
    })

    projectiles.forEach((projectile, index) => {
        projectile.update();
        projectile.draw();

        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            projectiles.splice(index, 1);
        }
    })

    enemies.forEach((enemy, index) => {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x)
        const velocity = {
            x: Math.cos(angle) * enemy_speed,
            y: Math.sin(angle) * enemy_speed
        };
        enemy.velocity = velocity;
        enemy.update();
        enemy.draw();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId);
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            if (dist - enemy.radius - projectile.radius < 1) {
                if (enemy.radius - 10 > 5) {
                    //enemy.radius -= 10;
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    });
                    projectiles.splice(index, 1);
                } else {
                    score += 100;
                    scoreEl.innerHTML = score;
                    enemies.splice(index, 1);
                    //projectiles.splice(index, 1);
                    for (let i = 0; i < enemy.radius * 2; i++) {
                        particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                            x: (Math.random() - 0.5) * (Math.random() * 6),
                            y: (Math.random() - 0.5) * (Math.random() * 6)
                        }));
                    }
                }

            }
        })
    })
}

window.addEventListener('click', (event) => {
    //console.log(projectiles);
    const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    };
    projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity));
});



window.addEventListener('keydown', (event) => {
    if (event.code == 'KeyA') {
        key_pressed.l = true;
    }
    if (event.code == 'KeyD') {
        key_pressed.r = true;
    }
    if (event.code == 'KeyW') {
        key_pressed.t = true;
    }
    if (event.code == 'KeyS') {
        key_pressed.b = true;
    }


});

window.addEventListener('keyup', (event) => {
    if (event.code == 'KeyA') {
        key_pressed.l = false;
    }
    if (event.code == 'KeyD') {
        key_pressed.r = false;
    }
    if (event.code == 'KeyW') {
        key_pressed.t = false;
    }
    if (event.code == 'KeyS') {
        key_pressed.b = false;
    }
});

animate();
spawnEnemies();