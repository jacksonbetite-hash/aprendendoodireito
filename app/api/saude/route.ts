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
      `SELECT count(*)::int AS materias FROM materia WHERE status = 'publicado'`,
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
