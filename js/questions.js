/**
 * QUESTIONS PAGE CONTROLLER - VERSÃO COM MODAL CORRIGIDO
 * Sistema aprimorado com correção do z-index do modal
 */

const API_BASE_URL = 'http://localhost:8080';
let currentSessionId = null;
let currentSessionState = null;
let answerMapping = {};
let countdownInterval = null;
let redirectTimeout = null;

console.log('📋 Questions.js carregado - versão com modal corrigido v4.0');

// Estados da aplicação
const AppStates = {
    INITIALIZING: 'initializing',
    AUTH_REQUIRED: 'auth_required',
    LOADING: 'loading',
    PLAYING: 'playing',
    ERROR: 'error'
};

let currentState = AppStates.INITIALIZING;

// Função principal de inicialização
function initializeApp() {
    console.log('🚀 Inicializando aplicação...');
    
    // Limpar timeouts e intervals anteriores
    clearTimers();
    
    // Verificar autenticação imediatamente
    if (!checkAuthentication()) {
        setState(AppStates.AUTH_REQUIRED);
        return;
    }
    
    // Se autenticado, iniciar o quiz
    setState(AppStates.LOADING);
    startQuizSession();
}

// Gerenciamento de estados da aplicação
function setState(state) {
    console.log(`🔄 Mudando estado: ${currentState} → ${state}`);
    currentState = state;
    
    // Esconder todos os overlays primeiro
    hideAllOverlays();
    hideGameElements();
    
    switch (state) {
        case AppStates.INITIALIZING:
            showLoadingOverlay('Inicializando sistema...');
            break;
            
        case AppStates.AUTH_REQUIRED:
            showAuthRequiredOverlay();
            break;
            
        case AppStates.LOADING:
            showLoadingOverlay('Carregando questões...');
            break;
            
        case AppStates.PLAYING:
            hideAllOverlays();
            showGameElements();
            break;
            
        case AppStates.ERROR:
            // Error overlay será mostrado pela função que chama setState
            break;
    }
}

// Verificação de autenticação melhorada
function checkAuthentication() {
    console.log('🔐 Verificando autenticação...');
    
    const token = getAuthToken();
    const isLoggedIn = getLoginStatus();
    
    console.log('🔐 Status de autenticação:', {
        hasToken: !!token,
        isLoggedIn: isLoggedIn,
        tokenLength: token ? token.length : 0
    });
    
    if (!token || !isLoggedIn) {
        console.warn('❌ Usuário não autenticado');
        return false;
    }
    
    console.log('✅ Usuário autenticado');
    return true;
}

// Função para obter token de autenticação
function getAuthToken() {
    return localStorage.getItem('token') || 
           (window.authData && window.authData.token) ||
           sessionStorage.getItem('token');
}

// Função para obter status de login
function getLoginStatus() {
    const localStorageStatus = localStorage.getItem('loggedIn') === 'true';
    const windowDataStatus = window.authData && window.authData.loggedIn;
    const sessionStorageStatus = sessionStorage.getItem('loggedIn') === 'true';
    
    return localStorageStatus || windowDataStatus || sessionStorageStatus;
}

// Mostrar overlay de autenticação requerida
function showAuthRequiredOverlay() {
    console.log('🔐 Mostrando overlay de autenticação requerida');
    
    const overlay = document.getElementById('auth-required-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        startCountdown();
    } else {
        console.error('❌ Elemento auth-required-overlay não encontrado');
        // 🔧 CORREÇÃO: Usa o modal melhorado em vez de alert
        if (typeof showModal === 'function') {
            showModal('Você precisa fazer login para jogar!', true, 3000);
        } else {
            alert('Você precisa fazer login para jogar!');
        }
        redirectToLogin();
    }
}

// 🔧 CORREÇÃO: Função melhorada para mostrar overlay de erro
function showErrorOverlay(message) {
    console.log('❌ Mostrando overlay de erro:', message);
    
    const overlay = document.getElementById('error-overlay');
    const messageElement = document.getElementById('error-message');
    
    if (overlay && messageElement) {
        messageElement.innerHTML = `<p>${message}</p>`;
        overlay.style.display = 'flex';
        setState(AppStates.ERROR);
    } else {
        console.error('❌ Elementos de erro não encontrados');
        // 🔧 CORREÇÃO: Usa o modal melhorado
        if (typeof showErrorModal === 'function') {
            showErrorModal(message);
        } else {
            alert(message);
        }
    }
}

// Controlar countdown de redirecionamento
function startCountdown() {
    let seconds = 5;
    const countdownElement = document.getElementById('countdown');
    
    if (!countdownElement) {
        console.warn('⚠️ Elemento countdown não encontrado');
        setTimeout(redirectToLogin, 5000);
        return;
    }
    
    countdownElement.textContent = seconds;
    
    countdownInterval = setInterval(() => {
        seconds--;
        countdownElement.textContent = seconds;
        
        if (seconds <= 0) {
            clearInterval(countdownInterval);
            redirectToLogin();
        }
    }, 1000);
}

