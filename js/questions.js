/**
 * QUESTIONS PAGE CONTROLLER - FIXED
 * Versão corrigida que resolve o problema da tela de loading
 */

const API_BASE_URL = 'http://localhost:8080';
let currentSessionId = null;
let currentSessionState = null;
let answerMapping = {};

console.log('📋 Questions.js carregado - versão corrigida');

// Função para verificar se o usuário está logado
function checkAuth() {
    const token = localStorage.getItem('token');
    console.log('🔐 Verificando autenticação:', token ? 'Token encontrado' : 'Token não encontrado');
    
    if (!token) {
        hideLoadingOverlay();
        showModal('Você precisa fazer login para jogar!');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return false;
    }
    return true;
}

// Função para fazer requisições autenticadas
async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    console.log('🌐 Fazendo requisição para:', url);
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };
    
    try {
        const response = await fetch(url, mergedOptions);
        console.log('📥 Status da resposta:', response.status);
        
        if (response.status === 403 || response.status === 401) {
            console.error('❌ Erro de autenticação');
            localStorage.removeItem('token');
            localStorage.removeItem('loggedIn');
            hideLoadingOverlay();
            showModal('Sessão expirada. Faça login novamente.');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            throw new Error('Unauthorized');
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro na resposta:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return response;
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        throw error;
    }
}

// Controlar a tela de loading
function showLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        console.log('👁️ Loading overlay mostrado');
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
        console.log('👁️ Loading overlay escondido');
    }
}

// Iniciar nova sessão de quiz
async function startQuizSession() {
    console.log('🎮 Iniciando nova sessão de quiz...');
    
    if (!checkAuth()) {
        console.log('❌ Falha na autenticação');
        return;
    }
    
    showLoadingOverlay();
    
    try {
        console.log('📤 Enviando requisição para iniciar sessão...');
        
        const response = await authenticatedFetch(`${API_BASE_URL}/api/quiz-session/start`, {
            method: 'POST',
            body: JSON.stringify({
                numberOfQuestions: 10
            })
        });
        
        const sessionData = await response.json();
        console.log('✅ Sessão criada com sucesso:', sessionData);
        
        currentSessionId = sessionData.sessionId;
        currentSessionState = sessionData;
        
        // IMPORTANTE: Chamar displayQuestion ANTES de esconder o loading
        displayQuestion(sessionData);
        
        // Esconder o loading após um pequeno delay para garantir que a UI foi atualizada
        setTimeout(() => {
            hideLoadingOverlay();
        }, 500);
        
    } catch (error) {
        console.error('❌ Erro ao iniciar quiz:', error);
        hideLoadingOverlay();
        showModal(`Erro ao iniciar o quiz: ${error.message}`);
    }
}

// Exibir pergunta atual
function displayQuestion(sessionState) {
    console.log('📝 Exibindo pergunta:', sessionState);
    
    if (!sessionState || !sessionState.currentQuestion) {
        console.error('❌ Pergunta não encontrada no estado da sessão');
        hideLoadingOverlay();
        showModal('Erro ao carregar pergunta');
        return;
    }
    
    const question = sessionState.currentQuestion;
    console.log('📋 Pergunta atual:', question);
    
    // Atualizar o texto da pergunta
    const questionElement = document.getElementById('Questao');
    if (questionElement) {
        questionElement.textContent = question.content;
        console.log('✅ Pergunta atualizada na tela');
    } else {
        console.error('❌ Elemento #Questao não encontrado');
    }
    
    // Atualizar as respostas
    const answers = question.answers;
    console.log('📝 Respostas:', answers);
    
    // Limpar mapeamento anterior
    answerMapping = {};
    
    const answerElements = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
    const boxElements = document.querySelectorAll('.box');
    
    console.log('🔍 Elementos box encontrados:', boxElements.length);
    
    answers.forEach((answer, index) => {
        if (index < answerElements.length) {
            const element = document.getElementById(answerElements[index]);
            if (element) {
                element.textContent = answer.content;
                answerMapping[index] = answer.id;
                
                // Armazenar o ID no elemento box correspondente
                if (boxElements[index]) {
                    boxElements[index].dataset.answerId = answer.id;
                    boxElements[index].dataset.answerIndex = index;
                    console.log(`✅ Resposta ${index + 1} configurada: ${answer.content}`);
                }
            } else {
                console.error(`❌ Elemento ${answerElements[index]} não encontrado`);
            }
        }
    });
    
    console.log('🗺️ Mapeamento de respostas:', answerMapping);
    
    // Atualizar informações na tela
    updateScoreDisplay(sessionState);
    updateProgressDisplay(sessionState);
    
    console.log('✅ Pergunta exibida com sucesso');
}

