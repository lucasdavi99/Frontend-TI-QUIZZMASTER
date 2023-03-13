//Opção de pular os creditos
setTimeout(function() {
  document.getElementById('back-home').style.display = 'block';
}, 10000); //Segundos para aparecer o botão.

document.getElementById('back-home').addEventListener('click', function() {
  window.location.href = 'index.html'; // Página que será redirecionado.
});


