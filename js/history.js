/**
 * HISTORY PAGE CONTROLLER - T.I QUIZZMASTER
 * Sistema completo de histórico de partidas pessoais
 */

CONFIG.log('📜 History.js carregado - versão com config centralizado v2.0', 'info');

// Estado global da página
let currentHistoryData = [];
let currentUserStats = null;
let filteredHistoryData = [];
let currentPage = 1;
let itemsPerPage = CONFIG.HISTORY_PAGE_SIZE;
let isLoading = false;
let currentFilters = {
    status: 'all',
    sortBy: 'date-desc'
};

// Verificar se usuário está logado na inicialização
function checkAuthentication() {
    const token = getAuthToken();
    
    if (!token) {
        CONFIG.log('Usuário não logado', 'warn');
        showNotLoggedState();
        return false;
    }
    
    CONFIG.log('Usuário logado', 'info');
    return true;
}

// Função principal para carregar dados do histórico
async function loadHistoryData() {
    if (!checkAuthentication()) {
        return;
    }
    
    if (isLoading) {
        CONFIG.log('Carregamento já em andamento...', 'debug');
        return;
    }
    
    isLoading = true;
    showLoadingState();
    
    try {
        CONFIG.log('Iniciando carregamento do histórico...', 'info');
        
        // Carrega dados em paralelo
        const [historyData, userStats] = await Promise.allSettled([
            loadUserHistory(),
            loadUserStats()
        ]);
        
        // Processa resultados
        if (historyData.status === 'fulfilled' && historyData.value) {
            CONFIG.log('Histórico carregado', 'info', `${historyData.value.length} partidas`);
            currentHistoryData = historyData.value;
            
            // Esconde loading antes de aplicar filtros
            hideLoadingState();
            applyFilters();
        } else {
            CONFIG.log('Erro ao carregar histórico', 'error', historyData.reason);
            showErrorState('Erro ao carregar histórico de partidas');
        }
        
        if (userStats.status === 'fulfilled' && userStats.value) {
            CONFIG.log('Estatísticas do usuário carregadas', 'info');
            currentUserStats = userStats.value;
            displayUserStats(userStats.value);
        } else {
            CONFIG.log('Não foi possível carregar estatísticas do usuário', 'warn');
        }
        
    } catch (error) {
        CONFIG.log('Erro geral no carregamento', 'error', error);
        showErrorState('Erro inesperado ao carregar dados');
    } finally {
        isLoading = false;
        hideLoadingState();
    }
}

// Carrega histórico do usuário
async function loadUserHistory() {
    const token = getAuthToken();
    
    try {
        CONFIG.log('Buscando histórico de partidas...', 'debug');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
        
        const response = await fetch(CONFIG.getEndpointURL('GET_HISTORY'), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const history = await response.json();
        CONFIG.log('Histórico recebido', 'debug', history);
        
        // Ordena por data mais recente primeiro por padrão
        history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return history;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Timeout ao carregar histórico');
        }
        CONFIG.log('Erro ao carregar histórico', 'error', error);
        throw error;
    }
}

// Carrega estatísticas do usuário
async function loadUserStats() {
    const token = getAuthToken();
    
    try {
        CONFIG.log('Buscando estatísticas do usuário...', 'debug');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
        
        const response = await fetch(CONFIG.getEndpointURL('USER_STATS'), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const stats = await response.json();
        CONFIG.log('Estatísticas recebidas', 'debug', stats);
        
        return stats;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Timeout ao carregar estatísticas');
        }
        CONFIG.log('Erro ao carregar estatísticas', 'error', error);
        throw error;
    }
}

