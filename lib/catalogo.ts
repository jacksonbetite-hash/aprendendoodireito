import { query, queryOne } from './db.ts';
import { emCache } from './cache.ts';

export interface Area { id: number; slug: string; nome: string }
export interface Materia {
  id: number; slug: string; nome: string; ementa: string;
  onda: number | null; status: string; professor: string | null;
  areaSlug: string; areaNome: string;
  aulasPublicadas: number; questoes: number; duracaoTotal: number;
}
export interface AulaResumo {
  id: number; slug: string; titulo: string; duracaoSegundos: number;
  amostraGratuita: boolean; noTrial: boolean; status: string;
  assuntoNome: string; assuntoSlug: string; questoes: number;
}

const MATERIA_CAMPOS = `
  m.id, m.slug, m.nome, m.ementa, m.onda, m.status, m.professor,
  a.slug AS "areaSlug", a.nome AS "areaNome",
  (SELECT count(*)::int FROM aula au JOIN assunto s ON s.id = au.assunto_id
    WHERE s.materia_id = m.id AND au.status = 'publicado') AS "aulasPublicadas",
  (SELECT count(*)::int FROM questao q
     JOIN exercicio e ON e.id = q.exercicio_id
     JOIN aula au ON au.id = e.aula_id
     JOIN assunto s ON s.id = au.assunto_id
    WHERE s.materia_id = m.id AND au.status = 'publicado') AS "questoes",
  (SELECT coalesce(sum(au.duracao_segundos), 0)::int FROM aula au
     JOIN assunto s ON s.id = au.assunto_id
    WHERE s.materia_id = m.id AND au.status = 'publicado') AS "duracaoTotal"
`;

export function listarAreas() {
  return query<Area>('SELECT id, slug, nome FROM area ORDER BY ordem');
}

export function listarMaterias() {
  return query<Materia>(
    `SELECT ${MATERIA_CAMPOS} FROM materia m JOIN area a ON a.id = m.area_id
     ORDER BY a.ordem, m.ordem`,
  );
}

export function buscarMateria(slug: string) {
  return queryOne<Materia>(
    `SELECT ${MATERIA_CAMPOS} FROM materia m JOIN area a ON a.id = m.area_id
     WHERE m.slug = $1`,
    [slug],
  );
}

export function listarAulasDaMateria(materiaId: number) {
  return query<AulaExpandida>(
    `SELECT au.id, au.slug, au.titulo, au.duracao_segundos AS "duracaoSegundos",
            au.amostra_gratuita AS "amostraGratuita", au.no_trial AS "noTrial",
            au.status, s.nome AS "assuntoNome", s.slug AS "assuntoSlug",
            (SELECT count(*)::int FROM questao q JOIN exercicio e ON e.id = q.exercicio_id
              WHERE e.aula_id = au.id) AS questoes
       FROM aula au JOIN assunto s ON s.id = au.assunto_id
      WHERE s.materia_id = $1
      ORDER BY s.ordem, au.ordem`,
    [materiaId],
  );
}
type AulaExpandida = AulaResumo;

export interface AulaCompleta extends AulaResumo {
  resumo: string;
  materiaId: number; materiaSlug: string; materiaNome: string; professor: string | null;
  atualizadaEm: Date;
}

export function buscarAula(slug: string) {
  return queryOne<AulaCompleta>(
    `SELECT au.id, au.slug, au.titulo, au.duracao_segundos AS "duracaoSegundos",
            au.resumo, au.amostra_gratuita AS "amostraGratuita", au.no_trial AS "noTrial",
            au.status, au.atualizada_em AS "atualizadaEm",
            s.nome AS "assuntoNome", s.slug AS "assuntoSlug",
            m.id AS "materiaId", m.slug AS "materiaSlug", m.nome AS "materiaNome", m.professor,
            (SELECT count(*)::int FROM questao q JOIN exercicio e ON e.id = q.exercicio_id
              WHERE e.aula_id = au.id) AS questoes
       FROM aula au
       JOIN assunto s ON s.id = au.assunto_id
       JOIN materia m ON m.id = s.materia_id
      WHERE au.slug = $1`,
    [slug],
  );
}

export function materiaisDaAula(aulaId: number) {
  return query<{ id: number; titulo: string; arquivo: string; bytes: number }>(
    'SELECT id, titulo, arquivo, bytes FROM material_apoio WHERE aula_id = $1 ORDER BY id',
    [aulaId],
  );
}

/** Aula anterior e próxima dentro da mesma matéria, para navegação. */
export async function vizinhas(aula: AulaCompleta) {
  const todas = await listarAulasDaMateria(aula.materiaId);
  const publicadas = todas.filter((a) => a.status === 'publicado');
  const i = publicadas.findIndex((a) => a.id === aula.id);
  return { anterior: publicadas[i - 1] ?? null, proxima: publicadas[i + 1] ?? null };
}

export function formatarDuracao(segundos: number): string {
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${min}min${seg ? String(seg).padStart(2, '0') : ''}`;
}

// ---- Versões em cache, usadas pelas páginas públicas ----
export const listarAreasEmCache = emCache(listarAreas, ['areas']);
export const listarMateriasEmCache = emCache(listarMaterias, ['materias']);
