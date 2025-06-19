/**
 * LOGIN CONTROLLER - T.I QUIZZMASTER
 * Sistema completo de autenticação com reset de senha
 */

CONFIG.log('🔐 Login.js carregado - versão completa com reset de senha v5.0', 'info');

// Estado global da página
let currentForm = 'login'; // Possíveis valores: 'login', 'register', 'forgot', 'reset'
let isLoading = false;
let resetEmail = ''; // Armazena email para o processo de reset
let codeExpiryTimer = null;

let formValidation = {
    login: { username: false, password: false },
    register: { username: false, email: false, password: false, terms: false },
    forgot: { email: false },
    reset: { token: false, newPassword: false, confirmPassword: false }
};

class EnhancedLoginController {
    constructor() {
        this.loginForm = null;
        this.registerForm = null;
        this.forgotPasswordForm = null;
        this.resetPasswordForm = null;
        this.authWrapper = null;
        this.statusContainer = null;
        this.loadingOverlay = null;
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
        this.checkUrlParameters();

        this.isInitialized = true;
        CONFIG.log('Enhanced Login Controller initialized', 'info');
    }

    setupElements() {
        // Formulários principais
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.forgotPasswordForm = document.getElementById('forgotPasswordForm');
        this.resetPasswordForm = document.getElementById('resetPasswordForm');

        this.authWrapper = document.getElementById('auth-wrapper');
        this.statusContainer = document.getElementById('status-container');
        this.loadingOverlay = document.getElementById('loading-overlay');

        // Form containers
        this.signInContainer = document.getElementById('sign-in-container');
        this.signUpContainer = document.getElementById('sign-up-container');
        this.forgotPasswordContainer = document.getElementById('forgot-password-container');
        this.resetPasswordContainer = document.getElementById('reset-password-container');

        // Switch buttons - login/register
        this.showRegisterBtn = document.getElementById('show-register');
        this.showLoginBtn = document.getElementById('show-login');

        // Switch buttons - reset de senha
        this.showForgotPasswordBtn = document.getElementById('show-forgot-password');
        this.showLoginFromForgotBtn = document.getElementById('show-login-from-forgot');
        this.showLoginFromResetBtn = document.getElementById('show-login-from-reset');
        this.resendCodeBtn = document.getElementById('resend-code');

        CONFIG.log('Elementos configurados', 'debug');
    }

