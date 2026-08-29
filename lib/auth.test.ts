import test from 'node:test';
import assert from 'node:assert/strict';
import { gerarHashSenha, conferirSenha, validarSenha, validarEmail } from './auth.ts';

/** Testes puros: não tocam no banco, então rodam em qualquer ambiente. */

test('senha correta confere', async () => {
  const h = await gerarHashSenha('senha-bem-boa-2026');
  assert.equal(await conferirSenha('senha-bem-boa-2026', h), true);
});

test('senha errada não confere', async () => {
  const h = await gerarHashSenha('senha-bem-boa-2026');
  assert.equal(await conferirSenha('senha-bem-boa-2027', h), false);
});

test('o mesmo texto gera hashes diferentes (sal aleatório)', async () => {
  const a = await gerarHashSenha('mesma-senha');
  const b = await gerarHashSenha('mesma-senha');
  assert.notEqual(a, b, 'sem sal, hashes iguais entregariam senhas iguais');
  assert.equal(await conferirSenha('mesma-senha', a), true);
  assert.equal(await conferirSenha('mesma-senha', b), true);
});

test('o hash guardado não contém a senha em claro', async () => {
  const h = await gerarHashSenha('abacaxi-com-hortela');
  assert.ok(!h.includes('abacaxi'), 'a senha não pode aparecer no hash');
  assert.match(h, /^scrypt\$\d+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
});

test('hash ausente ou malformado nunca confere', async () => {
  assert.equal(await conferirSenha('x', null), false);
  assert.equal(await conferirSenha('x', ''), false);
  assert.equal(await conferirSenha('x', 'texto-solto'), false);
  assert.equal(await conferirSenha('x', 'bcrypt$1$aa$bb'), false, 'outro algoritmo não é aceito');
  assert.equal(await conferirSenha('x', 'scrypt$16384$$'), false);
});

test('acentos normalizados: a senha digitada em outro teclado ainda entra', async () => {
  // "ç" pode vir como um ponto de código ou como c + cedilha combinante
  const composta = 'senha-com-çedilha';
  const decomposta = 'senha-com-çedilha';
  assert.notEqual(composta, decomposta);
  const h = await gerarHashSenha(composta);
  assert.equal(await conferirSenha(decomposta, h), true);
});

test('regras de senha', () => {
  assert.ok(validarSenha('curta'), 'menos de 8 caracteres deve reprovar');
  assert.ok(validarSenha('12345678'), 'só dígitos deve reprovar');
  assert.equal(validarSenha('constitucional88'), null);
  assert.ok(validarSenha('x'.repeat(300)), 'senha absurda deve reprovar');
});

test('regras de e-mail', () => {
  assert.equal(validarEmail('ana@exemplo.com'), null);
  assert.equal(validarEmail('  ana@exemplo.com  '), null, 'espaços nas pontas são tolerados');
  assert.ok(validarEmail('ana@exemplo'), 'sem TLD deve reprovar');
  assert.ok(validarEmail('sem-arroba.com'));
  assert.ok(validarEmail('a@b.c'), 'TLD de 1 letra deve reprovar');
  assert.ok(validarEmail('ana com espaco@exemplo.com'));
});
