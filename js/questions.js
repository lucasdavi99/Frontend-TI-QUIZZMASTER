let pontuacao = 0;
fetch('js/arquivo.json')
  .then(response => response.json())
  .then(data => {
    let questions = data;
    let shuffledQuestions = shuffleArray(questions); // Embaralha a ordem das perguntas
    let currentQuestionIndex = 0;
    const totalQuestions = shuffledQuestions.length;

    function shuffleArray(array) {
      // Função para embaralhar um array utilizando o algoritmo Fisher-Yates
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    function showQuestion(index) {
      const question = shuffledQuestions[index];
      const shuffledAnswers = shuffleArray(question.respostas); // Embaralha a ordem das respostas
      document.getElementById('answer_a').textContent = shuffledAnswers[0];
      document.getElementById('answer_b').textContent = shuffledAnswers[1];
      document.getElementById('answer_c').textContent = shuffledAnswers[2];
      document.getElementById('answer_d').textContent = shuffledAnswers[3];
      document.getElementById('Questao').textContent = question.pergunta;
      return question;
    }

    function handleAnswerSelection(userAnswer) {
      const question = shuffledQuestions[currentQuestionIndex];
      const correctAnswer = question.resposta_correta;

      if (userAnswer === correctAnswer) {
        currentQuestionIndex++;
        pontuacao+=100;
      } else {
        showModal('Sua pontuação foi ' + pontuacao); //+ ' |||' +'  Resposta certa:' + correctAnswer);
        currentQuestionIndex = 0; // Volta para a primeira questão se errar
      }

      if (currentQuestionIndex < totalQuestions) {
        showQuestion(currentQuestionIndex);
      } else {
        showModal('Fim do questionário. Parabéns!' + '|||' + 'Sua pontuação foi ' + pontuacao);
        // Ou exibir a mensagem de fim do questionário em um elemento HTML
      }
    }

    showQuestion(currentQuestionIndex);

    const answerElements = document.querySelectorAll('.box');

    answerElements.forEach((element, index) => {
      element.addEventListener('click', () => {
        var userAnswer = shuffledQuestions[currentQuestionIndex].respostas[index];
        handleAnswerSelection(userAnswer);
      });
    });
  })
  .catch(error => console.error(error));


  
