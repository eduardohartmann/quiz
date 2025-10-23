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
        // Personagens
        this.load.image('pudim', 'resources/game/character/pudim.png');
        this.load.image('cueio', 'resources/game/character/cueio.png');

        // Itens comuns
        this.load.image('msn', 'resources/game/items/msn.png');

        // Itens especiais
        this.load.image('coracao', 'resources/game/items/coracao.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#87CEEB');
        showSceneTitleAndPause(this, 'Faze 1 - Conselheiro Mafra: O começo!', 2000);

        // ------------------ CHÃO ------------------
        const groundHeight = 25;
        const groundWidth = this.scale.width * 2;

        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x654321, 1);
        groundGraphics.fillRect(0, 0, groundWidth, groundHeight);
        groundGraphics.generateTexture('ground', groundWidth, groundHeight);
        groundGraphics.destroy();

        this.ground = this.add.tileSprite(0, this.scale.height - groundHeight, groundWidth, groundHeight, 'ground').setOrigin(0);
        this.groundPhysics = this.physics.add.staticSprite(this.scale.width, this.scale.height - groundHeight / 2, 'ground');
        this.groundPhysics.setSize(groundWidth, groundHeight).setVisible(false);

        // ------------------ JOGADOR ------------------
        const playerSize = 50;
        const playerY = this.scale.height - groundHeight - playerSize;

        this.player = this.physics.add.sprite(100, playerY, this.playerImageKey)
            .setCollideWorldBounds(true)
            .setDisplaySize(playerSize, playerSize);

        this.physics.add.collider(this.player, this.groundPhysics);

        // ------------------ ITENS ------------------
        this.items = this.physics.add.group();
        this.specialItems = this.physics.add.group();

        this.itemImages = ['msn']; // itens comuns

        // Tamanhos fixos (o colisor define o tamanho da imagem)
        this.itemSize = { width: 30, height: 30 };
        this.specialItemSize = { width: 50, height: 50 };

        // Gatilhos para itens especiais
        this.specialItemTriggers = [
            { score: 5, key: 'coracao', shown: false, message: 'Você encontrou o Coração da Amizade!' }
        ];

        // Geração contínua de itens
        this.time.addEvent({
            delay: 1500,
            callback: this.generateItem,
            callbackScope: this,
            loop: true
        });

        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
        this.physics.add.overlap(this.player, this.specialItems, this.collectSpecialItem, null, this);

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

        this.player.body.setAllowGravity(true);
    }

    // ------------------ LOOP PRINCIPAL ------------------
    update() {
        // movimento do chão
        this.ground.tilePositionX += 5;

        // pulo
        if (this.isPressing) this.player.setVelocityY(-300);

        // limite superior
        if (this.player.y < 25) {
            this.player.y = 25;
            this.player.setVelocityY(0);
        }

        // remover itens que saíram da tela
        this.items.children.iterate(item => {
            if (item && item.x < -50) item.destroy();
        });

        this.specialItems.children.iterate(item => {
            if (item && item.x < -50) {
                const key = item.getData('key');
                item.destroy();
                const trigger = this.specialItemTriggers.find(t => t.key === key);
                if (trigger) trigger.shown = false;
            }
        });
    }

    // ------------------ GERAR ITENS ------------------
    generateItem() {
        const x = this.scale.width + 30;
        const y = Phaser.Math.Between(50, this.scale.height - 150);

        // verifica se deve gerar um item especial
        const specialTrigger = this.specialItemTriggers.find(t => t.score === this.score && !t.shown);
        if (specialTrigger) {
            specialTrigger.shown = true;

            const special = this.specialItems.create(x, y, specialTrigger.key);
            special.setVelocityX(-250);
            special.body.setAllowGravity(false);

            // tamanho do colisor e imagem (mesmo valor)
            const { width, height } = this.specialItemSize;
            special.body.setSize(width, height);
            special.setDisplaySize(width, height);

            special.setData('key', specialTrigger.key);
            return;
        }

        // gera item comum
        const randomKey = Phaser.Utils.Array.GetRandom(this.itemImages);
        const item = this.items.create(x, y, randomKey);
        item.setVelocityX(-200);
        item.body.setAllowGravity(false);

        const { width, height } = this.itemSize;
        item.body.setSize(width, height);
        item.setDisplaySize(width, height);

        item.setCollideWorldBounds(false);
    }

    // ------------------ COLETAR ITENS ------------------
    collectItem(player, item) {
        item.destroy();
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    collectSpecialItem(player, item) {
        const key = item.getData('key');
        const message = item.getData('message') || 'Item especial coletado!';
        item.destroy();

        const trigger = this.specialItemTriggers.find(t => t.key === key);
        if (trigger) trigger.shown = false;

        this.score += 5; // bônus
        this.scoreText.setText(`Score: ${this.score}`);

        // Pausar jogo e mostrar modal
        this.showSpecialItemModal(key, message);
    }

    // ------------------ MODAL ESPECIAL ------------------
    showSpecialItemModal(itemKey, message) {
        // Pausa somente a física (mantém os inputs ativos)
        this.physics.world.pause();

        // Container do modal
        const modalGroup = this.add.container(0, 0).setDepth(1000);

        // Fundo escurecido
        const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6)
            .setOrigin(0)
            .setInteractive(); // evita cliques passarem por baixo
        modalGroup.add(bg);

        // Janela central
        const modalWidth = 400;
        const modalHeight = 300;
        const modalBg = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, modalWidth, modalHeight, 0xffffff, 1)
            .setStrokeStyle(4, 0x000000)
            .setOrigin(0.5);
        modalGroup.add(modalBg);

        // Imagem do item
        const itemImage = this.add.image(this.scale.width / 2, this.scale.height / 2 - 60, itemKey)
            .setDisplaySize(80, 80);
        modalGroup.add(itemImage);

        // Texto
        const modalText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 20, message, {
            fontSize: '20px',
            fill: '#000',
            align: 'center',
            wordWrap: { width: modalWidth - 40 }
        }).setOrigin(0.5);
        modalGroup.add(modalText);

        // Botão "Continuar"
        const button = this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, 'Continuar ▶', {
            fontSize: '24px',
            fill: '#007BFF',
            backgroundColor: '#fff',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        modalGroup.add(button);

        button.on('pointerover', () => button.setStyle({ fill: '#0056b3' }));
        button.on('pointerout', () => button.setStyle({ fill: '#007BFF' }));

        // ✅ Retoma o jogo ao clicar
        button.on('pointerdown', () => {
            modalGroup.destroy();
            this.physics.world.resume(); // volta a física
        });

        // Efeito de fade in para o modal (suaviza a aparição)
        modalGroup.setAlpha(0);
        this.tweens.add({
            targets: modalGroup,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
    }
}

function showSceneTitleAndPause(scene, text, duration = 1000) {
    // Pausar física e input
    scene.physics.world.pause();
    scene.input.enabled = false;

    const title = scene.add.text(scene.scale.width / 2, scene.scale.height / 2, text, {
        fontSize: '64px',
        fill: '#fff',
        fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);

    scene.tweens.add({
        targets: title,
        alpha: 1,
        duration,
        ease: 'Power2',
        hold: 1000,
        yoyo: true,
        onComplete: () => {
            title.destroy();
            scene.physics.world.resume();
            scene.input.enabled = true;
        }
    });
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