// Atualizar exibição da pontuação e progresso
function updateScoreDisplay(sessionState) {
    const scoreElement = document.getElementById('current-score');
    if (scoreElement) {
        scoreElement.textContent = sessionState.score || 0;
    }
    
    const questionNumberElement = document.getElementById('current-question-number');
    if (questionNumberElement) {
        questionNumberElement.textContent = (sessionState.currentQuestionIndex + 1);
    }
    
    const totalQuestionsElement = document.getElementById('total-questions');
    if (totalQuestionsElement) {
        totalQuestionsElement.textContent = sessionState.totalQuestions;
    }
}

// Atualizar barra de progresso
function updateProgressDisplay(sessionState) {
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    
    if (progressFill && progressPercentage) {
        const progress = ((sessionState.currentQuestionIndex + 1) / sessionState.totalQuestions) * 100;
        progressFill.style.width = `${progress}%`;
        progressPercentage.textContent = `${Math.round(progress)}%`;
    }
}

// Enviar resposta
async function submitAnswer(answerId) {
    if (!currentSessionId || !checkAuth()) {
        console.error('❌ Sessão ou autenticação inválida');
        return;
    }
    
    console.log('📤 Enviando resposta com ID:', answerId);
    
    // Desabilitar botões para evitar cliques múltiplos
    disableAnswerButtons();
    
    try {
        const response = await authenticatedFetch(
            `${API_BASE_URL}/api/quiz-session/${currentSessionId}/answer`,
            {
                method: 'POST',
                body: JSON.stringify({
                    answerId: parseInt(answerId)
                })
            }
        );
        
        const result = await response.json();
        console.log('✅ Resposta do servidor:', result);
        
        // Se retornou um resultado final (fim do jogo)
        if (result.finalScore !== undefined) {
            handleQuizEnd(result);
        } else {
            // Continuar com a próxima pergunta
            currentSessionState = result;
            displayQuestion(result);
        }
        
    } catch (error) {
        console.error('❌ Erro ao enviar resposta:', error);
        showModal(`Erro ao processar resposta: ${error.message}`);
    } finally {
        // Reabilitar botões
        enableAnswerButtons();
    }
}

// Desabilitar botões de resposta
function disableAnswerButtons() {
    const boxes = document.querySelectorAll('.box');
    boxes.forEach(box => {
        box.style.pointerEvents = 'none';
        box.style.opacity = '0.6';
    });
}

// Reabilitar botões de resposta
function enableAnswerButtons() {
    const boxes = document.querySelectorAll('.box');
    boxes.forEach(box => {
        box.style.pointerEvents = 'auto';
        box.style.opacity = '1';
    });
}

// Lidar com o fim do quiz
function handleQuizEnd(result) {
    console.log('🏁 Quiz finalizado:', result);
    
    let message = result.message || 'Quiz finalizado!';
    message += ` Sua pontuação final foi: ${result.finalScore}`;
    
    if (result.wasCompleted) {
        message += ' - Parabéns por completar todas as perguntas!';
    }
    
    showModal(message);
    
    // Resetar estado
    currentSessionId = null;
    currentSessionState = null;
    answerMapping = {};
    
    // Redirecionar após alguns segundos
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 5000);
}

// Lidar com clique nas respostas
function handleAnswerClick(event) {
    const box = event.currentTarget;
    const answerId = box.dataset.answerId;
    
    if (!answerId) {
        console.error('❌ ID da resposta não encontrado');
        return;
    }
    
    console.log('👆 Clique na resposta - ID:', answerId);
    submitAnswer(answerId);
}

// Função showModal melhorada
function showModal(message) {
    console.log('📢 Mostrando modal:', message);
    
    const modalText = document.getElementById('modalText');
    const modal = document.getElementById('myModal');
    
    if (modalText && modal) {
        modalText.textContent = message;
        modal.style.display = 'block';
    } else {
        // Fallback para alert
        alert(message);
    }
    
    // Auto-hide loading se modal for mostrado
    hideLoadingOverlay();
}

// Configurar event listeners
document.addEventListener("DOMContentLoaded", function () {
    console.log('🚀 Página de questões carregada - DOM ready');
    
    // Mostrar loading inicialmente
    showLoadingOverlay();
    
    // Configurar cliques nas respostas
    const answerElements = document.querySelectorAll('.box');
    console.log('🔍 Configurando event listeners para', answerElements.length, 'elementos .box');
    
    answerElements.forEach((element, index) => {
        element.addEventListener('click', handleAnswerClick);
        console.log(`✅ Event listener configurado para box ${index + 1}`);
    });
    
    // Verificar autenticação e iniciar sessão
    if (checkAuth()) {
        console.log('✅ Usuário autenticado, iniciando sessão em 1 segundo...');
        // Delay para permitir que a página carregue completamente
        setTimeout(() => {
            startQuizSession();
        }, 1000);
    } else {
        console.log('❌ Usuário não autenticado');
        hideLoadingOverlay();
    }
});

// Debug: Log quando o script carrega
console.log('📋 Questions.js carregado completamente');
console.log('🌐 API Base URL:', API_BASE_URL);