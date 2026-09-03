import { query } from './db.ts';
import { MATERIA_CAMPOS, type Materia } from './catalogo-campos.ts';

/** Curso de parceiro como aparece na vitrine da plataforma. */
export interface MateriaCompartilhada extends Materia {
  portalMascara: string; portalNome: string;
}

/**
 * Os cursos que professores parceiros puseram na NOSSA vitrine (§5.10.2,
 * etapa 5): publicados, marcados para a vitrine, de portal ATIVO. Só a
 * plataforma chama isto — o portal de um professor não expõe curso de
 * outro.
 */
/**
 * Só vende na vitrine o portal ATIVO com contrato vigente aceito — é do
 * contrato que sai a comissão do professor (§5.6.1). Listar curso que não
 * se pode comprar seria vitrine com produto sem preço.
 */
const PORTAL_VENDE = `p.status = 'ATIVO' AND EXISTS (
  SELECT 1 FROM portal_contrato c
   WHERE c.portal_id = p.id AND c.vigente_ate IS NULL AND c.aceito_em IS NOT NULL)`;

export function listarMateriasCompartilhadas() {
  return query<MateriaCompartilhada>(
    `SELECT ${MATERIA_CAMPOS}, p.mascara AS "portalMascara", p.nome_exibicao AS "portalNome"
       FROM materia m
       JOIN area a ON a.id = m.area_id
       JOIN portal p ON p.id = m.portal_id
      WHERE m.portal_id <> 0 AND m.na_vitrine_plataforma
        AND m.status = 'publicado' AND ${PORTAL_VENDE}
      ORDER BY p.nome_exibicao, m.ordem, m.nome`,
  );
}

/** O portal está em condição de vender na nossa vitrine agora? */
export async function portalVendeNaVitrine(portalId: number) {
  const r = await query<{ ok: boolean }>(
    `SELECT true AS ok FROM portal p WHERE p.id = $1 AND ${PORTAL_VENDE}`, [portalId]);
  return r.length > 0;
}
