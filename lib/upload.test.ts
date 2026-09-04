import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extensaoAceita, nomeNoVolume, pertenceAoPortal, idDeImagemValido, tipoMime,
} from './upload.ts';
import { idDeVideoValido } from './video.ts';

/**
 * O nome do arquivo vira caminho no disco e id assinado no player. Se
 * esta parte ceder, o upload vira escrita arbitrária no volume — o resto
 * do §10 não importa mais.
 */

test('só extensões de vídeo conhecidas entram como vídeo', () => {
  assert.equal(extensaoAceita('video', 'Aula 01.MP4'), 'mp4');
  assert.equal(extensaoAceita('video', 'aula.webm'), 'webm');
  assert.equal(extensaoAceita('video', 'aula.mkv'), null);
  assert.equal(extensaoAceita('video', 'aula.png'), null);
  assert.equal(extensaoAceita('video', 'semextensao'), null);
});

test('só imagens conhecidas entram como imagem', () => {
  assert.equal(extensaoAceita('imagem', 'foto.JPG'), 'jpg');
  assert.equal(extensaoAceita('imagem', 'foto.svg'), null, 'SVG executa script — fora');
  assert.equal(extensaoAceita('imagem', 'foto.mp4'), null);
});

test('o nome no volume passa na validação do player e carrega o portal', () => {
  const nome = nomeNoVolume('video', 7, 'mp4', 42);
  assert.ok(idDeVideoValido(nome), nome);
  assert.ok(nome.startsWith('p7-a42-'));
  assert.ok(nome.endsWith('.mp4'));
  assert.ok(pertenceAoPortal(nome, 7));
  assert.ok(!pertenceAoPortal(nome, 70), 'p70- não é p7-');
});

test('nome de imagem também é seguro e reconhecível', () => {
  const nome = nomeNoVolume('imagem', 3, 'png');
  assert.ok(idDeImagemValido(nome));
  assert.ok(nome.startsWith('p3-foto-'));
});

test('dois envios nunca colidem no nome', () => {
  assert.notEqual(nomeNoVolume('video', 1, 'mp4', 1), nomeNoVolume('video', 1, 'mp4', 1));
});

test('id de imagem recusa barra e ..', () => {
  assert.equal(idDeImagemValido('../etc/passwd'), false);
  assert.equal(idDeImagemValido('a/b.png'), false);
  assert.equal(idDeImagemValido('p1-foto-abc.png'), true);
});

test('tipo MIME sai da extensão', () => {
  assert.equal(tipoMime('video', 'webm'), 'video/webm');
  assert.equal(tipoMime('imagem', 'jpg'), 'image/jpeg');
});