    setupEventListeners() {
        // Form submissions
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        if (this.forgotPasswordForm) {
            this.forgotPasswordForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        }

        if (this.resetPasswordForm) {
            this.resetPasswordForm.addEventListener('submit', (e) => this.handleResetPassword(e));
        }

        // Form switching - original
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

        // Form switching - reset de senha
        if (this.showForgotPasswordBtn) {
            this.showForgotPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToForgotPassword();
            });
        }

        if (this.showLoginFromForgotBtn) {
            this.showLoginFromForgotBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToLogin();
            });
        }

        if (this.showLoginFromResetBtn) {
            this.showLoginFromResetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToLogin();
            });
        }

        if (this.resendCodeBtn) {
            this.resendCodeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resendResetCode();
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

        CONFIG.log('Event listeners configurados', 'debug');
    }

    setupInputValidation() {
        // Login form validation
        const loginUsername = document.getElementById('loginUsername');
        const loginPassword = document.getElementById('loginPassword');

        if (loginUsername) {
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
            termsCheckbox.addEventListener('change', (e) => {
                CONFIG.log('Checkbox changed', 'debug', e.target.checked);
                this.validateField('register', 'terms', e.target.checked);
                this.updateCheckboxState(termsCheckbox);
            });

            termsCheckbox.addEventListener('click', (e) => {
                CONFIG.log('Checkbox clicked', 'debug', e.target.checked);
                setTimeout(() => {
                    this.validateField('register', 'terms', e.target.checked);
                    this.updateCheckboxState(termsCheckbox);
                }, 50);
            });

            const checkboxLabel = termsCheckbox.closest('.checkbox-label');
            if (checkboxLabel) {
                checkboxLabel.addEventListener('click', (e) => {
                    if (e.target === termsCheckbox) return;

                    termsCheckbox.checked = !termsCheckbox.checked;
                    CONFIG.log('Label clicked, checkbox now', 'debug', termsCheckbox.checked);

                    this.validateField('register', 'terms', termsCheckbox.checked);
                    this.updateCheckboxState(termsCheckbox);
                });
            }
        }

        // 🔐 NOVO: Forgot password validation
        this.setupForgotPasswordValidation();

        // 🔐 NOVO: Reset password validation
        this.setupResetPasswordValidation();
    }

    // 🔐 NOVO: Setup validation para forgot password
    setupForgotPasswordValidation() {
        const emailInput = document.getElementById('forgotEmail');
        const submitBtn = document.getElementById('forgot-submit');

        if (emailInput && submitBtn) {
            const validateEmail = () => {
                const email = emailInput.value.trim();
                const isValid = this.isValidEmail(email);
                console.log('Validando email forgot:', email, 'válido:', isValid); // Debug
                this.validateField('forgot', 'email', isValid);
                this.updateLabelState(emailInput);
            };

            emailInput.addEventListener('input', validateEmail);
            emailInput.addEventListener('blur', validateEmail);
            emailInput.addEventListener('change', validateEmail);
            emailInput.addEventListener('keyup', validateEmail); // Adicional

            validateEmail(); // Validação inicial
        }
    }

    // 🔐 NOVO: Setup validation para reset password
    setupResetPasswordValidation() {
        const tokenInput = document.getElementById('resetToken');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmNewPassword');

        if (tokenInput) {
            const validateToken = () => {
                const isValid = /^\d{6}$/.test(tokenInput.value.trim());
                this.validateField('reset', 'token', isValid);
                this.updateLabelState(tokenInput);
            };

            tokenInput.addEventListener('input', validateToken);
            tokenInput.addEventListener('blur', validateToken);
        }

        if (newPasswordInput) {
            const validateNewPassword = () => {
                const isValid = newPasswordInput.value.length >= 6;
                this.validateField('reset', 'newPassword', isValid);
                this.updateLabelState(newPasswordInput);

                // Re-valida confirmação se existir
                if (confirmPasswordInput && confirmPasswordInput.value) {
                    const confirmValid = newPasswordInput.value === confirmPasswordInput.value && confirmPasswordInput.value.length >= 6;
                    this.validateField('reset', 'confirmPassword', confirmValid);
                }
            };

            newPasswordInput.addEventListener('input', validateNewPassword);
            newPasswordInput.addEventListener('blur', validateNewPassword);
        }

        if (confirmPasswordInput) {
            const validateConfirmPassword = () => {
                const newPassword = newPasswordInput ? newPasswordInput.value : '';
                const isValid = confirmPasswordInput.value === newPassword && confirmPasswordInput.value.length >= 6;
                this.validateField('reset', 'confirmPassword', isValid);
                this.updateLabelState(confirmPasswordInput);
            };

            confirmPasswordInput.addEventListener('input', validateConfirmPassword);
            confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
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

    updateCheckboxState(checkbox) {
        const label = checkbox.closest('.checkbox-label');
        if (label) {
            if (checkbox.checked) {
                label.classList.add('active');
                CONFIG.log('Checkbox label ativado', 'debug');
            } else {
                label.classList.remove('active');
                CONFIG.log('Checkbox label desativado', 'debug');
            }
        }
    }

    validateField(formType, fieldName, value) {
        let isValid = false;

        CONFIG.log(`Validando ${formType}.${fieldName}`, 'debug', value);

        switch (fieldName) {
            case 'username':
                isValid = typeof value === 'string' && value.length >= 3 && value.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(value);
                break;
            case 'email':
                // 🔧 CORREÇÃO: Melhor validação para email
                if (typeof value === 'boolean') {
                    isValid = value;
                } else {
                    isValid = typeof value === 'string' && this.isValidEmail(value);
                }
                break;
            case 'password':
                isValid = typeof value === 'string' && value.length >= 6;
                break;
            case 'terms':
                isValid = value === true;
                break;
            case 'token':
                isValid = value === true;
                break;
            case 'newPassword':
                isValid = value === true;
                break;
            case 'confirmPassword':
                isValid = value === true;
                break;
        }

        CONFIG.log(`Resultado da validação ${formType}.${fieldName}`, 'debug', isValid);

        formValidation[formType][fieldName] = isValid;
        this.updateSubmitButtonState(formType);

        return isValid;
    }

    updateSubmitButtonState(formType) {
        const validationState = formValidation[formType];
        const isFormValid = Object.values(validationState).every(valid => valid);

        CONFIG.log(`Estado da validação ${formType}`, 'debug', validationState);
        CONFIG.log(`Form ${formType} válido`, 'debug', isFormValid);

        let submitBtn;
        switch (formType) {
            case 'login':
                submitBtn = document.getElementById('login-submit');
                break;
            case 'register':
                submitBtn = document.getElementById('register-submit');
                break;
            case 'forgot':
                submitBtn = document.getElementById('forgot-submit');
                break;
            case 'reset':
                submitBtn = document.getElementById('reset-submit');
                break;
        }

        if (submitBtn) {
            submitBtn.disabled = !isFormValid || isLoading;

            if (isFormValid && !isLoading) {
                submitBtn.classList.add('valid');
                submitBtn.classList.remove('disabled');
                CONFIG.log(`Botão ${formType} habilitado`, 'debug');
            } else {
                submitBtn.classList.remove('valid');
                submitBtn.classList.add('disabled');
                CONFIG.log(`Botão ${formType} desabilitado`, 'debug');
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

            const formTitles = baffle('.form-title');
            formTitles.set({
                characters: '▓█▒░▓▒▓>▓░▓▒>/█>▓▒▓░▓▒░▓█▒░▓',
                speed: 120
            });
            formTitles.start();
            formTitles.reveal(3000);
        }

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
        const token = this.getAuthToken();
        const isLoggedIn = this.getLoginStatus();

        if (token && isLoggedIn) {
            CONFIG.log('Usuário já está logado, redirecionando', 'info');
            this.showStatusMessage('Você já está logado!', 'info');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }

    // 🔐 NOVO: Verifica parâmetros da URL
    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const reason = urlParams.get('reason');

        if (reason === 'username_changed') {
            this.showStatusMessage('Username alterado com sucesso! Faça login com seu novo nome.', 'info');
        } else if (reason === 'password_changed') {
            this.showStatusMessage('Senha alterada com sucesso! Faça login com sua nova senha.', 'info');
        }
    }

    // === FORM SWITCHING === //

    switchToRegister() {
        if (currentForm === 'register' || isLoading) return;

        CONFIG.log('Mudando para formulário de registro', 'info');

        this.hideAllForms();
        this.signUpContainer.classList.add('switching-in', 'active');

        setTimeout(() => {
            this.signUpContainer.classList.remove('switching-in');
        }, 400);

        currentForm = 'register';
        this.clearStatusMessages();
        this.clearCodeExpiryTimer();

        setTimeout(() => {
            this.revalidateCurrentForm();
        }, 500);
    }

    switchToLogin() {
        if (currentForm === 'login' || isLoading) return;

        CONFIG.log('Mudando para formulário de login', 'info');

        this.hideAllForms();
        this.signInContainer.classList.add('switching-in', 'active');

        setTimeout(() => {
            this.signInContainer.classList.remove('switching-in');
        }, 400);

        currentForm = 'login';
        this.clearStatusMessages();
        this.clearCodeExpiryTimer();

        setTimeout(() => {
            this.revalidateCurrentForm();
        }, 500);
    }

    // 🔐 NOVO: Switch para forgot password
    switchToForgotPassword() {
        if (currentForm === 'forgot' || isLoading) return;

        CONFIG.log('Mudando para formulário de esqueci senha', 'info');

        this.hideAllForms();
        this.forgotPasswordContainer.classList.add('switching-in', 'active');

        setTimeout(() => {
            this.forgotPasswordContainer.classList.remove('switching-in');
        }, 400);

        currentForm = 'forgot';
        this.clearStatusMessages();
        this.clearCodeExpiryTimer();

        setTimeout(() => {
            this.setupForgotPasswordValidation();
        }, 500);
    }

    // 🔐 NOVO: Switch para reset password
    switchToResetPassword() {
        if (currentForm === 'reset' || isLoading) return;

        CONFIG.log('Mudando para formulário de redefinir senha', 'info');

        this.hideAllForms();
        this.resetPasswordContainer.classList.add('switching-in', 'active');

        setTimeout(() => {
            this.resetPasswordContainer.classList.remove('switching-in');
        }, 400);

        currentForm = 'reset';
        this.clearStatusMessages();

        setTimeout(() => {
            this.setupResetPasswordValidation();
            this.startCodeExpiryTimer();
        }, 500);
    }

    // 🔐 NOVO: Esconde todos os formulários
    hideAllForms() {
        [this.signInContainer, this.signUpContainer,
        this.forgotPasswordContainer, this.resetPasswordContainer].forEach(container => {
            if (container) {
                container.classList.remove('active', 'switching-in', 'switching-out');
            }
        });
    }

    revalidateCurrentForm() {
        CONFIG.log('Re-validando form atual', 'debug', currentForm);

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
        } else if (currentForm === 'forgot') {
            this.setupForgotPasswordValidation();
        } else if (currentForm === 'reset') {
            this.setupResetPasswordValidation();
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

        CONFIG.log('Tentando fazer login', 'info', { username });

        this.setLoadingState(true, 'Verificando credenciais...');

        try {
            const response = await fetch(CONFIG.getEndpointURL('LOGIN'), {
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
            CONFIG.log('Login realizado com sucesso', 'info', data);

            // Armazena dados de autenticação usando as chaves do config
            this.storeAuthData(data.token, { username: username });

            // Integra com auth handler se disponível
            if (window.authHandler) {
                window.authHandler.forceLogin(data.token, { username: username });
            }

            this.showStatusMessage('Login realizado com sucesso!', 'success');
            this.triggerSuccessEffect();

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            CONFIG.log('Erro no login', 'error', error);
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

        CONFIG.log('Dados do registro', 'debug', {
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

        CONFIG.log('Tentando registrar usuário', 'info', { username });

        this.setLoadingState(true, 'Criando conta...');

        try {
            const response = await fetch(CONFIG.getEndpointURL('REGISTER'), {
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

            let data = null;
            const contentType = response.headers.get('content-type');

            try {
                const responseText = await response.text();
                CONFIG.log('Resposta bruta do servidor', 'debug', responseText);

                if (responseText.trim() !== '') {
                    if (contentType && contentType.includes('application/json')) {
                        data = JSON.parse(responseText);
                        CONFIG.log('JSON da resposta parseado', 'debug', data);
                    } else {
                        CONFIG.log('Resposta em texto simples', 'debug', responseText);
                    }
                } else {
                    CONFIG.log('Resposta vazia do servidor (OK - usuário criado)', 'debug');
                }
            } catch (parseError) {
                CONFIG.log('Não foi possível fazer parse da resposta como JSON, mas o registro foi bem-sucedido', 'warn', parseError.message);
            }

            CONFIG.log('Registro realizado com sucesso', 'info');

            this.showStatusMessage('Conta criada com sucesso! Redirecionando para login...', 'success');
            this.triggerSuccessEffect();

            // Limpa formulário
            this.registerForm.reset();

            // Reset do estado de validação
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
            CONFIG.log('Erro no registro', 'error', error);
            this.showStatusMessage(error.message, 'error');
            this.triggerErrorEffect();
        } finally {
            this.setLoadingState(false);
        }
    }

    // 🔐 NOVO: Handle forgot password
    async handleForgotPassword(event) {
        event.preventDefault();

        if (isLoading) return;

        const email = document.getElementById('forgotEmail').value.trim();

        if (!email || !this.isValidEmail(email)) {
            this.showStatusMessage('Por favor, insira um email válido', 'error');
            return;
        }

        CONFIG.log('Solicitando reset de senha', 'info', { email });

        try {
            this.setLoadingState(true, 'Enviando código de recuperação...');

            const response = await fetch(CONFIG.getEndpointURL('FORGOT_PASSWORD'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao enviar código de recuperação');
            }

            CONFIG.log('Código enviado com sucesso', 'info', data);

            // Armazena email para próxima etapa
            resetEmail = email;

            this.showStatusMessage('📧 Código enviado! Verifique seu email.', 'success');

            // Muda para formulário de reset após delay
            setTimeout(() => {
                this.switchToResetPassword();
                this.showResetInstructions(email);
            }, 2000);

        } catch (error) {
            CONFIG.log('Erro ao solicitar reset', 'error', error);
            this.showStatusMessage(error.message, 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    // 🔐 NOVO: Handle reset password
    async handleResetPassword(event) {
        event.preventDefault();

        if (isLoading) return;

        const token = document.getElementById('resetToken').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;

        // Validações
        if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) {
            this.showStatusMessage('Código deve ter exatamente 6 dígitos', 'error');
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            this.showStatusMessage('Nova senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showStatusMessage('Senhas não coincidem', 'error');
            return;
        }

        CONFIG.log('Redefinindo senha com código', 'info');

        try {
            this.setLoadingState(true, 'Redefinindo senha...');

            const response = await fetch(CONFIG.getEndpointURL('RESET_PASSWORD'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: newPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao redefinir senha');
            }

            CONFIG.log('Senha redefinida com sucesso', 'info', data);

            this.showStatusMessage('🎉 Senha redefinida com sucesso!', 'success');
            this.triggerSuccessEffect();

            // Limpa formulário e volta para login
            this.resetPasswordForm.reset();
            this.clearCodeExpiryTimer();
            formValidation.reset = { token: false, newPassword: false, confirmPassword: false };

            setTimeout(() => {
                this.switchToLogin();

                // Pré-preenche email se possível
                if (resetEmail) {
                    const loginUsername = document.getElementById('loginUsername');
                    if (loginUsername) {
                        loginUsername.value = resetEmail.split('@')[0]; // Username baseado no email
                        this.updateLabelState(loginUsername);
                        this.validateField('login', 'username', loginUsername.value);
                    }
                }

                this.showStatusMessage('Faça login com sua nova senha', 'info');
            }, 2500);

        } catch (error) {
            CONFIG.log('Erro ao redefinir senha', 'error', error);
            this.showStatusMessage(error.message, 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    //Reenviar código
    async resendResetCode() {
        if (!resetEmail) {
            this.showStatusMessage('Email não encontrado. Volte e insira seu email novamente.', 'error');
            return;
        }

        CONFIG.log('Reenviando código de reset', 'info', { email: resetEmail });

        try {
            this.setLoadingState(true, 'Reenviando código...');

            const response = await fetch(CONFIG.getEndpointURL('FORGOT_PASSWORD'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: resetEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao reenviar código');
            }

            this.showStatusMessage('📧 Novo código enviado!', 'success');
            this.clearCodeExpiryTimer();
            this.startCodeExpiryTimer();

        } catch (error) {
            CONFIG.log('Erro ao reenviar código', 'error', error);
            this.showStatusMessage(error.message, 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    // Timer para expiração do código
    startCodeExpiryTimer() {
        this.clearCodeExpiryTimer();

        let timeLeft = 15 * 60; // 15 minutos em segundos

        // Adiciona timer display se não existir
        const timerContainer = document.querySelector('.reset-password-container .terminal-body');
        let timerElement = document.getElementById('code-timer');

        if (!timerElement && timerContainer) {
            timerElement = document.createElement('div');
            timerElement.id = 'code-timer';
            timerElement.className = 'code-timer';
            timerContainer.appendChild(timerElement);
        }

        const updateTimer = () => {
            if (timeLeft <= 0) {
                this.clearCodeExpiryTimer();
                if (timerElement) {
                    timerElement.className = 'code-timer expired';
                    timerElement.textContent = '⏰ Código expirado! Clique em "Reenviar Código"';
                }
                return;
            }

            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;

            if (timerElement) {
                timerElement.textContent = `⏱️ Código expira em: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            }

            timeLeft--;
        };

        updateTimer(); // Primeira execução
        codeExpiryTimer = setInterval(updateTimer, 1000);
    }

    clearCodeExpiryTimer() {
        if (codeExpiryTimer) {
            clearInterval(codeExpiryTimer);
            codeExpiryTimer = null;
        }

        const timerElement = document.getElementById('code-timer');
        if (timerElement) {
            timerElement.remove();
        }
    }

    // 🔐 NOVO: Validação de email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 🔐 NOVO: Instruções de reset
    showResetInstructions(email) {
        const resetBody = document.querySelector('.reset-password-container .terminal-body');

        if (!resetBody) return;

        // Remove instruções anteriores
        const existingInstructions = resetBody.querySelector('.reset-instructions');
        if (existingInstructions) {
            existingInstructions.remove();
        }

        const instructions = document.createElement('div');
        instructions.className = 'reset-instructions';
        instructions.innerHTML = `
            <strong>📧 Código enviado para:</strong> ${email}<br>
            <strong>⏰ Válido por:</strong> 15 minutos<br>
            <strong>📝 Verifique:</strong> Caixa de entrada e spam
        `;

        // Insere após a command line
        const commandLine = resetBody.querySelector('.command-line');
        if (commandLine) {
            commandLine.insertAdjacentElement('afterend', instructions);
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

        // Update all form button states
        this.updateSubmitButtonState('login');
        this.updateSubmitButtonState('register');
        this.updateSubmitButtonState('forgot');
        this.updateSubmitButtonState('reset');
    }

    showLoadingOverlay() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';

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
            }, CONFIG.ANIMATION_DURATION);
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

        // Re-validate all forms
        this.updateSubmitButtonState('login');
        this.updateSubmitButtonState('register');
        this.updateSubmitButtonState('forgot');
        this.updateSubmitButtonState('reset');
    }

    // === STATUS MESSAGES === //

    showStatusMessage(message, type = 'info', duration = CONFIG.NOTIFICATION_DURATION) {
        if (!this.statusContainer) return;

        const statusMessage = document.createElement('div');
        statusMessage.className = `status-message ${type}`;
        statusMessage.textContent = message;

        this.statusContainer.appendChild(statusMessage);

        setTimeout(() => {
            statusMessage.classList.add('show');
        }, 100);

        setTimeout(() => {
            statusMessage.classList.remove('show');

            setTimeout(() => {
                if (statusMessage.parentNode) {
                    statusMessage.remove();
                }
            }, 500);
        }, duration);

        CONFIG.log(`Status message (${type})`, 'info', message);
    }

    clearStatusMessages() {
        if (this.statusContainer) {
            this.statusContainer.innerHTML = '';
        }
    }

    // === VISUAL EFFECTS === //

    triggerSuccessEffect() {
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
        if (this.authWrapper) {
            this.authWrapper.style.animation = 'errorShake 0.5s ease-in-out';

            setTimeout(() => {
                this.authWrapper.style.animation = '';
            }, 500);
        }

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
                localStorage.setItem(CONFIG.TOKEN_STORAGE_KEY, token);
                localStorage.setItem(CONFIG.LOGIN_STATUS_KEY, 'true');
                localStorage.setItem(CONFIG.USER_DATA_KEY, JSON.stringify(userData));

                CONFIG.log('Dados de autenticação armazenados no localStorage', 'debug');
                return;
            }
        } catch (e) {
            CONFIG.log('localStorage não disponível, usando memory storage', 'warn', e);
        }

        // Fallback to memory storage
        window.authData = {
            token: token,
            loggedIn: true,
            userData: userData,
            timestamp: Date.now()
        };

        CONFIG.log('Dados de autenticação armazenados na memória', 'debug');
    }

    getAuthToken() {
        try {
            if (typeof Storage !== "undefined") {
                const token = localStorage.getItem(CONFIG.TOKEN_STORAGE_KEY);
                if (token) return token;
            }
        } catch (e) {
            CONFIG.log('Erro ao acessar localStorage', 'warn', e);
        }

        return window.authData ? window.authData.token : null;
    }

    getLoginStatus() {
        try {
            if (typeof Storage !== "undefined") {
                const status = localStorage.getItem(CONFIG.LOGIN_STATUS_KEY);
                if (status) return status === 'true';
            }
        } catch (e) {
            CONFIG.log('Erro ao acessar localStorage', 'warn', e);
        }

        return window.authData ? window.authData.loggedIn : false;
    }
}

// === INITIALIZATION === //

document.addEventListener('DOMContentLoaded', () => {
    CONFIG.log('Página de login carregada', 'info');

    // Aguarda outros scripts carregarem
    setTimeout(() => {
        window.enhancedLoginController = new EnhancedLoginController();

        // Debug inicial do estado do checkbox
        const termsCheckbox = document.getElementById('terms-checkbox');
        if (termsCheckbox) {
            CONFIG.log('Estado inicial do checkbox', 'debug', termsCheckbox.checked);
            CONFIG.log('Validação inicial dos termos', 'debug', formValidation.register.terms);
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
            CONFIG.log('Konami Code ativado!', 'info');
            document.body.classList.add('konami-mode');

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

    CONFIG.log('Configuração inicial completa', 'info');
});

// === GLOBAL FUNCTIONS === //

// Função para integração com outros sistemas
window.forceLoginRedirect = function (message = 'Login necessário') {
    if (window.enhancedLoginController) {
        window.enhancedLoginController.showStatusMessage(message, 'info');
    }
};

// Função de debug
window.loginDebug = {
    switchForm: (formType) => {
        if (window.enhancedLoginController) {
            switch (formType) {
                case 'register':
                    window.enhancedLoginController.switchToRegister();
                    break;
                case 'forgot':
                    window.enhancedLoginController.switchToForgotPassword();
                    break;
                case 'reset':
                    window.enhancedLoginController.switchToResetPassword();
                    break;
                default:
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
    testForgotPassword: () => {
        resetEmail = 'test@example.com';
        if (window.enhancedLoginController) {
            window.enhancedLoginController.switchToResetPassword();
            window.enhancedLoginController.showResetInstructions('test@example.com');
        }
    },
    checkboxStatus: () => {
        const checkbox = document.getElementById('terms-checkbox');
        CONFIG.log('Checkbox Debug', 'info', {
            checked: checkbox?.checked,
            validation: formValidation.register.terms,
            formValid: Object.values(formValidation.register).every(v => v)
        });
    },
    forceCheckboxValidation: () => {
        const checkbox = document.getElementById('terms-checkbox');
        if (checkbox && window.enhancedLoginController) {
            window.enhancedLoginController.validateField('register', 'terms', checkbox.checked);
            window.enhancedLoginController.updateCheckboxState(checkbox);
        }
    },
    showCurrentForm: () => {
        CONFIG.log('Formulário atual', 'info', currentForm);
        CONFIG.log('Estado de validação', 'info', formValidation);
    }
};

CONFIG.log('Enhanced Login.js carregado completamente', 'info');
CONFIG.log('API Base URL', 'info', CONFIG.API_BASE_URL);
CONFIG.log('Debug functions available: loginDebug.*', 'info');