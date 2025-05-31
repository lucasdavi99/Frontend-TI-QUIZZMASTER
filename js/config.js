const CONFIG = {
    API_BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' 
        : 'https://sua-api-producao.com',
    QUESTIONS_PER_SESSION: 10
};