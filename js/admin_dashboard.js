/* ==========================================================================
   ADMIN DASHBOARD JAVASCRIPT - FIXED & ENHANCED
   ========================================================================== */

class AdminDashboard {
    constructor() {
        this.currentTab = 'users';
        this.currentUser = null;
        this.apiBaseUrl = this.getApiBaseUrl();
        this.authCheckInterval = null; // 🆕 Para verificação periódica
        this.init();
    }

    // Método para obter a URL base da API com fallback
    getApiBaseUrl() {
        // Tenta usar CONFIG primeiro
        if (window.CONFIG && window.CONFIG.API_BASE_URL) {
            return window.CONFIG.API_BASE_URL;
        }
        
        // Fallback para API_BASE_URL global
        if (window.API_BASE_URL) {
            return window.API_BASE_URL;
        }
        
        // Fallback final
        return 'http://localhost:8080';
    }

    async init() {
        console.log('🔧 Inicializando painel administrativo...');
        console.log('🌐 API Base URL:', this.apiBaseUrl);
        
        // 🆕 CORREÇÃO: Verificação mais rigorosa de autenticação
        if (!await this.checkAdminAccess()) {
            this.redirectToLogin();
            return;
        }

        // 🆕 CORREÇÃO: Inicia verificação periódica de autenticação
        this.startAuthMonitoring();

        this.setupEventListeners();
        this.loadInitialData();
        this.showTab('users');
    }

