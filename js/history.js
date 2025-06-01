/**
 * HISTORY PAGE CONTROLLER - T.I QUIZZMASTER
 * Sistema completo de histórico de partidas pessoais
 */

const API_BASE_URL = 'http://localhost:8080';

console.log('📜 History.js carregado - versão completa v1.0');

// Estado global da página
let currentHistoryData = [];
let currentUserStats = null;
let filteredHistoryData = [];
let currentPage = 1;
let itemsPerPage = 12;
let isLoading = false;
let currentFilters = {
    status: 'all',
    sortBy: 'date-desc'
};

// Verificar se usuário está logado na inicialização
function checkAuthentication() {
    const token = getAuthToken();
    
    if (!token) {
        console.log('❌ Usuário não logado');
        showNotLoggedState();
        return false;
    }
    
    console.log('✅ Usuário logado');
    return true;
}

// Função principal para carregar dados do histórico
async function loadHistoryData() {
    if (!checkAuthentication()) {
        return;
    }
    
    if (isLoading) {
        console.log('⏳ Carregamento já em andamento...');
        return;
    }
    
    isLoading = true;
    showLoadingState();
    
    try {
        console.log('📜 Iniciando carregamento do histórico...');
        
        // Carrega dados em paralelo
        const [historyData, userStats] = await Promise.allSettled([
            loadUserHistory(),
            loadUserStats()
        ]);
        
        // Processa resultados
        if (historyData.status === 'fulfilled' && historyData.value) {
            console.log('✅ Histórico carregado:', historyData.value.length, 'partidas');
            currentHistoryData = historyData.value;
            applyFilters();
        } else {
            console.error('❌ Erro ao carregar histórico:', historyData.reason);
            showErrorState('Erro ao carregar histórico de partidas');
        }
        
        if (userStats.status === 'fulfilled' && userStats.value) {
            console.log('✅ Estatísticas do usuário carregadas');
            currentUserStats = userStats.value;
            displayUserStats(userStats.value);
        } else {
            console.warn('⚠️ Não foi possível carregar estatísticas do usuário');
        }
        
    } catch (error) {
        console.error('❌ Erro geral no carregamento:', error);
        showErrorState('Erro inesperado ao carregar dados');
    } finally {
        isLoading = false;
    }
}

// Carrega histórico do usuário
async function loadUserHistory() {
    const token = getAuthToken();
    
    try {
        console.log('📊 Buscando histórico de partidas...');
        
        const response = await fetch(`${API_BASE_URL}/api/quiz-session/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const history = await response.json();
        console.log('📜 Histórico recebido:', history);
        
        // Ordena por data mais recente primeiro por padrão
        history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return history;
        
    } catch (error) {
        console.error('❌ Erro ao carregar histórico:', error);
        throw error;
    }
}

// Carrega estatísticas do usuário
async function loadUserStats() {
    const token = getAuthToken();
    
    try {
        console.log('👤 Buscando estatísticas do usuário...');
        
        const response = await fetch(`${API_BASE_URL}/api/scores/my-stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const stats = await response.json();
        console.log('📊 Estatísticas recebidas:', stats);
        
        return stats;
        
    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas:', error);
        throw error;
    }
}

// Exibe estatísticas do usuário
function displayUserStats(stats) {
    console.log('📊 Exibindo estatísticas do usuário...');
    
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
        }, 300);
    }
    
    console.log('✅ Estatísticas exibidas');
}

