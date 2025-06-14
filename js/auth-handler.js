/**
 * AUTHENTICATION HANDLER - ENHANCED
 * Manages login/logout functionality for T.I QUIZZMASTER
 * Compatible with both old and new page structures
 */

class AuthHandler {
  constructor() {
    this.loginButton = null;
    this.loginImage = null;
    this.tooltip = null;
    this.isLoggedIn = false;
    
    this.init();
  }

  init() {
    this.setupElements();
    this.checkAuthStatus();
    this.setupEventListeners();
    
    console.log('🔐 Auth Handler initialized');
  }

  setupElements() {
    // Support both old and new selectors
    this.loginButton = document.getElementById('login');
    this.loginImage = document.getElementById('loginImage');
    this.tooltip = document.querySelector('.auth-tooltip');
    
    if (!this.loginButton || !this.loginImage) {
      console.warn('Auth elements not found');
      return;
    }
  }

  checkAuthStatus() {
    // Check if user is logged in from localStorage or memory storage
    const token = this.getStoredToken();
    const loginStatus = this.getStoredLoginStatus();
    
    this.isLoggedIn = !!(token && loginStatus);
    this.updateUI();
  }

  updateUI() {
    if (!this.loginImage || !this.loginButton) return;
    
    if (this.isLoggedIn) {
      this.loginImage.src = 'img/logout.png';
      this.loginImage.alt = 'logout';
      this.loginButton.classList.add('logged-in');
      
      if (this.tooltip) {
        this.tooltip.textContent = 'Logout';
      }
    } else {
      this.loginImage.src = 'img/login-image.png';
      this.loginImage.alt = 'login';
      this.loginButton.classList.remove('logged-in');
      
      if (this.tooltip) {
        this.tooltip.textContent = 'Login';
      }
    }
  }

  setupEventListeners() {
    if (!this.loginButton) return;
    
    this.loginButton.addEventListener('click', (event) => {
      if (this.isLoggedIn) {
        event.preventDefault();
        this.handleLogout();
      } else {
        // Allow normal navigation to login page
        this.handleLoginRedirect();
      }
    });

    // Add hover effects
    this.loginButton.addEventListener('mouseenter', () => {
      this.addHoverEffect();
    });

    this.loginButton.addEventListener('mouseleave', () => {
      this.removeHoverEffect();
    });
  }

  handleLoginRedirect() {
    // Add transition effect before navigation
    this.addTransitionEffect(() => {
      window.location.href = 'login.html';
    });
  }

  handleLogout() {
    // Clear authentication data
    this.clearAuthData();
    
    // Update status
    this.isLoggedIn = false;
    this.updateUI();
    
    // Show logout feedback
    this.showLogoutFeedback();
    
    console.log('👋 User logged out');
  }

  login(token, userData = {}) {
    // Store authentication data
    this.storeAuthData(token, userData);
    
    // Update status
    this.isLoggedIn = true;
    this.updateUI();
    
    // Show login feedback
    this.showLoginFeedback();
    
    console.log('👤 User logged in');
  }

