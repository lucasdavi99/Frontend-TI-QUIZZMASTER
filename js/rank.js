// Função para carregar os dados do ranking
function loadRankingData() {
    fetch('https://quizzmaster-a405941b4ff4.herokuapp.com/api/scores')
        .then(response => response.json())
        .then(data => {
            renderRankingTable(data);
        })
        .catch(error => console.error('Erro ao carregar os dados do ranking:', error));
}

// Função para renderizar a tabela de ranking
function renderRankingTable(scores) {
    const tableBody = document.querySelector('#table tbody');

    // Limpa o conteúdo atual da tabela
    tableBody.innerHTML = '';

    // Ordena os scores em ordem decrescente de pontos
    scores.sort((a, b) => b.points - a.points);

    // Itera sobre os top 10 scores para criar as linhas da tabela
    for (let i = 0; i < Math.min(scores.length, 10); i++) {
        const score = scores[i];
        const position = i + 1;
        const row = document.createElement('tr');

        // Adiciona a classe de destaque para as primeiras posições
        if (position <= 10) {
            row.classList.add('highlighted-row');
        }

        // Verifica se score.user está definido antes de acessar a propriedade username
        const username = score.user ? score.user.username : 'Usuário Não Definido';

        row.innerHTML = `
            <td>${position}º</td>
            <td>${username}</td>
            <td>${score.points}</td>
        `;

        tableBody.appendChild(row);
    }
}


// Função para inicializar a página
function initializePage() {
    loadRankingData();
}

// Chama a função de inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializePage);
