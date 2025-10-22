const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let ball;
let isDragging = false;
let dragStart = { x: 0, y: 0, time: 0 };
let basket;

function preload() {}

function create() {
  // Cesto
  basket = this.add.rectangle(700, 500, 100, 100, 0x8b4513);
  this.physics.add.existing(basket, true);

  // Bola
  ball = this.add.circle(100, 500, 20, 0xff0000);
  ball.setInteractive({ useHandCursor: true });
  this.input.setDraggable(ball);
  this.physics.add.existing(ball);
  ball.body.setBounce(0.6);
  ball.body.setCollideWorldBounds(true);
  ball.body.onWorldBounds = true;

  // Detecta acerto no cesto
  this.physics.add.overlap(ball, basket, () => {
    console.log('Acertou o cesto!');
  });

  // Início do arrasto
  this.input.on('dragstart', (pointer, gameObject) => {
    if (gameObject === ball) {
      isDragging = true;
      dragStart = {
        x: pointer.x,
        y: pointer.y,
        time: this.time.now
      };
      ball.body.setAllowGravity(false);
      ball.body.setVelocity(0, 0);
    }
  });

  // Durante o arrasto
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    if (gameObject === ball && isDragging) {
      ball.body.reset(dragX, dragY);
    }
  });

  // Soltou o arrasto
  this.input.on('dragend', (pointer, gameObject) => {
    if (gameObject === ball && isDragging) {
      isDragging = false;
      ball.body.setAllowGravity(true);

      const timeElapsed = (this.time.now - dragStart.time) / 1000;
      const dx = pointer.x - dragStart.x;
      const dy = pointer.y - dragStart.y;

      const minTime = 0.05;
      const t = Math.max(timeElapsed, minTime);

      let velocityX = dx / t;
      let velocityY = dy / t;

      // Limitar a força
      const maxSpeed = 1000;
      velocityX = Phaser.Math.Clamp(velocityX, -maxSpeed, maxSpeed);

      // Corrigir direção vertical
      if (dy < 0) {
        // Arrastou para cima
        velocityY = -Math.abs(velocityY);
      } else {
        // Arrastou para baixo → força mínima para cima
        velocityY = -200;
      }

      velocityY = Phaser.Math.Clamp(velocityY, -maxSpeed, 0); // Sempre para cima

      ball.body.setVelocity(velocityX, velocityY);
    }
  });
}

function update() {
  if (ball.y > 600) {
    resetBall.call(this);
  }
}

function resetBall() {
  ball.body.setVelocity(0, 0);
  ball.body.setAllowGravity(false);

  this.time.delayedCall(500, () => {
    ball.setPosition(100, 500);
  });
}