// Determina se uma partida foi completada
function isSessionCompleted(session) {
    CONFIG.log('Verificando status da sessão', 'debug', `ID: ${session.sessionId}`);
    
    // Múltiplas verificações para determinar se foi completada
    const checks = {
        // Verificação principal
        wasCompleted: session.wasCompleted === true,
        
        // Verificações alternativas (caso o campo tenha nome diferente)
        completed: session.completed === true,
        isCompleted: session.isCompleted === true,
        status: session.status === 'completed' || session.status === 'COMPLETED',
        
        // Verificação por finalização
        hasFinishTime: !!session.finishedAt,
        
        // Verificação por pontuação (se tem pontuação final, provavelmente foi completada)
        hasScore: (session.finalScore || 0) > 0,
        
        // Verificação por duração razoável (se durou mais que 30 segundos, provavelmente foi completada)
        reasonableDuration: session.finishedAt && session.createdAt && 
                           (new Date(session.finishedAt) - new Date(session.createdAt)) > 30000
    };
    
    CONFIG.log('Verificações de status', 'debug', checks);
    
    // Se qualquer verificação principal for verdadeira, considera completada
    const isCompleted = checks.wasCompleted || 
                       checks.completed || 
                       checks.isCompleted || 
                       checks.status;
    
    // Se não há indicação clara, usa heurísticas
    if (!isCompleted) {
        const heuristicCompleted = checks.hasFinishTime && 
                                  (checks.hasScore || checks.reasonableDuration);
        
        if (heuristicCompleted) {
            CONFIG.log('Status determinado por heurística', 'warn', `sessão ${session.sessionId}`);
            return true;
        }
    }
    
    CONFIG.log(`Sessão ${session.sessionId} determinada como`, 'debug', isCompleted ? 'COMPLETADA' : 'INTERROMPIDA');
    return isCompleted;
}

// Exibe estatísticas do usuário
function displayUserStats(stats) {
    CONFIG.log('Exibindo estatísticas do usuário...', 'debug');
    
    // Atualiza welcome message
    const welcomeElement = document.getElementById('user-welcome');
    if (welcomeElement && stats.username) {
        welcomeElement.textContent = `Olá, ${stats.username}! Suas conquistas e estatísticas pessoais`;
    }
    
    // Atualiza valores das estatísticas
    const statsMapping = {
        'user-best-score': stats.bestScore || 0,
        'user-total-games': stats.totalGames || 0,
        'user-average-score': stats.averageScore ? stats.averageScore.toFixed(1) : '0.0',
        'user-ranking-position': stats.rankingPosition ? `${stats.rankingPosition}º` : 'N/A',
        'user-win-rate': stats.winRate ? `${stats.winRate.toFixed(1)}%` : '0.0%',
        'user-total-points': stats.totalPoints || 0
    };
    
    Object.entries(statsMapping).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            animateNumber(element, value);
        }
    });
    
    // Mostra seção de estatísticas
    const statsSection = document.getElementById('user-stats-summary');
    if (statsSection) {
        statsSection.style.display = 'block';
        
        // Anima entrada
        setTimeout(() => {
            statsSection.classList.add('fade-in');
        }, CONFIG.ANIMATION_DURATION);
    }
    
    CONFIG.log('Estatísticas exibidas', 'debug');
}

// Aplica filtros com status corrigido
function applyFilters() {
    CONFIG.log('=== APLICANDO FILTROS ===', 'debug');
    CONFIG.log('Filtros atuais', 'debug', currentFilters);
    CONFIG.log('Dados originais', 'debug', `${currentHistoryData ? currentHistoryData.length : 'undefined'} itens`);
    
    if (!currentHistoryData) {
        CONFIG.log('currentHistoryData está undefined - não há dados para filtrar', 'warn');
        showEmptyState();
        return;
    }
    
    if (!Array.isArray(currentHistoryData)) {
        CONFIG.log('currentHistoryData não é um array', 'error', typeof currentHistoryData);
        showEmptyState();
        return;
    }
    
    try {
        let filtered = [...currentHistoryData];
        CONFIG.log('Copiados para filtro', 'debug', `${filtered.length} itens`);
        
        // Debug dos dados recebidos (apenas em modo debug)
        if (CONFIG.DEBUG) {
            CONFIG.log('Amostra dos dados recebidos:', 'debug');
            filtered.slice(0, 3).forEach((session, i) => {
                CONFIG.log(`Sessão ${i + 1}`, 'debug', {
                    id: session.sessionId,
                    wasCompleted: session.wasCompleted,
                    completed: session.completed,
                    status: session.status,
                    finalScore: session.finalScore,
                    finishedAt: session.finishedAt,
                    createdAt: session.createdAt
                });
            });
        }
        
        // Filtro por status com lógica corrigida
        if (currentFilters.status !== 'all') {
            CONFIG.log('Aplicando filtro de status', 'debug', currentFilters.status);
            const originalLength = filtered.length;
            
            filtered = filtered.filter(session => {
                const isCompleted = isSessionCompleted(session);
                
                if (currentFilters.status === 'completed') {
                    return isCompleted;
                } else if (currentFilters.status === 'interrupted') {
                    return !isCompleted;
                }
                return true;
            });
            
            CONFIG.log('Filtro de status aplicado', 'debug', `de ${originalLength} para ${filtered.length} itens`);
        }
        
        // Ordenação
        CONFIG.log('Aplicando ordenação', 'debug', currentFilters.sortBy);
        filtered.sort((a, b) => {
            switch (currentFilters.sortBy) {
                case 'date-desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'date-asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'score-desc':
                    return (b.finalScore || 0) - (a.finalScore || 0);
                case 'score-asc':
                    return (a.finalScore || 0) - (b.finalScore || 0);
                default:
                    return 0;
            }
        });
        
        filteredHistoryData = filtered;
        CONFIG.log('Dados filtrados salvos', 'debug', `${filteredHistoryData.length} itens`);
        
        currentPage = 1;
        CONFIG.log('Página resetada para 1', 'debug');
        
        renderHistoryGrid();
        updatePagination();
        
        // Mostra controles se há dados
        if (filtered.length > 0) {
            CONFIG.log('Mostrando controles', 'debug');
            showFilterControls();
            showQuickActions();
        } else {
            CONFIG.log('Nenhum dado após filtros - controles permanecerão ocultos', 'debug');
        }
        
        CONFIG.log('Filtros aplicados com sucesso', 'info', `${filtered.length} itens finais`);
        
    } catch (error) {
        CONFIG.log('Erro ao aplicar filtros', 'error', error);
        showErrorState('Erro ao processar dados do histórico');
    }
    
    CONFIG.log('=== FILTROS FINALIZADOS ===', 'debug');
}

