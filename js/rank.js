/**
 * RANKING PAGE CONTROLLER - VERSÃO CORRIGIDA E MELHORADA
 * Sistema robusto de ranking com tratamento adequado de autenticação
 */

const API_BASE_URL = 'http://localhost:8080';

console.log('🏆 Ranking.js carregado - versão corrigida v5.0');

// Estado global da página
let currentRankingData = [];
let currentUserStats = null;
let isLoading = false;
let isUserLoggedIn = false;
let retryCount = 0;
const MAX_RETRIES = 3;

/**
 * Função principal para carregar dados do ranking
 * Agora com melhor tratamento de erros e retry automático
 */
async function loadRankingData() {
    if (isLoading) {
        console.log('⏳ Carregamento já em andamento...');
        return;
    }
    
    isLoading = true;
    showLoadingState();
    
    try {
        console.log('🏆 === INICIANDO CARREGAMENTO DE DADOS ===');
        console.log('🔄 Tentativa:', retryCount + 1, 'de', MAX_RETRIES);
        
        // Verifica se usuário está logado
        isUserLoggedIn = !!getAuthToken();
        console.log('🔐 Status de autenticação:', isUserLoggedIn ? 'Logado' : 'Não logado');
        
        updateUIForUserStatus();
        
        // Carrega dados principais em paralelo
        const promises = [
            loadRankingTable(),
            loadGlobalStats()
        ];
        
        // Adiciona carregamento de stats do usuário apenas se estiver logado
        if (isUserLoggedIn) {
            promises.push(loadUserStats());
        }
        
        const results = await Promise.allSettled(promises);
        
        // Processa resultados
        const [rankingResult, globalStatsResult, userStatsResult] = results;
        
        let hasError = false;
        
        // Processa ranking
        if (rankingResult.status === 'fulfilled' && rankingResult.value) {
            console.log('✅ Ranking carregado com sucesso:', rankingResult.value.length, 'jogadores');
            currentRankingData = rankingResult.value;
        } else {
            console.error('❌ Falha no carregamento do ranking:', rankingResult.reason?.message || 'Erro desconhecido');
            hasError = true;
        }
        
        // Processa estatísticas globais
        if (globalStatsResult.status === 'fulfilled' && globalStatsResult.value) {
            console.log('✅ Estatísticas globais carregadas com sucesso');
            updateGlobalStats(globalStatsResult.value);
        } else {
            console.error('❌ Falha no carregamento de estatísticas:', globalStatsResult.reason?.message || 'Erro desconhecido');
            hasError = true;
        }
        
        // Processa stats do usuário (se aplicável)
        if (isUserLoggedIn) {
            if (userStatsResult && userStatsResult.status === 'fulfilled' && userStatsResult.value) {
                console.log('✅ Estatísticas do usuário carregadas com sucesso');
                currentUserStats = userStatsResult.value;
                showUserPosition(userStatsResult.value);
            } else {
                console.warn('⚠️ Falha no carregamento de estatísticas do usuário:', 
                           userStatsResult?.reason?.message || 'Erro desconhecido');
                // Não considera como erro crítico
            }
        }
        
        // Verifica se houve falhas críticas
        if (hasError && currentRankingData.length === 0) {
            if (retryCount < MAX_RETRIES - 1) {
                retryCount++;
                console.log('🔄 Tentando novamente em 2 segundos...');
                setTimeout(() => {
                    loadRankingData();
                }, 2000);
                return;
            } else {
                throw new Error('Falha após múltiplas tentativas');
            }
        }
        
        // Reset contador de retry em caso de sucesso
        retryCount = 0;
        
    } catch (error) {
        console.error('❌ Erro geral no carregamento:', error);
        
        if (retryCount < MAX_RETRIES - 1) {
            retryCount++;
            console.log('🔄 Tentativa automática de recuperação em 3 segundos...');
            setTimeout(() => {
                loadRankingData();
            }, 3000);
        } else {
            showErrorState('Erro ao carregar dados do ranking. Verifique sua conexão.');
        }
    } finally {
        isLoading = false;
        hideLoadingState();
    }
    
    console.log('🏆 === CARREGAMENTO FINALIZADO ===');
}

/**
 * Carrega dados da tabela de ranking - MÉTODO PÚBLICO
 * Funciona mesmo sem autenticação
 */
