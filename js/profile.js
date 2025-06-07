/**
 * PROFILE PAGE CONTROLLER - T.I QUIZZMASTER
 * Sistema de gerenciamento de perfil do usuário
 * 
 * COMPORTAMENTOS CORRETOS:
 * 🔄 Username: Redireciona para login (token JWT precisa ser regenerado)
 * 🔐 Senha: Redireciona para login (segurança)
 * 🗑️ Exclusão: Redireciona para home (conta deletada)
 * 🚪 Logout: Redireciona para home
 * 
 * PROBLEMA CORRIGIDO:
 * Token JWT contém username antigo → findByUsername(old) → null → NullPointerException
 */

const API_BASE_URL = 'http://localhost:8080';

console.log('👤 Profile.js carregado - versão integrada v2.0');

// Estado global da página
let currentUserData = null;
let currentUserStats = null;
let isLoading = false;
let formValidation = {
    username: false,
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
};

class ProfileController {
    constructor() {
        this.isInitialized = false;
        this.modal = null;
        this.statusContainer = null;
        this.loadingOverlay = null;
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupElements();
        this.setupEventListeners();
        this.setupFormValidation();
        this.loadUserData();
        this.setupGlitchEffects();
        
        this.isInitialized = true;
        console.log('👤 Profile Controller initialized');
    }

