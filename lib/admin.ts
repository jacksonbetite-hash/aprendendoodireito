import { query, queryOne } from './db.ts';
import { emTransacao, auditar } from './auditoria.ts';
import type { Periodo, Produto } from './precos.ts';

/**
 * Operações administrativas — §5.9.
 *
 * Regra transversal do §5.9: "Auditoria: quem alterou o quê e quando —
 * obrigatória em preço, contrato, apuração e concessão de licença."
 * Por isso toda função aqui grava em log_auditoria dentro da MESMA
 * transação da alteração: ou as duas acontecem, ou nenhuma. O par
 * transação+auditoria mora em `lib/auditoria.ts`, compartilhado com os
 * módulos de blog, vagas, catálogo e portais.
 */

/**
 * Novo preço para um produto × período.
 *
 * Encerra a vigência do preço atual e abre a nova — nunca sobrescreve.
 * O §5.9 é explícito: o preço novo não afeta licença já vigente, e o
 * histórico tem de ficar consultável.
 */
export async function alterarPreco(
  ator: string, produto: Produto, periodo: Periodo, centavos: number, vigenteDe: string,
  portalId = 0,
) {
  if (!Number.isInteger(centavos) || centavos < 0) throw new Error('valor inválido');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(vigenteDe)) throw new Error('data inválida');

  return emTransacao(async (exec) => {
    const [atual] = await exec<{ id: number; centavos: number; vigenteDe: string }>(
      `SELECT id, centavos, to_char(vigente_de, 'YYYY-MM-DD') AS "vigenteDe"
         FROM preco
        WHERE portal_id = $3 AND produto = $1 AND periodo = $2 AND vigente_ate IS NULL`,
      [produto, periodo, portalId],
    );

    if (atual && vigenteDe < atual.vigenteDe) {
      throw new Error(
        `o preço vigente começou em ${atual.vigenteDe}; a nova vigência não pode ser anterior`,
      );
    }

    // Correção no mesmo dia: o preço vigente ainda não valeu por dia
    // nenhum, então é erro de digitação, não mudança de tabela. Encerrar
    // a vigência hoje criaria uma linha de duração zero — que o CHECK
    // recusa — e sujaria o histórico com um preço que nunca vigorou.
    if (atual && vigenteDe === atual.vigenteDe) {
      await exec('UPDATE preco SET centavos = $1, criado_por = $2 WHERE id = $3',
        [centavos, ator, atual.id]);
      await auditar(exec, ator, 'preco.corrigido', 'preco', atual.id, {
        portalId, produto, periodo, de: atual.centavos, para: centavos, vigenteDe,
      });
      return atual.id;
    }

    if (atual) {
      await exec('UPDATE preco SET vigente_ate = $1 WHERE id = $2', [vigenteDe, atual.id]);
    }
    const [novo] = await exec<{ id: number }>(
      `INSERT INTO preco (portal_id, produto, periodo, centavos, vigente_de, criado_por)
       VALUES ($6, $1, $2, $3, $4, $5) RETURNING id`,
      [produto, periodo, centavos, vigenteDe, ator, portalId],
    );
    await auditar(exec, ator, 'preco.alterado', 'preco', novo.id, {
      portalId, produto, periodo, de: atual?.centavos ?? null, para: centavos, vigenteDe,
    });
    return novo.id;
  });
}

/** Concessão manual de licença promocional/cortesia — §6.1.1, forma 2. */
export async function concederLicenca(
  ator: string, usuarioId: number, materiaId: number | null, dias: number,
  origem: 'PROMOCIONAL' | 'CORTESIA' = 'CORTESIA',
) {
  if (!Number.isInteger(dias) || dias < 1 || dias > 3650) throw new Error('período inválido');
  return emTransacao(async (exec) => {
    const escopo = materiaId === null ? 'CATALOGO' : 'MATERIA';
    const [l] = await exec<{ id: number }>(
      `INSERT INTO licenca (usuario_id, portal_id, escopo, materia_id, origem, status,
                            inicio_em, fim_em, materia_portal_id)
       VALUES ($1, (SELECT portal_id FROM usuario WHERE id = $1), $2, $3, $4, 'ATIVA',
               now(), now() + ($5 || ' days')::interval,
               coalesce((SELECT portal_id FROM materia WHERE id = $3),
                        (SELECT portal_id FROM usuario WHERE id = $1)))
       RETURNING id`,
      [usuarioId, escopo, materiaId, origem, String(dias)],
    );
    await auditar(exec, ator, 'licenca.concedida', 'licenca', l.id,
      { usuarioId, escopo, materiaId, origem, dias });
    return l.id;
  });
}

export async function estenderLicenca(ator: string, licencaId: number, dias: number) {
  if (!Number.isInteger(dias) || dias < 1 || dias > 3650) throw new Error('período inválido');
  return emTransacao(async (exec) => {
    const [l] = await exec<{ fimEm: Date }>(
      `UPDATE licenca
          SET fim_em = fim_em + ($2 || ' days')::interval, atualizada_em = now()
        WHERE id = $1 RETURNING fim_em AS "fimEm"`,
      [licencaId, String(dias)],
    );
    if (!l) throw new Error('licença não encontrada');
    await auditar(exec, ator, 'licenca.estendida', 'licenca', licencaId, { dias, novoFim: l.fimEm });
    return l.fimEm;
  });
}

