import { queryOne } from './db.ts';
import type { Personalizacao, StatusPortal } from './portal.ts';

/**
 * O portal de um professor — o que o painel dele (§5.10, "painel do
 * professor") precisa saber numa consulta só. Um professor tem um portal
 * vivo por vez; o mais recente não encerrado é o dele.
 */
export interface PortalDoProfessor {
  id: number; mascara: string; nomeExibicao: string; status: StatusPortal;
  personalizacao: Personalizacao;
  subcontaSituacao: string; escrowDias: number | null;
  publicadoEm: Date | null; suspensoEm: Date | null;
  planoNome: string | null;
  contrato: {
    licencaMensalCentavos: number; percentualBase: string; acrescimoIndicacaoPp: string;
    comissaoVitrinePp: string; aceitoEm: Date | null;
  } | null;
  faturasPendentes: number;
  materias: number; aulasPublicadas: number; alunos: number;
}

export function portalDoProfessor(usuarioId: number) {
  return queryOne<PortalDoProfessor>(
    `SELECT p.id::int AS id, p.mascara, p.nome_exibicao AS "nomeExibicao", p.status,
            p.personalizacao, p.subconta_situacao AS "subcontaSituacao", p.escrow_dias AS "escrowDias",
            p.publicado_em AS "publicadoEm", p.suspenso_em AS "suspensoEm",
            pl.nome AS "planoNome",
            CASE WHEN c.id IS NULL THEN NULL ELSE json_build_object(
              'licencaMensalCentavos', c.licenca_mensal_centavos,
              'percentualBase', c.percentual_base,
              'acrescimoIndicacaoPp', c.acrescimo_indicacao_pp,
              'comissaoVitrinePp', c.comissao_vitrine_pp,
              'aceitoEm', c.aceito_em) END AS contrato,
            (SELECT count(*)::int FROM portal_fatura f
              WHERE f.portal_id = p.id AND f.status IN ('FECHADA', 'EM_ATRASO')) AS "faturasPendentes",
            (SELECT count(*)::int FROM materia m WHERE m.portal_id = p.id) AS materias,
            (SELECT count(*)::int FROM aula a WHERE a.portal_id = p.id AND a.status = 'publicado') AS "aulasPublicadas",
            (SELECT count(*)::int FROM usuario u WHERE u.portal_id = p.id AND u.papel = 'aluno') AS alunos
       FROM portal p
       LEFT JOIN portal_plano pl ON pl.id = p.plano_id
       LEFT JOIN portal_contrato c ON c.portal_id = p.id AND c.vigente_ate IS NULL
      WHERE p.professor_id = $1 AND p.status <> 'ENCERRADO'
      ORDER BY p.criado_em DESC LIMIT 1`,
    [usuarioId],
  );
}
