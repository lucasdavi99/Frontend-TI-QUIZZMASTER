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