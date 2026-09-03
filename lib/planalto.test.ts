import test from 'node:test';
import assert from 'node:assert/strict';
import { extrairLinhas, extrairDispositivos, lerNorma } from './planalto.ts';

/**
 * O acervo do vade-mécum vale pela exatidão (§5.4). Um erro aqui não é um
 * defeito de importação: é uma lei errada na tela de quem estuda por ela.
 * Cada teste abaixo é uma armadilha real do HTML do Planalto.
 */

test('a quebra de linha do HTML não parte o caput no meio', () => {
  const linhas = extrairLinhas('<p>Art. 1º A República Federativa do\nBrasil constitui-se em\nEstado Democrático de Direito.</p>');
  assert.deepEqual(linhas, ['Art. 1º A República Federativa do Brasil constitui-se em Estado Democrático de Direito.']);
});

test('o ordinal desenhado com <sup><u>o</u></sup> vira "º"', () => {
  const [linha] = extrairLinhas('<p>Art. 1<sup><u>o</u></sup> Toda pessoa é capaz de direitos.</p>');
  assert.equal(linha, 'Art. 1º Toda pessoa é capaz de direitos.');
});

test('a redação revogada, que a página mantém riscada, não entra no acervo', () => {
  const linhas = extrairLinhas(
    '<p><strike>Art. 1º Os atos de improbidade praticados por agente público.</strike></p>'
    + '<p>Art. 1º O sistema de responsabilização tutelará a probidade.</p>',
  );
  assert.deepEqual(linhas, ['Art. 1º O sistema de responsabilização tutelará a probidade.']);
});

test('inciso, alínea e parágrafo entram no artigo, cada um na sua linha', () => {
  const [artigo] = extrairDispositivos([
    'Art. 5º Todos são iguais perante a lei, nos termos seguintes:',
    'I - homens e mulheres são iguais em direitos e obrigações;',
    'II - ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei;',
    '§ 1º As normas definidoras dos direitos fundamentais têm aplicação imediata.',
  ]);
  assert.equal(artigo.rotulo, 'Art. 5º');
  assert.equal(artigo.texto.split('\n').length, 4);
  assert.ok(artigo.texto.startsWith('Todos são iguais perante a lei'));
  assert.ok(artigo.texto.endsWith('têm aplicação imediata.'));
});

test('o rótulo usa ordinal até o art. 9º e cardinal do 10 em diante', () => {
  const rotulos = extrairDispositivos([
    'Art. 9º Texto.', 'Art. 10. Texto.', 'Art. 1.723. Texto.', 'Art. 121-A Texto.',
  ]).map((d) => d.rotulo);
  assert.deepEqual(rotulos, ['Art. 9º', 'Art. 10', 'Art. 1.723', 'Art. 121-A']);
});

test('o hífen do CP de 40 separa rótulo e texto, e não vira sufixo de artigo', () => {
  const [artigo] = extrairDispositivos(['Art. 2º - Ninguém pode ser punido por fato que lei posterior deixa de considerar crime.']);
  assert.equal(artigo.rotulo, 'Art. 2º');
  assert.ok(artigo.texto.startsWith('Ninguém pode ser punido'));
});

test('o cabeçalho de capítulo recolhe o nome que vem na linha seguinte', () => {
  const [artigo] = extrairDispositivos([
    'TÍTULO I', 'Dos Princípios Fundamentais',
    'CAPÍTULO I', 'Disposições Gerais',
    'Art. 1º Texto do artigo.',
  ]);
  assert.equal(artigo.agrupador, 'TÍTULO I — Dos Princípios Fundamentais › CAPÍTULO I — Disposições Gerais');
});

test('capítulo novo fecha o anterior, e título novo fecha o capítulo', () => {
  const [, segundo] = extrairDispositivos([
    'TÍTULO I — Dos Princípios', 'CAPÍTULO I — Da União', 'Art. 1º Texto.',
    'TÍTULO II — Dos Direitos', 'Art. 2º Texto.',
  ]);
  assert.equal(segundo.agrupador, 'TÍTULO II — Dos Direitos');
});

test('remissão a "Capítulo II desta Lei" no meio do texto não abre uma seção', () => {
  const [artigo] = extrairDispositivos([
    'TÍTULO I — Das Disposições Gerais',
    'Art. 1º Texto.',
    'Capítulo II desta Lei aplica-se subsidiariamente ao processo.',
  ]);
  assert.equal(artigo.agrupador, 'TÍTULO I — Das Disposições Gerais');
  assert.ok(artigo.texto.includes('Capítulo II desta Lei'));
});

