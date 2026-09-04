import { timingSafeEqual } from 'node:crypto';
import type {
  Provedor, Cobranca, CobrancaCriada, EventoPagamento, DadosSubconta, SubcontaCriada,
} from './pagamento.ts';

/**
 * Adaptador do Asaas — §8.2 (gateway escolhido pelo critério da Conta
 * Escrow) e §5.10.2 (subconta, split, escrow).
 *
 * Escrito contra a documentação pública (setembro/2026) e testado contra
 * uma API simulada em `pagamento-asaas.test.ts`: os caminhos, cabeçalhos
 * e corpos batem com a referência; o que só o sandbox confirma está
 * marcado com "CONFIRMAR NO SANDBOX". Liga-se com três variáveis:
 *
 *   PROVEDOR_PAGAMENTO=asaas
 *   ASAAS_API_KEY=$aact_hmlg_…   (sandbox) ou $aact_prod_… (produção)
 *   ASAAS_AMBIENTE=sandbox|producao
 *   ASAAS_WEBHOOK_TOKEN=…        (o authToken cadastrado no webhook)
 *
 * Duas regras de mapeamento que importam:
 *
 * - SPLIT. A cobrança é criada pela NOSSA conta; `split[].percentualValue`
 *   manda a parte do professor para a carteira dele e quem cria fica com
 *   o restante. Então `percentualRetido` (o nosso) vira
 *   `100 − percentualRetido` para a carteira do professor.
 * - IDEMPOTÊNCIA. Cada notificação vira um evento com id próprio
 *   (`evt_…`); PAYMENT_CONFIRMED e PAYMENT_RECEIVED chegam os dois para a
 *   mesma cobrança — o checkout já trata o segundo como no-op (§8.3).
 */

export interface ConfiguracaoAsaas {
  apiKey: string;
  ambiente: 'sandbox' | 'producao';
  webhookToken: string;
  /** Injetável nos testes. */
  fetchFn?: typeof fetch;
}

const BASES = {
  sandbox: 'https://api-sandbox.asaas.com/v3',
  producao: 'https://api.asaas.com/v3',
};

/** Só dígitos/letras do documento — o Asaas não aceita pontuação. */
const limparDocumento = (d: string) => d.replace(/[.\/\- ]/g, '').toUpperCase();

