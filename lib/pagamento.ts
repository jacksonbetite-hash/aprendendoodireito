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
  tipo: 'pagamento.confirmado' | 'pagamento.falhou' | 'assinatura.cancelada';
  referencia: string;
  centavos: number;
}

export interface Provedor {
  nome: string;
  /** Se false, a interface avisa que nenhuma cobrança real acontece. */
  cobraDeVerdade: boolean;
  criarCobranca(c: Cobranca): Promise<CobrancaCriada>;
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
      `5204000053039865802BR5921APRENDENDO O DIREITO6009SAO PAULO` +
      `62070503***6304${randomBytes(2).toString('hex').toUpperCase()}`;
    return {
      idExterno,
      copiaECola,
      instrucao: `Ambiente de demonstração: nenhuma cobrança real acontece. O código expira em ${MINUTOS_PIX} minutos.`,
      expiraEm,
    };
  },

  validarAssinatura: confereAssinatura,

  interpretarEvento(corpo) {
    const c = corpo as Partial<EventoPagamento>;
    if (!c || typeof c.referencia !== 'string' || typeof c.eventoId !== 'string') return null;
    if (c.tipo !== 'pagamento.confirmado' && c.tipo !== 'pagamento.falhou'
        && c.tipo !== 'assinatura.cancelada') return null;
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

/** Referência do pedido, curta e legível para o suporte. */
export function novaReferencia(): string {
  const d = new Date();
  const dia = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `AD-${dia}-${randomBytes(3).toString('hex').toUpperCase()}`;
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
