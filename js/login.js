/**
 * LOGIN CONTROLLER - T.I QUIZZMASTER
 * Sistema aprimorado de autenticação com correções de validação
 */

const API_BASE_URL = 'http://localhost:8080';

console.log('🔐 Login.js carregado - versão com correções v3.1');

// Estado global da página
let currentForm = 'login'; // 'login' ou 'register'
let isLoading = false;
let formValidation = {
    login: { username: false, password: false },
    register: { username: false, email: false, password: false, terms: false }
};

class EnhancedLoginController {
    constructor() {
        this.loginForm = null;
        this.registerForm = null;
        this.authWrapper = null;
        this.statusContainer = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupElements();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupGlitchEffects();
        this.checkExistingAuth();
        
        this.isInitialized = true;
        console.log('🔐 Enhanced Login Controller initialized');
    }

    setupElements() {
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.authWrapper = document.getElementById('auth-wrapper');
        this.statusContainer = document.getElementById('status-container');
        this.loadingOverlay = document.getElementById('loading-overlay');
        
        // Form containers
        this.signInContainer = document.getElementById('sign-in-container');
        this.signUpContainer = document.getElementById('sign-up-container');
        
        // Switch buttons
        this.showRegisterBtn = document.getElementById('show-register');
        this.showLoginBtn = document.getElementById('show-login');
        
        console.log('✅ Elementos configurados');
    }

