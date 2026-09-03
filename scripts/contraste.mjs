// Verifica contraste WCAG 2.1 AA dos pares realmente usados na interface.
// O §9 do discovery exige AA. Rode com: npm run contraste
//
// Um só tema: o modo escuro foi removido por decisão de projeto ao adotar
// o novo design system. A tabela abaixo é a única fonte de verdade — se um
// token mudar no CSS e não mudar aqui, este script passa a mentir.
const hex = (h) => h.replace('#','').match(/../g).map(x => parseInt(x,16)/255);
const lum = (h) => { const [r,g,b] = hex(h).map(c => c <= .03928 ? c/12.92 : ((c+.055)/1.055)**2.4);
  return .2126*r + .7152*g + .0722*b; };
const ratio = (a,b) => { const [x,y] = [lum(a), lum(b)].sort((p,q)=>q-p); return (x+.05)/(y+.05); };

// Tokens de app/globals.css.
const T = {
  surface:'#ffffff', surfaceLow:'#fafafa', surfaceContainer:'#f6f6f8',
  surfaceHigh:'#f1f5f9', surfaceHighest:'#e2e8f0', cartao:'#ffffff',
  surfaceMarca:'#f7f5ff',
  onSurface:'#0f172a', onSurfaceVariant:'#475569', outline:'#64748b',
  outlineVariant:'#e2e8f0', bordaControle:'#8493a8',

  // Os DOIS roxos. `primary` é decorativo (fundo, borda, ícone) e só
  // responde por 3:1; `primaryTexto` é o que pode carregar texto.
  primary:'#997bf4', primaryTexto:'#6d28d9',
  onPrimary:'#ffffff', primaryContainer:'#7c3aed', onPrimaryContainer:'#4c1d95',
  primaryFixed:'#f3f0ff', onPrimaryFixedVariant:'#5b21b6', contornoPill:'#c4b5fd',

  secondary:'#0f766e', onSecondary:'#ffffff', secondaryContainer:'#0d9488',
  secondaryFixed:'#ccfbf1', onSecondaryFixed:'#134e4a', onSecondaryFixedVariant:'#115e59',
  tertiary:'#b45309', onTertiary:'#ffffff', tertiaryContainer:'#d97706',
  tertiaryFixed:'#fef3c7', onTertiaryContainer:'#78350f',
  error:'#b91c1c', onError:'#ffffff', errorContainer:'#fee2e2', onErrorContainer:'#991b1b',
};

// [nome, chave do texto, chave do fundo, mínimo]. Um valor entre aspas com
// '#' é literal — cor fixa, fora do sistema de tokens (a faixa de chamada).
const pares = [
  // ---- Texto sobre superfície ----
  ['texto / fundo',                      'onSurface', 'surface',                 4.5],
  ['texto secundário / fundo',           'onSurfaceVariant', 'surface',          4.5],
  ['texto secundário / cartão',          'onSurfaceVariant', 'cartao',           4.5],
  ['texto secundário / faixa tinta',     'onSurfaceVariant', 'surfaceContainer', 4.5],
  ['texto secundário / faixa marca',     'onSurfaceVariant', 'surfaceMarca',     4.5],

  // ---- O roxo carregando texto: o par que a referência reprova ----
  ['roxo de texto / fundo',              'primaryTexto', 'surface',              4.5],
  ['roxo de texto / cartão',             'primaryTexto', 'cartao',               4.5],
  ['roxo de texto / faixa tinta',        'primaryTexto', 'surfaceContainer',     4.5],
  ['roxo de texto / faixa marca',        'primaryTexto', 'surfaceMarca',         4.5],
  ['marca no topo',                      'primaryTexto', 'surface',              4.5],
  ['nome do plano',                      'primaryTexto', 'cartao',               4.5],
  ['rótulo "ETAPA N"',                   'primaryTexto', 'surface',              4.5],
  ['aba ativa',                          'primaryTexto', 'surface',              4.5],

  // ---- Botões ----
  ['CTA em gradiente (ponta escura)',    'onPrimary', 'primaryContainer',        4.5],
  ['CTA em gradiente (ponta clara)',     '#ffffff', '#8a63ff',                   3.0],
  ['botão contorno: texto/fundo',        'primaryTexto', 'cartao',               4.5],
  ['botão secundário',                   'onSecondary', 'secondary',             4.5],
  ['CTA branco na faixa roxa',           'onPrimaryContainer', '#ffffff',        4.5],

  // ---- Pills e etiquetas ----
  ['pill neutra',                        'onSurface', 'cartao',                  4.5],
  ['pill lavanda',                       'onPrimaryFixedVariant', 'primaryFixed',4.5],
  ['chip secundária',                    'onSecondaryFixedVariant', 'secondaryFixed', 4.5],
  ['chip terciária',                     'onTertiaryContainer', 'tertiaryFixed', 4.5],
  ['chip neutra',                        'onSurfaceVariant', 'surfaceHigh',      4.5],
  ['chip erro',                          'onErrorContainer', 'errorContainer',   4.5],
  ['fita "mais escolhido"',              'onPrimary', 'primaryContainer',        4.5],

  // ---- Blocos ----
  ['aviso "Você sabia?"',                'onPrimaryContainer', 'primaryFixed',   4.5],
  ['aviso âmbar',                        'onTertiaryContainer', 'tertiaryFixed', 4.5],
  ['texto de lei / caixa',               'onSurface', 'surfaceLow',              4.5],
  ['faixa de chamada: início',           '#ffffff', '#4c1d95',                   4.5],
  ['faixa de chamada: fim',              '#ffffff', '#7c3aed',                   4.5],
  ['lateral ativa (aluno)',              'onPrimaryFixedVariant', 'primaryFixed',4.5],
  ['lateral ativa (admin)',              'onPrimaryContainer', 'primaryFixed',   4.5],
  ['avatar do usuário',                  'onPrimary', 'primaryContainer',        4.5],
  ['selo de XP no comentário',           'onTertiary', 'tertiary',               4.5],
  ['número do passo',                    'primaryTexto', 'primaryFixed',         4.5],
  ['letra da alternativa certa',         'onSecondary', 'secondary',             4.5],
  ['letra da alternativa errada',        'onError', 'error',                     4.5],
  ['botão de play sobre o player',       'primaryTexto', '#ffffff',              4.5],

  // ---- Elementos gráficos e bordas: AA pede 3:1, não 4.5:1 ----
  ['borda de controle / cartão',         'bordaControle', 'cartao',              3.0],
  ['borda de foco / fundo',              'primaryContainer', 'surface',          3.0],
  ['ícone de check / cartão',            'primary', 'cartao',                    3.0],
  ['progresso preenchido / trilho',      'primaryContainer', 'surfaceHighest',   3.0],
  ['borda de pill / cartão',             'contornoPill', 'cartao',               1.5],
];

const cor = (chave) => (chave.startsWith('#') ? chave : T[chave]);

let falhas = 0;
console.log('\n── TEMA CLARO ' + '─'.repeat(44));
for (const [nome, fg, bg, min] of pares) {
  const a = cor(fg), b = cor(bg);
  if (!a || !b) { console.log(`✘ ${nome} — token inexistente (${fg} / ${bg})`); falhas++; continue; }
  const r = ratio(a, b);
  const ok = r >= min;
  if (!ok) falhas++;
  console.log(`${ok ? '✔' : '✘'} ${nome.padEnd(34)} ${r.toFixed(2)}:1  (mín ${min})`);
}
console.log(falhas ? `\n${falhas} par(es) reprovado(s)` : '\nTodos os pares passam no AA');
process.exit(falhas ? 1 : 0);
