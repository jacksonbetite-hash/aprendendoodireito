import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assinarAcesso, conferirAcesso, urlDeReproducao, idDeVideoValido,
  faixaPedida, tipoDoArquivo, marcaDoAluno,
} from './video.ts';

/**
 * A assinatura é a única coisa entre o acervo e quem não pagou: se ela
 * ceder, §6.3 inteiro vira enfeite. E a faixa de bytes é o que faz a barra
 * de progresso andar — errar ali não é falha de segurança, é o aluno
 * achando que o site está quebrado.
 */

const AGORA = new Date('2026-09-01T12:00:00Z').getTime();
const ALUNO = 42;
const VIDEO = 'aula-controle-constitucionalidade.mp4';

// ---------- Token: o caminho feliz ----------

test('token recém-assinado é aceito e devolve o aluno', () => {
  const { e, t } = assinarAcesso(VIDEO, ALUNO, { agora: AGORA });
  const r = conferirAcesso(VIDEO, { e: String(e), u: String(ALUNO), t }, AGORA);
  assert.equal(r.ok, true);
  assert.equal(r.ok && r.usuarioId, ALUNO);
});

test('visitante (aluno 0) assina e confere — é a amostra gratuita', () => {
  const { e, t } = assinarAcesso(VIDEO, 0, { agora: AGORA });
  const r = conferirAcesso(VIDEO, { e: String(e), u: '0', t }, AGORA);
  assert.equal(r.ok, true);
});

// ---------- Token: o que precisa falhar ----------

test('token expirado é recusado', () => {
  const { e, t } = assinarAcesso(VIDEO, ALUNO, { agora: AGORA, validadeS: 60 });
  const depois = AGORA + 61_000;
  const r = conferirAcesso(VIDEO, { e: String(e), u: String(ALUNO), t }, depois);
  assert.equal(r.ok, false);
  assert.equal(r.ok === false && r.motivo, 'EXPIRADO');
});

test('esticar a expiração na URL não vale: ela está dentro da assinatura', () => {
  const { e, t } = assinarAcesso(VIDEO, ALUNO, { agora: AGORA, validadeS: 60 });
  const esticado = String(e + 86_400);
  const r = conferirAcesso(VIDEO, { e: esticado, u: String(ALUNO), t }, AGORA);
  assert.equal(r.ok, false);
  assert.equal(r.ok === false && r.motivo, 'ASSINATURA');
});

test('token de uma aula não abre outra', () => {
  const { e, t } = assinarAcesso(VIDEO, ALUNO, { agora: AGORA });
  const r = conferirAcesso('aula-de-outra-materia.mp4', { e: String(e), u: String(ALUNO), t }, AGORA);
  assert.equal(r.ok, false);
  assert.equal(r.ok === false && r.motivo, 'ASSINATURA');
});

test('token de um aluno não vale para outro — é o que torna o vazamento rastreável', () => {
  const { e, t } = assinarAcesso(VIDEO, ALUNO, { agora: AGORA });
  const r = conferirAcesso(VIDEO, { e: String(e), u: '43', t }, AGORA);
  assert.equal(r.ok, false);
  assert.equal(r.ok === false && r.motivo, 'ASSINATURA');
});

test('assinatura adulterada cai, mesmo mantendo o tamanho', () => {
  const { e, t } = assinarAcesso(VIDEO, ALUNO, { agora: AGORA });
  const trocado = (t[0] === 'a' ? 'b' : 'a') + t.slice(1);
  const r = conferirAcesso(VIDEO, { e: String(e), u: String(ALUNO), t: trocado }, AGORA);
  assert.equal(r.ok, false);
  assert.equal(r.ok === false && r.motivo, 'ASSINATURA');
});

test('parâmetro faltando é malformado, não exceção', () => {
  for (const p of [
    { e: null, u: '1', t: 'x' },
    { e: '1', u: null, t: 'x' },
    { e: '1', u: '1', t: null },
  ]) {
    const r = conferirAcesso(VIDEO, p, AGORA);
    assert.equal(r.ok, false);
    assert.equal(r.ok === false && r.motivo, 'MALFORMADO');
  }
});

test('lixo no lugar dos números não derruba a rota', () => {
  const r = conferirAcesso(VIDEO, { e: 'amanhã', u: 'eu', t: 'xxx' }, AGORA);
  assert.equal(r.ok, false);
  assert.equal(r.ok === false && r.motivo, 'MALFORMADO');
});

// ---------- Nome de arquivo: a porta da travessia de diretório ----------

test('id de vídeo recusa travessia de diretório e barra', () => {
  for (const ruim of [
    '../../etc/passwd', '..%2Fsegredo', 'pasta/arquivo.mp4', '/absoluto.mp4',
    '', '.oculto', 'com espaço.mp4', 'a'.repeat(200),
  ]) {
    assert.equal(idDeVideoValido(ruim), false, `deveria recusar: ${ruim}`);
  }
});

