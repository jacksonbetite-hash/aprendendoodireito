/**
 * Verificação de ponta a ponta — cadastro de conteúdo pela retaguarda.
 *
 * Cobre o que passou a existir quando blog (§5.5), mural de vagas
 * (§5.7.1), catálogo (§4) e portais de professor (§5.10) deixaram de vir
 * só de seed SQL. Três coisas que só aparecem no navegador:
 *
 * 1. O MENU RESPONDE AO CLIQUE. O realce era fixado no código e nunca
 *    saía de "Dashboard" — quem clicava em "Preços" via a página trocar e
 *    o menu não. Aqui cada item é clicado e o realce é conferido.
 * 2. O QUE SE PUBLICA CHEGA AO SITE. Criar o artigo é metade; a outra é a
 *    página pública responder — e sumir quando o artigo é arquivado.
 * 3. A MODERAÇÃO DE VAGA SEGURA MESMO. Vaga em moderação não pode
 *    aparecer no mural, e aprovar precisa colocá-la lá.
 *
 * Roda contra a aplicação de pé (docker compose up -d), com Playwright:
 *
 *   SENHA_ADMIN=... node testes-e2e/retaguarda.mjs
 */
import { chromium } from 'playwright-core';

const senha = process.env.SENHA_ADMIN;
if (!senha) {
  console.error('defina SENHA_ADMIN (a senha impressa por scripts/criar-admin.mjs)');
  process.exit(2);
}

const base = process.env.BASE_URL ?? 'http://localhost:3000';
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await ctx.newPage();

const erros = [];
p.on('pageerror', (e) => erros.push('pageerror: ' + e.message));
p.on('console', (m) => {
  const t = m.text();
  if (m.type() === 'error' && !/hmr|Failed to load resource/.test(t)) erros.push('console: ' + t);
});

let falhas = 0;
const check = (c, m) => { if (!c) falhas++; console.log((c ? '✔' : '✘') + ' ' + m); };
const ir = async (rota) => (await p.goto(base + rota, { waitUntil: 'networkidle' }))?.status() ?? 0;

// ---------- entra como admin ----------
await ir('/entrar');
await p.fill('input[name=email]', 'admin@aprimoreosaber.com.br');
await p.fill('input[name=senha]', senha);
await p.click('form.formulario button[type=submit]');
await p.waitForURL('**/painel*', { timeout: 20000 });

// ---------- o menu responde ao clique ----------
await ir('/admin');
for (const [rotulo, esperado] of [
  ['Cursos e aulas', '/admin/cursos'],
  ['Blog', '/admin/blog'],
  ['Mural de vagas', '/admin/vagas'],
  ['Preços', '/admin/precos'],
  ['Licenças', '/admin/licencas'],
  ['Alunos', '/admin/alunos'],
  ['Portais de professor', '/admin/portais'],
  ['Visão geral', '/admin'],
]) {
  await p.locator(`aside.lateral a:has-text("${rotulo}")`).first().click();
  await p.waitForTimeout(1500);
  const url = new URL(p.url()).pathname;
  const aceso = (await p.locator('.item-lateral.ativo').allTextContents()).map((t) => t.trim());
  check(url === esperado && aceso.length === 1 && aceso[0].includes(rotulo),
    `menu "${rotulo}" abre ${url} e acende só ele`);
}

// ---------- blog: cadastrar, publicar, arquivar ----------
const carimbo = Date.now();
await ir('/admin/blog/novo');
await p.fill('input[name=titulo]', `Teste de cadastro ${carimbo}`);
await p.fill('textarea[name=resumo]',
  'Artigo criado pelo teste de ponta a ponta para conferir o cadastro do blog pela retaguarda.');
await p.fill('textarea[name=corpo]',
  'Parágrafo do artigo de teste, com texto suficiente para passar da validação mínima. '.repeat(4));
await p.selectOption('select[name=categoriaId]', { index: 1 });
await p.fill('input[name=autorNome]', 'Teste automatizado');
await p.selectOption('select[name=status]', 'publicado');
await p.click('form.form-editor button[type=submit]');
await p.waitForTimeout(3000);
check(/\/admin\/blog\/\d+/.test(p.url()), 'blog: artigo criado e aberto para edição');

const slug = (await p.locator('code').first().textContent())?.replace('/blog/', '').trim();
check(Boolean(slug) && slug.startsWith('teste-de-cadastro'),
  `blog: endereço derivado do título (${slug})`);
check((await ir(`/blog/${slug}`)) === 200, 'blog: artigo publicado responde no site');

await ir('/admin/blog?status=publicado');
await p.locator(`table.tabela tbody tr:has-text("${carimbo}")`)
  .locator('button:has-text("Arquivar")').click();
