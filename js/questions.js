let pontuacao = 0;
let currentQuestionIndex = 0;
let shuffledQuestions = [];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function loadQuestionsFromAPI() {
    fetch('https://quizzmaster-a405941b4ff4.herokuapp.com/api/questions')
        .then(response => response.json())
        .then(data => {
            shuffledQuestions = shuffleArray(data);
            showQuestion(currentQuestionIndex);
        })
        .catch(error => console.error('Erro ao buscar as perguntas:', error));
}

function showQuestion(index) {
    if (index < shuffledQuestions.length) {
        const question = shuffledQuestions[index];
        const shuffledAnswers = shuffleArray(question.answers);
        document.getElementById('answer_a').textContent = shuffledAnswers[0].content;
        document.getElementById('answer_b').textContent = shuffledAnswers[1].content;
        document.getElementById('answer_c').textContent = shuffledAnswers[2].content;
        document.getElementById('answer_d').textContent = shuffledAnswers[3].content;
        document.getElementById('Questao').textContent = question.content;
    } else {
        showModal('Fim do questionário. Parabéns! Sua pontuação foi ' + pontuacao);
    }
}

function handleAnswerSelection(selectedIndex) {
    if (currentQuestionIndex >= shuffledQuestions.length) {
        showModal('Fim do questionário. Parabéns! Sua pontuação foi ' + pontuacao);
        return;
    }

    const question = shuffledQuestions[currentQuestionIndex];
    if (!question || !question.answers) {
        console.error('Erro: Pergunta ou respostas não definidas.');
        return;
    }

    const selectedAnswer = question.answers[selectedIndex];
    if (!selectedAnswer) {
        console.error('Erro: Resposta selecionada não definida.');
        return;
    }

    if (!selectedAnswer.isCorrect) {
        const score = {
            user: localStorage.getItem('user'),
            points: pontuacao
        };

        const scoreId = localStorage.getItem('scoreId');
        
        if (scoreId === null || scoreId === 'undefined') {
            fetch('https://quizzmaster-a405941b4ff4.herokuapp.com/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(score)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Score saved:', data);
                if (data.points !== undefined) {
                    pontuacao = data.points; 
                }
                showModal('Resposta errada. O questionário terminou. Sua pontuação final foi ' + pontuacao);
                if (data.id !== undefined) {
                    localStorage.setItem('scoreId', data.id);
                }
            })
            .catch(error => console.error('Error:', error));
        } else {
            fetch(`https://quizzmaster-a405941b4ff4.herokuapp.com/api/scores/${scoreId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(score)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Score updated:', data);
                if (data.points !== undefined) {
                    pontuacao = data.points; 
                }
                showModal('Resposta errada. O questionário terminou. Sua pontuação final foi ' + pontuacao);
            })
            .catch(error => console.error('Error:', error));
        }

        return;
    }

    pontuacao += 10;
    currentQuestionIndex++;
    if (currentQuestionIndex < shuffledQuestions.length) {
        showModal('Fim do questionário. Parabéns! Sua pontuação foi ' + pontuacao);
        return;
    }
    showQuestion(currentQuestionIndex);
}

document.addEventListener("DOMContentLoaded", function () {
    loadQuestionsFromAPI();

    const answerElements = document.querySelectorAll('.box');
    answerElements.forEach((element, index) => {
        element.addEventListener('click', () => {
            handleAnswerSelection(index);
        });
    });
});
