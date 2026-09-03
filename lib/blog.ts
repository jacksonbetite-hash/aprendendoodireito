import { query, queryOne } from './db.ts';

/**
 * Blog — o topo de funil do §5.5.
 *
 * A leitura pública nunca vê rascunho: toda consulta daqui filtra por
 * `status = 'publicado'`. O corpo do post só é carregado na página do
 * artigo; a listagem se contenta com o resumo, que é o mesmo texto que
 * vai para a meta description.
 */

export interface Post {
  id: number;
  slug: string;
  titulo: string;
  resumo: string;
  categoriaSlug: string;
  categoriaNome: string;
  autorNome: string;
  autorCargo: string | null;
  autorFoto: string | null;
  minutosLeitura: number;
  destaque: boolean;
  publicadoEm: Date;
  /** Arquivo em public/capas, sem extensão. Nulo cai na capa desenhada. */
  capa: string | null;
}

export interface PostCompleto extends Post {
  corpo: string;
}

export interface CategoriaBlog {
  slug: string;
  nome: string;
  posts: number;
}

const CAMPOS = `
  p.id, p.slug, p.titulo, p.resumo,
  c.slug AS "categoriaSlug", c.nome AS "categoriaNome",
  p.autor_nome AS "autorNome", p.autor_cargo AS "autorCargo",
  p.autor_foto AS "autorFoto", p.minutos_leitura AS "minutosLeitura",
  p.destaque, p.publicado_em AS "publicadoEm", p.capa
`;

const DE = 'FROM post p JOIN categoria_blog c ON c.id = p.categoria_id';
const PUBLICADO = "p.status = 'publicado'";

/** As pílulas de filtro do topo — só categoria que tem post publicado. */
export function listarCategorias() {
  return query<CategoriaBlog>(
    `SELECT c.slug, c.nome, count(p.id)::int AS posts
       FROM categoria_blog c
       JOIN post p ON p.categoria_id = c.id AND ${PUBLICADO}
      GROUP BY c.slug, c.nome, c.ordem
      ORDER BY c.ordem`,
  );
}

/**
 * A vitrine, do mais recente para o mais antigo.
 *
 * `excluir` existe porque a capa mostra o mesmo acervo em três lugares
 * (destaque, dica de carreira e recentes) e nenhum post deve aparecer
 * duas vezes na mesma tela.
 */
export function listarPosts(
  { categoria, excluir = [], limite = 12 }:
  { categoria?: string; excluir?: number[]; limite?: number } = {},
) {
  return query<Post>(
    `SELECT ${CAMPOS} ${DE}
      WHERE ${PUBLICADO}
        AND ($1::text IS NULL OR c.slug = $1)
        AND NOT (p.id = ANY($2::bigint[]))
      ORDER BY p.destaque DESC, p.publicado_em DESC
      LIMIT $3`,
    [categoria ?? null, excluir, limite],
  );
}

/** O post mais recente de uma categoria — a "dica de carreira" da capa. */
export function ultimoDaCategoria(categoria: string, excluir: number[] = []) {
  return queryOne<Post>(
    `SELECT ${CAMPOS} ${DE}
      WHERE ${PUBLICADO} AND c.slug = $1 AND NOT (p.id = ANY($2::bigint[]))
      ORDER BY p.publicado_em DESC
      LIMIT 1`,
    [categoria, excluir],
  );
}

export function buscarPost(slug: string) {
  return queryOne<PostCompleto>(
    `SELECT ${CAMPOS}, p.corpo ${DE}
      WHERE ${PUBLICADO} AND p.slug = $1`,
    [slug],
  );
}

/** Continuar lendo: mesma categoria primeiro, completado pelos recentes. */
export function postsRelacionados(post: Post, limite = 3) {
  return query<Post>(
    `SELECT ${CAMPOS} ${DE}
      WHERE ${PUBLICADO} AND p.id <> $1
      ORDER BY (c.slug = $2) DESC, p.publicado_em DESC
      LIMIT $3`,
    [post.id, post.categoriaSlug, limite],
  );
}

export async function assinarNewsletter(email: string, origem = 'blog') {
  // ON CONFLICT em silêncio: dizer "este e-mail já está inscrito" entrega
  // quem assina a quem estiver sondando a lista.
  await query(
    `INSERT INTO newsletter_assinante (email, origem) VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING`,
    [email.trim().toLowerCase(), origem],
  );
}

/** "12 de outubro de 2025" — data por extenso, como no impresso. */
export const dataLonga = (d: Date) =>
  new Date(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

/** Os parágrafos do corpo, separados por linha em branco. */
export const paragrafos = (corpo: string) =>
  corpo.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
