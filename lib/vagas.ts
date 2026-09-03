import { query, queryOne } from './db.ts';
import {
  POR_PAGINA, ROTULO_TIPO, TIPOS as ROTULOS_TIPOS,
  type TipoVaga, type RegimeVaga, type ModalidadeVaga,
} from './vagas-rotulos.ts';

/**
 * Mural de vagas e estágios (§5.7.1).
 *
 * A plataforma não intermedeia a contratação: a candidatura acontece
 * fora daqui, no link ou e-mail do anunciante. O que este módulo faz é
 * mostrar apenas vaga que passou pela moderação E ainda está dentro da
 * vigência — vaga expirada some da lista sozinha, sem rotina de limpeza,
 * porque o filtro é por data e não por um campo que alguém precise vir
 * marcar depois.
 */

/**
 * Tipos, rótulos e constantes vivem em `vagas-rotulos.ts` — parte pura,
 * importável por componente de cliente. Reexportados aqui para que quem
 * já lia deste módulo continue lendo.
 */
export {
  POR_PAGINA, DIAS_MAXIMOS, ROTULO_TIPO, ROTULO_REGIME, ROTULO_MODALIDADE,
  ICONE_MODALIDADE, ROTULO_STATUS,
} from './vagas-rotulos.ts';
export type {
  TipoVaga, RegimeVaga, ModalidadeVaga, StatusVaga,
} from './vagas-rotulos.ts';

export interface Vaga {
  id: number;
  titulo: string;
  empresa: string;
  tipo: TipoVaga;
  regime: RegimeVaga;
  modalidade: ModalidadeVaga;
  cidade: string | null;
  uf: string | null;
  areaAtuacao: string;
  descricao: string;
  requisitos: string;
  faixaSalarial: string | null;
  comoCandidatar: string;
  publicadaEm: Date;
  expiraEm: Date;
}

export interface Filtro {
  q?: string;
  tipos?: string[];
  local?: string;          // "São Paulo/SP" ou "remoto"
  area?: string;
  ordem?: 'recentes' | 'antigas';
  pagina?: number;
}


const TIPOS = ROTULOS_TIPOS;

const CAMPOS = `
  v.id, v.titulo, v.empresa, v.tipo, v.regime, v.modalidade, v.cidade, v.uf,
  v.area_atuacao AS "areaAtuacao", v.descricao, v.requisitos,
  v.faixa_salarial AS "faixaSalarial", v.como_candidatar AS "comoCandidatar",
  v.publicada_em AS "publicadaEm", v.expira_em AS "expiraEm"
`;

/** Vaga viva: aprovada pela moderação e dentro dos 3 meses de vigência. */
const NO_AR = "v.status = 'publicada' AND v.expira_em > now()";

/**
 * O WHERE é montado uma vez e reaproveitado pela contagem, para que o
 * "1–5 de 42" nunca conte um conjunto diferente do que a página lista.
 */
function condicoes(f: Filtro) {
  const tipos = (f.tipos ?? []).filter((t): t is TipoVaga => TIPOS.includes(t as TipoVaga));
  const termo = (f.q ?? '').trim();
  const local = (f.local ?? '').trim();
  const [cidade, uf] = local === 'remoto' ? ['', ''] : local.split('/');

  return {
    sql: `${NO_AR}
      AND ($1::text[] = '{}' OR v.tipo::text = ANY($1::text[]))
      AND ($2::text IS NULL OR
           normaliza_busca(v.titulo || ' ' || v.empresa || ' ' || v.area_atuacao
                           || ' ' || v.descricao) LIKE '%' || normaliza_busca($2) || '%')
      AND ($3::text IS NULL OR v.area_atuacao = $3)
      AND ($4::text IS NULL OR v.modalidade = 'remoto')
      AND ($5::text IS NULL OR (v.cidade = $5 AND v.uf = $6))`,
    params: [
      tipos,
      termo || null,
      f.area?.trim() || null,
      local === 'remoto' ? 'sim' : null,
      local && local !== 'remoto' ? cidade : null,
      local && local !== 'remoto' ? uf : null,
    ],
  };
}

