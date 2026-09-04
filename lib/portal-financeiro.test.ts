import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Financeiro do portal contra banco real — §5.10.2, etapa 4.
 *
 * A fatura é a promessa do §5.10 em números: licença do contrato,
 * excedente do que foi medido, ajuste com motivo. E a régua de
 * inadimplência é o que dá dente ao "portal suspenso": vencida há mais
 * que a carência, o site sai do ar — sem alguém precisar lembrar.
 */
const { pool, query, queryOne } = await import('./db.ts');
const { assinarPortal, confirmarPagamentoFatura } = await import('./portal-assinatura.ts');
const {
  registrarTrafego, medirArmazenamento, consumoDaCompetencia,
  fecharFatura, listarFaturas, suspenderInadimplentes, alunosDoPortal,
} = await import('./portal-financeiro.ts');
const { competenciaDe, GB } = await import('./portal.ts');

let temBanco = true;
try { await pool.query('SELECT 1 FROM portal_consumo LIMIT 1'); } catch { temBanco = false; }
const talvez = { skip: temBanco ? false : 'banco não disponível' };
process.env.LIMITE_PORTAIS = '50';

let n = 500;
const dados = () => ({
  nome: 'Prof. Fin', email: `teste-fin-${++n}@exemplo.com`,
  senha: 'senha-bem-longa', cnpj: '11.222.333/0001-81',
  telefone: '(11) 98765-4321', rendaMensalCentavos: 800000,
  endereco: { cep: '01310-100', logradouro: 'Av. Paulista', numero: '1000', bairro: 'Bela Vista' },
  mascara: `teste-fin-${n}`, nomeExibicao: 'Portal Fin',
  meio: 'PIX' as const, aceitouContrato: true, ip: '203.0.113.13',
});

async function limparRastros() {
  const meus = `SELECT id FROM portal WHERE mascara LIKE 'teste-fin-%'`;
  await query(`DELETE FROM pedido  WHERE portal_id IN (${meus})`);
  await query(`DELETE FROM licenca WHERE portal_id IN (${meus})`);
  await query(`DELETE FROM preco   WHERE portal_id IN (${meus})`);
  await query(`DELETE FROM materia WHERE portal_id IN (${meus})`);
  await query(`DELETE FROM area    WHERE portal_id IN (${meus})`);
  await query(`DELETE FROM usuario WHERE portal_id IN (${meus})`);
  await query(`DELETE FROM portal  WHERE mascara LIKE 'teste-fin-%'`);
  await query(`DELETE FROM usuario WHERE email LIKE 'teste-fin-%@exemplo.com'`);
  await query(`DELETE FROM evento_gateway WHERE evento_id LIKE 'ev-fin-%'`);
}
if (temBanco) await limparRastros();

/** Portal ATIVO com a 1ª mensalidade paga (competência corrente). */
async function portalAtivo() {
  const r = await assinarPortal(dados());
  await confirmarPagamentoFatura(
    { eventoId: `ev-fin-${n}`, tipo: 'pagamento.confirmado', referencia: r.referencia, centavos: 14900 },
    'simulado', {});
  return r.portalId;
}

const MES_PASSADO = competenciaDe(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));

test('tráfego acumula na competência; armazenamento é foto do disco', talvez, async () => {
  const portalId = await portalAtivo();
  await registrarTrafego(portalId, 1000);
  await registrarTrafego(portalId, 500);
  const c1 = await consumoDaCompetencia(portalId, competenciaDe(new Date()));
  assert.equal(c1.bytesTrafegados, 1500, 'soma, não substitui');

  // Um vídeo local de verdade, num diretório temporário.
  const raiz = await mkdtemp(path.join(tmpdir(), 'ad-video-'));
  await writeFile(path.join(raiz, `teste-fin-${n}.mp4`), Buffer.alloc(4096));
  const [area] = await query<{ id: number }>(
    `INSERT INTO area (portal_id, slug, nome) VALUES ($1, 'a', 'A') RETURNING id`, [portalId]);
  const [mat] = await query<{ id: number }>(
    `INSERT INTO materia (portal_id, area_id, slug, nome, ementa) VALUES ($1, $2, 'm', 'M', 'e') RETURNING id`,
    [portalId, area.id]);
  const [ass] = await query<{ id: number }>(
    `INSERT INTO assunto (portal_id, materia_id, slug, nome) VALUES ($1, $2, 's', 'S') RETURNING id`,
    [portalId, mat.id]);
  await query(
    `INSERT INTO aula (portal_id, assunto_id, slug, titulo, duracao_segundos, resumo, video_provedor, video_id)
     VALUES ($1, $2, 'aula', 'Aula', 60, 'r', 'LOCAL', $3)`,
    [portalId, ass.id, `teste-fin-${n}.mp4`]);

  const bytes = await medirArmazenamento(portalId, raiz);
  assert.equal(bytes, 4096, 'tamanho real do arquivo');
  const c2 = await consumoDaCompetencia(portalId, competenciaDe(new Date()));
  assert.equal(c2.bytesArmazenados, 4096);
  assert.equal(c2.bytesTrafegados, 1500, 'medir armazenamento não mexe na banda');
});

