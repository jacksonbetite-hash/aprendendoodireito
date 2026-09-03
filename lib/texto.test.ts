import test from 'node:test';
import assert from 'node:assert/strict';
import { slugificar, slugLivre, minutosDeLeitura, normalizarParagrafos } from './texto.ts';

/**
 * O slug é endereço público e permanente. Errar aqui não dá erro em
 * lugar nenhum — dá uma URL feia que o Google indexa e que não se
 * conserta mais sem perder o que foi indexado.
 */

test('acento sai, a letra fica', () => {
  assert.equal(slugificar('Prescrição e decadência'), 'prescricao-e-decadencia');
  assert.equal(slugificar('Ação, Órfão e Çedilha'), 'acao-orfao-e-cedilha');
});

test('pontuação e espaço viram um hífen só', () => {
  assert.equal(slugificar('LGPD: o que muda   na prática?'), 'lgpd-o-que-muda-na-pratica');
  assert.equal(slugificar('  Espaços nas pontas  '), 'espacos-nas-pontas');
});

test('"&" vira "e", porque no título ele quer dizer isso', () => {
  assert.equal(slugificar('Prazos & recursos'), 'prazos-e-recursos');
});

test('título só de pontuação devolve vazio — quem chama decide o que fazer', () => {
  assert.equal(slugificar('!!! ???'), '');
});

test('o corte respeita a palavra', () => {
  const s = slugificar('Reforma tributaria o que muda na pratica para o escritorio pequeno', 30);
  assert.ok(s.length <= 30, s);
  assert.ok(!s.endsWith('-'), s);
  // não corta no meio de uma palavra
  assert.equal(s, 'reforma-tributaria-o-que-muda');
});

test('slug já usado ganha sufixo numérico', () => {
  assert.equal(slugLivre('prescricao', []), 'prescricao');
  assert.equal(slugLivre('prescricao', ['prescricao']), 'prescricao-2');
  assert.equal(slugLivre('prescricao', ['prescricao', 'prescricao-2']), 'prescricao-3');
});

test('minutos de leitura nunca é zero', () => {
  assert.equal(minutosDeLeitura('uma palavra só'), 1);
  assert.equal(minutosDeLeitura(''), 1);
  assert.equal(minutosDeLeitura(Array(600).fill('palavra').join(' ')), 3);
});

test('parágrafos ficam separados por exatamente uma linha em branco', () => {
  assert.equal(
    normalizarParagrafos('Um.\r\n\r\n\r\n\r\nDois.\n\n\nTrês.'),
    'Um.\n\nDois.\n\nTrês.',
  );
});

test('linhas em branco nas pontas somem', () => {
  assert.equal(normalizarParagrafos('\n\n  Texto.  \n\n'), 'Texto.');
});
