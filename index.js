const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

// gravity effect
const gravity = .7

// background
const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './img/background.png'
}) 

const shop = new Sprite({
    position: {
        x: 600,
        y: 128
    },
    imageSrc: './img/shop.png',
    scale: 2.75, 
    framesMax: 6
}) 




// player creation
const player = new Fighter ({
    position: {
        x: 0,
        y: 0
    }, 
    velocity: {
        x: 0, 
        y: 0
    }, 
    offset: {
        x: 0, 
        y:0
    },
    imageSrc: './img/samuraiMack/idle.png',
    framesMax: 8,
    scale: 2.5,
    offset: {
        x: 215,
        y: 157
    },
    sprites: {
        idle: {
            imageSrc: './img/samuraiMack/idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: './img/samuraiMack/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './img/samuraiMack/Jump.png',
            framesMax: 2
        }, 
        fall: {
            imageSrc: './img/samuraiMack/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './img/samuraiMack/Attack1.png',
            framesMax: 6
        },
        takeHit: {
            imageSrc: './img/samuraiMack/Take hit.png',
            framesMax: 4
        },
        death: {
            imageSrc: './img/samuraiMack/Death.png',
            framesMax: 6
        }
    },
    attackBox: {
        offset: {
            x: 100, 
            y: 50
        },
        width: 160, 
        height: 50
    }
})


// enemy creation
const enemy = new Fighter ({
    position: {
        x: 400,
        y: 0
    }, 
    velocity: {
        x: 0, 
        y: 0
    }, 
    offset: {
        x: 215, 
        y:157
    },
    imageSrc: './img/kenji/Idle.png',
    framesMax: 4,
    scale: 2.5,
    offset: {
        x: 215,
        y: 169
    },
    sprites: {
        idle: {
            imageSrc: './img/kenji/Idle.png',
            framesMax: 4
        },
        run: {
            imageSrc: './img/kenji/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './img/kenji/Jump.png',
            framesMax: 2
        }, 
        fall: {
            imageSrc: './img/kenji/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './img/kenji/Attack1.png',
            framesMax: 4
        },
        takeHit: {
            imageSrc: './img/kenji/Take hit.png',
            framesMax: 3
        },
        death: {
            imageSrc: './img/kenji/Death.png',
            framesMax: 7
        }

    },
    attackBox: {
        offset: {
            x: -170, 
            y: 50
        },
        width: 170, 
        height: 50
    }
})

// set key press to false initially, used for the event handlers below, resolves some gimmicky things happening
// when transitioning between movement directions
const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    }, 
    ArrowRight: {
        pressed: false
    }, 
    ArrowLeft: {
        pressed: false
    }
}

decreaseTimer()

function animate() {
    window.requestAnimationFrame(animate)
    // clear canvas after each frame is drawn
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)

    // draw background
    background.update()

    // draw animated shop
    shop.update()

    // provide some contrast between background images and players
    c.fillStyle = 'rgba(255, 255, 255, 0.17)'
    c.fillRect(0, 0, canvas.width, canvas.height)

    // update player models
    player.update()
    enemy.update()

    // set player velocity on x axis to zero. Resolves an issue where the character would continue to float along
    // the x-axis when releasing the movement key
    player.velocity.x = 0

    // player movement

    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5
        player.switchSprite('run')
    } else {
        player.switchSprite('idle')
    }

    // jumping
    if (player.velocity.y < 0) {
        player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')
    }

    enemy.velocity.x = 0
    // enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5
        enemy.switchSprite('run')
    } else {
        enemy.switchSprite('idle')
    }

    // enemy jumping
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall')
    }

    // collision detection
    // if attackbox is greater than the position of enemy, deduct health -- so on and so forth
    if (
        rectangularCollision({
            rectangle1: player, 
            rectangle2: enemy
        }) && 
        player.isAttacking && player.framesCurrent === 4
        ) {
        enemy.takeHit()
        player.isAttacking = false
        document.querySelector('#enemyHealth').style.width = enemy.health + '%'
    } 

    // if player misses
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false
    }

    if (
        rectangularCollision({
            rectangle1: enemy, 
            rectangle2: player
        }) && 
        enemy.isAttacking && enemy.framesCurrent === 2
        ) {
            player.takeHit()
        enemy.isAttacking = false
        document.querySelector('#playerHealth').style.width = player.health + '%'
    }

    // if enemy misses
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false
    }

    // end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId })
    }
}

animate()

// event listeners - needed to move players etc
// start x axis movement when holding down key
window.addEventListener('keydown', (event) => {
    // only allow movement when alive
    if (!player.dead) {
        switch (event.key) {
            //player one (player) controls
            case 'd':
                keys.d.pressed = true
                player.lastKey = 'd'
                break
            case 'a':
                keys.a.pressed = true
                player.lastKey = 'a'
                break
            case 'w':
                player.velocity.y = -20
                break
            case ' ':
                player.attack()
                break
        }
    
    }
    
    // only allow movement if alive
    if (!enemy.dead) {
        switch (event.key) {
            // player two (enemy) controls
            case 'ArrowRight':
                keys.ArrowRight.pressed = true
                enemy.lastKey = 'ArrowRight'
                break
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true
                enemy.lastKey = 'ArrowLeft'
                break
            case 'ArrowUp':
                enemy.velocity.y = -20
                break
            case 'ArrowDown':
                enemy.attack()
                break
        }
    }
})

// stop x axis movement when key is released
window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
    }

// enemy keys
switch (event.key) {
    case 'ArrowRight':
        keys.ArrowRight.pressed = false
        break
    case 'ArrowLeft':
        keys.ArrowLeft.pressed = false
        break
}
})