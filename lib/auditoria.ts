import { query } from './db.ts';

/**
 * Transação com auditoria — §5.9: "quem alterou o quê e quando".
 *
 * Estava embutido em `lib/admin.ts`, servindo só a preço e licença.
 * Quando blog, vagas, catálogo e portais passaram a ser editáveis pelo
 * admin, a escolha era duplicar o par em cada módulo ou tirá-lo daqui.
 * A regra que importa é a mesma para todos: o registro de auditoria vai
 * na MESMA transação da alteração — ou as duas acontecem, ou nenhuma.
 * Auditoria que pode falhar sozinha não é auditoria.
 */

export type Exec = typeof query;

export async function emTransacao<T>(fn: (exec: Exec) => Promise<T>): Promise<T> {
  const { pool } = await import('./db.ts');
  const cliente = await pool.connect();
  const exec = (async (sql: string, params: unknown[] = []) =>
    (await cliente.query(sql, params)).rows) as Exec;
  try {
    await cliente.query('BEGIN');
    const r = await fn(exec);
    await cliente.query('COMMIT');
    return r;
  } catch (err) {
    await cliente.query('ROLLBACK');
    throw err;
  } finally {
    cliente.release();
  }
}

export function auditar(
  exec: Exec, ator: string, acao: string,
  entidade: string, entidadeId: number | null, detalhe: unknown,
) {
  return exec(
    `INSERT INTO log_auditoria (ator, acao, entidade, entidade_id, detalhe)
     VALUES ($1, $2, $3, $4, $5)`,
    [ator, acao, entidade, entidadeId, JSON.stringify(detalhe)],
  );
}
