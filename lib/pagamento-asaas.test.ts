import test from 'node:test';
import assert from 'node:assert/strict';
import { criarAsaas } from './pagamento-asaas.ts';

/**
 * O adaptador do Asaas contra uma API de mentira: o que se testa é o
 * MAPEAMENTO — caminhos, cabeçalhos, corpos e a leitura das
 * notificações. Errar um percentual de split aqui é mandar o dinheiro do
 * professor para o lugar errado em produção.
 */

interface Chamada { metodo: string; url: string; corpo: unknown }

function apiFalsa(respostas: Record<string, unknown>) {
  const chamadas: Chamada[] = [];
  const fetchFn = (async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    chamadas.push({ metodo: init?.method ?? 'GET', url: u, corpo: init?.body ? JSON.parse(String(init.body)) : undefined });
    const chave = Object.keys(respostas).find((k) => u.endsWith(k) || new RegExp(k).test(u));
    if (!chave) return new Response(JSON.stringify({ errors: [{ description: 'rota inesperada ' + u }] }), { status: 404 });
    return new Response(JSON.stringify(respostas[chave]), { status: 200 });
  }) as typeof fetch;
  return { chamadas, fetchFn };
}

const cfg = { apiKey: '$aact_hmlg_teste', ambiente: 'sandbox' as const, webhookToken: 'token-de-webhook-bem-longo-1234567890abcdef' };

test('cobrança Pix: cliente → cobrança com split → QR code, no sandbox, com access_token', async () => {
  const api = apiFalsa({
    '/customers': { id: 'cus_1' },
    '/payments/pay_1/pixQrCode': { payload: '000201BRCODE', expirationDate: '2026-09-05 23:59:59' },
    '/payments': { id: 'pay_1', status: 'PENDING', invoiceUrl: 'https://sandbox.asaas.com/i/pay_1' },
  });
  const asaas = criarAsaas({ ...cfg, fetchFn: api.fetchFn });
  const r = await asaas.criarCobranca({
    referencia: 'AD-1', centavos: 3990, meio: 'PIX', descricao: 'Licença', emailPagador: 'a@x.com',
    documentoPagador: '529.982.247-25', nomePagador: 'Ana',
    split: { walletId: 'wal_prof', percentualRetido: 15 },
  });

  assert.equal(r.idExterno, 'pay_1');
  assert.equal(r.copiaECola, '000201BRCODE');
  assert.equal(r.linkPagamento, 'https://sandbox.asaas.com/i/pay_1');

  const [cliente, cobranca, qr] = api.chamadas;
  assert.ok(cliente.url.startsWith('https://api-sandbox.asaas.com/v3/'), 'sandbox');
  assert.equal((cliente.corpo as { cpfCnpj: string }).cpfCnpj, '52998224725', 'documento sem pontuação');
  assert.equal(cobranca.metodo, 'POST');
  const corpo = cobranca.corpo as { customer: string; billingType: string; value: number; externalReference: string; split: { walletId: string; percentualValue: number }[] };
  assert.equal(corpo.customer, 'cus_1');
  assert.equal(corpo.billingType, 'PIX');
  assert.equal(corpo.value, 39.9, 'centavos viram reais');
  assert.equal(corpo.externalReference, 'AD-1', 'a referência é o que o webhook devolve');
  assert.equal(corpo.split[0].walletId, 'wal_prof');
  assert.equal(corpo.split[0].percentualValue, 85, 'retemos 15 → o professor recebe 85');
  assert.equal(qr.metodo, 'GET');
});

test('cabeçalho de autenticação é access_token com a chave', async () => {
  let cabecalhos: Record<string, string> = {};
  const fetchFn = (async (_u: unknown, init?: RequestInit) => {
    cabecalhos = init?.headers as Record<string, string>;
    return new Response(JSON.stringify({ id: 'cus_1' }), { status: 200 });
  }) as typeof fetch;
  const asaas = criarAsaas({ ...cfg, fetchFn });
  await asaas.criarSubconta({
    nome: 'Prof', email: 'p@x.com', cnpj: '11.222.333/0001-81', telefone: '11999999999',
    rendaMensalCentavos: 500000, endereco: { cep: '01001000', logradouro: 'Rua A', numero: '1', bairro: 'Centro' },
  }).catch(() => {});
  assert.equal(cabecalhos['access_token'], '$aact_hmlg_teste');
});

test('sem documento do pagador, a cobrança nem sai — com mensagem para o aluno', async () => {
  const api = apiFalsa({});
  const asaas = criarAsaas({ ...cfg, fetchFn: api.fetchFn });
  await assert.rejects(
    asaas.criarCobranca({ referencia: 'AD-2', centavos: 100, meio: 'PIX', descricao: 'x', emailPagador: 'a@x.com' }),
    /CPF ou CNPJ/,
  );
  assert.equal(api.chamadas.length, 0, 'nenhuma chamada ao gateway');
});

test('cartão: cobrança CREDIT_CARD com link da página de pagamento, sem QR', async () => {
  const api = apiFalsa({ '/customers': { id: 'cus_1' }, '/payments': { id: 'pay_2', status: 'PENDING', invoiceUrl: 'https://x/i/pay_2' } });
  const asaas = criarAsaas({ ...cfg, fetchFn: api.fetchFn });
  const r = await asaas.criarCobranca({
    referencia: 'AD-3', centavos: 14900, meio: 'CARTAO', descricao: 'Portal', emailPagador: 'p@x.com', documentoPagador: '11222333000181',
  });
  assert.equal((api.chamadas[1].corpo as { billingType: string }).billingType, 'CREDIT_CARD');
  assert.equal(r.copiaECola, undefined);
  assert.equal(r.linkPagamento, 'https://x/i/pay_2');
});