// Renderiza o grid de histórico
function renderHistoryGrid() {
    CONFIG.log('Renderizando grid de histórico...', 'debug');
    
    const grid = document.getElementById('history-grid');
    if (!grid) {
        CONFIG.log('Elemento history-grid não encontrado', 'error');
        return;
    }
    
    // Calcula itens para a página atual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredHistoryData.slice(startIndex, endIndex);
    
    // Limpa grid
    grid.innerHTML = '';
    
    if (pageItems.length === 0) {
        showEmptyState();
        return;
    }
    
    // Esconde todos os estados (incluindo loading) antes de mostrar o grid
    hideAllStates();
    showHistoryGrid();
    
    // Renderiza cada card
    pageItems.forEach((session, index) => {
        const card = createHistoryCard(session, startIndex + index);
        grid.appendChild(card);
    });
    
    CONFIG.log('Grid renderizado', 'info', `${pageItems.length} itens`);
}

function createHistoryCard(session, index) {
    CONFIG.log('Criando card para sessão', 'debug', session.sessionId);
    
    // Usa a função corrigida para determinar status
    const isCompleted = isSessionCompleted(session);
    const statusClass = isCompleted ? 'completed' : 'interrupted';
    const statusText = isCompleted ? 'Completada' : 'Interrompida';
    
    const card = document.createElement('div');
    card.className = `history-card ${statusClass}`;
    
    // Verificação mais rigorosa para "recente"
    const sessionDate = new Date(session.createdAt);
    const now = new Date();
    const hoursDiff = (now - sessionDate) / (1000 * 60 * 60); // diferença em horas
    
    // Considera recente apenas se for das últimas 24 horas E completada
    if (hoursDiff <= 24 && isCompleted) {
        card.classList.add('recent');
        CONFIG.log(`Sessão ${session.sessionId} marcada como recente`, 'debug', `${hoursDiff.toFixed(1)}h atrás`);
    }
    
    // Marca como destaque se for o melhor score
    if (currentUserStats && session.finalScore === currentUserStats.bestScore && isCompleted) {
        card.classList.add('featured');
    }
    
    card.innerHTML = `
        <div class="card-header">
            <div class="session-id">Partida #${session.sessionId}</div>
            <div class="session-status ${statusClass}">
                ${statusText}
            </div>
        </div>
        
        <div class="card-body">
            <div class="score-display">
                <div class="final-score">${session.finalScore || 0}</div>
                <div class="score-details">
                    de ${(session.totalQuestions || 0) * 10} pontos possíveis
                </div>
            </div>
            
            <div class="card-details">
                <div class="detail-item">
                    <div class="detail-label">Questões</div>
                    <div class="detail-value">${session.totalQuestions || 0}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Acertos</div>
                    <div class="detail-value">${Math.floor((session.finalScore || 0) / 10)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Duração</div>
                    <div class="detail-value">${calculateDuration(session)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Performance</div>
                    <div class="detail-value">${calculatePerformance(session)}%</div>
                </div>
            </div>
        </div>
        
        <div class="card-footer">
            <div class="game-date">${formatDate(session.createdAt)}</div>
        </div>
    `;
    
    return card;
}

