import { queryOne } from './db.ts';
import { emTransacao, auditar } from './auditoria.ts';
import { gerarHashSenha, validarEmail, validarSenha } from './auth.ts';
import { PORTAL_PLATAFORMA, validarCnpj } from './portal.ts';
import { conferirMascara } from './admin-portais.ts';
import {
  provedorAtual, novaReferencia,
  type MeioPagamento, type EventoPagamento,
} from './pagamento.ts';

/**
 * Autosserviço do Portal do Professor — etapa 1 do §5.10.2.
 *
 * O professor se cadastra, escolhe a máscara, aceita o contrato e paga a
 * primeira mensalidade; o portal nasce quando o pagamento confirma. Duas
 * regras estruturam o arquivo:
 *
 * 1. TUDO OU NADA. Conta, portal, contrato, aceite e fatura nascem na
 *    MESMA transação. O fluxo em etapas (conta agora, portal depois)
 *    deixaria meio-cadastro para o suporte limpar — e meio-cadastro com
 *    cobrança no meio é reclamação, não lead.
 *
 * 2. O PAGAMENTO É QUEM ATIVA. O portal nasce RASCUNHO e só vira ATIVO
 *    no webhook, pelo mesmo caminho idempotente do checkout de aluno
 *    (§8.3): o mesmo evento pode chegar duas vezes e nunca ativa nada
 *    duas vezes, nem reativa portal encerrado.
 *
 * O que fica deliberadamente para a etapa 2: a subconta no gateway e a
 * trava "sem subconta não vende". Aqui o professor CONTRATA; vender é o
 * passo seguinte.
 */

/**
 * Teto do período de avaliação regulatória do gateway (§8.2): até a
 * homologação, no máximo 10 subcontas. O autosserviço PARA de aceitar ao
 * chegar no limite — com aviso, não com erro de banco. Sobe por variável
 * de ambiente quando a homologação sair.
 */
const limitePortais = () => Number(process.env.LIMITE_PORTAIS ?? 10);

export interface DadosAssinatura {
  nome: string;
  email: string;
  senha: string;
  /** CNPJ do responsável — sem ele não há subconta (§5.10.2). */
  cnpj: string;
  mascara: string;
  nomeExibicao: string;
  meio: MeioPagamento;
  /** O checkbox do contrato. Sem aceite explícito, nada é criado. */
  aceitouContrato: boolean;
  ip: string;
}

export interface AssinaturaCriada {
  portalId: number;
  professorId: number;
  referencia: string;
  centavos: number;
  meio: MeioPagamento;
  copiaECola?: string;
  instrucao: string;
  expiraEm: Date;
}

export interface PlanoAtivo {
  id: number; nome: string;
  licencaMensalCentavos: number; percentualBase: string;
  acrescimoIndicacaoPp: string;
  gbArmazenamento: number; gbBandaMes: number;
  centavosPorGbExcedente: number;
}

/**
 * O plano vendido na página pública: o mais barato entre os ativos. A
 * página lê DAQUI, nunca de número no código — mudar o preço no admin
 * muda o site (§5.10.3).
 */
export function planoDeLancamento() {
  return queryOne<PlanoAtivo>(
    `SELECT id, nome, licenca_mensal_centavos AS "licencaMensalCentavos",
            percentual_base AS "percentualBase",
            acrescimo_indicacao_pp AS "acrescimoIndicacaoPp",
            gb_armazenamento AS "gbArmazenamento",
            gb_banda_mes AS "gbBandaMes",
            centavos_por_gb_excedente AS "centavosPorGbExcedente"
       FROM portal_plano WHERE ativo
      ORDER BY licenca_mensal_centavos LIMIT 1`,
  );
}

export interface FaturaDoProfessor {
  id: number; status: string; centavosTotal: number;
  referencia: string; vencimento: Date | null; pagaEm: Date | null;
  cobrancaExternaId: string | null;
  detalhe: { meio?: string } | null;
  portalId: number; mascara: string; nomeExibicao: string;
  portalStatus: string; subcontaSituacao: string;
}

/**
 * A fatura na tela de pagamento do professor — só a dele: a referência
 * sozinha não basta, senão qualquer um com o link veria CNPJ e cobrança
 * alheios.
 */
export function faturaDoProfessor(referencia: string, professorId: number) {
  return queryOne<FaturaDoProfessor>(
    `SELECT f.id, f.status, f.centavos_total AS "centavosTotal", f.referencia,
            f.vencimento, f.paga_em AS "pagaEm",
            f.cobranca_externa_id AS "cobrancaExternaId", f.detalhe,
            p.id AS "portalId", p.mascara, p.nome_exibicao AS "nomeExibicao",
            p.status AS "portalStatus", p.subconta_situacao AS "subcontaSituacao"
       FROM portal_fatura f
       JOIN portal p ON p.id = f.portal_id
      WHERE f.referencia = $1 AND p.professor_id = $2`,
    [referencia, professorId],
  );
}

