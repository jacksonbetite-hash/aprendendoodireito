// Verifica contraste WCAG 2.1 AA dos pares realmente usados na interface.
// O §9 do discovery exige AA. Rode com: npm run contraste
const hex = (h) => h.replace('#','').match(/../g).map(x => parseInt(x,16)/255);
const lum = (h) => { const [r,g,b] = hex(h).map(c => c <= .03928 ? c/12.92 : ((c+.055)/1.055)**2.4);
  return .2126*r + .7152*g + .0722*b; };
const ratio = (a,b) => { const [x,y] = [lum(a), lum(b)].sort((p,q)=>q-p); return (x+.05)/(y+.05); };

// Tokens do design system "Direito Leve" (app/globals.css)
const C = {
  surface:'#f9f9ff', surfaceLow:'#f1f3ff', surfaceContainer:'#e8edff',
  surfaceHigh:'#e0e8ff', surfaceHighest:'#d7e2ff', branco:'#ffffff',
  onSurface:'#101b30', onSurfaceVariant:'#56423e', outline:'#89726d', outlineVariant:'#ddc0ba', bordaControle:'#7a87ae',
  primary:'#9f402d', onPrimary:'#ffffff', primaryContainer:'#e2725b',
  onPrimaryContainer:'#5a0d02', primaryFixed:'#ffdad3',
  secondary:'#01696c', onSecondary:'#ffffff', secondaryFixed:'#a1f0f3',
  onSecondaryFixed:'#002021', onSecondaryFixedVariant:'#004f52',
  tertiary:'#7c5800', tertiaryContainer:'#be890c', tertiaryFixed:'#ffdea7',
  onTertiaryContainer:'#3b2800',
  error:'#ba1a1a', errorContainer:'#ffdad6', onErrorContainer:'#93000a',
};

const pares = [
  ['texto / fundo',                     C.onSurface, C.surface,                 4.5],
  ['texto secundário / fundo',          C.onSurfaceVariant, C.surface,          4.5],
  ['texto secundário / cartão',         C.onSurfaceVariant, C.branco,           4.5],
  ['texto secundário / faixa tinta',    C.onSurfaceVariant, C.surfaceLow,       4.5],
  ['link e marca / fundo',              C.primary, C.surface,                   4.5],
  ['botão primário',                    C.onPrimary, C.primary,                 4.5],
  ['botão secundário',                  C.onSecondary, C.secondary,             4.5],
  ['botão contorno: texto/fundo',       C.primary, C.surface,                   4.5],
  ['chip primária',                     C.onPrimaryContainer, C.primaryFixed,   4.5],
  ['chip secundária',                   C.onSecondaryFixedVariant, C.secondaryFixed, 4.5],
  ['chip terciária',                    C.onTertiaryContainer, C.tertiaryFixed, 4.5],
  ['chip neutra',                       C.onSurfaceVariant, C.surfaceHigh,      4.5],
  ['chip erro',                         C.onErrorContainer, C.errorContainer,   4.5],
  ['aviso "Você sabia?"',               C.onSecondaryFixed, C.secondaryFixed,   4.5],
  ['aviso mostarda',                    C.onTertiaryContainer, C.tertiaryFixed, 4.5],
  ['texto de lei / caixa',              C.onSurface, C.surfaceLow,              4.5],
  ['faixa de chamada: texto/terracota', C.branco, '#b84e3a',                    4.5],
  ['lateral ativa (aluno)',             C.onSecondaryFixedVariant, C.secondaryFixed, 4.5],
  ['lateral ativa (admin)',             C.onPrimaryContainer, C.primaryFixed,   4.5],
  ['borda de controle / cartão',        C.bordaControle, C.branco,              3.0],
  ['borda de foco / fundo',             C.secondary, C.surface,                 3.0],
  ['progresso preenchido / trilho',     C.primary, C.surfaceHighest,            3.0],
];

let falhas = 0;
for (const [nome, fg, bg, min] of pares) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) falhas++;
  console.log(`${ok ? '✔' : '✘'} ${nome.padEnd(36)} ${r.toFixed(2)}:1  (mín ${min})`);
}
console.log(falhas ? `\n${falhas} par(es) reprovado(s)` : '\nTodos os pares passam no AA');
process.exit(falhas ? 1 : 0);