async function loadRankingTable() {
    try {
        console.log('📊 Buscando dados do ranking (endpoint público)...');
        
        const response = await fetch(`${API_BASE_URL}/api/scores/ranking?limit=50`);
        
        if (!response.ok) {
            // Log detalhado do erro
            const errorText = await response.text().catch(() => 'Erro desconhecido');
            console.error('❌ Erro na resposta do ranking:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const rankingData = await response.json();
        console.log('📊 Dados do ranking recebidos:', rankingData.length, 'jogadores');
        
        // Valida se os dados estão no formato esperado
        if (!Array.isArray(rankingData)) {
            throw new Error('Formato de dados inválido recebido do servidor');
        }
        
        renderRankingTable(rankingData);
        return rankingData;
        
    } catch (error) {
        console.error('❌ Erro ao carregar ranking:', error);
        
        // Fallback para dados de demonstração apenas em último caso
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            console.log('🌐 Problema de conectividade detectado, usando dados de demonstração...');
            const demoData = generateDemoRankingData();
            renderRankingTable(demoData);
            showConnectivityWarning();
            return demoData;
        }
        
        throw error; // Re-throw para ser tratado pelo caller
    }
}

/**
 * Carrega estatísticas globais - MÉTODO PÚBLICO
 * Funciona mesmo sem autenticação
 */
async function loadGlobalStats() {
    try {
        console.log('📈 Buscando estatísticas globais (endpoint público)...');
        
        const response = await fetch(`${API_BASE_URL}/api/scores/stats`);
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Erro desconhecido');
            console.error('❌ Erro na resposta das estatísticas:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const stats = await response.json();
        console.log('📊 Estatísticas globais recebidas:', stats);
        
        // Valida estrutura básica dos dados
        if (typeof stats !== 'object' || stats === null) {
            throw new Error('Formato de estatísticas inválido');
        }
        
        updateGlobalStats(stats);
        return stats;
        
    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas globais:', error);
        
        // Fallback para estatísticas calculadas localmente
        if (currentRankingData.length > 0) {
            console.log('📊 Calculando estatísticas a partir dos dados do ranking...');
            const fallbackStats = calculateStatsFromRanking(currentRankingData);
            updateGlobalStats(fallbackStats);
            return fallbackStats;
        }
        
        throw error;
    }
}

/**
 * Carrega estatísticas do usuário - MÉTODO PRIVADO
 * Requer autenticação
 */
async function loadUserStats() {
    if (!isUserLoggedIn) {
        console.log('⚠️ Usuário não logado - pulando carregamento de estatísticas pessoais');
        return null;
    }
    
    try {
        console.log('👤 Buscando estatísticas do usuário (endpoint privado)...');
        
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/scores/my-stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.warn('🔐 Token inválido ou expirado, removendo autenticação...');
                clearAuthData();
                isUserLoggedIn = false;
                updateUIForUserStatus();
                return null;
            }
            
            const errorText = await response.text().catch(() => 'Erro desconhecido');
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const stats = await response.json();
        console.log('👤 Estatísticas do usuário recebidas:', stats);
        
        currentUserStats = stats;
        return stats;
        
    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas do usuário:', error);
        
        // Se for erro de autenticação, limpa os dados
        if (error.message.includes('401') || error.message.includes('403')) {
            clearAuthData();
            isUserLoggedIn = false;
            updateUIForUserStatus();
        }
        
        throw error;
    }
}

/**
 * Calcula estatísticas a partir dos dados do ranking (fallback)
 */
function calculateStatsFromRanking(rankingData) {
    if (!rankingData || rankingData.length === 0) {
        return {
            totalPlayers: 0,
            totalGames: 0,
            highestScore: 0,
            averageScore: 0,
            totalPoints: 0,
            topPlayer: 'Nenhum'
        };
    }
    
    const totalPlayers = rankingData.length;
    const totalGames = rankingData.reduce((sum, player) => sum + (player.totalGames || 0), 0);
    const highestScore = Math.max(...rankingData.map(player => player.bestScore || 0));
    const totalPoints = rankingData.reduce((sum, player) => sum + (player.totalPoints || 0), 0);
    const averageScore = totalPoints / Math.max(totalGames, 1);
    const topPlayer = rankingData[0]?.username || 'Nenhum';
    
    console.log('📊 Estatísticas calculadas localmente:', {
        totalPlayers, totalGames, highestScore, averageScore: Math.round(averageScore * 100) / 100
    });
    
    return {
        totalPlayers,
        totalGames,
        highestScore,
        averageScore: Math.round(averageScore * 100) / 100,
        totalPoints,
        topPlayer
    };
}

/**
 * Mostra aviso de conectividade
 */
function showConnectivityWarning() {
    const warning = document.createElement('div');
    warning.className = 'connectivity-warning';
    warning.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        background: #ff6b35;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        font-family: 'Press Start 2P', monospace;
        font-size: 0.6rem;
        z-index: 10000;
        max-width: 300px;
        animation: slideInRight 0.5s ease;
    `;
    warning.innerHTML = `
        ⚠️ MODO OFFLINE<br>
        Exibindo dados de demonstração.<br>
        Verifique sua conexão.
    `;
    
    document.body.appendChild(warning);
    
    setTimeout(() => {
        if (warning.parentNode) {
            warning.remove();
        }
    }, 10000);
}

// [RESTO DO CÓDIGO PERMANECE IGUAL - renderRankingTable, createRankingRow, etc.]

/**
 * Renderiza a tabela de ranking
 */
function renderRankingTable(rankingData) {
    console.log('🎨 Renderizando tabela de ranking...');
    
    const tbody = document.getElementById('ranking-tbody');
    if (!tbody) {
        console.error('❌ Elemento ranking-tbody não encontrado');
        return;
    }
    
    // Limpa tabela
    tbody.innerHTML = '';
    
    if (!rankingData || rankingData.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    
    // Renderiza cada linha do ranking
    rankingData.forEach((player, index) => {
        const row = createRankingRow(player, index + 1);
        tbody.appendChild(row);
    });
    
    console.log('✅ Tabela de ranking renderizada com', rankingData.length, 'jogadores');
}

/**
 * Cria uma linha da tabela de ranking
 */
function createRankingRow(player, position) {
    const row = document.createElement('tr');
    
    // Adiciona classes especiais para top 3
    if (position <= 3) {
        row.classList.add(`top-${position}`);
    }
    
    // Destaque para usuário atual
    if (isUserLoggedIn && currentUserStats && player.userId === currentUserStats.userId) {
        row.classList.add('current-user');
    }
    
    // Célula de posição
    const positionCell = document.createElement('td');
    positionCell.innerHTML = `
        <div class="position-container">
            <span class="position-number position-${position <= 3 ? position : 'other'}">${position}</span>
            ${position <= 3 ? `<span class="medal medal-${position}">🏆</span>` : ''}
        </div>
    `;
    row.appendChild(positionCell);
    
    // Célula de nome do jogador
    const nameCell = document.createElement('td');
    nameCell.innerHTML = `
        <div class="player-info">
            <span class="player-name">${escapeHtml(player.username || 'Jogador Anônimo')}</span>
            ${isUserLoggedIn && currentUserStats && player.userId === currentUserStats.userId ? 
                '<span class="current-user-badge">Você</span>' : ''}
        </div>
    `;
    row.appendChild(nameCell);
    
    // Célula de pontuação
    const scoreCell = document.createElement('td');
    scoreCell.innerHTML = `
        <div class="score-info">
            <span class="best-score">${player.bestScore || 0}</span>
            <span class="average-score">Média: ${player.averageScore || 0}</span>
        </div>
    `;
    row.appendChild(scoreCell);
    
    // Célula de partidas
    const gamesCell = document.createElement('td');
    gamesCell.innerHTML = `
        <div class="games-info">
            <span class="total-games">${player.totalGames || 0}</span>
            <span class="total-points">Total: ${player.totalPoints || 0}pts</span>
        </div>
    `;
    row.appendChild(gamesCell);
    
    return row;
}

/**
 * Atualiza estatísticas globais na interface
 */
function updateGlobalStats(stats) {
    console.log('📊 Atualizando estatísticas globais...');
    
    const elements = {
        'total-players': stats.totalPlayers || 0,
        'total-games': stats.totalGames || 0,
        'highest-score': stats.highestScore || 0
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            animateNumber(element, value);
        }
    });
    
    console.log('✅ Estatísticas globais atualizadas');
}

/**
 * Mostra posição do usuário
 */
function showUserPosition(userStats) {
    const positionCard = document.getElementById('user-position-card');
    const positionElement = document.getElementById('user-position');
    
    if (positionCard && positionElement && userStats.rankingPosition) {
        positionElement.textContent = userStats.rankingPosition + 'º';
        positionCard.style.display = 'block';
        
        // Anima a entrada do card
        setTimeout(() => {
            positionCard.classList.add('user-stat-highlight');
        }, 500);
        
        console.log('👤 Posição do usuário exibida:', userStats.rankingPosition);
    }
}

/**
 * Atualiza UI baseada no status do usuário
 */
function updateUIForUserStatus() {
    const userActions = document.getElementById('user-actions');
    const loginBanner = document.getElementById('login-banner');
    
    if (isUserLoggedIn) {
        if (userActions) userActions.style.display = 'flex';
        if (loginBanner) loginBanner.style.display = 'none';
        console.log('👤 UI configurada para usuário logado');
    } else {
        if (userActions) userActions.style.display = 'none';
        if (loginBanner) loginBanner.style.display = 'block';
        console.log('👤 UI configurada para usuário não logado');
    }
}

/**
 * Anima números com efeito contador
 */
function animateNumber(element, targetValue) {
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

/**
 * Estados da interface
 */
function showLoadingState() {
    const tbody = document.getElementById('ranking-tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="4">
                    <div class="loading-content">
                        <div class="loading-spinner"></div>
                        <span>Carregando ranking...</span>
                    </div>
                </td>
            </tr>
        `;
    }
}