// Aplica filtros aos dados
function applyFilters() {
    console.log('🔍 === APLICANDO FILTROS ===');
    console.log('🔍 Filtros atuais:', currentFilters);
    console.log('📊 Dados originais:', currentHistoryData ? currentHistoryData.length : 'undefined', 'itens');
    
    if (!currentHistoryData) {
        console.warn('⚠️ currentHistoryData está undefined - não há dados para filtrar');
        showEmptyState();
        return;
    }
    
    if (!Array.isArray(currentHistoryData)) {
        console.error('❌ currentHistoryData não é um array:', typeof currentHistoryData);
        showEmptyState();
        return;
    }
    
    try {
        let filtered = [...currentHistoryData];
        console.log('🔄 Copiados', filtered.length, 'itens para filtro');
        
        // Filtro por status
        if (currentFilters.status !== 'all') {
            console.log('🔍 Aplicando filtro de status:', currentFilters.status);
            const originalLength = filtered.length;
            
            filtered = filtered.filter(session => {
                if (currentFilters.status === 'completed') {
                    return session.wasCompleted === true;
                } else if (currentFilters.status === 'interrupted') {
                    return session.wasCompleted === false;
                }
                return true;
            });
            
            console.log('📊 Filtro de status: de', originalLength, 'para', filtered.length, 'itens');
        }
        
        // Ordenação
        console.log('🔄 Aplicando ordenação:', currentFilters.sortBy);
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
        console.log('📋 Dados filtrados salvos em filteredHistoryData:', filteredHistoryData.length, 'itens');
        
        currentPage = 1; // Reset para primeira página
        console.log('📄 Página resetada para 1');
        
        console.log('🎨 Chamando renderHistoryGrid...');
        renderHistoryGrid();
        
        console.log('📄 Chamando updatePagination...');
        updatePagination();
        
        // Mostra controles se há dados
        if (filtered.length > 0) {
            console.log('🔧 Mostrando controles (filtros e ações rápidas)');
            showFilterControls();
            showQuickActions();
        } else {
            console.log('📋 Nenhum dado após filtros - controles permanecerão ocultos');
        }
        
        console.log('✅ Filtros aplicados com sucesso:', filtered.length, 'itens finais');
        
    } catch (error) {
        console.error('❌ Erro ao aplicar filtros:', error);
        console.error('   Stack:', error.stack);
        showErrorState('Erro ao processar dados do histórico');
    }
    
    console.log('🔍 === FILTROS FINALIZADOS ===');
}

