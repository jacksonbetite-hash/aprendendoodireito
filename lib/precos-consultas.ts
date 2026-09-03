import { query } from './db.ts';
import { emCache } from './cache.ts';
import type { LinhaPreco, Produto, Periodo, Tabela } from './precos.ts';

/** Consultas de preço. Só servidor — importa `pg`. */

async function lerTabela(portalId: number): Promise<Tabela> {
  const linhas = await query<LinhaPreco>(
    `SELECT produto, periodo, centavos FROM preco
      WHERE portal_id = $1 AND vigente_ate IS NULL AND vigente_de <= current_date`,
    [portalId],
  );
  const t = { MATERIA: {}, CATALOGO: {} } as Tabela;
  for (const l of linhas) t[l.produto][l.periodo] = l.centavos;
  return t;
}

/** Tabela vigente hoje, em centavos. */
export const tabelaVigente = emCache(lerTabela, ['precos'], 300);

/**
 * Histórico completo, para o admin auditar o que mudou e quando.
 *
 * Escopado por portal (§5.10): cada portal de professor tem a própria
 * tabela de valores, e misturar as duas daria um histórico que não
 * corresponde a nenhuma operação real.
 */
export function historicoDePrecos(portalId = 0) {
  return query<LinhaPreco>(
    `SELECT id, produto, periodo, centavos,
            vigente_de AS "vigenteDe", vigente_ate AS "vigenteAte", criado_por AS "criadoPor"
       FROM preco WHERE portal_id = $1
      ORDER BY produto, periodo, vigente_de DESC`,
    [portalId],
  );
}