// Calcula duração da partida
function calculateDuration(session) {
    if (!session.finishedAt || !session.createdAt) {
        return 'N/A';
    }
    
    const start = new Date(session.createdAt);
    const end = new Date(session.finishedAt);
    const diff = Math.floor((end - start) / 1000); // em segundos
    
    if (diff < 60) {
        return `${diff}s`;
    } else if (diff < 3600) {
        return `${Math.floor(diff / 60)}m ${diff % 60}s`;
    } else {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
}

// Calcula performance percentual
function calculatePerformance(session) {
    if (!session.totalQuestions || session.totalQuestions === 0) {
        return 0;
    }
    
    const maxScore = session.totalQuestions * 10;
    const percentage = ((session.finalScore || 0) / maxScore) * 100;
    return Math.round(percentage);
}

// Atualiza paginação
function updatePagination() {
    const totalPages = Math.ceil(filteredHistoryData.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const currentPageEl = document.getElementById('page-current');
    const totalPagesEl = document.getElementById('page-total');
    
    if (totalPages <= 1) {
        if (pagination) pagination.style.display = 'none';
        return;
    }
    
    if (pagination) pagination.style.display = 'flex';
    
    // Atualiza botões
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
    
    // Atualiza info da página
    if (currentPageEl) currentPageEl.textContent = currentPage;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;
    
    CONFIG.log('Paginação atualizada', 'debug', `${currentPage} de ${totalPages}`);
}

// Anima números
function animateNumber(element, targetValue) {
    if (typeof targetValue === 'string') {
        element.textContent = targetValue;
        return;
    }
    
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = Date.now();
    
    function updateNumber() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (targetValue - startValue) * easedProgress);
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    updateNumber();
}

// Estados da interface
function showLoadingState() {
    hideAllStates();
    const loadingState = document.getElementById('loading-state');
    if (loadingState) loadingState.style.display = 'block';
}

function hideLoadingState() {
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
        loadingState.style.display = 'none';
        CONFIG.log('Loading state escondido', 'debug');
    }
}

function showEmptyState() {
    hideAllStates();
    const emptyState = document.getElementById('empty-state');
    if (emptyState) emptyState.style.display = 'block';
}

function hideEmptyState() {
    const emptyState = document.getElementById('empty-state');
    if (emptyState) emptyState.style.display = 'none';
}

function showErrorState(message) {
    hideAllStates();
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    
    if (errorState) errorState.style.display = 'block';
    if (errorMessage) errorMessage.textContent = message;
}

function showNotLoggedState() {
    hideAllStates();
    const notLoggedState = document.getElementById('not-logged-state');
    if (notLoggedState) notLoggedState.style.display = 'block';
}

function hideAllStates() {
    const states = ['loading-state', 'empty-state', 'error-state', 'not-logged-state', 'history-grid'];
    states.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}

function showHistoryGrid() {
    const historyGrid = document.getElementById('history-grid');
    if (historyGrid) {
        historyGrid.style.display = 'grid';
        CONFIG.log('Grid de histórico exibido', 'debug');
    }
}

function showFilterControls() {
    const filterSection = document.getElementById('filter-section');
    if (filterSection) filterSection.style.display = 'block';
}

function showQuickActions() {
    const quickActions = document.getElementById('quick-actions');
    if (quickActions) quickActions.style.display = 'flex';
}