    setupEventListeners() {
        // Form submissions
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // Form switching
        if (this.showRegisterBtn) {
            this.showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToRegister();
            });
        }
        
        if (this.showLoginBtn) {
            this.showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToLogin();
            });
        }
        
        // Input validation
        this.setupInputValidation();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.loadingOverlay.style.display !== 'none') {
                this.hideLoadingOverlay();
            }
        });
        
        console.log('✅ Event listeners configurados');
    }

    setupInputValidation() {
        // Login form validation
        const loginUsername = document.getElementById('loginUsername');
        const loginPassword = document.getElementById('loginPassword');
        
        if (loginUsername) {
            // 🔧 CORREÇÃO: Múltiplos event listeners para capturar mudanças
            loginUsername.addEventListener('input', () => {
                this.validateField('login', 'username', loginUsername.value);
                this.updateLabelState(loginUsername);
            });
            loginUsername.addEventListener('blur', () => {
                this.validateField('login', 'username', loginUsername.value);
                this.updateLabelState(loginUsername);
            });
            loginUsername.addEventListener('change', () => {
                this.validateField('login', 'username', loginUsername.value);
                this.updateLabelState(loginUsername);
            });
        }
        
        if (loginPassword) {
            loginPassword.addEventListener('input', () => {
                this.validateField('login', 'password', loginPassword.value);
                this.updateLabelState(loginPassword);
            });
            loginPassword.addEventListener('blur', () => {
                this.validateField('login', 'password', loginPassword.value);
                this.updateLabelState(loginPassword);
            });
        }
        
        // Register form validation
        const registerUsername = document.getElementById('registerUsername');
        const registerEmail = document.getElementById('registerEmail');
        const registerPassword = document.getElementById('registerPassword');
        const termsCheckbox = document.getElementById('terms-checkbox');
        
        if (registerUsername) {
            registerUsername.addEventListener('input', () => {
                this.validateField('register', 'username', registerUsername.value);
                this.updateLabelState(registerUsername);
            });
            registerUsername.addEventListener('blur', () => {
                this.validateField('register', 'username', registerUsername.value);
                this.updateLabelState(registerUsername);
            });
        }
        
        if (registerEmail) {
            // 🔧 CORREÇÃO: Event listeners específicos para email
            registerEmail.addEventListener('input', () => {
                this.validateField('register', 'email', registerEmail.value);
                this.updateLabelState(registerEmail);
            });
            registerEmail.addEventListener('blur', () => {
                this.validateField('register', 'email', registerEmail.value);
                this.updateLabelState(registerEmail);
            });
            registerEmail.addEventListener('change', () => {
                this.validateField('register', 'email', registerEmail.value);
                this.updateLabelState(registerEmail);
            });
        }
        
        if (registerPassword) {
            registerPassword.addEventListener('input', () => {
                this.validateField('register', 'password', registerPassword.value);
                this.updateLabelState(registerPassword);
            });
            registerPassword.addEventListener('blur', () => {
                this.validateField('register', 'password', registerPassword.value);
                this.updateLabelState(registerPassword);
            });
        }
        
        if (termsCheckbox) {
            // 🔧 CORREÇÃO: Múltiplos event listeners para o checkbox
            termsCheckbox.addEventListener('change', (e) => {
                console.log('🔧 Checkbox changed:', e.target.checked);
                this.validateField('register', 'terms', e.target.checked);
                this.updateCheckboxState(termsCheckbox);
            });
            
            termsCheckbox.addEventListener('click', (e) => {
                console.log('🔧 Checkbox clicked:', e.target.checked);
                // Delay para garantir que o estado seja atualizado
                setTimeout(() => {
                    this.validateField('register', 'terms', e.target.checked);
                    this.updateCheckboxState(termsCheckbox);
                }, 50);
            });
            
            // 🔧 NOVA: Event listener para o label também
            const checkboxLabel = termsCheckbox.closest('.checkbox-label');
            if (checkboxLabel) {
                checkboxLabel.addEventListener('click', (e) => {
                    // Previne propagação dupla se clicou no checkbox
                    if (e.target === termsCheckbox) return;
                    
                    // Força mudança do checkbox
                    termsCheckbox.checked = !termsCheckbox.checked;
                    console.log('🔧 Label clicked, checkbox now:', termsCheckbox.checked);
                    
                    this.validateField('register', 'terms', termsCheckbox.checked);
                    this.updateCheckboxState(termsCheckbox);
                });
            }
        }
    }

    // 🔧 NOVA: Função para atualizar estado visual do label
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

    // 🔧 NOVA: Função para atualizar estado visual do checkbox
    updateCheckboxState(checkbox) {
        const label = checkbox.closest('.checkbox-label');
        if (label) {
            if (checkbox.checked) {
                label.classList.add('active');
                console.log('🔧 Checkbox label ativado');
            } else {
                label.classList.remove('active');
                console.log('🔧 Checkbox label desativado');
            }
        }
    }

    validateField(formType, fieldName, value) {
        let isValid = false;
        
        console.log(`🔧 Validando ${formType}.${fieldName}:`, value);
        
        switch (fieldName) {
            case 'username':
                isValid = value.length >= 3 && value.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(value);
                break;
            case 'email':
                // 🔧 CORREÇÃO: Validação mais robusta para email
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length > 0;
                break;
            case 'password':
                isValid = value.length >= 6;
                break;
            case 'terms':
                // 🔧 CORREÇÃO: Validação explícita para boolean
                isValid = value === true;
                break;
        }
        
        console.log(`🔧 Resultado da validação ${formType}.${fieldName}:`, isValid);
        
        formValidation[formType][fieldName] = isValid;
        this.updateSubmitButtonState(formType);
        
        return isValid;
    }

    updateSubmitButtonState(formType) {
        const validationState = formValidation[formType];
        const isFormValid = Object.values(validationState).every(valid => valid);
        
        console.log(`🔧 Estado da validação ${formType}:`, validationState);
        console.log(`🔧 Form ${formType} válido:`, isFormValid);
        
        const submitBtn = formType === 'login' ? 
            document.getElementById('login-submit') : 
            document.getElementById('register-submit');
        
        if (submitBtn) {
            submitBtn.disabled = !isFormValid || isLoading;
            
            if (isFormValid && !isLoading) {
                submitBtn.classList.add('valid');
                submitBtn.classList.remove('disabled');
                console.log(`🔧 Botão ${formType} habilitado`);
            } else {
                submitBtn.classList.remove('valid');
                submitBtn.classList.add('disabled');
                console.log(`🔧 Botão ${formType} desabilitado`);
            }
        }
    }

    setupGlitchEffects() {
        // Adiciona efeitos de glitch nos títulos
        if (typeof baffle !== 'undefined') {
            const titleGlitch = baffle('.login-title');
            titleGlitch.set({
                characters: '█▓▒░▓█▒░▓▒▓>▓░▓▒>/█>▓▒▓░▓▒░▓█▒',
                speed: 100
            });
            titleGlitch.start();
            titleGlitch.reveal(2000);
            
            // Efeito nos títulos dos forms
            const formTitles = baffle('.form-title');
            formTitles.set({
                characters: '▓█▒░▓▒▓>▓░▓▒>/█>▓▒▓░▓▒░▓█▒░▓',
                speed: 120
            });
            formTitles.start();
            formTitles.reveal(3000);
        }
        
        // Efeitos de glitch em hover nos botões
        document.querySelectorAll('.submit-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.triggerButtonGlitch(btn);
            });
        });
    }

    triggerButtonGlitch(button) {
        if (!button || isLoading || button.disabled) return;
        
        const btnText = button.querySelector('.btn-text');
        if (!btnText) return;
        
        const originalText = btnText.textContent;
        const glitchChars = '█▓▒░▓█▒░▓▒▓>▓░▓▒>/█>▓▒▓░▓▒░▓█▒░▓';
        
        let iterations = 0;
        const maxIterations = 8;
        
        const glitchInterval = setInterval(() => {
            btnText.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (index < iterations) {
                        return originalText[index];
                    }
                    return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                })
                .join('');
            
            if (iterations >= originalText.length) {
                clearInterval(glitchInterval);
                btnText.textContent = originalText;
            }
            
            iterations += 0.5;
        }, 30);
    }

    checkExistingAuth() {
        // Verifica se usuário já está logado
        const token = this.getAuthToken();
        const isLoggedIn = this.getLoginStatus();
        
        if (token && isLoggedIn) {
            console.log('✅ Usuário já está logado, redirecionando...');
            this.showStatusMessage('Você já está logado!', 'info');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }

    // === FORM SWITCHING === //
    
    switchToRegister() {
        if (currentForm === 'register' || isLoading) return;
        
        console.log('🔄 Mudando para formulário de registro');
        
        this.signInContainer.classList.add('switching-out');
        
        setTimeout(() => {
            this.signInContainer.classList.remove('active', 'switching-out');
            this.signUpContainer.classList.add('switching-in', 'active');
            
            setTimeout(() => {
                this.signUpContainer.classList.remove('switching-in');
            }, 400);
        }, 200);
        
        currentForm = 'register';
        this.clearStatusMessages();
        
        // 🔧 CORREÇÃO: Re-valida o form de registro após switch
        setTimeout(() => {
            this.revalidateCurrentForm();
        }, 500);
    }

    switchToLogin() {
        if (currentForm === 'login' || isLoading) return;
        
        console.log('🔄 Mudando para formulário de login');
        
        this.signUpContainer.classList.add('switching-out');
        
        setTimeout(() => {
            this.signUpContainer.classList.remove('active', 'switching-out');
            this.signInContainer.classList.add('switching-in', 'active');
            
            setTimeout(() => {
                this.signInContainer.classList.remove('switching-in');
            }, 400);
        }, 200);
        
        currentForm = 'login';
        this.clearStatusMessages();
        
        // 🔧 CORREÇÃO: Re-valida o form de login após switch
        setTimeout(() => {
            this.revalidateCurrentForm();
        }, 500);
    }

    // 🔧 NOVA: Função para re-validar form atual
    revalidateCurrentForm() {
        console.log('🔧 Re-validando form atual:', currentForm);
        
        if (currentForm === 'login') {
            const username = document.getElementById('loginUsername');
            const password = document.getElementById('loginPassword');
            
            if (username) this.validateField('login', 'username', username.value);
            if (password) this.validateField('login', 'password', password.value);
        } else if (currentForm === 'register') {
            const username = document.getElementById('registerUsername');
            const email = document.getElementById('registerEmail');
            const password = document.getElementById('registerPassword');
            const terms = document.getElementById('terms-checkbox');
            
            if (username) this.validateField('register', 'username', username.value);
            if (email) this.validateField('register', 'email', email.value);
            if (password) this.validateField('register', 'password', password.value);
            if (terms) {
                this.validateField('register', 'terms', terms.checked);
                this.updateCheckboxState(terms);
            }
        }
    }

    // === AUTHENTICATION HANDLERS === //
    
    async handleLogin(event) {
        event.preventDefault();
        
        if (isLoading) return;
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            this.showStatusMessage('Por favor, preencha todos os campos', 'error');
            return;
        }
        
        console.log('🔐 Tentando fazer login para:', username);
        
        this.setLoadingState(true, 'Verificando credenciais...');
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    login: username,
                    password: password,
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.text().catch(() => 'Erro desconhecido');
                
                if (response.status === 401) {
                    throw new Error('Credenciais inválidas. Verifique seu usuário e senha.');
                } else if (response.status === 404) {
                    throw new Error('Usuário não encontrado.');
                } else {
                    throw new Error(`Erro no servidor: ${errorData}`);
                }
            }
            
            const data = await response.json();
            console.log('✅ Login realizado com sucesso:', data);
            
            // Armazena dados de autenticação
            this.storeAuthData(data.token, { username: username });
            
            // Integra com auth handler se disponível
            if (window.authHandler) {
                window.authHandler.forceLogin(data.token, { username: username });
            }
            
            this.showStatusMessage('Login realizado com sucesso!', 'success');
            
            // Efeito de sucesso
            this.triggerSuccessEffect();
            
            // Redireciona após delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            console.error('❌ Erro no login:', error);
            this.showStatusMessage(error.message, 'error');
            this.triggerErrorEffect();
        } finally {
            this.setLoadingState(false);
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        if (isLoading) return;
        
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const termsAccepted = document.getElementById('terms-checkbox').checked;
        
        console.log('🔧 Dados do registro:', {
            username,
            email: email ? 'preenchido' : 'vazio',
            password: password ? 'preenchido' : 'vazio',
            termsAccepted
        });
        
        if (!username || !email || !password) {
            this.showStatusMessage('Por favor, preencha todos os campos', 'error');
            return;
        }
        
        if (!termsAccepted) {
            this.showStatusMessage('Você deve aceitar os termos e condições', 'error');
            return;
        }
        
        console.log('📝 Tentando registrar usuário:', username);
        
        this.setLoadingState(true, 'Criando conta...');
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    login: username,
                    email: email,
                    password: password,
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.text().catch(() => 'Erro desconhecido');
                
                if (response.status === 409) {
                    throw new Error('Nome de usuário ou email já está em uso.');
                } else if (response.status === 400) {
                    throw new Error('Dados inválidos. Verifique as informações fornecidas.');
                } else {
                    throw new Error(`Erro no servidor: ${errorData}`);
                }
            }
            
            // 🔧 CORREÇÃO: Tratamento robusto da resposta do servidor
            let data = null;
            const contentType = response.headers.get('content-type');
            
            try {
                // Tenta ler a resposta como texto primeiro
                const responseText = await response.text();
                console.log('📄 Resposta bruta do servidor:', responseText);
                
                // Se há conteúdo e parece ser JSON, tenta fazer parse
                if (responseText.trim() !== '') {
                    if (contentType && contentType.includes('application/json')) {
                        data = JSON.parse(responseText);
                        console.log('✅ JSON da resposta parseado:', data);
                    } else {
                        console.log('📄 Resposta em texto simples:', responseText);
                    }
                } else {
                    console.log('📄 Resposta vazia do servidor (OK - usuário criado)');
                }
            } catch (parseError) {
                console.warn('⚠️ Não foi possível fazer parse da resposta como JSON, mas o registro foi bem-sucedido:', parseError.message);
                // Não é um erro crítico se o status da requisição foi 200
            }
            
            console.log('✅ Registro realizado com sucesso');
            
            // 🔧 CORREÇÃO: Mensagem de sucesso independente do formato da resposta
            this.showStatusMessage('Conta criada com sucesso! Redirecionando para login...', 'success');
            
            // Efeito de sucesso
            this.triggerSuccessEffect();
            
            // Limpa formulário
            this.registerForm.reset();
            
            // 🔧 CORREÇÃO: Reset do estado de validação
            formValidation.register = { username: false, email: false, password: false, terms: false };
            this.updateSubmitButtonState('register');
            
            // Muda para login após delay
            setTimeout(() => {
                this.switchToLogin();
                
                // Pré-preenche o username
                const loginUsername = document.getElementById('loginUsername');
                if (loginUsername) {
                    loginUsername.value = username;
                    loginUsername.dispatchEvent(new Event('input'));
                    this.updateLabelState(loginUsername);
                }
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erro no registro:', error);
            this.showStatusMessage(error.message, 'error');
            this.triggerErrorEffect();
        } finally {
            this.setLoadingState(false);
        }
    }

    // === UI STATE MANAGEMENT === //
    
    setLoadingState(loading, message = 'Processando...') {
        isLoading = loading;
        
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = message;
        }
        
        if (loading) {
            this.showLoadingOverlay();
            this.disableAllButtons();
        } else {
            this.hideLoadingOverlay();
            this.enableAllButtons();
        }
        
        // Atualiza estado dos botões de submit
        this.updateSubmitButtonState('login');
        this.updateSubmitButtonState('register');
    }

    showLoadingOverlay() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
            
            // Adiciona animação de entrada
            setTimeout(() => {
                this.loadingOverlay.style.opacity = '1';
            }, 10);
        }
    }

    hideLoadingOverlay() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.opacity = '0';
            
            setTimeout(() => {
                this.loadingOverlay.style.display = 'none';
            }, 300);
        }
    }

    disableAllButtons() {
        document.querySelectorAll('button, .switch-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.6';
        });
    }

    enableAllButtons() {
        document.querySelectorAll('button, .switch-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        });
        
        // Re-aplica estado de validação após reabilitar
        this.updateSubmitButtonState('login');
        this.updateSubmitButtonState('register');
    }

    // === STATUS MESSAGES === //
    
    showStatusMessage(message, type = 'info', duration = 5000) {
        if (!this.statusContainer) return;
        
        const statusMessage = document.createElement('div');
        statusMessage.className = `status-message ${type}`;
        statusMessage.textContent = message;
        
        this.statusContainer.appendChild(statusMessage);
        
        // Anima entrada
        setTimeout(() => {
            statusMessage.classList.add('show');
        }, 100);
        
        // Remove após duração
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

    clearStatusMessages() {
        if (this.statusContainer) {
            this.statusContainer.innerHTML = '';
        }
    }

    // === VISUAL EFFECTS === //
    
    triggerSuccessEffect() {
        // Efeito de flash verde
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(45deg, rgba(0, 255, 65, 0.3), rgba(0, 255, 255, 0.2));
            pointer-events: none;
            z-index: 9998;
            opacity: 0;
            animation: successFlash 0.6s ease-out;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
        }, 600);
        
        // Adiciona animação CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes successFlash {
                0% { opacity: 0; }
                50% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    triggerErrorEffect() {
        // Efeito de shake no wrapper
        if (this.authWrapper) {
            this.authWrapper.style.animation = 'errorShake 0.5s ease-in-out';
            
            setTimeout(() => {
                this.authWrapper.style.animation = '';
            }, 500);
        }
        
        // Adiciona animação CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes errorShake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
        `;
        document.head.appendChild(style);
    }

    // === STORAGE METHODS === //
    
    storeAuthData(token, userData) {
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
        
        // Fallback to memory storage
        window.authData = {
            token: token,
            loggedIn: true,
            userData: userData,
            timestamp: Date.now()
        };
    }

    getAuthToken() {
        try {
            if (typeof Storage !== "undefined") {
                const token = localStorage.getItem('token');
                if (token) return token;
            }
        } catch (e) {
            console.warn('localStorage not available');
        }
        
        return window.authData ? window.authData.token : null;
    }

    getLoginStatus() {
        try {
            if (typeof Storage !== "undefined") {
                const status = localStorage.getItem('loggedIn');
                if (status) return status === 'true';
            }
        } catch (e) {
            console.warn('localStorage not available');
        }
        
        return window.authData ? window.authData.loggedIn : false;
    }
}

// === INITIALIZATION === //

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 === PÁGINA DE LOGIN CARREGADA ===');
    console.log('🏠 DOM ready - iniciando configuração avançada');
    
    // Aguarda outros scripts carregarem
    setTimeout(() => {
        window.enhancedLoginController = new EnhancedLoginController();
        
        // 🔧 CORREÇÃO: Debug inicial do estado do checkbox
        const termsCheckbox = document.getElementById('terms-checkbox');
        if (termsCheckbox) {
            console.log('🔧 Estado inicial do checkbox:', termsCheckbox.checked);
            console.log('🔧 Validação inicial dos termos:', formValidation.register.terms);
        }
    }, 500);
    
    // Configurações de página específicas
    document.body.classList.add('login-page');
    
    // Easter egg: Konami code para efeitos especiais
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.code);
        konamiCode = konamiCode.slice(-konamiSequence.length);
        
        if (konamiCode.join('') === konamiSequence.join('')) {
            console.log('🎮 Konami Code ativado!');
            document.body.classList.add('konami-mode');
            
            // Adiciona efeitos especiais
            const style = document.createElement('style');
            style.textContent = `
                .konami-mode .terminal-form {
                    animation: konamiGlow 0.5s infinite alternate !important;
                }
                
                @keyframes konamiGlow {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    });
    
    console.log('🔐 === CONFIGURAÇÃO INICIAL COMPLETA ===');
});