await p.waitForTimeout(2500);
check((await ir(`/blog/${slug}`)) === 404, 'blog: arquivado sai do site');

// ---------- vagas: a moderação prévia do §5.7.1 ----------
await ir('/admin/vagas/nova');
await p.fill('input[name=titulo]', `Estágio de teste ${carimbo}`);
await p.fill('input[name=areaAtuacao]', 'Trabalhista');
await p.fill('input[name=empresa]', 'Escritório de Teste');
await p.fill('input[name=cidade]', 'São Paulo');
await p.fill('input[name=uf]', 'SP');
await p.fill('textarea[name=descricao]',
  'Vaga criada pelo teste de ponta a ponta para conferir a fila de moderação do mural.');
await p.fill('textarea[name=requisitos]', 'Cursando Direito a partir do 5º semestre.');
await p.fill('input[name=comoCandidatar]', 'rh@exemplo.com.br');
await p.click('form.form-editor button[type=submit]');
await p.waitForTimeout(3000);
check(/\/admin\/vagas\/\d+/.test(p.url()), 'vagas: vaga cadastrada');
const idVaga = p.url().match(/vagas\/(\d+)/)?.[1];

const muralAntes = await (await fetch(`${base}/vagas`)).text();
check(!muralAntes.includes(`Estágio de teste ${carimbo}`),
  'vagas: em moderação NÃO aparece no mural — a aprovação é prévia');

await p.locator('form:has(input[name=dias]) button:has-text("Aprovar")').first().click();
await p.waitForTimeout(3000);
const muralDepois = await (await fetch(`${base}/vagas`)).text();
check(muralDepois.includes(`Estágio de teste ${carimbo}`), 'vagas: aprovada entra no mural');

await ir(`/admin/vagas/${idVaga}`);
await p.locator('button:has-text("Remover")').first().click();
await p.waitForTimeout(600);
await p.fill('input[name=motivo]', 'Vaga do teste automatizado.');
await p.click('button:has-text("Confirmar recusa")');
await p.waitForTimeout(2500);
const muralLimpo = await (await fetch(`${base}/vagas`)).text();
check(!muralLimpo.includes(`Estágio de teste ${carimbo}`), 'vagas: removida sai do mural');

// ---------- catálogo ----------
check((await ir('/admin/cursos')) === 200, 'cursos: a tela do acervo abre');
const hrefCurso = await p.locator('table.tabela a[href^="/admin/cursos/"]').first()
  .getAttribute('href');
check((await ir(hrefCurso)) === 200, 'cursos: a tela do curso abre');
check((await p.locator('h2:has-text("Assuntos")').count()) === 1, 'cursos: assuntos no curso');
check((await p.locator('h2:has-text("Aulas")').count()) === 1, 'cursos: aulas no curso');

const hrefAula = await p.locator('a[href^="/admin/cursos/aula/"]').first()
  .getAttribute('href').catch(() => null);
if (hrefAula) {
  check((await ir(hrefAula)) === 200, 'cursos: a tela da aula abre');
  check((await p.locator('select[name=videoProvedor]').count()) === 1,
    'cursos: o vídeo é provedor + identificador, nunca URL crua (§10)');
  await p.click('button:has-text("Adicionar questão")');
  await p.waitForTimeout(1000);
  check((await p.locator('textarea[name=comentario0]').count()) === 1,
    'cursos: comentário por alternativa, inclusive nas erradas (§5.3)');
}

// ---------- portais de professor ----------
check((await ir('/admin/portais')) === 200, 'portais: a tela abre');
check((await p.locator('h2:has-text("Planos comerciais")').count()) === 1,
  'portais: os planos comerciais estão na tela');
const hrefPortal = await p.locator('table.tabela a[href^="/admin/portais/"]').first()
  .getAttribute('href').catch(() => null);
if (hrefPortal) {
  check((await ir(hrefPortal)) === 200, 'portais: a tela do portal abre');
  for (const secao of ['Dados do portal', 'A página do professor', 'Preços do portal', 'Contrato']) {
    check((await p.locator(`h2:has-text("${secao}")`).count()) === 1, `portal: seção "${secao}"`);
  }
  check((await p.locator('select[name=produto]').count()) === 1,
    'portal: o preço do portal é editável, separado do da plataforma (§5.10)');
}

console.log('\nerros de página: ' + (erros.length ? '\n' + erros.join('\n') : 'nenhum'));
console.log(falhas === 0 ? '\n✔ retaguarda: tudo passou' : `\n✘ ${falhas} falha(s)`);
await b.close();
process.exit(falhas || erros.length ? 1 : 0);