test('assinatura e nota de publicação ficam de fora do último artigo', () => {
  const [artigo] = extrairDispositivos([
    'Art. 119. Revogam-se as disposições em contrário.',
    'Brasília, 11 de setembro de 1990.',
    'FERNANDO COLLOR',
    'Este texto não substitui o publicado no DOU.',
  ]);
  assert.equal(artigo.texto, 'Revogam-se as disposições em contrário.');
});

test('o apêndice que altera outra lei não vira um segundo art. 1º da norma', () => {
  const html = [
    ...Array.from({ length: 60 }, (_, i) => `<p>Art. ${i + 1}. Dispositivo da norma.</p>`),
    '<p>CAPÍTULO II — DAS ALTERAÇÕES LEGISLATIVAS</p>',
    '<p>Art. 1º A Lei nº 8.666 passa a vigorar com a seguinte redação.</p>',
  ].join('');
  const dispositivos = lerNorma(html);
  assert.equal(dispositivos.length, 60);
  assert.equal(dispositivos[dispositivos.length - 1].rotulo, 'Art. 60');
});

test('o corte separa duas normas publicadas na mesma página (CF e ADCT)', () => {
  const html = '<p>Art. 1º Da Constituição.</p>'
    + '<p>ATO DAS DISPOSIÇÕES CONSTITUCIONAIS TRANSITÓRIAS</p>'
    + '<p>Art. 1º Do ADCT.</p>';
  const cf = lerNorma(html, { ate: /^ATO DAS DISPOSI/i });
  const adct = lerNorma(html, { de: /^ATO DAS DISPOSI/i });
  assert.equal(cf.length, 1);
  assert.ok(cf[0].texto.includes('Da Constituição'));
  assert.equal(adct.length, 1);
  assert.ok(adct[0].texto.includes('Do ADCT'));
});

test('hífen espaçado é pontuação, não sufixo: "Art. 922 - O disposto..." é o art. 922', () => {
  const [artigo] = extrairDispositivos(['Art. 922 - O disposto no art. 301 regerá as relações de emprego.']);
  assert.equal(artigo.rotulo, 'Art. 922');
  assert.ok(artigo.texto.startsWith('O disposto no art. 301'));
});

test('artigo acrescentado guarda o sufixo colado ao número', () => {
  const rotulos = extrairDispositivos(['Art. 121-A. Matar mulher por razões da condição de sexo feminino:'])
    .map((d) => d.rotulo);
  assert.deepEqual(rotulos, ['Art. 121-A']);
});

test('o corte ignora a citação do índice e usa o cabeçalho verdadeiro', () => {
  const html = '<p>ATO DAS DISPOSIÇÕES CONSTITUCIONAIS TRANSITÓRIAS</p>'  // índice do topo
    + '<p>Art. 1º Da Constituição.</p>'
    + '<p>ATO DAS DISPOSIÇÕES CONSTITUCIONAIS TRANSITÓRIAS</p>'
    + '<p>Art. 1º Do ADCT.</p>';
  const cf = lerNorma(html, { ate: /^ATO DAS DISPOSI/i });
  assert.equal(cf.length, 1);
  assert.ok(cf[0].texto.includes('Da Constituição'));
});

test('a rubrica marginal do CP abre o artigo seguinte, e não fecha o anterior', () => {
  const [primeiro, segundo] = extrairDispositivos([
    'Art. 1º Não há crime sem lei anterior que o defina.',
    'Lei penal no tempo',
    'Art. 2º Ninguém pode ser punido por fato que lei posterior deixa de considerar crime.',
  ]);
  assert.equal(primeiro.texto, 'Não há crime sem lei anterior que o defina.');
  assert.deepEqual(segundo.texto.split('\n'), [
    'Lei penal no tempo',
    'Ninguém pode ser punido por fato que lei posterior deixa de considerar crime.',
  ]);
});

test('a rubrica que anuncia um parágrafo fica no artigo em que está escrita', () => {
  const [artigo] = extrairDispositivos([
    'Art. 121. Matar alguem:',
    'Pena - reclusão, de seis a vinte anos.',
    'Caso de diminuição de pena',
    '§ 1º Se o agente comete o crime impelido por motivo de relevante valor social:',
  ]);
  assert.ok(artigo.texto.includes('Caso de diminuição de pena'));
  assert.ok(artigo.texto.trimEnd().endsWith('valor social:'));
});