    setupElements() {
        this.modal = document.getElementById('confirmation-modal');
        this.statusContainer = document.getElementById('status-container');
        this.loadingOverlay = document.getElementById('loading-overlay');
        
        // Form elements
        this.editProfileForm = document.getElementById('edit-profile-form');
        this.changePasswordForm = document.getElementById('change-password-form');
        this.deleteAccountBtn = document.getElementById('delete-account-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        
        console.log('✅ Elementos configurados');
    }

    setupEventListeners() {
        // Form submissions
        if (this.editProfileForm) {
            this.editProfileForm.addEventListener('submit', (e) => this.handleUsernameChange(e));
        }
        
        if (this.changePasswordForm) {
            this.changePasswordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
        }
        
        // Buttons
        if (this.deleteAccountBtn) {
            this.deleteAccountBtn.addEventListener('click', () => this.confirmAccountDeletion());
        }
        
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        // Modal events
        this.setupModalEvents();
        
        console.log('✅ Event listeners configurados');
    }

    setupModalEvents() {
        if (!this.modal) return;
        
        const closeBtn = document.getElementById('modal-close');
        const cancelBtn = document.getElementById('modal-cancel');
        const confirmBtn = document.getElementById('modal-confirm');
        const backdrop = this.modal.querySelector('.modal-backdrop');
        
        [closeBtn, cancelBtn, backdrop].forEach(element => {
            if (element) {
                element.addEventListener('click', () => this.closeModal());
            }
        });
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.handleModalConfirm());
        }
        
        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display !== 'none') {
                this.closeModal();
            }
        });
    }

    setupFormValidation() {
        // Username validation
        const usernameInput = document.getElementById('new-username');
        if (usernameInput) {
            usernameInput.addEventListener('input', () => {
                this.validateUsername(usernameInput.value);
                this.updateLabelState(usernameInput);
            });
            usernameInput.addEventListener('blur', () => {
                this.updateLabelState(usernameInput);
            });
        }
        
        // Password validation
        const currentPasswordInput = document.getElementById('current-password');
        const newPasswordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        
        if (currentPasswordInput) {
            currentPasswordInput.addEventListener('input', () => {
                this.validateCurrentPassword(currentPasswordInput.value);
                this.updateLabelState(currentPasswordInput);
            });
            currentPasswordInput.addEventListener('blur', () => {
                this.updateLabelState(currentPasswordInput);
            });
        }
        
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', () => {
                this.validateNewPassword(newPasswordInput.value);
                this.updateLabelState(newPasswordInput);
                // Re-validate confirm password if it has content
                if (confirmPasswordInput && confirmPasswordInput.value) {
                    this.validateConfirmPassword(confirmPasswordInput.value, newPasswordInput.value);
                }
            });
            newPasswordInput.addEventListener('blur', () => {
                this.updateLabelState(newPasswordInput);
            });
        }
        
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                const newPassword = newPasswordInput ? newPasswordInput.value : '';
                this.validateConfirmPassword(confirmPasswordInput.value, newPassword);
                this.updateLabelState(confirmPasswordInput);
            });
            confirmPasswordInput.addEventListener('blur', () => {
                this.updateLabelState(confirmPasswordInput);
            });
        }
    }

    updateLabelState(input) {
        const label = input.nextElementSibling;
        if (label && label.tagName === 'LABEL') {
            if (input.value.trim() !== '') {
                label.style.top = '0';
                label.style.fontSize = '0.5rem';
                label.style.color = 'var(--primary-green)';
                label.style.transform = 'translateY(-10px)';
            } else if (input !== document.activeElement) {
                label.style.top = '1rem';
                label.style.fontSize = '0.6rem';
                label.style.color = 'var(--secondary-green)';
                label.style.transform = 'translateY(0)';
            }
        }
    }

    // Validation functions
    validateUsername(username) {
        if (!username || username.trim() === '') {
            formValidation.username = false;
            this.updateSubmitButtonState('edit-profile-form');
            return false;
        }
        
        const trimmedUsername = username.trim();
        const isValid = trimmedUsername.length >= 3 && 
                       trimmedUsername.length <= 20 && 
                       /^[a-zA-Z0-9_-]+$/.test(trimmedUsername);
        
        formValidation.username = isValid;
        this.updateSubmitButtonState('edit-profile-form');
        return isValid;
    }

    validateCurrentPassword(password) {
        const isValid = password && password.length >= 1;
        formValidation.currentPassword = isValid;
        this.updateSubmitButtonState('change-password-form');
        return isValid;
    }

    validateNewPassword(password) {
        const isValid = password && password.length >= 6;
        formValidation.newPassword = isValid;
        this.updateSubmitButtonState('change-password-form');
        return isValid;
    }

    validateConfirmPassword(confirmPassword, newPassword) {
        const isValid = confirmPassword && 
                       newPassword && 
                       confirmPassword === newPassword && 
                       confirmPassword.length >= 6;
        formValidation.confirmPassword = isValid;
        this.updateSubmitButtonState('change-password-form');
        return isValid;
    }

    updateSubmitButtonState(formId) {
        let submitBtn, isFormValid;
        
        if (formId === 'edit-profile-form') {
            submitBtn = this.editProfileForm?.querySelector('.action-btn');
            isFormValid = formValidation.username;
        } else if (formId === 'change-password-form') {
            submitBtn = this.changePasswordForm?.querySelector('.action-btn');
            isFormValid = formValidation.currentPassword && formValidation.newPassword && formValidation.confirmPassword;
        }
        
        if (submitBtn) {
            submitBtn.disabled = !isFormValid || isLoading;
            
            if (isFormValid && !isLoading) {
                submitBtn.style.opacity = '1';
                submitBtn.style.pointerEvents = 'auto';
            } else {
                submitBtn.style.opacity = '0.6';
                submitBtn.style.pointerEvents = 'none';
            }
        }
    }

    setupGlitchEffects() {
        // Add glitch effects using baffle.js if available
        if (typeof baffle !== 'undefined') {
            const titleGlitch = baffle('.profile-title');
            titleGlitch.set({
                characters: '█▓▒░▓█▒░▓▒▓>▓░▓▒>/█>▓▒▓░▓▒░▓█▒',
                speed: 100
            });
            titleGlitch.start();
            titleGlitch.reveal(2000);
        }
    }

    // Data loading functions
    async loadUserData() {
        console.log('👤 Carregando dados do usuário...');
        
        if (!this.checkAuthentication()) {
            this.redirectToLogin();
            return;
        }
        
        try {
            this.setLoadingState(true, 'Carregando dados do perfil...');
            
            // Load user profile and stats in parallel
            const [profileData, statsData] = await Promise.allSettled([
                this.loadUserProfile(),
                this.loadUserStats()
            ]);
            
            if (profileData.status === 'fulfilled' && profileData.value) {
                currentUserData = profileData.value;
                this.displayUserInfo(profileData.value);
            } else if (profileData.status === 'rejected') {
                console.error('❌ Erro ao carregar perfil:', profileData.reason);
                if (profileData.reason.message.includes('expirada') || profileData.reason.message.includes('Token')) {
                    this.handleSessionExpired();
                    return;
                }
                throw profileData.reason;
            }
            
            if (statsData.status === 'fulfilled' && statsData.value) {
                currentUserStats = statsData.value;
                this.displayUserStats(statsData.value);
            } else if (statsData.status === 'rejected') {
                console.warn('⚠️ Erro ao carregar estatísticas:', statsData.reason);
                // Não interrompe o carregamento se apenas as estatísticas falharam
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            if (error.message.includes('expirada') || error.message.includes('Token')) {
                this.handleSessionExpired();
            } else {
                this.showStatusMessage('Erro ao carregar dados do perfil', 'error');
            }
        } finally {
            this.setLoadingState(false);
        }
    }

    async loadUserProfile() {
        console.log('📡 Carregando perfil do usuário...');
        
        try {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }
            
            const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Sessão expirada - faça login novamente');
                }
                throw new Error(`Erro ao carregar perfil: ${response.status}`);
            }
            
            let profileData;
            try {
                profileData = await response.json();
            } catch (jsonError) {
                throw new Error('Resposta inválida do servidor');
            }
            
            console.log('✅ Perfil carregado com sucesso:', profileData);
            return profileData;
            
        } catch (error) {
            console.error('❌ Erro ao carregar perfil:', error);
            throw error;
        }
    }

    async loadUserStats() {
        console.log('📡 Carregando estatísticas do usuário...');
        
        try {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }
            
            const response = await fetch(`${API_BASE_URL}/api/profile/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Sessão expirada - faça login novamente');
                }
                throw new Error(`Erro ao carregar estatísticas: ${response.status}`);
            }
            
            let statsData;
            try {
                statsData = await response.json();
            } catch (jsonError) {
                throw new Error('Resposta inválida do servidor');
            }
            
            console.log('✅ Estatísticas carregadas com sucesso:', statsData);
            return statsData;
            
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
            throw error;
        }
    }

    displayUserInfo(userData) {
        console.log('🎨 Exibindo informações do usuário:', userData);
        
        // Update welcome message
        const welcomeElement = document.getElementById('user-welcome');
        if (welcomeElement && userData.username) {
            welcomeElement.textContent = `Bem-vindo, ${userData.username}! Gerencie sua conta e configurações`;
        }
        
        // Update info fields
        const infoElements = {
            'current-username': userData.username || 'N/A',
            'current-email': userData.email || 'N/A',
            'member-since': this.formatDate(userData.createdAt) || 'N/A',
            'account-status': userData.status === 'active' ? 'Ativo' : 'Inativo'
        };
        
        Object.entries(infoElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Pre-fill username in edit form
        const usernameInput = document.getElementById('new-username');
        if (usernameInput && userData.username) {
            usernameInput.value = userData.username;
            this.updateLabelState(usernameInput);
            this.validateUsername(userData.username);
        }
    }

    displayUserStats(statsData) {
        console.log('📊 Exibindo estatísticas do usuário:', statsData);
        
        const statsElements = {
            'total-games-preview': statsData.totalGames || 0,
            'best-score-preview': statsData.bestScore || 0,
            'ranking-position-preview': statsData.rankingPosition ? `${statsData.rankingPosition}º` : '-'
        };
        
        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateNumber(element, value);
            }
        });
    }

    // Form handlers
    async handleUsernameChange(event) {
        event.preventDefault();
        
        if (isLoading) return;
        
        const newUsername = document.getElementById('new-username').value.trim();
        
        if (!this.validateUsername(newUsername)) {
            this.showStatusMessage('Username inválido. Use 3-20 caracteres (letras, números, _ e -)', 'error');
            return;
        }
        
        if (currentUserData && newUsername === currentUserData.username) {
            this.showStatusMessage('Este já é o seu username atual', 'info');
            return;
        }
        
        try {
            this.setLoadingState(true, 'Alterando username...');
            
            const result = await this.updateUsername(newUsername);
            
            this.showStatusMessage('✅ Username alterado com sucesso!', 'success');
            
            // Update current data temporarily for display
            if (currentUserData) {
                currentUserData.username = newUsername;
            }
            
            // Update display briefly
            const currentUsernameElement = document.getElementById('current-username');
            if (currentUsernameElement) {
                currentUsernameElement.textContent = newUsername;
            }
            
            // Update welcome message briefly
            const welcomeElement = document.getElementById('user-welcome');
            if (welcomeElement) {
                welcomeElement.textContent = `Bem-vindo, ${newUsername}! Gerencie sua conta e configurações`;
            }
            
            // 🔄 FORÇA LOGOUT: Token JWT ainda tem username antigo, precisa regenerar
            setTimeout(() => {
                this.forceReauthentication('Username alterado - faça login com seu novo nome');
            }, 2500);
            
        } catch (error) {
            console.error('❌ Erro ao alterar username:', error);
            if (error.message.includes('expirada') || error.message.includes('Token')) {
                this.handleSessionExpired();
            } else {
                this.showStatusMessage(error.message || 'Erro ao alterar username', 'error');
            }
        } finally {
            this.setLoadingState(false);
        }
    }

    async handlePasswordChange(event) {
        event.preventDefault();
        
        if (isLoading) return;
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!this.validateCurrentPassword(currentPassword) || 
            !this.validateNewPassword(newPassword) || 
            !this.validateConfirmPassword(confirmPassword, newPassword)) {
            this.showStatusMessage('Verifique os dados inseridos', 'error');
            return;
        }
        
        try {
            this.setLoadingState(true, 'Alterando senha...');
            
            const result = await this.updatePassword(currentPassword, newPassword);
            
            this.showStatusMessage('🔐 Senha alterada com sucesso!', 'success');
            
            // Clear form
            this.changePasswordForm.reset();
            formValidation.currentPassword = false;
            formValidation.newPassword = false;
            formValidation.confirmPassword = false;
            this.updateSubmitButtonState('change-password-form');
            
            // 🔐 SEGURANÇA: Força nova autenticação após mudança de senha
            setTimeout(() => {
                this.forceReauthentication('Senha alterada com sucesso');
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erro ao alterar senha:', error);
            if (error.message.includes('expirada') || error.message.includes('Token')) {
                this.handleSessionExpired();
            } else {
                this.showStatusMessage(error.message || 'Erro ao alterar senha', 'error');
            }
        } finally {
            this.setLoadingState(false);
        }
    }

    // API functions
    async updateUsername(newUsername) {
        console.log('💾 Alterando username para:', newUsername);
        
        try {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }
            
            const response = await fetch(`${API_BASE_URL}/api/profile/username`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newUsername: newUsername
                })
            });
            
            let responseData;
            try {
                responseData = await response.json();
            } catch (jsonError) {
                throw new Error('Resposta inválida do servidor');
            }
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Sessão expirada - faça login novamente');
                }
                if (response.status === 409) {
                    throw new Error(responseData.message || 'Username já está em uso');
                }
                if (response.status === 400) {
                    throw new Error(responseData.message || 'Username inválido');
                }
                throw new Error(responseData.message || 'Erro ao alterar username');
            }
            
            console.log('✅ Username alterado com sucesso:', responseData);
            return responseData;
            
        } catch (error) {
            console.error('❌ Erro ao alterar username:', error);
            throw error;
        }
    }

    async updatePassword(currentPassword, newPassword) {
        console.log('🔐 Alterando senha...');
        
        try {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }
            
            const response = await fetch(`${API_BASE_URL}/api/profile/password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });
            
            let responseData;
            try {
                responseData = await response.json();
            } catch (jsonError) {
                throw new Error('Resposta inválida do servidor');
            }
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Sessão expirada - faça login novamente');
                }
                if (response.status === 400) {
                    throw new Error(responseData.message || 'Dados inválidos');
                }
                throw new Error(responseData.message || 'Erro ao alterar senha');
            }
            
            console.log('✅ Senha alterada com sucesso:', responseData);
            return responseData;
            
        } catch (error) {
            console.error('❌ Erro ao alterar senha:', error);
            throw error;
        }
    }

    async deleteUserAccount(currentPassword) {
        console.log('🗑️ Excluindo conta do usuário...');
        
        try {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('Token não encontrado');
            }
            
            const response = await fetch(`${API_BASE_URL}/api/profile/account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: currentPassword
                })
            });
            
            let responseData;
            try {
                responseData = await response.json();
            } catch (jsonError) {
                throw new Error('Resposta inválida do servidor');
            }
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Sessão expirada - faça login novamente');
                }
                if (response.status === 400) {
                    throw new Error(responseData.message || 'Senha incorreta');
                }
                throw new Error(responseData.message || 'Erro ao excluir conta');
            }
            
            console.log('✅ Conta excluída com sucesso:', responseData);
            return responseData;
            
        } catch (error) {
            console.error('❌ Erro ao excluir conta:', error);
            throw error;
        }
    }

    // Account deletion
    confirmAccountDeletion() {
        this.showModal({
            title: 'EXCLUIR CONTA',
            icon: '🚨',
            message: 'Esta ação é <strong>IRREVERSÍVEL</strong>!<br><br>Todos os seus dados, histórico e estatísticas serão permanentemente removidos.<br><br>Tem certeza que deseja continuar?',
            requireConfirmation: true,
            confirmationText: 'EXCLUIR',
            confirmButtonText: 'Excluir Conta',
            onConfirm: () => this.handleAccountDeletion()
        });
    }

    async handleAccountDeletion() {
        // Solicita a senha atual para confirmação
        const currentPassword = prompt('Digite sua senha atual para confirmar a exclusão da conta:');
        
        if (!currentPassword || currentPassword.trim() === '') {
            this.showStatusMessage('Senha é obrigatória para excluir a conta', 'error');
            return;
        }
        
        try {
            this.setLoadingState(true, 'Excluindo conta...');
            
            const result = await this.deleteUserAccount(currentPassword.trim());
            
            this.showStatusMessage('Conta excluída com sucesso', 'success');
            
            // Clear auth data and redirect
            setTimeout(() => {
                this.clearAuthData();
                window.location.href = 'index.html';
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erro ao excluir conta:', error);
            if (error.message.includes('expirada') || error.message.includes('Token')) {
                this.handleSessionExpired();
            } else {
                this.showStatusMessage(error.message || 'Erro ao excluir conta', 'error');
            }
        } finally {
            this.setLoadingState(false);
        }
    }

    // Logout functionality
    handleLogout() {
        this.showModal({
            title: 'CONFIRMAR LOGOUT',
            icon: '🚪',
            message: 'Tem certeza que deseja sair?',
            requireConfirmation: false,
            confirmButtonText: 'Fazer Logout',
            onConfirm: () => this.performLogout()
        });
    }

    performLogout() {
        console.log('👋 Fazendo logout...');
        
        this.clearAuthData();
        
        // Integrate with auth handler if available
        if (window.authHandler) {
            window.authHandler.forceLogout();
        }
        
        this.showStatusMessage('Logout realizado com sucesso', 'info');
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    // Modal functionality
    showModal({ title, icon, message, requireConfirmation = false, confirmationText = 'CONFIRMAR', confirmButtonText = 'Confirmar', onConfirm }) {
        if (!this.modal) return;
        
        // Update modal content
        const modalTitle = document.getElementById('modal-title');
        const modalIcon = document.getElementById('confirmation-icon');
        const modalMessage = document.getElementById('confirmation-message');
        const confirmationInputContainer = document.getElementById('confirmation-input-container');
        const confirmBtn = document.getElementById('modal-confirm');
        
        if (modalTitle) modalTitle.textContent = title;
        if (modalIcon) modalIcon.textContent = icon;
        if (modalMessage) modalMessage.innerHTML = message;
        if (confirmBtn) confirmBtn.textContent = confirmButtonText;
        
        // Handle confirmation input
        if (requireConfirmation && confirmationInputContainer) {
            confirmationInputContainer.style.display = 'block';
            const confirmationInput = document.getElementById('confirmation-input');
            if (confirmationInput) {
                confirmationInput.value = '';
                confirmationInput.placeholder = `Digite '${confirmationText}' para continuar`;
                
                // Validate confirmation input
                const validateInput = () => {
                    const isValid = confirmationInput.value.trim().toUpperCase() === confirmationText.toUpperCase();
                    confirmBtn.disabled = !isValid;
                    confirmBtn.style.opacity = isValid ? '1' : '0.5';
                };
                
                confirmationInput.addEventListener('input', validateInput);
                validateInput(); // Initial validation
            }
        } else if (confirmationInputContainer) {
            confirmationInputContainer.style.display = 'none';
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
        }
        
        // Store confirmation callback
        this.modalConfirmCallback = onConfirm;
        
        // Show modal
        this.modal.style.display = 'flex';
        
        // Focus on confirmation input if present
        setTimeout(() => {
            const confirmationInput = document.getElementById('confirmation-input');
            if (confirmationInput && requireConfirmation) {
                confirmationInput.focus();
            }
        }, 100);
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            this.modalConfirmCallback = null;
            
            // Clear confirmation input
            const confirmationInput = document.getElementById('confirmation-input');
            if (confirmationInput) {
                confirmationInput.value = '';
                confirmationInput.removeEventListener('input', () => {});
            }
        }
    }

    handleModalConfirm() {
        if (this.modalConfirmCallback) {
            this.modalConfirmCallback();
            this.closeModal();
        }
    }

    // Security functions
    forceReauthentication(reason = 'Operação de segurança realizada') {
        console.log('🔐 Forçando nova autenticação:', reason);
        
        this.showStatusMessage(`${reason}. Redirecionando para login...`, 'info', 4000);
        
        setTimeout(() => {
            this.clearAuthData();
            
            // Adiciona parâmetro para mostrar mensagem específica na tela de login
            const loginUrl = new URL('login.html', window.location.origin);
            
            if (reason.includes('Username')) {
                loginUrl.searchParams.set('reason', 'username_changed');
            } else if (reason.includes('Senha')) {
                loginUrl.searchParams.set('reason', 'password_changed');
            }
            
            window.location.href = loginUrl.toString();
        }, 4000);
    }
    checkAuthentication() {
        const token = this.getAuthToken();
        const isLoggedIn = this.getLoginStatus();
        
        return !!(token && isLoggedIn);
    }

    getAuthToken() {
        return localStorage.getItem('token') || 
               (window.authData && window.authData.token) ||
               sessionStorage.getItem('token');
    }

    getLoginStatus() {
        const localStorageStatus = localStorage.getItem('loggedIn') === 'true';
        const windowDataStatus = window.authData && window.authData.loggedIn;
        const sessionStorageStatus = sessionStorage.getItem('loggedIn') === 'true';
        
        return localStorageStatus || windowDataStatus || sessionStorageStatus;
    }

    clearAuthData() {
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

    redirectToLogin() {
        console.log('🔄 Redirecionando para login...');
        window.location.href = 'login.html';
    }

    handleSessionExpired() {
        console.log('⏰ Sessão expirada - limpando dados e redirecionando...');
        this.clearAuthData();
        this.showStatusMessage('Sessão expirada. Faça login novamente.', 'error');
        
        setTimeout(() => {
            this.redirectToLogin();
        }, 2000);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            
            // Verifica se é uma data válida
            if (isNaN(date.getTime())) {
                return 'Data inválida';
            }
            
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.warn('⚠️ Erro ao formatar data:', error);
            return 'Data inválida';
        }
    }

    animateNumber(element, targetValue) {
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

    // UI state management
    setLoadingState(loading, message = 'Processando...') {
        isLoading = loading;
        
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = message;
        }
        
        if (loading) {
            this.showLoadingOverlay();
        } else {
            this.hideLoadingOverlay();
        }
        
        // Update button states
        this.updateSubmitButtonState('edit-profile-form');
        this.updateSubmitButtonState('change-password-form');
    }

    showLoadingOverlay() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
        }
    }

    hideLoadingOverlay() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }

    showStatusMessage(message, type = 'info', duration = 5000) {
        if (!this.statusContainer) return;
        
        const statusMessage = document.createElement('div');
        statusMessage.className = `status-message ${type}`;
        statusMessage.textContent = message;
        
        this.statusContainer.appendChild(statusMessage);
        
        // Animate entry
        setTimeout(() => {
            statusMessage.classList.add('show');
        }, 100);
        
        // Remove after duration
        setTimeout(() => {
            statusMessage.classList.remove('show');
            
            setTimeout(() => {
                if (statusMessage.parentNode) {
                    statusMessage.remove();
                }
            }, 500);
        }, duration);
        
        console.log(`📢 Status message (${type}): ${message}`);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('👤 === PÁGINA DE PERFIL CARREGADA ===');
    console.log('🏠 DOM ready - iniciando configuração');
    
    // Initialize profile controller
    setTimeout(() => {
        window.profileController = new ProfileController();
    }, 500);
    
    console.log('👤 === CONFIGURAÇÃO INICIAL COMPLETA ===');
});

// Global debug functions
window.profileDebug = {
    showTestModal: () => {
        if (window.profileController) {
            window.profileController.showModal({
                title: 'TESTE',
                icon: '🧪',
                message: 'Este é um modal de teste',
                onConfirm: () => console.log('Modal confirmado!')
            });
        }
    },
    simulateUserData: () => {
        if (window.profileController) {
            const testData = {
                username: 'TestUser123',
                email: 'test@example.com',
                createdAt: '2024-01-15T10:30:00Z',
                status: 'active'
            };
            window.profileController.displayUserInfo(testData);
        }
    },
    simulateStats: () => {
        if (window.profileController) {
            const testStats = {
                totalGames: 42,
                bestScore: 95,
                rankingPosition: 3
            };
            window.profileController.displayUserStats(testStats);
        }
    }
};

console.log('👤 Profile.js carregado completamente');
console.log('🌐 API Base URL:', API_BASE_URL);
console.log('💡 Debug functions available: profileDebug.*');