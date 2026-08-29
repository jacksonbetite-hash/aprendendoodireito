import { Pool } from 'pg';

/**
 * Pool único por processo. Em dev o Next recarrega o módulo a cada
 * alteração, então guardamos no globalThis para não vazar conexões.
 */
const globalForDb = globalThis as unknown as { _pool?: Pool };

export const pool =
  globalForDb._pool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      'postgres://aprendendo:aprendendo@localhost:5432/aprendendoodireito',
    max: 10,
  });

if (process.env.NODE_ENV !== 'production') globalForDb._pool = pool;

export async function query<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool.query(sql, params);
  return res.rows as T[];
}

export async function queryOne<T = any>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