export async function assinarPortal(d: DadosAssinatura): Promise<AssinaturaCriada> {
  // ---- validações que não precisam de banco, primeiro e mais baratas ----
  if (!d.aceitouContrato) throw new Error('É preciso ler e aceitar o contrato para contratar.');
  if (!d.nome.trim()) throw new Error('Diga como podemos te chamar.');
  if (!d.nomeExibicao.trim()) throw new Error('Dê um nome ao seu portal.');
  const erroEmail = validarEmail(d.email);
  if (erroEmail) throw new Error(erroEmail);
  const erroSenha = validarSenha(d.senha);
  if (erroSenha) throw new Error(erroSenha);
  if (!validarCnpj(d.cnpj)) {
    throw new Error('CNPJ inválido. O portal exige pessoa jurídica — é regra do Banco '
      + 'Central para a conta de recebimento, não escolha nossa.');
  }
  if (d.meio !== 'PIX' && d.meio !== 'CARTAO') throw new Error('Meio de pagamento inválido.');

  // ---- teto regulatório (§5.10.2): fila de espera, não erro ----
  const ocupacao = await queryOne<{ total: number }>(
    `SELECT count(*)::int AS total FROM portal
      WHERE id <> ${PORTAL_PLATAFORMA} AND status <> 'ENCERRADO'`,
  );
  if ((ocupacao?.total ?? 0) >= limitePortais()) {
    throw new Error('Estamos no limite de novos portais deste período. Deixe seu e-mail '
      + 'na lista de espera que avisamos assim que abrir a próxima turma.');
  }

  const plano = await planoDeLancamento();
  if (!plano) throw new Error('Nenhum plano disponível no momento.');

  // A cobrança nasce no gateway ANTES da transação, como no checkout de
  // aluno: se o gateway falhar, nada foi gravado; se a transação falhar,
  // sobra uma cobrança órfã que expira sozinha — o mal menor.
  const referencia = novaReferencia('PF');
  const provedor = provedorAtual();
  const cobranca = await provedor.criarCobranca({
    referencia,
    centavos: plano.licencaMensalCentavos,
    meio: d.meio,
    emailPagador: d.email.trim().toLowerCase(),
    descricao: `Portal do Professor — 1ª mensalidade (${d.nomeExibicao.trim()})`,
  });

  return emTransacao(async (exec) => {
    // Conta do professor na PLATAFORMA (portal 0) — é por ela que ele
    // opera o próprio site. E-mail já usado NÃO é promovido em silêncio:
    // promover conta alheia por um formulário público seria presente
    // para engraçadinho com o e-mail dos outros.
    const [conta] = await exec<{ id: number }>(
      `INSERT INTO usuario (portal_id, nome, email, senha_hash, papel)
       VALUES (${PORTAL_PLATAFORMA}, $1, lower($2), $3, 'professor')
       ON CONFLICT (portal_id, lower(email)) DO NOTHING
       RETURNING id::int AS id`,
      [d.nome.trim().slice(0, 120), d.email.trim(), await gerarHashSenha(d.senha)],
    );
    if (!conta) {
      throw new Error('Já existe uma conta com esse e-mail. Entre nela para contratar '
        + 'o portal, ou fale com o suporte.');
    }

    const mascara = await conferirMascara(exec, d.mascara);

    const [portal] = await exec<{ id: number }>(
      `INSERT INTO portal
         (mascara, nome_exibicao, professor_id, plano_id, status,
          responsavel_nome, responsavel_doc, responsavel_email)
       VALUES ($1, $2, $3, $4, 'RASCUNHO', $5, $6, lower($7)) RETURNING id::int AS id`,
      [mascara, d.nomeExibicao.trim(), conta.id, plano.id,
       d.nome.trim(), d.cnpj.toUpperCase().replace(/[.\/\- ]/g, ''), d.email.trim()],
    );

    // Contrato copiado do plano NO ATO (§5.10): o plano pode mudar de
    // preço amanhã; o que este professor aceitou hoje, não.
    const [contrato] = await exec<{ id: number }>(
      `INSERT INTO portal_contrato
         (portal_id, plano_id, licenca_mensal_centavos, percentual_base,
          acrescimo_indicacao_pp, vigente_de, aceito_em, aceito_ip, registrado_por)
       VALUES ($1, $2, $3, $4, $5, current_date, now(), $6, $7) RETURNING id`,
      [portal.id, plano.id, plano.licencaMensalCentavos, plano.percentualBase,
       plano.acrescimoIndicacaoPp, d.ip || null, d.email.trim().toLowerCase()],
    );

    // 1ª mensalidade: nasce FECHADA (pronta para pagar), não ABERTA — a
    // fatura ABERTA é a que acumula consumo ao longo do mês (etapa 4).
    await exec(
      `INSERT INTO portal_fatura
         (portal_id, contrato_id, competencia, centavos_licenca, centavos_total,
          status, vencimento, referencia, cobranca_externa_id, detalhe, fechada_em)
       VALUES ($1, $2, date_trunc('month', current_date)::date, $3, $3,
               'FECHADA', current_date + 2, $4, $5, $6, now())`,
      [portal.id, contrato.id, plano.licencaMensalCentavos, referencia,
       cobranca.idExterno,
       JSON.stringify({ meio: d.meio, provedor: provedor.nome, primeiraMensalidade: true })],
    );

    await auditar(exec, d.email.trim().toLowerCase(), 'portal.autosservico', 'portal',
      portal.id, { mascara, planoId: plano.id, referencia, meio: d.meio });

    return {
      portalId: portal.id, professorId: conta.id, referencia,
      centavos: plano.licencaMensalCentavos, meio: d.meio,
      copiaECola: cobranca.copiaECola, instrucao: cobranca.instrucao,
      expiraEm: cobranca.expiraEm,
    };
  });
}

