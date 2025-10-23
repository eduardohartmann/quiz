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
        this.load.image('coracao', 'resources/game/items/coracao.png');

        // Itens especiais
        this.load.image('especial-1', 'resources/game/items/especial-1.png');
        this.load.image('especial-2', 'resources/game/items/especial-2.jpg');
        this.load.image('especial-3', 'resources/game/items/especial-3.jpg');
        this.load.image('especial-4', 'resources/game/items/especial-4.jpg');
        this.load.image('especial-5', 'resources/game/items/especial-5.jpg');
        this.load.image('especial-6', 'resources/game/items/especial-6.png');
        this.load.image('especial-7', 'resources/game/items/especial-7.jpg');
        this.load.image('especial-8', 'resources/game/items/especial-8.jpg');
        this.load.image('especial-9', 'resources/game/items/especial-9.jpg');
        this.load.image('especial-10', 'resources/game/items/especial-10.jpg');
        this.load.image('especial-11', 'resources/game/items/especial-11.heic');
        this.load.image('especial-12', 'resources/game/items/especial-12.jpg');
        this.load.image('especial-13', 'resources/game/items/especial-13.jpg');
        this.load.image('especial-14', 'resources/game/items/especial-14.jpg');
    }

    create() {
        this.cameras.main.setBackgroundColor('#87CEEB');
        showSceneTitleAndPause(this, 'Se leu mamou!', 1000);

        this.lastSpecialScore = 0;  // Guarda o score no momento da última coleta especial

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

        this.itemImages = ['coracao']; // itens comuns

        // Tamanhos fixos (o colisor define o tamanho da imagem)
        this.itemSize = { width: 30, height: 30 };
        this.specialItemSize = { width: 50, height: 50 };

        // Gatilhos para itens especiais
        this.specialItemTriggers = [
            { score: 5, key: 'especial-1', shown: false, collected: false, message: 'Após muitas mensagens e aproximação, abrimos nosso coração!' },
            { score: 5, key: 'especial-2', shown: false, collected: false, message: 'Algumas mensagens no caderno' },
            { score: 5, key: 'especial-3', shown: false, collected: false, message: 'Nossa primeira foto' },
            { score: 5, key: 'especial-4', shown: false, collected: false, message: 'Talvez a primeira viagem (como eu era feio)' },
            { score: 5, key: 'especial-5', shown: false, collected: false, message: 'Participamos de várias festas aleatórias' },
            { score: 5, key: 'especial-6', shown: false, collected: false, message: 'Entramos na UDESC' },
            { score: 5, key: 'especial-7', shown: false, collected: false, message: 'Saimos da UDESC' },
            { score: 5, key: 'especial-8', shown: false, collected: false, message: 'Começamos a ganhar dinheiro e ir mais longe' },
            { score: 5, key: 'especial-9', shown: false, collected: false, message: 'Compramos nosso partamento' },
            { score: 5, key: 'especial-10', shown: false, collected: false, message: 'Vimos ele ser construido' },
            { score: 5, key: 'especial-11', shown: false, collected: false, message: 'Passamos nosso primeiro natal' },
            { score: 5, key: 'especial-12', shown: false, collected: false, message: 'Adotamos um anjo' },
            { score: 5, key: 'especial-13', shown: false, collected: false, message: 'Será que é um anjo?' },
            { score: 15, key: 'especial-14', shown: false, collected: false, message: 'E agora? Qual é o próximo passo?' }
        ];

        // Geração contínua de itens
        this.itemGenerationTimer = this.time.addEvent({
            delay: 1500,
            callback: this.generateItem,
            callbackScope: this,
            loop: true
        });


        this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
        this.physics.add.overlap(this.player, this.specialItems, this.collectSpecialItem, null, this);

        // ------------------ INTERFACE ------------------
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '25px', fill: '#000' });

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
                if (trigger && !trigger.collected) {
                    trigger.shown = false;
                }
            }
        });
    }

    // ------------------ GERAR ITENS ------------------
    generateItem() {
        const x = this.scale.width + 30;
        const y = Phaser.Math.Between(50, this.scale.height - 150);

        // Primeiro, verifique qual é o próximo item especial que deve aparecer
        // A lista de triggers está ordenada (por score), então pega o primeiro que ainda não foi coletado
        // e que o score já alcançou o limite considerando o score na hora da coleta do anterior

        // Encontrar índice do último item especial coletado
        const lastCollectedIndex = this.specialItemTriggers.findIndex(t => !t.collected) - 1;

        // Se não coletou nenhum, lastCollectedIndex será -1 (quer dizer que pode aparecer o primeiro item)
        // O próximo item a aparecer é o que está na posição lastCollectedIndex + 1
        const nextIndex = lastCollectedIndex + 1;

        if (nextIndex >= 0 && nextIndex < this.specialItemTriggers.length) {
            const nextItem = this.specialItemTriggers[nextIndex];

            // Condição para aparecer:
            // score atual >= score do último item coletado + score do próximo item especial
            // Se não coletou nenhum, lastSpecialScore pode ser zero (ou -1, ajustar se precisar)
            const lastScore = lastCollectedIndex >= 0 ? this.lastSpecialScore : 0;

            if (this.score >= lastScore + nextItem.score && !nextItem.shown && !nextItem.collected) {
                nextItem.shown = true;

                const special = this.specialItems.create(x, y, nextItem.key);
                special.setVelocityX(-250);
                special.body.setAllowGravity(false);

                const { width, height } = this.specialItemSize;
                special.body.setSize(width, height);
                special.setDisplaySize(width, height);

                special.setData('key', nextItem.key);
                special.setData('message', nextItem.message);

                this.tweens.add({
                    targets: special,
                    tint: { from: 0xffffff, to: 0xffff99 },  // branco para amarelo claro
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                return;
            }
        }

        // Caso não gere especial, gera item comum
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
        if (trigger) {
            trigger.collected = true;  // não reaparece mais
            trigger.shown = true;      // manter como mostrado
        }

        this.lastSpecialScore = this.score; // guarda o score atual para o próximo cálculo

        // Pausar jogo e mostrar modal
        this.showSpecialItemModal(key, message);
    }


    // ------------------ MODAL ESPECIAL ------------------
    showSpecialItemModal(itemKey, message) {
        this.physics.world.pause();
        this.itemGenerationTimer.paused = true;

        const modalGroup = this.add.container(0, 0).setDepth(1000);

        // Fundo escurecido
        const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6)
            .setOrigin(0)
            .setInteractive();
        modalGroup.add(bg);

        // Definindo tamanho máximo da modal (80% da tela)
        const maxModalWidth = this.scale.width * 0.8;
        const maxModalHeight = this.scale.height * 0.8;

        // Janela modal (dimensões flexíveis, vamos ajustar com base na imagem e texto)
        const modalBg = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, maxModalWidth, maxModalHeight, 0xffffff, 1)
            .setStrokeStyle(4, 0x000000)
            .setOrigin(0.5);
        modalGroup.add(modalBg);

        // Criar imagem mas ainda sem definir escala
        const itemImage = this.add.image(0, 0, itemKey);
        modalGroup.add(itemImage);

        // Obter tamanho natural da imagem
        const naturalWidth = itemImage.width;
        const naturalHeight = itemImage.height;

        // Definir área máxima para imagem na modal (digamos 60% da altura da modal e 90% da largura)
        const maxImageWidth = maxModalWidth * 0.9;
        const maxImageHeight = maxModalHeight * 0.6;

        // Calcular escala mantendo proporção para caber na área máxima
        const scaleX = maxImageWidth / naturalWidth;
        const scaleY = maxImageHeight / naturalHeight;
        const scale = Math.min(scaleX, scaleY, 1); // não aumenta se a imagem for menor que a área

        itemImage.setScale(scale);

        // Posicionar a imagem na modal, um pouco acima do centro para deixar espaço para o texto
        itemImage.setPosition(this.scale.width / 2, this.scale.height / 2 - maxModalHeight * 0.15);

        // Texto abaixo da imagem
        const modalText = this.add.text(this.scale.width / 2, this.scale.height / 2 + maxModalHeight * 0.25, message, {
            fontSize: '15px',
            fill: '#000',
            align: 'center',
            wordWrap: { width: maxModalWidth * 0.9 }
        }).setOrigin(0.5);
        modalGroup.add(modalText);

        // Botão "Continuar"
        const button = this.add.text(this.scale.width / 2, this.scale.height / 2 + maxModalHeight * 0.4, 'Continuar ▶', {
            fontSize: '24px',
            fill: '#007BFF',
            backgroundColor: '#fff',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        modalGroup.add(button);

        button.on('pointerover', () => button.setStyle({ fill: '#0056b3' }));
        button.on('pointerout', () => button.setStyle({ fill: '#007BFF' }));

        button.on('pointerdown', () => {
            modalGroup.destroy();
            this.physics.world.resume();
            this.itemGenerationTimer.paused = false;
        });

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
