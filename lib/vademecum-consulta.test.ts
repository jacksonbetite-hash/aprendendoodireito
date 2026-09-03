import test from 'node:test';
import assert from 'node:assert/strict';
import { interpretarBusca, consultasDeTexto } from './vademecum-consulta.ts';

/**
 * A caixa de busca é a porta do acervo. Se ela lê errado o que foi digitado,
 * o aluno recebe 300 artigos que citam o art. 5º em vez do art. 5º — e
 * conclui que o vade-mécum não acha nada.
 */

test('"art 5 cf" é o artigo 5 da norma "cf", e não o texto "art 5 cf"', () => {
  const c = interpretarBusca('art 5 cf');
  assert.equal(c.numero, 5);
  assert.deepEqual(c.palavras, ['cf']);
});

test('a pontuação não muda a pergunta: "art.5º", "Art. 5º" e "art 5" são iguais', () => {
  for (const escrito of ['art.5º', 'Art. 5º', 'art 5', 'ARTIGO 5o']) {
    assert.equal(interpretarBusca(escrito).numero, 5, escrito);
  }
});

test('a preposição some, e a norma continua: "121 do cp"', () => {
  const c = interpretarBusca('121 do cp');
  assert.equal(c.numero, 121);
  assert.deepEqual(c.palavras, ['cp']);
});

test('o acréscimo vira sufixo: "art 121-A cp"', () => {
  const c = interpretarBusca('art 121-A cp');
  assert.equal(c.numero, 121);
  assert.equal(c.sufixo, 'A');
  assert.deepEqual(c.palavras, ['cp']);
});

test('o milhar do Código Civil é um número só: "art 1.723"', () => {
  assert.equal(interpretarBusca('art 1.723 cc').numero, 1723);
});

test('busca por texto não inventa número de artigo', () => {
  const c = interpretarBusca('cláusula pétrea');
  assert.equal(c.numero, null);
  assert.deepEqual(c.palavras, ['clausula', 'petrea']);
});

test('o segundo número da frase é texto, não outro artigo', () => {
  const c = interpretarBusca('art 5 prazo de 30 dias');
  assert.equal(c.numero, 5);
  assert.deepEqual(c.palavras, ['prazo', '30', 'dias']);
});

test('a última palavra vira prefixo, porque ainda está sendo digitada', () => {
  assert.equal(consultasDeTexto(['prescri']).prefixo, 'prescri:*');
  assert.equal(consultasDeTexto(['boa', 'fe']).prefixo, 'boa & fe:*');
  assert.equal(consultasDeTexto(['boa', 'fe']).completa, 'boa & fe');
});

test('palavra com hífen são duas palavras, como no dicionário', () => {
  assert.equal(consultasDeTexto(['boa-fe', 'objetiva']).prefixo, 'boa & fe & objetiva:*');
});

test('caractere de sintaxe digitado por acidente não derruba a consulta', () => {
  assert.equal(consultasDeTexto(['&', 'boa)fé']).prefixo, 'boa & fé:*');
  assert.deepEqual(consultasDeTexto(['&&&']), { completa: '', prefixo: '' });
  assert.deepEqual(consultasDeTexto([]), { completa: '', prefixo: '' });
});