test('fechar competência soma licença + excedente + ajuste, e não fecha duas vezes', talvez, async () => {
  const portalId = await portalAtivo();
  // 400 GB trafegados no mês passado, cota 300 → 100 GB excedentes a R$0,40 = R$40,00
  await registrarTrafego(portalId, 400 * GB, new Date(MES_PASSADO + 'T12:00:00'));

  const f = await fecharFatura('teste', portalId, MES_PASSADO,
    [{ centavos: -1000, motivo: 'desconto acordado' }]);
  assert.ok(f.referencia?.startsWith('PF-'), 'gera cobrança com prefixo de portal');
  assert.equal(f.centavosTotal, 14900 + 4000 - 1000);

  const [linha] = (await listarFaturas(portalId)).filter((x) => x.referencia === f.referencia);
  assert.equal(linha.centavosLicenca, 14900);
  assert.equal(linha.centavosExcedente, 4000);
  assert.equal(linha.centavosAjustes, -1000);
  assert.equal(linha.status, 'FECHADA');
  assert.equal((linha.detalhe as { gbExcedentes: number }).gbExcedentes, 100, 'cálculo gravado');

  await assert.rejects(fecharFatura('teste', portalId, MES_PASSADO), /já está fechada/);
});

test('ajuste sem motivo é recusado — o professor precisa ler o porquê', talvez, async () => {
  const portalId = await portalAtivo();
  await assert.rejects(
    fecharFatura('teste', portalId, MES_PASSADO, [{ centavos: 500, motivo: '' }]),
    /motivo/,
  );
});

test('a fatura fechada paga pelo mesmo webhook da 1ª mensalidade', talvez, async () => {
  const portalId = await portalAtivo();
  const f = await fecharFatura('teste', portalId, MES_PASSADO);
  const r = await confirmarPagamentoFatura(
    { eventoId: `ev-fin-pay-${n}`, tipo: 'pagamento.confirmado', referencia: f.referencia!, centavos: f.centavosTotal },
    'simulado', {});
  assert.equal(r.ok, true);
  const [linha] = (await listarFaturas(portalId)).filter((x) => x.referencia === f.referencia);
  assert.equal(linha.status, 'PAGA');
});

test('régua: vencida vira EM_ATRASO; vencida há mais que a carência suspende o portal', talvez, async () => {
  const portalId = await portalAtivo();
  const f = await fecharFatura('teste', portalId, MES_PASSADO);
  // Vencida há 3 dias: atrasa, mas não suspende.
  await query(`UPDATE portal_fatura SET vencimento = current_date - 3 WHERE referencia = $1`, [f.referencia]);
  let suspensos = await suspenderInadimplentes('teste');
  assert.equal(suspensos.some((s) => s.portalId === portalId), false);
  let st = await queryOne<{ f: string; p: string }>(
    `SELECT (SELECT status FROM portal_fatura WHERE referencia = $1)::text AS f,
            (SELECT status FROM portal WHERE id = $2)::text AS p`, [f.referencia, portalId]);
  assert.equal(st!.f, 'EM_ATRASO');
  assert.equal(st!.p, 'ATIVO', 'dentro da carência o portal fica no ar');

  // Vencida há 11 dias: suspende.
  await query(`UPDATE portal_fatura SET vencimento = current_date - 11 WHERE referencia = $1`, [f.referencia]);
  suspensos = await suspenderInadimplentes('teste');
  assert.equal(suspensos.some((s) => s.portalId === portalId), true);
  st = await queryOne(`SELECT (SELECT status FROM portal_fatura WHERE referencia = $1)::text AS f,
                              (SELECT status FROM portal WHERE id = $2)::text AS p`, [f.referencia, portalId]);
  assert.equal(st!.p, 'SUSPENSO');

  // Pagar a fatura em atraso reativa (confirmarPagamentoFatura já sabia disso).
  await confirmarPagamentoFatura(
    { eventoId: `ev-fin-reativa-${n}`, tipo: 'pagamento.confirmado', referencia: f.referencia!, centavos: 0 },
    'simulado', {});
  const p = await queryOne<{ status: string }>(`SELECT status FROM portal WHERE id = $1`, [portalId]);
  assert.equal(p!.status, 'ATIVO', 'pagou, voltou ao ar');
});

test('alunos do portal: só os dele, com licenças e gasto', talvez, async () => {
  const portalId = await portalAtivo();
  await query(`INSERT INTO usuario (portal_id, nome, email, papel)
               VALUES ($1, 'Aluna do Fin', 'aluno-fin-${n}@exemplo.com', 'aluno')`, [portalId]);
  const alunos = await alunosDoPortal(portalId);
  assert.equal(alunos.length, 1);
  assert.equal(alunos[0].nome, 'Aluna do Fin');
  assert.equal(alunos[0].licencasAtivas, 0);
  assert.equal(alunos[0].gastoCentavos, 0);
  const filtrados = await alunosDoPortal(portalId, 'ninguem');
  assert.equal(filtrados.length, 0);
});

test.after(async () => {
  if (temBanco) await limparRastros();
  await pool.end();
});
