import { query } from './db.ts';
import { emCache } from './cache.ts';
import type { LinhaPreco, Produto, Periodo, Tabela } from './precos.ts';

/** Consultas de preço. Só servidor — importa `pg`. */

async function lerTabela(): Promise<Tabela> {
  const linhas = await query<LinhaPreco>(
    `SELECT produto, periodo, centavos FROM preco
      WHERE vigente_ate IS NULL AND vigente_de <= current_date`,
  );
  const t = { MATERIA: {}, CATALOGO: {} } as Tabela;
  for (const l of linhas) t[l.produto][l.periodo] = l.centavos;
  return t;
}

/** Tabela vigente hoje, em centavos. */
export const tabelaVigente = emCache(lerTabela, ['precos'], 300);

/** Histórico completo, para o admin auditar o que mudou e quando. */
export function historicoDePrecos() {
  return query<LinhaPreco>(
    `SELECT id, produto, periodo, centavos,
            vigente_de AS "vigenteDe", vigente_ate AS "vigenteAte", criado_por AS "criadoPor"
       FROM preco ORDER BY produto, periodo, vigente_de DESC`,
  );
}