export function criarAsaas(cfg: ConfiguracaoAsaas): Provedor {
  const base = BASES[cfg.ambiente];
  const fetchFn = cfg.fetchFn ?? fetch;

  async function chamar<T>(metodo: 'GET' | 'POST', caminho: string, corpo?: unknown): Promise<T> {
    const r = await fetchFn(base + caminho, {
      method: metodo,
      headers: {
        'access_token': cfg.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'AprimoreOSaber/1.0',
      },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
    const texto = await r.text();
    let json: unknown = null;
    try { json = texto ? JSON.parse(texto) : null; } catch { /* corpo não JSON */ }
    if (!r.ok) {
      const erros = (json as { errors?: { description?: string }[] } | null)?.errors;
      const descricao = erros?.map((e) => e.description).filter(Boolean).join('; ') || texto.slice(0, 200);
      throw new Error(`Asaas ${metodo} ${caminho} → ${r.status}: ${descricao}`);
    }
    return json as T;
  }

  /**
   * O cliente da cobrança. O Asaas exige `cpfCnpj` — é por isso que o
   * checkout precisa do documento do pagador antes de ir ao gateway
   * real (§12.1: CPF pedido na compra, não no cadastro).
   */
  async function clientePara(c: Cobranca): Promise<string> {
    if (!c.documentoPagador) {
      throw new Error('O meio de pagamento exige CPF ou CNPJ do pagador. Informe o documento para continuar.');
    }
    const r = await chamar<{ id: string }>('POST', '/customers', {
      name: c.nomePagador ?? c.emailPagador,
      email: c.emailPagador,
      cpfCnpj: limparDocumento(c.documentoPagador),
      externalReference: c.emailPagador,
      notificationDisabled: true,   // quem avisa o aluno somos nós
    });
    return r.id;
  }

  return {
    nome: 'asaas',
    cobraDeVerdade: true,

    async criarCobranca(c) {
      const customer = await clientePara(c);
      const vencimento = new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10);
      const corpo: Record<string, unknown> = {
        customer,
        billingType: c.meio === 'CARTAO' ? 'CREDIT_CARD' : 'PIX',
        value: c.centavos / 100,
        dueDate: vencimento,
        description: c.descricao,
        externalReference: c.referencia,
      };
      if (c.split) {
        corpo.split = [{
          walletId: c.split.walletId,
          // Quem cria a cobrança fica com o restante: a parte do professor
          // é o complemento do que retemos.
          percentualValue: Number((100 - c.split.percentualRetido).toFixed(2)),
          externalReference: c.referencia,
        }];
      }
      const pagamento = await chamar<{ id: string; invoiceUrl?: string; status: string }>('POST', '/payments', corpo);

      if (c.meio === 'PIX') {
        const qr = await chamar<{ payload: string; expirationDate: string }>('GET', `/payments/${pagamento.id}/pixQrCode`);
        return {
          idExterno: pagamento.id,
          copiaECola: qr.payload,
          instrucao: 'Pague com Pix pelo código abaixo. A liberação é automática em segundos.',
          expiraEm: new Date(qr.expirationDate),
          linkPagamento: pagamento.invoiceUrl,
        };
      }
      return {
        idExterno: pagamento.id,
        instrucao: 'Pague com cartão na página segura do meio de pagamento. O acesso libera na confirmação.',
        expiraEm: new Date(vencimento + 'T23:59:59-03:00'),
        linkPagamento: pagamento.invoiceUrl,
      };
    },

    async reembolsar(idExterno, centavos) {
      await chamar('POST', `/payments/${idExterno}/refund`, { value: centavos / 100 });
    },

    /**
     * A subconta exige os dados de KYC do responsável. Sem eles não há
     * conta — e é melhor recusar aqui, com a lista do que falta, do que
     * receber um 400 genérico do gateway.
     */
    async criarSubconta(d: DadosSubconta) {
      const faltam = [
        !d.cnpj && 'CNPJ', !d.telefone && 'telefone', !d.rendaMensalCentavos && 'renda mensal',
        !d.endereco?.cep && 'CEP', !d.endereco?.logradouro && 'endereço',
        !d.endereco?.numero && 'número', !d.endereco?.bairro && 'bairro',
      ].filter(Boolean);
      if (faltam.length) throw new Error(`Para abrir a conta de recebimento faltam: ${faltam.join(', ')}.`);
      const r = await chamar<{ id: string; walletId: string; apiKey?: string }>('POST', '/accounts', {
        name: d.nome,
        email: d.email,
        cpfCnpj: limparDocumento(d.cnpj),
        companyType: d.tipoEmpresa ?? 'LIMITED',
        mobilePhone: d.telefone,
        incomeValue: (d.rendaMensalCentavos ?? 0) / 100,
        address: d.endereco!.logradouro,
        addressNumber: d.endereco!.numero,
        province: d.endereco!.bairro,
        postalCode: d.endereco!.cep,
      });
      // A apiKey da subconta vem UMA vez, na resposta. Não a guardamos:
      // operamos tudo pela conta-pai (split, escrow), como o §5.10 prevê.
      return { idExterno: r.id, walletId: r.walletId };
    },

    /**
     * Transferência entre contas Asaas (`walletId`): sem custo e imediata,
     * ao contrário de TED/Pix para conta externa. O professor recebe na
     * subconta dele, de onde saca como quiser.
     */
    async transferir(t) {
      const r = await chamar<{ id: string }>('POST', '/transfers', {
        value: t.centavos / 100,
        walletId: t.walletId,
        description: t.descricao,
        externalReference: t.referencia,
      });
      return { idExterno: r.id };
    },

    async habilitarEscrow(subcontaId, diasRetencao) {
      await chamar('POST', `/accounts/${subcontaId}/escrow`, {
        enabled: true,
        isFeePayer: false,   // a mensalidade da escrow é nossa, embutida no plano (§5.10.3)
        daysToExpire: diasRetencao,
      });
    },

    validarAssinatura(_corpo, cabecalho) {
      // O Asaas manda o authToken cadastrado no webhook no cabeçalho
      // `asaas-access-token`; não há HMAC do corpo.
      if (!cabecalho || !cfg.webhookToken) return false;
      const a = Buffer.from(cabecalho);
      const b = Buffer.from(cfg.webhookToken);
      return a.length === b.length && timingSafeEqual(a, b);
    },

    interpretarEvento(corpo) {
      const c = corpo as {
        id?: string; event?: string;
        payment?: { id?: string; externalReference?: string; value?: number };
        account?: { id?: string; status?: { general?: string }; generalStatus?: string };
      };
      if (!c?.event) return null;
      const eventoId = c.id ?? `${c.event}:${c.payment?.id ?? c.account?.id ?? ''}`;

      if (c.event.startsWith('PAYMENT_')) {
        const referencia = c.payment?.externalReference;
        if (!referencia) return null;
        const centavos = Math.round((c.payment?.value ?? 0) * 100);
        if (c.event === 'PAYMENT_CONFIRMED' || c.event === 'PAYMENT_RECEIVED') {
          return { eventoId, tipo: 'pagamento.confirmado', referencia, centavos };
        }
        if (c.event === 'PAYMENT_OVERDUE' || c.event === 'PAYMENT_DELETED'
            || c.event === 'PAYMENT_CREDIT_CARD_CAPTURE_REFUSED'
            || c.event === 'PAYMENT_REPROVED_BY_RISK_ANALYSIS') {
          return { eventoId, tipo: 'pagamento.falhou', referencia, centavos };
        }
        return null;   // PAYMENT_CREATED, VIEWED, ANTICIPATED…: nada a fazer aqui
      }

      if (c.event.startsWith('ACCOUNT_STATUS_')) {
        // CONFIRMAR NO SANDBOX: o formato do objeto `account` na
        // notificação. A leitura abaixo aceita as duas formas documentadas
        // (`status.general` e `generalStatus`).
        const id = c.account?.id;
        const geral = c.account?.status?.general ?? c.account?.generalStatus;
        if (!id || !geral) return null;
        if (geral === 'APPROVED') return { eventoId, tipo: 'subconta.aprovada', referencia: id, centavos: 0 };
        if (geral === 'REJECTED') return { eventoId, tipo: 'subconta.recusada', referencia: id, centavos: 0 };
        return null;
      }
      return null;
    },
  };
}

/** Lê a configuração do ambiente; lança se faltar o essencial. */
export function asaasDoAmbiente(): Provedor {
  const apiKey = process.env.ASAAS_API_KEY;
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
  const ambiente = process.env.ASAAS_AMBIENTE === 'producao' ? 'producao' : 'sandbox';
  if (!apiKey) throw new Error('PROVEDOR_PAGAMENTO=asaas exige ASAAS_API_KEY');
  if (!webhookToken) throw new Error('PROVEDOR_PAGAMENTO=asaas exige ASAAS_WEBHOOK_TOKEN (o authToken do webhook)');
  return criarAsaas({ apiKey, ambiente, webhookToken });
}
