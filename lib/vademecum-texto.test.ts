import test from 'node:test';
import assert from 'node:assert/strict';
import { partirDispositivo, partirAgrupador, ultimoNivel } from './vademecum-texto.ts';

/**
 * A tela de consulta é lida como se fosse o papel. Se a divisão errar, o
 * aluno lê a lei diferente do que ela é — inciso colado no caput, ou
 * parágrafo que some dentro do texto do artigo. Erro de apresentação aqui
 * é erro de conteúdo.
 */

const tipos = (t: string) => partirDispositivo(t).map((b) => b.tipo);
const rotulos = (t: string) => partirDispositivo(t).map((b) => b.rotulo);

test('cada linha do acervo vira um bloco com o seu tipo', () => {
  const artigo = [
    'Todos são iguais perante a lei, nos termos seguintes:',
    'I - homens e mulheres são iguais em direitos e obrigações;',
    'II - ninguém será obrigado a fazer alguma coisa senão em virtude de lei;',
    '§ 1º As normas definidoras dos direitos fundamentais têm aplicação imediata.',
    '§ 2º Os direitos expressos nesta Constituição não excluem outros.',
  ].join('\n');

  assert.deepEqual(tipos(artigo), ['caput', 'inciso', 'inciso', 'paragrafo', 'paragrafo']);
  assert.deepEqual(rotulos(artigo), ['', 'I', 'II', '§ 1º', '§ 2º']);
  assert.equal(partirDispositivo(artigo)[1].texto, 'homens e mulheres são iguais em direitos e obrigações;');
});

test('o artigo com um parágrafo só não perde os outros: todos são parágrafos', () => {
  const blocos = partirDispositivo('Caput.\n§ 1º Primeiro.\n§ 2º Segundo.\n§ 3º Terceiro.');
  assert.equal(blocos.filter((b) => b.tipo === 'paragrafo').length, 3);
});

test('alínea e item entram dentro do inciso a que pertencem', () => {
  const artigo = 'São estáveis os servidores:\nI - nomeados para cargo efetivo, quando:\na) aprovados em concurso;\nb) confirmados em avaliação;';
  assert.deepEqual(tipos(artigo), ['caput', 'inciso', 'alinea', 'alinea']);
  assert.deepEqual(rotulos(artigo), ['', 'I', 'a', 'b']);
});

test('a pena do Código Penal é bloco próprio, e a rubrica do crime é título', () => {
  const artigo = 'Matar alguem:\nPena - reclusão, de seis a vinte anos.\nHomicídio qualificado\n§ 2º Se o homicídio é cometido mediante paga:';
  assert.deepEqual(tipos(artigo), ['caput', 'pena', 'rubrica', 'paragrafo']);
  assert.equal(partirDispositivo(artigo)[1].texto, 'reclusão, de seis a vinte anos.');
});

test('a rubrica marginal abre o artigo como título, e o caput vem abaixo dela', () => {
  const artigo = [
    'Lei penal no tempo',
    'Ninguém pode ser punido por fato que lei posterior deixa de considerar crime.',
  ].join('\n');
  assert.deepEqual(tipos(artigo), ['rubrica', 'caput']);
});

test('caput curto terminado em dois-pontos não é confundido com rubrica', () => {
  const artigo = ['Matar alguem:', 'Pena - reclusão, de seis a vinte anos.'].join('\n');
  assert.deepEqual(tipos(artigo), ['caput', 'pena']);
});

test('artigo de uma linha só é caput, mesmo curto e sem ponto final', () => {
  assert.deepEqual(tipos('(Revogado pela Lei nº 7.209, de 1984)'), ['caput']);
});

test('"§ 2°" com o grau no lugar do ordinal é o mesmo § 2º na tela', () => {
  assert.deepEqual(rotulos('Caput.\n§ 2° Texto do parágrafo.'), ['', '§ 2º']);
});

test('parágrafo único guarda o rótulo por extenso', () => {
  const blocos = partirDispositivo('Todo o poder emana do povo.\nParágrafo único. O poder é exercido por representantes eleitos.');
  assert.equal(blocos[1].rotulo, 'Parágrafo único');
  assert.equal(blocos[1].texto, 'O poder é exercido por representantes eleitos.');
});

/* --- dispositivo escrito à mão, em parágrafo corrido --- */

const ART_1 =
  'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e '
  + 'Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem '
  + 'como fundamentos: I — a soberania; II — a cidadania; III — a dignidade da pessoa '
  + 'humana; IV — os valores sociais do trabalho e da livre iniciativa; V — o pluralismo político.';

test('sem quebra de linha, a divisão é reconstruída pela pontuação', () => {
  const blocos = partirDispositivo(ART_1);
  assert.ok(blocos[0].texto.endsWith('tem como fundamentos:'));
  assert.deepEqual(blocos.slice(1).map((b) => b.rotulo), ['I', 'II', 'III', 'IV', 'V']);
  assert.equal(blocos[1].texto, 'a soberania;');
  assert.equal(blocos[5].texto, 'o pluralismo político.');
});

test('artigo sem inciso vira caput inteiro, sem lista', () => {
  const t = 'São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.';
  assert.deepEqual(partirDispositivo(t), [{ tipo: 'caput', rotulo: '', texto: t }]);
});

test('remissão a "§ 1º" no meio da frase não é confundida com parágrafo', () => {
  const t = 'A norma será aplicada na forma do § 1º deste artigo, sem exceção.';
  assert.deepEqual(partirDispositivo(t), [{ tipo: 'caput', rotulo: '', texto: t }]);
});

test('dispositivo que É um parágrafo mantém o rótulo do parágrafo', () => {
  const blocos = partirDispositivo('§ 1º As normas definidoras dos direitos fundamentais têm aplicação imediata.');
  assert.equal(blocos.length, 1);
  assert.equal(blocos[0].tipo, 'paragrafo');
  assert.equal(blocos[0].rotulo, '§ 1º');
});

test('caput, incisos e parágrafo convivem no mesmo dispositivo corrido', () => {
  const blocos = partirDispositivo(
    'Não será objeto de deliberação a proposta tendente a abolir: I — a forma federativa; '
    + 'II — o voto direto. Parágrafo único. A vedação é absoluta.',
  );
  assert.deepEqual(blocos.map((b) => b.tipo), ['caput', 'inciso', 'inciso', 'paragrafo']);
  assert.equal(blocos[3].texto, 'A vedação é absoluta.');
});

/* --- sumário e cabeçalhos --- */

test('o agrupador se parte em numeração e assunto', () => {
  assert.deepEqual(partirAgrupador('Título I — Dos Princípios Fundamentais'),
    { titulo: 'Título I', subtitulo: 'Dos Princípios Fundamentais' });
  assert.deepEqual(partirAgrupador('Disposições Gerais'),
    { titulo: 'Disposições Gerais', subtitulo: '' });
});

test('do caminho hierárquico, o corpo da página mostra o nível mais fundo', () => {
  assert.equal(ultimoNivel('LIVRO I — Das Pessoas › TÍTULO I — Das Pessoas Naturais › CAPÍTULO I — Da Personalidade'),
    'CAPÍTULO I — Da Personalidade');
  assert.equal(ultimoNivel('CAPÍTULO ÚNICO'), 'CAPÍTULO ÚNICO');
});
