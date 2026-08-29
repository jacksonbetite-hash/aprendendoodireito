import { unstable_cache } from 'next/cache';

/**
 * Cache de leitura do catálogo.
 *
 * O §10 pede SSG/ISR para o site público ranquear no Google. Prerender em
 * tempo de build, porém, exigiria banco disponível no `docker build` — o
 * que quebra a imagem e o CI. A saída é SSR com as consultas em cache:
 * o Google recebe HTML completo do mesmo jeito, e o banco só é consultado
 * quando o cache expira.
 */
export function emCache<Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  chave: string[],
  segundos = 300,
) {
  return unstable_cache(fn, chave, { revalidate: segundos, tags: ['catalogo'] });
}
