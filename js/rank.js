const API_BASE_URL = 'http://localhost:8080';

async function loadRankingData() {
    try {
        const token = localStorage.getItem('token');
        
        // Se tiver token, busca o histórico do usuário
        if (token) {
            const response = await fetch(`${API_BASE_URL}/api/quiz-session/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const history = await response.json();
                renderUserHistory(history);
            }
        }
        
        // Buscar ranking global (você precisaria criar este endpoint)
        // Por enquanto, você pode usar o endpoint de scores existente
        const scoresResponse = await fetch(`${API_BASE_URL}/api/scores`);
        if (scoresResponse.ok) {
            const scores = await scoresResponse.json();
            renderRankingTable(scores);
        }
        
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
    }
}

function renderUserHistory(history) {
    // Criar uma seção para mostrar o histórico pessoal do usuário
    const historyContainer = document.getElementById('user-history');
    if (!historyContainer) return;
    
    historyContainer.innerHTML = '<h2>Seu Histórico</h2>';
    
    history.forEach((session, index) => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'history-item';
        sessionDiv.innerHTML = `
            <p>Sessão ${index + 1}</p>
            <p>Pontuação: ${session.finalScore}/${session.totalQuestions * 10}</p>
            <p>Status: ${session.wasCompleted ? 'Completado' : 'Interrompido'}</p>
            <p>Data: ${new Date(session.createdAt).toLocaleDateString('pt-BR')}</p>
        `;
        historyContainer.appendChild(sessionDiv);
    });
}