// Renderiza o grid de histórico
function renderHistoryGrid() {
    console.log('🎨 Renderizando grid de histórico...');
    
    const grid = document.getElementById('history-grid');
    if (!grid) {
        console.error('❌ Elemento history-grid não encontrado');
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
    
    // Esconde estado vazio e mostra grid
    hideEmptyState();
    showHistoryGrid();
    
    // Renderiza cada card
    pageItems.forEach((session, index) => {
        const card = createHistoryCard(session, startIndex + index);
        grid.appendChild(card);
    });
    
    console.log('✅ Grid renderizado com', pageItems.length, 'itens');
}

// Cria um card de histórico
function createHistoryCard(session, index) {
    const card = document.createElement('div');
    card.className = `history-card ${session.wasCompleted ? 'completed' : 'interrupted'}`;
    
    // Marca como recente se for dos últimos 3 dias
    const sessionDate = new Date(session.createdAt);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    if (sessionDate > threeDaysAgo) {
        card.classList.add('recent');
    }
    
    // Marca como destaque se for o melhor score
    if (currentUserStats && session.finalScore === currentUserStats.bestScore) {
        card.classList.add('featured');
    }
    
    card.innerHTML = `
        <div class="card-header">
            <div class="session-id">Partida #${session.sessionId}</div>
            <div class="session-status ${session.wasCompleted ? 'completed' : 'interrupted'}">
                ${session.wasCompleted ? 'Completada' : 'Interrompida'}
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
    
    console.log('📄 Paginação atualizada:', currentPage, 'de', totalPages);
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
        if (element) element.style.display = 'none';
    });
}

function showHistoryGrid() {
    const historyGrid = document.getElementById('history-grid');
    if (historyGrid) historyGrid.style.display = 'grid';
}

function showFilterControls() {
    const filterSection = document.getElementById('filter-section');
    if (filterSection) filterSection.style.display = 'block';
}

function showQuickActions() {
    const quickActions = document.getElementById('quick-actions');
    if (quickActions) quickActions.style.display = 'flex';
}

// Exportar dados
function exportHistoryData() {
    if (!currentHistoryData || currentHistoryData.length === 0) {
        alert('Nenhum dado para exportar');
        return;
    }
    
    const csvContent = generateCSV();
    downloadCSV(csvContent, `historico_partidas_${new Date().toISOString().split('T')[0]}.csv`);
    
    console.log('📊 Dados exportados');
}

function generateCSV() {
    const headers = ['Data', 'Partida', 'Status', 'Pontuação', 'Questões', 'Performance', 'Duração'];
    const rows = currentHistoryData.map(session => [
        formatDate(session.createdAt),
        `#${session.sessionId}`,
        session.wasCompleted ? 'Completada' : 'Interrompida',
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

// Utilitários
function getAuthToken() {
    return localStorage.getItem('token') || 
           (window.authData && window.authData.token) ||
           sessionStorage.getItem('token');
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
    console.log('📜 === PÁGINA DE HISTÓRICO CARREGADA ===');
    console.log('🏠 DOM ready - iniciando configuração');
    
    // Verifica se estamos na página correta
    if (!window.location.pathname.includes('history')) {
        console.warn('⚠️ Não parece ser a página de histórico');
    }
    
    // Carrega dados iniciais
    console.log('🔄 Iniciando carregamento de dados...');
    loadHistoryData();
    
    // Event listeners para filtros
    const filterStatus = document.getElementById('filter-status');
    const sortBy = document.getElementById('sort-by');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    if (filterStatus) {
        console.log('✅ Event listener configurado para filter-status');
        filterStatus.addEventListener('change', (e) => {
            currentFilters.status = e.target.value;
        });
    } else {
        console.warn('⚠️ Elemento filter-status não encontrado');
    }
    
    if (sortBy) {
        console.log('✅ Event listener configurado para sort-by');
        sortBy.addEventListener('change', (e) => {
            currentFilters.sortBy = e.target.value;
        });
    } else {
        console.warn('⚠️ Elemento sort-by não encontrado');
    }
    
    if (applyFiltersBtn) {
        console.log('✅ Event listener configurado para apply-filters');
        applyFiltersBtn.addEventListener('click', () => {
            applyFilters();
        });
    } else {
        console.warn('⚠️ Elemento apply-filters não encontrado');
    }
    
    if (clearFiltersBtn) {
        console.log('✅ Event listener configurado para clear-filters');
        clearFiltersBtn.addEventListener('click', () => {
            currentFilters = { status: 'all', sortBy: 'date-desc' };
            if (filterStatus) filterStatus.value = 'all';
            if (sortBy) sortBy.value = 'date-desc';
            applyFilters();
        });
    } else {
        console.warn('⚠️ Elemento clear-filters não encontrado');
    }
    
    // Event listeners para paginação
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    
    if (prevPage) {
        console.log('✅ Event listener configurado para prev-page');
        prevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderHistoryGrid();
                updatePagination();
            }
        });
    } else {
        console.warn('⚠️ Elemento prev-page não encontrado');
    }
    
    if (nextPage) {
        console.log('✅ Event listener configurado para next-page');
        nextPage.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredHistoryData.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderHistoryGrid();
                updatePagination();
            }
        });
    } else {
        console.warn('⚠️ Elemento next-page não encontrado');
    }
    
    // Event listener para retry
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        console.log('✅ Event listener configurado para retry-btn');
        retryBtn.addEventListener('click', () => {
            loadHistoryData();
        });
    } else {
        console.warn('⚠️ Elemento retry-btn não encontrado');
    }
    
    // Event listener para export
    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
        console.log('✅ Event listener configurado para export-data');
        exportBtn.addEventListener('click', exportHistoryData);
    } else {
        console.warn('⚠️ Elemento export-data não encontrado');
    }
    
    // Auto aplicar filtros quando alterar select
    [filterStatus, sortBy].forEach(element => {
        if (element) {
            element.addEventListener('change', () => {
                setTimeout(() => applyFilters(), 100);
            });
        }
    });
    
    console.log('🎯 Todos os event listeners configurados');
    
    // Adiciona função de teste global para debug
    window.testHistoryWithMockData = function() {
        console.log('🎭 Testando histórico com dados mock...');
        
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
        
        console.log('📊 Dados mock definidos, aplicando filtros...');
        applyFilters();
        displayUserStats(currentUserStats);
    };
    
    console.log('💡 Função de teste disponível: testHistoryWithMockData()');
    console.log('📜 === CONFIGURAÇÃO INICIAL COMPLETA ===');
});

// Log de inicialização
console.log('📜 History.js carregado completamente');
console.log('🌐 API Base URL:', API_BASE_URL);