/**
 * PROFILE PAGE CONTROLLER - T.I QUIZZMASTER
 * Sistema de gerenciamento de perfil do usuário
 */

const API_BASE_URL = 'http://localhost:8080';

console.log('👤 Profile.js carregado - versão inicial v1.0');

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
        const isValid = username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(username);
        formValidation.username = isValid;
        this.updateSubmitButtonState('edit-profile-form');
        return isValid;
    }

    validateCurrentPassword(password) {
        const isValid = password.length >= 1;
        formValidation.currentPassword = isValid;
        this.updateSubmitButtonState('change-password-form');
        return isValid;
    }

    validateNewPassword(password) {
        const isValid = password.length >= 6;
        formValidation.newPassword = isValid;
        this.updateSubmitButtonState('change-password-form');
        return isValid;
    }

    validateConfirmPassword(confirmPassword, newPassword) {
        const isValid = confirmPassword === newPassword && confirmPassword.length >= 6;
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
            }
            
            if (statsData.status === 'fulfilled' && statsData.value) {
                currentUserStats = statsData.value;
                this.displayUserStats(statsData.value);
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            this.showStatusMessage('Erro ao carregar dados do perfil', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    async loadUserProfile() {
        // TODO: Implementar chamada real da API
        console.log('📡 Carregando perfil do usuário (placeholder)...');
        
        // Simulação de dados
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: 1,
                    username: 'TestUser',
                    email: 'test@example.com',
                    createdAt: new Date().toISOString(),
                    status: 'active'
                });
            }, 1000);
        });
    }

    async loadUserStats() {
        // TODO: Implementar chamada real da API
        console.log('📡 Carregando estatísticas do usuário (placeholder)...');
        
        // Simulação de dados
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    totalGames: 25,
                    bestScore: 90,
                    rankingPosition: 5,
                    averageScore: 72.5,
                    totalPoints: 1812
                });
            }, 800);
        });
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
        
        console.log('💾 Alterando username para:', newUsername);
        
        try {
            this.setLoadingState(true, 'Alterando username...');
            
            // TODO: Implementar chamada real da API
            await this.updateUsername(newUsername);
            
            this.showStatusMessage('Username alterado com sucesso!', 'success');
            
            // Update current data
            if (currentUserData) {
                currentUserData.username = newUsername;
            }
            
            // Update display
            const currentUsernameElement = document.getElementById('current-username');
            if (currentUsernameElement) {
                currentUsernameElement.textContent = newUsername;
            }
            
        } catch (error) {
            console.error('❌ Erro ao alterar username:', error);
            this.showStatusMessage(error.message || 'Erro ao alterar username', 'error');
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
        
        console.log('🔐 Alterando senha...');
        
        try {
            this.setLoadingState(true, 'Alterando senha...');
            
            // TODO: Implementar chamada real da API
            await this.updatePassword(currentPassword, newPassword);
            
            this.showStatusMessage('Senha alterada com sucesso!', 'success');
            
            // Clear form
            this.changePasswordForm.reset();
            formValidation.currentPassword = false;
            formValidation.newPassword = false;
            formValidation.confirmPassword = false;
            this.updateSubmitButtonState('change-password-form');
            
        } catch (error) {
            console.error('❌ Erro ao alterar senha:', error);
            this.showStatusMessage(error.message || 'Erro ao alterar senha', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    // API placeholder functions
    async updateUsername(newUsername) {
        // TODO: Implementar chamada real da API
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% success rate for demo
                    resolve({ success: true });
                } else {
                    reject(new Error('Username já está em uso'));
                }
            }, 1500);
        });
    }

    async updatePassword(currentPassword, newPassword) {
        // TODO: Implementar chamada real da API
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.2) { // 80% success rate for demo
                    resolve({ success: true });
                } else {
                    reject(new Error('Senha atual incorreta'));
                }
            }, 2000);
        });
    }

    async deleteUserAccount() {
        // TODO: Implementar chamada real da API
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% success rate for demo
                    resolve({ success: true });
                } else {
                    reject(new Error('Erro interno do servidor'));
                }
            }, 2500);
        });
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
        console.log('🗑️ Excluindo conta do usuário...');
        
        try {
            this.setLoadingState(true, 'Excluindo conta...');
            
            await this.deleteUserAccount();
            
            this.showStatusMessage('Conta excluída com sucesso', 'success');
            
            // Clear auth data and redirect
            setTimeout(() => {
                this.clearAuthData();
                window.location.href = 'index.html';
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erro ao excluir conta:', error);
            this.showStatusMessage(error.message || 'Erro ao excluir conta', 'error');
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

    // Utility functions
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

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
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