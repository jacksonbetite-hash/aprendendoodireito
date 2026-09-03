import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import type { Periodo, Produto } from './precos.ts';

/**
 * Camada de pagamento — §8 do discovery.
 *
 * O gateway ainda não está escolhido (§8.2 recomenda Asaas ou Pagar.me,
 * pelo critério de split e Pix Automático). Em vez de amarrar o sistema
 * a um deles, a integração é um contrato: `Provedor`. Trocar de gateway
 * vira escrever um arquivo, não mexer no checkout.
 *
 * O provedor `simulado` roda sem credencial nenhuma — é o que permite
 * instalar e testar o fluxo completo na máquina de quem opera. Ele NÃO
 * cobra nada e diz isso em todas as telas.
 */

export type MeioPagamento = 'PIX' | 'CARTAO' | 'PIX_AUTOMATICO';

export interface Cobranca {
  referencia: string;
  centavos: number;
  meio: MeioPagamento;
  descricao: string;
  emailPagador: string;
  /**
   * Venda de portal (§5.10): divide na liquidação. `percentualRetido` é a
   * NOSSA parte; o resto vai para a `walletId` do professor. Como cada
   * gateway expressa isso é problema do adaptador — no Asaas, por
   * exemplo, quem cria a cobrança fica com o restante automaticamente.
   */
  split?: { walletId: string; percentualRetido: number };
}

export interface CobrancaCriada {
  /** Identificador da cobrança no gateway. */
  idExterno: string;
  /** Pix: código copia-e-cola. Cartão: nulo (a captura é do gateway). */
  copiaECola?: string;
  /** Instrução para o aluno, mostrada na tela. */
  instrucao: string;
  expiraEm: Date;
}

export interface EventoPagamento {
  eventoId: string;
  tipo: 'pagamento.confirmado' | 'pagamento.falhou' | 'assinatura.cancelada'
      | 'subconta.aprovada' | 'subconta.recusada';
  /** Nos eventos de subconta, carrega o id da subconta no gateway. */
  referencia: string;
  centavos: number;
}

/** Dados mínimos para abrir a subconta do professor (§5.10.2, etapa 2). */
export interface DadosSubconta {
  nome: string;
  email: string;
  /** CNPJ sem pontuação — subconta de pessoa física não existe (§8.2). */
  cnpj: string;
}

export interface SubcontaCriada {
  /** Identificador da subconta no gateway. */
  idExterno: string;
  /** Carteira para onde o split manda a parte do professor. */
  walletId: string;
}

export interface Provedor {
  nome: string;
  /** Se false, a interface avisa que nenhuma cobrança real acontece. */
  cobraDeVerdade: boolean;
  criarCobranca(c: Cobranca): Promise<CobrancaCriada>;
  /**
   * Abre a subconta do professor. A criação devolve os identificadores na
   * hora, mas a APROVAÇÃO é assíncrona — chega por webhook
   * (`subconta.aprovada` / `subconta.recusada`), como no gateway real.
   */
  criarSubconta(d: DadosSubconta): Promise<SubcontaCriada>;
  /**
   * Liga a Conta Escrow da subconta com o prazo de retenção em dias
   * (§8.2): o valor recebido só fica sacável depois do prazo — é o que
   * cobre o reembolso de 7 dias do CDC num modelo com split.
   */
  habilitarEscrow(subcontaId: string, diasRetencao: number): Promise<void>;
  /** Valida a assinatura do webhook. Sem isso, qualquer um libera licença. */
  validarAssinatura(corpo: string, cabecalho: string | null): boolean;
  interpretarEvento(corpo: unknown): EventoPagamento | null;
}

/* ------------------------------------------------------------------ */

const SEGREDO_WEBHOOK = process.env.WEBHOOK_SEGREDO ?? 'segredo-de-desenvolvimento';

/** Assina um corpo como o gateway faria. Usado pelo simulado e nos testes. */
export function assinarWebhook(corpo: string, segredo = SEGREDO_WEBHOOK): string {
  return 'sha256=' + createHmac('sha256', segredo).update(corpo).digest('hex');
}

