function createQuiz() {
    // Altera o titulo da pagina
    document.title = "Quiz - Refúgio Vista da Montanha";

    // Cria a div principal
    const quizHeader = document.createElement('div');
    quizHeader.id = "quiz";
    quizHeader.classList.add('quiz-header');

    // Cria a imagem
    const logo = document.createElement('img');
    logo.src = './resources/hotel/logo.webp';
    logo.alt = 'Logo do Hotel';
    logo.classList.add('quiz-logo');

    // Cria o span com o título
    const title = document.createElement('span');
    title.classList.add('quiz-title');
    title.textContent = 'Quiz - Refúgio Vista da Montanha';

    // Cria o formulário
    const quizForm = document.createElement('form');
    quizForm.id = 'quizForm';

    // Adiciona a imagem e o título dentro da div
    quizHeader.appendChild(logo);
    quizHeader.appendChild(title);
    quizHeader.appendChild(quizForm);

    // Finalmente, adiciona tudo no body
    document.body.appendChild(quizHeader);

    getQuestions().forEach((q, i) => {
        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question");
        questionDiv.innerHTML = `<h2>${i + 1}. ${q.question}</h2>`;

        const optionsDiv = document.createElement("div");
        optionsDiv.classList.add("options");

        if (q.type === "text") {
            q.options.forEach(option => {
                const opt = document.createElement("div");
                opt.className = "option";
                opt.dataset.value = option.label;
                opt.innerText = option.label;
                optionsDiv.appendChild(opt);
            });
        } else if (q.type === "fill") {
            const input = document.createElement("input");
            input.type = "text";
            input.name = `pergunta_${i}`;
            optionsDiv.appendChild(input);
        } else if (q.type === "image") {
            q.options.forEach(option => {
                const opt = document.createElement("div");
                opt.className = "option image-option";
                opt.dataset.value = option.label;
                opt.innerHTML = `
                    <img src="${option.image}" alt="${option.label}">
                    <div>${option.label}</div>
                `;

                optionsDiv.appendChild(opt);
            });
        }

        questionDiv.appendChild(optionsDiv);
        quizForm.appendChild(questionDiv);
    });

    const button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Responder";
    quizForm.appendChild(button);

    // Clique nas opções
    quizForm.addEventListener("click", (e) => {
        if (e.target.closest(".option")) {
            const opt = e.target.closest(".option");
            const group = opt.parentElement.querySelectorAll(".option");
            group.forEach(o => o.classList.remove("selected"));
            opt.classList.add("selected");
        }
    });

    // Enviar formulário
    quizForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Coleta respostas (caso queira usar depois)
        const respostas = {};
        document.querySelectorAll(".question").forEach((q, i) => {
            const selected = q.querySelector(".option.selected");
            respostas[`Pergunta ${i + 1}`] = selected ? selected.dataset.value : "Não respondida";
        });

        // Remove formulário e botão
        quizForm.innerHTML = "";

        // Cria nova mensagem
        const messageDiv = document.createElement("div");
        messageDiv.id = "messageDiv";
        messageDiv.style.background = "#fff";
        messageDiv.style.padding = "2rem";
        messageDiv.style.borderRadius = "8px";
        messageDiv.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
        messageDiv.style.textAlign = "center";
        messageDiv.style.marginTop = "2rem";

        messageDiv.innerHTML = `
            <h2 style="color: #007bff;">Quase lá!</h2>
            <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">
                Agora quero contar uma história através de um jogo!
            </p>
            <button id="playButton" style="
                padding: 0.75rem 2rem;
                font-size: 1rem;
                background-color: #28a745;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            ">Jogar</button>
        `;

        document.body.appendChild(messageDiv);

        // Ação do botão "Prosseguir"
        document.getElementById("playButton").addEventListener("click", () => {
            startGame();
        });
    });
}

