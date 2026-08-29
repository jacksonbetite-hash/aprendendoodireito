// Verifica contraste WCAG 2.1 AA dos pares realmente usados na interface.
// O §9 do discovery exige AA. Rode com: npm run contraste
const hex = (h) => h.replace('#','').match(/../g).map(x => parseInt(x,16)/255);
const lum = (h) => { const [r,g,b] = hex(h).map(c => c <= .03928 ? c/12.92 : ((c+.055)/1.055)**2.4);
  return .2126*r + .7152*g + .0722*b; };
const ratio = (a,b) => { const [x,y] = [lum(a), lum(b)].sort((p,q)=>q-p); return (x+.05)/(y+.05); };

const C = {
  bg:'#f7fbfa', bgSoft:'#edf5f3', card:'#ffffff', line:'#d9e7e4', lineForte:'#699890',
  ink:'#1e2f2d', inkSoft:'#5b6f6c',
  brand900:'#0b3b38', brand700:'#0d5f58', brand600:'#0f766e', brand500:'#14a89b', brand50:'#e0f0ec',
  accent600:'#f0a323', accent300:'#fbe3b4', accent50:'#fdf1d9', onAccent:'#3a2a06',
  success700:'#0b6f56', success50:'#e0f0ea', danger600:'#b53d24', danger50:'#fbeae5',
  warn700:'#8a6212', branco:'#ffffff', brancoSuave:'rgba', footerInk:'#b8cfcc',
};

const pares = [
  ['texto principal / fundo',        C.ink, C.bg,          4.5],
  ['texto secundário / fundo',       C.inkSoft, C.bg,      4.5],
  ['texto secundário / cartão',      C.inkSoft, C.card,    4.5],
  ['título / fundo',                 C.brand900, C.bg,     4.5],
  ['link e kicker / fundo',          C.brand600, C.bg,     4.5],
  ['botão primário: texto/fundo',    C.branco, C.brand600, 4.5],
  ['botão acento: texto/fundo',      C.onAccent, C.accent600, 4.5],
  ['botão contorno: texto/fundo',    C.brand600, C.bg,     4.5],
  ['pill sucesso',                   C.success700, C.success50, 4.5],
  ['pill aviso',                     C.warn700, C.accent50,     4.5],
  ['pill marca',                     C.brand700, C.brand50,     4.5],
  ['erro no exercício',              C.danger600, C.danger50,   4.5],
  ['texto do rodapé / rodapé',       C.footerInk, C.brand900,   4.5],
  ['marca no rodapé (accent-300)',   C.accent300, C.brand900,   4.5],
  ['sidebar ativa: texto/fundo',     C.branco, C.brand600,      4.5],
  ['borda de controle / fundo',      C.lineForte, C.card,       3.0],
];

let falhas = 0;
for (const [nome, fg, bg, min] of pares) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) falhas++;
  console.log(`${ok ? '✔' : '✘'} ${nome.padEnd(34)} ${r.toFixed(2)}:1  (mín ${min})`);
}
console.log(falhas ? `\n${falhas} par(es) reprovado(s)` : '\nTodos os pares passam no AA');