test('subconta: exige KYC completo e manda os campos que o Asaas pede', async () => {
  const api = apiFalsa({ '/accounts': { id: 'acc_1', walletId: 'wal_1', apiKey: 'segredo' } });
  const asaas = criarAsaas({ ...cfg, fetchFn: api.fetchFn });
  await assert.rejects(
    asaas.criarSubconta({ nome: 'P', email: 'p@x.com', cnpj: '11222333000181' }),
    /faltam: telefone, renda mensal, CEP/,
  );
  const r = await asaas.criarSubconta({
    nome: 'Prof', email: 'p@x.com', cnpj: '11.222.333/0001-81', telefone: '11999999999',
    rendaMensalCentavos: 500000, endereco: { cep: '01001-000', logradouro: 'Rua A', numero: '10', bairro: 'Centro' },
  });
  assert.deepEqual(r, { idExterno: 'acc_1', walletId: 'wal_1' }, 'apiKey da subconta NÃO é devolvida nem guardada');
  const corpo = api.chamadas[0].corpo as { cpfCnpj: string; incomeValue: number; postalCode: string; companyType: string };
  assert.equal(corpo.cpfCnpj, '11222333000181');
  assert.equal(corpo.incomeValue, 5000);
  assert.equal(corpo.companyType, 'LIMITED');
});

test('escrow: POST /accounts/{id}/escrow com o prazo do contrato, taxa por nossa conta', async () => {
  const api = apiFalsa({ '/accounts/acc_1/escrow': {} });
  const asaas = criarAsaas({ ...cfg, fetchFn: api.fetchFn });
  await asaas.habilitarEscrow('acc_1', 30);
  assert.deepEqual(api.chamadas[0].corpo, { enabled: true, isFeePayer: false, daysToExpire: 30 });
});

test('repasse: POST /transfers para a carteira do professor, com a referência da apuração', async () => {
  const api = apiFalsa({ '/transfers': { id: 'tra_9' } });
  const asaas = criarAsaas({ ...cfg, fetchFn: api.fetchFn });
  const r = await asaas.transferir({ walletId: 'wal_prof', centavos: 11205, descricao: 'Comissão abril', referencia: 'APU-7' });
  assert.equal(r.idExterno, 'tra_9');
  assert.deepEqual(api.chamadas[0].corpo,
    { value: 112.05, walletId: 'wal_prof', description: 'Comissão abril', externalReference: 'APU-7' });
});

test('reembolso vai ao gateway com o valor em reais', async () => {
  const api = apiFalsa({ '/payments/pay_1/refund': { status: 'REFUNDED' } });
  const asaas = criarAsaas({ ...cfg, fetchFn: api.fetchFn });
  await asaas.reembolsar('pay_1', 3990);
  assert.deepEqual(api.chamadas[0].corpo, { value: 39.9 });
});

test('webhook: só passa com o authToken exato no cabeçalho', () => {
  const asaas = criarAsaas(cfg);
  assert.equal(asaas.validarAssinatura('{}', cfg.webhookToken), true);
  assert.equal(asaas.validarAssinatura('{}', 'outro-token-igualmente-longo-000000000000'), false);
  assert.equal(asaas.validarAssinatura('{}', null), false);
});

test('eventos de cobrança: CONFIRMED/RECEIVED confirmam, OVERDUE falha, CREATED é ignorado', () => {
  const asaas = criarAsaas(cfg);
  const pago = asaas.interpretarEvento({ id: 'evt_1', event: 'PAYMENT_RECEIVED', payment: { id: 'pay_1', externalReference: 'AD-9', value: 39.9 } });
  assert.deepEqual(pago, { eventoId: 'evt_1', tipo: 'pagamento.confirmado', referencia: 'AD-9', centavos: 3990 });
  assert.equal(asaas.interpretarEvento({ id: 'evt_2', event: 'PAYMENT_OVERDUE', payment: { id: 'pay_1', externalReference: 'AD-9' } })?.tipo, 'pagamento.falhou');
  assert.equal(asaas.interpretarEvento({ id: 'evt_3', event: 'PAYMENT_CREATED', payment: { id: 'pay_1', externalReference: 'AD-9' } }), null);
  assert.equal(asaas.interpretarEvento({ event: 'PAYMENT_RECEIVED', payment: { id: 'pay_1' } }), null, 'sem referência não há o que confirmar');
});

test('eventos de subconta: aprovação e recusa pelo status geral', () => {
  const asaas = criarAsaas(cfg);
  assert.equal(asaas.interpretarEvento({ id: 'evt_a', event: 'ACCOUNT_STATUS_DOCUMENT_APPROVED', account: { id: 'acc_1', status: { general: 'APPROVED' } } })?.tipo, 'subconta.aprovada');
  assert.equal(asaas.interpretarEvento({ id: 'evt_b', event: 'ACCOUNT_STATUS_COMMERCIAL_INFO_REJECTED', account: { id: 'acc_1', generalStatus: 'REJECTED' } })?.tipo, 'subconta.recusada');
  assert.equal(asaas.interpretarEvento({ id: 'evt_c', event: 'ACCOUNT_STATUS_DOCUMENT_APPROVED', account: { id: 'acc_1', status: { general: 'PENDING' } } }), null, 'aprovação parcial não libera venda');
});

test('erro do gateway vira mensagem legível, com a descrição que ele mandou', async () => {
  const fetchFn = (async () => new Response(JSON.stringify({ errors: [{ description: 'invalid_cpfCnpj: CPF inválido' }] }), { status: 400 })) as typeof fetch;
  const asaas = criarAsaas({ ...cfg, fetchFn });
  await assert.rejects(asaas.habilitarEscrow('acc_1', 30), /400: invalid_cpfCnpj/);
});
