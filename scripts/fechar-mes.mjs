#!/usr/bin/env node
/**
 * Fechamento mensal dos portais de professor — §5.10.2, etapa 4.
 *
 *   DATABASE_URL=postgres://... node scripts/fechar-mes.mjs [AAAA-MM]
 *
 * Para cada portal ativo ou suspenso: mede o armazenamento, fecha a
 * competência informada (por padrão, o mês anterior) gerando a cobrança,
 * e roda a régua de inadimplência (§5.10: vencida vira EM_ATRASO; vencida
 * há 10 dias suspende o portal). Idempotente: competência já fechada é
 * pulada com aviso, não erro.
 *
 * Em produção, isto é o cron do dia 1. Em desenvolvimento, é o botão.
 */
const { query, pool } = await import('../lib/db.ts');
const { medirArmazenamento, fecharFatura, suspenderInadimplentes } =
  await import('../lib/portal-financeiro.ts');
const { competenciaAnterior } = await import('../lib/portal.ts');

const arg = process.argv[2];
const competencia = arg ? `${arg}-01` : competenciaAnterior(new Date());
if (!/^\d{4}-\d{2}-01$/.test(competencia)) {
  console.error('uso: node scripts/fechar-mes.mjs [AAAA-MM]');
  process.exit(1);
}

const portais = await query(
  `SELECT id, mascara FROM portal WHERE id <> 0 AND status IN ('ATIVO', 'SUSPENSO') ORDER BY id`);
console.log(`Fechando ${competencia.slice(0, 7)} para ${portais.length} portal(is)…`);

for (const p of portais) {
  const bytes = await medirArmazenamento(p.id);
  try {
    const f = await fecharFatura('script:fechar-mes', p.id, competencia);
    console.log(`✔ ${p.mascara}: ${(bytes / 1024 ** 3).toFixed(2)} GB armazenados · `
      + (f.referencia ? `fatura ${f.referencia} = R$ ${(f.centavosTotal / 100).toFixed(2)}`
                      : 'sem cobrança'));
  } catch (err) {
    console.log(`· ${p.mascara}: ${err.message}`);
  }
}

// §5.6.1 — comissão de vitrine: apura a competência de cada portal com
// contrato, e aprova sozinha o que passou dos 5 dias sem contestação.
const { apurarTodos, aprovarVencidas } = await import('../lib/apuracao.ts');
for (const r of await apurarTodos('script:fechar-mes', competencia)) {
  console.log(`· comissão ${r.mascara}: ${r.resultado}`);
}
const aprovadas = await aprovarVencidas('script:fechar-mes');
if (aprovadas) console.log(`✔ ${aprovadas} apuração(ões) aprovada(s) por decurso do prazo de contestação`);

const suspensos = await suspenderInadimplentes('script:fechar-mes');
console.log(suspensos.length
  ? `⚠ suspensos por inadimplência: ${suspensos.map((s) => s.mascara).join(', ')}`
  : '· nenhum portal suspenso por inadimplência');

await pool.end();