  // Enhanced storage methods with fallback support
  storeAuthData(token, userData) {
    // Try localStorage first (for production)
    try {
      if (typeof Storage !== "undefined") {
        localStorage.setItem('token', token);
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));
        return;
      }
    } catch (e) {
      console.warn('localStorage not available, using memory storage');
    }
    
    // Fallback to memory storage (for Claude.ai artifacts)
    window.authData = {
      token: token,
      loggedIn: true,
      userData: userData,
      timestamp: Date.now()
    };
  }

  clearAuthData() {
    // Try localStorage first
    try {
      if (typeof Storage !== "undefined") {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('userData');
        return;
      }
    } catch (e) {
      console.warn('localStorage not available');
    }
    
    // Fallback to memory storage
    if (window.authData) {
      delete window.authData;
    }
  }

  getStoredToken() {
    // Try localStorage first
    try {
      if (typeof Storage !== "undefined") {
        const token = localStorage.getItem('token');
        if (token) return token;
      }
    } catch (e) {
      console.warn('localStorage not available');
    }
    
    // Fallback to memory storage
    return window.authData ? window.authData.token : null;
  }

  getStoredLoginStatus() {
    // Try localStorage first
    try {
      if (typeof Storage !== "undefined") {
        const status = localStorage.getItem('loggedIn');
        if (status) return status === 'true';
      }
    } catch (e) {
      console.warn('localStorage not available');
    }
    
    // Fallback to memory storage
    return window.authData ? window.authData.loggedIn : false;
  }

  getStoredUserData() {
    // Try localStorage first
    try {
      if (typeof Storage !== "undefined") {
        const userData = localStorage.getItem('userData');
        if (userData) return JSON.parse(userData);
      }
    } catch (e) {
      console.warn('localStorage not available');
    }
    
    // Fallback to memory storage
    return window.authData ? window.authData.userData : null;
  }

  // Visual feedback methods
  showLoginFeedback() {
    this.showNotification('Login realizado com sucesso!', 'success');
  }

  showLogoutFeedback() {
    this.showNotification('Logout realizado com sucesso!', 'info');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `auth-notification ${type}`;
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#00ff41' : type === 'error' ? '#ff0040' : '#00ffff';
    const shadowColor = type === 'success' ? 'rgba(0, 255, 65, 0.5)' : type === 'error' ? 'rgba(255, 0, 64, 0.5)' : 'rgba(0, 255, 255, 0.5)';
    
    notification.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: ${bgColor};
      color: #000;
      padding: 1rem 2rem;
      border-radius: 4px;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.7rem;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: 0 0 20px ${shadowColor};
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Slide out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }

  addHoverEffect() {
    if (this.loginButton) {
      this.loginButton.style.transform = 'scale(1.1)';
    }
  }

  removeHoverEffect() {
    if (this.loginButton) {
      this.loginButton.style.transform = '';
    }
  }

  addTransitionEffect(callback) {
    // Create screen transition effect
    const transition = document.createElement('div');
    transition.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(45deg, #000, #003300);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;
    
    document.body.appendChild(transition);
    
    setTimeout(() => {
      transition.style.opacity = '1';
      setTimeout(() => {
        if (callback) callback();
      }, 300);
    }, 50);
  }

  // Enhanced modal integration
  showModal(message) {
    // Try to use existing modal system
    if (typeof showModal === 'function') {
      showModal(message);
      return;
    }
    
    // Check for modal elements
    const modalText = document.getElementById('modalText');
    const modal = document.getElementById('myModal');
    
    if (modalText && modal) {
      modalText.textContent = message;
      modal.style.display = 'block';
      return;
    }
    
    // Fallback to notification
    this.showNotification(message, 'info');
  }

  // Integration with questions page
  setupQuestionsPageIntegration() {
    // Hide loading overlay if present
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
    
    // Update progress if elements exist
    this.updateQuestionProgress(0, 10);
  }

  updateQuestionProgress(current, total) {
    // Update progress bar
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    
    if (progressFill && progressPercentage) {
      const percentage = Math.round((current / total) * 100);
      progressFill.style.width = `${percentage}%`;
      progressPercentage.textContent = `${percentage}%`;
    }
    
    // Update question counter
    const currentQuestionEl = document.getElementById('current-question-number');
    const totalQuestionsEl = document.getElementById('total-questions');
    
    if (currentQuestionEl) currentQuestionEl.textContent = current;
    if (totalQuestionsEl) totalQuestionsEl.textContent = total;
  }

  // Public methods for external use
  getCurrentUser() {
    return this.getStoredUserData();
  }

  isAuthenticated() {
    return this.isLoggedIn;
  }

  forceLogout() {
    this.handleLogout();
  }

  forceLogin(token, userData = {}) {
    this.login(token, userData);
  }

  // Utility method for checking authentication before actions
  requireAuth(action, errorMessage = 'Você precisa fazer login primeiro!') {
    if (!this.isAuthenticated()) {
      this.showModal(errorMessage);
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      return false;
    }
    
    if (typeof action === 'function') {
      action();
    }
    return true;
  }
}

