var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
matrix = matrix.split('');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var columns = canvas.width/20;
var drops = [];

// Configurações do gradiente de cores
var gradientSpeed = 0.002; // Velocidade da mudança de cor
var gradient = null;
var colorCount = 0;

function createGradient() {
  gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#0F0");
  gradient.addColorStop(0.5, "#00FF00");
  gradient.addColorStop(1, "#0F0");
}

function updateGradient() {
  if (colorCount > 1 / gradientSpeed) {
    colorCount = 0;
    createGradient();
  }

  gradient.addColorStop(0, "#0F0");
  gradient.addColorStop(0.5, "#00FF00");
  gradient.addColorStop(1, "#0F0");

  colorCount += gradientSpeed;
}

createGradient();

for(var i=0; i<columns; i++){
  drops[i] = 1;
}

function draw() {
  context.fillStyle = 'rgba(0, 0, 0, 0.05)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = gradient;
  context.font = '15px arial';

  for(var i=0; i<drops.length; i++){
    var text = matrix[Math.floor(Math.random()*matrix.length)];
    context.fillText(text, i*20, drops[i]*20);

    if(drops[i]*20 > canvas.height && Math.random() > 0.975)
      drops[i] = 0;

    drops[i]++;
  }

  updateGradient();
}

setInterval(draw, 30);



//Efeito Decoding
const text = baffle("#titulo");
text.set({
  characters: '█/▓█ ▓█▒▒ ▓░▒ ▓▓▒▓ <▒█▒░ >█> ▓▒▓>▓ ░▓▒>/ ​​▓▓▓',
  speed: 120
});
text.start();
text.reveal(2000);

const btn = baffle(".btn");
btn.set({
  characters: '█/▓█ ▓█▒▒ ▓░▒ ▓▓▒▓ <▒█▒░ >█> ▓▒▓>▓ ░▓▒>/ ​​▓▓▓',
  speed: 120
});
btn.start();
btn.reveal(50000);

const rank = baffle("#rank-title");
rank.set({
  characters: '█/▓█ ▓█▒▒ ▓░▒ ▓▓▒▓ <▒█▒░ >█> ▓▒▓>▓ ░▓▒>/ ​​▓▓▓',
  speed: 120
});
rank.start();
rank.reveal(5000);

const table = baffle("td");
table.set({
  characters: '█/▓█ ▓█▒▒ ▓░▒ ▓▓▒▓ <▒█▒░ >█> ▓▒▓>▓ ░▓▒>/ ​​▓▓▓',
  speed: 120
});
table.start();
table.reveal(9000);







