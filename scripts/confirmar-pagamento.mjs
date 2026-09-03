#!/usr/bin/env node
/**
 * Simula a confirmação que o gateway enviaria, para o fluxo de compra ser
 * testável sem credencial nenhuma.
 *
 *   npm run confirmar-pagamento AD-20260829-A1B2C3
 *
 * Bate no mesmo webhook que um gateway real usa, com a mesma assinatura —
 * o caminho exercitado é o de produção, não um atalho.
 */
import { createHmac, randomBytes } from 'node:crypto';

const referencia = process.argv[2];
if (!referencia) {
  console.error('uso: npm run confirmar-pagamento <REFERENCIA-DO-PEDIDO>');
  process.exit(1);
}

const base = process.env.BASE_URL ?? 'http://localhost:3000';
const segredo = process.env.WEBHOOK_SEGREDO ?? 'segredo-de-desenvolvimento';
const falhar = process.argv.includes('--falhar');

const corpo = JSON.stringify({
  eventoId: 'sim_' + randomBytes(8).toString('hex'),
  tipo: falhar ? 'pagamento.falhou' : 'pagamento.confirmado',
  referencia,
  centavos: 0,
});
const assinatura = 'sha256=' + createHmac('sha256', segredo).update(corpo).digest('hex');

const r = await fetch(`${base}/api/webhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-assinatura': assinatura },
  body: corpo,
});
const resposta = await r.json().catch(() => ({}));

if (!r.ok) {
  console.error(`✘ webhook respondeu ${r.status}:`, resposta);
  process.exit(1);
}
if (resposta.processado) {
  // Referência PF- é fatura de portal de professor (§5.10.2); o resto é
  // pedido de aluno. A resposta do webhook muda de acordo.
  const efeito = resposta.faturaId !== undefined
    ? `fatura ${resposta.faturaId} paga${resposta.portalAtivado ? ' — portal ATIVADO' : ''}`
    : `licença ${resposta.licencaId} emitida`;
  console.log(resposta.jaProcessado
    ? `· evento repetido — nada mudou (${efeito}). É o comportamento correto.`
    : `✔ pagamento confirmado — ${efeito} para ${referencia}`);
} else {
  console.log(`· não processado: ${resposta.motivo}`);
}