// Redirecionar para login
function redirectToLogin() {
    console.log('🔄 Redirecionando para login...');
    clearTimers();
    
    // Adicionar efeito de transição
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
}

// Limpar timers
function clearTimers() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    if (redirectTimeout) {
        clearTimeout(redirectTimeout);
        redirectTimeout = null;
    }
    
    // 🔧 ADICIONADO: Limpa timer do modal também
    if (window.modalRedirectTimer) {
        clearTimeout(window.modalRedirectTimer);
        window.modalRedirectTimer = null;
    }
}

// Controlar overlays
function showLoadingOverlay(message = 'Carregando...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = overlay ? overlay.querySelector('p') : null;
    
    if (overlay) {
        if (loadingText) {
            loadingText.textContent = message;
        }
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
    }
}

function hideAllOverlays() {
    const overlays = [
        'loading-overlay',
        'auth-required-overlay', 
        'error-overlay'
    ];
    
    overlays.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // 🔧 ADICIONADO: Também esconde o modal se estiver aberto
    if (typeof closeModal === 'function') {
        closeModal();
    }
}

// Controlar elementos do jogo
function showGameElements() {
    const elements = [
        'score-display',
        'terminal-container', 
        'answers-container',
        'progress-container'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = element.id === 'score-display' ? 'flex' : 'block';
        }
    });
}

function hideGameElements() {
    const elements = [
        'score-display',
        'terminal-container',
        'answers-container', 
        'progress-container'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// Fazer requisição autenticada com melhor tratamento de erro
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    
    console.log('🌐 Fazendo requisição para:', url);
    
    if (!token) {
        throw new Error('Token de autenticação não encontrado');
    }
    
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
            console.error('❌ Erro de autenticação - token inválido');
            clearAuthData();
            setState(AppStates.AUTH_REQUIRED);
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro na resposta:', response.status, errorText);
            throw new Error(`Erro ${response.status}: ${errorText || 'Erro desconhecido'}`);
        }
        
        return response;
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Erro de conexão. Verifique sua internet.');
        }
        
        throw error;
    }
}

// Limpar dados de autenticação
function clearAuthData() {
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('userData');
    } catch (e) {
        console.warn('⚠️ Erro ao limpar localStorage');
    }
    
    try {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('loggedIn');
    } catch (e) {
        console.warn('⚠️ Erro ao limpar sessionStorage');
    }
    
    if (window.authData) {
        delete window.authData;
    }
}

