import { query, queryOne } from './db.ts';
import { emTransacao, auditar } from './auditoria.ts';
import { normalizarParagrafos } from './texto.ts';
import { DIAS_MAXIMOS } from './vagas-rotulos.ts';
import type {
  TipoVaga, RegimeVaga, ModalidadeVaga, StatusVaga,
} from './vagas-rotulos.ts';

export { DIAS_MAXIMOS, ROTULO_STATUS } from './vagas-rotulos.ts';
export type { StatusVaga } from './vagas-rotulos.ts';

/**
 * Mural de vagas na retaguarda — §5.7.1.
 *
 * O schema do mural já nascia com moderação prévia (`em_moderacao` é o
 * estado padrão) e vigência máxima de três meses gravadas como restrição
 * do banco. O que não existia era quem operasse: as doze vagas do seed
 * entraram publicadas direto, e uma vaga real que chegasse ficaria presa
 * em `em_moderacao` para sempre, sem tela onde aprová-la.
 *
 * Duas regras do §5.7.1 vivem aqui, e não na tela:
 *
 * 1. VIGÊNCIA MÁXIMA DE 3 MESES, contada da publicação. É a regra que
 *    impede a "vaga fantasma perpétua". O banco recusa mais que isso; a
 *    aplicação recusa antes, com mensagem em português.
 * 2. RENOVAR É REPOSTAR. Uma vaga que volta ao ar passa de novo pela
 *    moderação — senão a vigência máxima seria contornável por um botão.
 */

export interface VagaAdmin {
  id: number; titulo: string; empresa: string; empresaCnpj: string | null;
  tipo: TipoVaga; regime: RegimeVaga; modalidade: ModalidadeVaga;
  cidade: string | null; uf: string | null; areaAtuacao: string;
  descricao: string; requisitos: string; faixaSalarial: string | null;
  comoCandidatar: string; contatoAnunciante: string | null;
  status: StatusVaga; publicadaEm: Date | null; expiraEm: Date | null;
  criadaEm: Date; moderadaPor: string | null; moderadaEm: Date | null;
  motivoRecusa: string | null;
  /** Publicada e ainda dentro da vigência — é o que o mural mostra. */
  noAr: boolean;
  /** Dias que faltam para expirar; negativo quando já passou. */
  diasRestantes: number | null;
}

export interface DadosVaga {
  titulo: string; empresa: string; empresaCnpj?: string | null;
  tipo: TipoVaga; regime: RegimeVaga; modalidade: ModalidadeVaga;
  cidade?: string | null; uf?: string | null; areaAtuacao: string;
  descricao: string; requisitos: string; faixaSalarial?: string | null;
  comoCandidatar: string; contatoAnunciante?: string | null;
}

const CAMPOS = `
  v.id, v.titulo, v.empresa, v.empresa_cnpj AS "empresaCnpj",
  v.tipo, v.regime, v.modalidade, v.cidade, v.uf,
  v.area_atuacao AS "areaAtuacao", v.descricao, v.requisitos,
  v.faixa_salarial AS "faixaSalarial", v.como_candidatar AS "comoCandidatar",
  v.contato_anunciante AS "contatoAnunciante",
  v.status, v.publicada_em AS "publicadaEm", v.expira_em AS "expiraEm",
  v.criada_em AS "criadaEm", v.moderada_por AS "moderadaPor",
  v.moderada_em AS "moderadaEm", v.motivo_recusa AS "motivoRecusa",
  (v.status = 'publicada' AND v.expira_em > now()) AS "noAr",
  CASE WHEN v.expira_em IS NULL THEN NULL
       ELSE floor(extract(epoch FROM v.expira_em - now()) / 86400)::int END AS "diasRestantes"
`;

// ---------- Leitura ----------

export function listarVagasAdmin(status = '', busca = '') {
  return query<VagaAdmin>(
    `SELECT ${CAMPOS} FROM vaga v
      WHERE ($1 = '' OR v.status::text = $1)
        AND ($2 = '' OR v.titulo ILIKE '%' || $2 || '%' OR v.empresa ILIKE '%' || $2 || '%')
      -- A fila de moderação primeiro, e dentro dela quem esperou mais.
      ORDER BY (v.status = 'em_moderacao') DESC, v.criada_em DESC`,
    [status, busca.trim()],
  );
}

export function buscarVaga(id: number) {
  return queryOne<VagaAdmin>(`SELECT ${CAMPOS} FROM vaga v WHERE v.id = $1`, [id]);
}

export function contarPorStatus() {
  return query<{ status: StatusVaga; total: number }>(
    'SELECT status, count(*)::int AS total FROM vaga GROUP BY status',
  );
}

// ---------- Escrita ----------

