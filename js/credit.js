//Opção de pular os creditos
setTimeout(function() {
  document.getElementById('back-home').style.display = 'block';
}, 10000); //Segundos para aparecer o botão.

document.getElementById('back-home').addEventListener('click', function() {
  window.location.href = 'index.html'; // Página que será redirecionado.
});


/*Função para diminuir a musica gradualmente*/
/*window.onload = function() {
  // obtendo o elemento de áudio
  var audio = document.querySelector('.credit-music');

  // tempo total de fade (em segundos)
  var fadeTime = 10;

  // começar a diminuir o volume depois de um segundo para garantir que o áudio já começou a tocar
  setTimeout(function() {
      var fadeAudio = setInterval(function () {
          // diminuir o volume
          if ((audio.volume - 0.1 > 0)) {
              audio.volume -= 0.1;
          } 
          // quando volume em 0, parar o intervalo
          else {
              audio.volume = 0;
              clearInterval(fadeAudio);
          }
      }, fadeTime * 100); // dividindo o tempo total de fade pelo volume (de 1 a 0, logo 10 partes)
  }, 1000);
};*/