test('id de vídeo aceita o que a gente realmente usa', () => {
  for (const bom of ['aula-01.mp4', 'CONST_1.2.webm', 'x.m3u8']) {
    assert.equal(idDeVideoValido(bom), true, `deveria aceitar: ${bom}`);
  }
});

test('urlDeReproducao se recusa a assinar id inválido', () => {
  assert.throws(() => urlDeReproducao({ provedor: 'LOCAL', id: '../x.mp4' }, ALUNO));
});

test('urlDeReproducao monta a URL local com os três parâmetros', () => {
  const url = urlDeReproducao({ provedor: 'LOCAL', id: VIDEO }, ALUNO, { agora: AGORA });
  const [caminho, consulta] = url.split('?');
  assert.equal(caminho, `/api/video/${encodeURIComponent(VIDEO)}`);
  const q = new URLSearchParams(consulta);
  assert.equal(q.get('u'), String(ALUNO));
  assert.ok(q.get('e'));
  assert.ok(q.get('t'));
  // e o que ela emite tem que passar na conferência
  const r = conferirAcesso(VIDEO, { e: q.get('e'), u: q.get('u'), t: q.get('t') }, AGORA);
  assert.equal(r.ok, true);
});

// ---------- Marca d'água ----------

test('marca leva o nome e esconde o miolo do e-mail', () => {
  const m = marcaDoAluno('Ana Prado', 'ana.prado@exemplo.com.br');
  assert.match(m, /^Ana Prado · an/);
  assert.ok(m.endsWith('@exemplo.com.br'));
  assert.ok(!m.includes('ana.prado@'), 'não pode entregar o e-mail inteiro');
});

test('marca não quebra com e-mail de usuário curto', () => {
  assert.match(marcaDoAluno('Bê', 'b@x.com'), /^Bê · b/);
  assert.ok(marcaDoAluno('Bê', 'b@x.com').endsWith('@x.com'));
});

test('e-mail sem arroba cai para só o nome, em vez de vazar sujeira na tela', () => {
  assert.equal(marcaDoAluno('Ana', 'nao-e-email'), 'Ana');
});

// ---------- Faixa de bytes ----------

const TAM = 1000;

test('sem cabeçalho Range, serve o arquivo inteiro', () => {
  assert.deepEqual(faixaPedida(null, TAM), { tipo: 'inteiro' });
});

test('faixa comum vira parcial', () => {
  assert.deepEqual(faixaPedida('bytes=100-199', TAM), { tipo: 'parcial', inicio: 100, fim: 199 });
});

test('faixa aberta no fim vai até o último byte', () => {
  assert.deepEqual(faixaPedida('bytes=500-', TAM), { tipo: 'parcial', inicio: 500, fim: 999 });
});

test('sufixo negativo pega o fim do arquivo — é como o player acha o índice do MP4', () => {
  assert.deepEqual(faixaPedida('bytes=-100', TAM), { tipo: 'parcial', inicio: 900, fim: 999 });
});

test('sufixo maior que o arquivo entrega o arquivo todo', () => {
  assert.deepEqual(faixaPedida('bytes=-5000', TAM), { tipo: 'inteiro' });
});

test('fim além do arquivo é truncado, não recusado', () => {
  assert.deepEqual(faixaPedida('bytes=900-99999', TAM), { tipo: 'parcial', inicio: 900, fim: 999 });
});

test('pedir a partir do fim do arquivo é 416', () => {
  assert.deepEqual(faixaPedida('bytes=1000-', TAM), { tipo: 'inaceitavel' });
  assert.deepEqual(faixaPedida('bytes=5000-6000', TAM), { tipo: 'inaceitavel' });
});

test('faixa invertida é 416', () => {
  assert.deepEqual(faixaPedida('bytes=500-100', TAM), { tipo: 'inaceitavel' });
});

test('pedir o arquivo inteiro por Range não vira 206 à toa', () => {
  assert.deepEqual(faixaPedida('bytes=0-999', TAM), { tipo: 'inteiro' });
});

test('unidade que não é bytes é ignorada — responde inteiro, como manda a RFC', () => {
  assert.deepEqual(faixaPedida('itens=0-10', TAM), { tipo: 'inteiro' });
  assert.deepEqual(faixaPedida('bytes=0-10, 20-30', TAM), { tipo: 'inteiro' });
});

// ---------- Content-Type ----------

test('tipo sai da extensão, com queda segura para octet-stream', () => {
  assert.equal(tipoDoArquivo('a.mp4'), 'video/mp4');
  assert.equal(tipoDoArquivo('a.M3U8'), 'application/vnd.apple.mpegurl');
  assert.equal(tipoDoArquivo('a.exe'), 'application/octet-stream');
  assert.equal(tipoDoArquivo('semextensao'), 'application/octet-stream');
});