function validar(d: DadosVaga) {
  if (!d.titulo.trim()) throw new Error('o título da vaga é obrigatório');
  if (!d.empresa.trim()) throw new Error('a empresa é obrigatória');
  if (!d.areaAtuacao.trim()) throw new Error('a área de atuação é obrigatória');
  if (d.descricao.trim().length < 60) throw new Error('descreva a vaga com pelo menos 60 caracteres');
  if (!d.requisitos.trim()) throw new Error('os requisitos são obrigatórios');
  if (!d.comoCandidatar.trim()) {
    throw new Error('informe como se candidatar — a candidatura acontece fora da plataforma');
  }
  // A restrição `vaga_presencial_tem_local` recusaria no banco; recusar
  // aqui devolve a frase que o operador entende, e não um erro de FK.
  if (d.modalidade !== 'remoto' && (!d.cidade?.trim() || !d.uf?.trim())) {
    throw new Error('vaga que não é 100% remota precisa de cidade e UF — é a primeira pergunta de quem procura');
  }
  if (d.uf && d.uf.trim() && !/^[A-Za-z]{2}$/.test(d.uf.trim())) {
    throw new Error('a UF tem duas letras');
  }
  if (d.empresaCnpj && d.empresaCnpj.trim() && !/^[\d./-]{14,18}$/.test(d.empresaCnpj.trim())) {
    throw new Error('CNPJ inválido');
  }
}

/** Os parâmetros comuns a inserção e edição, na mesma ordem. */
function valores(d: DadosVaga) {
  return [
    d.titulo.trim(), d.empresa.trim(), d.empresaCnpj?.trim() || null,
    d.tipo, d.regime, d.modalidade,
    d.modalidade === 'remoto' ? (d.cidade?.trim() || null) : d.cidade!.trim(),
    d.modalidade === 'remoto' ? (d.uf?.trim().toUpperCase() || null) : d.uf!.trim().toUpperCase(),
    d.areaAtuacao.trim(), normalizarParagrafos(d.descricao), normalizarParagrafos(d.requisitos),
    d.faixaSalarial?.trim() || null, d.comoCandidatar.trim(), d.contatoAnunciante?.trim() || null,
  ];
}

/**
 * Cadastro pelo admin. Nasce em `em_moderacao` como qualquer outra — o
 * admin publica em seguida, num ato separado, para que a aprovação fique
 * registrada com nome e data mesmo quando quem cadastra é a casa.
 */
export async function criarVaga(ator: string, d: DadosVaga) {
  validar(d);
  return emTransacao(async (exec) => {
    const [nova] = await exec<{ id: number }>(
      `INSERT INTO vaga
        (titulo, empresa, empresa_cnpj, tipo, regime, modalidade, cidade, uf,
         area_atuacao, descricao, requisitos, faixa_salarial, como_candidatar,
         contato_anunciante, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'em_moderacao')
       RETURNING id`,
      valores(d),
    );
    await auditar(exec, ator, 'vaga.criada', 'vaga', nova.id,
      { titulo: d.titulo.trim(), empresa: d.empresa.trim() });
    return nova.id;
  });
}

export async function editarVaga(ator: string, id: number, d: DadosVaga) {
  validar(d);
  return emTransacao(async (exec) => {
    const [linha] = await exec<{ id: number }>(
      `UPDATE vaga SET
         titulo=$2, empresa=$3, empresa_cnpj=$4, tipo=$5, regime=$6, modalidade=$7,
         cidade=$8, uf=$9, area_atuacao=$10, descricao=$11, requisitos=$12,
         faixa_salarial=$13, como_candidatar=$14, contato_anunciante=$15,
         atualizada_em = now()
       WHERE id = $1 RETURNING id`,
      [id, ...valores(d)],
    );
    if (!linha) throw new Error('vaga não encontrada');
    await auditar(exec, ator, 'vaga.editada', 'vaga', id, { titulo: d.titulo.trim() });
    return id;
  });
}

/**
 * Aprovar: a vaga entra no ar e a vigência começa a correr.
 *
 * `dias` é do operador porque nem toda vaga merece o teto — um processo
 * seletivo de duas semanas não precisa de três meses de anúncio. O teto,
 * esse, é do §5.7.1 e não se negocia.
 */
export async function publicarVaga(ator: string, id: number, dias = DIAS_MAXIMOS) {
  if (!Number.isInteger(dias) || dias < 1 || dias > DIAS_MAXIMOS) {
    throw new Error(`a vigência vai de 1 a ${DIAS_MAXIMOS} dias (§5.7.1: máximo de 3 meses)`);
  }
  return emTransacao(async (exec) => {
    const [v] = await exec<{ status: StatusVaga }>('SELECT status FROM vaga WHERE id = $1', [id]);
    if (!v) throw new Error('vaga não encontrada');
    if (v.status === 'publicada') throw new Error('esta vaga já está no ar');

    await exec(
      `UPDATE vaga SET status = 'publicada',
              publicada_em = now(),
              expira_em = now() + ($2 || ' days')::interval,
              moderada_por = $3, moderada_em = now(), motivo_recusa = NULL,
              atualizada_em = now()
        WHERE id = $1`,
      [id, String(dias), ator],
    );
    await auditar(exec, ator, 'vaga.publicada', 'vaga', id, { de: v.status, dias });
  });
}