// Debug de dados do histórico
function debugHistoryData() {
    CONFIG.log('=== DEBUG DOS DADOS DO HISTÓRICO ===', 'debug');
    
    if (!currentHistoryData || !Array.isArray(currentHistoryData)) {
        CONFIG.log('Nenhum dado de histórico disponível', 'error');
        return;
    }
    
    CONFIG.log('Total de sessões', 'info', currentHistoryData.length);
    
    if (CONFIG.DEBUG) {
        currentHistoryData.forEach((session, index) => {
            const isCompleted = isSessionCompleted(session);
            const duration = calculateDuration(session);
            
            CONFIG.log(`Sessão ${index + 1} (ID: ${session.sessionId})`, 'debug', {
                status: isCompleted ? 'COMPLETADA' : 'INTERROMPIDA',
                campos: {
                    wasCompleted: session.wasCompleted,
                    completed: session.completed,
                    status: session.status
                },
                pontuacao: session.finalScore || 0,
                duracao: duration,
                criada: formatDate(session.createdAt),
                finalizada: session.finishedAt ? formatDate(session.finishedAt) : 'N/A'
            });
        });
    }
    
    const completedCount = currentHistoryData.filter(s => isSessionCompleted(s)).length;
    const interruptedCount = currentHistoryData.length - completedCount;
    
    CONFIG.log('Resumo do histórico', 'info', {
        completadas: completedCount,
        interrompidas: interruptedCount
    });
    
    CONFIG.log('=== FIM DO DEBUG ===', 'debug');
}

// Exportar dados
function exportHistoryData() {
    if (!currentHistoryData || currentHistoryData.length === 0) {
        alert('Nenhum dado para exportar');
        return;
    }
    
    const csvContent = generateCSV();
    downloadCSV(csvContent, `historico_partidas_${new Date().toISOString().split('T')[0]}.csv`);
    
    CONFIG.log('Dados exportados', 'info');
}