export type ResultadoFatura =
  | { ok: true; faturaId: number; portalId: number; portalAtivado: boolean; jaProcessado: boolean }
  | { ok: false; motivo: string };

/**
 * Webhook da fatura de portal — mesmo desenho idempotente do checkout de
 * aluno (§8.3): `evento_gateway` barra o evento repetido, e o UPDATE só
 * acontece com a fatura travada por FOR UPDATE.
 */
export async function confirmarPagamentoFatura(
  evento: EventoPagamento, provedorNome: string, corpo: unknown,
): Promise<ResultadoFatura> {
  return emTransacao(async (exec) => {
    const [registrado] = await exec<{ id: number }>(
      `INSERT INTO evento_gateway (provedor, evento_id, tipo, corpo)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (provedor, evento_id) DO NOTHING
       RETURNING id`,
      [provedorNome, evento.eventoId, evento.tipo, JSON.stringify(corpo)],
    );
    if (!registrado) {
      const [f] = await exec<{ id: number; portalId: number; status: string }>(
        `SELECT id, portal_id AS "portalId", status
           FROM portal_fatura WHERE referencia = $1`, [evento.referencia],
      );
      return {
        ok: true as const, faturaId: f?.id ?? 0, portalId: f?.portalId ?? 0,
        portalAtivado: false, jaProcessado: true as const,
      };
    }

    const [fatura] = await exec<{ id: number; portalId: number; status: string }>(
      `SELECT id, portal_id AS "portalId", status
         FROM portal_fatura
        WHERE referencia = $1 AND status IN ('FECHADA', 'EM_ATRASO')
        FOR UPDATE`,
      [evento.referencia],
    );
    if (!fatura) {
      await exec(`UPDATE evento_gateway SET processado_em = now(), resultado = $2
                   WHERE id = $1`, [registrado.id, 'fatura inexistente ou já finalizada']);
      return { ok: false as const, motivo: 'fatura inexistente ou já finalizada' };
    }

    if (evento.tipo !== 'pagamento.confirmado') {
      // Falha não cancela a fatura: ela continua cobrável (o professor
      // tenta de novo, ou a régua de inadimplência do §5.10 assume).
      await exec(`UPDATE evento_gateway SET processado_em = now(), resultado = 'pagamento falhou'
                   WHERE id = $1`, [registrado.id]);
      return { ok: false as const, motivo: 'pagamento não aprovado' };
    }

    await exec(`UPDATE portal_fatura SET status = 'PAGA', paga_em = now() WHERE id = $1`,
      [fatura.id]);

    // A ativação: RASCUNHO pago vira ATIVO; SUSPENSO pago volta ao ar
    // (§5.10, inadimplência). ENCERRADO não ressuscita por pagamento.
    const [portal] = await exec<{ id: number }>(
      `UPDATE portal
          SET status = 'ATIVO',
              publicado_em = coalesce(publicado_em, now()),
              suspenso_em = NULL
        WHERE id = $1 AND status IN ('RASCUNHO', 'SUSPENSO')
        RETURNING id`,
      [fatura.portalId],
    );

    await exec(`UPDATE evento_gateway SET processado_em = now(), resultado = $2 WHERE id = $1`,
      [registrado.id, `fatura ${fatura.id} paga${portal ? ', portal ativado' : ''}`]);
    await auditar(exec, `gateway:${provedorNome}`, 'portal_fatura.paga', 'portal_fatura',
      fatura.id, { referencia: evento.referencia, portalId: fatura.portalId,
                   portalAtivado: Boolean(portal) });

    return {
      ok: true as const, faturaId: fatura.id, portalId: fatura.portalId,
      portalAtivado: Boolean(portal), jaProcessado: false as const,
    };
  });
}