function hideLoadingState() {
    // Loading será substituído pelos dados reais
}

function showEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const tableContainer = document.querySelector('.table-container');
    
    if (emptyState && tableContainer) {
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
    }
}

function hideEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const tableContainer = document.querySelector('.table-container');
    
    if (emptyState && tableContainer) {
        emptyState.style.display = 'none';
        tableContainer.style.display = 'block';
    }
}

function showErrorState(message) {
    const tbody = document.getElementById('ranking-tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr class="error-row">
                <td colspan="4">
                    <div class="error-content">
                        <span class="error-icon">⚠️</span>
                        <span class="error-message">${message}</span>
                        <button class="retry-btn" onclick="retryCount = 0; loadRankingData()">Tentar Novamente</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

/**
 * Gera dados de demonstração para fallback
 */
function generateDemoRankingData() {
    console.log('🎭 Gerando dados de demonstração...');
    
    const demoPlayers = [
        { username: 'TechMaster', bestScore: 100, totalGames: 15, averageScore: 85.3, totalPoints: 1280 },
        { username: 'CodeNinja', bestScore: 90, totalGames: 12, averageScore: 78.5, totalPoints: 942 },
        { username: 'QuizPro', bestScore: 80, totalGames: 20, averageScore: 65.0, totalPoints: 1300 },
        { username: 'LogicGuru', bestScore: 70, totalGames: 8, averageScore: 58.8, totalPoints: 470 },
        { username: 'DataWiz', bestScore: 60, totalGames: 25, averageScore: 48.0, totalPoints: 1200 }
    ];
    
    return demoPlayers.map((player, index) => ({
        userId: index + 1,
        username: player.username,
        bestScore: player.bestScore,
        totalGames: player.totalGames,
        averageScore: player.averageScore,
        totalPoints: player.totalPoints,
        position: index + 1
    }));
}

/**
 * Limpa dados de autenticação
 */
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

/**
 * Utilitários
 */
function getAuthToken() {
    return localStorage.getItem('token') || 
           (window.authData && window.authData.token) ||
           sessionStorage.getItem('token');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏆 === PÁGINA DE RANKING CARREGADA ===');
    console.log('🏠 DOM ready - iniciando configuração');
    
    // Carrega dados iniciais
    loadRankingData();
    
    // Configura botão de refresh
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('🔄 Refresh manual solicitado pelo usuário');
            retryCount = 0; // Reset contador
            loadRankingData();
        });
    }
    
    // Auto-refresh a cada 5 minutos (aumentado para não sobrecarregar)
    setInterval(() => {
        if (!isLoading) {
            console.log('🔄 Auto-refresh do ranking');
            retryCount = 0; // Reset contador para auto-refresh
            loadRankingData();
        }
    }, 300000); // 5 minutos
    
    // Listener para mudanças de autenticação
    window.addEventListener('storage', (e) => {
        if (e.key === 'token' || e.key === 'loggedIn') {
            console.log('🔐 Status de autenticação alterado, recarregando...');
            setTimeout(() => {
                retryCount = 0;
                loadRankingData();
            }, 500);
        }
    });
});

// Log de inicialização
console.log('🏆 Ranking.js carregado completamente');
console.log('🌐 API Base URL:', API_BASE_URL);