// Iniciar sessão de quiz
async function startQuizSession() {
    console.log('🎮 Iniciando nova sessão de quiz...');
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/quiz-session/start`, {
            method: 'POST',
            body: JSON.stringify({
                numberOfQuestions: 1
            })
        });
        
        const sessionData = await response.json();
        console.log('✅ Sessão criada com sucesso:', sessionData);
        
        currentSessionId = sessionData.sessionId;
        currentSessionState = sessionData;
        
        // Exibir pergunta
        displayQuestion(sessionData);
        
        // Mudar para estado de jogo
        setState(AppStates.PLAYING);
        
    } catch (error) {
        console.error('❌ Erro ao iniciar quiz:', error);
        showErrorOverlay(`Erro ao iniciar o quiz: ${error.message}`);
    }
}

// Exibir pergunta atual
function displayQuestion(sessionState) {
    console.log('📝 Exibindo pergunta:', sessionState);
    
    if (!sessionState || !sessionState.currentQuestion) {
        console.error('❌ Pergunta não encontrada no estado da sessão');
        showErrorOverlay('Erro ao carregar pergunta');
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
    
    answers.forEach((answer, index) => {
        if (index < answerElements.length) {
            const textElement = document.getElementById(answerElements[index]);
            if (textElement) {
                textElement.textContent = answer.content;
                answerMapping[index] = answer.id;
                
                // Configurar o elemento box correspondente
                if (boxElements[index]) {
                    boxElements[index].dataset.answerId = answer.id;
                    boxElements[index].dataset.answerIndex = index;
                    
                    console.log(`✅ Resposta ${index + 1} configurada: ${answer.content}`);
                }
            }
        }
    });
    
    console.log('🗺️ Mapeamento de respostas:', answerMapping);
    
    // Atualizar informações na tela
    updateScoreDisplay(sessionState);
    updateProgressDisplay(sessionState);
    
    console.log('✅ Pergunta exibida com sucesso');
}

// Atualizar exibição da pontuação
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
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill && progressText) {
        const progress = ((sessionState.currentQuestionIndex + 1) / sessionState.totalQuestions) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.innerHTML = `${Math.round(progress)}% - Pergunta ${sessionState.currentQuestionIndex + 1} de ${sessionState.totalQuestions}`;
    }
}

// Enviar resposta
async function submitAnswer(answerId) {
    if (!currentSessionId) {
        console.error('❌ Sessão inválida');
        showErrorOverlay('Sessão inválida. Reinicie o quiz.');
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
        showErrorOverlay(`Erro ao processar resposta: ${error.message}`);
    } finally {
        // Reabilitar botões
        enableAnswerButtons();
    }
}

// Desabilitar/reabilitar botões de resposta
function disableAnswerButtons() {
    const boxes = document.querySelectorAll('.box');
    boxes.forEach(box => {
        box.style.pointerEvents = 'none';
        box.style.opacity = '0.6';
    });
}

function enableAnswerButtons() {
    const boxes = document.querySelectorAll('.box');
    boxes.forEach(box => {
        box.style.pointerEvents = 'auto';
        box.style.opacity = '1';
    });
}

// 🔧 CORREÇÃO: Lidar com o fim do quiz usando o modal melhorado
function handleQuizEnd(result) {
    console.log('🏁 Quiz finalizado:', result);
    
    let message = result.message || 'Quiz finalizado!';
    const score = result.finalScore || 0;
    const wasCompleted = result.wasCompleted;
    
    // 🔧 CORREÇÃO: Usa o modal melhorado em vez do alert
    if (typeof showGameEndModal === 'function') {
        if (wasCompleted) {
            showGameEndModal('🎉 Parabéns! Você completou todo o quiz!', score, true);
        } else {
            showGameEndModal('❌ Quiz finalizado por resposta incorreta.', score, false);
        }
    } else if (typeof showModal === 'function') {
        const fullMessage = `${message} Sua pontuação final foi: ${score}`;
        showModal(fullMessage, true, 5000);
    } else {
        // Fallback para alert se nenhum modal estiver disponível
        alert(`${message} Sua pontuação final foi: ${score}`);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
    
    // Resetar estado
    currentSessionId = null;
    currentSessionState = null;
    answerMapping = {};
    
    console.log('🏁 Estado do jogo resetado');
}

// Lidar com clique nas respostas
function handleAnswerClick(event) {
    const box = event.currentTarget;
    const answerId = box.dataset.answerId;
    
    if (!answerId) {
        console.error('❌ ID da resposta não encontrado');
        return;
    }
    
    if (currentState !== AppStates.PLAYING) {
        console.warn('⚠️ Clique ignorado - jogo não está ativo');
        return;
    }
    
    console.log('👆 Clique na resposta - ID:', answerId);
    
    // Feedback visual imediato
    box.classList.add('clicked');
    setTimeout(() => {
        box.classList.remove('clicked');
    }, 300);
    
    submitAnswer(answerId);
}

// Configurar event listeners
function setupEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    // Event listeners para respostas
    const answerElements = document.querySelectorAll('.box');
    answerElements.forEach((element, index) => {
        element.addEventListener('click', handleAnswerClick);
        console.log(`✅ Event listener configurado para box ${index + 1}`);
    });
    
    // Event listener para botão de retry
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            console.log('🔄 Tentando novamente...');
            initializeApp();
        });
    }
    
    // Event listeners para botões de autenticação
    const authButtons = document.querySelectorAll('.auth-required-overlay .auth-btn');
    authButtons.forEach(btn => {
        if (btn.href && btn.href.includes('login.html')) {
            btn.addEventListener('click', clearTimers);
        }
    });
    
    console.log('✅ Event listeners configurados');
}

// Inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 === PÁGINA DE QUESTÕES CARREGADA ===');
    console.log('🏠 DOM ready - iniciando configuração');
    
    // Configurar event listeners primeiro
    setupEventListeners();
    
    // 🔧 ADICIONADO: Aguarda o modal.js carregar completamente
    const waitForModal = () => {
        if (typeof showModal === 'function') {
            console.log('✅ Modal.js carregado, iniciando aplicação');
            setTimeout(() => {
                initializeApp();
            }, 500);
        } else {
            console.log('⏳ Aguardando modal.js carregar...');
            setTimeout(waitForModal, 100);
        }
    };
    
    waitForModal();
    
    console.log('📋 === CONFIGURAÇÃO INICIAL COMPLETA ===');
});

// Limpar recursos quando a página for descarregada
window.addEventListener('beforeunload', () => {
    clearTimers();
});

// Log de inicialização
console.log('📋 Questions.js carregado completamente');
console.log('🌐 API Base URL:', API_BASE_URL);

// Export para debugging (apenas no console)
if (typeof window !== 'undefined') {
    window.questionsDebug = {
        getCurrentState: () => currentState,
        forceState: (state) => setState(state),
        simulateAuth: () => {
            localStorage.setItem('token', 'debug-token');
            localStorage.setItem('loggedIn', 'true');
            initializeApp();
        },
        clearAuth: () => {
            clearAuthData();
            setState(AppStates.AUTH_REQUIRED);
        },
        testModal: () => {
            if (typeof showGameEndModal === 'function') {
                showGameEndModal('Teste do modal de fim de jogo', 85, true);
            }
        }
    };
}