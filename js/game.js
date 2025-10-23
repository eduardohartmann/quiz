class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // chão — retângulo verde estático que vamos mover manualmente
        this.ground = this.add.rectangle(400, 580, 1600, 40, 0x00aa00);
        this.physics.add.existing(this.ground, true);

        // personagem — retângulo vermelho fixo na tela
        this.player = this.add.rectangle(150, 450, 32, 48, 0xff0000);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.allowGravity = false; // personagem "fixo" verticalmente

        // grupo de itens — círculos azuis que aparecem vindo da direita e se movem para esquerda
        this.items = this.physics.add.group();

        // Score e texto
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Itens: 0', { fontSize: '32px', fill: '#000' });

        // Tempo limite
        this.timeLeft = 30;
        this.timerText = this.add.text(600, 16, `Tempo: ${this.timeLeft}`, { fontSize: '32px', fill: '#000' });

        this.timedEvent = this.time.addEvent({
            delay: 1000,
            callback: this.onSecond,
            callbackScope: this,
            loop: true
        });

        // Timer para spawnar itens
        this.spawnTimer = this.time.addEvent({
            delay: 1500,
            callback: this.spawnItem,
            callbackScope: this,
            loop: true
        });

        // Física: colisão player e chão
        this.physics.add.collider(this.player, this.ground);

        // Sobreposição para pegar item
        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    }

    update() {
        // Movimenta o chão para esquerda para simular corrida
        this.ground.x -= 3;
        if (this.ground.x < 0) this.ground.x = 800; // loop do chão

        // Movimenta itens para a esquerda
        this.items.children.iterate(item => {
            if (item) {
                item.x -= 3;

                // Remove item que saiu da tela
                if (item.x < -20) {
                    item.destroy();
                }
            }
        });
    }

    spawnItem() {
        // Cria um item do lado direito, em altura aleatória
        const y = Phaser.Math.Between(400, 520);
        const item = this.add.circle(820, y, 15, 0x0000ff);
        this.physics.add.existing(item);
        item.body.allowGravity = false;
        this.items.add(item);
    }

    collectItem(player, item) {
        item.destroy();
        this.score++;
        this.scoreText.setText('Itens: ' + this.score);
    }

    onSecond() {
        this.timeLeft--;
        this.timerText.setText('Tempo: ' + this.timeLeft);

        if (this.timeLeft <= 0) {
            this.scene.restart();
            alert(`Fim do tempo! Você coletou ${this.score} itens.`);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#aaddff',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    parent: 'game-container',
    scene: [GameScene]
};

let game;

function startGame() {
    document.title = "Game";
    document.body.style.padding = "0";

    const elemento = document.getElementById('quiz');
    const messageDiv = document.getElementById('messageDiv');


    // Remove o elemento, se ele existir
    if (elemento) {
        elemento.remove();
    }

    // Remove o elemento, se ele existir
    if (messageDiv) {
        messageDiv.remove();
    }

    game = new Phaser.Game(config);
}