function generateCSV() {
    const headers = ['Data', 'Partida', 'Status', 'Pontuação', 'Questões', 'Performance', 'Duração'];
    const rows = currentHistoryData.map(session => [
        formatDate(session.createdAt),
        `#${session.sessionId}`,
        isSessionCompleted(session) ? 'Completada' : 'Interrompida',
        session.finalScore || 0,
        session.totalQuestions || 0,
        `${calculatePerformance(session)}%`,
        calculateDuration(session)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Auto-refresh de dados (se habilitado)
function setupAutoRefresh() {
    if (CONFIG.AUTO_REFRESH_INTERVAL > 0) {
        setInterval(() => {
            if (!isLoading && document.visibilityState === 'visible') {
                CONFIG.log('Auto-refresh de dados do histórico', 'debug');
                loadHistoryData();
            }
        }, CONFIG.AUTO_REFRESH_INTERVAL);
        
        CONFIG.log('Auto-refresh configurado', 'debug', `${CONFIG.AUTO_REFRESH_INTERVAL / 1000}s`);
    }
}

// Utilitários
function getAuthToken() {
    // Tenta localStorage primeiro
    try {
        if (typeof Storage !== "undefined") {
            const token = localStorage.getItem(CONFIG.TOKEN_STORAGE_KEY);
            if (token) return token;
        }
    } catch (e) {
        CONFIG.log('Erro ao acessar localStorage', 'warn', e);
    }
    
    // Fallback para memory storage
    return window.authData ? window.authData.token : null;
}

function formatDate(dateString) {
    if (!dateString) return 'Data não disponível';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Data inválida';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    CONFIG.log('=== PÁGINA DE HISTÓRICO CARREGADA ===', 'info');
    CONFIG.log('DOM ready - iniciando configuração', 'debug');
    
    // Verifica se estamos na página correta
    if (!window.location.pathname.includes('history')) {
        CONFIG.log('Não parece ser a página de histórico', 'warn');
    }
    
    // Configurações de página específicas
    document.body.classList.add('history-page');
    
    // Carrega dados iniciais
    CONFIG.log('Iniciando carregamento de dados...', 'debug');
    loadHistoryData();
    
    // Configura auto-refresh se habilitado
    setupAutoRefresh();
    
    // Event listeners para filtros
    const filterStatus = document.getElementById('filter-status');
    const sortBy = document.getElementById('sort-by');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    if (filterStatus) {
        CONFIG.log('Event listener configurado para filter-status', 'debug');
        filterStatus.addEventListener('change', (e) => {
            currentFilters.status = e.target.value;
        });
    } else {
        CONFIG.log('Elemento filter-status não encontrado', 'warn');
    }
    
    if (sortBy) {
        CONFIG.log('Event listener configurado para sort-by', 'debug');
        sortBy.addEventListener('change', (e) => {
            currentFilters.sortBy = e.target.value;
        });
    } else {
        CONFIG.log('Elemento sort-by não encontrado', 'warn');
    }
    
    if (applyFiltersBtn) {
        CONFIG.log('Event listener configurado para apply-filters', 'debug');
        applyFiltersBtn.addEventListener('click', () => {
            applyFilters();
        });
    } else {
        CONFIG.log('Elemento apply-filters não encontrado', 'warn');
    }
    
    if (clearFiltersBtn) {
        CONFIG.log('Event listener configurado para clear-filters', 'debug');
        clearFiltersBtn.addEventListener('click', () => {
            currentFilters = { status: 'all', sortBy: 'date-desc' };
            if (filterStatus) filterStatus.value = 'all';
            if (sortBy) sortBy.value = 'date-desc';
            applyFilters();
        });
    } else {
        CONFIG.log('Elemento clear-filters não encontrado', 'warn');
    }
    
    // Event listeners para paginação
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    
    if (prevPage) {
        CONFIG.log('Event listener configurado para prev-page', 'debug');
        prevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderHistoryGrid();
                updatePagination();
            }
        });
    } else {
        CONFIG.log('Elemento prev-page não encontrado', 'warn');
    }
    
    if (nextPage) {
        CONFIG.log('Event listener configurado para next-page', 'debug');
        nextPage.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredHistoryData.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderHistoryGrid();
                updatePagination();
            }
        });
    } else {
        CONFIG.log('Elemento next-page não encontrado', 'warn');
    }
    
    // Event listener para retry
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        CONFIG.log('Event listener configurado para retry-btn', 'debug');
        retryBtn.addEventListener('click', () => {
            loadHistoryData();
        });
    } else {
        CONFIG.log('Elemento retry-btn não encontrado', 'warn');
    }
    
    // Event listener para export
    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
        CONFIG.log('Event listener configurado para export-data', 'debug');
        exportBtn.addEventListener('click', exportHistoryData);
    } else {
        CONFIG.log('Elemento export-data não encontrado', 'warn');
    }
    
    // Auto aplicar filtros quando alterar select
    [filterStatus, sortBy].forEach(element => {
        if (element) {
            element.addEventListener('change', () => {
                setTimeout(() => applyFilters(), 100);
            });
        }
    });
    
    CONFIG.log('Todos os event listeners configurados', 'debug');
    
    // Adiciona função de teste global para debug (apenas em modo debug)
    if (CONFIG.DEBUG) {
        window.testHistoryWithMockData = function() {
            CONFIG.log('Testando histórico com dados mock...', 'debug');
            
            currentHistoryData = [
                {
                    sessionId: 1,
                    finalScore: 80,
                    totalQuestions: 10,
                    wasCompleted: true,
                    createdAt: new Date().toISOString(),
                    finishedAt: new Date().toISOString()
                },
                {
                    sessionId: 2,
                    finalScore: 40,
                    totalQuestions: 10,
                    wasCompleted: false,
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    finishedAt: new Date(Date.now() - 86400000).toISOString()
                }
            ];
            
            currentUserStats = {
                username: 'TestUser',
                totalGames: 2,
                bestScore: 80,
                averageScore: 60,
                rankingPosition: 3
            };
            
            CONFIG.log('Dados mock definidos, aplicando filtros...', 'debug');
            applyFilters();
            displayUserStats(currentUserStats);
        };
        
        // Adiciona função de debug global
        window.debugHistory = debugHistoryData;
        
        CONFIG.log('Funções de teste disponíveis:', 'info');
        CONFIG.log('- testHistoryWithMockData() - testa com dados mock', 'info');
        CONFIG.log('- debugHistory() - mostra análise completa dos dados', 'info');
    }
    
    CONFIG.log('=== CONFIGURAÇÃO INICIAL COMPLETA ===', 'info');
});

// Cleanup quando a página é fechada
window.addEventListener('beforeunload', () => {
    CONFIG.log('Página de histórico sendo fechada', 'debug');
});

// Log de inicialização
CONFIG.log('History.js carregado completamente', 'info');
CONFIG.log('API Base URL', 'info', CONFIG.API_BASE_URL);
CONFIG.log('Configurações de histórico', 'debug', {
    itemsPerPage: CONFIG.HISTORY_PAGE_SIZE,
    autoRefresh: CONFIG.AUTO_REFRESH_INTERVAL,
    timeout: CONFIG.API_TIMEOUT
});

if (CONFIG.DEBUG) {
    CONFIG.log('Debug functions available: testHistoryWithMockData(), debugHistory()', 'info');
}