function getQuestions() {
    return [
        {
            "question": "Escreva seu nome",
            "type": "fill"
        },
        {
            "question": "Em qual das acomodação vocês está?",
            "type": "image",
            "options": [
                {
                    "label": "DOMO Galaxy",
                    "image": "./resources/hotel/domo.webp"
                },
                {
                    "label": "Cabana Casulo",
                    "image": "./resources/hotel/casulo.webp"
                },
                {
                    "label": "Cabana Platano",
                    "image": "./resources/hotel/cabana.webp"
                }
            ]
        },
        {
            "question": "Em que estado brasileiro fica localizado o Refúgio Vista da Montanha?",
            "type": "text",
            "options": [
                { "label": "Santa Catarina" },
                { "label": "Rio Grande do Sul" },
                { "label": "Paraná" },
                { "label": "São Paulo" }
            ]
        },
        {
            "question": "Qual dessas atividades é oferecida no Refúgio Vista da Montanha?",
            "type": "text",
            "options": [
                { "label": "Trilhas na natureza"},
                { "label": "Mergulho"},
                { "label": "Esqui"},
                { "label": "Safari"}
            ]
        },
        {
            "question": "Qual a principal atração das acomodações no Refúgio Vista da Montanha?",
            "type": "text",
            "options": [
                { "label": "Domos geodésicos com vista panorâmica"},
                { "label": "Tendas tradicionais"},
                { "label": "Apartamentos luxuosos"},
                { "label": "Cabines na praia"}
            ]
        },
        {
            "question": "Qual cidade é a mais próxima do Refúgio Vista da Montanha?",
            "type": "text",
            "options": [
                { "label": "Imaruí"},
                { "label": "Florianópolis"},
                { "label": "Blumenau"},
                { "label": "Joinville"}
            ]
        },
        {
            "question": "O Refúgio Vista da Montanha oferece serviço de transfer a partir de qual cidade?",
            "type": "text",
            "options": [
                { "label": "Florianópolis"},
                { "label": "Curitiba"},
                { "label": "Porto Alegre"},
                { "label": "São Paulo"}
            ]
        },
        {
            "question": "Qual dessas comodidades estão disponíveis no Refúgio Vista da Montanha?",
            "type": "text",
            "options": [
                { "label": "Banheira de hidromassagem externa" },
                { "label": "Piscina aquecida" },
                { "label": "Quadra de tênis" },
                { "label": "Academia completa" }
            ]
        },
        {
            "question": "Qual destes itens podem ser adicionados como experiência extra no Refúgio?",
            "type": "text",
            "options": [
                { "label": "Cesta de café da manhã e decoração romântica" },
                { "label": "Aulas de culinária local" },
                { "label": "Tour histórico guiado" },
                { "label": "Aluguel de bicicletas" }
            ]
        },
        {
            "question": "Qual é o diferencial do Refúgio quanto à privacidade dos hóspedes?",
            "type": "text",
            "options": [
                { "label": "Todas as acomodações são compartilhadas entre hóspedes" },
                { "label": "Cada espaço é completamente reservado e isolado na natureza" },
                { "label": "Os hóspedes dividem áreas comuns como cozinha e banheiros" },
                { "label": "O local funciona em sistema de hostel com quartos coletivos" }
            ]
        },
        {
            "question": "O que está incluso na decoração romântica oferecida como extra?",
            "type": "text",
            "options": [
            { "label": "Bolo de casamento e DJ ao vivo" },
            { "label": "Flores, velas, balões e vinho ou espumante" },
            { "label": "Banho de espuma e massagens com óleos essenciais" },
            { "label": "Tapete vermelho e serenata ao vivo" }
            ]
        },
        {
            "question": "O que torna o Domo Galaxy ideal para noites estreladas?",
            "type": "text",
            "options": [
                { "label": "Sua estrutura permite visão panorâmica do céu" },
                { "label": "Tem telescópio acoplado e teto retrátil" },
                { "label": "Possui janelas redondas que abrem automaticamente" },
                { "label": "Oferece sessões noturnas de planetário virtual" }
            ]
        },
        {
            "question": "O que está incluso no café da manhã opcional oferecido como extra?",
            "type": "text",
            "options": [
                { "label": "Pães artesanais, frutas, geleias caseiras e suco natural" },
                { "label": "Apenas café preto e bolachas" },
                { "label": "Buffet internacional com pratos quentes" },
                { "label": "Café expresso e doces importados" }
            ]
        },
        {
            "question": "Além do site, onde é possível acompanhar novidades e fotos do Refúgio?",
            "type": "text",
            "options": [
                { "label": "Instagram oficial" },
                { "label": "Canal de TV exclusivo" },
                { "label": "Página no LinkedIn" },
                { "label": "Perfil no TikTok de culinária" }
            ]
        }
    ];
}