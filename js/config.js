/**
 * CONFIGURATION MANAGER - T.I QUIZZMASTER
 * Configuração centralizada para toda a aplicação
 */

// Detecta automaticamente o ambiente
function detectEnvironment() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // Ambiente de desenvolvimento local
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
        return 'development';
    }
    
    // Ambiente de staging (se houver)
    if (hostname.includes('staging') || hostname.includes('test')) {
        return 'staging';
    }
    
    // Ambiente de produção
    return 'production';
}

// Configurações por ambiente
const ENVIRONMENT_CONFIG = {
    development: {
        API_BASE_URL: 'http://localhost:8080',
        DEBUG: true,
        API_TIMEOUT: 10000,
        ENABLE_MOCK_DATA: true
    },
    staging: {
        API_BASE_URL: 'https://api-staging.tisuizzmaster.com', // Substitua pela URL real
        DEBUG: true,
        API_TIMEOUT: 15000,
        ENABLE_MOCK_DATA: false
    },
    production: {
        API_BASE_URL: 'https://api.tisuizzmaster.com', // Substitua pela URL real de produção
        DEBUG: false,
        API_TIMEOUT: 20000,
        ENABLE_MOCK_DATA: false
    }
};

// Detecta o ambiente atual
const CURRENT_ENVIRONMENT = detectEnvironment();
const ENV_CONFIG = ENVIRONMENT_CONFIG[CURRENT_ENVIRONMENT];

// Configuração principal da aplicação
const CONFIG = {
    // Configurações de ambiente
    ENVIRONMENT: CURRENT_ENVIRONMENT,
    API_BASE_URL: ENV_CONFIG.API_BASE_URL,
    DEBUG: ENV_CONFIG.DEBUG,
    API_TIMEOUT: ENV_CONFIG.API_TIMEOUT,
    ENABLE_MOCK_DATA: ENV_CONFIG.ENABLE_MOCK_DATA,
    
    // Configurações do quiz
    QUESTIONS_PER_SESSION: 10,
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    
    // Configurações de UI
    ANIMATION_DURATION: 300,
    NOTIFICATION_DURATION: 5000,
    AUTO_LOGOUT_TIME: 30 * 60 * 1000, // 30 minutos
    
    // Configurações de autenticação
    TOKEN_STORAGE_KEY: 'token',
    LOGIN_STATUS_KEY: 'loggedIn',
    USER_DATA_KEY: 'userData',
    
    // Configurações de ranking e histórico
    RANKING_PAGE_SIZE: 50,
    HISTORY_PAGE_SIZE: 12,
    AUTO_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutos
    
    // Configurações de performance
    ENABLE_ANALYTICS: false,
    ENABLE_ERROR_REPORTING: false,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
    
    // URLs de endpoints (será concatenado com API_BASE_URL)
    ENDPOINTS: {
        // Autenticação
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        
        // Quiz
        START_SESSION: '/api/quiz-session/start',
        SUBMIT_ANSWER: '/api/quiz-session/{sessionId}/answer',
        GET_HISTORY: '/api/quiz-session/history',
        
        // Ranking e Estatísticas
        RANKING: '/api/scores/ranking',
        GLOBAL_STATS: '/api/scores/stats',
        USER_STATS: '/api/scores/my-stats',
        
        // Perfil
        PROFILE_INFO: '/api/profile/me',
        PROFILE_STATS: '/api/profile/stats',
        UPDATE_USERNAME: '/api/profile/username',
        UPDATE_PASSWORD: '/api/profile/password',
        DELETE_ACCOUNT: '/api/profile/account'
    },
    
    // Configurações de aparência
    THEME: {
        PRIMARY_COLOR: '#00ff41',
        SECONDARY_COLOR: '#00d300',
        ERROR_COLOR: '#ff0040',
        WARNING_COLOR: '#ffff00',
        INFO_COLOR: '#00ffff'
    }
};

// Função para obter URL completa do endpoint
CONFIG.getEndpointURL = function(endpointKey, params = {}) {
    let endpoint = this.ENDPOINTS[endpointKey];
    
    if (!endpoint) {
        console.error(`Endpoint '${endpointKey}' não encontrado`);
        return this.API_BASE_URL;
    }
    
    // Substitui parâmetros na URL (ex: {sessionId} -> 123)
    Object.keys(params).forEach(key => {
        endpoint = endpoint.replace(`{${key}}`, params[key]);
    });
    
    return this.API_BASE_URL + endpoint;
};

// Função para logging condicional baseado no ambiente
CONFIG.log = function(message, type = 'info', data = null) {
    if (!this.DEBUG) return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.ENVIRONMENT.toUpperCase()}]`;
    
    switch (type) {
        case 'error':
            console.error(`${prefix} ERROR:`, message, data || '');
            break;
        case 'warn':
            console.warn(`${prefix} WARN:`, message, data || '');
            break;
        case 'debug':
            console.debug(`${prefix} DEBUG:`, message, data || '');
            break;
        default:
            console.log(`${prefix} INFO:`, message, data || '');
    }
};

// Função para override de configurações (útil para testes)
CONFIG.override = function(overrides) {
    Object.assign(this, overrides);
    this.log('Configurações sobrescritas', 'debug', overrides);
};

// Função para validar configuração
CONFIG.validate = function() {
    const requiredFields = ['API_BASE_URL', 'ENVIRONMENT'];
    const missing = requiredFields.filter(field => !this[field]);
    
    if (missing.length > 0) {
        console.error('Configurações obrigatórias ausentes:', missing);
        return false;
    }
    
    // Valida URL da API
    try {
        new URL(this.API_BASE_URL);
    } catch (error) {
        console.error('URL da API inválida:', this.API_BASE_URL);
        return false;
    }
    
    return true;
};

// Função para obter informações do ambiente
CONFIG.getEnvironmentInfo = function() {
    return {
        environment: this.ENVIRONMENT,
        apiBaseUrl: this.API_BASE_URL,
        debug: this.DEBUG,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
    };
};

// Inicialização
(function initializeConfig() {
    // Valida configuração
    if (!CONFIG.validate()) {
        console.error('❌ Falha na validação da configuração');
        return;
    }
    
    // Log de inicialização
    CONFIG.log('🔧 Sistema de configuração inicializado', 'info', {
        environment: CONFIG.ENVIRONMENT,
        apiUrl: CONFIG.API_BASE_URL,
        debug: CONFIG.DEBUG
    });
    
    // Expõe informações do ambiente no console em modo debug
    if (CONFIG.DEBUG) {
        console.table(CONFIG.getEnvironmentInfo());
        
        // Adiciona função de debug global
        window.CONFIG_DEBUG = {
            showConfig: () => console.table(CONFIG),
            showEndpoints: () => console.table(CONFIG.ENDPOINTS),
            testEndpoint: (key, params) => console.log(CONFIG.getEndpointURL(key, params)),
            override: (overrides) => CONFIG.override(overrides)
        };
        
        console.log('💡 Debug functions available: CONFIG_DEBUG.*');
    }
    
    // Warning para ambiente de produção
    if (CONFIG.ENVIRONMENT === 'production' && CONFIG.DEBUG) {
        console.warn('⚠️ DEBUG está ativado em produção!');
    }
    
    // Freeze objeto para prevenir modificações acidentais
    // (exceto pela função override para casos especiais)
    Object.freeze(CONFIG.ENDPOINTS);
    Object.freeze(CONFIG.THEME);
})();

// Compatibilidade para navegadores antigos
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// Export para módulos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

console.log('🔧 Config.js carregado - Ambiente:', CONFIG.ENVIRONMENT, '| API:', CONFIG.API_BASE_URL);