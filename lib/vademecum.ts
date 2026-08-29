import { query, queryOne } from './db.ts';

export interface Norma {
  id: number; slug: string; sigla: string; nome: string;
  conferidoEm: Date; fonte: string; dispositivos: number;
}
export interface Dispositivo {
  id: number; rotulo: string; texto: string; agrupador: string | null;
  normaSigla: string; normaSlug: string;
}

export function listarNormas() {
  return query<Norma>(
    `SELECT n.id, n.slug, n.sigla, n.nome, n.conferido_em AS "conferidoEm", n.fonte,
            (SELECT count(*)::int FROM dispositivo d WHERE d.norma_id = n.id) AS dispositivos
       FROM norma n ORDER BY n.ordem`,
  );
}

export function buscarNorma(slug: string) {
  return queryOne<Norma>(
    `SELECT n.id, n.slug, n.sigla, n.nome, n.conferido_em AS "conferidoEm", n.fonte,
            (SELECT count(*)::int FROM dispositivo d WHERE d.norma_id = n.id) AS dispositivos
       FROM norma n WHERE n.slug = $1`,
    [slug],
  );
}

export function dispositivosDaNorma(normaId: number) {
  return query<Dispositivo>(
    `SELECT d.id, d.rotulo, d.texto, d.agrupador, n.sigla AS "normaSigla", n.slug AS "normaSlug"
       FROM dispositivo d JOIN norma n ON n.id = d.norma_id
      WHERE d.norma_id = $1 ORDER BY d.ordem`,
    [normaId],
  );
}

/**
 * Busca do vade-mécum (§5.4): por número de artigo ou por texto integral.
 * Índice ponderado — rótulo (A) pesa mais que apelido (B), que pesa mais
 * que o corpo da lei (C), então "art. 5º" traz o artigo 5º no topo.
 */
export function buscarDispositivos(termo: string, limite = 30) {
  const limpo = termo.trim();
  if (!limpo) return Promise.resolve([] as (Dispositivo & { relevancia: number })[]);
  return query<Dispositivo & { relevancia: number }>(
    `SELECT d.id, d.rotulo, d.texto, d.agrupador,
            n.sigla AS "normaSigla", n.slug AS "normaSlug",
            ts_rank(d.busca, plainto_tsquery('portuguese', $1)) AS relevancia
       FROM dispositivo d JOIN norma n ON n.id = d.norma_id
      WHERE d.busca @@ plainto_tsquery('portuguese', $1)
         OR normaliza_busca(d.rotulo) LIKE '%' || normaliza_busca($2) || '%'
      ORDER BY relevancia DESC, n.ordem, d.ordem
      LIMIT $3`,
    [limpo, limpo, limite],
  );
}

/** Deep link bidirecional: as aulas que explicam um dispositivo (§5.4). */
export function aulasQueExplicam(dispositivoId: number) {
  return query<{ slug: string; titulo: string; materiaNome: string }>(
    `SELECT au.slug, au.titulo, m.nome AS "materiaNome"
       FROM aula_dispositivo ad
       JOIN aula au ON au.id = ad.aula_id
       JOIN assunto s ON s.id = au.assunto_id
       JOIN materia m ON m.id = s.materia_id
      WHERE ad.dispositivo_id = $1 AND au.status = 'publicado'`,
    [dispositivoId],
  );
}

/** Dispositivos vinculados a uma aula — alimenta o painel lateral. */
export function dispositivosDaAula(aulaId: number) {
  return query<Dispositivo>(
    `SELECT d.id, d.rotulo, d.texto, d.agrupador,
            n.sigla AS "normaSigla", n.slug AS "normaSlug"
       FROM aula_dispositivo ad
       JOIN dispositivo d ON d.id = ad.dispositivo_id
       JOIN norma n ON n.id = d.norma_id
      WHERE ad.aula_id = $1 ORDER BY n.ordem, d.ordem`,
    [aulaId],
  );
}