function confereAssinatura(corpo: string, cabecalho: string | null): boolean {
  if (!cabecalho) return false;
  const esperado = Buffer.from(assinarWebhook(corpo));
  const recebido = Buffer.from(cabecalho);
  // timingSafeEqual exige mesmo tamanho: compara antes, sem vazar o conteúdo
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

const MINUTOS_PIX = 30;

/**
 * Provedor simulado: gera uma cobrança local e um código copia-e-cola de
 * mentira. A confirmação vem pelo mesmo webhook que um gateway real usa,
 * então o caminho exercitado é o de produção.
 */
export const simulado: Provedor = {
  nome: 'simulado',
  cobraDeVerdade: false,

  async criarCobranca(c) {
    const idExterno = 'sim_' + randomBytes(9).toString('hex');
    const expiraEm = new Date(Date.now() + MINUTOS_PIX * 60_000);
    if (c.meio === 'CARTAO') {
      return {
        idExterno,
        instrucao: 'Ambiente de demonstração: nenhum cartão é cobrado. Confirme para liberar o acesso.',
        expiraEm,
      };
    }
    // Formato inspirado no BR Code, só para a tela ter o que mostrar.
    const copiaECola =
      `00020126580014BR.GOV.BCB.PIX0136${idExterno}` +
      `5204000053039865802BR5916APRIMORE O SABER6009SAO PAULO` +
      `62070503***6304${randomBytes(2).toString('hex').toUpperCase()}`;
    return {
      idExterno,
      copiaECola,
      instrucao: `Ambiente de demonstração: nenhuma cobrança real acontece. O código expira em ${MINUTOS_PIX} minutos.`,
      expiraEm,
    };
  },

  /**
   * Subconta simulada: identificadores locais, aprovação pendente. A
   * aprovação vem pelo webhook (`scripts/aprovar-subconta.mjs` faz o
   * papel do gateway em desenvolvimento) — mesmo caminho da produção.
   */
  async criarSubconta(d) {
    if (!d.cnpj) throw new Error('subconta exige CNPJ');
    const sufixo = randomBytes(9).toString('hex');
    return { idExterno: 'sub_' + sufixo, walletId: 'wal_' + sufixo };
  },

  async habilitarEscrow() {
    // No simulado, habilitar é registrar que se pediu — quem guarda o
    // prazo é a coluna `portal.escrow_dias`, e é ela que o adaptador
    // real vai passar como daysToExpire.
  },

  validarAssinatura: confereAssinatura,

  interpretarEvento(corpo) {
    const c = corpo as Partial<EventoPagamento>;
    if (!c || typeof c.referencia !== 'string' || typeof c.eventoId !== 'string') return null;
    if (c.tipo !== 'pagamento.confirmado' && c.tipo !== 'pagamento.falhou'
        && c.tipo !== 'assinatura.cancelada'
        && c.tipo !== 'subconta.aprovada' && c.tipo !== 'subconta.recusada') return null;
    return {
      eventoId: c.eventoId, tipo: c.tipo, referencia: c.referencia,
      centavos: Number(c.centavos ?? 0),
    };
  },
};

/**
 * Escolhe o provedor pela variável PROVEDOR_PAGAMENTO.
 * Ao integrar Asaas ou Pagar.me, acrescente o módulo e registre aqui.
 */
export function provedorAtual(): Provedor {
  switch (process.env.PROVEDOR_PAGAMENTO) {
    case 'simulado':
    case undefined:
    case '':
      return simulado;
    default:
      throw new Error(
        `Provedor de pagamento "${process.env.PROVEDOR_PAGAMENTO}" não implementado. ` +
        'Provedores disponíveis: simulado.',
      );
  }
}

/**
 * Referência da cobrança, curta e legível para o suporte. O prefixo diz
 * de que fluxo ela é — 'AD' é pedido de aluno, 'PF' é fatura de portal
 * (§5.10.2) — e é por ele que o webhook decide quem processa o evento
 * sem consultar duas tabelas.
 */
export function novaReferencia(prefixo: 'AD' | 'PF' = 'AD'): string {
  const d = new Date();
  const dia = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `${prefixo}-${dia}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export function novoProtocolo(prefixo: string): string {
  return `${prefixo}-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
}

/** Meses de vigência da licença gerada por um período contratado. */
export const MESES_DO_PERIODO: Record<Periodo, number> = {
  mensal: 1, trimestral: 3, semestral: 6, anual: 12,
};

export const rotuloProduto = (p: Produto) =>
  p === 'CATALOGO' ? 'Passe completo' : 'Matéria avulsa';
