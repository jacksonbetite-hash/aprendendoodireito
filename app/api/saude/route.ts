import { NextResponse } from 'next/server';
import { queryOne } from '../../../lib/db.ts';

export const dynamic = 'force-dynamic';

/**
 * Verificação de saúde usada pelo healthcheck do container.
 *
 * Confere o banco de propósito: uma aplicação que responde mas não
 * alcança o Postgres está de pé sem servir para nada, e o orquestrador
 * precisa saber disso para reiniciar.
 */
export async function GET() {
  try {
    const r = await queryOne<{ materias: number }>(
      // Portal 0 = a plataforma (§5.10). Somar os portais dos professores
      // faria o número da saúde crescer com a base de clientes, e ele
      // serve para dizer se o NOSSO catálogo está de pé.
      `SELECT count(*)::int AS materias FROM materia
        WHERE status = 'publicado' AND portal_id = 0`,
    );
    return NextResponse.json({
      ok: true, banco: 'conectado', materiasPublicadas: r?.materias ?? 0,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, banco: 'inacessível', erro: (err as Error).message },
      { status: 503 },
    );
  }
}
