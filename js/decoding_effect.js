//Efeito Decoding
const text = baffle("#titulo");
text.set({
  characters: '█▓▒░ ▓█▒░ ▓▒▓ ░▓▒',
  speed: 80
});
text.start();
text.reveal(1500); // Reduzido para aparecer mais rápido

// Remover ou comentar efeitos nos botões se estiverem causando problemas
// const btn = baffle(".btn");
// btn.set({
//   characters: '█/▓█ ▓█▒▒ ▓░▒ ▓▓▒▓ <▒█▒░ >█> ▓▒▓>▓ ░▓▒>/ ​​▓▓▓',
//   speed: 120
// });
// btn.start();
// btn.reveal(50000);

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