// === GLOBAL FUNCTIONS === //

// Função para integração com outros sistemas
window.forceLoginRedirect = function(message = 'Login necessário') {
    if (window.enhancedLoginController) {
        window.enhancedLoginController.showStatusMessage(message, 'info');
    }
};

// 🔧 NOVA: Função de debug
window.loginDebug = {
    switchForm: (formType) => {
        if (window.enhancedLoginController) {
            if (formType === 'register') {
                window.enhancedLoginController.switchToRegister();
            } else {
                window.enhancedLoginController.switchToLogin();
            }
        }
    },
    simulateError: () => {
        if (window.enhancedLoginController) {
            window.enhancedLoginController.showStatusMessage('Erro de teste', 'error');
            window.enhancedLoginController.triggerErrorEffect();
        }
    },
    simulateSuccess: () => {
        if (window.enhancedLoginController) {
            window.enhancedLoginController.showStatusMessage('Sucesso de teste', 'success');
            window.enhancedLoginController.triggerSuccessEffect();
        }
    },
    // 🔧 NOVA: Debug do checkbox
    checkboxStatus: () => {
        const checkbox = document.getElementById('terms-checkbox');
        console.log('🔧 Checkbox Debug:', {
            checked: checkbox?.checked,
            validation: formValidation.register.terms,
            formValid: Object.values(formValidation.register).every(v => v)
        });
    },
    // 🔧 NOVA: Força validação do checkbox
    forceCheckboxValidation: () => {
        const checkbox = document.getElementById('terms-checkbox');
        if (checkbox && window.enhancedLoginController) {
            window.enhancedLoginController.validateField('register', 'terms', checkbox.checked);
            window.enhancedLoginController.updateCheckboxState(checkbox);
        }
    }
};

console.log('🔐 Enhanced Login.js carregado completamente - VERSÃO CORRIGIDA');
console.log('🌐 API Base URL:', API_BASE_URL);
console.log('💡 Debug functions available: loginDebug.*');