/**
 * Recusar ou tirar do ar em definitivo. O motivo é obrigatório — o
 * anunciante tem direito a saber por quê, e a restrição
 * `vaga_recusa_tem_motivo` recusaria a linha sem ele.
 */
export async function recusarVaga(ator: string, id: number, motivo: string) {
  if (!motivo.trim()) throw new Error('diga o motivo — o anunciante precisa saber por que foi recusada');
  return emTransacao(async (exec) => {
    const [v] = await exec<{ status: StatusVaga }>('SELECT status FROM vaga WHERE id = $1', [id]);
    if (!v) throw new Error('vaga não encontrada');
    await exec(
      `UPDATE vaga SET status = 'removida', motivo_recusa = $2,
              moderada_por = $3, moderada_em = now(), atualizada_em = now()
        WHERE id = $1`,
      [id, motivo.trim(), ator],
    );
    await auditar(exec, ator, 'vaga.recusada', 'vaga', id, { de: v.status, motivo: motivo.trim() });
  });
}

/** Pausa reversível: sai do mural sem perder a vigência já corrida. */
export async function pausarVaga(ator: string, id: number) {
  return emTransacao(async (exec) => {
    const [v] = await exec<{ status: StatusVaga }>('SELECT status FROM vaga WHERE id = $1', [id]);
    if (!v) throw new Error('vaga não encontrada');
    if (v.status !== 'publicada') throw new Error('só dá para pausar vaga que está no ar');
    await exec(
      `UPDATE vaga SET status = 'pausada', atualizada_em = now() WHERE id = $1`, [id],
    );
    await auditar(exec, ator, 'vaga.pausada', 'vaga', id, {});
  });
}

/**
 * Voltar ao ar depois de pausada, sem reabrir a vigência: `expira_em`
 * continua sendo o que era. Pausar não pode virar maneira de esticar os
 * três meses.
 */
export async function retomarVaga(ator: string, id: number) {
  return emTransacao(async (exec) => {
    const [v] = await exec<{ status: StatusVaga; expiraEm: Date | null }>(
      'SELECT status, expira_em AS "expiraEm" FROM vaga WHERE id = $1', [id],
    );
    if (!v) throw new Error('vaga não encontrada');
    if (v.status !== 'pausada') throw new Error('só dá para retomar vaga pausada');
    if (!v.expiraEm || new Date(v.expiraEm) <= new Date()) {
      throw new Error('a vigência desta vaga já venceu — para voltar ao ar ela precisa ser reposta');
    }
    await exec(`UPDATE vaga SET status = 'publicada', atualizada_em = now() WHERE id = $1`, [id]);
    await auditar(exec, ator, 'vaga.retomada', 'vaga', id, {});
  });
}

/**
 * Repor: a vaga volta para a fila de moderação, zerada.
 *
 * É o "renovar" do §5.7.1, e de propósito ele não publica direto — a
 * renovação passa pela moderação de novo. Sem isso, um botão de renovar
 * transformaria a vigência máxima em ficção.
 */
export async function reporVaga(ator: string, id: number) {
  return emTransacao(async (exec) => {
    const [v] = await exec<{ status: StatusVaga }>('SELECT status FROM vaga WHERE id = $1', [id]);
    if (!v) throw new Error('vaga não encontrada');
    await exec(
      `UPDATE vaga SET status = 'em_moderacao', publicada_em = NULL, expira_em = NULL,
              motivo_recusa = NULL, moderada_por = NULL, moderada_em = NULL,
              atualizada_em = now()
        WHERE id = $1`,
      [id],
    );
    await auditar(exec, ator, 'vaga.reposta', 'vaga', id, { de: v.status });
  });
}

/**
 * Carimba como `expirada` quem já passou da vigência.
 *
 * O mural público nunca precisou disto — ele filtra por data. Quem
 * precisa é a retaguarda: sem o carimbo, a lista de "no ar" mistura vaga
 * viva com vaga vencida e ninguém sabe o que ainda está sendo mostrado.
 * É idempotente, e por isso pode rodar a cada visita à tela.
 */
export async function expirarVencidas(ator: string) {
  return emTransacao(async (exec) => {
    const linhas = await exec<{ id: number }>(
      `UPDATE vaga SET status = 'expirada', atualizada_em = now()
        WHERE status IN ('publicada', 'pausada') AND expira_em IS NOT NULL AND expira_em <= now()
      RETURNING id`,
    );
    if (linhas.length) {
      await auditar(exec, ator, 'vaga.expiradas', 'vaga', null,
        { quantidade: linhas.length, ids: linhas.map((l) => l.id) });
    }
    return linhas.length;
  });
}
