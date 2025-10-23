class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('pudim', 'resources/game/character/pudim.png');
        this.load.image('cueio', 'resources/game/character/cueio.png');
    }

    create() {
        this.add.text(this.scale.width / 2, 50, 'Escolha seu personagem', { fontSize: '32px', fill: '#000' }).setOrigin(0.5);

        // Criar dois retângulos (sprites) coloridos para escolher
        // const option1 = this.add.rectangle(this.scale.width / 3, this.scale.height / 2, 100, 100, 0x0000ff).setInteractive();
        // const option2 = this.add.rectangle((this.scale.width / 3) * 2, this.scale.height / 2, 100, 100, 0xff0000).setInteractive();

        const option1 = this.add.image(this.scale.width / 3, this.scale.height / 2, 'pudim').setInteractive();
        const option2 = this.add.image((this.scale.width / 3) * 2, this.scale.height / 2, 'cueio').setInteractive();

        // Se quiser, ajustar escala das imagens para caber
        option1.setDisplaySize(200, 150);
        option2.setDisplaySize(150, 165);

        option1.on('pointerdown', () => {
            this.scene.start('GameScene', { playerImage: 'pudim' });
        });

        option2.on('pointerdown', () => {
            this.scene.start('GameScene', { playerImage: 'cueio' });
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.playerImageKey = data.playerImage || 'pudim'; // imagem padrão
    }

    preload() {
        this.load.image('pudim', 'resources/game/character/pudim.png');
        this.load.image('cueio', 'resources/game/character/cueio.png');
    }

    create() {
        // Fundo azul claro
        this.cameras.main.setBackgroundColor('#87CEEB');

        // Criar chão
        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x654321, 1);
        groundGraphics.fillRect(0, 0, this.scale.width * 2, 50);
        groundGraphics.generateTexture('ground', this.scale.width * 2, 50);
        groundGraphics.destroy();

        this.ground = this.add.tileSprite(0, this.scale.height - 50, this.scale.width * 2, 50, 'ground').setOrigin(0);

        // Adiciona o jogador
        this.player = this.physics.add.sprite(100, this.scale.height - 100, this.playerImageKey);
        this.player.setCollideWorldBounds(true);

        // se quiser ajustar o tamanho do player, pode usar setScale ou setDisplaySize
        this.player.setDisplaySize(50, 50);

        // Grupo de itens
        this.items = this.physics.add.group();

        // Chão com física estática para colisão
        this.groundPhysics = this.physics.add.staticSprite(this.scale.width / 2, this.scale.height - 25, 'ground');
        this.groundPhysics.setSize(this.scale.width * 2, 50).setVisible(false);
        this.physics.add.collider(this.player, this.groundPhysics);

        // Colisão player x itens
        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

        // Pontuação
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

        // Input
        this.isPressing = false;
        this.input.on('pointerdown', () => {
            this.isPressing = true;
            this.player.setVelocityY(-300);
        });
        this.input.on('pointerup', () => {
            this.isPressing = false;
        });

        // Gerar itens
        this.time.addEvent({
            delay: 1500,
            callback: this.generateItem,
            callbackScope: this,
            loop: true
        });

        // Física do jogador
        this.player.body.setAllowGravity(true);
    }

    update() {
        this.ground.tilePositionX += 5;

        if (this.isPressing) {
            this.player.setVelocityY(-300);
        }

        if (this.player.y < 25) {
            this.player.y = 25;
            this.player.setVelocityY(0);
        }
    }

    generateItem() {
        if (!this.textures.exists('itemTexture')) {
            const itemGraphics = this.add.graphics();
            itemGraphics.fillStyle(0xff0000, 1);
            itemGraphics.fillCircle(15, 15, 15);
            itemGraphics.generateTexture('itemTexture', 30, 30);
            itemGraphics.destroy();
        }

        const x = this.scale.width + 30;
        const y = Phaser.Math.Between(50, this.scale.height - 100);
        const item = this.items.create(x, y, 'itemTexture');
        item.setVelocityX(-200);
        item.body.setAllowGravity(false);
        item.setSize(30, 30);
        item.checkWorldBounds = true;
        item.outOfBoundsKill = true;
        item.body.world.on('worldbounds', (body) => {
            if (body.gameObject === item) {
                item.destroy();
            }
        });
    }

    collectItem(player, item) {
        item.destroy();
        this.score++;
        this.scoreText.setText('Score: ' + this.score);
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#87CEEB', // cor azul clara tipo céu
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }, // gravidade para o quadrado cair
            debug: false
        }
    },
    scene: [MenuScene, GameScene]
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