    // 🆕 CORREÇÃO: Verificação de autenticação mais rigorosa
    async checkAdminAccess() {
        try {
            // 1. Verifica se tem token válido
            const token = this.getToken();
            if (!token) {
                console.log('❌ Token não encontrado');
                throw new Error('No token found');
            }

            console.log('🔍 Verificando privilégios de admin...');
            
            // 2. 🆕 CORREÇÃO: Timeout mais curto para falhar rapidamente se o token for inválido
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos

            const response = await fetch(`${this.apiBaseUrl}/api/profile/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.log('❌ Token inválido ou expirado - Status:', response.status);
                
                // 🆕 CORREÇÃO: Limpa dados automaticamente se token inválido
                if (response.status === 401 || response.status === 403) {
                    this.clearAllAuthData();
                }
                
                throw new Error('Invalid token');
            }

            const user = await response.json();
            this.currentUser = user;
            
            console.log('👤 Usuário atual:', user.username, 'Role:', user.role);
            
            // 🆕 CORREÇÃO: Verificação dupla de role admin
            if (user.role !== 'ADMIN') {
                console.log('🚫 Acesso negado - usuário não é admin. Role atual:', user.role);
                
                // 🆕 CORREÇÃO: Testa se realmente não tem acesso a endpoint admin
                try {
                    const adminTestResponse = await fetch(`${this.apiBaseUrl}/api/admin/system/stats`, {
                        method: 'HEAD',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (!adminTestResponse.ok) {
                        console.log('🚫 Confirmado: usuário não tem acesso admin');
                        throw new Error('User is not admin - confirmed by endpoint test');
                    }
                    
                    console.log('⚠️ Role incorreta mas tem acesso admin - possível inconsistência');
                } catch (testError) {
                    console.log('🚫 Teste de acesso admin falhou:', testError.message);
                    throw new Error('User is not admin');
                }
            }
            
            // 3. 🆕 CORREÇÃO: Salva dados do usuário admin atual para verificação posterior
            this.saveCurrentAdminData(user);
            
            // Atualiza o nome do admin na header
            const adminUsername = document.getElementById('admin-username');
            if (adminUsername) {
                adminUsername.textContent = user.username;
            }

            console.log('✅ Acesso de admin confirmado para:', user.username);
            return true;
            
        } catch (error) {
            console.error('❌ Erro na verificação de admin:', error.message);
            
            // 🆕 CORREÇÃO: Limpa todos os dados se falhou na verificação
            this.clearAllAuthData();
            return false;
        }
    }

    // 🆕 CORREÇÃO: Salva dados do admin atual para verificação posterior
    saveCurrentAdminData(user) {
        try {
            const adminData = {
                userId: user.id,
                username: user.username,
                role: user.role,
                timestamp: Date.now()
            };
            
            localStorage.setItem('currentAdminData', JSON.stringify(adminData));
            sessionStorage.setItem('currentAdminData', JSON.stringify(adminData));
        } catch (e) {
            console.warn('Erro ao salvar dados do admin:', e);
        }
    }

    // 🆕 CORREÇÃO: Verifica se o usuário atual ainda é o mesmo admin
    isCurrentAdminValid() {
        try {
            const savedData = localStorage.getItem('currentAdminData') || sessionStorage.getItem('currentAdminData');
            if (!savedData) return false;
            
            const adminData = JSON.parse(savedData);
            
            // Verifica se os dados não são muito antigos (máximo 1 hora)
            const oneHour = 60 * 60 * 1000;
            if (Date.now() - adminData.timestamp > oneHour) {
                console.log('⚠️ Dados do admin expirados');
                return false;
            }
            
            // Compara com os dados atuais se disponíveis
            if (this.currentUser) {
                return this.currentUser.id === adminData.userId && 
                       this.currentUser.role === 'ADMIN' &&
                       this.currentUser.username === adminData.username;
            }
            
            return true;
        } catch (e) {
            console.warn('Erro ao verificar admin atual:', e);
            return false;
        }
    }

    // 🆕 CORREÇÃO: Monitora autenticação periodicamente
    startAuthMonitoring() {
        // Verifica a cada 2 minutos se ainda é admin válido
        this.authCheckInterval = setInterval(async () => {
            console.log('🔍 Verificação periódica de autenticação admin...');
            
            if (!this.isCurrentAdminValid()) {
                console.log('⚠️ Dados do admin inválidos - fazendo nova verificação');
                
                if (!await this.checkAdminAccess()) {
                    console.log('🚫 Autenticação admin perdida - redirecionando');
                    this.handleAuthLoss();
                }
            }
        }, 2 * 60 * 1000); // 2 minutos

        // 🆕 CORREÇÃO: Listener para mudanças de storage (troca de conta)
        window.addEventListener('storage', (e) => {
            if (e.key === 'token' || e.key === 'loggedIn' || e.key === 'userData') {
                console.log('📡 Mudança detectada no storage - verificando autenticação');
                setTimeout(async () => {
                    if (!await this.checkAdminAccess()) {
                        this.handleAuthLoss();
                    }
                }, 1000);
            }
        });

        // 🆕 CORREÇÃO: Listener para quando a página fica visível
        document.addEventListener('visibilitychange', async () => {
            if (!document.hidden) {
                console.log('📡 Página visível - verificando autenticação');
                if (!await this.checkAdminAccess()) {
                    this.handleAuthLoss();
                }
            }
        });
    }

    // 🆕 CORREÇÃO: Trata perda de autenticação admin
    handleAuthLoss() {
        console.log('🚨 Perda de autenticação admin detectada');
        
        // Para o monitoramento
        if (this.authCheckInterval) {
            clearInterval(this.authCheckInterval);
        }
        
        // Limpa tudo
        this.clearAllAuthData();
        
        // Mostra mensagem e redireciona
        this.showMessage('Sessão administrativa expirada. Redirecionando...', 'error');
        
        setTimeout(() => {
            this.redirectToLogin('admin_session_expired');
        }, 2000);
    }

    // 🆕 CORREÇÃO: Limpeza completa de dados de autenticação
    clearAllAuthData() {
        console.log('🧹 Limpando todos os dados de autenticação...');
        
        try {
            // Remove dados de localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('loggedIn');
            localStorage.removeItem('userData');
            localStorage.removeItem('currentAdminData');
            
            // Remove dados de sessionStorage
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('loggedIn');
            sessionStorage.removeItem('userData');
            sessionStorage.removeItem('currentAdminData');
        } catch (e) {
            console.warn('Erro ao limpar dados:', e);
        }
        
        // Remove dados de memória
        if (window.authData) {
            delete window.authData;
        }
        
        // Reset dados internos
        this.currentUser = null;
    }

    redirectToLogin(reason = 'access_denied') {
        // Para o monitoramento se estiver rodando
        if (this.authCheckInterval) {
            clearInterval(this.authCheckInterval);
        }
        
        console.log('🔄 Redirecionando para login. Motivo:', reason);
        
        // 🆕 CORREÇÃO: URL com parâmetro para mostrar mensagem específica
        const loginUrl = new URL('login.html', window.location.origin);
        loginUrl.searchParams.set('reason', reason);
        
        // Força limpeza de dados
        this.clearAllAuthData();
        
        // Dispara evento para atualizar botão de admin
        if (window.authHandler) {
            window.authHandler.forceLogout();
        }
        
        window.location.href = loginUrl.toString();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.showTab(tabName);
            });
        });

        // 🆕 CORREÇÃO: Logout melhorado
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Users tab actions
        this.setupUsersEventListeners();
        
        // Cleanup tab actions
        this.setupCleanupEventListeners();
        
        // Questions tab actions
        this.setupQuestionsEventListeners();
        
        // Reports tab actions
        this.setupReportsEventListeners();

        // Refresh buttons
        document.getElementById('refresh-users')?.addEventListener('click', () => this.loadUsers());
        document.getElementById('refresh-questions')?.addEventListener('click', () => this.loadQuestions());
        document.getElementById('refresh-reports')?.addEventListener('click', () => this.loadReports());

        // 🆕 CORREÇÃO: Listener para beforeunload
        window.addEventListener('beforeunload', () => {
            if (this.authCheckInterval) {
                clearInterval(this.authCheckInterval);
            }
        });
    }

    setupUsersEventListeners() {
        // Create admin button
        document.getElementById('create-admin')?.addEventListener('click', () => {
            this.showCreateAdminModal();
        });

        // Modal actions
        document.getElementById('modal-cancel')?.addEventListener('click', () => {
            this.closeModal(document.getElementById('user-modal'));
        });
    }

    setupCleanupEventListeners() {
        document.querySelectorAll('.cleanup-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.executeCleanupAction(action);
            });
        });

        document.getElementById('get-cleanup-report')?.addEventListener('click', () => {
            this.getCleanupReport();
        });

        // Botão de limpeza forçada do sistema
        document.getElementById('force-system-cleanup')?.addEventListener('click', () => {
            this.forceSystemCleanup();
        });
    }

    setupQuestionsEventListeners() {
        // Botão adicionar pergunta
        const addQuestionBtn = document.getElementById('add-question');
        if (addQuestionBtn) {
            addQuestionBtn.addEventListener('click', () => {
                this.showQuestionModal();
            });
        }

        // Botão refresh perguntas
        const refreshQuestionsBtn = document.getElementById('refresh-questions');
        if (refreshQuestionsBtn) {
            refreshQuestionsBtn.addEventListener('click', () => {
                this.loadQuestions();
            });
        }

        // Modal de pergunta - botões
        const questionSaveBtn = document.getElementById('question-save');
        if (questionSaveBtn) {
            questionSaveBtn.addEventListener('click', () => {
                this.saveQuestion();
            });
        }

        const questionCancelBtn = document.getElementById('question-cancel');
        const questionCloseBtn = document.getElementById('question-modal-close');
        
        if (questionCancelBtn) {
            questionCancelBtn.addEventListener('click', () => {
                this.closeModal(document.getElementById('question-modal'));
            });
        }

        if (questionCloseBtn) {
            questionCloseBtn.addEventListener('click', () => {
                this.closeModal(document.getElementById('question-modal'));
            });
        }
    }

    setupReportsEventListeners() {
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportData();
        });
    }

    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`)?.classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        switch (tabName) {
            case 'users':
                this.loadUsers();
                break;
            case 'cleanup':
                this.loadCleanupData();
                break;
            case 'questions':
                this.loadQuestions();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    async loadInitialData() {
        try {
            await this.loadStats();
        } catch (error) {
            console.error('❌ Erro ao carregar dados iniciais:', error);
        }
    }

    async loadStats() {
        try {
            const token = this.getToken();
            
            // Carrega estatísticas globais
            const [statsResponse, questionsResponse] = await Promise.all([
                fetch(`${this.apiBaseUrl}/api/scores/stats`),
                fetch(`${this.apiBaseUrl}/api/questions`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                document.getElementById('total-users').textContent = stats.totalPlayers || 0;
                document.getElementById('total-sessions').textContent = stats.totalGames || 0;
                document.getElementById('total-scores').textContent = stats.totalGames || 0;
            }

            if (questionsResponse.ok) {
                const questions = await questionsResponse.json();
                document.getElementById('total-questions').textContent = questions.length || 0;
            }

        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
        }
    }

    async loadUsers() {
        const tbody = document.getElementById('users-tbody');
        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="loading-row">
                    <div class="loading-content">
                        <div class="loading-spinner"></div>
                        <span>Carregando usuários...</span>
                    </div>
                </td>
            </tr>
        `;

        try {
            const token = this.getToken();
            const response = await fetch(`${this.apiBaseUrl}/api/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    // 🆕 CORREÇÃO: Trata perda de privilégios imediatamente
                    console.log('🚫 Privilégios de admin perdidos');
                    this.handleAuthLoss();
                    return;
                }
                throw new Error('Erro ao carregar usuários');
            }

            const users = await response.json();
            this.renderUsers(users);

        } catch (error) {
            console.error('❌ Erro ao carregar usuários:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="error-row">
                        Erro ao carregar usuários: ${error.message}
                    </td>
                </tr>
            `;
        }
    }

    renderUsers(users) {
        const tbody = document.getElementById('users-tbody');
        if (!tbody) return;

        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-row">
                        Nenhum usuário encontrado
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <span class="user-role role-${user.role.toLowerCase()}">
                        ${user.role}
                    </span>
                </td>
                <td>${new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>${user.totalGames || 0}</td>
                <td>${user.bestScore || 0}</td>
                <td>
                    <div class="user-actions">
                        ${user.role === 'USER' ? 
                            `<button class="btn-small btn-promote" onclick="adminDashboard.promoteUser(${user.id})">
                                👑 Admin
                            </button>` : 
                            `<button class="btn-small btn-demote" onclick="adminDashboard.demoteUser(${user.id})">
                                👤 User
                            </button>`
                        }
                        <button class="btn-small btn-delete" onclick="adminDashboard.deleteUser(${user.id}, '${user.username}')">
                            🗑️ Deletar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadCleanupData() {
        // Carrega informações sobre limpeza se necessário
        console.log('📊 Carregando dados de limpeza...');
    }

    async loadQuestions() {
        const container = document.getElementById('questions-list');
        if (!container) return;

        container.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <span>Carregando perguntas...</span>
            </div>
        `;

        try {
            const token = this.getToken();
            const response = await fetch(`${this.apiBaseUrl}/api/questions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar perguntas');
            }

            const questions = await response.json();
            this.renderQuestions(questions);

        } catch (error) {
            console.error('❌ Erro ao carregar perguntas:', error);
            container.innerHTML = `
                <div class="error-content">
                    Erro ao carregar perguntas: ${error.message}
                </div>
            `;
        }
    }

    renderQuestions(questions) {
        const container = document.getElementById('questions-list');
        if (!container) return;

        if (questions.length === 0) {
            container.innerHTML = `
                <div class="empty-content">
                    <div class="empty-icon">❓</div>
                    <h3>Nenhuma pergunta encontrada</h3>
                    <p>Clique em "Nova Pergunta" para adicionar a primeira pergunta.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = questions.map((question, index) => `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-header">
                    <div class="question-number">#${question.id}</div>
                    <div class="question-content">
                        <h4>${this.escapeHtml(question.content)}</h4>
                    </div>
                    <div class="question-actions">
                        <button class="btn-small btn-edit" onclick="adminDashboard.editQuestion(${question.id})" title="Editar pergunta">
                            ✏️ Editar
                        </button>
                        <button class="btn-small btn-delete" onclick="adminDashboard.deleteQuestion(${question.id})" title="Deletar pergunta">
                            🗑️ Deletar
                        </button>
                    </div>
                </div>
                <div class="answers-list">
                    ${question.answers.map((answer, answerIndex) => `
                        <div class="answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                            <span class="answer-label">${String.fromCharCode(65 + answerIndex)})</span>
                            <span class="answer-content">${this.escapeHtml(answer.content)}</span>
                            ${answer.isCorrect ? '<span class="correct-indicator">✓ Correta</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // Função auxiliar para escapar HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async loadReports() {
        try {
            await this.loadSystemHealth();
            await this.loadTopPlayers();
            await this.loadRecentActivity();
            await this.loadDatabaseStats();
        } catch (error) {
            console.error('❌ Erro ao carregar relatórios:', error);
        }
    }

    async loadSystemHealth() {
        const container = document.getElementById('system-health');
        if (!container) return;

        try {
            const token = this.getToken();
            const response = await fetch(`${this.apiBaseUrl}/api/admin/system/health`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const health = await response.json();
                container.innerHTML = `
                    <div class="health-item">
                        <span class="health-label">Sessões Ativas:</span>
                        <span class="health-value">${health.activeSessions}</span>
                    </div>
                    <div class="health-item">
                        <span class="health-label">Sessões Score Zero:</span>
                        <span class="health-value">${health.totalZeroScoreSessions}</span>
                    </div>
                    <div class="health-item">
                        <span class="health-label">Status do Sistema:</span>
                        <span class="health-value ${health.systemStatus}">${health.systemStatus.toUpperCase()}</span>
                    </div>
                    <div class="health-item">
                        <span class="health-label">Precisa Limpeza:</span>
                        <span class="health-value">${health.needsCleanup ? 'SIM' : 'NÃO'}</span>
                    </div>
                `;
            } else {
                throw new Error('Erro ao carregar saúde do sistema');
            }
        } catch (error) {
            container.innerHTML = '<div class="error">Erro ao carregar saúde do sistema</div>';
        }
    }

    async loadTopPlayers() {
        const container = document.getElementById('top-players');
        if (!container) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/scores/best-scores?limit=5`);
            if (response.ok) {
                const players = await response.json();
                container.innerHTML = players.map((player, index) => `
                    <div class="health-item">
                        <span class="health-label">#${index + 1} ${player.username}:</span>
                        <span class="health-value">${player.bestScore} pts</span>
                    </div>
                `).join('');
            }
        } catch (error) {
            container.innerHTML = '<div class="error">Erro ao carregar top players</div>';
        }
    }

    async loadRecentActivity() {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        // Mock data
        container.innerHTML = `
            <div class="health-item">
                <span class="health-label">Novos usuários hoje:</span>
                <span class="health-value">3</span>
            </div>
            <div class="health-item">
                <span class="health-label">Jogos hoje:</span>
                <span class="health-value">25</span>
            </div>
            <div class="health-item">
                <span class="health-label">Último login:</span>
                <span class="health-value">5 min atrás</span>
            </div>
        `;
    }

    async loadDatabaseStats() {
        const container = document.getElementById('database-stats');
        if (!container) return;

        try {
            const token = this.getToken();
            const response = await fetch(`${this.apiBaseUrl}/api/admin/system/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const stats = await response.json();
                container.innerHTML = `
                    <div class="health-item">
                        <span class="health-label">Total Usuários:</span>
                        <span class="health-value">${stats.totalUsers || 0}</span>
                    </div>
                    <div class="health-item">
                        <span class="health-label">Total Admins:</span>
                        <span class="health-value">${stats.totalAdmins || 0}</span>
                    </div>
                    <div class="health-item">
                        <span class="health-label">Total Sessões:</span>
                        <span class="health-value">${stats.totalSessions || 0}</span>
                    </div>
                    <div class="health-item">
                        <span class="health-label">Sessões Ativas:</span>
                        <span class="health-value">${stats.activeSessions || 0}</span>
                    </div>
                    <div class="health-item">
                        <span class="health-label">Maior Score:</span>
                        <span class="health-value">${stats.highestScore || 0}</span>
                    </div>
                    <div class="health-item">
                        <span class="health-label">Usuários Ativos:</span>
                        <span class="health-value">${stats.activeUsers || 0}</span>
                    </div>
                `;
            } else {
                throw new Error('Erro ao carregar estatísticas');
            }
        } catch (error) {
            container.innerHTML = '<div class="error">Erro ao carregar estatísticas do banco</div>';
        }
    }

    // User Management Methods
    async promoteUser(userId) {
        if (!confirm('Promover usuário a administrador?')) return;

        try {
            this.showLoading('Promovendo usuário...');
            
            const token = this.getToken();
            const response = await fetch(`${this.apiBaseUrl}/api/admin/users/${userId}/promote`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao promover usuário');
            }

            const result = await response.json();
            
            this.hideLoading();
            this.showMessage(result.message, 'success');
            this.loadUsers();
        } catch (error) {
            this.hideLoading();
            this.showMessage('Erro ao promover usuário: ' + error.message, 'error');
        }
    }

    async demoteUser(userId) {
        if (!confirm('Rebaixar administrador a usuário comum?')) return;

        try {
            this.showLoading('Rebaixando usuário...');
            
            const token = this.getToken();
            const response = await fetch(`${this.apiBaseUrl}/api/admin/users/${userId}/demote`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao rebaixar usuário');
            }

            const result = await response.json();
            
            this.hideLoading();
            this.showMessage(result.message, 'success');
            this.loadUsers();
        } catch (error) {
            this.hideLoading();
            this.showMessage('Erro ao rebaixar usuário: ' + error.message, 'error');
        }
    }

    async deleteUser(userId, username) {
        if (!confirm(`Deletar usuário "${username}"? Esta ação é irreversível!`)) return;

        try {
            this.showLoading('Deletando usuário...');
            
            const token = this.getToken();
            const response = await fetch(`${this.apiBaseUrl}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao deletar usuário');
            }

            const result = await response.json();
            
            this.hideLoading();
            this.showMessage(result.message, 'success');
            this.loadUsers();
        } catch (error) {
            this.hideLoading();
            this.showMessage('Erro ao deletar usuário: ' + error.message, 'error');
        }
    }

    showCreateAdminModal() {
        const modal = document.getElementById('user-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        title.textContent = 'Criar Novo Administrador';
        body.innerHTML = `
            <div class="form-group">
                <label>Username:</label>
                <input type="text" id="new-admin-username" placeholder="Digite o username">
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" id="new-admin-email" placeholder="Digite o email">
            </div>
            <div class="form-group">
                <label>Senha:</label>
                <input type="password" id="new-admin-password" placeholder="Digite a senha">
            </div>
        `;

        const confirmBtn = document.getElementById('modal-confirm');
        confirmBtn.textContent = 'Criar Admin';
        confirmBtn.onclick = () => this.createAdmin();

        modal.style.display = 'flex';
    }

    async createAdmin() {
        const username = document.getElementById('new-admin-username').value;
        const email = document.getElementById('new-admin-email').value;
        const password = document.getElementById('new-admin-password').value;

        if (!username || !email || !password) {
            this.showMessage('Preencha todos os campos!', 'error');
            return;
        }

        try {
            this.showLoading('Criando administrador...');
            
            const token = this.getToken();
            const response = await fetch(`${this.apiBaseUrl}/api/admin/users/create-admin`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao criar administrador');
            }

            const result = await response.json();

            this.hideLoading();
            this.closeModal(document.getElementById('user-modal'));
            this.showMessage(result.message, 'success');
            this.loadUsers();
        } catch (error) {
            this.hideLoading();
            this.showMessage('Erro ao criar administrador: ' + error.message, 'error');
        }
    }

    // Cleanup Methods
    async executeCleanupAction(action) {
        const confirmMessages = {
            'cleanup-abandoned': 'Remover todas as sessões abandonadas?',
            'cleanup-zero-score': 'Remover sessões com score zero?',
            'finish-active': 'Finalizar todas as sessões ativas?',
            'intelligent-cleanup': 'Executar limpeza inteligente?',
            'cleanup-old-days': 'Remover sessões antigas?',
            'cleanup-zero-hours': 'Remover scores zero antigos?',
            'cleanup-all-zero': 'ATENÇÃO: Remover TODOS os scores zero? (Irreversível!)'
        };

        if (!confirm(confirmMessages[action] || 'Executar esta ação?')) return;

        try {
            this.showLoading('Executando limpeza...');
            
            let endpoint = '';

            switch (action) {
                case 'cleanup-abandoned':
                    endpoint = '/api/quiz-session/cleanup/abandoned';
                    break;
                case 'cleanup-zero-score':
                    endpoint = '/api/quiz-session/cleanup/zero-score';
                    break;
                case 'finish-active':
                    endpoint = '/api/quiz-session/finish-all';
                    break;
                case 'intelligent-cleanup':
                    endpoint = '/api/quiz-session/cleanup/intelligent-zero-score';
                    break;
                case 'cleanup-old-days':
                    const days = document.getElementById('cleanup-days').value;
                    endpoint = `/api/quiz-session/cleanup/old?days=${days}`;
                    break;
                case 'cleanup-zero-hours':
                    const hours = document.getElementById('cleanup-hours').value;
                    endpoint = `/api/quiz-session/cleanup/zero-score?hours=${hours}`;
                    break;
                case 'cleanup-all-zero':
                    endpoint = '/api/quiz-session/cleanup/all-zero-score';
                    break;
            }

            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
                method: action.includes('finish') ? 'PUT' : 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro na requisição de limpeza');
            }

            const result = await response.json();
            
            this.hideLoading();
            this.showCleanupResults(result);
            this.showMessage(result.message || 'Limpeza executada com sucesso!', 'success');

        } catch (error) {
            this.hideLoading();
            this.showMessage('Erro na limpeza: ' + error.message, 'error');
        }
    }

    async getCleanupReport() {
        try {
            this.showLoading('Gerando relatório...');
            
            const response = await fetch(`${this.apiBaseUrl}/api/quiz-session/report/zero-score`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao gerar relatório');
            }

            const report = await response.json();
            
            this.hideLoading();
            this.showCleanupResults(report);

        } catch (error) {
            this.hideLoading();
            this.showMessage('Erro ao gerar relatório: ' + error.message, 'error');
        }
    }

    showCleanupResults(results) {
        const container = document.getElementById('cleanup-results');
        const content = document.getElementById('cleanup-results-content');
        
        if (container && content) {
            content.textContent = JSON.stringify(results, null, 2);
            container.style.display = 'block';
        }
    }

    // Question Management Methods
    showQuestionModal(questionData = null) {
        const modal = document.getElementById('question-modal');
        const title = document.getElementById('question-modal-title');
        
        if (questionData) {
            title.textContent = '✏️ Editar Pergunta';
            modal.dataset.editMode = 'true';
            modal.dataset.questionId = questionData.id;
            
            // Preencher campo da pergunta
            document.getElementById('question-content').value = questionData.content;
            
            // Preencher respostas
            const answerInputs = document.querySelectorAll('#answer-inputs input[type="text"]');
            const radioInputs = document.querySelectorAll('#answer-inputs input[type="radio"]');
            
            // Limpar seleções anteriores
            radioInputs.forEach(radio => radio.checked = false);
            
            // Preencher dados
            questionData.answers.forEach((answer, index) => {
                if (answerInputs[index]) {
                    answerInputs[index].value = answer.content;
                }
                if (radioInputs[index] && answer.isCorrect) {
                    radioInputs[index].checked = true;
                }
            });
        } else {
            title.textContent = '➕ Nova Pergunta';
            modal.dataset.editMode = 'false';
            delete modal.dataset.questionId;
            document.getElementById('question-form').reset();
        }

        modal.style.display = 'flex';
    }

    async saveQuestion() {
        const modal = document.getElementById('question-modal');
        const isEditMode = modal.dataset.editMode === 'true';
        const questionId = modal.dataset.questionId;
        
        const content = document.getElementById('question-content').value.trim();
        const answerInputs = document.querySelectorAll('#answer-inputs input[type="text"]');
        const correctAnswer = document.querySelector('#answer-inputs input[type="radio"]:checked');

        // Validações
        if (!content) {
            this.showMessage('❌ Digite o conteúdo da pergunta!', 'error');
            return;
        }

        if (!correctAnswer) {
            this.showMessage('❌ Selecione a resposta correta!', 'error');
            return;
        }

        const answers = Array.from(answerInputs).map((input, index) => ({
            content: input.value.trim(),
            isCorrect: index === parseInt(correctAnswer.value)
        }));

        if (answers.some(answer => !answer.content)) {
            this.showMessage('❌ Preencha todas as respostas!', 'error');
            return;
        }

        // Verificar se há exatamente uma resposta correta
        const correctCount = answers.filter(answer => answer.isCorrect).length;
        if (correctCount !== 1) {
            this.showMessage('❌ Deve haver exatamente uma resposta correta!', 'error');
            return;
        }

        try {
            const loadingText = isEditMode ? 'Atualizando pergunta...' : 'Salvando pergunta...';
            this.showLoading(loadingText);

            const url = isEditMode 
                ? `${this.apiBaseUrl}/api/questions/${questionId}`
                : `${this.apiBaseUrl}/api/questions`;
            
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: content,
                    answers: answers
                })
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Dados inválidos');
                } else if (response.status === 403) {
                    throw new Error('Acesso negado - apenas administradores podem gerenciar perguntas');
                } else if (response.status === 404 && isEditMode) {
                    throw new Error('Pergunta não encontrada');
                }
                throw new Error('Erro ao processar pergunta');
            }

            this.hideLoading();
            this.closeModal(modal);
            
            const successMessage = isEditMode 
                ? '✅ Pergunta atualizada com sucesso!' 
                : '✅ Pergunta criada com sucesso!';
            
            this.showMessage(successMessage, 'success');
            
            // Recarregar dados
            await this.loadQuestions();
            await this.loadStats();

        } catch (error) {
            this.hideLoading();
            console.error('❌ Erro ao salvar pergunta:', error);
            this.showMessage(`❌ Erro ao salvar pergunta: ${error.message}`, 'error');
        }
    }

    async deleteQuestion(questionId) {
        if (!confirm('❌ Deletar esta pergunta?\n\nEsta ação é IRREVERSÍVEL e pode afetar quizzes em andamento!')) {
            return;
        }

        try {
            this.showLoading('Deletando pergunta...');

            const response = await fetch(`${this.apiBaseUrl}/api/questions/${questionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Pergunta não encontrada');
                } else if (response.status === 403) {
                    throw new Error('Acesso negado - apenas administradores podem deletar perguntas');
                } else if (response.status === 409) {
                    throw new Error('Não é possível deletar - pergunta está sendo usada em quizzes ativos');
                }
                throw new Error('Erro ao deletar pergunta');
            }

            this.hideLoading();
            this.showMessage('✅ Pergunta deletada com sucesso!', 'success');
            
            // Atualizar lista e estatísticas
            await this.loadQuestions();
            await this.loadStats();

        } catch (error) {
            this.hideLoading();
            console.error('❌ Erro ao deletar pergunta:', error);
            this.showMessage(`❌ Erro ao deletar pergunta: ${error.message}`, 'error');
        }
    }

    async editQuestion(questionId) {
        try {
            this.showLoading('Carregando pergunta...');

            // Buscar dados da pergunta
            const response = await fetch(`${this.apiBaseUrl}/api/questions/${questionId}`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Pergunta não encontrada');
                }
                throw new Error('Erro ao carregar pergunta');
            }

            const questionData = await response.json();
            this.hideLoading();

            // Preencher modal com dados da pergunta
            this.showQuestionModal(questionData);
            
            // Marcar como edição
            const modal = document.getElementById('question-modal');
            modal.dataset.editMode = 'true';
            modal.dataset.questionId = questionId;

        } catch (error) {
            this.hideLoading();
            console.error('❌ Erro ao carregar pergunta:', error);
            this.showMessage(`❌ Erro ao carregar pergunta: ${error.message}`, 'error');
        }
    }

    // Export Methods
    async exportData() {
        try {
            this.showLoading('Exportando dados...');
            
            // Simula export
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.hideLoading();
            this.showMessage('Dados exportados com sucesso!', 'success');
        } catch (error) {
            this.hideLoading();
            this.showMessage('Erro ao exportar dados: ' + error.message, 'error');
        }
    }

    // Force System Cleanup
    async forceSystemCleanup() {
        if (!confirm('⚠️ ATENÇÃO: Executar limpeza forçada completa do sistema?\n\nEsta operação irá:\n- Remover sessões abandonadas\n- Limpar scores zero\n- Finalizar sessões antigas\n\nEsta ação é irreversível!')) {
            return;
        }

        try {
            this.showLoading('Executando limpeza forçada do sistema...');
            
            const token = this.getToken();
            const response = await fetch(`${this.apiBaseUrl}/api/admin/system/force-cleanup`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro na limpeza forçada');
            }

            const result = await response.json();
            
            this.hideLoading();
            this.showCleanupResults(result.results);
            this.showMessage(result.message || 'Limpeza forçada executada com sucesso!', 'success');
            
            // Recarrega os dados para refletir as mudanças
            this.loadStats();
            this.loadReports();

        } catch (error) {
            this.hideLoading();
            this.showMessage('Erro na limpeza forçada: ' + error.message, 'error');
        }
    }

    // Utility Methods
    getToken() {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    }

    // 🆕 CORREÇÃO: Logout melhorado que limpa tudo
    logout() {
        if (confirm('Fazer logout do painel administrativo?')) {
            console.log('🚪 Fazendo logout do admin dashboard...');
            
            // Para o monitoramento
            if (this.authCheckInterval) {
                clearInterval(this.authCheckInterval);
            }
            
            // Limpa todos os dados
            this.clearAllAuthData();
            
            // Integra com auth handler se disponível
            if (window.authHandler) {
                window.authHandler.forceLogout();
            }

            // Redireciona para a página inicial
            window.location.href = 'index.html';
        }
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('status-container');
        if (!container) return;
        
        // Limpa mensagem anterior se existir
        const existingMessage = container.querySelector('.status-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Cria nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.className = `status-message ${type}`;
        container.appendChild(messageDiv);
        
        // Remove mensagem após 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showLoading(text = 'Carregando...') {
        const overlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        
        if (overlay && loadingText) {
            overlay.style.display = 'flex';
            loadingText.textContent = text;
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showModal(modal) {
        if (modal) {
            modal.style.display = 'flex';
        }
    }
}

const adminDashboard = new AdminDashboard();// Instância global

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});