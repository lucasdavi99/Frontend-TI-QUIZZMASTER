const API_BASE_URL = 'http://localhost:8080'; // Mude para sua URL de produção
let currentSessionId = null;
let currentSessionState = null;
let answerMapping = {}; // Mapear posição da resposta para ID

// Função para verificar se o usuário está logado
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
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
    
    const response = await fetch(url, mergedOptions);
    
    if (response.status === 403 || response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedIn');
        showModal('Sessão expirada. Faça login novamente.');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        throw new Error('Unauthorized');
    }
    
    return response;
}

// Iniciar nova sessão de quiz
async function startQuizSession() {
    if (!checkAuth()) return;
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/quiz-session/start`, {
            method: 'POST',
            body: JSON.stringify({
                numberOfQuestions: 10 // Você pode tornar isso configurável
            })
        });
        
        if (!response.ok) {
            throw new Error('Erro ao iniciar sessão');
        }
        
        const sessionData = await response.json();
        currentSessionId = sessionData.sessionId;
        currentSessionState = sessionData;
        
        console.log('Sessão iniciada:', sessionData);
        displayQuestion(sessionData);
        
    } catch (error) {
        console.error('Erro ao iniciar quiz:', error);
        showModal('Erro ao iniciar o quiz. Tente novamente.');
    }
}

// Exibir pergunta atual
function displayQuestion(sessionState) {
    if (!sessionState.currentQuestion) {
        showModal('Erro ao carregar pergunta');
        return;
    }
    
    const question = sessionState.currentQuestion;
    document.getElementById('Questao').textContent = question.content;
    
    // Debug
    console.log('Pergunta atual:', question);
    console.log('Respostas:', question.answers);
    
    // NÃO embaralhe as respostas, use a ordem que vem do servidor
    const answers = question.answers;
    
    // Limpar mapeamento anterior
    answerMapping = {};
    
    const answerElements = ['answer_a', 'answer_b', 'answer_c', 'answer_d'];
    const boxElements = document.querySelectorAll('.box');
    
    answers.forEach((answer, index) => {
        if (index < answerElements.length) {
            const element = document.getElementById(answerElements[index]);
            if (element) {
                element.textContent = answer.content;
                // Mapear índice para ID da resposta
                answerMapping[index] = answer.id;
                
                // Armazenar o ID no elemento box correspondente
                if (boxElements[index]) {
                    boxElements[index].dataset.answerId = answer.id;
                    boxElements[index].dataset.answerIndex = index;
                }
            }
        }
    });
    
    // Debug do mapeamento
    console.log('Mapeamento de respostas:', answerMapping);
    
    // Atualizar informações na tela
    updateScoreDisplay(sessionState);
}

// Atualizar exibição da pontuação e progresso
function updateScoreDisplay(sessionState) {
    // Adicionar pontuação se existir elemento
    const scoreElement = document.getElementById('current-score');
    if (scoreElement) {
        scoreElement.textContent = sessionState.score || 0;
    }
    
    // Adicionar contador de perguntas se existir
    const questionNumberElement = document.getElementById('current-question-number');
    if (questionNumberElement) {
        questionNumberElement.textContent = (sessionState.currentQuestionIndex + 1);
    }
    
    const totalQuestionsElement = document.getElementById('total-questions');
    if (totalQuestionsElement) {
        totalQuestionsElement.textContent = sessionState.totalQuestions;
    }
}

// Função para embaralhar array (mantida mas não usada para respostas)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Enviar resposta
async function submitAnswer(answerId) {
    if (!currentSessionId || !checkAuth()) return;
    
    console.log('Enviando resposta com ID:', answerId);
    
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
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error('Erro ao enviar resposta');
        }
        
        const result = await response.json();
        console.log('Resposta do servidor:', result);
        
        // Se retornou um resultado final (fim do jogo)
        if (result.finalScore !== undefined) {
            handleQuizEnd(result);
        } else {
            // Continuar com a próxima pergunta
            currentSessionState = result;
            displayQuestion(result);
        }
        
    } catch (error) {
        console.error('Erro ao enviar resposta:', error);
        showModal('Erro ao processar resposta. Tente novamente.');
    }
}

// Lidar com o fim do quiz
function handleQuizEnd(result) {
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
        console.error('ID da resposta não encontrado');
        return;
    }
    
    console.log('Clique na resposta - ID:', answerId);
    submitAnswer(answerId);
}

// Configurar event listeners
document.addEventListener("DOMContentLoaded", function () {
    // Iniciar nova sessão ao carregar a página
    startQuizSession();
    
    // Configurar cliques nas respostas
    const answerElements = document.querySelectorAll('.box');
    answerElements.forEach((element) => {
        element.addEventListener('click', handleAnswerClick);
    });
});

// Função showModal (se não existir no seu modal.js)
if (typeof showModal === 'undefined') {
    function showModal(message) {
        const modalText = document.getElementById('modalText');
        const modal = document.getElementById('myModal');
        
        if (modalText && modal) {
            modalText.textContent = message;
            modal.style.display = 'block';
        } else {
            alert(message); // Fallback
        }
    }
}