// 🆕 FUNÇÕES ADMIN PARA O MENU PRINCIPAL - CORRIGIDO
document.addEventListener('DOMContentLoaded', () => {
    // Função para verificar se o usuário é administrador
    async function checkAdminStatus() {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                console.log('❌ Token não encontrado - usuário não logado');
                return false;
            }

            const baseUrl = window.CONFIG ? window.CONFIG.API_BASE_URL : (window.API_BASE_URL || 'http://localhost:8080');
            
            console.log('🔍 Verificando status de admin com URL:', baseUrl);
            
            // PRIMEIRO: Tenta o endpoint principal
            let response = await fetch(`${baseUrl}/api/profile/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.log('❌ Resposta inválida da API profile/me:', response.status);
                
                // FALLBACK: Tenta endpoint alternativo para admin
                try {
                    console.log('🔄 Tentando endpoint alternativo /api/admin/me...');
                    response = await fetch(`${baseUrl}/api/admin/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        const adminUser = await response.json();
                        console.log('✅ Endpoint admin funcionou:', adminUser);
                        return true; // Se conseguiu acessar endpoint admin, é admin
                    }
                } catch (adminError) {
                    console.log('❌ Endpoint admin também falhou:', adminError);
                }
                
                return false;
            }

            const user = await response.json();
            
            console.log('✅ Dados do usuário recebidos:', {
                username: user.username,
                role: user.role,
                email: user.email,
                isAdmin: user.role === 'ADMIN'
            });
            
            // VERIFICAÇÃO MELHORADA
            if (user.role) {
                return user.role === 'ADMIN';
            } else {
                console.warn('⚠️ Campo role não encontrado na resposta');
                
                // FALLBACK: Testa acesso a endpoint admin
                try {
                    console.log('🔄 Testando acesso ao endpoint admin...');
                    const adminTestResponse = await fetch(`${baseUrl}/api/admin/users`, {
                        method: 'HEAD', // Apenas teste de acesso
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (adminTestResponse.ok || adminTestResponse.status === 405) {
                        // 405 Method Not Allowed significa que tem acesso mas HEAD não é permitido
                        console.log('✅ Usuário tem acesso admin (confirmado por teste de endpoint)');
                        return true;
                    }
                } catch (testError) {
                    console.log('❌ Teste de acesso admin falhou:', testError);
                }
                
                return false;
            }
            
        } catch (error) {
            console.error('❌ Erro ao verificar status de admin:', error);
            return false;
        }
    }

    // Função para mostrar/esconder botão de admin
    async function updateAdminButton() {
        console.log('🔄 Iniciando verificação do botão de admin...');
        
        // Verifica se o usuário está logado
        const isLoggedIn = localStorage.getItem('loggedIn') === 'true' || 
                          sessionStorage.getItem('loggedIn') === 'true' ||
                          !!(localStorage.getItem('token') || sessionStorage.getItem('token'));

        console.log('👤 Status de login:', isLoggedIn);

        if (!isLoggedIn) {
            console.log('❌ Usuário não está logado - não verificando admin');
            removeAdminButton(); // Remove botão se existir
            return;
        }

        console.log('🔍 Usuário logado - verificando se é admin...');
        const isAdmin = await checkAdminStatus();
        
        console.log('🔐 Resultado da verificação de admin:', isAdmin);
        
        if (isAdmin) {
            showAdminButton();
        } else {
            removeAdminButton();
        }
    }

    // Função para criar e mostrar o botão de admin
    function showAdminButton() {
        console.log('🔧 Tentando criar botão de admin...');
        
        // Verifica se o botão já existe
        if (document.getElementById('admin-btn')) {
            console.log('✅ Botão de admin já existe');
            return;
        }

        // Procura pelo container de navegação
        const navigation = document.querySelector('.navigation');
        if (!navigation) {
            console.error('❌ Container de navegação (.navigation) não encontrado');
            // Tenta alternativas
            const altNavigation = document.querySelector('.nav') || 
                                  document.querySelector('nav') || 
                                  document.querySelector('.menu');
            if (!altNavigation) {
                console.error('❌ Nenhum container de navegação encontrado');
                return;
            }
            console.log('✅ Container alternativo encontrado:', altNavigation.className);
        }

        const targetNavigation = navigation || document.querySelector('.nav') || document.querySelector('nav') || document.querySelector('.menu');

        // Cria o botão de admin
        const adminBtn = document.createElement('a');
        adminBtn.id = 'admin-btn';
        adminBtn.className = 'btn btn-admin';
        adminBtn.href = 'admin_dashboard.html'; // Corrigido para o nome correto do arquivo
        adminBtn.innerHTML = `
            <span class="btn-text">🔐 Admin</span>
            <span class="btn-bg"></span>
        `;

        // Adiciona o botão ao menu de navegação
        try {
            // Procura pelo botão de créditos para inserir antes dele
            const creditBtn = targetNavigation.querySelector('a[href="credit.html"]') ||
                             targetNavigation.querySelector('a[href*="credit"]');
            
            if (creditBtn) {
                targetNavigation.insertBefore(adminBtn, creditBtn);
                console.log('✅ Botão de admin inserido antes do botão de créditos');
            } else {
                targetNavigation.appendChild(adminBtn);
                console.log('✅ Botão de admin adicionado ao final da navegação');
            }

            console.log('🔐 Botão de admin criado e adicionado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao adicionar botão de admin:', error);
        }
    }

    // Função para remover o botão de admin
    function removeAdminButton() {
        const existingBtn = document.getElementById('admin-btn');
        if (existingBtn) {
            existingBtn.remove();
            console.log('🗑️ Botão de admin removido');
        }
    }

    // CSS para o botão de admin - melhorado
    const adminButtonStyles = `
    .btn-admin {
        background: linear-gradient(135deg, #ff0040 0%, #cc0033 100%) !important;
        border: 2px solid #ff0040 !important;
        box-shadow: 0 0 20px rgba(255, 0, 64, 0.3) !important;
        position: relative;
        overflow: hidden;
    }

    .btn-admin:hover {
        background: linear-gradient(135deg, #ff1155 0%, #ff0040 100%) !important;
        border-color: #ff1155 !important;
        box-shadow: 0 0 30px rgba(255, 0, 64, 0.5) !important;
        transform: translateY(-3px) !important;
    }

    .btn-admin .btn-text {
        color: white !important;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.8) !important;
        position: relative;
        z-index: 2;
    }

    .btn-admin .btn-bg {
        background: linear-gradient(45deg, 
            rgba(255, 0, 64, 0.8) 0%, 
            rgba(255, 17, 85, 0.8) 50%, 
            rgba(255, 0, 64, 0.8) 100%) !important;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
    }

    /* Animação adicional */
    .btn-admin::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s;
        z-index: 3;
    }

    .btn-admin:hover::before {
        left: 100%;
    }
    `;

    // Injeta os estilos se ainda não foram injetados
    if (!document.getElementById('admin-button-styles')) {
        const style = document.createElement('style');
        style.id = 'admin-button-styles';
        style.textContent = adminButtonStyles;
        document.head.appendChild(style);
    }

    // Initialize auth handler
    window.authHandler = new AuthHandler();
    
    // Setup page-specific integrations
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'questions.html' && window.authHandler) {
        window.authHandler.setupQuestionsPageIntegration();
    }

    // 🔄 EXECUÇÃO INICIAL
    console.log('🚀 Iniciando verificação inicial do botão de admin...');
    
    // Aguarda um pouco para garantir que a página está totalmente carregada
    setTimeout(() => {
        updateAdminButton();
    }, 1000);

    // 📡 LISTENERS PARA MUDANÇAS DE ESTADO
    
    // Verifica novamente quando o estado de login muda (localStorage)
    window.addEventListener('storage', (e) => {
        console.log('📡 Storage event detectado:', e.key, e.newValue);
        if (e.key === 'loggedIn' || e.key === 'token') {
            setTimeout(updateAdminButton, 500);
        }
    });

    // Custom event para mudanças de login na mesma aba
    window.addEventListener('authStateChanged', () => {
        console.log('📡 Auth state changed event detectado');
        setTimeout(updateAdminButton, 500);
    });

    // Verifica periodicamente (fallback para garantir)
    setInterval(() => {
        updateAdminButton();
    }, 10000); // A cada 10 segundos

    // Listener para quando o usuário faz login (custom event)
    window.addEventListener('userLoggedIn', () => {
        console.log('📡 User logged in event detectado');
        setTimeout(updateAdminButton, 1000);
    });

    // 🔍 DEBUG: Mostra informações do DOM
    console.log('🔍 Elementos de navegação encontrados:', {
        navigation: !!document.querySelector('.navigation'),
        nav: !!document.querySelector('.nav'),
        navTag: !!document.querySelector('nav'),
        menu: !!document.querySelector('.menu')
    });
});

// Global authentication check utility
window.requireAuth = function(action, errorMessage) {
  if (window.authHandler) {
    return window.authHandler.requireAuth(action, errorMessage);
  }
  return false;
};

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthHandler;
}