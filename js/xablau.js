function teste(){
    console.log("aaaa")
    // fetch("./oarquivo.json")
    // .then(response => response.json())
    // .then(data => {
    //     console.log(data)
    //     // Faça algo com os dados do quiz, como exibir as perguntas e respostas na tela
    // });
    fetch('js/oarquivo.json')
  .then(response => response.json())
  .then(data => console.log("data"));
    
    
}

const quizContainer = document.getElementById('quiz');
const resultsContainer = document.getElementById('results');
const submitButton = document.getElementById('submit');

function mostrarQuiz(questions) {
  // código para exibir as perguntas e respostas na tela

  // evento de clique do botão de envio
  submitButton.onclick = function() {
    const respostas = document.querySelectorAll('#quiz input:checked');
    let pontos = 0;
    // código para verificar as respostas e calcular a pontuação
    resultsContainer.innerHTML = `Você acertou ${pontos} de ${questions.length} perguntas.`;
  }
}

fetch('quiz.json')
  .then(response => response.json())
  .then(data => mostrarQuiz(data));
  
