const apiUrl = 'https://quizapi.io/api/v1/questions';
const apiKey = 'hTazyFwBaqDrXelIIggjAtGtjNl3piVhpk2GZtzG';
const category = 'linux';
const difficulty = 'Hard';
const limit = 10;

const requestUrl = `${apiUrl}?apiKey=${apiKey}&category=${category}&difficulty=${difficulty}&limit=${limit}`;

fetch(requestUrl)
  .then(response => response.json())
  .then(data => {
    const answers = data[0].answers; // assume que as respostas estão na primeira questão
    document.getElementById('answer_a').textContent = answers.answer_a;
    document.getElementById('answer_b').textContent = answers.answer_b;
    document.getElementById('answer_c').textContent = answers.answer_c;
    document.getElementById('answer_d').textContent = answers.answer_d;

    const pergunta = data [0].question;
    const question = data [0];

    console.log("pergunta = " + pergunta)
    console.log(question)
    
    document.getElementById('Questao').textContent = pergunta;
    
  
    const englishText = "Hello, how are you?";
    const utterance = new SpeechSynthesisUtterance(englishText);
    utterance.lang = 'en-US'; // Define o idioma de origem para inglês dos EUA
    speechSynthesis.speak(utterance); // Fala o texto em inglês
    utterance.lang = 'pt-BR'; // Define o idioma de destino para português do Brasil
    bla = speechSynthesis.speak(utterance); // Fala o texto em português

    console.log(utterance.text)


    var correctAnswer = question.correct_answer;
    console.log(question.correct_answer);
    
    
    const answerElements = document.querySelectorAll('.box');


    answerElements.forEach(element => {
      element.addEventListener('click', () => {
        // const userAnswer = element.textContent.toLowerCase();
        var userAnswer = element.id
        console.log("user = " + element.id)
        console.log("resposta certa = " + correctAnswer)
        if (userAnswer == correctAnswer) {
          alert('Resposta correta! Você acertou!')
          console.log('Resposta correta! Você acertou!');
          // ou exibir a mensagem em um elemento HTML:
        } else {
          alert('Infelizmente você erroooou! Tente novamente.')
          console.log('Resposta incorreta!, burro pra klr');
          // faça algo para mostrar a resposta correta e/ou permitir que o usuário tente novamente
        }
      });
    });
  })
  .catch(error => console.error(error));