export async function listarVagas(f: Filtro) {
  const { sql, params } = condicoes(f);
  const pagina = Math.max(1, Math.trunc(f.pagina ?? 1));
  const ordem = f.ordem === 'antigas' ? 'ASC' : 'DESC';

  const [itens, contagem] = await Promise.all([
    query<Vaga>(
      `SELECT ${CAMPOS} FROM vaga v
        WHERE ${sql}
        ORDER BY v.publicada_em ${ordem}, v.id ${ordem}
        LIMIT $7 OFFSET $8`,
      [...params, POR_PAGINA, (pagina - 1) * POR_PAGINA],
    ),
    queryOne<{ total: number }>(
      `SELECT count(*)::int AS total FROM vaga v WHERE ${sql}`,
      params,
    ),
  ]);

  const total = contagem?.total ?? 0;
  return { itens, total, pagina, paginas: Math.max(1, Math.ceil(total / POR_PAGINA)) };
}

export function buscarVaga(id: number) {
  return queryOne<Vaga>(`SELECT ${CAMPOS} FROM vaga v WHERE ${NO_AR} AND v.id = $1`, [id]);
}

/** As opções do seletor de localidade, tiradas das vagas que estão no ar. */
export function localidades() {
  return query<{ valor: string; rotulo: string }>(
    `SELECT DISTINCT v.cidade || '/' || v.uf AS valor, v.cidade || ', ' || v.uf AS rotulo
       FROM vaga v WHERE ${NO_AR} AND v.cidade IS NOT NULL
      ORDER BY 2`,
  );
}

export function areasDeAtuacao() {
  return query<{ area: string }>(
    `SELECT DISTINCT v.area_atuacao AS area FROM vaga v WHERE ${NO_AR} ORDER BY 1`,
  );
}

export const tiposDeVaga = () =>
  TIPOS.map((chave) => ({ chave, nome: ROTULO_TIPO[chave] }));

/** "São Paulo, SP" — ou a modalidade, quando a vaga não tem endereço. */
export const local = (v: Vaga) =>
  v.cidade && v.uf ? `${v.cidade}, ${v.uf}` : 'Remoto';

/**
 * "Hoje", "Ontem", "Há 3 dias" — e a data cheia quando passa de uma
 * semana, que é quando "há 12 dias" deixa de ajudar a decidir.
 */
export function desdeQuando(data: Date) {
  const dias = Math.floor((Date.now() - new Date(data).getTime()) / 86_400_000);
  if (dias <= 0) return 'Hoje';
  if (dias === 1) return 'Ontem';
  if (dias < 7) return `Há ${dias} dias`;
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

/** Monograma do anunciante: o mural não hospeda logotipo de empresa. */
export function iniciais(empresa: string) {
  const palavras = empresa
    .replace(/[&.,]/g, ' ')
    .split(/\s+/)
    .filter((p) => p.length > 2 && p[0] === p[0].toUpperCase());
  return (palavras.slice(0, 2).map((p) => p[0]).join('') || empresa[0]).toUpperCase();
}

/** Os requisitos entram no banco como uma linha por item. */
export const listaDeRequisitos = (v: Vaga) =>
  v.requisitos.split('\n').map((r) => r.trim()).filter(Boolean);

/** Link externo ou e-mail: o §5.7.1 admite os dois como forma de contato. */
export const linkDeCandidatura = (v: Vaga) =>
  v.comoCandidatar.startsWith('http') ? v.comoCandidatar : `mailto:${v.comoCandidatar}`;

export const diasParaExpirar = (v: Vaga) =>
  Math.max(0, Math.ceil((new Date(v.expiraEm).getTime() - Date.now()) / 86_400_000));
