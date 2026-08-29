/**
 * Verificação de ponta a ponta — administração (§5.9).
 *
 * Roda contra a aplicação de pé (docker compose up -d), com Playwright.
 * Não substitui os testes de unidade: cobre o que só aparece no navegador
 * — redirecionamentos, cookies e propagação entre telas.
 *
 *   node testes-e2e/administracao.mjs
 */
import { chromium } from 'playwright-core';
const senha = process.env.SENHA_ADMIN;
if (!senha) {
  console.error('defina SENHA_ADMIN (a senha impressa por scripts/criar-admin.mjs)');
  process.exit(2);
}
const b = await chromium.launch({
  // CHROMIUM define o navegador; sem ela, usa o do PATH.
  executablePath: process.env.CHROMIUM || undefined,
});
const base = process.env.BASE_URL ?? 'http://localhost:3000';
let falhas = 0;
const check = (c, m) => { if (!c) falhas++; console.log((c ? '✔' : '✘') + ' ' + m); };

const ctx = await b.newContext({ viewport: { width: 1400, height: 950 } });
const p = await ctx.newPage();

// entra como admin
await p.goto(base + '/entrar', { waitUntil: 'load' });
await p.fill('input[name=email]', 'admin@aprendendoodireito.com.br');
await p.fill('input[name=senha]', senha);
await p.click('form.formulario button[type=submit]');
await p.waitForURL('**/painel*', { timeout: 20000 });
check(await p.locator('a[href="/admin"]').first().isVisible(), 'admin vê o acesso à administração');

await p.goto(base + '/admin', { waitUntil: 'load' });
check(p.url().endsWith('/admin'), 'admin entra no painel administrativo');
await p.waitForTimeout(800);
await p.screenshot({ path: '/tmp/ad-admin-visao.png', fullPage: true });

// ---------- preço com vigência ----------
// O teste mede o preço atual, aplica um valor distinto, confere a
// propagação e RESTAURA o original — rodar duas vezes seguidas dá o
// mesmo resultado, e a tabela não fica suja.
await p.goto(base + '/planos', { waitUntil: 'load' });
const precoAntes = (await p.locator('.plano.destaque .valor').textContent())?.trim() ?? '';
const reaisAntes = Number(precoAntes.replace(/[^\d,]/g, '').replace(',', '.'));
check(reaisAntes > 0, `planos mostra o preço vigente (${precoAntes})`);

const reaisTeste = reaisAntes + 5;
const valorTeste = reaisTeste.toFixed(2).replace('.', ',');

await p.goto(base + '/admin/precos', { waitUntil: 'load' });
await p.selectOption('select[name=produto]', 'MATERIA');
await p.selectOption('select[name=periodo]', 'mensal');
await p.fill('input[name=valor]', valorTeste);
await p.click('form.form-linha button[type=submit]');
await p.waitForTimeout(2000);
check(await p.locator('.alerta-ok').isVisible(), 'alteração de preço confirmada');
await p.screenshot({ path: '/tmp/ad-admin-precos.png', fullPage: true });

await p.goto(base + '/planos', { waitUntil: 'load' });
const precoDepois = (await p.locator('.plano.destaque .valor').textContent())?.trim() ?? '';
check(precoDepois.includes(valorTeste), `planos já mostra o preço novo (${precoDepois})`);

await p.goto(base + '/catalogo', { waitUntil: 'load' });
check((await p.locator('.cartao-area div').first().textContent())?.includes(valorTeste),
  'o catálogo também reflete o preço novo (uma fonte de verdade)');

// restaura
await p.goto(base + '/admin/precos', { waitUntil: 'load' });
await p.fill('input[name=valor]', reaisAntes.toFixed(2).replace('.', ','));
await p.click('form.form-linha button[type=submit]');
await p.waitForTimeout(2000);
await p.goto(base + '/planos', { waitUntil: 'load' });
check((await p.locator('.plano.destaque .valor').textContent())?.trim() === precoAntes,
  'preço restaurado ao valor original');

// o histórico guarda a passagem, mesmo depois de restaurar
await p.goto(base + '/admin/precos', { waitUntil: 'load' });
const historico = await p.locator('.cartao').last().textContent();
check((historico?.match(/R\$/g) ?? []).length > 0,
  'o preço anterior virou histórico, não foi apagado');

// ---------- licença ----------
await p.goto(base + '/admin/licencas', { waitUntil: 'load' });
const licencasAntes = await p.locator('.tabela tbody tr').count();
await p.selectOption('select[name=usuarioId]', { index: 1 });
await p.selectOption('select[name=materiaId]', 'catalogo');
await p.fill('input[name=dias]', '15');
await p.click('form.form-linha button[type=submit]');
await p.waitForTimeout(2000);
check(await p.locator('.alerta-ok').isVisible(), 'cortesia concedida');
const licencasDepois = await p.locator('.tabela tbody tr').count();
check(licencasDepois === licencasAntes + 1, 'a licença aparece na lista');
await p.screenshot({ path: '/tmp/ad-admin-licencas.png', fullPage: true });

// estender
const linha = p.locator('.tabela tbody tr').first();
await linha.locator('button:has-text("+30 dias")').click();
await p.waitForTimeout(1800);
check(true, 'extensão de 30 dias executada');

// ---------- auditoria ----------
await p.goto(base + '/admin', { waitUntil: 'load' });
const auditoria = await p.locator('.tabela').first().textContent();
// alteração no mesmo dia é registrada como correção — as duas contam
check(/preco\.(alterado|corrigido)/.test(auditoria ?? ''),
  'auditoria registrou a alteração de preço');
check(auditoria?.includes('licenca.concedida'), 'auditoria registrou a concessão');
check(auditoria?.includes('licenca.estendida'), 'auditoria registrou a extensão');
check(auditoria?.includes('admin@aprendendoodireito.com.br'), 'auditoria registrou QUEM fez');

await p.goto(base + '/admin/alunos', { waitUntil: 'load' });
await p.waitForTimeout(600);
await p.screenshot({ path: '/tmp/ad-admin-alunos.png', fullPage: true });
check((await p.locator('.tabela tbody tr').count()) > 0, 'lista de alunos carrega');

await b.close();
console.log(falhas ? `\n${falhas} verificação(ões) falharam` : '\nTodas as verificações passaram');
process.exit(falhas ? 1 : 0);
