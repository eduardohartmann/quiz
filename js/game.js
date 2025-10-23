class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        // Carrega os personagens disponíveis
        this.load.image('pudim', 'resources/game/character/pudim.png');
        this.load.image('cueio', 'resources/game/character/cueio.png');
    }

    create() {
        // Título
        this.add.text(this.scale.width / 2, 60, 'Escolha seu personagem', {
            fontSize: '32px',
            fill: '#000'
        }).setOrigin(0.5);

        // Opções de personagens
        const option1 = this.add.image(this.scale.width / 3, this.scale.height / 2, 'pudim').setInteractive();
        const option2 = this.add.image((this.scale.width / 3) * 2, this.scale.height / 2, 'cueio').setInteractive();

        // Tamanhos ajustados
        option1.setDisplaySize(200, 150);
        option2.setDisplaySize(150, 165);

        // Efeitos visuais ao passar o mouse
        [option1, option2].forEach(opt => {
            opt.on('pointerover', () => opt.setTint(0xffff99));
            opt.on('pointerout', () => opt.clearTint());
        });

        // Escolha do personagem
        option1.on('pointerdown', () => this.scene.start('GameScene', { playerImage: 'pudim' }));
        option2.on('pointerdown', () => this.scene.start('GameScene', { playerImage: 'cueio' }));
    }
}

// -------------------------------------------------------------

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.playerImageKey = data.playerImage || 'pudim';
    }

    preload() {
        // Garante que as imagens estejam disponíveis
        this.load.image('pudim', 'resources/game/character/pudim.png');
        this.load.image('cueio', 'resources/game/character/cueio.png');
    }

    create() {
        // Fundo
        this.cameras.main.setBackgroundColor('#87CEEB');

        // ------------------ CHÃO ------------------
        const groundHeight = 25;
        const groundWidth = this.scale.width * 2;

        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x654321, 1);
        groundGraphics.fillRect(0, 0, groundWidth, groundHeight);
        groundGraphics.generateTexture('ground', groundWidth, groundHeight);
        groundGraphics.destroy();

        this.ground = this.add.tileSprite(0, this.scale.height - groundHeight, groundWidth, groundHeight, 'ground').setOrigin(0);

        // Collider físico alinhado
        this.groundPhysics = this.physics.add.staticSprite(this.scale.width, this.scale.height - groundHeight / 2, 'ground');
        this.groundPhysics.setSize(groundWidth, groundHeight).setVisible(false);

        // ------------------ JOGADOR ------------------
        const playerSize = 50;
        const playerY = this.scale.height - groundHeight - playerSize; // acima do chão

        this.player = this.physics.add.sprite(100, playerY, this.playerImageKey)
            .setCollideWorldBounds(true)
            .setDisplaySize(playerSize, playerSize);

        this.physics.add.collider(this.player, this.groundPhysics);

        // ------------------ ITENS ------------------
        this.items = this.physics.add.group();

        this.time.addEvent({
            delay: 1500,
            callback: this.generateItem,
            callbackScope: this,
            loop: true
        });

        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

        // ------------------ INTERFACE ------------------
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

        // ------------------ CONTROLE ------------------
        this.isPressing = false;

        this.input.on('pointerdown', () => {
            this.isPressing = true;
            this.player.setVelocityY(-300);
        });

        this.input.on('pointerup', () => this.isPressing = false);

        // ------------------ FÍSICA ------------------
        this.player.body.setAllowGravity(true);
    }

    // ------------------ LOOP PRINCIPAL ------------------
    update() {
        this.ground.tilePositionX += 5;

        if (this.isPressing) {
            this.player.setVelocityY(-300);
        }

        // Limite superior
        if (this.player.y < 25) {
            this.player.y = 25;
            this.player.setVelocityY(0);
        }
    }

    // ------------------ GERAR ITENS ------------------
    generateItem() {
        // Cria textura apenas uma vez
        if (!this.textures.exists('itemTexture')) {
            const itemGraphics = this.add.graphics();
            itemGraphics.fillStyle(0xff0000, 1);
            itemGraphics.fillCircle(15, 15, 15);
            itemGraphics.generateTexture('itemTexture', 30, 30);
            itemGraphics.destroy();
        }

        const x = this.scale.width + 30;
        const y = Phaser.Math.Between(50, this.scale.height - 150);

        const item = this.items.create(x, y, 'itemTexture');
        item.setVelocityX(-200);
        item.body.setAllowGravity(false);
        item.setSize(30, 30);
        item.setCollideWorldBounds(false);
    }

    // ------------------ COLETAR ITEM ------------------
    collectItem(player, item) {
        item.destroy();
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`);
    }
}

// -------------------------------------------------------------

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MenuScene, GameScene]
};

let game;

function startGame() {
    document.title = "Game";
    document.body.style.padding = "0";

    ['quiz', 'messageDiv'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });

    game = new Phaser.Game(config);
}
