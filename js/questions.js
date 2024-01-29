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
    fetch('https://api-tiquizzmaster-production.up.railway.app/api/questions/api/questions')
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
    const question = shuffledQuestions[currentQuestionIndex];
    const correctAnswerIndex = question.answers.findIndex(answer => answer.isCorrect);

    if (selectedIndex === correctAnswerIndex) {
        pontuacao += 100;
        currentQuestionIndex++;
    } else {
        showModal('Sua pontuação foi ' + pontuacao);
        currentQuestionIndex = 0;
        pontuacao = 0;
    }

    showQuestion(currentQuestionIndex);
}

document.addEventListener("DOMContentLoaded", function() {
    loadQuestionsFromAPI();

    const answerElements = document.querySelectorAll('.box');
    answerElements.forEach((element, index) => {
        element.addEventListener('click', () => {
            handleAnswerSelection(index);
        });
    });
});