export async function mudarStatusLicenca(
  ator: string, licencaId: number, status: 'ATIVA' | 'SUSPENSA' | 'CANCELADA',
) {
  return emTransacao(async (exec) => {
    const [l] = await exec<{ anterior: string }>(
      `UPDATE licenca SET status = $2, atualizada_em = now()
        WHERE id = $1
      RETURNING (SELECT status FROM licenca WHERE id = $1) AS anterior`,
      [licencaId, status],
    );
    if (!l) throw new Error('licença não encontrada');
    await auditar(exec, ator, 'licenca.status', 'licenca', licencaId, { para: status });
  });
}

// ---------- Consultas do painel ----------

export function resumoOperacao() {
  return queryOne<{
    alunos: number; licencasAtivas: number; trials: number;
    materiasPublicadas: number; respostas7d: number;
  }>(
    `SELECT
       (SELECT count(*)::int FROM usuario
         WHERE papel = 'aluno' AND portal_id = 0) AS alunos,
       (SELECT count(*)::int FROM licenca
         WHERE status = 'ATIVA' AND now() BETWEEN inicio_em AND fim_em) AS "licencasAtivas",
       (SELECT count(*)::int FROM licenca
         WHERE origem = 'TRIAL' AND status = 'ATIVA' AND now() BETWEEN inicio_em AND fim_em) AS trials,
       (SELECT count(*)::int FROM materia
         WHERE status = 'publicado' AND portal_id = 0) AS "materiasPublicadas",
       (SELECT count(*)::int FROM resposta WHERE respondida_em > now() - interval '7 days') AS "respostas7d"`,
  );
}

export interface LinhaAluno {
  id: number; nome: string; email: string; statusConta: string;
  criadoEm: Date; ultimoLoginEm: Date | null; licencasAtivas: number;
}

/**
 * §5.9 — retaguarda da PLATAFORMA. Toda consulta daqui é fixada em
 * `portal_id = 0` (§5.10): o admin não enxerga nem conta aluno, licença ou
 * matéria de portal de professor, que têm painel próprio e outro dono dos
 * dados (o professor é controlador da base dele). Somar os dois números
 * daria um relatório que não corresponde a nenhuma operação real.
 */
export function listarAlunos(busca = '', limite = 50) {
  const termo = busca.trim();
  return query<LinhaAluno>(
    `SELECT u.id, u.nome, u.email, u.status_conta AS "statusConta",
            u.criado_em AS "criadoEm", u.ultimo_login_em AS "ultimoLoginEm",
            (SELECT count(*)::int FROM licenca l
              WHERE l.usuario_id = u.id AND l.status = 'ATIVA'
                AND now() BETWEEN l.inicio_em AND l.fim_em) AS "licencasAtivas"
       FROM usuario u
      WHERE u.papel = 'aluno' AND u.portal_id = 0
        AND ($1 = '' OR u.nome ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%')
      ORDER BY u.criado_em DESC
      LIMIT $2`,
    [termo, limite],
  );
}

export interface LinhaLicencaAdmin {
  id: number; usuarioNome: string; usuarioEmail: string; escopo: string;
  materiaNome: string | null; origem: string; status: string;
  inicioEm: Date; fimEm: Date; vigente: boolean;
}

export function listarLicencas(limite = 100) {
  return query<LinhaLicencaAdmin>(
    `SELECT l.id, u.nome AS "usuarioNome", u.email AS "usuarioEmail",
            l.escopo, m.nome AS "materiaNome", l.origem, l.status,
            l.inicio_em AS "inicioEm", l.fim_em AS "fimEm",
            (l.status = 'ATIVA' AND now() BETWEEN l.inicio_em AND l.fim_em) AS vigente
       FROM licenca l
       JOIN usuario u ON u.id = l.usuario_id
       LEFT JOIN materia m ON m.id = l.materia_id
      WHERE l.portal_id = 0
      ORDER BY l.criada_em DESC LIMIT $1`,
    [limite],
  );
}

export function listarAuditoria(limite = 40) {
  return query<{
    id: number; ator: string; acao: string; entidade: string;
    entidadeId: number | null; detalhe: unknown; criadoEm: Date;
  }>(
    `SELECT id, ator, acao, entidade, entidade_id AS "entidadeId", detalhe,
            criado_em AS "criadoEm"
       FROM log_auditoria ORDER BY criado_em DESC LIMIT $1`,
    [limite],
  );
}

export function listarMateriasSimples(portalId = 0) {
  return query<{ id: number; nome: string }>(
    'SELECT id, nome FROM materia WHERE portal_id = $1 ORDER BY ordem, nome',
    [portalId],
  );
}
